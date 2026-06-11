// Cell Culture record editor for WetLab Planner (Phase 3 unification).
//
// A culture-vessel node on the canvas IS its culture record: the culture fields
// live in the node's dataset (so they serialize with the project's canvas state,
// scoped per-project automatically). Double-clicking a vessel/dish node in the
// Cell Culture workspace opens this editor. app.js calls window.WLPCulture.openRecord(node).
(function () {
  "use strict";

  var EYES = ["unknown", "OD", "OS", "OU"];
  var STATUSES = ["active", "frozen", "contaminated", "discarded"];

  // Culture fields persisted on node.dataset (camelCase -> data-culture-*).
  function read(node, key, fallback) {
    var v = node.dataset["culture" + key];
    return v == null || v === "" ? (fallback == null ? "" : fallback) : v;
  }
  function write(node, key, val) {
    if (val == null || val === "") delete node.dataset["culture" + key];
    else node.dataset["culture" + key] = String(val);
  }

  // Pure logic lives in culture-logic.js (window.WLPCultureLogic) so it's
  // unit-tested; culture.js is the DOM glue. recordOf() projects a node's
  // dataset into the plain {nodeId,donor,...} record those functions expect.
  function LOGIC() { return window.WLPCultureLogic; }
  function recordOf(node) {
    var ta = node.querySelector(".node-label");
    return {
      nodeId: node.dataset.nodeId || "",
      iconId: node.dataset.iconId || "",
      label: (ta && ta.value) || "",
      donor: read(node, "Donor", ""),
      eye: read(node, "Eye", ""),
      passage: read(node, "Passage", ""),
      seedDate: read(node, "SeedDate", ""),
      status: read(node, "Status", "active"),
      parentNodeId: read(node, "ParentNodeId", ""),
    };
  }
  // All cell-culture vessel records (peers) for the active project.
  function allRecords() {
    return allCultureVessels().map(recordOf);
  }
  function vesselTypeFromIcon(node) {
    return LOGIC().vesselTypeFromIcon(node.dataset.iconId);
  }

  function otherVessels(node) {
    var all = Array.prototype.slice.call(
      document.querySelectorAll('.drop[data-workspace="cell-culture"]')
    );
    return all.filter(function (n) {
      if (n === node) return false;
      var id = String(n.dataset.iconId || "");
      return id.indexOf("_flask") >= 0 || id.indexOf("dish_") === 0 || id === "cell_line" || id === "primary_tissue";
    });
  }
  function nodeLabel(n) {
    var ta = n.querySelector(".node-label");
    var name = (ta && ta.value ? ta.value : "").trim();
    return name || (read(n, "Donor", "") + " " + read(n, "Eye", "")).trim() || ("Vessel " + (n.dataset.nodeId || ""));
  }

  var modal = null;
  var current = null;

  function build() {
    if (modal) return modal;
    var backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop modal-backdrop--center is-hidden";
    backdrop.style.zIndex = "10000";
    backdrop.innerHTML =
      '<div class="modal" style="margin-top:8vh;max-width:560px;width:560px">' +
        '<div class="modal__header" style="display:flex;align-items:center;justify-content:space-between">' +
          '<h3 style="margin:0">Culture record</h3>' +
          '<span id="wlpcRecVessel" style="font-size:.8125rem;color:var(--muted,#94a3b8)"></span>' +
        '</div>' +
        '<div class="modal__body" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
          fieldText("wlpcDonor", "Donor / culture name") +
          fieldSelect("wlpcEye", "Eye", EYES) +
          fieldNum("wlpcPassage", "Passage #") +
          fieldSelect("wlpcStatus", "Status", STATUSES) +
          fieldText("wlpcMedium", "Medium") +
          fieldText("wlpcSeeding", "Seeding density") +
          fieldText("wlpcIncubator", "Incubator location") +
          fieldDate("wlpcSeedDate", "Seed date") +
          fieldParent("wlpcParent") +
          '<div class="field" style="grid-column:1/-1">' +
            '<label for="wlpcNotes">Growth notes</label>' +
            '<textarea id="wlpcNotes" class="modal__input" rows="2" style="resize:vertical"></textarea>' +
          '</div>' +
          // Events / passaging log
          '<div class="field" style="grid-column:1/-1">' +
            '<label>Events &amp; passaging</label>' +
            '<div id="wlpcEventsList" style="max-height:130px;overflow:auto;border:1px solid rgba(148,163,184,.18);border-radius:8px;background:rgba(2,6,23,.35)"></div>' +
            '<div style="display:flex;gap:6px;margin-top:6px;align-items:center;flex-wrap:wrap">' +
              eventTypeSelect() +
              '<input type="date" id="wlpcEvDate" class="modal__input" style="width:auto">' +
              '<input type="number" id="wlpcEvConf" class="modal__input" placeholder="conf %" min="0" max="100" style="width:78px">' +
              '<input type="text" id="wlpcEvNotes" class="modal__input" placeholder="notes (optional)" style="flex:1;min-width:90px">' +
              '<button type="button" id="wlpcEvAdd" class="btn">+ Record</button>' +
            '</div>' +
          '</div>' +
          '<div id="wlpcErr" class="form-status" style="grid-column:1/-1;color:#fca5a5"></div>' +
        '</div>' +
        '<div class="modal__footer" style="display:flex;gap:8px;justify-content:flex-end;padding:14px 16px">' +
          '<button type="button" id="wlpcCancel" class="btn">Cancel</button>' +
          '<button type="button" id="wlpcSave" class="btn btn--primary">Save record</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(backdrop);
    backdrop.querySelector("#wlpcCancel").onclick = hide;
    backdrop.querySelector("#wlpcSave").onclick = save;
    backdrop.querySelector("#wlpcEvAdd").onclick = recordEventFromForm;
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) hide(); });
    // Live needs-attention warnings as the user edits.
    backdrop.addEventListener("input", renderEditorWarnings);
    backdrop.addEventListener("change", renderEditorWarnings);
    modal = backdrop;
    return modal;
  }

  // The in-progress record from the modal's current field values.
  function draftRecord() {
    if (!current) return {};
    var ta = current.querySelector(".node-label");
    return {
      nodeId: current.dataset.nodeId || "",
      label: (ta && ta.value) || "",
      donor: val("wlpcDonor").value.trim(),
      eye: val("wlpcEye").value,
      passage: val("wlpcPassage").value.trim(),
      seedDate: val("wlpcSeedDate").value,
      status: val("wlpcStatus").value,
      parentNodeId: val("wlpcParent").value,
    };
  }
  // Render the (non-blocking, informational) warnings for the in-progress edit.
  function renderEditorWarnings() {
    if (!modal || !current) return;
    var box = val("wlpcErr");
    if (!box) return;
    var w = LOGIC().cultureWarnings(draftRecord(), allRecords());
    if (!w.length) { box.innerHTML = ""; box.style.display = "none"; return; }
    box.style.display = "";
    box.style.color = "#fcd34d";
    box.innerHTML =
      '<div style="font-weight:600;margin-bottom:4px">&#9888; ' + w.length +
      (w.length === 1 ? " thing to check" : " things to check") + "</div>" +
      '<ul style="margin:0;padding-left:18px">' +
      w.map(function (x) { return "<li>" + esc(x.message) + "</li>"; }).join("") +
      "</ul>";
  }

  function eventTypeSelect() {
    var o = window.WLPCultureLogic.EVENT_TYPES.map(function (t) {
      var lbl = t.replace("_", " ");
      lbl = lbl.charAt(0).toUpperCase() + lbl.slice(1);
      return '<option value="' + t + '">' + lbl + "</option>";
    }).join("");
    return '<select id="wlpcEvType" class="modal__input" style="width:auto">' + o + "</select>";
  }

  function renderEvents(node) {
    var list = val("wlpcEventsList");
    if (!list) return;
    var events = LOGIC().sortEvents(LOGIC().parseEvents(node.dataset.cultureEvents));
    if (!events.length) {
      list.innerHTML =
        '<div style="color:#64748b;font-size:.78rem;padding:8px 10px">No events yet — record a passage, feed, freeze, etc.</div>';
      return;
    }
    list.innerHTML = events
      .map(function (ev) {
        var detail = LOGIC().summarizeEvent(ev);
        var notes = ev.notes ? " — " + esc(ev.notes) : "";
        return (
          '<div style="font-size:.78rem;padding:5px 10px;border-bottom:1px solid rgba(148,163,184,.08)">' +
          '<span style="color:#5eead4;font-weight:600">' + esc(String(ev.type).replace("_", " ")) + "</span> " +
          '<span style="color:#94a3b8">' + esc(ev.at || "") + (detail ? " · " + esc(detail) : "") + "</span>" +
          esc(notes) +
          "</div>"
        );
      })
      .join("");
  }

  // Append an event from the mini-form, apply its status transition (and bump
  // the passage number for a passage event). Events commit immediately (an
  // appended log entry), independent of the modal's Save/Cancel.
  function recordEventFromForm() {
    if (!current) return;
    var type = val("wlpcEvType").value;
    var ev = {
      type: type,
      at: val("wlpcEvDate").value || new Date().toISOString().slice(0, 10),
      confluence: val("wlpcEvConf").value || "",
      notes: val("wlpcEvNotes").value.trim(),
      seq: Date.now(),
    };
    var events = LOGIC().parseEvents(current.dataset.cultureEvents);
    events.push(ev);
    current.dataset.cultureEvents = JSON.stringify(events);
    var next = LOGIC().statusFromEvent(ev);
    if (next) {
      write(current, "Status", next);
      val("wlpcStatus").value = next;
    }
    if (type === "passage") {
      // Bump from the in-progress field value (not the dataset, which only
      // updates on Save), then reflect it in both the field and the dataset.
      var p = (Number(val("wlpcPassage").value) || 0) + 1;
      val("wlpcPassage").value = String(p);
      write(current, "Passage", String(p));
    }
    val("wlpcEvNotes").value = "";
    val("wlpcEvConf").value = "";
    renderEvents(current);
    renderEditorWarnings();
    if (typeof window.wlpMarkCanvasDirty === "function") window.wlpMarkCanvasDirty();
  }

  function fieldText(id, label) {
    return '<div class="field"><label for="' + id + '">' + label + '</label>' +
      '<input type="text" id="' + id + '" class="modal__input"></div>';
  }
  function fieldNum(id, label) {
    return '<div class="field"><label for="' + id + '">' + label + '</label>' +
      '<input type="number" id="' + id + '" class="modal__input" min="0" step="1"></div>';
  }
  function fieldDate(id, label) {
    return '<div class="field"><label for="' + id + '">' + label + '</label>' +
      '<input type="date" id="' + id + '" class="modal__input"></div>';
  }
  function fieldSelect(id, label, opts) {
    var o = opts.map(function (v) {
      var t = v.charAt(0).toUpperCase() + v.slice(1);
      return '<option value="' + v + '">' + t + '</option>';
    }).join("");
    return '<div class="field"><label for="' + id + '">' + label + '</label>' +
      '<select id="' + id + '" class="modal__input">' + o + '</select></div>';
  }
  function fieldParent(id) {
    return '<div class="field"><label for="' + id + '">Lineage parent</label>' +
      '<select id="' + id + '" class="modal__input"><option value="">— none —</option></select></div>';
  }

  function val(id) { return modal.querySelector("#" + id); }

  function openRecord(node) {
    if (!node) return;
    build();
    current = node;
    val("wlpcRecVessel").textContent = vesselTypeFromIcon(node);
    val("wlpcDonor").value = read(node, "Donor", "");
    val("wlpcEye").value = read(node, "Eye", "unknown");
    val("wlpcPassage").value = read(node, "Passage", "");
    val("wlpcStatus").value = read(node, "Status", "active");
    val("wlpcMedium").value = read(node, "Medium", "");
    val("wlpcSeeding").value = read(node, "Seeding", "");
    val("wlpcIncubator").value = read(node, "Incubator", "");
    val("wlpcSeedDate").value = read(node, "SeedDate", "");
    val("wlpcNotes").value = read(node, "Notes", "");
    // Lineage parent options — exclude vessels that would form a cycle
    // (this node's own descendants).
    var sel = val("wlpcParent");
    sel.innerHTML = '<option value="">— none —</option>';
    var peerRecords = allRecords();
    var selfId = node.dataset.nodeId || "";
    otherVessels(node).forEach(function (n) {
      var cid = n.dataset.nodeId || "";
      if (LOGIC().wouldCreateCycle(peerRecords, selfId, cid)) return;
      var opt = document.createElement("option");
      opt.value = cid;
      opt.textContent = nodeLabel(n);
      sel.appendChild(opt);
    });
    sel.value = read(node, "ParentNodeId", "");
    val("wlpcEvDate").value = "";
    val("wlpcEvConf").value = "";
    val("wlpcEvNotes").value = "";
    renderEvents(node);
    modal.classList.remove("is-hidden");
    modal.style.display = "flex";
    renderEditorWarnings();
  }

  function hide() {
    if (!modal) return;
    modal.classList.add("is-hidden");
    modal.style.display = "none";
    current = null;
  }

  function save() {
    if (!current) { hide(); return; }
    var node = current;
    write(node, "Donor", val("wlpcDonor").value.trim());
    write(node, "Eye", val("wlpcEye").value);
    write(node, "Passage", val("wlpcPassage").value.trim());
    write(node, "Status", val("wlpcStatus").value);
    write(node, "Medium", val("wlpcMedium").value.trim());
    write(node, "Seeding", val("wlpcSeeding").value.trim());
    write(node, "Incubator", val("wlpcIncubator").value.trim());
    write(node, "SeedDate", val("wlpcSeedDate").value);
    write(node, "ParentNodeId", val("wlpcParent").value);
    write(node, "Notes", val("wlpcNotes").value.trim());

    // Reflect the culture identity on the canvas node label (e.g. "6769 OD P2")
    // — but DON'T clobber a name the user typed. Only overwrite when the label
    // is blank or still equals the summary we last auto-generated (tracked in
    // dataset.cultureLabelAuto, which persists with the node).
    var summary = LOGIC().cultureLabelSummary(recordOf(node));
    if (summary) {
      var ta = node.querySelector(".node-label");
      if (ta && LOGIC().shouldOverwriteLabel(ta.value, node.dataset.cultureLabelAuto, vesselTypeFromIcon(node))) {
        ta.value = summary;
        node.dataset.cultureLabelAuto = summary;
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        ta.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    // Tell app.js to persist the canvas (best-effort hooks).
    if (typeof window.wlpMarkCanvasDirty === "function") {
      try { window.wlpMarkCanvasDirty(); } catch (e) { /* ignore */ }
    }
    hide();
  }

  // Status → a small colour for badges/grid.
  function statusColor(s) {
    return { active: "#5eead4", frozen: "#7dd3fc", contaminated: "#fca5a5", discarded: "#94a3b8" }[s] || "#94a3b8";
  }

  // ─── Records grid (the recorder ledger view) ──────────────────────────────

  function allCultureVessels() {
    return Array.prototype.slice
      .call(document.querySelectorAll('.drop[data-workspace="cell-culture"]'))
      .filter(function (n) {
        var id = String(n.dataset.iconId || "");
        return id.indexOf("_flask") >= 0 || id.indexOf("dish_") === 0 || id === "cell_line" || id === "primary_tissue";
      });
  }

  // Warning messages (strings) for a node. Pass a precomputed peer-record list
  // to avoid re-gathering for every grid row.
  function warningsFor(node, peers) {
    return LOGIC()
      .cultureWarnings(recordOf(node), peers || allRecords())
      .map(function (w) { return w.message; });
  }

  function compareNodes(a, b) {
    return LOGIC().compareCultureRecords(recordOf(a), recordOf(b));
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  var view = null;
  var viewMode = "table"; // "table" | "tree"
  var filterQuery = "";
  var filterStatus = "all";
  var filterNeedsAttn = false;

  // The records to display after applying search + status + needs-attention
  // filters. Warnings are still computed against ALL records (peers) for context.
  function filteredRecords(all) {
    var q = filterQuery.trim();
    return all.filter(function (r) {
      if (q && !LOGIC().recordMatchesQuery(r, q)) return false;
      if (filterStatus !== "all" && (r.status || "active") !== filterStatus) return false;
      if (filterNeedsAttn && !LOGIC().cultureWarnings(r, all).length) return false;
      return true;
    });
  }

  // The recorder is rendered inline in the workspace area (where the canvas
  // lives) whenever the "Cell Culture Recorder" workspace tab is active.
  function buildView() {
    if (view) return view;
    var workspace = document.querySelector(".workspace");
    if (!workspace) return null;
    view = document.createElement("section");
    view.id = "wlpcRecordsView";
    view.style.cssText =
      "flex:1;margin:18px;border:1px solid rgba(148,163,184,.18);border-radius:18px;" +
      "background:#0b1220;overflow:auto;display:none";
    view.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px;' +
      'border-bottom:1px solid rgba(148,163,184,.12);position:sticky;top:0;background:#0b1220;z-index:1">' +
        '<div><h2 style="margin:0;font-size:1.15rem;color:#e5e7eb">Cell Culture Records</h2>' +
        '<div id="wlpcGridSub" style="font-size:.8125rem;color:#94a3b8;margin-top:2px"></div></div>' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<button type="button" id="wlpcImport" class="btn" title="Import vessels from a CSV file">Import CSV</button>' +
          '<input type="file" id="wlpcImportFile" accept=".csv,text/csv" style="display:none">' +
          '<div style="display:flex;border:1px solid rgba(148,163,184,.25);border-radius:8px;overflow:hidden">' +
            '<button type="button" id="wlpcModeTable" class="btn" style="border:0;border-radius:0;padding:6px 14px">Table</button>' +
            '<button type="button" id="wlpcModeTree" class="btn" style="border:0;border-radius:0;padding:6px 14px">Tree</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;align-items:center;padding:10px 16px;flex-wrap:wrap;' +
        'border-bottom:1px solid rgba(148,163,184,.08)">' +
        '<input type="search" id="wlpcSearch" class="modal__input" placeholder="Search donor, label, medium, vessel…" style="flex:1;min-width:170px">' +
        '<select id="wlpcStatusFilter" class="modal__input" style="width:auto">' +
          '<option value="all">All statuses</option>' +
          STATUSES.map(function (s) { return '<option value="' + s + '">' + s.charAt(0).toUpperCase() + s.slice(1) + "</option>"; }).join("") +
        "</select>" +
        '<label style="display:flex;align-items:center;gap:6px;font-size:.8rem;color:#94a3b8;white-space:nowrap">' +
          '<input type="checkbox" id="wlpcNeedsAttn"> Needs attention</label>' +
      "</div>" +
      '<div id="wlpcImportStatus" style="display:none;margin:0 16px;padding:8px 12px;border-radius:8px;' +
        'background:rgba(94,234,212,.12);color:#5eead4;font-size:.82rem"></div>' +
      '<div id="wlpcGridBody" style="padding:8px 16px 22px"></div>';
    workspace.appendChild(view);
    view.querySelector("#wlpcSearch").addEventListener("input", function (e) { filterQuery = e.target.value; renderView(); });
    view.querySelector("#wlpcStatusFilter").addEventListener("change", function (e) { filterStatus = e.target.value; renderView(); });
    view.querySelector("#wlpcNeedsAttn").addEventListener("change", function (e) { filterNeedsAttn = e.target.checked; renderView(); });
    var setMode = function (m) { viewMode = m; updateModeButtons(); renderView(); };
    view.querySelector("#wlpcModeTable").onclick = function () { setMode("table"); };
    view.querySelector("#wlpcModeTree").onclick = function () { setMode("tree"); };
    var fileInput = view.querySelector("#wlpcImportFile");
    view.querySelector("#wlpcImport").onclick = function () { fileInput.value = ""; fileInput.click(); };
    fileInput.onchange = function () {
      var f = fileInput.files && fileInput.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () { runCsvImport(String(reader.result || "")); };
      reader.readAsText(f);
    };
    updateModeButtons();
    return view;
  }
  function updateModeButtons() {
    if (!view) return;
    var on = "#134e4a", onText = "#5eead4", off = "transparent", offText = "#94a3b8";
    var t = view.querySelector("#wlpcModeTable"), r = view.querySelector("#wlpcModeTree");
    if (t) { t.style.background = viewMode === "table" ? on : off; t.style.color = viewMode === "table" ? onText : offText; }
    if (r) { r.style.background = viewMode === "tree" ? on : off; r.style.color = viewMode === "tree" ? onText : offText; }
  }
  function renderView() {
    if (viewMode === "tree") renderTree();
    else renderGrid();
  }

  // Subtitle shared by both views: "N vessels (M of N when filtered) · K need attention".
  function updateSubtitle(all, shown) {
    var flagged = all.filter(function (r) { return LOGIC().cultureWarnings(r, all).length; }).length;
    var filtered = shown.length !== all.length;
    view.querySelector("#wlpcGridSub").textContent =
      (filtered ? shown.length + " of " + all.length + " vessels" : all.length + (all.length === 1 ? " vessel" : " vessels")) +
      " in this project" + (flagged ? " · " + flagged + " need attention" : "");
  }
  function emptyMessage(filtered) {
    return filtered
      ? '<p style="color:#94a3b8;padding:40px 24px;text-align:center">No vessels match the current filter.</p>'
      : '<p style="color:#94a3b8;padding:40px 24px;text-align:center;line-height:1.6">No vessels yet.<br>' +
        'Switch to the <strong style="color:#e5e7eb">Cell Culture</strong> tab, drop a flask/dish/cell line ' +
        "onto the timeline, then double-click it to add its record, or use <strong>Import CSV</strong>.</p>";
  }

  function renderGrid() {
    if (!buildView()) return;
    var body = view.querySelector("#wlpcGridBody");
    var peers = allRecords(); // all records — warnings computed against the full set
    var shown = filteredRecords(peers);
    var shownIds = {};
    shown.forEach(function (r) { shownIds[r.nodeId] = true; });
    var vessels = allCultureVessels().filter(function (n) { return shownIds[n.dataset.nodeId]; }).sort(compareNodes);
    updateSubtitle(peers, shown);
    if (!vessels.length) {
      body.innerHTML = emptyMessage(peers.length > 0);
      return;
    }
    var rows = vessels.map(function (n) {
      var w = warningsFor(n, peers);
      var status = read(n, "Status", "active");
      var warn = w.length
        ? '<span title="' + esc(w.join(", ")) + '" style="color:#fca5a5">&#9888; ' + w.length + "</span>"
        : '<span style="color:#475569">&#10003;</span>';
      return (
        '<tr data-node-id="' + esc(n.dataset.nodeId) + '" style="cursor:pointer;border-top:1px solid rgba(148,163,184,.10)">' +
        td(read(n, "Donor", "") || '<span style="color:#64748b">—</span>', "font-weight:600") +
        td(read(n, "Eye", "")) +
        td(read(n, "Passage", "") !== "" ? "P" + read(n, "Passage", "") : "") +
        td(vesselTypeFromIcon(n)) +
        '<td style="padding:8px 10px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;' +
          'background:' + statusColor(status) + ';margin-right:6px"></span>' + esc(status) + "</td>" +
        td(read(n, "Medium", "")) +
        td(read(n, "SeedDate", "")) +
        td(parentLabelOf(n)) +
        '<td style="padding:8px 10px;text-align:center">' + warn + "</td>" +
        "</tr>"
      );
    }).join("");
    body.innerHTML =
      '<table style="width:100%;border-collapse:collapse;font-size:.8125rem;color:#e5e7eb">' +
      '<thead><tr style="color:#94a3b8;text-align:left">' +
        th("Donor") + th("Eye") + th("P#") + th("Vessel") + th("Status") + th("Medium") +
        th("Seed date") + th("Lineage parent") + th("⚠") +
      "</tr></thead><tbody>" + rows + "</tbody></table>";
    Array.prototype.forEach.call(body.querySelectorAll("tr[data-node-id]"), function (tr) {
      tr.addEventListener("mouseenter", function () { tr.style.background = "rgba(148,163,184,.06)"; });
      tr.addEventListener("mouseleave", function () { tr.style.background = ""; });
      tr.addEventListener("click", function () {
        var id = tr.getAttribute("data-node-id");
        var node = document.querySelector('.drop[data-node-id="' + id + '"]');
        if (!node) return;
        // Jump to the Cell Culture timeline, focus the vessel, open its record.
        if (typeof window.wlpSetWorkspace === "function") window.wlpSetWorkspace("cell-culture");
        syncView();
        setTimeout(function () {
          if (typeof window.wlpFocusNode === "function") window.wlpFocusNode(id);
          openRecord(node);
        }, 80);
      });
    });
  }
  function td(html, extra) { return '<td style="padding:8px 10px;' + (extra || "") + '">' + html + "</td>"; }
  function th(t) { return '<th style="padding:8px 10px;font-weight:600">' + t + "</th>"; }
  function parentLabelOf(n) {
    var pid = read(n, "ParentNodeId", "");
    if (!pid) return "";
    var p = document.querySelector('.drop[data-node-id="' + pid + '"]');
    return p ? esc(nodeLabel(p)) : "";
  }

  function recordName(r) {
    return (r.label && r.label.trim()) || LOGIC().cultureLabelSummary(r) || r.nodeId;
  }

  // Wire a clickable row/tree-node -> jump to the Cell Culture timeline + edit.
  function wireRowClick(el) {
    el.addEventListener("mouseenter", function () { el.style.background = "rgba(148,163,184,.06)"; });
    el.addEventListener("mouseleave", function () { el.style.background = ""; });
    el.addEventListener("click", function () {
      var id = el.getAttribute("data-node-id");
      var node = document.querySelector('.drop[data-node-id="' + id + '"]');
      if (!node) return;
      if (typeof window.wlpSetWorkspace === "function") window.wlpSetWorkspace("cell-culture");
      syncView();
      setTimeout(function () {
        if (typeof window.wlpFocusNode === "function") window.wlpFocusNode(id);
        openRecord(node);
      }, 80);
    });
  }

  // Candidate match keys for a draft, used to resolve a CSV's parent label to a
  // just-created vessel (explicit label, culture identity, donor+passage forms).
  function importLabelKeys(d) {
    var norm = function (s) { return String(s || "").replace(/\s+/g, " ").trim().toLowerCase(); };
    var keys = [];
    if (d.label) keys.push(norm(d.label));
    var summary = LOGIC().cultureLabelSummary(d);
    if (summary) keys.push(norm(summary));
    if (d.donor && d.passage !== "" && d.passage != null) {
      keys.push(norm(d.donor + " p" + d.passage));
      keys.push(norm(d.donor + " " + d.passage));
    }
    return keys;
  }

  function showImportStatus(msg, isError) {
    if (!view) return;
    var box = view.querySelector("#wlpcImportStatus");
    if (!box) return;
    box.style.display = "";
    box.style.background = isError ? "rgba(252,165,165,.12)" : "rgba(94,234,212,.12)";
    box.style.color = isError ? "#fca5a5" : "#5eead4";
    box.textContent = msg;
    setTimeout(function () { if (box) box.style.display = "none"; }, 6000);
  }

  function runCsvImport(text) {
    var parsed = LOGIC().importCsvToDrafts(text);
    if (!parsed.rowCount) { showImportStatus("No data rows found in that CSV.", true); return; }
    if (typeof window.wlpCreateCultureVessel !== "function") { showImportStatus("Import unavailable in this build.", true); return; }
    // Create the vessels on the Cell Culture timeline.
    if (typeof window.wlpSetWorkspace === "function") window.wlpSetWorkspace("cell-culture");
    var created = parsed.drafts.map(function (d, i) {
      return { draft: d, nodeId: window.wlpCreateCultureVessel(d, i) };
    });
    // Resolve parent labels to just-created vessels.
    var byLabel = {};
    created.forEach(function (c) {
      importLabelKeys(c.draft).forEach(function (k) { if (k && !byLabel[k]) byLabel[k] = c.nodeId; });
    });
    var linked = 0;
    created.forEach(function (c) {
      var pl = String(c.draft.parentLabel || "").replace(/\s+/g, " ").trim().toLowerCase();
      if (!pl) return;
      var pid = byLabel[pl];
      if (pid && pid !== c.nodeId) {
        var node = document.querySelector('.drop[data-node-id="' + c.nodeId + '"]');
        if (node) { node.dataset.cultureParentNodeId = pid; linked++; }
      }
    });
    if (typeof window.wlpMarkCanvasDirty === "function") window.wlpMarkCanvasDirty();
    // Back to the recorder + re-render.
    if (typeof window.wlpSetWorkspace === "function") window.wlpSetWorkspace("culture-records");
    setTimeout(function () {
      renderView();
      showImportStatus(
        "Imported " + created.length + " vessel" + (created.length === 1 ? "" : "s") +
        (linked ? " · " + linked + " linked to a parent" : "") + "."
      );
    }, 120);
  }

  // The lineage tree: donor/eye-grouped parent→child genealogy.
  function renderTree() {
    if (!buildView()) return;
    var body = view.querySelector("#wlpcGridBody");
    var all = allRecords();
    var shown = filteredRecords(all);
    updateSubtitle(all, shown);
    var flat = LOGIC().flattenForest(LOGIC().buildLineageForest(shown));
    if (!flat.length) {
      body.innerHTML = emptyMessage(all.length > 0);
      return;
    }
    var records = all; // warnings computed against the full set
    var html = "";
    var lastGroup = null;
    flat.forEach(function (item) {
      var r = item.record;
      if (item.depth === 0) {
        var group = (String(r.donor || "").trim() || "Unknown donor") +
          (r.eye && r.eye !== "unknown" ? " · " + r.eye : "");
        if (group !== lastGroup) {
          html += '<div style="margin:14px 6px 4px;color:#94a3b8;font-size:.72rem;letter-spacing:.04em;' +
            'text-transform:uppercase;font-weight:600">' + esc(group) + "</div>";
          lastGroup = group;
        }
      }
      var indent = 12 + item.depth * 22;
      var warnN = LOGIC().cultureWarnings(r, records).length;
      var dot = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' +
        statusColor(r.status || "active") + ';margin-right:8px"></span>';
      var connector = item.depth > 0 ? '<span style="color:#475569">&#9492;&#9472; </span>' : "";
      var meta = (r.passage !== "" && r.passage != null ? "P" + r.passage + " · " : "") +
        esc(LOGIC().vesselTypeFromIcon(r.iconId)) + " · " + esc(r.status || "active");
      var warn = warnN ? ' <span style="color:#fca5a5;font-size:.72rem">&#9888; ' + warnN + "</span>" : "";
      html +=
        '<div data-node-id="' + esc(r.nodeId) + '" style="cursor:pointer;padding:6px 10px;padding-left:' +
        indent + 'px;border-radius:6px;font-size:.82rem;color:#e5e7eb">' +
        connector + dot + "<strong>" + esc(recordName(r)) + "</strong> " +
        '<span style="color:#94a3b8">' + meta + "</span>" + warn + "</div>";
    });
    body.innerHTML = html;
    Array.prototype.forEach.call(body.querySelectorAll("div[data-node-id]"), wireRowClick);
  }

  // Show the records view (and hide the canvas + palette) while the recorder
  // workspace tab is active; restore them otherwise.
  var canvasEl = null;
  var paletteEl = null;
  function syncView() {
    var ws = typeof window.wlpActiveWorkspace === "function" ? window.wlpActiveWorkspace() : "";
    var isRecorder = ws === "culture-records";
    if (!canvasEl) canvasEl = document.getElementById("canvas");
    if (!paletteEl) paletteEl = document.querySelector(".palette");
    var logEl = document.querySelector(".log-panel");
    // The timeline controls (Today / zoom) are irrelevant in the grid, but the
    // workspace TABS live in the toolbar too — hide only the actions, not the bar.
    var actions = document.querySelector(".workspace__actions");
    if (isRecorder) {
      renderView();
      if (view) view.style.display = "block";
      if (canvasEl) canvasEl.style.display = "none";
      if (paletteEl) paletteEl.style.display = "none";
      if (logEl) logEl.style.display = "none";
      if (actions) actions.style.visibility = "hidden";
    } else {
      if (view) view.style.display = "none";
      if (canvasEl) canvasEl.style.display = "";
      if (paletteEl) paletteEl.style.display = "";
      if (logEl) logEl.style.display = "";
      if (actions) actions.style.visibility = "";
    }
  }

  document.addEventListener("click", function (e) {
    if (e.target && e.target.closest && e.target.closest(".workspace-tab")) setTimeout(syncView, 60);
  });
  setInterval(syncView, 1200);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(syncView, 500); });
  } else {
    setTimeout(syncView, 500);
  }

  window.WLPCulture = {
    openRecord: openRecord,
    showRecords: function () { if (typeof window.wlpSetWorkspace === "function") window.wlpSetWorkspace("culture-records"); },
    read: read,
    statusColor: statusColor,
    vesselTypeFromIcon: vesselTypeFromIcon,
    nodeLabel: nodeLabel,
  };
})();
