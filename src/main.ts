import { createIcons, icons } from "lucide";
import "./styles.css";
import { createCultureStore } from "./store";
import type {
  BackupPackage,
  BackupSnapshot,
  CellLine,
  CreateEventInput,
  CultureBatchView,
  CultureEvent,
  CultureStatus,
  CultureStore,
  EventType,
} from "./types";
import {
  compactText,
  displayDate,
  downloadJson,
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
  events: CultureEvent[];
  auditCount: number;
  backups: BackupSnapshot[];
  selectedBatchId: number | null;
  search: string;
  statusFilter: CultureStatus | "all";
  notice: Notice;
  saving: boolean;
  initialized: boolean;
  mode: CultureStore["mode"];
}

const appElement = document.querySelector<HTMLDivElement>("#app");

if (!appElement) {
  throw new Error("Missing app container.");
}

const app = appElement;

let store: CultureStore;

const state: AppState = {
  cellLines: [],
  batches: [],
  events: [],
  auditCount: 0,
  backups: [],
  selectedBatchId: null,
  search: "",
  statusFilter: "all",
  notice: null,
  saving: false,
  initialized: false,
  mode: "browser-preview",
};

async function boot(): Promise<void> {
  renderLoading();

  try {
    store = await createCultureStore();
    state.mode = store.mode;
    state.initialized = true;
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
  state.auditCount = (await store.listAuditEntries(1000)).length;
  state.backups = await store.listBackups();

  if (!state.selectedBatchId && state.batches.length > 0) {
    state.selectedBatchId = state.batches[0].id;
  }

  if (state.selectedBatchId && !state.batches.some((batch) => batch.id === state.selectedBatchId)) {
    state.selectedBatchId = state.batches[0]?.id ?? null;
  }

  state.events = state.selectedBatchId ? await store.listEvents(state.selectedBatchId) : [];
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
  const filteredBatches = state.batches.filter((batch) => {
    const search = state.search.trim().toLowerCase();
    const matchesSearch =
      !search ||
      [batch.label, batch.cell_line_name, batch.species, batch.vessel, batch.medium, batch.incubator_location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
    const matchesStatus = state.statusFilter === "all" || batch.status === state.statusFilter;

    return matchesSearch && matchesStatus;
  });
  const selectedBatch = state.batches.find((batch) => batch.id === state.selectedBatchId) ?? null;
  const activeCount = state.batches.filter((batch) => batch.status === "active").length;
  const staleCount = state.batches.filter(isStale).length;
  const lastBackup = state.backups[0] ?? null;

  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark"><i data-lucide="microscope"></i></div>
          <div>
            <strong>Cell Culture</strong>
            <span>Recorder</span>
          </div>
        </div>

        <nav class="nav-stack" aria-label="Primary">
          <a href="#cultures"><i data-lucide="flask-conical"></i><span>Cultures</span></a>
          <a href="#record"><i data-lucide="clipboard-plus"></i><span>Record</span></a>
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
            <p class="eyebrow">Native lab records</p>
            <h1>Cell Culture Recorder</h1>
          </div>
          <div class="topbar-actions">
            <label class="search-field">
              <i data-lucide="search"></i>
              <input id="search" type="search" placeholder="Search cultures" value="${escapeHtml(state.search)}" />
            </label>
            <select id="status-filter" aria-label="Filter by status">
              ${statusOption("all", "All statuses")}
              ${statusOption("active", "Active")}
              ${statusOption("frozen", "Frozen")}
              ${statusOption("contaminated", "Contaminated")}
              ${statusOption("discarded", "Discarded")}
            </select>
            <button id="export-backup" class="button primary" type="button">
              <i data-lucide="download"></i>
              <span>Export</span>
            </button>
          </div>
        </header>

        ${renderNotice()}

        <section class="stats-grid" aria-label="Overview">
          ${statCard("Active cultures", activeCount, "flask-conical")}
          ${statCard("Cell lines", state.cellLines.length, "dna")}
          ${statCard("Events recorded", state.events.length, "activity")}
          ${statCard("Stale active cultures", staleCount, "clock-alert")}
        </section>

        <section id="cultures" class="workspace-grid">
          <div class="panel culture-panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Current work</p>
                <h2>Culture batches</h2>
              </div>
              <span class="count-pill">${filteredBatches.length}</span>
            </div>
            ${renderBatchTable(filteredBatches)}
          </div>

          <div class="panel timeline-panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Selected timeline</p>
                <h2>${selectedBatch ? escapeHtml(selectedBatch.label) : "No culture selected"}</h2>
              </div>
            </div>
            ${renderTimeline(selectedBatch)}
          </div>
        </section>

        <section id="record" class="forms-grid">
          ${renderCellLineForm()}
          ${renderBatchForm()}
          ${renderEventForm(selectedBatch)}
        </section>

        <section id="backup" class="backup-section">
          ${renderBackupPanel(lastBackup)}
        </section>
      </main>
    </div>
  `;

  attachEvents();
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

function renderBatchTable(batches: CultureBatchView[]): string {
  if (batches.length === 0) {
    return `
      <div class="empty-state">
        <i data-lucide="flask-conical-off"></i>
        <p>No cultures match the current filter.</p>
      </div>
    `;
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Batch</th>
            <th>Line</th>
            <th>Passage</th>
            <th>Status</th>
            <th>Last event</th>
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
  return `
    <tr class="${batch.id === state.selectedBatchId ? "selected-row" : ""}">
      <td>
        <strong>${escapeHtml(batch.label)}</strong>
        <span>${escapeHtml(batch.vessel)}${batch.incubator_location ? ` / ${escapeHtml(batch.incubator_location)}` : ""}</span>
      </td>
      <td>
        <strong>${escapeHtml(batch.cell_line_name)}</strong>
        <span>${escapeHtml(batch.species)}</span>
      </td>
      <td>P${batch.passage_number}</td>
      <td>${statusBadge(batch.status)}</td>
      <td>${escapeHtml(displayDate(batch.last_event_at ?? batch.started_at))}</td>
      <td>
        <button class="icon-button select-batch" type="button" data-batch-id="${batch.id}" aria-label="Select ${escapeHtml(batch.label)}">
          <i data-lucide="arrow-right"></i>
        </button>
      </td>
    </tr>
  `;
}

function renderTimeline(selectedBatch: CultureBatchView | null): string {
  if (!selectedBatch) {
    return `
      <div class="empty-state">
        <i data-lucide="list-plus"></i>
        <p>Create a culture batch to start recording observations.</p>
      </div>
    `;
  }

  if (state.events.length === 0) {
    return `
      <div class="batch-detail">
        <div>${statusBadge(selectedBatch.status)}</div>
        <dl>
          <div><dt>Medium</dt><dd>${escapeHtml(selectedBatch.medium ?? "Not recorded")}</dd></div>
          <div><dt>Started</dt><dd>${escapeHtml(displayDate(selectedBatch.started_at))}</dd></div>
        </dl>
      </div>
      <div class="empty-state compact">
        <i data-lucide="clipboard-plus"></i>
        <p>No events recorded for this batch yet.</p>
      </div>
    `;
  }

  return `
    <div class="batch-detail">
      <div>${statusBadge(selectedBatch.status)}</div>
      <dl>
        <div><dt>Medium</dt><dd>${escapeHtml(selectedBatch.medium ?? "Not recorded")}</dd></div>
        <div><dt>Started</dt><dd>${escapeHtml(displayDate(selectedBatch.started_at))}</dd></div>
        <div><dt>Location</dt><dd>${escapeHtml(selectedBatch.incubator_location ?? "Not recorded")}</dd></div>
      </dl>
    </div>
    <ol class="timeline">
      ${state.events.map(renderEvent).join("")}
    </ol>
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
        ${metrics.length > 0 ? `<p class="metrics">${metrics.map(escapeHtml).join(" / ")}</p>` : ""}
        ${event.operator ? `<p class="operator">Operator: ${escapeHtml(event.operator)}</p>` : ""}
        <p>${escapeHtml(event.notes || "No notes recorded.")}</p>
      </div>
    </li>
  `;
}

function renderCellLineForm(): string {
  return `
    <form id="cell-line-form" class="panel form-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Reference</p>
          <h2>New cell line</h2>
        </div>
        <i data-lucide="dna"></i>
      </div>

      <label>Name<input name="name" required placeholder="A549" /></label>
      <label>Species<input name="species" required placeholder="Human" /></label>
      <label>Tissue<input name="tissue" placeholder="Lung epithelial" /></label>
      <label>Source<input name="source" placeholder="ATCC, collaborator, internal" /></label>
      <label>Identifiers<input name="identifiers" placeholder="Catalog, clone, lot" /></label>
      <label>Notes<textarea name="notes" rows="3" placeholder="Authentication, morphology, handling notes"></textarea></label>

      <button class="button" type="submit" ${state.saving ? "disabled" : ""}>
        <i data-lucide="plus"></i>
        <span>Add cell line</span>
      </button>
    </form>
  `;
}

function renderBatchForm(): string {
  const disabled = state.cellLines.length === 0 || state.saving;

  return `
    <form id="batch-form" class="panel form-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Culture</p>
          <h2>Start batch</h2>
        </div>
        <i data-lucide="flask-conical"></i>
      </div>

      <label>Cell line
        <select name="cell_line_id" required ${state.cellLines.length === 0 ? "disabled" : ""}>
          ${state.cellLines.map((line) => `<option value="${line.id}">${escapeHtml(line.name)}</option>`).join("")}
        </select>
      </label>
      <label>Batch label<input name="label" required placeholder="A549 P12 6-well A" /></label>
      <div class="two-col">
        <label>Passage<input name="passage_number" required type="number" min="0" value="0" /></label>
        <label>Start date<input name="started_at" required type="date" value="${todayIsoDate()}" /></label>
      </div>
      <label>Vessel<input name="vessel" required placeholder="T75 flask, 6-well plate" /></label>
      <label>Medium<input name="medium" placeholder="DMEM + 10% FBS" /></label>
      <label>Seeding density<input name="seeding_density" placeholder="2.0e5 cells/well" /></label>
      <label>Incubator location<input name="incubator_location" placeholder="Incubator 1 / Shelf C" /></label>
      <label>Notes<textarea name="notes" rows="3" placeholder="Coating, density, special handling"></textarea></label>

      <button class="button" type="submit" ${disabled ? "disabled" : ""}>
        <i data-lucide="save"></i>
        <span>Start culture</span>
      </button>
    </form>
  `;
}

function renderEventForm(selectedBatch: CultureBatchView | null): string {
  const disabled = state.batches.length === 0 || state.saving;

  return `
    <form id="event-form" class="panel form-panel event-form">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Daily record</p>
          <h2>Record event</h2>
        </div>
        <i data-lucide="clipboard-plus"></i>
      </div>

      <label>Culture batch
        <select id="selected-batch" name="batch_id" required ${state.batches.length === 0 ? "disabled" : ""}>
          ${state.batches
            .map(
              (batch) =>
                `<option value="${batch.id}" ${batch.id === selectedBatch?.id ? "selected" : ""}>${escapeHtml(
                  batch.label,
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

      <label>Medium<input name="medium" placeholder="RPMI + 10% FBS" /></label>
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
      <label>Notes<textarea name="notes" rows="5" required placeholder="Morphology, color change, contamination signs, action taken"></textarea></label>

      <button class="button primary" type="submit" ${disabled ? "disabled" : ""}>
        <i data-lucide="save"></i>
        <span>Record event</span>
      </button>
    </form>
  `;
}

function renderBackupPanel(lastBackup: BackupSnapshot | null): string {
  return `
    <div class="panel backup-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Data safety</p>
          <h2>Backups and restore</h2>
        </div>
        <i data-lucide="database-backup"></i>
      </div>

      <div class="backup-grid">
        <div>
          <strong>Current protection</strong>
          <ul class="safety-list">
            <li><i data-lucide="check"></i><span>Schema migrations are registered in Rust.</span></li>
            <li><i data-lucide="check"></i><span>Writes use transaction boundaries.</span></li>
            <li><i data-lucide="check"></i><span>WAL, foreign keys, busy timeout, and full synchronous writes are enabled.</span></li>
            <li><i data-lucide="check"></i><span>Every critical write records an audit entry and local snapshot.</span></li>
          </ul>
        </div>

        <div class="backup-actions">
          <p>Last snapshot: ${lastBackup ? escapeHtml(displayDate(lastBackup.created_at)) : "none yet"}</p>
          <button id="download-backup" class="button primary" type="button">
            <i data-lucide="download"></i>
            <span>Download backup</span>
          </button>
          <label class="file-button">
            <i data-lucide="upload"></i>
            <span>Restore from file</span>
            <input id="restore-file" type="file" accept="application/json" />
          </label>
        </div>
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
  app.querySelector<HTMLFormElement>("#cell-line-form")?.addEventListener("submit", handleCellLineSubmit);
  app.querySelector<HTMLFormElement>("#batch-form")?.addEventListener("submit", handleBatchSubmit);
  app.querySelector<HTMLFormElement>("#event-form")?.addEventListener("submit", handleEventSubmit);
  app.querySelector<HTMLInputElement>("#search")?.addEventListener("input", (event) => {
    state.search = (event.currentTarget as HTMLInputElement).value;
    render();
  });
  app.querySelector<HTMLSelectElement>("#status-filter")?.addEventListener("change", (event) => {
    state.statusFilter = (event.currentTarget as HTMLSelectElement).value as AppState["statusFilter"];
    render();
  });
  app.querySelector<HTMLSelectElement>("#selected-batch")?.addEventListener("change", async (event) => {
    state.selectedBatchId = Number((event.currentTarget as HTMLSelectElement).value);
    state.events = await store.listEvents(state.selectedBatchId);
    render();
  });
  app.querySelector<HTMLButtonElement>("#export-backup")?.addEventListener("click", downloadBackup);
  app.querySelector<HTMLButtonElement>("#download-backup")?.addEventListener("click", downloadBackup);
  app.querySelector<HTMLInputElement>("#restore-file")?.addEventListener("change", restoreFromFile);

  app.querySelectorAll<HTMLButtonElement>(".select-batch").forEach((button) => {
    button.addEventListener("click", async () => {
      state.selectedBatchId = Number(button.dataset.batchId);
      state.events = await store.listEvents(state.selectedBatchId);
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

async function handleCellLineSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const data = new FormData(form);

  await runMutation("Cell line saved.", async () => {
    await store.createCellLine({
      name: requiredText(data.get("name"), "Name"),
      species: requiredText(data.get("species"), "Species"),
      tissue: compactText(data.get("tissue")),
      source: compactText(data.get("source")),
      identifiers: compactText(data.get("identifiers")),
      notes: compactText(data.get("notes")),
    });
    form.reset();
  });
}

async function handleBatchSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const data = new FormData(form);

  await runMutation("Culture batch started.", async () => {
    await store.createBatch({
      cell_line_id: requiredNumber(data.get("cell_line_id"), "Cell line"),
      label: requiredText(data.get("label"), "Batch label"),
      passage_number: requiredNumber(data.get("passage_number"), "Passage"),
      vessel: requiredText(data.get("vessel"), "Vessel"),
      medium: compactText(data.get("medium")),
      seeding_density: compactText(data.get("seeding_density")),
      incubator_location: compactText(data.get("incubator_location")),
      started_at: requiredText(data.get("started_at"), "Start date"),
      notes: compactText(data.get("notes")),
    });
    form.reset();
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
    batch_id: requiredNumber(data.get("batch_id"), "Culture batch"),
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
  await runMutation("Backup exported.", async () => {
    const pkg = await store.exportBackup("Manual export");
    const filename = `cell-culture-backup-${pkg.exportedAt.slice(0, 10)}.json`;
    downloadJson(filename, JSON.stringify(pkg, null, 2));
  });
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
    "Restore this backup? Current cell lines, culture batches, and events will be replaced after an automatic snapshot is saved.",
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

function isStale(batch: CultureBatchView): boolean {
  if (batch.status !== "active") {
    return false;
  }

  const last = new Date(batch.last_event_at ?? batch.started_at);
  if (Number.isNaN(last.getTime())) {
    return false;
  }

  return Date.now() - last.getTime() > 3 * 24 * 60 * 60 * 1000;
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

void boot();
