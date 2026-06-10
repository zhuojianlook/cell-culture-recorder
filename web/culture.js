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
    return {
      nodeId: node.dataset.nodeId || "",
      donor: read(node, "Donor", ""),
      eye: read(node, "Eye", ""),
      passage: read(node, "Passage", ""),
      seedDate: read(node, "SeedDate", ""),
      status: read(node, "Status", "active"),
      parentNodeId: read(node, "ParentNodeId", ""),
    };
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
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) hide(); });
    modal = backdrop;
    return modal;
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
    var allRecords = allCultureVessels().map(recordOf);
    var selfId = node.dataset.nodeId || "";
    otherVessels(node).forEach(function (n) {
      var cid = n.dataset.nodeId || "";
      if (LOGIC().wouldCreateCycle(allRecords, selfId, cid)) return;
      var opt = document.createElement("option");
      opt.value = cid;
      opt.textContent = nodeLabel(n);
      sel.appendChild(opt);
    });
    sel.value = read(node, "ParentNodeId", "");
    val("wlpcErr").textContent = "";
    modal.classList.remove("is-hidden");
    modal.style.display = "flex";
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

  function warningsFor(node) {
    return LOGIC().cultureWarnings(recordOf(node));
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
      '</div>' +
      '<div id="wlpcGridBody" style="padding:8px 16px 22px"></div>';
    workspace.appendChild(view);
    return view;
  }

  function renderGrid() {
    if (!buildView()) return;
    var body = view.querySelector("#wlpcGridBody");
    var vessels = allCultureVessels().sort(compareNodes);
    view.querySelector("#wlpcGridSub").textContent =
      vessels.length + (vessels.length === 1 ? " vessel" : " vessels") + " in this project";
    if (!vessels.length) {
      body.innerHTML =
        '<p style="color:#94a3b8;padding:40px 24px;text-align:center;line-height:1.6">No vessels yet.<br>' +
        'Switch to the <strong style="color:#e5e7eb">Cell Culture</strong> tab, drop a flask/dish/cell line ' +
        "onto the timeline, then double-click it to add its record.</p>";
      return;
    }
    var rows = vessels.map(function (n) {
      var w = warningsFor(n);
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
      renderGrid();
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
