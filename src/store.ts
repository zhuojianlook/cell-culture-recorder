import Database from "@tauri-apps/plugin-sql";
import type {
  AuditEntry,
  BackupPackage,
  BackupSnapshot,
  CellLine,
  CreateEventInput,
  CreateVesselInput,
  CultureBatch,
  CultureBatchView,
  CultureEvent,
  CultureStore,
  ImportVesselInput,
} from "./types";
import { sha256 } from "./utils";

const DB_URL = "sqlite:cell-culture-recorder.db";
const MEMORY_KEY = "cell-culture-recorder.preview-store.v2";

type SqlDatabase = Awaited<ReturnType<typeof Database.load>>;

interface MemoryState {
  nextCellLineId: number;
  nextBatchId: number;
  nextEventId: number;
  nextAuditId: number;
  nextBackupId: number;
  cellLines: CellLine[];
  cultureBatches: CultureBatch[];
  cultureEvents: CultureEvent[];
  auditLog: AuditEntry[];
  backups: BackupSnapshot[];
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function timestamp(): string {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function statusFromEvent(input: CreateEventInput): CultureBatch["status"] | null {
  if (input.next_status) {
    return input.next_status;
  }

  if (input.event_type === "freeze") {
    return "frozen";
  }

  if (input.event_type === "contamination") {
    return "contaminated";
  }

  if (input.event_type === "discard") {
    return "discarded";
  }

  if (input.event_type === "thaw") {
    return "active";
  }

  return null;
}

async function buildBackupPackage(
  cellLines: CellLine[],
  cultureBatches: CultureBatch[],
  cultureEvents: CultureEvent[],
  auditLog: AuditEntry[],
): Promise<BackupPackage> {
  const data = {
    cellLines: clone(cellLines),
    cultureBatches: clone(cultureBatches),
    cultureEvents: clone(cultureEvents),
    auditLog: clone(auditLog),
  };
  const checksum = await sha256(JSON.stringify(data));

  return {
    app: "cell-culture-recorder",
    version: 3,
    exportedAt: timestamp(),
    checksum,
    data,
  };
}

async function assertValidBackup(pkg: BackupPackage): Promise<void> {
  if (pkg.app !== "cell-culture-recorder" || ![1, 2, 3].includes(Number(pkg.version))) {
    throw new Error("This file is not a compatible Cell Culture Recorder backup.");
  }

  const checksum = await sha256(JSON.stringify(pkg.data));
  if (checksum !== pkg.checksum) {
    throw new Error("Backup checksum mismatch. The backup may be incomplete or modified.");
  }
}

function normalizeBatch(batch: CultureBatch): CultureBatch {
  return {
    ...batch,
    donor_identifier: batch.donor_identifier ?? null,
    eye: batch.eye ?? "unknown",
    parent_batch_id: batch.parent_batch_id ?? null,
    split_date: batch.split_date ?? null,
    media_change_1_date: batch.media_change_1_date ?? null,
    media_change_2_date: batch.media_change_2_date ?? null,
    source_record_type: batch.source_record_type ?? "culture_vessel",
    raw_source_identifier: batch.raw_source_identifier ?? null,
    pretreatment_date: batch.pretreatment_date ?? null,
    dissociation_date: batch.dissociation_date ?? null,
    ground_truth_date_field: batch.ground_truth_date_field ?? "seed_date",
    ground_truth_date: batch.ground_truth_date ?? batch.started_at ?? null,
    conflict_resolution: batch.conflict_resolution ?? null,
    raw_intake_json: batch.raw_intake_json ?? "{}",
    growth_notes: batch.growth_notes ?? batch.notes ?? null,
    source_documentation: batch.source_documentation ?? null,
  };
}

interface ParentCandidate {
  id: number;
  label: string;
  donor_identifier: string | null;
  eye: string | null;
}

// Resolve an imported row's `parent_label` to a parent batch id by exact label match
// (case-insensitive) among the candidate batches. A single match wins outright; when a
// label is shared, it is disambiguated by eye + donor (a blank donor on either side is
// treated as compatible). Anything ambiguous or unmatched returns null (left unlinked).
function matchParentId(
  parentLabel: string,
  child: { donor_identifier: string | null; eye: string | null },
  childId: number,
  candidates: ParentCandidate[],
): number | null {
  const target = parentLabel.trim().toLowerCase();
  if (!target) {
    return null;
  }

  const sameLabel = candidates.filter((c) => c.id !== childId && c.label.trim().toLowerCase() === target);
  if (sameLabel.length === 0) {
    return null;
  }
  if (sameLabel.length === 1) {
    return sameLabel[0].id;
  }

  const childDonor = (child.donor_identifier ?? "").toLowerCase();
  const childEye = child.eye ?? "unknown";
  const narrowed = sameLabel.filter((c) => {
    const donor = (c.donor_identifier ?? "").toLowerCase();
    const donorOk = childDonor === "" || donor === "" || donor === childDonor;
    return donorOk && (c.eye ?? "unknown") === childEye;
  });
  return narrowed.length === 1 ? narrowed[0].id : null;
}

export async function createCultureStore(): Promise<CultureStore> {
  if (!isTauriRuntime()) {
    const store = new MemoryCultureStore();
    await store.initialize();
    return store;
  }

  const store = new SqlCultureStore();
  await store.initialize();
  return store;
}

class SqlCultureStore implements CultureStore {
  readonly mode = "tauri-sql" as const;

  private db: SqlDatabase | null = null;

  async initialize(): Promise<void> {
    this.db = await Database.load(DB_URL);
    await this.execute("PRAGMA foreign_keys = ON");
    await this.execute("PRAGMA journal_mode = WAL");
    await this.execute("PRAGMA synchronous = FULL");
    await this.execute("PRAGMA busy_timeout = 5000");
  }

  async listCellLines(): Promise<CellLine[]> {
    return this.select<CellLine[]>(
      "SELECT * FROM cell_lines WHERE deleted_at IS NULL ORDER BY name COLLATE NOCASE",
    );
  }

  async listBatches(): Promise<CultureBatchView[]> {
    return this.select<CultureBatchView[]>(
      `SELECT culture_batches.*,
              cell_lines.name AS cell_line_name,
              cell_lines.species AS species,
              parent.label AS parent_label,
              (
                SELECT COUNT(*)
                FROM culture_batches child
                WHERE child.parent_batch_id = culture_batches.id
                  AND child.deleted_at IS NULL
              ) AS child_count
       FROM culture_batches
       JOIN cell_lines ON cell_lines.id = culture_batches.cell_line_id
       LEFT JOIN culture_batches parent ON parent.id = culture_batches.parent_batch_id
       WHERE culture_batches.deleted_at IS NULL AND cell_lines.deleted_at IS NULL
       ORDER BY
         COALESCE(culture_batches.donor_identifier, '') COLLATE NOCASE,
         COALESCE(culture_batches.eye, '') COLLATE NOCASE,
         culture_batches.passage_number,
         COALESCE(culture_batches.started_at, '')`,
    );
  }

  async listEvents(batchId?: number): Promise<CultureEvent[]> {
    if (batchId) {
      return this.select<CultureEvent[]>(
        "SELECT * FROM culture_events WHERE batch_id = ? ORDER BY event_at DESC, id DESC",
        [batchId],
      );
    }

    return this.select<CultureEvent[]>("SELECT * FROM culture_events ORDER BY event_at DESC, id DESC LIMIT 300");
  }

  async listAuditEntries(limit = 25): Promise<AuditEntry[]> {
    return this.select<AuditEntry[]>(
      "SELECT * FROM audit_log ORDER BY created_at DESC, id DESC LIMIT ?",
      [limit],
    );
  }

  async listBackups(limit = 10): Promise<BackupSnapshot[]> {
    return this.select<BackupSnapshot[]>(
      "SELECT * FROM backup_snapshots ORDER BY created_at DESC, id DESC LIMIT ?",
      [limit],
    );
  }

  async createVessel(input: CreateVesselInput): Promise<number> {
    let newId = 0;

    await this.transaction(async () => {
      newId = await this.insertVesselRow(input);
      await this.writeAudit("culture_vessel", newId, "CREATE", input);
    });

    await this.saveSnapshot("Auto snapshot after vessel intake");
    return newId;
  }

  async importVessels(inputs: ImportVesselInput[]): Promise<number[]> {
    const ids: number[] = [];

    await this.transaction(async () => {
      for (const input of inputs) {
        ids.push(await this.insertVesselRow(input));
      }
      await this.resolveImportParents(inputs, ids);
      await this.writeAudit("database", null, "IMPORT", {
        count: ids.length,
        labels: inputs.map((input) => input.label),
      });
    });

    await this.saveSnapshot("Auto snapshot after import");
    return ids;
  }

  private async insertVesselRow(input: CreateVesselInput): Promise<number> {
    const cellLineId = await this.resolveCellLine(input.culture_name);
    await this.execute(
      `INSERT INTO culture_batches (
        cell_line_id,
        label,
        passage_number,
        vessel,
        medium,
        seeding_density,
        incubator_location,
        status,
        started_at,
        last_event_at,
        notes,
        donor_identifier,
        eye,
        parent_batch_id,
        split_date,
        media_change_1_date,
        media_change_2_date,
        source_record_type,
        raw_source_identifier,
        pretreatment_date,
        dissociation_date,
        ground_truth_date_field,
        ground_truth_date,
        conflict_resolution,
        raw_intake_json,
        growth_notes,
        source_documentation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cellLineId,
        input.label,
        input.passage_number,
        input.vessel,
        input.medium,
        input.seeding_density,
        input.incubator_location,
        input.status,
        input.started_at,
        input.started_at,
        input.growth_notes,
        input.donor_identifier,
        input.eye,
        input.parent_batch_id,
        input.split_date,
        input.media_change_1_date,
        input.media_change_2_date,
        input.source_record_type,
        input.raw_source_identifier,
        input.pretreatment_date,
        input.dissociation_date,
        input.ground_truth_date_field,
        input.ground_truth_date,
        input.conflict_resolution,
        input.raw_intake_json,
        input.growth_notes,
        input.source_documentation,
      ],
    );
    return this.lastInsertId();
  }

  private async resolveImportParents(inputs: ImportVesselInput[], ids: number[]): Promise<void> {
    const candidates = await this.select<ParentCandidate[]>(
      "SELECT id, label, donor_identifier, eye FROM culture_batches WHERE deleted_at IS NULL",
    );
    for (let index = 0; index < inputs.length; index += 1) {
      const input = inputs[index];
      if (!input.parent_label || !input.parent_label.trim()) {
        continue;
      }
      const parentId = matchParentId(input.parent_label, input, ids[index], candidates);
      if (parentId !== null) {
        await this.execute("UPDATE culture_batches SET parent_batch_id = ? WHERE id = ?", [parentId, ids[index]]);
      }
    }
  }

  async recordEvent(input: CreateEventInput): Promise<void> {
    await this.transaction(async () => {
      await this.execute(
        `INSERT INTO culture_events (
          batch_id,
          event_type,
          event_at,
          confluence_percent,
          viability_percent,
          split_ratio,
          medium,
          reagent_lot,
          operator,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.batch_id,
          input.event_type,
          input.event_at,
          input.confluence_percent,
          input.viability_percent,
          input.split_ratio,
          input.medium,
          input.reagent_lot,
          input.operator,
          input.notes,
        ],
      );
      const id = await this.lastInsertId();
      const nextStatus = statusFromEvent(input);

      await this.execute(
        `UPDATE culture_batches
         SET last_event_at = ?,
             passage_number = COALESCE(?, passage_number),
             status = COALESCE(?, status)
         WHERE id = ?`,
        [input.event_at, input.next_passage_number, nextStatus, input.batch_id],
      );
      await this.writeAudit("culture_event", id, "CREATE", input);
    });

    await this.saveSnapshot("Auto snapshot after culture event");
  }

  async exportBackup(label: string): Promise<BackupPackage> {
    const pkg = await this.makeBackupPackage();
    await this.insertSnapshot(label, pkg);
    return pkg;
  }

  async restoreBackup(pkg: BackupPackage): Promise<void> {
    await assertValidBackup(pkg);
    const beforeRestore = await this.makeBackupPackage();

    await this.transaction(async () => {
      await this.insertSnapshot("Auto snapshot before restore", beforeRestore);
      await this.execute("DELETE FROM culture_events");
      await this.execute("DELETE FROM culture_batches");
      await this.execute("DELETE FROM cell_lines");

      for (const cellLine of pkg.data.cellLines) {
        await this.execute(
          `INSERT INTO cell_lines (
            id, name, species, tissue, source, identifiers, notes, created_at, updated_at, deleted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            cellLine.id,
            cellLine.name,
            cellLine.species,
            cellLine.tissue,
            cellLine.source,
            cellLine.identifiers,
            cellLine.notes,
            cellLine.created_at,
            cellLine.updated_at,
            cellLine.deleted_at,
          ],
        );
      }

      const batches = pkg.data.cultureBatches.map(normalizeBatch);
      for (const batch of batches) {
        await this.insertRestoredBatch({ ...batch, parent_batch_id: null });
      }

      for (const batch of batches) {
        if (batch.parent_batch_id !== null) {
          await this.execute("UPDATE culture_batches SET parent_batch_id = ? WHERE id = ?", [
            batch.parent_batch_id,
            batch.id,
          ]);
        }
      }

      for (const event of pkg.data.cultureEvents) {
        await this.execute(
          `INSERT INTO culture_events (
            id,
            batch_id,
            event_type,
            event_at,
            confluence_percent,
            viability_percent,
            split_ratio,
            medium,
            reagent_lot,
            operator,
            notes,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            event.id,
            event.batch_id,
            event.event_type,
            event.event_at,
            event.confluence_percent,
            event.viability_percent,
            event.split_ratio,
            event.medium,
            event.reagent_lot,
            event.operator,
            event.notes,
            event.created_at,
          ],
        );
      }

      await this.writeAudit("database", null, "RESTORE", {
        restoredAt: timestamp(),
        backupExportedAt: pkg.exportedAt,
        checksum: pkg.checksum,
      });
    });
  }

  private async resolveCellLine(cultureName: string): Promise<number> {
    await this.execute(
      `INSERT OR IGNORE INTO cell_lines (name, species, tissue, source, notes)
       VALUES (?, 'Human', 'Cornea', 'Donor-derived culture', 'Created from vessel intake')`,
      [cultureName],
    );
    const rows = await this.select<Array<{ id: number }>>("SELECT id FROM cell_lines WHERE name = ? LIMIT 1", [
      cultureName,
    ]);
    if (!rows[0]) {
      throw new Error("Could not resolve culture type.");
    }
    return rows[0].id;
  }

  private async insertRestoredBatch(batch: CultureBatch): Promise<void> {
    await this.execute(
      `INSERT INTO culture_batches (
        id,
        cell_line_id,
        label,
        passage_number,
        vessel,
        medium,
        seeding_density,
        incubator_location,
        status,
        started_at,
        last_event_at,
        notes,
        donor_identifier,
        eye,
        parent_batch_id,
        split_date,
        media_change_1_date,
        media_change_2_date,
        source_record_type,
        raw_source_identifier,
        pretreatment_date,
        dissociation_date,
        ground_truth_date_field,
        ground_truth_date,
        conflict_resolution,
        raw_intake_json,
        growth_notes,
        source_documentation,
        created_at,
        updated_at,
        deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        batch.id,
        batch.cell_line_id,
        batch.label,
        batch.passage_number,
        batch.vessel,
        batch.medium,
        batch.seeding_density,
        batch.incubator_location,
        batch.status,
        batch.started_at,
        batch.last_event_at,
        batch.notes,
        batch.donor_identifier,
        batch.eye,
        batch.parent_batch_id,
        batch.split_date,
        batch.media_change_1_date,
        batch.media_change_2_date,
        batch.source_record_type,
        batch.raw_source_identifier,
        batch.pretreatment_date,
        batch.dissociation_date,
        batch.ground_truth_date_field,
        batch.ground_truth_date,
        batch.conflict_resolution,
        batch.raw_intake_json,
        batch.growth_notes,
        batch.source_documentation,
        batch.created_at,
        batch.updated_at,
        batch.deleted_at,
      ],
    );
  }

  private async makeBackupPackage(): Promise<BackupPackage> {
    return buildBackupPackage(
      await this.select<CellLine[]>("SELECT * FROM cell_lines ORDER BY id"),
      (await this.select<CultureBatch[]>("SELECT * FROM culture_batches ORDER BY id")).map(normalizeBatch),
      await this.select<CultureEvent[]>("SELECT * FROM culture_events ORDER BY id"),
      await this.select<AuditEntry[]>("SELECT * FROM audit_log ORDER BY id"),
    );
  }

  private async saveSnapshot(label: string): Promise<void> {
    await this.insertSnapshot(label, await this.makeBackupPackage());
  }

  private async insertSnapshot(label: string, pkg: BackupPackage): Promise<void> {
    await this.execute(
      `INSERT INTO backup_snapshots (label, checksum, exported_json)
       VALUES (?, ?, ?)`,
      [label, pkg.checksum, JSON.stringify(pkg, null, 2)],
    );
    await this.execute(
      `DELETE FROM backup_snapshots
       WHERE id NOT IN (
         SELECT id FROM backup_snapshots ORDER BY created_at DESC, id DESC LIMIT 25
       )`,
    );
  }

  private async writeAudit(
    entityType: string,
    entityId: number | null,
    operation: string,
    payload: unknown,
  ): Promise<void> {
    await this.execute(
      `INSERT INTO audit_log (entity_type, entity_id, operation, payload_json)
       VALUES (?, ?, ?, ?)`,
      [entityType, entityId, operation, JSON.stringify(payload)],
    );
  }

  private async lastInsertId(): Promise<number> {
    const rows = await this.select<Array<{ id: number }>>("SELECT last_insert_rowid() AS id");
    return rows[0]?.id ?? 0;
  }

  private async transaction<T>(callback: () => Promise<T>): Promise<T> {
    await this.execute("BEGIN IMMEDIATE");
    try {
      const result = await callback();
      await this.execute("COMMIT");
      return result;
    } catch (error) {
      await this.execute("ROLLBACK").catch(() => undefined);
      throw error;
    }
  }

  private async select<T>(query: string, bindValues: unknown[] = []): Promise<T> {
    if (!this.db) {
      throw new Error("Database is not initialized.");
    }

    return this.db.select<T>(query, bindValues);
  }

  private async execute(query: string, bindValues: unknown[] = []): Promise<void> {
    if (!this.db) {
      throw new Error("Database is not initialized.");
    }

    await this.db.execute(query, bindValues);
  }
}

class MemoryCultureStore implements CultureStore {
  readonly mode = "browser-preview" as const;

  private state: MemoryState = this.defaultState();

  async initialize(): Promise<void> {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (raw) {
      this.state = JSON.parse(raw) as MemoryState;
      return;
    }

    this.state = this.defaultState();
    await this.persist();
  }

  async listCellLines(): Promise<CellLine[]> {
    return clone(this.state.cellLines.filter((item) => item.deleted_at === null));
  }

  async listBatches(): Promise<CultureBatchView[]> {
    const cellLines = new Map(this.state.cellLines.map((item) => [item.id, item]));
    const children = new Map<number, number>();
    this.state.cultureBatches.forEach((batch) => {
      if (batch.parent_batch_id !== null && batch.deleted_at === null) {
        children.set(batch.parent_batch_id, (children.get(batch.parent_batch_id) ?? 0) + 1);
      }
    });

    return clone(
      this.state.cultureBatches
        .filter((item) => item.deleted_at === null)
        .map((batch) => {
          const cellLine = cellLines.get(batch.cell_line_id);
          const parent = this.state.cultureBatches.find((item) => item.id === batch.parent_batch_id);
          return {
            ...normalizeBatch(batch),
            cell_line_name: cellLine?.name ?? "Unknown culture",
            species: cellLine?.species ?? "",
            parent_label: parent?.label ?? null,
            child_count: children.get(batch.id) ?? 0,
          };
        })
        .sort(compareBatches),
    );
  }

  async listEvents(batchId?: number): Promise<CultureEvent[]> {
    return clone(
      this.state.cultureEvents
        .filter((event) => !batchId || event.batch_id === batchId)
        .sort((a, b) => b.event_at.localeCompare(a.event_at) || b.id - a.id),
    );
  }

  async listAuditEntries(limit = 25): Promise<AuditEntry[]> {
    return clone(
      this.state.auditLog
        .slice()
        .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id)
        .slice(0, limit),
    );
  }

  async listBackups(limit = 10): Promise<BackupSnapshot[]> {
    return clone(
      this.state.backups
        .slice()
        .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id)
        .slice(0, limit),
    );
  }

  async createVessel(input: CreateVesselInput): Promise<number> {
    const id = this.insertBatchRow(input);
    this.audit("culture_vessel", id, "CREATE", input);
    await this.saveSnapshot("Auto snapshot after vessel intake");
    await this.persist();
    return id;
  }

  async importVessels(inputs: ImportVesselInput[]): Promise<number[]> {
    const ids = inputs.map((input) => this.insertBatchRow(input));

    // Snapshot of candidates taken after all inserts, so a parent can be another
    // just-imported row.
    const candidates: ParentCandidate[] = this.state.cultureBatches
      .filter((batch) => batch.deleted_at === null)
      .map((batch) => ({
        id: batch.id,
        label: batch.label,
        donor_identifier: batch.donor_identifier,
        eye: batch.eye,
      }));

    inputs.forEach((input, index) => {
      if (!input.parent_label || !input.parent_label.trim()) {
        return;
      }
      const parentId = matchParentId(input.parent_label, input, ids[index], candidates);
      if (parentId !== null) {
        const batch = this.state.cultureBatches.find((item) => item.id === ids[index]);
        if (batch) {
          batch.parent_batch_id = parentId;
        }
      }
    });

    this.audit("database", null, "IMPORT", { count: ids.length, labels: inputs.map((input) => input.label) });
    await this.saveSnapshot("Auto snapshot after import");
    await this.persist();
    return ids;
  }

  private insertBatchRow(input: CreateVesselInput): number {
    const cellLineId = this.resolveCellLine(input.culture_name);
    const row: CultureBatch = {
      id: this.state.nextBatchId++,
      cell_line_id: cellLineId,
      label: input.label,
      passage_number: input.passage_number,
      vessel: input.vessel,
      medium: input.medium,
      seeding_density: input.seeding_density,
      incubator_location: input.incubator_location,
      status: input.status,
      started_at: input.started_at,
      last_event_at: input.started_at,
      notes: input.growth_notes,
      donor_identifier: input.donor_identifier,
      eye: input.eye,
      parent_batch_id: input.parent_batch_id,
      split_date: input.split_date,
      media_change_1_date: input.media_change_1_date,
      media_change_2_date: input.media_change_2_date,
      source_record_type: input.source_record_type,
      raw_source_identifier: input.raw_source_identifier,
      pretreatment_date: input.pretreatment_date,
      dissociation_date: input.dissociation_date,
      ground_truth_date_field: input.ground_truth_date_field,
      ground_truth_date: input.ground_truth_date,
      conflict_resolution: input.conflict_resolution,
      raw_intake_json: input.raw_intake_json,
      growth_notes: input.growth_notes,
      source_documentation: input.source_documentation,
      created_at: timestamp(),
      updated_at: null,
      deleted_at: null,
    };

    this.state.cultureBatches.push(row);
    return row.id;
  }

  async recordEvent(input: CreateEventInput): Promise<void> {
    const row: CultureEvent = {
      id: this.state.nextEventId++,
      batch_id: input.batch_id,
      event_type: input.event_type,
      event_at: input.event_at,
      confluence_percent: input.confluence_percent,
      viability_percent: input.viability_percent,
      split_ratio: input.split_ratio,
      medium: input.medium,
      reagent_lot: input.reagent_lot,
      operator: input.operator,
      notes: input.notes,
      created_at: timestamp(),
    };
    const batch = this.state.cultureBatches.find((item) => item.id === input.batch_id);
    const nextStatus = statusFromEvent(input);

    this.state.cultureEvents.push(row);
    if (batch) {
      batch.last_event_at = input.event_at;
      batch.updated_at = timestamp();
      if (input.next_passage_number !== null) {
        batch.passage_number = input.next_passage_number;
      }
      if (nextStatus) {
        batch.status = nextStatus;
      }
    }
    this.audit("culture_event", row.id, "CREATE", input);
    await this.saveSnapshot("Auto snapshot after culture event");
    await this.persist();
  }

  async exportBackup(label: string): Promise<BackupPackage> {
    const pkg = await this.makeBackupPackage();
    await this.insertSnapshot(label, pkg);
    await this.persist();
    return pkg;
  }

  async restoreBackup(pkg: BackupPackage): Promise<void> {
    await assertValidBackup(pkg);
    const beforeRestore = await this.makeBackupPackage();
    await this.insertSnapshot("Auto snapshot before restore", beforeRestore);

    this.state.cellLines = clone(pkg.data.cellLines);
    this.state.cultureBatches = clone(pkg.data.cultureBatches.map(normalizeBatch));
    this.state.cultureEvents = clone(pkg.data.cultureEvents);
    this.state.auditLog = clone(pkg.data.auditLog);
    this.rebuildCounters();
    this.audit("database", null, "RESTORE", {
      restoredAt: timestamp(),
      backupExportedAt: pkg.exportedAt,
      checksum: pkg.checksum,
    });
    await this.persist();
  }

  private resolveCellLine(cultureName: string): number {
    const existing = this.state.cellLines.find(
      (line) => line.name.toLowerCase() === cultureName.toLowerCase() && line.deleted_at === null,
    );
    if (existing) {
      return existing.id;
    }

    const row: CellLine = {
      id: this.state.nextCellLineId++,
      name: cultureName,
      species: "Human",
      tissue: "Cornea",
      source: "Donor-derived culture",
      identifiers: null,
      notes: "Created from vessel intake",
      created_at: timestamp(),
      updated_at: null,
      deleted_at: null,
    };
    this.state.cellLines.push(row);
    return row.id;
  }

  private async makeBackupPackage(): Promise<BackupPackage> {
    return buildBackupPackage(
      this.state.cellLines,
      this.state.cultureBatches.map(normalizeBatch),
      this.state.cultureEvents,
      this.state.auditLog,
    );
  }

  private async saveSnapshot(label: string): Promise<void> {
    await this.insertSnapshot(label, await this.makeBackupPackage());
  }

  private async insertSnapshot(label: string, pkg: BackupPackage): Promise<void> {
    this.state.backups.push({
      id: this.state.nextBackupId++,
      label,
      checksum: pkg.checksum,
      exported_json: JSON.stringify(pkg, null, 2),
      created_at: timestamp(),
    });
    this.state.backups = this.state.backups
      .slice()
      .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id)
      .slice(0, 25);
  }

  private audit(entityType: string, entityId: number | null, operation: string, payload: unknown): void {
    this.state.auditLog.push({
      id: this.state.nextAuditId++,
      entity_type: entityType,
      entity_id: entityId,
      operation,
      payload_json: JSON.stringify(payload),
      created_at: timestamp(),
    });
  }

  private rebuildCounters(): void {
    this.state.nextCellLineId = Math.max(0, ...this.state.cellLines.map((item) => item.id)) + 1;
    this.state.nextBatchId = Math.max(0, ...this.state.cultureBatches.map((item) => item.id)) + 1;
    this.state.nextEventId = Math.max(0, ...this.state.cultureEvents.map((item) => item.id)) + 1;
    this.state.nextAuditId = Math.max(0, ...this.state.auditLog.map((item) => item.id)) + 1;
    this.state.nextBackupId = Math.max(0, ...this.state.backups.map((item) => item.id)) + 1;
  }

  private async persist(): Promise<void> {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(this.state));
  }

  private defaultState(): MemoryState {
    const createdAt = timestamp();
    return {
      nextCellLineId: 2,
      nextBatchId: 5,
      nextEventId: 3,
      nextAuditId: 4,
      nextBackupId: 1,
      cellLines: [
        {
          id: 1,
          name: "Corneal endothelial culture",
          species: "Human",
          tissue: "Cornea",
          source: "Donor-derived culture",
          identifiers: null,
          notes: "Preview donor culture type.",
          created_at: createdAt,
          updated_at: null,
          deleted_at: null,
        },
      ],
      cultureBatches: [
        {
          id: 1,
          cell_line_id: 1,
          label: "6769 OD T25",
          passage_number: 0,
          vessel: "T25 flask",
          medium: "F99 + 8% FBS",
          seeding_density: "Primary isolation",
          incubator_location: "Incubator 1 / Shelf A",
          status: "active",
          started_at: "2026-05-01",
          last_event_at: "2026-05-01",
          notes: "Primary donor isolation.",
          donor_identifier: "6769",
          eye: "OD",
          parent_batch_id: null,
          split_date: null,
          media_change_1_date: "2026-05-04",
          media_change_2_date: "2026-05-07",
          source_record_type: "culture_vessel",
          raw_source_identifier: "6769 OD primary flask label",
          pretreatment_date: null,
          dissociation_date: "2026-05-01",
          ground_truth_date_field: "seed_date",
          ground_truth_date: "2026-05-01",
          conflict_resolution: "Use P0 flask seed date as vessel ground truth; keep tissue dissociation source text separately.",
          raw_intake_json:
            "{\"donor_identifier\":\"6769\",\"label\":\"6769 OD T25\",\"source_record_type\":\"culture_vessel\",\"dissociation_date\":\"2026-05-01\",\"started_at\":\"2026-05-01\"}",
          growth_notes: "Primary culture established with moderate attachment.",
          source_documentation: "Preview source note",
          created_at: createdAt,
          updated_at: null,
          deleted_at: null,
        },
        {
          id: 2,
          cell_line_id: 1,
          label: "6769 OD T75",
          passage_number: 1,
          vessel: "T75 flask",
          medium: "F99 + 8% FBS",
          seeding_density: "1:2 split",
          incubator_location: "Incubator 1 / Shelf A",
          status: "active",
          started_at: "2026-05-10",
          last_event_at: "2026-05-10",
          notes: "Split from P0.",
          donor_identifier: "6769",
          eye: "OD",
          parent_batch_id: 1,
          split_date: "2026-05-10",
          media_change_1_date: "2026-05-12",
          media_change_2_date: null,
          source_record_type: "culture_vessel",
          raw_source_identifier: "6769 OD T75",
          pretreatment_date: null,
          dissociation_date: null,
          ground_truth_date_field: "seed_date",
          ground_truth_date: "2026-05-10",
          conflict_resolution: null,
          raw_intake_json:
            "{\"donor_identifier\":\"6769\",\"label\":\"6769 OD T75\",\"source_record_type\":\"culture_vessel\",\"started_at\":\"2026-05-10\"}",
          growth_notes: "Healthy cobblestone morphology.",
          source_documentation: "Preview source note",
          created_at: createdAt,
          updated_at: null,
          deleted_at: null,
        },
        {
          id: 3,
          cell_line_id: 1,
          label: "6769 OD T75",
          passage_number: 2,
          vessel: "T75 flask",
          medium: "F99 + 8% FBS",
          seeding_density: "1:3 split",
          incubator_location: "Incubator 2 / Shelf B",
          status: "contaminated",
          started_at: "2026-05-17",
          last_event_at: "2026-05-19",
          notes: "Contamination noted.",
          donor_identifier: "6769",
          eye: "OD",
          parent_batch_id: 2,
          split_date: "2026-05-17",
          media_change_1_date: "2026-05-19",
          media_change_2_date: null,
          source_record_type: "culture_vessel",
          raw_source_identifier: "6769 OD T75",
          pretreatment_date: null,
          dissociation_date: null,
          ground_truth_date_field: "seed_date",
          ground_truth_date: "2026-05-17",
          conflict_resolution: "Duplicate T75 label retained because this was a contaminated sibling flask.",
          raw_intake_json:
            "{\"donor_identifier\":\"6769\",\"label\":\"6769 OD T75\",\"source_record_type\":\"culture_vessel\",\"started_at\":\"2026-05-17\",\"status\":\"contaminated\"}",
          growth_notes: "Contaminated; keep record for lineage.",
          source_documentation: "Poorly labelled flask: Donor 6769 OD P2 T75 contaminated",
          created_at: createdAt,
          updated_at: null,
          deleted_at: null,
        },
        {
          id: 4,
          cell_line_id: 1,
          label: "6769 OD T75",
          passage_number: 2,
          vessel: "T75 flask",
          medium: "F99 + 8% FBS",
          seeding_density: "1:3 split",
          incubator_location: "Incubator 2 / Shelf C",
          status: "active",
          started_at: "2026-05-17",
          last_event_at: "2026-05-20",
          notes: "Sibling flask from same split.",
          donor_identifier: "6769",
          eye: "OD",
          parent_batch_id: 2,
          split_date: "2026-05-17",
          media_change_1_date: "2026-05-20",
          media_change_2_date: null,
          source_record_type: "culture_vessel",
          raw_source_identifier: "6769 OD T75",
          pretreatment_date: null,
          dissociation_date: null,
          ground_truth_date_field: "seed_date",
          ground_truth_date: "2026-05-17",
          conflict_resolution: "Duplicate T75 label retained because this was the active sibling flask.",
          raw_intake_json:
            "{\"donor_identifier\":\"6769\",\"label\":\"6769 OD T75\",\"source_record_type\":\"culture_vessel\",\"started_at\":\"2026-05-17\",\"status\":\"active\"}",
          growth_notes: "Duplicate label is intentional; sibling T75 from same split.",
          source_documentation: "Preview duplicate-name sibling vessel",
          created_at: createdAt,
          updated_at: null,
          deleted_at: null,
        },
      ],
      cultureEvents: [
        {
          id: 1,
          batch_id: 3,
          event_type: "contamination",
          event_at: "2026-05-19T09:00",
          confluence_percent: 60,
          viability_percent: null,
          split_ratio: null,
          medium: null,
          reagent_lot: null,
          operator: "Preview",
          notes: "Cloudy medium and debris observed.",
          created_at: createdAt,
        },
        {
          id: 2,
          batch_id: 4,
          event_type: "media_change",
          event_at: "2026-05-20T11:00",
          confluence_percent: 65,
          viability_percent: null,
          split_ratio: null,
          medium: "F99 + 8% FBS",
          reagent_lot: null,
          operator: "Preview",
          notes: "Sibling flask remains active.",
          created_at: createdAt,
        },
      ],
      auditLog: [
        {
          id: 1,
          entity_type: "database",
          entity_id: null,
          operation: "PREVIEW_SEED",
          payload_json: "{}",
          created_at: createdAt,
        },
        {
          id: 2,
          entity_type: "culture_vessel",
          entity_id: 3,
          operation: "CREATE",
          payload_json: "{\"preview\":true}",
          created_at: createdAt,
        },
        {
          id: 3,
          entity_type: "culture_vessel",
          entity_id: 4,
          operation: "CREATE",
          payload_json: "{\"preview\":true}",
          created_at: createdAt,
        },
      ],
      backups: [],
    };
  }
}

function compareBatches(a: CultureBatchView, b: CultureBatchView): number {
  return (
    (a.donor_identifier ?? "").localeCompare(b.donor_identifier ?? "") ||
    (a.eye ?? "").localeCompare(b.eye ?? "") ||
    a.passage_number - b.passage_number ||
    (a.started_at ?? "").localeCompare(b.started_at ?? "") ||
    a.id - b.id
  );
}
