import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import { createIcons, icons } from "lucide";
import "./styles.css";
import { createCultureStore } from "./store";
import type {
  BackupPackage,
  BackupSnapshot,
  CellLine,
  CreateEventInput,
  CreateVesselInput,
  CultureBatchView,
  CultureEvent,
  CultureStatus,
  CultureStore,
  EventType,
  Eye,
  GroundTruthDateField,
  ImportVesselInput,
  SourceRecordType,
  VesselPatch,
} from "./types";
import {
  autoMap,
  buildImportRawIntake,
  IMPORT_FIELDS,
  parseTabularFile,
  rowToDraft,
} from "./import";
import type { ColumnMapping, ImportDraft, ImportFieldKey } from "./import";
import {
  compactText,
  displayDate,
  downloadJson,
  downloadXlsxWorkbook,
  escapeHtml,
  nowIsoMinute,
  nullableNumber,
  requiredNumber,
  requiredText,
  todayIsoDate,
} from "./utils";

type Notice = { tone: "success" | "error" | "info"; message: string } | null;

interface AppState {
  cellLines: CellLine[];
  batches: CultureBatchView[];
  selectedEvents: CultureEvent[];
  allEvents: CultureEvent[];
  backups: BackupSnapshot[];
  selectedBatchId: number | null;
  search: string;
  statusFilter: CultureStatus | "all";
  donorFilter: string;
  notice: Notice;
  saving: boolean;
  mode: CultureStore["mode"];
  importWizard: ImportWizardState | null;
  grid: GridState;
}

interface GridState {
  expanded: Set<number>;
  flaggedOnly: boolean;
  // Unsaved rows being added or imported (no DB id yet), keyed by a negative temp id.
  drafts: GridDraftRow[];
}

interface GridDraftRow {
  tempId: number;
  draft: ImportDraft;
  // Present only for imported rows: original cells (provenance) + the file's parent column.
  source: { fileName: string; headers: string[]; cells: string[]; mapping: ColumnMapping; rowIndex: number } | null;
}

// The import flow is now just load + column-mapping; mapped rows are injected into the
// grid as flagged draft rows, so no per-row review state is needed.
interface ImportWizardState {
  fileName: string;
  headers: string[];
  rows: string[][];
  mapping: ColumnMapping;
}

interface VesselDraft {
  culture_name: string;
  donor_identifier: string | null;
  eye: Eye;
  label: string;
  passage_number: number | null;
  vessel: string;
  parent_batch_id: number | null;
  started_at: string | null;
  split_date: string | null;
  media_change_1_date: string | null;
  media_change_2_date: string | null;
  media_changes: MediaChangeDraft[];
  source_record_type: SourceRecordType;
  raw_source_identifier: string | null;
  pretreatment_date: string | null;
  dissociation_date: string | null;
  ground_truth_date_field: GroundTruthDateField;
  ground_truth_date: string | null;
  conflict_resolution: string | null;
  status: CultureStatus;
}

interface MediaChangeDraft {
  date: string | null;
  medium: string | null;
}

interface GroundTruthSource {
  started_at: string | null;
  pretreatment_date: string | null;
  dissociation_date: string | null;
  ground_truth_date_field: GroundTruthDateField;
}

const COMMON_FLASKS = [
  "T25 flask",
  "T75 flask",
  "T150 flask",
  "T175 flask",
  "T225 flask",
  "6-well plate",
  "12-well plate",
  "24-well plate",
  "60 mm dish",
  "100 mm dish",
];

const appElement = document.querySelector<HTMLDivElement>("#app");

if (!appElement) {
  throw new Error("Missing app container.");
}

const app = appElement;

let store: CultureStore;

const state: AppState = {
  cellLines: [],
  batches: [],
  selectedEvents: [],
  allEvents: [],
  backups: [],
  selectedBatchId: null,
  search: "",
  statusFilter: "all",
  donorFilter: "all",
  notice: null,
  saving: false,
  mode: "browser-preview",
  importWizard: null,
  grid: { expanded: new Set(), flaggedOnly: false, drafts: [] },
};

// Holds an available app update (Tauri only) so the banner's Install button can act on it
// without re-checking. Auto-populated on launch; the manual "Check updates" button also sets it.
let availableUpdate: Awaited<ReturnType<typeof check>> = null;
let updateBannerDismissed = false;

async function boot(): Promise<void> {
  renderLoading();

  try {
    store = await createCultureStore();
    state.mode = store.mode;
    await refreshData();
    void autoCheckForUpdates();
  } catch (error) {
    state.notice = {
      tone: "error",
      message: error instanceof Error ? error.message : "Unable to open the database.",
    };
    render();
  }
}

async function refreshData(): Promise<void> {
  state.cellLines = await store.listCellLines();
  state.batches = await store.listBatches();
  state.allEvents = await store.listEvents();
  state.backups = await store.listBackups();

  if (!state.selectedBatchId && state.batches.length > 0) {
    state.selectedBatchId = state.batches[0].id;
  }

  if (state.selectedBatchId && !state.batches.some((batch) => batch.id === state.selectedBatchId)) {
    state.selectedBatchId = state.batches[0]?.id ?? null;
  }

  state.selectedEvents = state.selectedBatchId ? await store.listEvents(state.selectedBatchId) : [];
  render();
}

function renderLoading(): void {
  app.innerHTML = `
    <main class="loading-shell">
      <div class="loading-mark"><i data-lucide="database"></i></div>
      <h1>Opening Cell Culture Recorder</h1>
      <p>Preparing the local database.</p>
    </main>
  `;
  createIcons({ icons });
}

function render(): void {
  const filteredBatches = getFilteredBatches();
  const selectedBatch = state.batches.find((batch) => batch.id === state.selectedBatchId) ?? null;
  const lastBackup = state.backups[0] ?? null;
  const donorCount = uniqueValues(state.batches.map((batch) => batch.donor_identifier)).length;
  const warningCount = state.batches.reduce((total, batch) => total + buildBatchWarnings(batch).length, 0);

  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <a href="../index.html" class="back-to-planner" style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding:9px 11px;border-radius:9px;border:1px solid rgba(148,163,184,.25);color:inherit;text-decoration:none;font-size:13px;font-weight:600">
          <i data-lucide="arrow-left"></i><span>WetLab Planner</span>
        </a>
        <div class="brand">
          <div class="brand-mark"><i data-lucide="microscope"></i></div>
          <div>
            <strong>Culture Ledger</strong>
            <span>Donor vessel tracking</span>
          </div>
        </div>

        <nav class="nav-stack" aria-label="Primary">
          <a href="#records"><i data-lucide="table-2"></i><span>Records</span></a>
          <a href="#import"><i data-lucide="file-up"></i><span>Import</span></a>
          <a href="#lineage"><i data-lucide="git-branch"></i><span>Lineage</span></a>
          <a href="#backup"><i data-lucide="database-backup"></i><span>Backups</span></a>
        </nav>

        <div class="storage-panel">
          <div class="storage-title">
            <i data-lucide="shield-check"></i>
            <span>Storage</span>
          </div>
          <p>${state.mode === "tauri-sql" ? "Tauri SQL database" : "Browser preview store"}</p>
          <p>Last backup: ${lastBackup ? escapeHtml(displayDate(lastBackup.created_at)) : "none yet"}</p>
        </div>
      </aside>

      <main class="main-view">
        <header class="topbar">
          <div>
            <p class="eyebrow">Fast intake for poorly labelled flasks</p>
            <h1>Donor Culture Tracker</h1>
          </div>
          <div class="topbar-actions">
            <label class="search-field">
              <i data-lucide="search"></i>
              <input id="search" type="search" placeholder="Search donor, eye, flask, notes" value="${escapeHtml(state.search)}" />
            </label>
            <select id="donor-filter" aria-label="Filter by donor">
              <option value="all" ${state.donorFilter === "all" ? "selected" : ""}>All donors</option>
              ${uniqueValues(state.batches.map((batch) => batch.donor_identifier))
                .map((donor) => `<option value="${escapeHtml(donor)}" ${state.donorFilter === donor ? "selected" : ""}>${escapeHtml(donor)}</option>`)
                .join("")}
            </select>
            <select id="status-filter" aria-label="Filter by status">
              ${statusOption("all", "All statuses")}
              ${statusOption("active", "Active")}
              ${statusOption("frozen", "Frozen")}
              ${statusOption("contaminated", "Contaminated")}
              ${statusOption("discarded", "Discarded")}
            </select>
            <button id="download-backup-top" class="button primary" type="button">
              <i data-lucide="download"></i>
              <span>Download backup</span>
            </button>
            <button id="export-excel-top" class="button" type="button">
              <i data-lucide="file-spreadsheet"></i>
              <span>Export Excel</span>
            </button>
            <button id="check-updates-top" class="button" type="button">
              <i data-lucide="refresh-cw"></i>
              <span>Check updates</span>
            </button>
          </div>
        </header>

        ${renderUpdateBanner()}
        ${renderNotice()}
        ${renderDatalists()}

        <section class="stats-grid" aria-label="Overview">
          ${statCard("Donors", donorCount, "scan-text")}
          ${statCard("Vessels", state.batches.length, "flask-conical")}
          ${statCard("Active", state.batches.filter((batch) => batch.status === "active").length, "activity")}
          ${statCard("Warnings", warningCount, "triangle-alert")}
        </section>

        <section id="lineage" class="workspace-grid">
          <div class="panel lineage-panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Tracking tree</p>
                <h2>Donor culture lineage</h2>
              </div>
              <span id="lineage-count" class="count-pill">${filteredBatches.length}</span>
            </div>
            <div id="lineage-results">
              ${renderLineageTree(filteredBatches)}
            </div>
          </div>

          <div class="panel timeline-panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Selected vessel</p>
                <h2>${selectedBatch ? escapeHtml(selectedBatch.label) : "No vessel selected"}</h2>
              </div>
            </div>
            ${renderTimeline(selectedBatch)}
          </div>
        </section>

        <section id="import" class="panel import-panel">
          ${renderImportSection()}
        </section>

        <section id="records" class="panel culture-panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Database</p>
              <h2>Vessel records</h2>
            </div>
            <div class="grid-toolbar">
              ${
                state.grid.drafts.some((row) => row.source)
                  ? `<button id="commit-import" class="button primary" type="button"><i data-lucide="database-backup"></i><span>Commit import (${
                      state.grid.drafts.filter((row) => row.source).length
                    })</span></button>`
                  : ""
              }
              <button id="flag-filter" class="button subtle${state.grid.flaggedOnly ? " active" : ""}" type="button">
                <i data-lucide="triangle-alert"></i><span>${state.grid.flaggedOnly ? "Showing flagged" : "Needs attention"}</span>
              </button>
              <button id="add-vessel" class="button primary" type="button">
                <i data-lucide="plus"></i><span>Add vessel</span>
              </button>
              <span id="records-count" class="count-pill">${filteredBatches.length}</span>
            </div>
          </div>
          <div id="records-results">
            ${renderVesselGrid(filteredBatches)}
          </div>
        </section>

        <section class="forms-grid">
          ${renderEventForm(selectedBatch)}
          ${renderBackupPanel(lastBackup)}
        </section>
      </main>
    </div>
  `;

  attachEvents();
  createIcons({ icons });
}

function renderUpdateBanner(): string {
  if (!availableUpdate || updateBannerDismissed) {
    return "";
  }
  return `
    <div class="update-banner" role="status">
      <div class="update-banner-text">
        <i data-lucide="sparkles"></i>
        <div>
          <strong>Update available — v${escapeHtml(availableUpdate.version)}</strong>
          <span>Install now to get the latest. The app downloads it and restarts automatically.</span>
        </div>
      </div>
      <div class="update-banner-actions">
        <button id="update-later" class="button subtle" type="button"><span>Later</span></button>
        <button id="update-install" class="button primary" type="button"><i data-lucide="download"></i><span>Install &amp; restart</span></button>
      </div>
    </div>
  `;
}

function renderNotice(): string {
  if (!state.notice && !state.saving) {
    return "";
  }

  const tone = state.saving ? "info" : state.notice?.tone ?? "info";
  const message = state.saving ? "Saving to the local database..." : state.notice?.message ?? "";

  return `
    <div class="notice ${tone}" role="status">
      <i data-lucide="${tone === "error" ? "circle-alert" : tone === "success" ? "circle-check" : "info"}"></i>
      <span>${escapeHtml(message)}</span>
    </div>
  `;
}

function renderDatalists(): string {
  const cultureNames = uniqueValues(state.cellLines.map((line) => line.name));
  const donors = uniqueValues(state.batches.map((batch) => batch.donor_identifier));
  const labels = uniqueValues(state.batches.map((batch) => batch.label));
  const vessels = uniqueValues([...COMMON_FLASKS, ...state.batches.map((batch) => batch.vessel)]);
  const media = uniqueValues(state.batches.map((batch) => batch.medium));

  return `
    ${dataList("culture-name-list", cultureNames)}
    ${dataList("donor-list", donors)}
    ${dataList("vessel-label-list", labels)}
    ${dataList("flask-type-list", vessels)}
    ${dataList("media-list", media)}
  `;
}

function dataList(id: string, values: string[]): string {
  return `<datalist id="${id}">${values.map((value) => `<option value="${escapeHtml(value)}"></option>`).join("")}</datalist>`;
}

function statCard(label: string, value: number, icon: string): string {
  return `
    <div class="stat-card">
      <i data-lucide="${icon}"></i>
      <div>
        <span>${escapeHtml(label)}</span>
        <strong>${value}</strong>
      </div>
    </div>
  `;
}

function renderLineageTree(batches: CultureBatchView[]): string {
  if (batches.length === 0) {
    return `
      <div class="empty-state">
        <i data-lucide="folder-tree"></i>
        <p>No vessel records match the current filters.</p>
      </div>
    `;
  }

  const groups = groupBatches(batches);

  return `
    <div class="tree-stack">
      ${Array.from(groups.entries())
        .map(([groupName, groupBatches]) => renderTreeGroup(groupName, groupBatches))
        .join("")}
    </div>
  `;
}

function renderTreeGroup(groupName: string, batches: CultureBatchView[]): string {
  const byParent = new Map<number | null, CultureBatchView[]>();
  const ids = new Set(batches.map((batch) => batch.id));
  const duplicateCounts = countBy(batches.map((batch) => batch.label.toLowerCase()));

  batches.forEach((batch) => {
    const parentKey = batch.parent_batch_id && ids.has(batch.parent_batch_id) ? batch.parent_batch_id : null;
    const list = byParent.get(parentKey) ?? [];
    list.push(batch);
    byParent.set(parentKey, list);
  });

  byParent.forEach((list) => list.sort(compareTreeNodes));

  return `
    <section class="tree-group">
      <div class="tree-group-title">
        <i data-lucide="scan-text"></i>
        <strong>${escapeHtml(groupName)}</strong>
      </div>
      <div class="tree-nodes">
        ${(byParent.get(null) ?? [])
          .map((batch) => renderTreeNode(batch, byParent, duplicateCounts, 0))
          .join("")}
      </div>
    </section>
  `;
}

function renderTreeNode(
  batch: CultureBatchView,
  byParent: Map<number | null, CultureBatchView[]>,
  duplicateCounts: Map<string, number>,
  depth: number,
): string {
  const children = byParent.get(batch.id) ?? [];
  const warnings = buildBatchWarnings(batch);
  const duplicateCount = duplicateCounts.get(batch.label.toLowerCase()) ?? 0;

  return `
    <div class="tree-node-wrap">
      <button class="tree-node ${state.selectedBatchId === batch.id ? "selected" : ""}" type="button" data-batch-id="${batch.id}" style="--depth: ${depth}">
        <span class="tree-connector"></span>
        <span class="vessel-chip">${escapeHtml(batch.vessel.replace(" flask", ""))}</span>
        <span class="tree-main">
          <strong>${escapeHtml(batch.label)}</strong>
          <span>${escapeHtml(formatDonorEye(batch))} / P${batch.passage_number} / ${escapeHtml(displayDate(batch.started_at))}</span>
        </span>
        ${duplicateCount > 1 ? `<span class="mini-badge">duplicate name</span>` : ""}
        ${warnings.length > 0 ? `<span class="warning-count">${warnings.length}</span>` : ""}
        ${statusBadge(batch.status)}
      </button>
      ${children.length > 0 ? children.map((child) => renderTreeNode(child, byParent, duplicateCounts, depth + 1)).join("") : ""}
    </div>
  `;
}

function renderTimeline(selectedBatch: CultureBatchView | null): string {
  if (!selectedBatch) {
    return `
      <div class="empty-state">
        <i data-lucide="list-plus"></i>
        <p>Select a vessel to see recorded events.</p>
      </div>
    `;
  }

  const fixedEvents = inferredEventsForBatch(selectedBatch);

  return `
    <div class="timeline-summary">
      ${statusBadge(selectedBatch.status)}
      <span>${escapeHtml(selectedBatch.medium ?? "No baseline media type recorded")}</span>
    </div>
    <ol class="timeline">
      ${fixedEvents.map(renderFixedEvent).join("")}
      ${state.selectedEvents.map(renderEvent).join("")}
      ${fixedEvents.length === 0 && state.selectedEvents.length === 0 ? `<li class="empty-line">No dates or events recorded.</li>` : ""}
    </ol>
  `;
}

function renderFixedEvent(event: { label: string; date: string | null; icon: string }): string {
  if (!event.date) {
    return "";
  }

  return `
    <li>
      <div class="timeline-icon"><i data-lucide="${event.icon}"></i></div>
      <div>
        <div class="timeline-title">
          <strong>${escapeHtml(event.label)}</strong>
          <span>${escapeHtml(displayDate(event.date))}</span>
        </div>
      </div>
    </li>
  `;
}

function renderEvent(event: CultureEvent): string {
  const metrics = [
    event.confluence_percent !== null ? `${event.confluence_percent}% confluence` : null,
    event.viability_percent !== null ? `${event.viability_percent}% viability` : null,
    event.split_ratio ? `Split ${event.split_ratio}` : null,
    event.medium ? `Media ${event.medium}` : null,
    event.reagent_lot ? `Lot ${event.reagent_lot}` : null,
  ].filter(Boolean);

  return `
    <li>
      <div class="timeline-icon ${event.event_type}">
        <i data-lucide="${eventIcon(event.event_type)}"></i>
      </div>
      <div>
        <div class="timeline-title">
          <strong>${formatEventType(event.event_type)}</strong>
          <span>${escapeHtml(displayDate(event.event_at))}</span>
        </div>
        ${metrics.length > 0 ? `<p class="metrics">${metrics.map((metric) => escapeHtml(metric)).join(" / ")}</p>` : ""}
        ${event.operator ? `<p class="operator">Operator: ${escapeHtml(event.operator)}</p>` : ""}
        <p>${escapeHtml(event.notes || "No notes recorded.")}</p>
      </div>
    </li>
  `;
}

function renderEventForm(selectedBatch: CultureBatchView | null): string {
  const disabled = state.batches.length === 0 || state.saving;

  return `
    <form id="event-form" class="panel form-panel event-form">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Follow-up</p>
          <h2>Record event</h2>
        </div>
        <i data-lucide="clipboard-plus"></i>
      </div>

      <label>Culture vessel
        <select id="selected-batch" name="batch_id" required ${state.batches.length === 0 ? "disabled" : ""}>
          ${state.batches
            .map(
              (batch) =>
                `<option value="${batch.id}" ${batch.id === selectedBatch?.id ? "selected" : ""}>${escapeHtml(
                  vesselOptionLabel(batch),
                )}</option>`,
            )
            .join("")}
        </select>
      </label>

      <div class="two-col">
        <label>Event type
          <select name="event_type" required>
            <option value="observation">Observation</option>
            <option value="feeding">Feeding</option>
            <option value="media_change">Media change</option>
            <option value="passage">Passage</option>
            <option value="thaw">Thaw</option>
            <option value="freeze">Freeze</option>
            <option value="contamination">Contamination</option>
            <option value="discard">Discard</option>
          </select>
        </label>
        <label>Date and time<input name="event_at" required type="datetime-local" value="${nowIsoMinute()}" /></label>
      </div>

      <div class="two-col">
        <label>Confluence %<input name="confluence_percent" type="number" min="0" max="100" placeholder="70" /></label>
        <label>Viability %<input name="viability_percent" type="number" min="0" max="100" placeholder="95" /></label>
      </div>

      <div class="two-col">
        <label>Split ratio<input name="split_ratio" placeholder="1:4" /></label>
        <label>Next passage<input name="next_passage_number" type="number" min="0" placeholder="Only if changed" /></label>
      </div>

      <label>Media type<input name="medium" list="media-list" placeholder="F99 + 8% FBS" /></label>
      <label>Reagent lot<input name="reagent_lot" placeholder="FBS L24018, Trypsin T2304" /></label>
      <label>Operator<input name="operator" placeholder="Initials or name" /></label>
      <label>Status after event
        <select name="next_status">
          <option value="">Infer from event</option>
          <option value="active">Active</option>
          <option value="frozen">Frozen</option>
          <option value="contaminated">Contaminated</option>
          <option value="discarded">Discarded</option>
        </select>
      </label>
      <label>Notes<textarea name="notes" rows="4" required placeholder="Morphology, color change, contamination signs, action taken"></textarea></label>

      <button class="button primary" type="submit" ${disabled ? "disabled" : ""}>
        <i data-lucide="save"></i>
        <span>Record event</span>
      </button>
    </form>
  `;
}

function renderBackupPanel(lastBackup: BackupSnapshot | null): string {
  return `
    <div id="backup" class="panel backup-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Data safety</p>
          <h2>Backups and restore</h2>
        </div>
        <i data-lucide="database-backup"></i>
      </div>

      <div class="backup-actions">
        <p>Last snapshot: ${lastBackup ? escapeHtml(displayDate(lastBackup.created_at)) : "none yet"}</p>
        <button id="download-backup" class="button primary" type="button">
          <i data-lucide="download"></i>
          <span>Download backup</span>
        </button>
        <button id="export-excel" class="button" type="button">
          <i data-lucide="file-spreadsheet"></i>
          <span>Export Excel</span>
        </button>
        <button id="check-updates" class="button" type="button">
          <i data-lucide="refresh-cw"></i>
          <span>Check updates</span>
        </button>
        <label class="file-button">
          <i data-lucide="upload"></i>
          <span>Restore from file</span>
          <input id="restore-file" type="file" accept="application/json" />
        </label>
      </div>

      <div class="snapshot-list">
        <h3>Recent local snapshots</h3>
        ${state.backups.length === 0 ? "<p>No snapshots have been created yet.</p>" : state.backups.map(renderSnapshot).join("")}
      </div>
    </div>
  `;
}

function renderSnapshot(snapshot: BackupSnapshot): string {
  return `
    <div class="snapshot-row">
      <div>
        <strong>${escapeHtml(snapshot.label)}</strong>
        <span>${escapeHtml(displayDate(snapshot.created_at))} / ${escapeHtml(snapshot.checksum.slice(0, 12))}</span>
      </div>
      <button class="button subtle restore-snapshot" data-snapshot-id="${snapshot.id}" type="button">
        <i data-lucide="rotate-ccw"></i>
        <span>Restore</span>
      </button>
    </div>
  `;
}

function attachEvents(): void {

  app.querySelector<HTMLFormElement>("#event-form")?.addEventListener("submit", handleEventSubmit);
  app.querySelector<HTMLInputElement>("#search")?.addEventListener("input", (event) => {
    state.search = (event.currentTarget as HTMLInputElement).value;
    updateFilteredViews();
  });
  app.querySelector<HTMLSelectElement>("#donor-filter")?.addEventListener("change", (event) => {
    state.donorFilter = (event.currentTarget as HTMLSelectElement).value;
    updateFilteredViews();
  });
  app.querySelector<HTMLSelectElement>("#status-filter")?.addEventListener("change", (event) => {
    state.statusFilter = (event.currentTarget as HTMLSelectElement).value as AppState["statusFilter"];
    updateFilteredViews();
  });
  app.querySelector<HTMLSelectElement>("#selected-batch")?.addEventListener("change", async (event) => {
    state.selectedBatchId = Number((event.currentTarget as HTMLSelectElement).value);
    state.selectedEvents = await store.listEvents(state.selectedBatchId);
    render();
  });
  app.querySelector<HTMLButtonElement>("#download-backup-top")?.addEventListener("click", downloadBackup);
  app.querySelector<HTMLButtonElement>("#download-backup")?.addEventListener("click", downloadBackup);
  app.querySelector<HTMLButtonElement>("#export-excel-top")?.addEventListener("click", exportExcel);
  app.querySelector<HTMLButtonElement>("#export-excel")?.addEventListener("click", exportExcel);
  app.querySelector<HTMLButtonElement>("#check-updates-top")?.addEventListener("click", checkForUpdates);
  app.querySelector<HTMLButtonElement>("#check-updates")?.addEventListener("click", checkForUpdates);
  app.querySelector<HTMLButtonElement>("#update-install")?.addEventListener("click", installAvailableUpdate);
  app.querySelector<HTMLButtonElement>("#update-later")?.addEventListener("click", () => {
    updateBannerDismissed = true;
    render();
  });
  app.querySelector<HTMLInputElement>("#restore-file")?.addEventListener("change", restoreFromFile);

  app.querySelector<HTMLButtonElement>("#add-vessel")?.addEventListener("click", addVesselRow);
  app.querySelector<HTMLButtonElement>("#commit-import")?.addEventListener("click", commitImportDrafts);
  app.querySelector<HTMLButtonElement>("#flag-filter")?.addEventListener("click", () => {
    state.grid.flaggedOnly = !state.grid.flaggedOnly;
    render();
  });

  attachBatchSelectionEvents();
  attachImportEvents();
  attachGridEvents();

  app.querySelectorAll<HTMLButtonElement>(".restore-snapshot").forEach((button) => {
    button.addEventListener("click", async () => {
      const snapshot = state.backups.find((item) => item.id === Number(button.dataset.snapshotId));
      if (!snapshot) {
        return;
      }
      await restorePackage(JSON.parse(snapshot.exported_json) as BackupPackage);
    });
  });
}

function updateFilteredViews(): void {
  const filteredBatches = getFilteredBatches();
  const lineageCount = app.querySelector<HTMLSpanElement>("#lineage-count");
  const recordsCount = app.querySelector<HTMLSpanElement>("#records-count");
  const lineageResults = app.querySelector<HTMLDivElement>("#lineage-results");
  const recordsResults = app.querySelector<HTMLDivElement>("#records-results");

  if (lineageCount) {
    lineageCount.textContent = String(filteredBatches.length);
  }
  if (recordsCount) {
    recordsCount.textContent = String(filteredBatches.length);
  }
  if (lineageResults) {
    lineageResults.innerHTML = renderLineageTree(filteredBatches);
  }
  if (recordsResults) {
    recordsResults.innerHTML = renderVesselGrid(filteredBatches);
  }

  attachBatchSelectionEvents();
  attachGridEvents();
  createIcons({ icons });
}

function attachBatchSelectionEvents(): void {
  app.querySelectorAll<HTMLButtonElement>(".select-batch, .tree-node").forEach((button) => {
    button.addEventListener("click", async () => {
      state.selectedBatchId = Number(button.dataset.batchId);
      state.selectedEvents = await store.listEvents(state.selectedBatchId);
      render();
    });
  });
}

async function handleEventSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const data = new FormData(form);
  const confluence = boundedPercent(data.get("confluence_percent"), "Confluence");
  const viability = boundedPercent(data.get("viability_percent"), "Viability");
  const nextStatus = compactText(data.get("next_status")) as CultureStatus | null;
  const input: CreateEventInput = {
    batch_id: requiredNumber(data.get("batch_id"), "Culture vessel"),
    event_type: requiredText(data.get("event_type"), "Event type") as EventType,
    event_at: requiredText(data.get("event_at"), "Date and time"),
    confluence_percent: confluence,
    viability_percent: viability,
    split_ratio: compactText(data.get("split_ratio")),
    medium: compactText(data.get("medium")),
    reagent_lot: compactText(data.get("reagent_lot")),
    operator: compactText(data.get("operator")),
    notes: requiredText(data.get("notes"), "Notes"),
    next_status: nextStatus,
    next_passage_number: nullableNumber(data.get("next_passage_number")),
  };

  await runMutation("Culture event recorded.", async () => {
    await store.recordEvent(input);
    form.reset();
    state.selectedBatchId = input.batch_id;
  });
}

async function downloadBackup(): Promise<void> {
  await runMutation("Backup downloaded.", async () => {
    const pkg = await store.exportBackup("Manual export");
    const filename = `donor-culture-backup-${pkg.exportedAt.slice(0, 10)}.json`;
    downloadJson(filename, JSON.stringify(pkg, null, 2));
  });
}

async function exportExcel(): Promise<void> {
  const batchById = new Map(state.batches.map((batch) => [batch.id, batch]));
  const filename = `donor-culture-records-${new Date().toISOString().slice(0, 10)}.xlsx`;

  downloadXlsxWorkbook(filename, [
    {
      name: "Vessels",
      rows: state.batches.map((batch) => ({
        id: batch.id,
        donor_id: batch.donor_identifier,
        eye: eyeLabel(batch.eye),
        culture_type: batch.cell_line_name,
        vessel_label: batch.label,
        passage: batch.passage_number,
        flask_type: batch.vessel,
        status: batch.status,
        parent_vessel: batch.parent_label,
        seed_date: batch.started_at,
        split_date: batch.split_date,
        legacy_media_change_1_date: batch.media_change_1_date,
        legacy_media_change_2_date: batch.media_change_2_date,
        source_record_type: sourceRecordLabel(batch.source_record_type),
        raw_source_identifier: batch.raw_source_identifier,
        pretreatment_date: batch.pretreatment_date,
        dissociation_date: batch.dissociation_date,
        ground_truth_date_field: groundTruthLabel(batch.ground_truth_date_field),
        ground_truth_date: batch.ground_truth_date,
        conflict_resolution: batch.conflict_resolution,
        baseline_media_type: batch.medium,
        seeding_density: batch.seeding_density,
        growth_notes: batch.growth_notes,
        source_documentation: batch.source_documentation,
        warnings: warningMessages(buildBatchWarnings(batch)).join(" | "),
      })),
    },
    {
      name: "Events",
      rows: state.allEvents.map((event) => {
        const batch = batchById.get(event.batch_id);
        return {
          id: event.id,
          vessel_id: event.batch_id,
          donor_id: batch?.donor_identifier,
          eye: eyeLabel(batch?.eye),
          vessel_label: batch?.label,
          passage: batch?.passage_number,
          event_type: event.event_type,
          event_at: event.event_at,
          confluence_percent: event.confluence_percent,
          viability_percent: event.viability_percent,
          split_ratio: event.split_ratio,
          media_type: event.medium,
          reagent_lot: event.reagent_lot,
          operator: event.operator,
          notes: event.notes,
        };
      }),
    },
    {
      name: "Culture Types",
      rows: state.cellLines.map((line) => ({
        id: line.id,
        name: line.name,
        species: line.species,
        tissue: line.tissue,
        source: line.source,
        identifiers: line.identifiers,
        notes: line.notes,
      })),
    },
    {
      name: "Raw Intake",
      rows: state.batches.map((batch) => ({
        vessel_id: batch.id,
        donor_id: batch.donor_identifier,
        eye: eyeLabel(batch.eye),
        vessel_label: batch.label,
        raw_source_identifier: batch.raw_source_identifier,
        source_documentation: batch.source_documentation,
        raw_intake_json: batch.raw_intake_json,
      })),
    },
  ]);

  state.notice = { tone: "success", message: "Excel workbook exported." };
  render();
}

// Silent check on launch — if an update is waiting, surface the banner automatically so
// the user can update locally with one click (no need to find a button).
async function autoCheckForUpdates(): Promise<void> {
  if (!isTauriRuntime()) {
    return;
  }
  try {
    const update = await check({ timeout: 15000 });
    if (update) {
      availableUpdate = update;
      updateBannerDismissed = false;
      render();
    }
  } catch {
    // Stay quiet on launch; the manual "Check updates" button surfaces any error.
  }
}

// Manual "Check updates" button — same result, but reports up-to-date / errors.
async function checkForUpdates(): Promise<void> {
  if (!isTauriRuntime()) {
    state.notice = {
      tone: "info",
      message: "In-app updates run in the installed app, not the browser preview.",
    };
    render();
    return;
  }

  state.notice = { tone: "info", message: "Checking for updates..." };
  render();

  try {
    const update = await check({ timeout: 15000 });
    if (!update) {
      availableUpdate = null;
      state.notice = { tone: "success", message: "Cell Culture Recorder is up to date." };
      render();
      return;
    }
    availableUpdate = update;
    updateBannerDismissed = false;
    state.notice = { tone: "info", message: `Update ${update.version} is available.` };
    render();
  } catch (error) {
    state.notice = {
      tone: "error",
      message: error instanceof Error ? error.message : "Could not check for updates.",
    };
    render();
  }
}

// Download + install the pending update, showing progress, then relaunch.
async function installAvailableUpdate(): Promise<void> {
  const update = availableUpdate;
  if (!update) {
    return;
  }
  updateBannerDismissed = true; // hide the banner; progress shows in the notice

  try {
    let downloaded = 0;
    let contentLength: number | undefined;
    await update.downloadAndInstall((event) => {
      if (event.event === "Started") {
        contentLength = event.data.contentLength;
        downloaded = 0;
        state.notice = { tone: "info", message: `Downloading update ${update.version}...` };
        render();
      }
      if (event.event === "Progress") {
        downloaded += event.data.chunkLength;
        if (contentLength) {
          const percent = Math.round((downloaded / contentLength) * 100);
          state.notice = { tone: "info", message: `Downloading update ${update.version}: ${percent}%` };
          render();
        }
      }
      if (event.event === "Finished") {
        state.notice = { tone: "info", message: "Installing update..." };
        render();
      }
    });

    state.notice = { tone: "success", message: "Update installed. Relaunching now." };
    render();
    await relaunch();
  } catch (error) {
    updateBannerDismissed = false;
    state.notice = {
      tone: "error",
      message: error instanceof Error ? error.message : "Could not install the update.",
    };
    render();
  }
}

async function restoreFromFile(event: Event): Promise<void> {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";

  if (!file) {
    return;
  }

  const pkg = JSON.parse(await file.text()) as BackupPackage;
  await restorePackage(pkg);
}

async function restorePackage(pkg: BackupPackage): Promise<void> {
  const approved = window.confirm(
    "Restore this backup? Current donor culture vessels and events will be replaced after an automatic snapshot is saved.",
  );
  if (!approved) {
    return;
  }

  await runMutation("Backup restored.", async () => {
    await store.restoreBackup(pkg);
  });
}

async function runMutation(successMessage: string, action: () => Promise<void>): Promise<void> {
  state.saving = true;
  state.notice = null;
  render();

  try {
    await action();
    state.notice = { tone: "success", message: successMessage };
    await refreshData();
  } catch (error) {
    state.notice = {
      tone: "error",
      message: error instanceof Error ? error.message : "The operation failed.",
    };
    render();
  } finally {
    state.saving = false;
    render();
  }
}

function groundTruthDate(input: GroundTruthSource): string | null {
  if (input.ground_truth_date_field === "seed_date") {
    return input.started_at;
  }
  if (input.ground_truth_date_field === "dissociation_date") {
    return input.dissociation_date;
  }
  if (input.ground_truth_date_field === "pretreatment_date") {
    return input.pretreatment_date;
  }
  return null;
}

function batchToVesselDraft(batch: CultureBatchView): VesselDraft {
  return {
    culture_name: batch.cell_line_name,
    donor_identifier: batch.donor_identifier,
    eye: batch.eye ?? "unknown",
    label: batch.label,
    passage_number: batch.passage_number,
    vessel: batch.vessel,
    parent_batch_id: batch.parent_batch_id,
    started_at: batch.started_at,
    split_date: batch.split_date,
    media_change_1_date: batch.media_change_1_date,
    media_change_2_date: batch.media_change_2_date,
    media_changes: [batch.media_change_1_date, batch.media_change_2_date]
      .filter((date): date is string => Boolean(date))
      .map((date) => ({ date, medium: batch.medium })),
    source_record_type: batch.source_record_type,
    raw_source_identifier: batch.raw_source_identifier,
    pretreatment_date: batch.pretreatment_date,
    dissociation_date: batch.dissociation_date,
    ground_truth_date_field: batch.ground_truth_date_field,
    ground_truth_date: batch.ground_truth_date,
    conflict_resolution: batch.conflict_resolution,
    status: batch.status,
  };
}

function buildBatchWarnings(batch: CultureBatchView): Warning[] {
  return buildDraftWarnings(batchToVesselDraft(batch), state.batches, batch.id);
}

// The subset of a batch that warning checks read. `state.batches` (CultureBatchView[])
// satisfies this structurally; import preview also passes synthetic peers for the rows
// already accepted in the same file, so intra-file conflicts are caught too.
type WarningPeer = Pick<
  CultureBatchView,
  | "id"
  | "label"
  | "passage_number"
  | "started_at"
  | "donor_identifier"
  | "eye"
  | "raw_source_identifier"
  | "source_record_type"
  | "dissociation_date"
>;

// Every editable vessel field the grid exposes; warnings tag the field(s) they concern
// so the grid can outline the exact problem cell(s).
type VesselField =
  | "donor_identifier"
  | "eye"
  | "culture_name"
  | "label"
  | "passage_number"
  | "vessel"
  | "started_at"
  | "split_date"
  | "parent_batch_id"
  | "status"
  | "source_record_type"
  | "raw_source_identifier"
  | "pretreatment_date"
  | "dissociation_date"
  | "ground_truth_date_field"
  | "conflict_resolution"
  | "medium"
  | "seeding_density"
  | "incubator_location"
  | "growth_notes"
  | "source_documentation"
  | "media_change_1_date"
  | "media_change_2_date";

interface Warning {
  fields: VesselField[];
  message: string;
}

function buildDraftWarnings(draft: VesselDraft, allBatches: WarningPeer[], ignoreBatchId?: number): Warning[] {
  const warnings: Warning[] = [];
  const add = (fields: VesselField[], message: string): void => {
    warnings.push({ fields, message });
  };
  const label = draft.label.trim().toLowerCase();
  const donor = draft.donor_identifier?.trim().toLowerCase() ?? "";
  const peers = allBatches.filter((batch) => batch.id !== ignoreBatchId);

  if (!draft.donor_identifier) {
    add(["donor_identifier"], "No donor ID entered; the vessel will be grouped under unknown donor.");
  }

  if (label) {
    const duplicates = peers.filter((batch) => batch.label.trim().toLowerCase() === label);
    if (duplicates.length > 0) {
      add(
        ["label"],
        `Duplicate vessel label found (${duplicates
          .map((batch) => `${formatDonorEye(batch)} P${batch.passage_number}`)
          .join(", ")}). This is allowed, but verify this is a distinct flask.`,
      );
    }
  }

  const parent = draft.parent_batch_id
    ? allBatches.find((batch) => batch.id === draft.parent_batch_id && batch.id !== ignoreBatchId)
    : null;

  if (parent) {
    if (draft.passage_number !== null && draft.passage_number <= parent.passage_number) {
      add(["parent_batch_id", "passage_number"], `Selected parent is P${parent.passage_number}; child passage should usually be higher.`);
    }
    if (draft.started_at && dateMs(draft.started_at) < dateMs(parent.started_at)) {
      add(["parent_batch_id", "started_at"], "Seed date is before the selected parent vessel seed date.");
    }
    if (draft.donor_identifier && parent.donor_identifier && donor !== parent.donor_identifier.toLowerCase()) {
      add(["parent_batch_id", "donor_identifier"], `Selected parent donor (${parent.donor_identifier}) does not match this donor.`);
    }
    if (draft.eye !== "unknown" && parent.eye && parent.eye !== "unknown" && draft.eye !== parent.eye) {
      add(["parent_batch_id", "eye"], `Selected parent eye (${eyeLabel(parent.eye)}) does not match this eye.`);
    }
  }

  if (draft.started_at && draft.split_date && dateMs(draft.split_date) < dateMs(draft.started_at)) {
    add(["split_date", "started_at"], "Split date is before seed date.");
  }

  draft.media_changes.forEach((change, index) => {
    const mlabel = `media change ${index + 1}`;
    if (change.date && !change.medium) {
      add([], `${mlabel} has a date but no media type.`);
    }
    if (!change.date && change.medium) {
      add([], `${mlabel} has a media type but no date.`);
    }
    if (draft.started_at && change.date && dateMs(change.date) < dateMs(draft.started_at)) {
      add([], `${mlabel} is before seed date.`);
    }
    const previous = draft.media_changes[index - 1];
    if (previous?.date && change.date && dateMs(change.date) < dateMs(previous.date)) {
      add([], `${mlabel} is before media change ${index}.`);
    }
  });

  if (draft.media_change_1_date && draft.media_change_2_date && dateMs(draft.media_change_2_date) < dateMs(draft.media_change_1_date)) {
    add(["media_change_1_date", "media_change_2_date"], "Media change 2 is before media change 1.");
  }

  if (draft.source_record_type === "primary_tissue_dissociation" && draft.vessel) {
    add(
      ["source_record_type", "vessel"],
      "This entry is marked as primary tissue/dissociation but also has a flask type. Consider saving the tissue source and P0 flask as separate records if their dates differ.",
    );
  }

  if (draft.passage_number === 0 && draft.started_at && draft.dissociation_date && !sameDate(draft.started_at, draft.dissociation_date)) {
    add(
      ["started_at", "dissociation_date"],
      `P0 seed date (${displayDate(draft.started_at)}) differs from dissociation date (${displayDate(
        draft.dissociation_date,
      )}). Choose a ground-truth date and keep the other date as raw provenance.`,
    );
  }

  if (draft.ground_truth_date_field === "dissociation_date" && !draft.dissociation_date) {
    add(["ground_truth_date_field", "dissociation_date"], "Dissociation date is selected as ground truth, but no dissociation date is entered.");
  }

  if (draft.ground_truth_date_field === "pretreatment_date" && !draft.pretreatment_date) {
    add(["ground_truth_date_field", "pretreatment_date"], "Pretreatment date is selected as ground truth, but no pretreatment date is entered.");
  }

  if (draft.ground_truth_date_field === "unresolved" && !draft.conflict_resolution) {
    add(["ground_truth_date_field", "conflict_resolution"], "Ground truth is unresolved. Add a rename/resolution note so the ambiguity is traceable.");
  }

  const normalizedSourceId = normalizeSourceId(draft.raw_source_identifier ?? draft.donor_identifier);
  if (normalizedSourceId) {
    const sourcePeers = peers.filter((batch) => {
      const batchSourceId = normalizeSourceId(batch.raw_source_identifier ?? batch.donor_identifier);
      return batchSourceId === normalizedSourceId && (batch.eye ?? "unknown") === draft.eye;
    });
    const suggestedLabel = suggestSourceConflictRename(draft);

    sourcePeers.forEach((batch) => {
      if (batch.source_record_type !== draft.source_record_type) {
        add(
          ["raw_source_identifier", "source_record_type"],
          `Raw source ID already appears as ${sourceRecordLabel(batch.source_record_type)} on "${batch.label}". Suggested rename: ${suggestedLabel}.`,
        );
      }

      if (draft.dissociation_date && batch.dissociation_date && !sameDate(draft.dissociation_date, batch.dissociation_date)) {
        add(["dissociation_date"], `Dissociation date differs from existing raw-source match "${batch.label}" (${displayDate(batch.dissociation_date)}).`);
      }

      if (draft.passage_number === batch.passage_number && draft.started_at && batch.started_at && !sameDate(draft.started_at, batch.started_at)) {
        add(
          ["started_at", "raw_source_identifier", "passage_number"],
          `Same raw source and passage as "${batch.label}", but seed dates differ (${displayDate(batch.started_at)} vs ${displayDate(
            draft.started_at,
          )}). Keep one as ground truth and note whether one field should be renamed.`,
        );
      }

      if (draft.passage_number === 0 && draft.dissociation_date && batch.passage_number === 0 && batch.started_at && !sameDate(draft.dissociation_date, batch.started_at)) {
        add(["dissociation_date", "passage_number"], `Dissociation date does not match existing P0 seed date for "${batch.label}". Suggested rename: ${suggestedLabel}.`);
      }
    });
  }

  if (draft.donor_identifier && draft.passage_number !== null && draft.started_at) {
    const draftPassage = draft.passage_number;
    const donorPeers = peers.filter(
      (batch) => (batch.donor_identifier ?? "").toLowerCase() === donor && (batch.eye ?? "unknown") === draft.eye,
    );

    donorPeers.forEach((batch) => {
      const batchDate = dateMs(batch.started_at);
      const draftDate = dateMs(draft.started_at);
      if (batch.passage_number < draftPassage && batchDate > draftDate) {
        add(["started_at", "passage_number"], `P${draftPassage} date is before existing P${batch.passage_number} vessel "${batch.label}".`);
      }
      if (batch.passage_number > draftPassage && batchDate < draftDate) {
        add(["started_at", "passage_number"], `Existing P${batch.passage_number} vessel "${batch.label}" is dated before this lower passage.`);
      }
    });
  }

  const seen = new Set<string>();
  return warnings.filter((warning) => {
    if (seen.has(warning.message)) {
      return false;
    }
    seen.add(warning.message);
    return true;
  });
}

function warningMessages(warnings: Warning[]): string[] {
  return warnings.map((warning) => warning.message);
}

interface RowFlags {
  byField: Map<VesselField, string[]>;
  messages: string[];
}

// Cell-level + row-level flags for a grid row: required-missing checks plus the
// field-tagged logic warnings. `byField` drives per-cell highlighting; `messages`
// drives the per-row count/tooltip.
function computeRowFlags(draft: VesselDraft, peers: WarningPeer[], ignoreBatchId?: number): RowFlags {
  const byField = new Map<VesselField, string[]>();
  const messages: string[] = [];
  const add = (fields: VesselField[], message: string): void => {
    messages.push(message);
    fields.forEach((field) => {
      const arr = byField.get(field) ?? [];
      arr.push(message);
      byField.set(field, arr);
    });
  };

  if (!draft.label.trim()) {
    add(["label"], "Vessel label is required.");
  }
  if (draft.passage_number === null) {
    add(["passage_number"], "Passage is required.");
  }
  if (!draft.vessel.trim()) {
    add(["vessel"], "Flask type is required.");
  }
  if (!draft.started_at) {
    add(["started_at"], "Seed date is required.");
  }

  for (const warning of buildDraftWarnings(draft, peers, ignoreBatchId)) {
    add(warning.fields, warning.message);
  }

  return { byField, messages };
}

function getFilteredBatches(): CultureBatchView[] {
  const search = state.search.trim().toLowerCase();
  const flaggedPeers = state.grid.flaggedOnly ? gridPeers() : [];

  return state.batches.filter((batch) => {
    const matchesSearch =
      !search ||
      [
        batch.label,
        batch.donor_identifier,
        batch.eye,
        batch.vessel,
        batch.medium,
        batch.raw_source_identifier,
        batch.source_record_type,
        batch.conflict_resolution,
        batch.raw_intake_json,
        batch.growth_notes,
        batch.source_documentation,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
    const matchesStatus = state.statusFilter === "all" || batch.status === state.statusFilter;
    const matchesDonor = state.donorFilter === "all" || batch.donor_identifier === state.donorFilter;
    const matchesFlagged =
      !state.grid.flaggedOnly ||
      computeRowFlags(batchToVesselDraft(batch), flaggedPeers, batch.id).messages.length > 0;

    return matchesSearch && matchesStatus && matchesDonor && matchesFlagged;
  });
}

function groupBatches(batches: CultureBatchView[]): Map<string, CultureBatchView[]> {
  const groups = new Map<string, CultureBatchView[]>();
  batches.forEach((batch) => {
    const key = formatDonorEye(batch);
    const group = groups.get(key) ?? [];
    group.push(batch);
    groups.set(key, group);
  });
  groups.forEach((group) => group.sort(compareTreeNodes));
  return groups;
}

function uniqueValues(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => !!value))).sort(
    (a, b) => a.localeCompare(b),
  );
}

function countBy(values: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return counts;
}

function compareTreeNodes(a: CultureBatchView, b: CultureBatchView): number {
  return a.passage_number - b.passage_number || dateMs(a.started_at) - dateMs(b.started_at) || a.id - b.id;
}

function inferredEventsForBatch(batch: CultureBatchView): Array<{ label: string; date: string | null; icon: string }> {
  return [
    { label: "Pretreatment", date: batch.pretreatment_date, icon: "clipboard-check" },
    { label: "Dissociation", date: batch.dissociation_date, icon: "scissors" },
    { label: "Seeded", date: batch.started_at, icon: "sprout" },
    { label: "Split", date: batch.split_date, icon: "split" },
    { label: "Media change 1", date: batch.media_change_1_date, icon: "refresh-cw" },
    { label: "Media change 2", date: batch.media_change_2_date, icon: "refresh-cw" },
  ].filter((event) => event.date);
}

function vesselOptionLabel(batch: CultureBatchView): string {
  return `${batch.donor_identifier ?? "Unknown"} ${eyeLabel(batch.eye)} / ${batch.label} / P${batch.passage_number} / ${batch.vessel}`;
}

function formatDonorEye(batch: Pick<CultureBatchView, "donor_identifier" | "eye">): string {
  return `${batch.donor_identifier ?? "Unknown donor"} ${eyeLabel(batch.eye)}`;
}

function eyeLabel(eye: Eye | null | undefined): string {
  if (eye === "OD") {
    return "OD";
  }
  if (eye === "OS") {
    return "OS";
  }
  if (eye === "OU") {
    return "OU";
  }
  return "unknown eye";
}

function sourceRecordLabel(type: SourceRecordType | null | undefined): string {
  if (type === "primary_tissue_dissociation") {
    return "Primary tissue / dissociation";
  }
  if (type === "mixed_source_note") {
    return "Mixed or ambiguous source note";
  }
  return "Culture vessel / flask";
}

function groundTruthLabel(field: GroundTruthDateField | null | undefined): string {
  if (field === "dissociation_date") {
    return "Dissociation date";
  }
  if (field === "pretreatment_date") {
    return "Pretreatment date";
  }
  if (field === "unresolved") {
    return "Unresolved";
  }
  return "Seed date";
}

function normalizeSourceId(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function sameDate(left: string, right: string): boolean {
  return left.slice(0, 10) === right.slice(0, 10);
}

function suggestSourceConflictRename(draft: VesselDraft): string {
  const donor = draft.donor_identifier ?? draft.raw_source_identifier ?? "source ID";
  const eye = draft.eye !== "unknown" ? ` ${draft.eye}` : "";
  if (draft.source_record_type === "primary_tissue_dissociation") {
    return `${donor}${eye} tissue dissociation source; reserve flask label for ${draft.label || `${donor}${eye} P0 flask`}`;
  }
  return `${donor}${eye} ${draft.passage_number === 0 ? "P0" : `P${draft.passage_number ?? "?"}`} flask; keep tissue source as separate raw source record`;
}

function dateMs(value: string | null | undefined): number {
  if (!value) {
    return Number.NaN;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? Number.NaN : parsed.getTime();
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function statusOption(value: AppState["statusFilter"], label: string): string {
  return `<option value="${value}" ${state.statusFilter === value ? "selected" : ""}>${label}</option>`;
}

function statusBadge(status: CultureStatus): string {
  return `<span class="status-badge ${status}">${status}</span>`;
}

function formatEventType(type: EventType): string {
  return type
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function eventIcon(type: EventType): string {
  const iconsByType: Record<EventType, string> = {
    feeding: "utensils",
    passage: "split",
    observation: "eye",
    media_change: "refresh-cw",
    thaw: "sun",
    freeze: "snowflake",
    contamination: "triangle-alert",
    discard: "trash-2",
  };

  return iconsByType[type];
}

function boundedPercent(value: FormDataEntryValue | null, label: string): number | null {
  const parsed = nullableNumber(value);
  if (parsed === null) {
    return null;
  }

  if (parsed < 0 || parsed > 100) {
    throw new Error(`${label} must be between 0 and 100.`);
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// Import wizard
// ---------------------------------------------------------------------------
function renderImportSection(): string {
  const wiz = state.importWizard;
  return wiz ? renderImportMapping(wiz) : renderImportLoad();
}

function renderImportLoad(): string {
  return `
    <div class="panel-header">
      <div>
        <p class="eyebrow">Bring in existing records</p>
        <h2>Import from CSV / Excel</h2>
      </div>
      <i data-lucide="file-up"></i>
    </div>
    <div class="form-section import-load">
      <p class="import-hint">
        The first row must be column headers. Imported rows land in the grid below, flagged where
        they need attention — fix the flagged cells, then Commit import. Nothing saves until you commit.
      </p>
      <label class="file-button">
        <i data-lucide="upload"></i>
        <span>Choose a .csv or .xlsx file</span>
        <input id="import-file" type="file"
          accept=".csv,.tsv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
      </label>
      <p class="import-subtle">Excel tip: if a .xlsx won't open on older macOS, use File &rarr; Save As &rarr; CSV.</p>
    </div>
  `;
}

function renderImportMapping(wiz: ImportWizardState): string {
  const columnOptions = (selected: number | null): string =>
    [`<option value="">— not mapped —</option>`]
      .concat(
        wiz.headers.map(
          (header, index) =>
            `<option value="${index}" ${selected === index ? "selected" : ""}>${escapeHtml(
              header || `Column ${index + 1}`,
            )}</option>`,
        ),
      )
      .join("");

  const fieldRows = IMPORT_FIELDS.map(
    (field) => `
      <tr>
        <td>${escapeHtml(field.label)}${field.required ? ' <span class="req">*</span>' : ""}</td>
        <td><select data-map-field="${field.key}">${columnOptions(wiz.mapping[field.key])}</select></td>
      </tr>`,
  ).join("");

  return `
    <div class="panel-header">
      <div>
        <p class="eyebrow">${escapeHtml(wiz.fileName)} / ${wiz.rows.length} data rows</p>
        <h2>Match your columns</h2>
      </div>
      <button id="import-cancel" class="button subtle" type="button"><i data-lucide="x"></i><span>Cancel</span></button>
    </div>
    <div class="form-section">
      <p class="import-hint">Columns were auto-matched — fix any that are wrong. Required fields are marked <span class="req">*</span>.</p>
      <div class="table-wrap mapping-table">
        <table>
          <thead><tr><th>App field</th><th>Source column</th></tr></thead>
          <tbody>${fieldRows}</tbody>
        </table>
      </div>
      <button id="import-to-grid" class="button primary" type="button">
        <i data-lucide="arrow-down"></i><span>Add ${wiz.rows.length} row${wiz.rows.length === 1 ? "" : "s"} to the grid</span>
      </button>
    </div>
  `;
}

function attachImportEvents(): void {
  app.querySelector<HTMLInputElement>("#import-file")?.addEventListener("change", handleImportFile);
  app.querySelector<HTMLButtonElement>("#import-cancel")?.addEventListener("click", cancelImport);

  const wiz = state.importWizard;
  if (!wiz) {
    return;
  }
  app.querySelectorAll<HTMLSelectElement>("[data-map-field]").forEach((select) => {
    select.addEventListener("change", () => {
      const key = select.dataset.mapField as ImportFieldKey;
      wiz.mapping[key] = select.value === "" ? null : Number(select.value);
    });
  });
  app.querySelector<HTMLButtonElement>("#import-to-grid")?.addEventListener("click", startImport);
}

async function handleImportFile(event: Event): Promise<void> {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) {
    return;
  }

  try {
    const grid = await parseTabularFile(file);
    if (grid.length < 2) {
      throw new Error("The file needs a header row plus at least one data row.");
    }
    const [headers, ...rows] = grid;
    state.importWizard = { fileName: file.name, headers, rows, mapping: autoMap(headers) };
    state.notice = null;
    render();
  } catch (error) {
    state.notice = { tone: "error", message: error instanceof Error ? error.message : "Could not read that file." };
    render();
  }
}

// Map a parsed file into flagged draft rows in the grid (replacing the old row-by-row wizard).
function startImport(): void {
  const wiz = state.importWizard;
  if (!wiz) {
    return;
  }
  const missing = IMPORT_FIELDS.filter((field) => field.required && wiz.mapping[field.key] === null).map(
    (field) => field.label,
  );
  if (missing.length > 0) {
    state.notice = { tone: "error", message: `Map these required columns first: ${missing.join(", ")}.` };
    render();
    return;
  }
  wiz.rows.forEach((cells, index) => {
    state.grid.drafts.push({
      tempId: nextDraftTempId(),
      draft: rowToDraft(cells, wiz.mapping),
      source: { fileName: wiz.fileName, headers: wiz.headers, cells, mapping: wiz.mapping, rowIndex: index },
    });
  });
  const count = wiz.rows.length;
  state.importWizard = null;
  state.grid.flaggedOnly = false;
  state.notice = {
    tone: "info",
    message: `${count} row${count === 1 ? "" : "s"} added to the grid — fix any flagged cells, then Commit import.`,
  };
  render();
  app.querySelector("#records")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function draftToVesselDraft(draft: ImportDraft): VesselDraft {
  return {
    culture_name: draft.culture_name,
    donor_identifier: draft.donor_identifier || null,
    eye: draft.eye,
    label: draft.label,
    passage_number: draft.passage_number.trim() === "" ? null : Number(draft.passage_number),
    vessel: draft.vessel,
    parent_batch_id: null,
    started_at: draft.started_at || null,
    split_date: draft.split_date || null,
    media_change_1_date: null,
    media_change_2_date: null,
    media_changes: [],
    source_record_type: draft.source_record_type,
    raw_source_identifier: draft.raw_source_identifier || null,
    pretreatment_date: draft.pretreatment_date || null,
    dissociation_date: draft.dissociation_date || null,
    ground_truth_date_field: draft.ground_truth_date_field,
    ground_truth_date: null,
    conflict_resolution: draft.conflict_resolution || null,
    status: draft.status,
  };
}

function gridImportRowToInput(row: GridDraftRow): ImportVesselInput {
  const draft = row.draft;
  const source = row.source;
  return {
    culture_name: draft.culture_name.trim() || state.cellLines[0]?.name || "Corneal endothelial culture",
    donor_identifier: draft.donor_identifier || null,
    eye: draft.eye,
    label: draft.label.trim(),
    passage_number: Number(draft.passage_number),
    vessel: draft.vessel.trim(),
    parent_batch_id: null,
    parent_label: draft.parent_label || null,
    started_at: draft.started_at,
    split_date: draft.split_date || null,
    media_change_1_date: null,
    media_change_2_date: null,
    source_record_type: draft.source_record_type,
    raw_source_identifier: draft.raw_source_identifier || null,
    pretreatment_date: draft.pretreatment_date || null,
    dissociation_date: draft.dissociation_date || null,
    ground_truth_date_field: draft.ground_truth_date_field,
    ground_truth_date: groundTruthDate({
      started_at: draft.started_at,
      pretreatment_date: draft.pretreatment_date || null,
      dissociation_date: draft.dissociation_date || null,
      ground_truth_date_field: draft.ground_truth_date_field,
    }),
    conflict_resolution: draft.conflict_resolution || null,
    raw_intake_json: source
      ? buildImportRawIntake(source.fileName, source.headers, source.cells, source.mapping, source.rowIndex)
      : "{}",
    medium: draft.medium || null,
    seeding_density: draft.seeding_density || null,
    incubator_location: draft.incubator_location || null,
    status: draft.status,
    growth_notes: draft.growth_notes || null,
    source_documentation: draft.source_documentation || null,
  };
}

async function commitImportDrafts(): Promise<void> {
  const importRows = state.grid.drafts.filter((row) => row.source);
  if (importRows.length === 0) {
    return;
  }
  importRows.forEach((row) => syncDraftFromDom(row));
  const invalid = importRows.filter((row) => draftRequiredMissing(row.draft));
  if (invalid.length > 0) {
    state.grid.flaggedOnly = true;
    state.notice = {
      tone: "error",
      message: `${invalid.length} imported row${invalid.length === 1 ? "" : "s"} still ${invalid.length === 1 ? "needs" : "need"} label, passage, flask, and seed date.`,
    };
    render();
    return;
  }
  await runMutation(`Imported ${importRows.length} record${importRows.length === 1 ? "" : "s"}.`, async () => {
    const ids = await store.importVessels(importRows.map((row) => gridImportRowToInput(row)));
    state.grid.drafts = state.grid.drafts.filter((row) => !row.source);
    state.selectedBatchId = ids[0] ?? state.selectedBatchId;
  });
}

function cancelImport(): void {
  state.importWizard = null;
  state.notice = null;
  render();
}

// ---------------------------------------------------------------------------
// Editable vessel grid
// ---------------------------------------------------------------------------
const EYE_OPTIONS: Array<[string, string]> = [
  ["OD", "OD - right"],
  ["OS", "OS - left"],
  ["OU", "OU - both/pooled"],
  ["unknown", "Unknown"],
];
const STATUS_OPTIONS: Array<[string, string]> = [
  ["active", "Active"],
  ["contaminated", "Contaminated"],
  ["frozen", "Frozen"],
  ["discarded", "Discarded"],
];
const SOURCE_TYPE_OPTIONS: Array<[string, string]> = [
  ["culture_vessel", "Culture vessel / flask"],
  ["primary_tissue_dissociation", "Primary tissue / dissociation"],
  ["mixed_source_note", "Mixed / ambiguous"],
];
const GROUND_TRUTH_OPTIONS: Array<[string, string]> = [
  ["seed_date", "Seed date"],
  ["dissociation_date", "Dissociation date"],
  ["pretreatment_date", "Pretreatment date"],
  ["unresolved", "Unresolved"],
];

interface EditorOpts {
  kind?: "select" | "textarea";
  options?: Array<[string, string]>;
  list?: string;
  type?: string;
}

function fieldFlagMessages(flags: RowFlags, field: VesselField): string[] | undefined {
  const msgs = flags.byField.get(field);
  return msgs && msgs.length > 0 ? msgs : undefined;
}

function fieldEditor(rowId: number, field: VesselField, value: string, flags: RowFlags, opts?: EditorOpts): string {
  const msgs = fieldFlagMessages(flags, field);
  const title = msgs ? ` title="${escapeHtml(msgs.join(" · "))}"` : "";
  const flagClass = msgs ? " cell-flagged" : "";
  const common = `class="grid-input${flagClass}" data-row-id="${rowId}" data-field="${field}"${title}`;
  if (opts?.kind === "select") {
    return `<select ${common}>${(opts.options ?? [])
      .map(([optValue, optLabel]) => `<option value="${escapeHtml(optValue)}" ${optValue === value ? "selected" : ""}>${escapeHtml(optLabel)}</option>`)
      .join("")}</select>`;
  }
  if (opts?.kind === "textarea") {
    return `<textarea ${common} rows="2">${escapeHtml(value)}</textarea>`;
  }
  const list = opts?.list ? ` list="${opts.list}"` : "";
  const type = opts?.type ?? "text";
  const min = type === "number" ? ` min="0"` : "";
  return `<input ${common} type="${type}"${list}${min} value="${escapeHtml(value)}" />`;
}

function gridCell(rowId: number, field: VesselField, value: string, flags: RowFlags, opts?: EditorOpts): string {
  const flagged = fieldFlagMessages(flags, field) ? " cell-flagged" : "";
  return `<td class="grid-cell${flagged}">${fieldEditor(rowId, field, value, flags, opts)}</td>`;
}

function parentSelectOptions(excludeId: number | null): Array<[string, string]> {
  return [
    ["", "— no parent —"],
    ...state.batches
      .filter((batch) => batch.id !== excludeId)
      .map((batch) => [String(batch.id), vesselOptionLabel(batch)] as [string, string]),
  ];
}

function resolveLabelToId(label: string): number | null {
  const target = label.trim().toLowerCase();
  if (!target) {
    return null;
  }
  const matches = state.batches.filter((batch) => batch.label.trim().toLowerCase() === target);
  return matches.length === 1 ? matches[0].id : null;
}

function batchToImportDraft(batch: CultureBatchView): ImportDraft {
  return {
    donor_identifier: batch.donor_identifier ?? "",
    eye: batch.eye ?? "unknown",
    culture_name: batch.cell_line_name,
    label: batch.label,
    passage_number: String(batch.passage_number),
    vessel: batch.vessel,
    started_at: batch.started_at ?? "",
    split_date: batch.split_date ?? "",
    medium: batch.medium ?? "",
    seeding_density: batch.seeding_density ?? "",
    incubator_location: batch.incubator_location ?? "",
    status: batch.status,
    source_record_type: batch.source_record_type,
    raw_source_identifier: batch.raw_source_identifier ?? "",
    pretreatment_date: batch.pretreatment_date ?? "",
    dissociation_date: batch.dissociation_date ?? "",
    ground_truth_date_field: batch.ground_truth_date_field,
    conflict_resolution: batch.conflict_resolution ?? "",
    growth_notes: batch.growth_notes ?? "",
    source_documentation: batch.source_documentation ?? "",
    parent_label: "",
  };
}

function gridPeers(): WarningPeer[] {
  const draftPeers: WarningPeer[] = state.grid.drafts.map((row) => ({
    id: row.tempId,
    label: row.draft.label,
    passage_number: row.draft.passage_number.trim() === "" ? -1 : Number(row.draft.passage_number),
    started_at: row.draft.started_at,
    donor_identifier: row.draft.donor_identifier || null,
    eye: row.draft.eye,
    raw_source_identifier: row.draft.raw_source_identifier || null,
    source_record_type: row.draft.source_record_type,
    dissociation_date: row.draft.dissociation_date || null,
  }));
  return [...state.batches, ...draftPeers];
}

function gridLeadCell(rowId: number, flags: RowFlags, expanded: boolean, badge: string | null): string {
  const caret = `<button class="icon-button grid-expand" type="button" data-row-id="${rowId}" aria-label="Toggle details"><i data-lucide="${expanded ? "chevron-down" : "chevron-right"}"></i></button>`;
  const count = flags.messages.length
    ? `<span class="warning-count" title="${escapeHtml(flags.messages.join(" · "))}">${flags.messages.length}</span>`
    : `<span class="muted">0</span>`;
  return `<td class="grid-lead">${caret}${badge ?? ""}${count}</td>`;
}

function renderGridExpandRow(rowId: number, draft: ImportDraft, flags: RowFlags, expanded: boolean): string {
  return `
    <tr class="grid-expand-row${expanded ? " open" : ""}" data-row-id="${rowId}">
      <td colspan="10">
        <div class="grid-expand-grid">
          <div class="three-col">
            <label>Culture type${fieldEditor(rowId, "culture_name", draft.culture_name, flags, { list: "culture-name-list" })}</label>
            <label>Source type${fieldEditor(rowId, "source_record_type", draft.source_record_type, flags, { kind: "select", options: SOURCE_TYPE_OPTIONS })}</label>
            <label>Ground-truth date${fieldEditor(rowId, "ground_truth_date_field", draft.ground_truth_date_field, flags, { kind: "select", options: GROUND_TRUTH_OPTIONS })}</label>
          </div>
          <div class="three-col">
            <label>Raw source ID${fieldEditor(rowId, "raw_source_identifier", draft.raw_source_identifier, flags, { list: "donor-list" })}</label>
            <label>Pretreatment date${fieldEditor(rowId, "pretreatment_date", draft.pretreatment_date, flags, { type: "date" })}</label>
            <label>Dissociation date${fieldEditor(rowId, "dissociation_date", draft.dissociation_date, flags, { type: "date" })}</label>
          </div>
          <div class="two-col">
            <label>Media type${fieldEditor(rowId, "medium", draft.medium, flags, { list: "media-list" })}</label>
            <label>Seeding density${fieldEditor(rowId, "seeding_density", draft.seeding_density, flags)}</label>
          </div>
          <div class="two-col">
            <label>Incubator location${fieldEditor(rowId, "incubator_location", draft.incubator_location, flags)}</label>
            <label>Conflict / resolution${fieldEditor(rowId, "conflict_resolution", draft.conflict_resolution, flags)}</label>
          </div>
          <label>Growth notes${fieldEditor(rowId, "growth_notes", draft.growth_notes, flags, { kind: "textarea" })}</label>
          <label>Source documentation${fieldEditor(rowId, "source_documentation", draft.source_documentation, flags, { kind: "textarea" })}</label>
        </div>
      </td>
    </tr>
  `;
}

function renderGridRowCells(rowId: number, draft: ImportDraft, flags: RowFlags, parentValue: string): string {
  return `
    ${gridCell(rowId, "donor_identifier", draft.donor_identifier, flags, { list: "donor-list" })}
    ${gridCell(rowId, "eye", draft.eye, flags, { kind: "select", options: EYE_OPTIONS })}
    ${gridCell(rowId, "label", draft.label, flags, { list: "vessel-label-list" })}
    ${gridCell(rowId, "passage_number", draft.passage_number, flags, { type: "number" })}
    ${gridCell(rowId, "vessel", draft.vessel, flags, { list: "flask-type-list" })}
    ${gridCell(rowId, "started_at", draft.started_at, flags, { type: "date" })}
    ${gridCell(rowId, "split_date", draft.split_date, flags, { type: "date" })}
    ${gridCell(rowId, "parent_batch_id", parentValue, flags, { kind: "select", options: parentSelectOptions(rowId >= 0 ? rowId : null) })}
    ${gridCell(rowId, "status", draft.status, flags, { kind: "select", options: STATUS_OPTIONS })}
  `;
}

function renderGridRow(batch: CultureBatchView, peers: WarningPeer[]): string {
  const id = batch.id;
  const draft = batchToImportDraft(batch);
  const flags = computeRowFlags(batchToVesselDraft(batch), peers, id);
  const expanded = state.grid.expanded.has(id);
  const parentValue = batch.parent_batch_id === null ? "" : String(batch.parent_batch_id);
  return `
    <tr class="grid-row${flags.messages.length ? " row-flagged" : ""}" data-grid-row="${id}">
      ${gridLeadCell(id, flags, expanded, null)}
      ${renderGridRowCells(id, draft, flags, parentValue)}
    </tr>
    ${renderGridExpandRow(id, draft, flags, expanded)}
  `;
}

function renderGridDraftRow(row: GridDraftRow, peers: WarningPeer[]): string {
  const id = row.tempId;
  const draft = row.draft;
  const flags = computeRowFlags(draftToVesselDraft(draft), peers, id);
  const expanded = state.grid.expanded.has(id);
  const resolved = resolveLabelToId(draft.parent_label);
  const parentValue = resolved === null ? "" : String(resolved);
  const badge = `<span class="mini-badge warn">${row.source ? "imported" : "new"}</span>`;
  return `
    <tr class="grid-row grid-draft-row" data-grid-row="${id}" data-draft="1">
      ${gridLeadCell(id, flags, expanded, badge)}
      ${renderGridRowCells(id, draft, flags, parentValue)}
    </tr>
    ${renderGridExpandRow(id, draft, flags, expanded)}
  `;
}

function renderVesselGrid(batches: CultureBatchView[]): string {
  if (batches.length === 0 && state.grid.drafts.length === 0) {
    return `<div class="empty-state"><i data-lucide="table-2"></i><p>No vessels match the current filters. Use "Add vessel" or Import to add records.</p></div>`;
  }
  const peers = gridPeers();
  const body = [
    ...state.grid.drafts.map((row) => renderGridDraftRow(row, peers)),
    ...batches.map((batch) => renderGridRow(batch, peers)),
  ].join("");
  return `
    <div class="table-wrap grid-wrap">
      <table id="vessel-grid" class="vessel-grid">
        <thead>
          <tr>
            <th class="grid-lead-head"></th>
            <th>Donor</th><th>Eye</th><th>Label</th><th>P</th><th>Flask</th>
            <th>Seed</th><th>Split</th><th>Parent</th><th>Status</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

// Read a committed row's current editor values (falling back to the stored batch for
// any field whose cell isn't in the DOM because the expand panel is collapsed).
function readCommittedRow(batch: CultureBatchView): { draft: VesselDraft; patch: VesselPatch | null } {
  const id = batch.id;
  const fallback = batchToImportDraft(batch);
  const read = (field: keyof ImportDraft): string => {
    const raw = readCell(id, field);
    return raw === null ? fallback[field] : raw;
  };

  const parentRaw = readCell(id, "parent_batch_id");
  const parentBatchId = parentRaw === null ? batch.parent_batch_id : parentRaw === "" ? null : Number(parentRaw);
  const eye = (read("eye") || "unknown") as Eye;
  const passageStr = read("passage_number").trim();
  const passageNumber = passageStr === "" ? null : Number(passageStr);
  const startedAt = read("started_at");
  const pretreatment = compactText(read("pretreatment_date"));
  const dissociation = compactText(read("dissociation_date"));
  const groundTruthField = read("ground_truth_date_field") as GroundTruthDateField;
  const groundTruthDateValue = groundTruthDate({
    started_at: startedAt || null,
    pretreatment_date: pretreatment,
    dissociation_date: dissociation,
    ground_truth_date_field: groundTruthField,
  });

  const draft: VesselDraft = {
    culture_name: read("culture_name"),
    donor_identifier: compactText(read("donor_identifier")),
    eye,
    label: read("label"),
    passage_number: passageNumber,
    vessel: read("vessel"),
    parent_batch_id: parentBatchId,
    started_at: startedAt || null,
    split_date: compactText(read("split_date")),
    media_change_1_date: batch.media_change_1_date,
    media_change_2_date: batch.media_change_2_date,
    media_changes: [],
    source_record_type: read("source_record_type") as SourceRecordType,
    raw_source_identifier: compactText(read("raw_source_identifier")),
    pretreatment_date: pretreatment,
    dissociation_date: dissociation,
    ground_truth_date_field: groundTruthField,
    ground_truth_date: groundTruthDateValue,
    conflict_resolution: compactText(read("conflict_resolution")),
    status: read("status") as CultureStatus,
  };

  if (!draft.label.trim() || passageNumber === null || !Number.isFinite(passageNumber) || passageNumber < 0 || !read("vessel").trim() || !startedAt) {
    return { draft, patch: null };
  }

  const patch: VesselPatch = {
    culture_name: read("culture_name").trim() || batch.cell_line_name,
    donor_identifier: draft.donor_identifier,
    eye,
    label: draft.label.trim(),
    passage_number: passageNumber,
    vessel: read("vessel").trim(),
    parent_batch_id: parentBatchId,
    started_at: startedAt,
    split_date: draft.split_date,
    source_record_type: draft.source_record_type,
    raw_source_identifier: draft.raw_source_identifier,
    pretreatment_date: pretreatment,
    dissociation_date: dissociation,
    ground_truth_date_field: groundTruthField,
    ground_truth_date: groundTruthDateValue,
    conflict_resolution: draft.conflict_resolution,
    medium: compactText(read("medium")),
    seeding_density: compactText(read("seeding_density")),
    incubator_location: compactText(read("incubator_location")),
    status: draft.status,
    growth_notes: compactText(read("growth_notes")),
    source_documentation: compactText(read("source_documentation")),
  };

  return { draft, patch };
}

function readCell(rowId: number, field: string): string | null {
  const element = app.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    `#vessel-grid [data-row-id="${rowId}"][data-field="${field}"]`,
  );
  return element ? element.value : null;
}

function gridRowIdOf(target: EventTarget | null): number | null {
  const element = target instanceof HTMLElement ? target.closest("[data-row-id]") : null;
  if (!element) {
    return null;
  }
  return Number(element.getAttribute("data-row-id"));
}

function applyRowFlags(rowId: number, flags: RowFlags): void {
  app.querySelectorAll<HTMLElement>(`#vessel-grid [data-row-id="${rowId}"][data-field]`).forEach((element) => {
    const field = element.getAttribute("data-field") as VesselField | null;
    const msgs = field ? fieldFlagMessages(flags, field) : undefined;
    element.classList.toggle("cell-flagged", Boolean(msgs));
    if (msgs) {
      element.setAttribute("title", msgs.join(" · "));
    } else {
      element.removeAttribute("title");
    }
    const cell = element.closest("td");
    if (cell) {
      cell.classList.toggle("cell-flagged", Boolean(msgs));
    }
  });

  const rowElement = app.querySelector<HTMLElement>(`.grid-row[data-grid-row="${rowId}"]`);
  if (!rowElement) {
    return;
  }
  rowElement.classList.toggle("row-flagged", flags.messages.length > 0);
  const count = rowElement.querySelector(".grid-lead .warning-count, .grid-lead .muted");
  if (count) {
    if (flags.messages.length > 0) {
      count.className = "warning-count";
      count.textContent = String(flags.messages.length);
      count.setAttribute("title", flags.messages.join(" · "));
    } else {
      count.className = "muted";
      count.textContent = "0";
      count.removeAttribute("title");
    }
  }
}

function refreshGridRowFlags(rowId: number): void {
  if (rowId >= 0) {
    const batch = state.batches.find((item) => item.id === rowId);
    if (!batch) {
      return;
    }
    applyRowFlags(rowId, computeRowFlags(readCommittedRow(batch).draft, gridPeers(), rowId));
    return;
  }
  const row = state.grid.drafts.find((item) => item.tempId === rowId);
  if (!row) {
    return;
  }
  syncDraftFromDom(row);
  applyRowFlags(rowId, computeRowFlags(draftToVesselDraft(row.draft), gridPeers(), rowId));
}

function syncDraftFromDom(row: GridDraftRow): void {
  const id = row.tempId;
  const read = (field: keyof ImportDraft): string => readCell(id, field) ?? row.draft[field];
  const parentRaw = readCell(id, "parent_batch_id");
  const parentLabel = parentRaw && parentRaw !== "" ? state.batches.find((b) => b.id === Number(parentRaw))?.label ?? row.draft.parent_label : row.draft.parent_label;
  row.draft = {
    donor_identifier: read("donor_identifier"),
    eye: (read("eye") || "unknown") as Eye,
    culture_name: read("culture_name"),
    label: read("label"),
    passage_number: read("passage_number"),
    vessel: read("vessel"),
    started_at: read("started_at"),
    split_date: read("split_date"),
    medium: read("medium"),
    seeding_density: read("seeding_density"),
    incubator_location: read("incubator_location"),
    status: (read("status") || "active") as CultureStatus,
    source_record_type: (read("source_record_type") || "culture_vessel") as SourceRecordType,
    raw_source_identifier: read("raw_source_identifier"),
    pretreatment_date: read("pretreatment_date"),
    dissociation_date: read("dissociation_date"),
    ground_truth_date_field: (read("ground_truth_date_field") || "seed_date") as GroundTruthDateField,
    conflict_resolution: read("conflict_resolution"),
    growth_notes: read("growth_notes"),
    source_documentation: read("source_documentation"),
    parent_label: parentLabel,
  };
}

async function persistCommittedRow(rowId: number): Promise<void> {
  const batch = state.batches.find((item) => item.id === rowId);
  if (!batch) {
    return;
  }
  const { patch } = readCommittedRow(batch);
  if (!patch) {
    return; // required fields missing — keep the row flagged and unsaved
  }
  try {
    await store.updateVessel(rowId, patch);
    Object.assign(batch, {
      donor_identifier: patch.donor_identifier,
      eye: patch.eye,
      label: patch.label,
      passage_number: patch.passage_number,
      vessel: patch.vessel,
      parent_batch_id: patch.parent_batch_id,
      started_at: patch.started_at,
      split_date: patch.split_date,
      status: patch.status,
      source_record_type: patch.source_record_type,
      raw_source_identifier: patch.raw_source_identifier,
      pretreatment_date: patch.pretreatment_date,
      dissociation_date: patch.dissociation_date,
      ground_truth_date_field: patch.ground_truth_date_field,
      ground_truth_date: patch.ground_truth_date,
      conflict_resolution: patch.conflict_resolution,
      medium: patch.medium,
      seeding_density: patch.seeding_density,
      incubator_location: patch.incubator_location,
      growth_notes: patch.growth_notes,
      source_documentation: patch.source_documentation,
      cell_line_name: patch.culture_name,
      notes: patch.growth_notes,
      parent_label: state.batches.find((item) => item.id === patch.parent_batch_id)?.label ?? null,
    });
  } catch (error) {
    state.notice = { tone: "error", message: error instanceof Error ? error.message : "Could not save the edit." };
    render();
  }
}

function onGridInput(event: Event): void {
  const id = gridRowIdOf(event.target);
  if (id === null) {
    return;
  }
  refreshGridRowFlags(id);
}

function onGridFocusOut(event: Event): void {
  const focusEvent = event as FocusEvent;
  const id = gridRowIdOf(focusEvent.target);
  if (id === null) {
    return;
  }
  const relatedId = gridRowIdOf(focusEvent.relatedTarget);
  if (relatedId === id) {
    return; // focus moved within the same row
  }
  if (id >= 0) {
    void persistCommittedRow(id);
    return;
  }
  const draftRow = state.grid.drafts.find((item) => item.tempId === id);
  if (draftRow && !draftRow.source) {
    void persistNewDraftRow(id); // new manual rows auto-save; imported rows wait for "Commit import"
  }
}

function onGridClick(event: Event): void {
  const target = event.target instanceof HTMLElement ? event.target : null;
  const expandButton = target?.closest(".grid-expand");
  if (!expandButton) {
    return;
  }
  const id = Number(expandButton.getAttribute("data-row-id"));
  const open = !state.grid.expanded.has(id);
  if (open) {
    state.grid.expanded.add(id);
  } else {
    state.grid.expanded.delete(id);
  }
  app.querySelector(`.grid-expand-row[data-row-id="${id}"]`)?.classList.toggle("open", open);
  expandButton.innerHTML = `<i data-lucide="${open ? "chevron-down" : "chevron-right"}"></i>`;
  createIcons({ icons });
}

function attachGridEvents(): void {
  const grid = app.querySelector<HTMLElement>("#vessel-grid");
  if (!grid) {
    return;
  }
  grid.addEventListener("input", onGridInput);
  grid.addEventListener("change", onGridInput);
  grid.addEventListener("focusout", onGridFocusOut);
  grid.addEventListener("click", onGridClick);
}

function emptyImportDraft(): ImportDraft {
  return {
    donor_identifier: "",
    eye: "unknown",
    culture_name: state.cellLines[0]?.name ?? "Corneal endothelial culture",
    label: "",
    passage_number: "",
    vessel: "",
    started_at: todayIsoDate(),
    split_date: "",
    medium: "",
    seeding_density: "",
    incubator_location: "",
    status: "active",
    source_record_type: "culture_vessel",
    raw_source_identifier: "",
    pretreatment_date: "",
    dissociation_date: "",
    ground_truth_date_field: "seed_date",
    conflict_resolution: "",
    growth_notes: "",
    source_documentation: "",
    parent_label: "",
  };
}

function nextDraftTempId(): number {
  return Math.min(0, ...state.grid.drafts.map((row) => row.tempId)) - 1;
}

function addVesselRow(): void {
  state.grid.drafts.push({ tempId: nextDraftTempId(), draft: emptyImportDraft(), source: null });
  state.notice = null;
  render();
}

function draftRequiredMissing(draft: ImportDraft): boolean {
  return (
    !draft.label.trim() ||
    draft.passage_number.trim() === "" ||
    !Number.isFinite(Number(draft.passage_number)) ||
    Number(draft.passage_number) < 0 ||
    !draft.vessel.trim() ||
    !draft.started_at
  );
}

function newDraftToCreateInput(draft: ImportDraft): CreateVesselInput {
  return {
    culture_name: draft.culture_name.trim() || state.cellLines[0]?.name || "Corneal endothelial culture",
    donor_identifier: draft.donor_identifier || null,
    eye: draft.eye,
    label: draft.label.trim(),
    passage_number: Number(draft.passage_number),
    vessel: draft.vessel.trim(),
    parent_batch_id: resolveLabelToId(draft.parent_label),
    started_at: draft.started_at,
    split_date: draft.split_date || null,
    media_change_1_date: null,
    media_change_2_date: null,
    source_record_type: draft.source_record_type,
    raw_source_identifier: draft.raw_source_identifier || null,
    pretreatment_date: draft.pretreatment_date || null,
    dissociation_date: draft.dissociation_date || null,
    ground_truth_date_field: draft.ground_truth_date_field,
    ground_truth_date: groundTruthDate({
      started_at: draft.started_at,
      pretreatment_date: draft.pretreatment_date || null,
      dissociation_date: draft.dissociation_date || null,
      ground_truth_date_field: draft.ground_truth_date_field,
    }),
    conflict_resolution: draft.conflict_resolution || null,
    raw_intake_json: JSON.stringify({ captured_at: new Date().toISOString(), source: "manual", fields: draft }, null, 2),
    medium: draft.medium || null,
    seeding_density: draft.seeding_density || null,
    incubator_location: draft.incubator_location || null,
    status: draft.status,
    growth_notes: draft.growth_notes || null,
    source_documentation: draft.source_documentation || null,
  };
}

async function persistNewDraftRow(tempId: number): Promise<void> {
  const row = state.grid.drafts.find((item) => item.tempId === tempId);
  if (!row || row.source) {
    return;
  }
  syncDraftFromDom(row);
  if (draftRequiredMissing(row.draft)) {
    return; // keep as a flagged pending row until required fields are filled
  }
  await runMutation("Vessel added.", async () => {
    const newId = await store.createVessel(newDraftToCreateInput(row.draft));
    state.grid.drafts = state.grid.drafts.filter((item) => item.tempId !== tempId);
    state.selectedBatchId = newId;
  });
}

void boot();
