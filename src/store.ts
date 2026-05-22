import Database from "@tauri-apps/plugin-sql";
import type {
  AuditEntry,
  BackupPackage,
  BackupSnapshot,
  CellLine,
  CreateBatchInput,
  CreateCellLineInput,
  CreateEventInput,
  CultureBatch,
  CultureBatchView,
  CultureEvent,
  CultureStore,
} from "./types";
import { sha256 } from "./utils";

const DB_URL = "sqlite:cell-culture-recorder.db";
const MEMORY_KEY = "cell-culture-recorder.preview-store.v1";

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
    version: 1,
    exportedAt: timestamp(),
    checksum,
    data,
  };
}

async function assertValidBackup(pkg: BackupPackage): Promise<void> {
  if (pkg.app !== "cell-culture-recorder" || pkg.version !== 1) {
    throw new Error("This file is not a compatible Cell Culture Recorder backup.");
  }

  const checksum = await sha256(JSON.stringify(pkg.data));
  if (checksum !== pkg.checksum) {
    throw new Error("Backup checksum mismatch. The backup may be incomplete or modified.");
  }
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
      `SELECT culture_batches.*, cell_lines.name AS cell_line_name, cell_lines.species AS species
       FROM culture_batches
       JOIN cell_lines ON cell_lines.id = culture_batches.cell_line_id
       WHERE culture_batches.deleted_at IS NULL AND cell_lines.deleted_at IS NULL
       ORDER BY
         CASE culture_batches.status
           WHEN 'active' THEN 0
           WHEN 'contaminated' THEN 1
           WHEN 'frozen' THEN 2
           ELSE 3
         END,
         COALESCE(culture_batches.last_event_at, culture_batches.started_at) DESC`,
    );
  }

  async listEvents(batchId?: number): Promise<CultureEvent[]> {
    if (batchId) {
      return this.select<CultureEvent[]>(
        "SELECT * FROM culture_events WHERE batch_id = ? ORDER BY event_at DESC, id DESC",
        [batchId],
      );
    }

    return this.select<CultureEvent[]>(
      "SELECT * FROM culture_events ORDER BY event_at DESC, id DESC LIMIT 150",
    );
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

  async createCellLine(input: CreateCellLineInput): Promise<void> {
    await this.transaction(async () => {
      await this.execute(
        `INSERT INTO cell_lines (name, species, tissue, source, identifiers, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [input.name, input.species, input.tissue, input.source, input.identifiers, input.notes],
      );
      const id = await this.lastInsertId();
      await this.writeAudit("cell_line", id, "CREATE", input);
    });

    await this.saveSnapshot("Auto snapshot after cell line save");
  }

  async createBatch(input: CreateBatchInput): Promise<void> {
    await this.transaction(async () => {
      await this.execute(
        `INSERT INTO culture_batches (
          cell_line_id,
          label,
          passage_number,
          vessel,
          medium,
          seeding_density,
          incubator_location,
          started_at,
          last_event_at,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.cell_line_id,
          input.label,
          input.passage_number,
          input.vessel,
          input.medium,
          input.seeding_density,
          input.incubator_location,
          input.started_at,
          input.started_at,
          input.notes,
        ],
      );
      const id = await this.lastInsertId();
      await this.writeAudit("culture_batch", id, "CREATE", input);
    });

    await this.saveSnapshot("Auto snapshot after culture start");
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

      for (const batch of pkg.data.cultureBatches) {
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
            created_at,
            updated_at,
            deleted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            batch.created_at,
            batch.updated_at,
            batch.deleted_at,
          ],
        );
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

  private async makeBackupPackage(): Promise<BackupPackage> {
    return buildBackupPackage(
      await this.select<CellLine[]>("SELECT * FROM cell_lines ORDER BY id"),
      await this.select<CultureBatch[]>("SELECT * FROM culture_batches ORDER BY id"),
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
    return clone(
      this.state.cultureBatches
        .filter((item) => item.deleted_at === null)
        .map((batch) => {
          const cellLine = cellLines.get(batch.cell_line_id);
          return {
            ...batch,
            cell_line_name: cellLine?.name ?? "Unknown cell line",
            species: cellLine?.species ?? "",
          };
        })
        .sort((a, b) => {
          const statusWeight = (status: CultureBatch["status"]): number =>
            status === "active" ? 0 : status === "contaminated" ? 1 : status === "frozen" ? 2 : 3;
          const statusDelta = statusWeight(a.status) - statusWeight(b.status);
          if (statusDelta !== 0) {
            return statusDelta;
          }
          return (b.last_event_at ?? b.started_at).localeCompare(a.last_event_at ?? a.started_at);
        }),
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

  async createCellLine(input: CreateCellLineInput): Promise<void> {
    const row: CellLine = {
      id: this.state.nextCellLineId++,
      ...input,
      created_at: timestamp(),
      updated_at: null,
      deleted_at: null,
    };
    this.state.cellLines.push(row);
    this.audit("cell_line", row.id, "CREATE", input);
    await this.saveSnapshot("Auto snapshot after cell line save");
    await this.persist();
  }

  async createBatch(input: CreateBatchInput): Promise<void> {
    const row: CultureBatch = {
      id: this.state.nextBatchId++,
      ...input,
      status: "active",
      last_event_at: input.started_at,
      created_at: timestamp(),
      updated_at: null,
      deleted_at: null,
    };
    this.state.cultureBatches.push(row);
    this.audit("culture_batch", row.id, "CREATE", input);
    await this.saveSnapshot("Auto snapshot after culture start");
    await this.persist();
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
    this.state.cultureBatches = clone(pkg.data.cultureBatches);
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

  private async makeBackupPackage(): Promise<BackupPackage> {
    return buildBackupPackage(
      this.state.cellLines,
      this.state.cultureBatches,
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
      nextBatchId: 2,
      nextEventId: 2,
      nextAuditId: 2,
      nextBackupId: 1,
      cellLines: [
        {
          id: 1,
          name: "HEK293T",
          species: "Human",
          tissue: "Embryonic kidney",
          source: "ATCC",
          identifiers: "Preview data",
          notes: "Browser preview sample. Tauri runtime uses the SQL database.",
          created_at: createdAt,
          updated_at: null,
          deleted_at: null,
        },
      ],
      cultureBatches: [
        {
          id: 1,
          cell_line_id: 1,
          label: "HEK293T P18 T75-A",
          passage_number: 18,
          vessel: "T75 flask",
          medium: "DMEM + 10% FBS",
          seeding_density: "1.5e6 cells",
          incubator_location: "Incubator 2 / Shelf B",
          status: "active",
          started_at: createdAt.slice(0, 10),
          last_event_at: createdAt,
          notes: "Preview culture.",
          created_at: createdAt,
          updated_at: null,
          deleted_at: null,
        },
      ],
      cultureEvents: [
        {
          id: 1,
          batch_id: 1,
          event_type: "observation",
          event_at: createdAt,
          confluence_percent: 65,
          viability_percent: null,
          split_ratio: null,
          medium: null,
          reagent_lot: null,
          operator: "Preview",
          notes: "Cells are adherent with even distribution.",
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
      ],
      backups: [],
    };
  }
}
