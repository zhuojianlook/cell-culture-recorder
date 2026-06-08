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
}

interface ImportWizardState {
  stage: "load" | "map" | "review" | "summary";
  fileName: string;
  headers: string[];
  rows: string[][];
  mapping: ColumnMapping;
  cursor: number;
  accepted: Map<number, AcceptedImportRow>;
  skipped: Set<number>;
  rowError: string | null;
}

interface AcceptedImportRow {
  sourceIndex: number;
  input: ImportVesselInput;
  draft: ImportDraft;
  warnings: string[];
  possibleDuplicate: boolean;
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

const RAW_INTAKE_FIELDS = [
  "culture_name",
  "donor_identifier",
  "eye",
  "label",
  "passage_number",
  "vessel",
  "parent_batch_id",
  "status",
  "started_at",
  "split_date",
  "source_record_type",
  "raw_source_identifier",
  "pretreatment_date",
  "dissociation_date",
  "ground_truth_date_field",
  "conflict_resolution",
  "medium",
  "seeding_density",
  "growth_notes",
  "source_documentation",
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
};

async function boot(): Promise<void> {
  renderLoading();

  try {
    store = await createCultureStore();
    state.mode = store.mode;
    await refreshData();
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
        <div class="brand">
          <div class="brand-mark"><i data-lucide="microscope"></i></div>
          <div>
            <strong>Culture Ledger</strong>
            <span>Donor vessel tracking</span>
          </div>
        </div>

        <nav class="nav-stack" aria-label="Primary">
          <a href="#intake"><i data-lucide="clipboard-plus"></i><span>Intake</span></a>
          <a href="#import"><i data-lucide="file-up"></i><span>Import</span></a>
          <a href="#lineage"><i data-lucide="git-branch"></i><span>Lineage</span></a>
          <a href="#records"><i data-lucide="table-2"></i><span>Records</span></a>
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

        ${renderNotice()}
        ${renderDatalists()}

        <section class="stats-grid" aria-label="Overview">
          ${statCard("Donors", donorCount, "scan-text")}
          ${statCard("Vessels", state.batches.length, "flask-conical")}
          ${statCard("Active", state.batches.filter((batch) => batch.status === "active").length, "activity")}
          ${statCard("Warnings", warningCount, "triangle-alert")}
        </section>

        <section id="intake" class="intake-grid">
          ${renderVesselIntakeForm()}
          ${renderSelectedDetail(selectedBatch)}
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
            <span id="records-count" class="count-pill">${filteredBatches.length}</span>
          </div>
          <div id="records-results">
            ${renderBatchTable(filteredBatches)}
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
  updateIntakeWarnings();
  createIcons({ icons });
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

function renderVesselIntakeForm(): string {
  return `
    <form id="vessel-form" class="panel form-panel vessel-form">
      <div class="panel-header">
        <div>
          <p class="eyebrow">New or found vessel</p>
          <h2>Rapid flask intake</h2>
        </div>
        <i data-lucide="clipboard-plus"></i>
      </div>

      <div class="form-section">
        <div class="three-col">
          <label>Donor ID
            <input name="donor_identifier" list="donor-list" placeholder="6769" />
          </label>
          <label>Eye
            <select name="eye">
              <option value="OD">OD - right</option>
              <option value="OS">OS - left</option>
              <option value="OU">OU - both/pooled</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <label>Culture type
            <input name="culture_name" list="culture-name-list" value="${escapeHtml(state.cellLines[0]?.name ?? "Corneal endothelial culture")}" />
          </label>
        </div>

        <div class="three-col">
          <label>Vessel label
            <input name="label" required list="vessel-label-list" placeholder="6769 OD T75" />
          </label>
          <label>Passage
            <input name="passage_number" required type="number" min="0" value="1" />
          </label>
          <label>Flask type
            <input name="vessel" required list="flask-type-list" placeholder="T75 flask" />
          </label>
        </div>

        <div class="two-col">
          <label>Parent vessel
            <select name="parent_batch_id">
              <option value="">No known parent</option>
              ${state.batches.map((batch) => `<option value="${batch.id}">${escapeHtml(vesselOptionLabel(batch))}</option>`).join("")}
            </select>
          </label>
          <label>Status
            <select name="status">
              <option value="active">Active</option>
              <option value="contaminated">Contaminated</option>
              <option value="frozen">Frozen</option>
              <option value="discarded">Discarded</option>
            </select>
          </label>
        </div>
      </div>

      <div class="form-section provenance-section">
        <div class="section-title">
          <i data-lucide="file-warning"></i>
          <div>
            <strong>Source provenance and conflicts</strong>
            <span>Capture tissue-source dates separately from flask dates; raw inputs are retained after save.</span>
          </div>
        </div>

        <div class="three-col">
          <label>Source entry type
            <select name="source_record_type">
              <option value="culture_vessel">Culture vessel / flask</option>
              <option value="primary_tissue_dissociation">Primary tissue / dissociation</option>
              <option value="mixed_source_note">Mixed or ambiguous source note</option>
            </select>
          </label>
          <label>Raw source ID
            <input name="raw_source_identifier" list="donor-list" placeholder="6769, 6769 OD, tissue 6769" />
          </label>
          <label>Ground truth date
            <select name="ground_truth_date_field">
              <option value="seed_date">Seed date is ground truth</option>
              <option value="dissociation_date">Dissociation date is ground truth</option>
              <option value="pretreatment_date">Pretreatment date is ground truth</option>
              <option value="unresolved">Unresolved; keep raw values</option>
            </select>
          </label>
        </div>

        <div class="three-col">
          <label>Pretreatment date
            <input name="pretreatment_date" type="date" />
          </label>
          <label>Dissociation date
            <input name="dissociation_date" type="date" />
          </label>
          <label>Rename / resolution
            <input name="conflict_resolution" placeholder="e.g. tissue 6769 dissociation; flask 6769 OD P0 T25" />
          </label>
        </div>
      </div>

      <div class="form-section">
        <div class="two-col">
          <label>Seed date
            <input name="started_at" required type="date" value="${todayIsoDate()}" />
          </label>
          <label>Split date
            <input name="split_date" type="date" />
          </label>
        </div>

        <div class="media-change-editor">
          <div class="section-title compact">
            <i data-lucide="refresh-cw"></i>
            <div>
              <strong>Media changes</strong>
              <span>Add as many dated media changes as needed, each with its media type.</span>
            </div>
          </div>
          <div id="media-change-rows" class="media-change-rows">
            ${renderMediaChangeInputRow(0)}
          </div>
          <button id="add-media-change" class="button subtle" type="button">
            <i data-lucide="plus"></i>
            <span>Add media change</span>
          </button>
        </div>

        <div class="two-col">
          <label>Baseline media type
            <input name="medium" list="media-list" placeholder="F99 + 8% FBS" />
          </label>
          <label>Seeding density
            <input name="seeding_density" placeholder="1:3 split, 2.0e5 cells" />
          </label>
        </div>

        <label>Growth notes
          <textarea name="growth_notes" rows="4" placeholder="Contaminated, slow growth, confluent, poor notes from flask label"></textarea>
        </label>
        <label>Source documentation
          <textarea name="source_documentation" rows="3" placeholder="Paste the messy source note here for traceability"></textarea>
        </label>
      </div>

      <div id="intake-warnings" class="warning-box" aria-live="polite"></div>

      <button class="button primary" type="submit" ${state.saving ? "disabled" : ""}>
        <i data-lucide="save"></i>
        <span>Save vessel record</span>
      </button>
    </form>
  `;
}

function renderMediaChangeInputRow(index: number): string {
  return `
    <div class="media-change-row" data-media-change-row>
      <label>Media change date
        <input name="media_change_date" type="date" />
      </label>
      <label>Media type
        <input name="media_change_medium" list="media-list" placeholder="F99 + 8% FBS" />
      </label>
      <button class="icon-button remove-media-change" type="button" aria-label="Remove media change ${index + 1}">
        <i data-lucide="x"></i>
      </button>
    </div>
  `;
}

function renderSelectedDetail(batch: CultureBatchView | null): string {
  if (!batch) {
    return `
      <div class="panel detail-panel">
        <div class="empty-state">
          <i data-lucide="flask-conical"></i>
          <p>Select or save a vessel to inspect logic warnings and metadata.</p>
        </div>
      </div>
    `;
  }

  const warnings = buildBatchWarnings(batch);

  return `
    <aside class="panel detail-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">${escapeHtml(formatDonorEye(batch))}</p>
          <h2>${escapeHtml(batch.label)}</h2>
        </div>
        ${statusBadge(batch.status)}
      </div>

      <dl class="detail-grid">
        <div><dt>Culture</dt><dd>${escapeHtml(batch.cell_line_name)}</dd></div>
        <div><dt>Passage</dt><dd>P${batch.passage_number}</dd></div>
        <div><dt>Flask</dt><dd>${escapeHtml(batch.vessel)}</dd></div>
        <div><dt>Parent</dt><dd>${escapeHtml(batch.parent_label ?? "None recorded")}</dd></div>
        <div><dt>Media type</dt><dd>${escapeHtml(batch.medium ?? "Not recorded")}</dd></div>
        <div><dt>Seeding density</dt><dd>${escapeHtml(batch.seeding_density ?? "Not recorded")}</dd></div>
        <div><dt>Seed</dt><dd>${escapeHtml(displayDate(batch.started_at))}</dd></div>
        <div><dt>Split</dt><dd>${escapeHtml(displayDate(batch.split_date))}</dd></div>
        <div><dt>Source type</dt><dd>${escapeHtml(sourceRecordLabel(batch.source_record_type))}</dd></div>
        <div><dt>Raw source ID</dt><dd>${escapeHtml(batch.raw_source_identifier ?? "Not captured")}</dd></div>
        <div><dt>Pretreatment</dt><dd>${escapeHtml(displayDate(batch.pretreatment_date))}</dd></div>
        <div><dt>Dissociation</dt><dd>${escapeHtml(displayDate(batch.dissociation_date))}</dd></div>
        <div><dt>Ground truth</dt><dd>${escapeHtml(groundTruthLabel(batch.ground_truth_date_field))}</dd></div>
        <div><dt>Ground truth date</dt><dd>${escapeHtml(displayDate(batch.ground_truth_date))}</dd></div>
      </dl>

      ${warnings.length > 0 ? renderWarningList(warnings, "Logic warnings") : `<div class="ok-box"><i data-lucide="circle-check"></i><span>No lineage/date warnings for this vessel.</span></div>`}

      <div class="note-block">
        <strong>Conflict resolution</strong>
        <p>${escapeHtml(batch.conflict_resolution ?? "No explicit ground-truth note recorded.")}</p>
      </div>
      <div class="note-block">
        <strong>Growth notes</strong>
        <p>${escapeHtml(batch.growth_notes ?? batch.notes ?? "No notes recorded.")}</p>
      </div>
      <div class="note-block">
        <strong>Source documentation</strong>
        <p>${escapeHtml(batch.source_documentation ?? "No source text captured.")}</p>
      </div>
      <div class="note-block raw-input-block">
        <strong>Raw intake snapshot</strong>
        <pre>${escapeHtml(prettyRawIntake(batch.raw_intake_json))}</pre>
      </div>
    </aside>
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

function renderBatchTable(batches: CultureBatchView[]): string {
  if (batches.length === 0) {
    return `
      <div class="empty-state">
        <i data-lucide="flask-conical"></i>
        <p>No records match the current filters.</p>
      </div>
    `;
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Vessel</th>
            <th>Donor</th>
            <th>Passage</th>
            <th>Dates</th>
            <th>Status</th>
            <th>Warnings</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${batches.map(renderBatchRow).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderBatchRow(batch: CultureBatchView): string {
  const warnings = buildBatchWarnings(batch);

  return `
    <tr class="${batch.id === state.selectedBatchId ? "selected-row" : ""}">
      <td>
        <strong>${escapeHtml(batch.label)}</strong>
        <span>${escapeHtml(batch.vessel)}${batch.parent_label ? ` / from ${escapeHtml(batch.parent_label)}` : ""}</span>
      </td>
      <td>
        <strong>${escapeHtml(batch.donor_identifier ?? "Unknown donor")}</strong>
        <span>${escapeHtml(eyeLabel(batch.eye))}</span>
      </td>
      <td>P${batch.passage_number}</td>
      <td>
        <strong>Seed ${escapeHtml(displayDate(batch.started_at))}</strong>
        <span>${batch.split_date ? `Split ${escapeHtml(displayDate(batch.split_date))}` : "No split date"}</span>
      </td>
      <td>${statusBadge(batch.status)}</td>
      <td>${warnings.length > 0 ? `<span class="warning-count table-warning">${warnings.length}</span>` : `<span class="muted">0</span>`}</td>
      <td>
        <button class="icon-button select-batch" type="button" data-batch-id="${batch.id}" aria-label="Select ${escapeHtml(batch.label)}">
          <i data-lucide="arrow-right"></i>
        </button>
      </td>
    </tr>
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
  const vesselForm = app.querySelector<HTMLFormElement>("#vessel-form");
  vesselForm?.addEventListener("submit", handleVesselSubmit);
  vesselForm?.addEventListener("input", updateIntakeWarnings);
  vesselForm?.addEventListener("change", updateIntakeWarnings);
  app.querySelector<HTMLButtonElement>("#add-media-change")?.addEventListener("click", addMediaChangeRow);
  attachMediaChangeRemoveEvents();

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
  app.querySelector<HTMLInputElement>("#restore-file")?.addEventListener("change", restoreFromFile);

  attachBatchSelectionEvents();
  attachImportEvents();

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
    recordsResults.innerHTML = renderBatchTable(filteredBatches);
  }

  attachBatchSelectionEvents();
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

function addMediaChangeRow(): void {
  const rows = app.querySelector<HTMLDivElement>("#media-change-rows");
  if (!rows) {
    return;
  }

  rows.insertAdjacentHTML("beforeend", renderMediaChangeInputRow(rows.querySelectorAll("[data-media-change-row]").length));
  attachMediaChangeRemoveEvents();
  updateIntakeWarnings();
  createIcons({ icons });
}

function attachMediaChangeRemoveEvents(): void {
  app.querySelectorAll<HTMLButtonElement>(".remove-media-change").forEach((button) => {
    if (button.dataset.bound === "true") {
      return;
    }
    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      button.closest("[data-media-change-row]")?.remove();
      updateIntakeWarnings();
    });
  });
}

async function handleVesselSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  try {
    const data = new FormData(form);
    const mediaChanges = readMediaChanges(data);

    mediaChanges.forEach((change, index) => {
      if (!change.date || !change.medium) {
        throw new Error(`Media change ${index + 1} needs both a date and a media type.`);
      }
    });

    const input: CreateVesselInput = {
      culture_name: requiredText(data.get("culture_name"), "Culture type"),
      donor_identifier: compactText(data.get("donor_identifier")),
      eye: (compactText(data.get("eye")) ?? "unknown") as Eye,
      label: requiredText(data.get("label"), "Vessel label"),
      passage_number: requiredNumber(data.get("passage_number"), "Passage"),
      vessel: requiredText(data.get("vessel"), "Flask type"),
      parent_batch_id: nullableNumber(data.get("parent_batch_id")),
      started_at: requiredText(data.get("started_at"), "Seed date"),
      split_date: compactText(data.get("split_date")),
      media_change_1_date: null,
      media_change_2_date: null,
      source_record_type: (compactText(data.get("source_record_type")) ?? "culture_vessel") as SourceRecordType,
      raw_source_identifier: compactText(data.get("raw_source_identifier")),
      pretreatment_date: compactText(data.get("pretreatment_date")),
      dissociation_date: compactText(data.get("dissociation_date")),
      ground_truth_date_field: (compactText(data.get("ground_truth_date_field")) ?? "seed_date") as GroundTruthDateField,
      ground_truth_date: null,
      conflict_resolution: compactText(data.get("conflict_resolution")),
      raw_intake_json: buildRawIntakeJson(data),
      medium: compactText(data.get("medium")),
      seeding_density: compactText(data.get("seeding_density")),
      incubator_location: null,
      status: (compactText(data.get("status")) ?? "active") as CultureStatus,
      growth_notes: compactText(data.get("growth_notes")),
      source_documentation: compactText(data.get("source_documentation")),
    };
    input.ground_truth_date = groundTruthDate(input);

    await runMutation("Vessel record saved.", async () => {
      const id = await store.createVessel(input);
      for (const change of mediaChanges) {
        if (!change.date || !change.medium) {
          continue;
        }
        await store.recordEvent({
          batch_id: id,
          event_type: "media_change",
          event_at: change.date,
          confluence_percent: null,
          viability_percent: null,
          split_ratio: null,
          medium: change.medium,
          reagent_lot: null,
          operator: null,
          notes: "Media change entered during vessel intake.",
          next_status: null,
          next_passage_number: null,
        });
      }
      form.reset();
      state.selectedBatchId = id;
    });
  } catch (error) {
    state.notice = {
      tone: "error",
      message: error instanceof Error ? error.message : "The vessel entry is incomplete.",
    };
    render();
  }
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
        warnings: buildBatchWarnings(batch).join(" | "),
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

async function checkForUpdates(): Promise<void> {
  if (!isTauriRuntime()) {
    state.notice = {
      tone: "info",
      message: "In-app updates are available in the native Tauri app, not the browser preview.",
    };
    render();
    return;
  }

  state.notice = { tone: "info", message: "Checking for signed app updates..." };
  render();

  try {
    const update = await check({ timeout: 15000 });
    if (!update) {
      state.notice = { tone: "success", message: "Cell Culture Recorder is up to date." };
      render();
      return;
    }

    const approved = window.confirm(
      `Install Cell Culture Recorder ${update.version}? The app will restart after the update is installed.`,
    );
    if (!approved) {
      state.notice = { tone: "info", message: `Update ${update.version} is available but was not installed.` };
      render();
      return;
    }

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
    state.notice = {
      tone: "error",
      message: error instanceof Error ? error.message : "Could not check for updates.",
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

function updateIntakeWarnings(): void {
  const form = app.querySelector<HTMLFormElement>("#vessel-form");
  const target = app.querySelector<HTMLDivElement>("#intake-warnings");
  if (!form || !target) {
    return;
  }

  const warnings = buildDraftWarnings(readVesselDraft(form), state.batches);
  target.innerHTML =
    warnings.length > 0
      ? renderWarningList(warnings, "Check before saving")
      : `<div class="ok-box"><i data-lucide="circle-check"></i><span>No logic warnings for the current entry.</span></div>`;
  createIcons({ icons });
}

function readVesselDraft(form: HTMLFormElement): VesselDraft {
  const data = new FormData(form);
  const startedAt = compactText(data.get("started_at"));
  const pretreatmentDate = compactText(data.get("pretreatment_date"));
  const dissociationDate = compactText(data.get("dissociation_date"));
  const groundTruthField = (compactText(data.get("ground_truth_date_field")) ?? "seed_date") as GroundTruthDateField;
  const mediaChanges = readMediaChanges(data);

  return {
    culture_name: compactText(data.get("culture_name")) ?? "",
    donor_identifier: compactText(data.get("donor_identifier")),
    eye: (compactText(data.get("eye")) ?? "unknown") as Eye,
    label: compactText(data.get("label")) ?? "",
    passage_number: nullableNumber(data.get("passage_number")),
    vessel: compactText(data.get("vessel")) ?? "",
    parent_batch_id: nullableNumber(data.get("parent_batch_id")),
    started_at: startedAt,
    split_date: compactText(data.get("split_date")),
    media_change_1_date: mediaChanges[0]?.date ?? null,
    media_change_2_date: mediaChanges[1]?.date ?? null,
    media_changes: mediaChanges,
    source_record_type: (compactText(data.get("source_record_type")) ?? "culture_vessel") as SourceRecordType,
    raw_source_identifier: compactText(data.get("raw_source_identifier")),
    pretreatment_date: pretreatmentDate,
    dissociation_date: dissociationDate,
    ground_truth_date_field: groundTruthField,
    ground_truth_date: groundTruthDate({
      started_at: startedAt,
      pretreatment_date: pretreatmentDate,
      dissociation_date: dissociationDate,
      ground_truth_date_field: groundTruthField,
    }),
    conflict_resolution: compactText(data.get("conflict_resolution")),
    status: (compactText(data.get("status")) ?? "active") as CultureStatus,
  };
}

function buildRawIntakeJson(data: FormData): string {
  const fields = Object.fromEntries(
    RAW_INTAKE_FIELDS.map((field) => [field, compactText(data.get(field)) ?? ""]),
  );
  const mediaChanges = readMediaChanges(data);

  return JSON.stringify(
    {
      captured_at: new Date().toISOString(),
      fields,
      media_changes: mediaChanges,
    },
    null,
    2,
  );
}

function readMediaChanges(data: FormData): MediaChangeDraft[] {
  const dates = data.getAll("media_change_date");
  const media = data.getAll("media_change_medium");
  const count = Math.max(dates.length, media.length);
  const changes: MediaChangeDraft[] = [];

  for (let index = 0; index < count; index += 1) {
    const change = {
      date: compactText(dates[index] ?? null),
      medium: compactText(media[index] ?? null),
    };
    if (change.date || change.medium) {
      changes.push(change);
    }
  }

  return changes;
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

function buildBatchWarnings(batch: CultureBatchView): string[] {
  return buildDraftWarnings(
    {
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
    },
    state.batches,
    batch.id,
  );
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

function buildDraftWarnings(draft: VesselDraft, allBatches: WarningPeer[], ignoreBatchId?: number): string[] {
  const warnings: string[] = [];
  const label = draft.label.trim().toLowerCase();
  const donor = draft.donor_identifier?.trim().toLowerCase() ?? "";
  const peers = allBatches.filter((batch) => batch.id !== ignoreBatchId);

  if (!draft.donor_identifier) {
    warnings.push("No donor ID entered; the vessel will be grouped under unknown donor.");
  }

  if (label) {
    const duplicates = peers.filter((batch) => batch.label.trim().toLowerCase() === label);
    if (duplicates.length > 0) {
      warnings.push(
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
      warnings.push(`Selected parent is P${parent.passage_number}; child passage should usually be higher.`);
    }
    if (draft.started_at && dateMs(draft.started_at) < dateMs(parent.started_at)) {
      warnings.push("Seed date is before the selected parent vessel seed date.");
    }
    if (draft.donor_identifier && parent.donor_identifier && donor !== parent.donor_identifier.toLowerCase()) {
      warnings.push(`Selected parent donor (${parent.donor_identifier}) does not match this donor.`);
    }
    if (draft.eye !== "unknown" && parent.eye && parent.eye !== "unknown" && draft.eye !== parent.eye) {
      warnings.push(`Selected parent eye (${eyeLabel(parent.eye)}) does not match this eye.`);
    }
  }

  if (draft.started_at && draft.split_date && dateMs(draft.split_date) < dateMs(draft.started_at)) {
    warnings.push("Split date is before seed date.");
  }

  draft.media_changes.forEach((change, index) => {
    const label = `media change ${index + 1}`;
    if (change.date && !change.medium) {
      warnings.push(`${label} has a date but no media type.`);
    }
    if (!change.date && change.medium) {
      warnings.push(`${label} has a media type but no date.`);
    }
    if (draft.started_at && change.date && dateMs(change.date) < dateMs(draft.started_at)) {
      warnings.push(`${label} is before seed date.`);
    }
    const previous = draft.media_changes[index - 1];
    if (previous?.date && change.date && dateMs(change.date) < dateMs(previous.date)) {
      warnings.push(`${label} is before media change ${index}.`);
    }
  });

  if (draft.media_change_1_date && draft.media_change_2_date && dateMs(draft.media_change_2_date) < dateMs(draft.media_change_1_date)) {
    warnings.push("Media change 2 is before media change 1.");
  }

  if (draft.source_record_type === "primary_tissue_dissociation" && draft.vessel) {
    warnings.push(
      "This entry is marked as primary tissue/dissociation but also has a flask type. Consider saving the tissue source and P0 flask as separate records if their dates differ.",
    );
  }

  if (draft.passage_number === 0 && draft.started_at && draft.dissociation_date && !sameDate(draft.started_at, draft.dissociation_date)) {
    warnings.push(
      `P0 seed date (${displayDate(draft.started_at)}) differs from dissociation date (${displayDate(
        draft.dissociation_date,
      )}). Choose a ground-truth date and keep the other date as raw provenance.`,
    );
  }

  if (draft.ground_truth_date_field === "dissociation_date" && !draft.dissociation_date) {
    warnings.push("Dissociation date is selected as ground truth, but no dissociation date is entered.");
  }

  if (draft.ground_truth_date_field === "pretreatment_date" && !draft.pretreatment_date) {
    warnings.push("Pretreatment date is selected as ground truth, but no pretreatment date is entered.");
  }

  if (draft.ground_truth_date_field === "unresolved" && !draft.conflict_resolution) {
    warnings.push("Ground truth is unresolved. Add a rename/resolution note so the ambiguity is traceable.");
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
        warnings.push(
          `Raw source ID already appears as ${sourceRecordLabel(batch.source_record_type)} on "${batch.label}". Suggested rename: ${suggestedLabel}.`,
        );
      }

      if (
        draft.dissociation_date &&
        batch.dissociation_date &&
        !sameDate(draft.dissociation_date, batch.dissociation_date)
      ) {
        warnings.push(
          `Dissociation date differs from existing raw-source match "${batch.label}" (${displayDate(batch.dissociation_date)}).`,
        );
      }

      if (
        draft.passage_number === batch.passage_number &&
        draft.started_at &&
        batch.started_at &&
        !sameDate(draft.started_at, batch.started_at)
      ) {
        warnings.push(
          `Same raw source and passage as "${batch.label}", but seed dates differ (${displayDate(batch.started_at)} vs ${displayDate(
            draft.started_at,
          )}). Keep one as ground truth and note whether one field should be renamed.`,
        );
      }

      if (
        draft.passage_number === 0 &&
        draft.dissociation_date &&
        batch.passage_number === 0 &&
        batch.started_at &&
        !sameDate(draft.dissociation_date, batch.started_at)
      ) {
        warnings.push(
          `Dissociation date does not match existing P0 seed date for "${batch.label}". Suggested rename: ${suggestedLabel}.`,
        );
      }
    });
  }

  if (draft.donor_identifier && draft.passage_number !== null && draft.started_at) {
    const draftPassage = draft.passage_number;
    const donorPeers = peers.filter(
      (batch) =>
        (batch.donor_identifier ?? "").toLowerCase() === donor &&
        (batch.eye ?? "unknown") === draft.eye,
    );

    donorPeers.forEach((batch) => {
      const batchDate = dateMs(batch.started_at);
      const draftDate = dateMs(draft.started_at);
      if (batch.passage_number < draftPassage && batchDate > draftDate) {
        warnings.push(
          `P${draftPassage} date is before existing P${batch.passage_number} vessel "${batch.label}".`,
        );
      }
      if (batch.passage_number > draftPassage && batchDate < draftDate) {
        warnings.push(
          `Existing P${batch.passage_number} vessel "${batch.label}" is dated before this lower passage.`,
        );
      }
    });
  }

  return Array.from(new Set(warnings));
}

function renderWarningList(warnings: string[], title: string): string {
  return `
    <div class="warning-list">
      <strong><i data-lucide="triangle-alert"></i>${escapeHtml(title)}</strong>
      <ul>${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>
    </div>
  `;
}

function getFilteredBatches(): CultureBatchView[] {
  const search = state.search.trim().toLowerCase();

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

    return matchesSearch && matchesStatus && matchesDonor;
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

function prettyRawIntake(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
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
  if (!wiz) {
    return renderImportLoad();
  }
  if (wiz.stage === "map") {
    return renderImportMapping(wiz);
  }
  if (wiz.stage === "review") {
    return renderImportReview(wiz);
  }
  return renderImportSummary(wiz);
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
        The first row must be column headers. You then review every row one at a time, checking the
        parsed record against the original line — nothing is saved until you confirm it.
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
      <button id="import-start-review" class="button primary" type="button">
        <i data-lucide="arrow-right"></i><span>Start row-by-row review</span>
      </button>
    </div>
  `;
}

function renderImportReview(wiz: ImportWizardState): string {
  const draft = currentImportDraft(wiz);
  const cells = wiz.rows[wiz.cursor];
  const rowStatus = wiz.accepted.has(wiz.cursor) ? "confirmed" : wiz.skipped.has(wiz.cursor) ? "skipped" : "pending";

  const rawRows = wiz.headers
    .map(
      (header, index) =>
        `<div><dt>${escapeHtml(header || `Column ${index + 1}`)}</dt><dd>${escapeHtml(cells[index] ?? "")}</dd></div>`,
    )
    .join("");

  const flags = renderImportRowFlags(
    buildDraftWarnings(draftToVesselDraft(draft), importPeers(wiz.cursor)),
    isPossibleDuplicate(draft),
    draft,
  );

  return `
    <div class="panel-header">
      <div>
        <p class="eyebrow">${escapeHtml(wiz.fileName)}</p>
        <h2>Review row ${wiz.cursor + 1} of ${wiz.rows.length}</h2>
      </div>
      <div class="import-progress">
        <span class="mini-badge ok">${wiz.accepted.size} confirmed</span>
        <span class="mini-badge">${wiz.skipped.size} skipped</span>
        <button id="import-cancel" class="button subtle" type="button"><i data-lucide="x"></i><span>Cancel</span></button>
      </div>
    </div>

    <div class="import-grid">
      <aside class="raw-line">
        <div class="section-title compact">
          <i data-lucide="file-text"></i>
          <div><strong>Raw source line</strong><span>File row ${wiz.cursor + 2}${rowStatus !== "pending" ? ` / ${rowStatus}` : ""}</span></div>
        </div>
        <dl class="detail-grid raw-grid">${rawRows}</dl>
      </aside>

      <form id="import-row-form" class="form-section import-fields">
        ${renderImportFields(draft)}
        <div id="import-row-warnings" class="import-flags">${flags}</div>
        ${wiz.rowError ? `<div class="notice error"><i data-lucide="circle-alert"></i><span>${escapeHtml(wiz.rowError)}</span></div>` : ""}
        <div class="import-actions">
          <button id="import-back" class="button subtle" type="button" ${wiz.cursor === 0 ? "disabled" : ""}>
            <i data-lucide="arrow-left"></i><span>Back</span>
          </button>
          <button id="import-skip" class="button" type="button"><i data-lucide="skip-forward"></i><span>Skip row</span></button>
          <button id="import-confirm" class="button primary" type="submit"><i data-lucide="check"></i><span>Confirm &amp; next</span></button>
        </div>
      </form>
    </div>
  `;
}

function renderImportFields(draft: ImportDraft): string {
  return `
    <div class="three-col">
      <label>Donor ID<input name="donor_identifier" list="donor-list" value="${escapeHtml(draft.donor_identifier)}" /></label>
      <label>Eye${selectField("eye", draft.eye, [["OD", "OD - right"], ["OS", "OS - left"], ["OU", "OU - both/pooled"], ["unknown", "Unknown"]])}</label>
      <label>Culture type<input name="culture_name" list="culture-name-list" value="${escapeHtml(draft.culture_name)}" /></label>
    </div>
    <div class="three-col">
      <label>Vessel label <span class="req">*</span><input name="label" list="vessel-label-list" value="${escapeHtml(draft.label)}" /></label>
      <label>Passage <span class="req">*</span><input name="passage_number" type="number" min="0" value="${escapeHtml(draft.passage_number)}" /></label>
      <label>Flask type <span class="req">*</span><input name="vessel" list="flask-type-list" value="${escapeHtml(draft.vessel)}" /></label>
    </div>
    <div class="three-col">
      <label>Seed date <span class="req">*</span><input name="started_at" type="date" value="${escapeHtml(draft.started_at)}" /></label>
      <label>Split date<input name="split_date" type="date" value="${escapeHtml(draft.split_date)}" /></label>
      <label>Parent vessel label<input name="parent_label" list="vessel-label-list" value="${escapeHtml(draft.parent_label)}" /></label>
    </div>
    <div class="three-col">
      <label>Status${selectField("status", draft.status, [["active", "Active"], ["contaminated", "Contaminated"], ["frozen", "Frozen"], ["discarded", "Discarded"]])}</label>
      <label>Source type${selectField("source_record_type", draft.source_record_type, [["culture_vessel", "Culture vessel / flask"], ["primary_tissue_dissociation", "Primary tissue / dissociation"], ["mixed_source_note", "Mixed / ambiguous"]])}</label>
      <label>Ground-truth date${selectField("ground_truth_date_field", draft.ground_truth_date_field, [["seed_date", "Seed date"], ["dissociation_date", "Dissociation date"], ["pretreatment_date", "Pretreatment date"], ["unresolved", "Unresolved"]])}</label>
    </div>
    <div class="three-col">
      <label>Raw source ID<input name="raw_source_identifier" list="donor-list" value="${escapeHtml(draft.raw_source_identifier)}" /></label>
      <label>Pretreatment date<input name="pretreatment_date" type="date" value="${escapeHtml(draft.pretreatment_date)}" /></label>
      <label>Dissociation date<input name="dissociation_date" type="date" value="${escapeHtml(draft.dissociation_date)}" /></label>
    </div>
    <div class="two-col">
      <label>Media type<input name="medium" list="media-list" value="${escapeHtml(draft.medium)}" /></label>
      <label>Seeding density<input name="seeding_density" value="${escapeHtml(draft.seeding_density)}" /></label>
    </div>
    <div class="two-col">
      <label>Incubator location<input name="incubator_location" value="${escapeHtml(draft.incubator_location)}" /></label>
      <label>Conflict / resolution note<input name="conflict_resolution" value="${escapeHtml(draft.conflict_resolution)}" /></label>
    </div>
    <label>Growth notes<textarea name="growth_notes" rows="2">${escapeHtml(draft.growth_notes)}</textarea></label>
    <label>Source documentation<textarea name="source_documentation" rows="2">${escapeHtml(draft.source_documentation)}</textarea></label>
  `;
}

function selectField(name: string, selected: string, options: Array<[string, string]>): string {
  return `<select name="${name}">${options
    .map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`)
    .join("")}</select>`;
}

function renderImportRowFlags(warnings: string[], duplicate: boolean, draft: ImportDraft): string {
  const parent = previewParentStatus(draft, state.importWizard?.cursor ?? -1);
  const badges = [
    duplicate ? `<span class="mini-badge warn">Possible duplicate of an existing vessel</span>` : "",
    parent,
  ]
    .filter(Boolean)
    .join(" ");
  const warningBlock =
    warnings.length > 0
      ? renderWarningList(warnings, "Check before confirming")
      : `<div class="ok-box"><i data-lucide="circle-check"></i><span>No logic warnings for this row.</span></div>`;
  return `${badges ? `<div class="import-badges">${badges}</div>` : ""}${warningBlock}`;
}

function previewParentStatus(draft: ImportDraft, excludeIndex: number): string {
  const target = draft.parent_label.trim().toLowerCase();
  if (!target) {
    return "";
  }
  let matches = state.batches.filter((batch) => batch.label.trim().toLowerCase() === target).length;
  state.importWizard?.accepted.forEach((row) => {
    if (row.sourceIndex !== excludeIndex && row.input.label.trim().toLowerCase() === target) {
      matches += 1;
    }
  });
  if (matches === 0) {
    return `<span class="mini-badge warn">Parent "${escapeHtml(draft.parent_label)}" not found yet</span>`;
  }
  if (matches > 1) {
    return `<span class="mini-badge warn">Parent "${escapeHtml(draft.parent_label)}" is ambiguous (${matches} matches)</span>`;
  }
  return `<span class="mini-badge ok">Parent &rarr; ${escapeHtml(draft.parent_label)}</span>`;
}

function renderImportSummary(wiz: ImportWizardState): string {
  const accepted = Array.from(wiz.accepted.values()).sort((a, b) => a.sourceIndex - b.sourceIndex);
  const withWarnings = accepted.filter((row) => row.warnings.length > 0).length;
  const dups = accepted.filter((row) => row.possibleDuplicate).length;

  const rows = accepted
    .map(
      (row) => `
      <tr>
        <td>
          <strong>${escapeHtml(row.input.label)}</strong>
          <span>${escapeHtml(row.input.donor_identifier ?? "Unknown donor")} ${escapeHtml(eyeLabel(row.input.eye))} / P${row.input.passage_number}</span>
        </td>
        <td>${escapeHtml(displayDate(row.input.started_at))}</td>
        <td>
          ${row.possibleDuplicate ? `<span class="mini-badge warn">dup?</span>` : ""}
          ${row.warnings.length > 0 ? `<span class="warning-count">${row.warnings.length}</span>` : `<span class="muted">0</span>`}
        </td>
      </tr>`,
    )
    .join("");

  return `
    <div class="panel-header">
      <div>
        <p class="eyebrow">${escapeHtml(wiz.fileName)}</p>
        <h2>Ready to import</h2>
      </div>
      <button id="import-cancel" class="button subtle" type="button"><i data-lucide="x"></i><span>Cancel</span></button>
    </div>
    <div class="form-section">
      <div class="import-summary-stats">
        <span class="mini-badge ok">${accepted.length} to import</span>
        <span class="mini-badge">${wiz.skipped.size} skipped</span>
        ${withWarnings > 0 ? `<span class="warning-count">${withWarnings} with warnings</span>` : ""}
        ${dups > 0 ? `<span class="mini-badge warn">${dups} possible duplicates</span>` : ""}
      </div>
      ${
        accepted.length === 0
          ? `<div class="empty-state"><i data-lucide="inbox"></i><p>No rows were confirmed. Go back to review them.</p></div>`
          : `<div class="table-wrap"><table><thead><tr><th>Vessel</th><th>Seed</th><th>Flags</th></tr></thead><tbody>${rows}</tbody></table></div>`
      }
      <div class="import-actions">
        <button id="import-review-again" class="button subtle" type="button"><i data-lucide="arrow-left"></i><span>Back to review</span></button>
        <button id="import-commit" class="button primary" type="button" ${accepted.length === 0 ? "disabled" : ""}>
          <i data-lucide="database-backup"></i><span>Import ${accepted.length} record${accepted.length === 1 ? "" : "s"}</span>
        </button>
      </div>
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

  if (wiz.stage === "map") {
    app.querySelectorAll<HTMLSelectElement>("[data-map-field]").forEach((select) => {
      select.addEventListener("change", () => {
        const key = select.dataset.mapField as ImportFieldKey;
        wiz.mapping[key] = select.value === "" ? null : Number(select.value);
      });
    });
    app.querySelector<HTMLButtonElement>("#import-start-review")?.addEventListener("click", startImportReview);
  }

  if (wiz.stage === "review") {
    const form = app.querySelector<HTMLFormElement>("#import-row-form");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      confirmImportRow(form);
    });
    form?.addEventListener("input", updateImportRowWarnings);
    form?.addEventListener("change", updateImportRowWarnings);
    app.querySelector<HTMLButtonElement>("#import-skip")?.addEventListener("click", skipImportRow);
    app.querySelector<HTMLButtonElement>("#import-back")?.addEventListener("click", importRowBack);
  }

  if (wiz.stage === "summary") {
    app.querySelector<HTMLButtonElement>("#import-commit")?.addEventListener("click", commitImport);
    app.querySelector<HTMLButtonElement>("#import-review-again")?.addEventListener("click", () => {
      wiz.stage = "review";
      wiz.cursor = Math.max(0, wiz.rows.length - 1);
      render();
    });
  }
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
    state.importWizard = {
      stage: "map",
      fileName: file.name,
      headers,
      rows,
      mapping: autoMap(headers),
      cursor: 0,
      accepted: new Map(),
      skipped: new Set(),
      rowError: null,
    };
    state.notice = null;
    render();
  } catch (error) {
    state.notice = { tone: "error", message: error instanceof Error ? error.message : "Could not read that file." };
    render();
  }
}

function startImportReview(): void {
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
  wiz.stage = "review";
  wiz.cursor = 0;
  state.notice = null;
  render();
}

function currentImportDraft(wiz: ImportWizardState): ImportDraft {
  return wiz.accepted.get(wiz.cursor)?.draft ?? rowToDraft(wiz.rows[wiz.cursor], wiz.mapping);
}

function readImportRowForm(form: HTMLFormElement): ImportDraft {
  const data = new FormData(form);
  const text = (name: string): string => compactText(data.get(name)) ?? "";
  return {
    donor_identifier: text("donor_identifier"),
    eye: (compactText(data.get("eye")) ?? "unknown") as Eye,
    culture_name: text("culture_name"),
    label: text("label"),
    passage_number: text("passage_number"),
    vessel: text("vessel"),
    started_at: text("started_at"),
    split_date: text("split_date"),
    medium: text("medium"),
    seeding_density: text("seeding_density"),
    incubator_location: text("incubator_location"),
    status: (compactText(data.get("status")) ?? "active") as CultureStatus,
    source_record_type: (compactText(data.get("source_record_type")) ?? "culture_vessel") as SourceRecordType,
    raw_source_identifier: text("raw_source_identifier"),
    pretreatment_date: text("pretreatment_date"),
    dissociation_date: text("dissociation_date"),
    ground_truth_date_field: (compactText(data.get("ground_truth_date_field")) ?? "seed_date") as GroundTruthDateField,
    conflict_resolution: text("conflict_resolution"),
    growth_notes: text("growth_notes"),
    source_documentation: text("source_documentation"),
    parent_label: text("parent_label"),
  };
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

function importDraftToInput(draft: ImportDraft, sourceIndex: number): ImportVesselInput {
  const wiz = state.importWizard;
  const label = draft.label.trim();
  if (!label) {
    throw new Error("Vessel label is required.");
  }
  if (draft.passage_number.trim() === "") {
    throw new Error("Passage is required.");
  }
  const passage = Number(draft.passage_number);
  if (!Number.isFinite(passage) || passage < 0) {
    throw new Error("Passage must be a whole number of 0 or more.");
  }
  if (!draft.vessel.trim()) {
    throw new Error("Flask type is required.");
  }
  if (!draft.started_at.trim()) {
    throw new Error("Seed date is required — confirm it against the raw line.");
  }

  return {
    culture_name: draft.culture_name.trim() || state.cellLines[0]?.name || "Corneal endothelial culture",
    donor_identifier: draft.donor_identifier || null,
    eye: draft.eye,
    label,
    passage_number: passage,
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
    raw_intake_json: wiz
      ? buildImportRawIntake(wiz.fileName, wiz.headers, wiz.rows[sourceIndex], wiz.mapping, sourceIndex)
      : "{}",
    medium: draft.medium || null,
    seeding_density: draft.seeding_density || null,
    incubator_location: draft.incubator_location || null,
    status: draft.status,
    growth_notes: draft.growth_notes || null,
    source_documentation: draft.source_documentation || null,
  };
}

function isPossibleDuplicate(draft: ImportDraft): boolean {
  const sourceId = normalizeSourceId(draft.raw_source_identifier || draft.donor_identifier);
  if (!sourceId) {
    return false;
  }
  const passage = draft.passage_number.trim() === "" ? null : Number(draft.passage_number);
  return state.batches.some(
    (batch) =>
      normalizeSourceId(batch.raw_source_identifier ?? batch.donor_identifier) === sourceId &&
      (batch.eye ?? "unknown") === draft.eye &&
      batch.passage_number === passage,
  );
}

function importPeers(excludeSourceIndex: number): WarningPeer[] {
  const pseudo: WarningPeer[] = [];
  state.importWizard?.accepted.forEach((row) => {
    if (row.sourceIndex === excludeSourceIndex) {
      return;
    }
    pseudo.push({
      id: -(row.sourceIndex + 1000),
      label: row.input.label,
      passage_number: row.input.passage_number,
      started_at: row.input.started_at,
      donor_identifier: row.input.donor_identifier,
      eye: row.input.eye,
      raw_source_identifier: row.input.raw_source_identifier,
      source_record_type: row.input.source_record_type,
      dissociation_date: row.input.dissociation_date,
    });
  });
  return [...state.batches, ...pseudo];
}

function confirmImportRow(form: HTMLFormElement): void {
  const wiz = state.importWizard;
  if (!wiz) {
    return;
  }
  try {
    const draft = readImportRowForm(form);
    const input = importDraftToInput(draft, wiz.cursor);
    const warnings = buildDraftWarnings(draftToVesselDraft(draft), importPeers(wiz.cursor));
    wiz.accepted.set(wiz.cursor, {
      sourceIndex: wiz.cursor,
      input,
      draft,
      warnings,
      possibleDuplicate: isPossibleDuplicate(draft),
    });
    wiz.skipped.delete(wiz.cursor);
    wiz.rowError = null;
    advanceImportCursor();
  } catch (error) {
    wiz.rowError = error instanceof Error ? error.message : "This row is incomplete.";
    render();
  }
}

function advanceImportCursor(): void {
  const wiz = state.importWizard;
  if (!wiz) {
    return;
  }
  if (wiz.cursor >= wiz.rows.length - 1) {
    wiz.stage = "summary";
  } else {
    wiz.cursor += 1;
  }
  render();
}

function skipImportRow(): void {
  const wiz = state.importWizard;
  if (!wiz) {
    return;
  }
  wiz.accepted.delete(wiz.cursor);
  wiz.skipped.add(wiz.cursor);
  wiz.rowError = null;
  advanceImportCursor();
}

function importRowBack(): void {
  const wiz = state.importWizard;
  if (!wiz || wiz.cursor === 0) {
    return;
  }
  wiz.cursor -= 1;
  wiz.rowError = null;
  render();
}

function updateImportRowWarnings(): void {
  const wiz = state.importWizard;
  const form = app.querySelector<HTMLFormElement>("#import-row-form");
  const target = app.querySelector<HTMLDivElement>("#import-row-warnings");
  if (!wiz || !form || !target) {
    return;
  }
  const draft = readImportRowForm(form);
  const warnings = buildDraftWarnings(draftToVesselDraft(draft), importPeers(wiz.cursor));
  target.innerHTML = renderImportRowFlags(warnings, isPossibleDuplicate(draft), draft);
  createIcons({ icons });
}

async function commitImport(): Promise<void> {
  const wiz = state.importWizard;
  if (!wiz) {
    return;
  }
  const inputs = Array.from(wiz.accepted.values())
    .sort((a, b) => a.sourceIndex - b.sourceIndex)
    .map((row) => row.input);
  if (inputs.length === 0) {
    state.notice = { tone: "info", message: "No rows were confirmed for import." };
    render();
    return;
  }
  await runMutation(`Imported ${inputs.length} record${inputs.length === 1 ? "" : "s"}.`, async () => {
    const ids = await store.importVessels(inputs);
    state.importWizard = null;
    state.selectedBatchId = ids[0] ?? state.selectedBatchId;
  });
}

function cancelImport(): void {
  state.importWizard = null;
  state.notice = null;
  render();
}

void boot();
