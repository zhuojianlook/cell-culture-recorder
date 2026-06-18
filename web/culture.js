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
  // Vessel types offered by the recorder's "Add vessel" control (matches the
  // Cell Culture palette icons; labels come from WLPCultureLogic.VESSEL_TYPES).
  var VESSEL_ICON_ORDER = [
    "t25_flask", "t75_flask", "t150_flask", "t175_flask", "t225_flask", "t300_flask",
    "dish_35mm", "dish_60mm", "dish_100mm", "dish_150mm", "cell_line", "primary_tissue",
  ];

  // Culture fields persisted on node.dataset (camelCase -> data-culture-*).
  function read(node, key, fallback) {
    var v = node.dataset["culture" + key];
    return v == null || v === "" ? (fallback == null ? "" : fallback) : v;
  }
  function write(node, key, val) {
    if (val == null || val === "") delete node.dataset["culture" + key];
    else node.dataset["culture" + key] = String(val);
  }
  // The record type a freshly-placed node defaults to: a primary-tissue icon is
  // Donor Tissue; everything else (flask/dish/cell line) is a Culture Vessel.
  function defaultRecordType(iconId) {
    return String(iconId) === "primary_tissue" ? "primary_tissue_dissociation" : "culture_vessel";
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
      // Provenance / source-tracking (drive the conflict + ground-truth warnings).
      sourceRecordType: read(node, "SourceRecordType", ""),
      rawSourceIdentifier: read(node, "RawSourceIdentifier", ""),
      groundTruthDateField: read(node, "GroundTruthDateField", ""),
      dissociationDate: read(node, "DissociationDate", ""),
      pretreatmentDate: read(node, "PretreatmentDate", ""),
      splitDate: read(node, "SplitDate", ""),
      conflictResolution: read(node, "ConflictResolution", ""),
      events: LOGIC().parseEvents(node.dataset.cultureEvents),
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
          '<span id="wlpcRecVessel" style="font-size:.8125rem;color:var(--muted,#8e8e93)"></span>' +
        '</div>' +
        '<div class="modal__body" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
          // Record type — the first, framing choice for every record.
          '<div class="field" style="grid-column:1/-1">' +
            '<label for="wlpcSourceType">Record type</label>' +
            provSelect("wlpcSourceType", LOGIC().SOURCE_RECORD_TYPES, LOGIC().sourceRecordLabel) +
            '<div style="font-size:.72rem;color:#636366;margin-top:3px">Is this a piece of <strong>donor tissue</strong> (the raw source) or a <strong>culture vessel</strong> (a flask/dish/cell line)? Drives the source-conflict and ground-truth checks.</div>' +
          '</div>' +
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
          provenanceSection() +
          // Events / passaging log
          '<div class="field" style="grid-column:1/-1">' +
            '<label>Events &amp; passaging</label>' +
            '<div id="wlpcEventsList" style="max-height:130px;overflow:auto;border:1px solid rgba(142, 142, 147,.18);border-radius:8px;background:rgba(20, 20, 22,.35)"></div>' +
            '<div style="display:flex;gap:6px;margin-top:6px;align-items:center;flex-wrap:wrap">' +
              eventTypeSelect() +
              '<input type="date" id="wlpcEvDate" class="modal__input" style="width:auto">' +
              '<input type="number" id="wlpcEvConf" class="modal__input" placeholder="conf %" min="0" max="100" style="width:78px">' +
              '<input type="text" id="wlpcEvNotes" class="modal__input" placeholder="notes (optional)" style="flex:1;min-width:90px">' +
              '<button type="button" id="wlpcEvAdd" class="btn">+ Record</button>' +
            '</div>' +
          '</div>' +
          '<div id="wlpcErr" class="form-status" style="grid-column:1/-1;color:#ff6961"></div>' +
        '</div>' +
        '<div class="modal__footer" style="display:flex;gap:8px;align-items:center;padding:14px 16px">' +
          '<button type="button" id="wlpcViewRecords" class="btn" title="Show this vessel in the Records table">View in Records</button>' +
          '<span style="flex:1"></span>' +
          '<button type="button" id="wlpcCancel" class="btn">Cancel</button>' +
          '<button type="button" id="wlpcSave" class="btn btn--primary">Save record</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(backdrop);
    backdrop.querySelector("#wlpcCancel").onclick = hide;
    backdrop.querySelector("#wlpcSave").onclick = save;
    backdrop.querySelector("#wlpcViewRecords").onclick = function () {
      if (current) viewInRecords(current.dataset.nodeId || "");
    };
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
      iconId: current.dataset.iconId || "",
      label: (ta && ta.value) || "",
      donor: val("wlpcDonor").value.trim(),
      eye: val("wlpcEye").value,
      passage: val("wlpcPassage").value.trim(),
      seedDate: val("wlpcSeedDate").value,
      status: val("wlpcStatus").value,
      parentNodeId: val("wlpcParent").value,
      // Provenance / source-tracking (the editor's collapsible section).
      sourceRecordType: val("wlpcSourceType").value,
      rawSourceIdentifier: val("wlpcRawSource").value.trim(),
      groundTruthDateField: val("wlpcGroundTruth").value,
      dissociationDate: val("wlpcDissocDate").value,
      pretreatmentDate: val("wlpcPretreatDate").value,
      splitDate: val("wlpcSplitDate").value,
      conflictResolution: val("wlpcConflictRes").value.trim(),
      events: LOGIC().parseEvents(current.dataset.cultureEvents),
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
    box.style.color = "#ffd60a";
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
        '<div style="color:#636366;font-size:.78rem;padding:8px 10px">No events yet — record a passage, feed, freeze, etc.</div>';
      return;
    }
    list.innerHTML = events
      .map(function (ev) {
        var detail = LOGIC().summarizeEvent(ev);
        var notes = ev.notes ? " — " + esc(ev.notes) : "";
        return (
          '<div style="font-size:.78rem;padding:5px 10px;border-bottom:1px solid rgba(142, 142, 147,.08)">' +
          '<span style="color:#5a7fa8;font-weight:600">' + esc(String(ev.type).replace("_", " ")) + "</span> " +
          '<span style="color:#8e8e93">' + esc(ev.at || "") + (detail ? " · " + esc(detail) : "") + "</span>" +
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
  // A <select> whose option labels come from a label function (value !== label).
  function provSelect(id, values, labelFn) {
    var o = (values || []).map(function (v) {
      return '<option value="' + esc(v) + '">' + esc(labelFn(v)) + "</option>";
    }).join("");
    return '<select id="' + id + '" class="modal__input">' + o + "</select>";
  }
  // Collapsible provenance / source-tracking fields. Collapsed by default so the
  // common case (a plain vessel) stays uncluttered; warnings reference these
  // fields when filled in (see culture-logic.js cultureWarnings).
  function provenanceSection() {
    var L = LOGIC();
    return (
      '<details class="field" style="grid-column:1/-1;border:1px solid rgba(142, 142, 147,.18);' +
        'border-radius:8px;padding:8px 10px">' +
        '<summary style="cursor:pointer;color:#8e8e93;font-size:.82rem;user-select:none">' +
          "Provenance &amp; source tracking</summary>" +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px">' +
          '<div class="field"><label for="wlpcRawSource">Raw source identifier</label>' +
            '<input type="text" id="wlpcRawSource" class="modal__input" placeholder="tissue sample ID, notebook ref…"></div>' +
          '<div class="field"><label for="wlpcGroundTruth">Ground-truth date</label>' +
            provSelect("wlpcGroundTruth", L.GROUND_TRUTH_DATE_FIELDS, L.groundTruthLabel) +
            '<div style="font-size:.68rem;color:#636366;margin-top:3px">Which date is authoritative for age &amp; lineage sorting.</div></div>' +
          '<div class="field"><label for="wlpcDissocDate">Dissociation date</label>' +
            '<input type="date" id="wlpcDissocDate" class="modal__input"></div>' +
          '<div class="field"><label for="wlpcPretreatDate">Pretreatment date</label>' +
            '<input type="date" id="wlpcPretreatDate" class="modal__input"></div>' +
          '<div class="field"><label for="wlpcSplitDate">Split date</label>' +
            '<input type="date" id="wlpcSplitDate" class="modal__input"></div>' +
          '<div class="field" style="grid-column:1/-1"><label for="wlpcConflictRes">Conflict resolution note</label>' +
            '<textarea id="wlpcConflictRes" class="modal__input" rows="2" style="resize:vertical" ' +
            'placeholder="How a date/source ambiguity was resolved (required when ground truth is unresolved)"></textarea></div>' +
        "</div>" +
      "</details>"
    );
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
    // Provenance / source-tracking
    val("wlpcSourceType").value = read(node, "SourceRecordType", defaultRecordType(node.dataset.iconId));
    val("wlpcRawSource").value = read(node, "RawSourceIdentifier", "");
    val("wlpcGroundTruth").value = read(node, "GroundTruthDateField", "seed_date");
    val("wlpcDissocDate").value = read(node, "DissociationDate", "");
    val("wlpcPretreatDate").value = read(node, "PretreatmentDate", "");
    val("wlpcSplitDate").value = read(node, "SplitDate", "");
    val("wlpcConflictRes").value = read(node, "ConflictResolution", "");
    // Lineage parent options — exclude vessels that would form a cycle
    // (this node's own descendants).
    var sel = val("wlpcParent");
    sel.innerHTML = '<option value="">— none —</option>';
    var peerRecords = allRecords();
    var selfId = node.dataset.nodeId || "";
    var selfRec = recordOf(node);
    otherVessels(node).forEach(function (n) {
      var cid = n.dataset.nodeId || "";
      // A passage parent must be the same donor + eye.
      if (!LOGIC().sameDonorEye(selfRec, recordOf(n))) return;
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
    var prevParent = read(node, "ParentNodeId", ""); // capture before overwrite
    write(node, "Donor", val("wlpcDonor").value.trim());
    write(node, "Eye", val("wlpcEye").value);
    write(node, "Passage", val("wlpcPassage").value.trim());
    write(node, "Status", val("wlpcStatus").value);
    write(node, "Medium", val("wlpcMedium").value.trim());
    write(node, "Seeding", val("wlpcSeeding").value.trim());
    write(node, "Incubator", val("wlpcIncubator").value.trim());
    write(node, "SeedDate", val("wlpcSeedDate").value);
    // Donor/Eye were just written above; drop the lineage parent if it's no longer
    // the same donor+eye (e.g. the user changed donor/eye after picking a parent).
    var chosenParent = val("wlpcParent").value;
    if (chosenParent) {
      var parentNode = document.querySelector('.drop[data-node-id="' + chosenParent + '"]');
      if (parentNode && !LOGIC().sameDonorEye(recordOf(node), recordOf(parentNode))) chosenParent = "";
    }
    write(node, "ParentNodeId", chosenParent);
    write(node, "Notes", val("wlpcNotes").value.trim());
    // Provenance / source-tracking — store enums only when non-default, so a
    // plain vessel keeps a lean dataset.
    var st = val("wlpcSourceType").value;
    write(node, "SourceRecordType", st === "culture_vessel" ? "" : st);
    write(node, "RawSourceIdentifier", val("wlpcRawSource").value.trim());
    var gt = val("wlpcGroundTruth").value;
    write(node, "GroundTruthDateField", gt === "seed_date" ? "" : gt);
    write(node, "DissociationDate", val("wlpcDissocDate").value);
    write(node, "PretreatmentDate", val("wlpcPretreatDate").value);
    write(node, "SplitDate", val("wlpcSplitDate").value);
    write(node, "ConflictResolution", val("wlpcConflictRes").value.trim());
    // Computed authoritative date (derived from the chosen ground-truth field) —
    // stored so future lineage/exports use one consistent date per vessel.
    write(node, "GroundTruthDate", LOGIC().groundTruthDate(recordOf(node)));

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
    // Sync the passage as a real node-to-node connection on the Cell Culture
    // canvas (create for the new parent, remove the old link if the parent changed).
    if (typeof window.wlpSyncLineageConnection === "function") {
      try { window.wlpSyncLineageConnection(node.dataset.nodeId || "", read(node, "ParentNodeId", ""), prevParent); } catch (e) { /* ignore */ }
    }
    try { renderBadges(); } catch (e) { /* ignore */ }
    hide();
    // Keep the recorder grid/tree in sync immediately after an edit.
    if (view && view.style.display !== "none") renderView();
  }

  // Status → a small colour for pills/badges/grid/tree (shared so all surfaces
  // agree). Green = healthy/active; cyan = frozen; red = contaminated; grey = discarded.
  function statusColor(s) {
    return { active: "#63a66a", frozen: "#64d2ff", contaminated: "#ff453a", discarded: "#8e8e93" }[s] || "#8e8e93";
  }

  // ─── Map integration: per-node status + warning badges ────────────────────
  // Overlay a small status dot (+ ⚠ count) on each culture vessel on the Cell
  // Culture canvas, so the map surfaces what the Records views show. The badge is
  // a child of the node, so it tracks position for free; we only re-render on a
  // data change (edit/add/import/load) or while the cell-culture tab is active.
  function renderBadges() {
    var nodes = allCultureVessels();
    if (!nodes.length) return;
    var records = nodes.map(recordOf);
    nodes.forEach(function (n, i) {
      var warns = LOGIC().cultureWarnings(records[i], records).length;
      var status = read(n, "Status", "active");
      var badge = n.querySelector(".wlpc-badge");
      if (!badge) {
        badge = document.createElement("div");
        badge.className = "wlpc-badge";
        badge.style.cssText =
          "position:absolute;top:3px;right:3px;display:flex;gap:3px;align-items:center;pointer-events:none;z-index:4";
        n.appendChild(badge);
      }
      var dot = '<span title="' + esc(status) + '" style="width:9px;height:9px;border-radius:50%;background:' +
        statusColor(status) + ';border:1.5px solid #2c2c2e;box-sizing:content-box"></span>';
      var warn = warns
        ? '<span title="' + warns + (warns === 1 ? " thing" : " things") + ' to check" ' +
          'style="background:#ff453a;color:#2c2c2e;font:600 9px/1 system-ui;border-radius:8px;padding:2px 4px;border:1.5px solid #2c2c2e">&#9888; ' + warns + "</span>"
        : "";
      badge.innerHTML = dot + warn;
    });
  }
  window.wlpRenderCultureBadges = renderBadges;

  // Jump from a vessel's editor to its row in the Records table + flash it.
  function viewInRecords(nodeId) {
    hide();
    if (typeof window.wlpSetWorkspace === "function") window.wlpSetWorkspace("culture-records");
    viewMode = "table";
    setTimeout(function () {
      syncView();
      updateModeButtons();
      highlightRow(nodeId);
    }, 90);
  }
  function highlightRow(nodeId) {
    if (!view || !nodeId) return;
    var tr = view.querySelector('tr[data-node-id="' + nodeId + '"]');
    if (!tr) return;
    try { tr.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) { tr.scrollIntoView(); }
    tr.style.transition = "background .3s";
    tr.style.background = "rgba(90, 127, 168,.25)";
    setTimeout(function () { if (tr) tr.style.background = ""; }, 1500);
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
    view.className = "wlpc-view";
    view.innerHTML =
      '<div class="wlpc-toolbar">' +
        '<div><h2 class="wlpc-toolbar__title">Cell Culture Records</h2>' +
          '<div id="wlpcGridSub" class="wlpc-toolbar__sub"></div></div>' +
        '<div class="wlpc-toolbar__actions">' +
          '<div style="display:flex;align-items:center;gap:6px">' +
            '<select id="wlpcAddType" class="modal__input" style="width:auto" title="Vessel type for the new record">' +
              vesselTypeOptions() +
            "</select>" +
            '<button type="button" id="wlpcAdd" class="btn btn--primary" title="Add a new culture vessel">+ Add vessel</button>' +
          "</div>" +
          '<button type="button" id="wlpcImport" class="btn" title="Import vessels from a CSV file">Import CSV</button>' +
          '<input type="file" id="wlpcImportFile" accept=".csv,text/csv" style="display:none">' +
          '<div class="wlpc-seg">' +
            '<button type="button" id="wlpcModeTable">Table</button>' +
            '<button type="button" id="wlpcModeTree">Tree</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="wlpc-filters">' +
        '<input type="search" id="wlpcSearch" class="modal__input" placeholder="Search donor, label, medium, vessel…">' +
        '<select id="wlpcStatusFilter" class="modal__input" style="width:auto">' +
          '<option value="all">All statuses</option>' +
          STATUSES.map(function (s) { return '<option value="' + s + '">' + s.charAt(0).toUpperCase() + s.slice(1) + "</option>"; }).join("") +
        "</select>" +
        '<label class="wlpc-check"><input type="checkbox" id="wlpcNeedsAttn"> Needs attention</label>' +
      "</div>" +
      '<div id="wlpcImportStatus" class="wlpc-banner wlpc-banner--info" style="display:none"></div>' +
      '<div id="wlpcGridBody"></div>';
    workspace.appendChild(view);
    view.querySelector("#wlpcSearch").addEventListener("input", function (e) { filterQuery = e.target.value; renderView(); });
    view.querySelector("#wlpcStatusFilter").addEventListener("change", function (e) { filterStatus = e.target.value; renderView(); });
    view.querySelector("#wlpcNeedsAttn").addEventListener("change", function (e) { filterNeedsAttn = e.target.checked; renderView(); });
    var setMode = function (m) { viewMode = m; updateModeButtons(); renderView(); };
    view.querySelector("#wlpcModeTable").onclick = function () { setMode("table"); };
    view.querySelector("#wlpcModeTree").onclick = function () { setMode("tree"); };
    view.querySelector("#wlpcAdd").onclick = function () {
      addVessel(view.querySelector("#wlpcAddType").value);
    };
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
    var t = view.querySelector("#wlpcModeTable"), r = view.querySelector("#wlpcModeTree");
    if (t) t.classList.toggle("is-active", viewMode === "table");
    if (r) r.classList.toggle("is-active", viewMode === "tree");
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
      ? '<p class="wlpc-empty">No vessels match the current filter.</p>'
      : '<p class="wlpc-empty">No vessels yet.<br>Switch to the <strong>Cell Culture</strong> tab, drop a flask/dish/cell line ' +
        "onto the timeline, then double-click it to add its record, or use <strong>Import CSV</strong>.</p>";
  }

  // Donor+Eye grouping key/label for the table view — all passages from the same
  // donor eye (e.g. 6768 OS = left cornea) share one group.
  function gridGroupKey(n) {
    return read(n, "Donor", "").trim().toLowerCase() + "|" + (read(n, "Eye", "").trim() || "unknown");
  }
  function gridGroupLabel(n) {
    var donor = read(n, "Donor", "").trim() || "Unknown donor";
    var eye = read(n, "Eye", "").trim();
    return donor + (eye && eye !== "unknown" ? " · " + eye : "");
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

    // Group the (donor/eye/passage/seed-sorted) vessels by donor + eye, so every
    // passage from the same tissue sits under one header.
    var groups = [], byKey = {};
    vessels.forEach(function (n) {
      var key = gridGroupKey(n);
      var g = byKey[key];
      if (!g) { g = byKey[key] = { label: gridGroupLabel(n), nodes: [] }; groups.push(g); }
      g.nodes.push(n);
    });

    function vesselRow(n) {
      var w = warningsFor(n, peers);
      var status = read(n, "Status", "active");
      var pass = read(n, "Passage", "");
      var warn = w.length
        ? '<span class="wlpc-warn" title="' + esc(w.join(", ")) + '">&#9888; ' + w.length + "</span>"
        : '<span class="wlpc-ok">&#10003;</span>';
      return (
        '<tr data-node-id="' + esc(n.dataset.nodeId) + '">' +
        '<td class="wlpc-col-label">' + esc(nodeLabel(n)) + "</td>" +
        '<td class="wlpc-col-p">' + (pass !== "" ? "P" + esc(pass) : "") + "</td>" +
        "<td>" + esc(vesselTypeFromIcon(n)) + "</td>" +
        '<td><span class="wlpc-pill" style="color:' + statusColor(status) + '">' +
          esc(status.charAt(0).toUpperCase() + status.slice(1)) + "</span></td>" +
        "<td>" + esc(read(n, "Medium", "")) + "</td>" +
        '<td class="wlpc-col-date">' + esc(read(n, "SeedDate", "")) + "</td>" +
        "<td>" + parentLabelOf(n) + "</td>" +
        '<td class="wlpc-col-warn">' + warn + "</td>" +
        "</tr>"
      );
    }

    var bodyRows = groups.map(function (g) {
      var warnN = g.nodes.filter(function (n) { return warningsFor(n, peers).length; }).length;
      var countChip = '<span class="wlpc-chip">' + g.nodes.length + (g.nodes.length === 1 ? " vessel" : " vessels") + "</span>";
      var warnChip = warnN ? '<span class="wlpc-chip wlpc-chip--warn">' + warnN + " to check</span>" : "";
      var header =
        '<tr class="wlpc-group"><td colspan="8">' +
          '<span class="wlpc-group__name">' + esc(g.label) + "</span>" + countChip + warnChip +
        "</td></tr>";
      return header + g.nodes.map(vesselRow).join("");
    }).join("");

    body.innerHTML =
      '<table class="wlpc-table"><thead><tr>' +
        th("Vessel / label") + th("P#") + th("Type") + th("Status") + th("Medium") +
        th("Seed date") + th("Lineage parent") + th("⚠") +
      "</tr></thead><tbody>" + bodyRows + "</tbody></table>";
    Array.prototype.forEach.call(body.querySelectorAll("tr[data-node-id]"), function (tr) {
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
  function th(t) { return "<th>" + t + "</th>"; }
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
  // (Hover is handled by CSS :hover on .wlpc-tree-row.)
  function wireRowClick(el) {
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
    box.className = "wlpc-banner " + (isError ? "wlpc-banner--err" : "wlpc-banner--info");
    box.style.display = "";
    box.textContent = msg;
    setTimeout(function () { if (box) box.style.display = "none"; }, 6000);
  }

  // <option> list of vessel types for the "Add vessel" picker (T75 default).
  function vesselTypeOptions() {
    return VESSEL_ICON_ORDER.map(function (id) {
      return '<option value="' + id + '"' + (id === "t75_flask" ? " selected" : "") + ">" +
        esc(LOGIC().vesselTypeFromIcon(id)) + "</option>";
    }).join("");
  }

  // Create a new culture vessel straight from the recorder. The vessel node lives
  // on the Cell Culture canvas (that's what the grid reads), so we switch there to
  // create it — tagging it data-workspace="cell-culture" — then return to the
  // recorder and open the new record's editor.
  function addVessel(iconId) {
    if (typeof window.wlpCreateCultureVessel !== "function") {
      showImportStatus("Adding vessels isn’t available in this build.", true);
      return;
    }
    if (typeof window.wlpSetWorkspace === "function") window.wlpSetWorkspace("cell-culture");
    var nodeId = window.wlpCreateCultureVessel({ iconId: iconId || "t75_flask" }, allCultureVessels().length);
    if (typeof window.wlpSetWorkspace === "function") window.wlpSetWorkspace("culture-records");
    if (typeof window.wlpMarkCanvasDirty === "function") window.wlpMarkCanvasDirty();
    setTimeout(function () {
      renderView();
      try { renderBadges(); } catch (e) { /* ignore */ }
      var node = nodeId && document.querySelector('.drop[data-node-id="' + nodeId + '"]');
      if (node) openRecord(node);
      else showImportStatus("Couldn’t create the vessel — try the Cell Culture tab.", true);
    }, 60);
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
    // Resolve each parent label ONLY among vessels that share the child's donor+eye
    // (a passage is always within one tissue), so a bare label like "P0" can't bind
    // across donors. Cycle-guarded.
    var linked = 0;
    created.forEach(function (c) {
      var pl = String(c.draft.parentLabel || "").replace(/\s+/g, " ").trim().toLowerCase();
      if (!pl) return;
      var match = null;
      for (var i = 0; i < created.length; i++) {
        var cand = created[i];
        if (cand.nodeId === c.nodeId) continue;
        if (!LOGIC().sameDonorEye(c.draft, cand.draft)) continue;
        if (importLabelKeys(cand.draft).indexOf(pl) >= 0) { match = cand; break; }
      }
      if (!match) return;
      var node = document.querySelector('.drop[data-node-id="' + c.nodeId + '"]');
      var recs = allCultureVessels().map(function (n) {
        return { nodeId: n.dataset.nodeId || "", parentNodeId: n.dataset.cultureParentNodeId || "" };
      });
      if (node && !LOGIC().wouldCreateCycle(recs, c.nodeId, match.nodeId)) {
        node.dataset.cultureParentNodeId = match.nodeId; linked++;
      }
    });
    // Draw the imported lineage as real node-to-node passage connections.
    if (typeof window.wlpSyncAllLineageConnections === "function") {
      try { window.wlpSyncAllLineageConnections(); } catch (e) { /* ignore */ }
    }
    try { renderBadges(); } catch (e) { /* ignore */ }
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
          html += '<div class="wlpc-tree-group">' + esc(group) + "</div>";
          lastGroup = group;
        }
      }
      var indent = 12 + item.depth * 22;
      var warnN = LOGIC().cultureWarnings(r, records).length;
      var dot = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' +
        statusColor(r.status || "active") + ';margin-right:8px"></span>';
      var connector = item.depth > 0 ? '<span style="color:#48484a">&#9492;&#9472; </span>' : "";
      var meta = (r.passage !== "" && r.passage != null ? "P" + r.passage + " · " : "") +
        esc(LOGIC().vesselTypeFromIcon(r.iconId)) + " · " + esc(r.status || "active");
      var warn = warnN ? ' <span class="wlpc-warn">&#9888; ' + warnN + "</span>" : "";
      html +=
        '<div class="wlpc-tree-row" data-node-id="' + esc(r.nodeId) + '" style="padding-left:' + indent + 'px">' +
        connector + dot + "<strong>" + esc(recordName(r)) + "</strong> " +
        '<span style="color:#8e8e93">' + meta + "</span>" + warn + "</div>";
    });
    body.innerHTML = html;
    Array.prototype.forEach.call(body.querySelectorAll("div[data-node-id]"), wireRowClick);
  }

  // Show the records view (and hide the canvas + palette) while the recorder
  // workspace tab is active; restore them otherwise.
  var canvasEl = null;
  var paletteEl = null;
  var workspaceEl = null;
  function syncView() {
    var ws = typeof window.wlpActiveWorkspace === "function" ? window.wlpActiveWorkspace() : "";
    var isRecorder = ws === "culture-records";
    if (!canvasEl) canvasEl = document.getElementById("canvas");
    if (!paletteEl) paletteEl = document.querySelector(".palette");
    if (!workspaceEl) workspaceEl = document.querySelector(".workspace");
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
      // .page is a `260px 1fr` grid; hiding the palette drops .workspace into the
      // 260px column and squishes the recorder. Span it across both tracks so the
      // grid fills the whole width while the recorder is active.
      if (workspaceEl) workspaceEl.style.gridColumn = "1 / -1";
    } else {
      if (view) view.style.display = "none";
      if (canvasEl) canvasEl.style.display = "";
      if (paletteEl) paletteEl.style.display = "";
      if (logEl) logEl.style.display = "";
      if (actions) actions.style.visibility = "";
      if (workspaceEl) workspaceEl.style.gridColumn = "";
      // Keep the map's status/warning badges fresh while the Cell Culture canvas
      // is the active tab.
      if (ws === "cell-culture") { try { renderBadges(); } catch (e) { /* ignore */ } }
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
