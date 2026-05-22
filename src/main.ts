import { openUrl } from "@tauri-apps/plugin-opener";
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
} from "./types";
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

const GITHUB_RELEASES_URL = "https://github.com/zhuojianlook/cell-culture-recorder/releases";

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
  status: CultureStatus;
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
              <span class="count-pill">${filteredBatches.length}</span>
            </div>
            ${renderLineageTree(filteredBatches)}
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

        <section id="records" class="panel culture-panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Database</p>
              <h2>Vessel records</h2>
            </div>
            <span class="count-pill">${filteredBatches.length}</span>
          </div>
          ${renderBatchTable(filteredBatches)}
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
  const locations = uniqueValues(state.batches.map((batch) => batch.incubator_location));

  return `
    ${dataList("culture-name-list", cultureNames)}
    ${dataList("donor-list", donors)}
    ${dataList("vessel-label-list", labels)}
    ${dataList("flask-type-list", vessels)}
    ${dataList("media-list", media)}
    ${dataList("location-list", locations)}
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

      <div class="form-section">
        <div class="four-col">
          <label>Seed date
            <input name="started_at" required type="date" value="${todayIsoDate()}" />
          </label>
          <label>Split date
            <input name="split_date" type="date" />
          </label>
          <label>Media change 1
            <input name="media_change_1_date" type="date" />
          </label>
          <label>Media change 2
            <input name="media_change_2_date" type="date" />
          </label>
        </div>

        <div class="three-col">
          <label>Medium
            <input name="medium" list="media-list" placeholder="F99 + 8% FBS" />
          </label>
          <label>Seeding density
            <input name="seeding_density" placeholder="1:3 split, 2.0e5 cells" />
          </label>
          <label>Location
            <input name="incubator_location" list="location-list" placeholder="Incubator 2 / Shelf B" />
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
        <div><dt>Seed</dt><dd>${escapeHtml(displayDate(batch.started_at))}</dd></div>
        <div><dt>Split</dt><dd>${escapeHtml(displayDate(batch.split_date))}</dd></div>
        <div><dt>Media 1</dt><dd>${escapeHtml(displayDate(batch.media_change_1_date))}</dd></div>
        <div><dt>Media 2</dt><dd>${escapeHtml(displayDate(batch.media_change_2_date))}</dd></div>
      </dl>

      ${warnings.length > 0 ? renderWarningList(warnings, "Logic warnings") : `<div class="ok-box"><i data-lucide="circle-check"></i><span>No lineage/date warnings for this vessel.</span></div>`}

      <div class="note-block">
        <strong>Growth notes</strong>
        <p>${escapeHtml(batch.growth_notes ?? batch.notes ?? "No notes recorded.")}</p>
      </div>
      <div class="note-block">
        <strong>Source documentation</strong>
        <p>${escapeHtml(batch.source_documentation ?? "No source text captured.")}</p>
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
      <span>${escapeHtml(selectedBatch.medium ?? "No medium recorded")}</span>
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
    event.medium ? `Medium ${event.medium}` : null,
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

      <label>Medium<input name="medium" list="media-list" placeholder="F99 + 8% FBS" /></label>
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

  app.querySelector<HTMLFormElement>("#event-form")?.addEventListener("submit", handleEventSubmit);
  app.querySelector<HTMLInputElement>("#search")?.addEventListener("input", (event) => {
    state.search = (event.currentTarget as HTMLInputElement).value;
    render();
  });
  app.querySelector<HTMLSelectElement>("#donor-filter")?.addEventListener("change", (event) => {
    state.donorFilter = (event.currentTarget as HTMLSelectElement).value;
    render();
  });
  app.querySelector<HTMLSelectElement>("#status-filter")?.addEventListener("change", (event) => {
    state.statusFilter = (event.currentTarget as HTMLSelectElement).value as AppState["statusFilter"];
    render();
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

  app.querySelectorAll<HTMLButtonElement>(".select-batch, .tree-node").forEach((button) => {
    button.addEventListener("click", async () => {
      state.selectedBatchId = Number(button.dataset.batchId);
      state.selectedEvents = await store.listEvents(state.selectedBatchId);
      render();
    });
  });

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

async function handleVesselSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const data = new FormData(form);
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
    media_change_1_date: compactText(data.get("media_change_1_date")),
    media_change_2_date: compactText(data.get("media_change_2_date")),
    medium: compactText(data.get("medium")),
    seeding_density: compactText(data.get("seeding_density")),
    incubator_location: compactText(data.get("incubator_location")),
    status: (compactText(data.get("status")) ?? "active") as CultureStatus,
    growth_notes: compactText(data.get("growth_notes")),
    source_documentation: compactText(data.get("source_documentation")),
  };

  await runMutation("Vessel record saved.", async () => {
    const id = await store.createVessel(input);
    form.reset();
    state.selectedBatchId = id;
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
        media_change_1_date: batch.media_change_1_date,
        media_change_2_date: batch.media_change_2_date,
        medium: batch.medium,
        seeding_density: batch.seeding_density,
        location: batch.incubator_location,
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
          medium: event.medium,
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
  ]);

  state.notice = { tone: "success", message: "Excel workbook exported." };
  render();
}

async function checkForUpdates(): Promise<void> {
  try {
    if (isTauriRuntime()) {
      await openUrl(GITHUB_RELEASES_URL);
    } else {
      window.open(GITHUB_RELEASES_URL, "_blank", "noopener,noreferrer");
    }
    state.notice = {
      tone: "info",
      message: "Opened GitHub releases. Install the newest macOS build from there when available.",
    };
  } catch (error) {
    state.notice = {
      tone: "error",
      message: error instanceof Error ? error.message : "Could not open the update page.",
    };
  }
  render();
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

  const warnings = buildDraftWarnings(readVesselDraft(form));
  target.innerHTML =
    warnings.length > 0
      ? renderWarningList(warnings, "Check before saving")
      : `<div class="ok-box"><i data-lucide="circle-check"></i><span>No logic warnings for the current entry.</span></div>`;
  createIcons({ icons });
}

function readVesselDraft(form: HTMLFormElement): VesselDraft {
  const data = new FormData(form);
  return {
    culture_name: compactText(data.get("culture_name")) ?? "",
    donor_identifier: compactText(data.get("donor_identifier")),
    eye: (compactText(data.get("eye")) ?? "unknown") as Eye,
    label: compactText(data.get("label")) ?? "",
    passage_number: nullableNumber(data.get("passage_number")),
    vessel: compactText(data.get("vessel")) ?? "",
    parent_batch_id: nullableNumber(data.get("parent_batch_id")),
    started_at: compactText(data.get("started_at")),
    split_date: compactText(data.get("split_date")),
    media_change_1_date: compactText(data.get("media_change_1_date")),
    media_change_2_date: compactText(data.get("media_change_2_date")),
    status: (compactText(data.get("status")) ?? "active") as CultureStatus,
  };
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
      status: batch.status,
    },
    batch.id,
  );
}

function buildDraftWarnings(draft: VesselDraft, ignoreBatchId?: number): string[] {
  const warnings: string[] = [];
  const label = draft.label.trim().toLowerCase();
  const donor = draft.donor_identifier?.trim().toLowerCase() ?? "";
  const peers = state.batches.filter((batch) => batch.id !== ignoreBatchId);

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
    ? state.batches.find((batch) => batch.id === draft.parent_batch_id && batch.id !== ignoreBatchId)
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

  for (const field of [
    ["media change 1", draft.media_change_1_date],
    ["media change 2", draft.media_change_2_date],
  ] as const) {
    if (draft.started_at && field[1] && dateMs(field[1]) < dateMs(draft.started_at)) {
      warnings.push(`${field[0]} is before seed date.`);
    }
  }

  if (draft.media_change_1_date && draft.media_change_2_date && dateMs(draft.media_change_2_date) < dateMs(draft.media_change_1_date)) {
    warnings.push("Media change 2 is before media change 1.");
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

  return warnings;
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
        batch.incubator_location,
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

void boot();
