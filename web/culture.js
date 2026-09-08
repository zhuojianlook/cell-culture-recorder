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
    "plate_6", "plate_12", "plate_24", "plate_48", "plate_96",
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
      medium: read(node, "Medium", ""),
      imaging: read(node, "Imaging", ""),
      imagingSessions: parseImagingSessions(node),
      parentNodeId: read(node, "ParentNodeId", ""),
      parentLabel: read(node, "ParentLabel", ""),
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
  // Like allRecords(), but a seeded multiwell plate is fanned into one record PER
  // well (each under its own donor). Used by the TIMELINE so each well appears as
  // its own point; the table + reconcile keep the plate-as-one-node view.
  var PLATE_WELL_FANOUT_MAX = 8;
  function allRecordsExpanded() {
    var nodes = allCultureVessels();
    // Node ids referenced as a lineage PARENT by some vessel — so a plate used as a
    // parent still resolves its children's edges even when it's fanned into wells.
    var referencedParent = {};
    nodes.forEach(function (n) { var p = read(n, "ParentNodeId", ""); if (p) referencedParent[p] = true; });
    var out = [];
    nodes.forEach(function (n) {
      if (isPlateNode(n)) {
        var w = plateWellRecords(n);
        // Fan out only a manageable number of wells; a large plate (e.g. 96-well)
        // stays a single node so the timeline doesn't explode to thousands of rows.
        if (w.length && w.length <= PLATE_WELL_FANOUT_MAX) {
          var id = n.dataset.nodeId || "";
          // Keep the plate's own node too when it takes part in lineage (it's a
          // parent, or it has one) so edges resolve and it isn't flagged orphan.
          if (read(n, "ParentNodeId", "") || referencedParent[id]) out.push(recordOf(n));
          w.forEach(function (r) { out.push(r); });
          return;
        }
      }
      out.push(recordOf(n));
    });
    return out;
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
      return id.indexOf("_flask") >= 0 || id.indexOf("dish_") === 0 || id.indexOf("plate_") === 0 || id === "cell_line" || id === "primary_tissue";
    });
  }
  function nodeLabel(n) {
    var ta = n.querySelector(".node-label");
    var name = (ta && ta.value ? ta.value : "").trim();
    return name || (read(n, "Donor", "") + " " + read(n, "Eye", "")).trim() || ("Vessel " + (n.dataset.nodeId || ""));
  }

  // ── Multiwell-plate per-well records ────────────────────────────────────────
  // A plate keeps an entry per SEEDED well in node.dataset.cultureWells (JSON) —
  // mirroring cultureImagingSessions, so it persists with the canvas for free.
  var WELL_FIELDS = ["well", "donor", "eye", "passage", "status", "seedDate", "notes"];
  function isPlateNode(n) { return !!(n && window.isMultiWellPlateNode && window.isMultiWellPlateNode(n)); }
  function plateWellCount(n) { return (n && window.getPlateWellCount && window.getPlateWellCount(n.dataset.iconId)) || 0; }
  function plateWellIds(n) { return (window.getPlateWellIds && window.getPlateWellIds(plateWellCount(n))) || []; }
  // A well counts as "seeded" only if it has real content — the default
  // eye="unknown"/status="active" a browsed-but-untouched well carries do NOT
  // count (otherwise merely clicking through wells would persist phantom entries).
  function wellFilled(w) {
    return !!(w && w.well && (w.donor || w.passage || w.seedDate || w.notes ||
      (w.eye && w.eye !== "unknown") || (w.status && w.status !== "active")));
  }
  function normWellId(id) { return (window.parseWellId ? window.parseWellId(id).text : String(id || "")).toUpperCase(); }
  function parseWells(node) {
    try { var a = JSON.parse((node && node.dataset.cultureWells) || "[]"); return Array.isArray(a) ? a.filter(wellFilled) : []; }
    catch (e) { return []; }
  }
  function writeWells(node, arr) {
    var clean = (arr || []).filter(wellFilled);
    if (clean.length) {
      node.dataset.cultureWells = JSON.stringify(clean);
      var donors = {}; clean.forEach(function (w) { if (w.donor) donors[String(w.donor).trim().toLowerCase()] = true; });
      var nd = Object.keys(donors).length;
      write(node, "WellsSummary", clean.length + " well" + (clean.length === 1 ? "" : "s") + " · " + nd + " donor" + (nd === 1 ? "" : "s"));
    } else {
      // Keep the "[]" marker (not delete) so ensureWellsMigrated treats the plate
      // as migrated-but-empty and does NOT resurrect well A1 from the stale scalars.
      node.dataset.cultureWells = "[]";
      write(node, "WellsSummary", "");
    }
  }
  function compareWellIds_(a, b) {
    var pa = window.parseWellId ? window.parseWellId(a) : { row: 0, col: 0 };
    var pb = window.parseWellId ? window.parseWellId(b) : { row: 0, col: 0 };
    return (pa.row - pb.row) || (pa.col - pb.col);
  }
  // Idempotent, non-destructive migration: a plate still holding one legacy scalar
  // record becomes well A1 the first time it's opened; the scalar fields are KEPT
  // so the canvas label/badges keep working. No-op for non-plates / already-migrated.
  function ensureWellsMigrated(node) {
    if (!isPlateNode(node) || node.dataset.cultureWells != null) return;
    var donor = read(node, "Donor", ""), eye = read(node, "Eye", ""), passage = read(node, "Passage", "");
    var seed = read(node, "SeedDate", ""), notes = read(node, "Notes", ""), status = read(node, "Status", "");
    if (donor || eye || passage || seed || notes) {
      writeWells(node, [{ well: (plateWellIds(node)[0] || "A1"), donor: donor, eye: eye, passage: passage,
        status: status || "active", seedDate: seed, notes: notes }]);
    } else {
      node.dataset.cultureWells = "[]";
    }
  }
  // A plate's seeded wells as record objects (for the Records table + timeline).
  function plateWellRecords(node) {
    ensureWellsMigrated(node);
    return LOGIC().wellRecordsToRecords(node.dataset.nodeId || "", node.dataset.iconId || "", parseWells(node), recordOf(node))
      .sort(function (a, b) { return compareWellIds_(a.well, b.well); });
  }

  var modal = null;
  var current = null;

  function build() {
    if (modal) return modal;
    var backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop modal-backdrop--center is-hidden";
    backdrop.style.zIndex = "10000";
    backdrop.innerHTML =
      // max-height + a scrolling body keep the header and the Save footer on screen
      // at the app's 700px minimum height (the form is ~890px tall, more with the
      // provenance section open); only the fields scroll.
      '<div class="modal" style="margin-top:6vh;max-width:560px;width:560px;max-height:88vh">' +
        '<div class="modal__header" style="display:flex;align-items:center;justify-content:space-between">' +
          '<h3 style="margin:0">Culture record</h3>' +
          '<span id="wlpcRecVessel" style="font-size:.8125rem;color:var(--muted,#8e8e93)"></span>' +
        '</div>' +
        '<div class="modal__body" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;overflow:auto">' +
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
          '<div class="field field--stacked" style="grid-column:1/-1">' +
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
        // flex-wrap so the six actions form tidy rows on a narrow window instead of
        // squashing until "View in Records" / "Media plan" wrap inside their pills.
        '<div class="modal__footer" style="display:flex;gap:8px;align-items:center;padding:14px 16px;flex-wrap:wrap">' +
          '<button type="button" id="wlpcViewRecords" class="btn" title="Show this vessel in the Records table">View in Records</button>' +
          '<button type="button" id="wlpcMediaPlan" class="btn" title="Schedule media changes / feeds (dates, recurrence, volume) for this vessel">Media plan</button>' +
          '<button type="button" id="wlpcProtocol" class="btn" title="Define the protocol / SOP for the passage that produced this vessel">Protocol</button>' +
          '<button type="button" id="wlpcStorage" class="btn" title="Place this vessel into a storage-box slot (cryo / freezer location)">Store</button>' +
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
    backdrop.querySelector("#wlpcMediaPlan").onclick = function () {
      if (!current) return;
      var node = current;
      save(); // persist the record first, then open the shared media scheduler
      if (typeof window.wlpShowMediaModal === "function") window.wlpShowMediaModal(node);
    };
    backdrop.querySelector("#wlpcProtocol").onclick = function () {
      if (!current) return;
      var node = current;
      save();
      if (typeof window.wlpOpenVesselProtocol === "function") window.wlpOpenVesselProtocol(node);
    };
    backdrop.querySelector("#wlpcStorage").onclick = function () {
      if (!current) return;
      var node = current;
      save(); // persist the record first, then open the storage-box placer
      if (typeof window.wlpPlaceVesselInBox === "function") window.wlpPlaceVesselInBox(node);
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
    // Capped: a vessel with a dozen warnings would otherwise grow the list until it
    // pushed the Save row out of the modal body.
    box.style.maxHeight = "120px";
    box.style.overflow = "auto";
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
    // Stacked like every other field: a bare .field puts the label inline, and the
    // narrow number input (unlike the full-width text ones) doesn't wrap, so this
    // was the one row whose label sat beside its control instead of above it.
    return '<div class="field field--stacked"><label for="' + id + '">' + label + '</label>' +
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
    // A multiwell plate opens the per-well grid editor instead of the single-vessel
    // form; the single-vessel body below is untouched for flasks/dishes/cell-lines.
    if (isPlateNode(node)) { openPlateRecord(node); return; }
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

  // ── Per-well plate editor (a 2×N well grid; each well is its own entry) ──────
  var plateModal = null, plateNode = null, plateDraft = [], plateSel = "", plateOrigSig = "", plateCloseArmed = false;
  function pval(id) { return plateModal.querySelector("#" + id); }
  function draftWell(id) { var t = normWellId(id), f = null; plateDraft.forEach(function (w) { if (normWellId(w.well) === t) f = w; }); return f; }
  function buildPlateModal() {
    if (plateModal) return plateModal;
    var b = document.createElement("div");
    b.className = "modal-backdrop modal-backdrop--center is-hidden";
    b.style.zIndex = "10000";
    b.innerHTML =
      '<div class="modal" style="margin-top:6vh;width:min(600px,94vw);max-height:88vh">' +
        '<div class="modal__header" style="display:flex;align-items:center;justify-content:space-between">' +
          '<h3 style="margin:0">Plate wells</h3>' +
          '<span id="wlpwType" style="font-size:.8125rem;color:var(--muted,#8e8e93)"></span>' +
        '</div>' +
        '<div class="modal__body" style="display:block;overflow:auto">' +
          '<div style="font-size:.74rem;color:#8e8e93;margin-bottom:8px">Click a well to edit its entry — each well can hold its own donor / passage / status.</div>' +
          '<div id="wlpwGrid" style="display:grid;gap:6px;margin-bottom:14px"></div>' +
          '<div id="wlpwForm" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
            '<div class="field" style="grid-column:1/-1"><label id="wlpwSelLbl" style="font-weight:700;color:#64d2ff;margin:0"></label></div>' +
            fieldText("wlpwDonor", "Donor / culture name") +
            fieldSelect("wlpwEye", "Eye", EYES) +
            fieldNum("wlpwPassage", "Passage #") +
            fieldSelect("wlpwStatus", "Status", STATUSES) +
            fieldDate("wlpwSeedDate", "Seed date") +
            '<div class="field" style="grid-column:1/-1"><label for="wlpwNotes">Notes</label>' +
              '<textarea id="wlpwNotes" class="modal__input" rows="2" style="resize:vertical"></textarea></div>' +
          '</div>' +
        '</div>' +
        '<div class="modal__footer" style="display:flex;align-items:center;gap:8px;margin-top:6px">' +
          '<button type="button" id="wlpwClear" class="btn" style="color:#ff6961;border-color:rgba(255,105,97,.4)">Remove this well</button>' +
          '<span style="flex:1"></span>' +
          '<button type="button" id="wlpwCancel" class="btn">Close</button>' +
          '<button type="button" id="wlpwSave" class="btn btn--primary">Save wells</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(b);
    plateModal = b;
    b.addEventListener("click", function (e) { if (e.target === b) hidePlateGuarded(); });
    b.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.stopPropagation(); hidePlateGuarded(); } });
    pval("wlpwCancel").addEventListener("click", hidePlateGuarded);
    pval("wlpwSave").addEventListener("click", savePlate);
    pval("wlpwClear").addEventListener("click", clearWell);
    ["wlpwDonor", "wlpwEye", "wlpwPassage", "wlpwStatus", "wlpwSeedDate", "wlpwNotes"].forEach(function (id) {
      var el = pval(id);
      el.addEventListener("input", readFormIntoDraft);
      el.addEventListener("change", function () { readFormIntoDraft(); renderWellGrid(); });
    });
    return plateModal;
  }
  // A stable signature of the seeded wells, for the unsaved-changes guard.
  function draftSig(arr) {
    return JSON.stringify((arr || []).filter(wellFilled)
      .map(function (w) { return WELL_FIELDS.map(function (k) { return String(w[k] == null ? "" : w[k]).trim(); }); })
      .sort(function (a, b) { return compareWellIds_(a[0], b[0]); }));
  }
  // Reset the "click again to discard" state + Close button back to normal.
  function disarmClose() {
    plateCloseArmed = false;
    if (!plateModal) return;
    var btn = pval("wlpwCancel");
    if (btn) { btn.textContent = "Close"; btn.style.color = ""; btn.style.borderColor = ""; }
  }
  // Guarded close (Close / backdrop / Escape). With unsaved edits, the first attempt
  // arms the Close button ("Discard changes — click again") instead of a native
  // confirm() (which the Tauri WebView doesn't render); a second click discards.
  function hidePlateGuarded() {
    if (plateModal) readFormIntoDraft();
    if (plateNode && draftSig(plateDraft) !== plateOrigSig && !plateCloseArmed) {
      plateCloseArmed = true;
      var btn = pval("wlpwCancel");
      if (btn) { btn.textContent = "Discard changes — click again"; btn.style.color = "#ff6961"; btn.style.borderColor = "rgba(255,105,97,.5)"; }
      return;
    }
    hidePlate();
  }
  function openPlateRecord(node, wellToSelect) {
    if (!node) return;
    ensureWellsMigrated(node);
    buildPlateModal();
    plateNode = node;
    plateDraft = parseWells(node).map(function (w) { var o = {}; WELL_FIELDS.forEach(function (k) { o[k] = w[k] == null ? "" : String(w[k]); }); return o; });
    plateOrigSig = draftSig(plateDraft);
    pval("wlpwType").textContent = vesselTypeFromIcon(node);
    var ids = plateWellIds(node);
    plateSel = normWellId(wellToSelect || (plateDraft[0] && plateDraft[0].well) || ids[0] || "A1");
    renderWellGrid();
    loadWellIntoForm();
    disarmClose();
    plateModal.classList.remove("is-hidden");
    plateModal.style.display = "flex";
    try { pval("wlpwDonor").focus(); } catch (e) { /* ignore */ }
  }
  function renderWellGrid() {
    if (!plateNode) return;
    var grid = pval("wlpwGrid");
    var ids = plateWellIds(plateNode);
    // Lay the grid out like the physical plate: #columns = the highest column
    // number across the well ids (A1..A3/B1..B3 → 3), derived directly so it never
    // depends on a fragile grid-spec lookup.
    var cols = 1;
    ids.forEach(function (id) { var p = window.parseWellId ? window.parseWellId(id) : null; if (p && p.col > cols) cols = p.col; });
    grid.style.display = "grid";
    // Capped so the per-well form below the grid stays on screen — editing a well
    // whose fields are below the fold looks like nothing is happening.
    grid.style.maxHeight = "min(34vh, 260px)";
    grid.style.overflow = "auto";
    // ALWAYS the plate's true geometry. An auto-fill fallback reflowed a 96-well
    // (8×12) and a 384-well (16×24) plate alike into 9 ragged columns, so no visual
    // column matched a plate column; now wide plates scroll sideways instead.
    grid.style.gridTemplateColumns = "repeat(" + cols + ", minmax(" + (cols > 12 ? 34 : 40) + "px, 1fr))";
    grid.innerHTML = ids.map(function (id) {
      var w = draftWell(id), filled = wellFilled(w), sel = normWellId(id) === plateSel;
      var color = filled ? statusColor(w.status || "active") : "transparent";
      return '<button type="button" class="wlpw-well' + (filled ? " is-filled" : "") + (sel ? " is-sel" : "") +
        '" data-well="' + esc(id) + '" style="border-left:3px solid ' + color + '">' +
        '<span class="wlpw-well-id">' + esc(id) + '</span>' +
        (filled
          ? '<span class="wlpw-well-donor">' + esc(w.donor || "—") + (w.passage !== "" ? " P" + esc(w.passage) : "") + '</span>'
          : '<span class="wlpw-well-empty">+</span>') +
        '</button>';
    }).join("");
    Array.prototype.forEach.call(grid.querySelectorAll(".wlpw-well"), function (btn) {
      btn.addEventListener("click", function () { selectWell(btn.getAttribute("data-well")); });
    });
  }
  function selectWell(id) { readFormIntoDraft(); disarmClose(); plateSel = normWellId(id); renderWellGrid(); loadWellIntoForm(); }
  function loadWellIntoForm() {
    var w = draftWell(plateSel) || {};
    pval("wlpwSelLbl").textContent = "Well " + plateSel;
    pval("wlpwDonor").value = w.donor || "";
    pval("wlpwEye").value = w.eye || "unknown";
    pval("wlpwPassage").value = w.passage || "";
    pval("wlpwStatus").value = w.status || "active";
    pval("wlpwSeedDate").value = w.seedDate || "";
    pval("wlpwNotes").value = w.notes || "";
  }
  function readFormIntoDraft() {
    if (!plateSel || !plateModal) return;
    var entry = { well: plateSel, donor: pval("wlpwDonor").value.trim(), eye: pval("wlpwEye").value,
      passage: pval("wlpwPassage").value.trim(), status: pval("wlpwStatus").value,
      seedDate: pval("wlpwSeedDate").value, notes: pval("wlpwNotes").value.trim() };
    var i = -1; plateDraft.forEach(function (w, idx) { if (normWellId(w.well) === plateSel) i = idx; });
    if (i >= 0) plateDraft[i] = entry; else plateDraft.push(entry);
  }
  function clearWell() {
    // Only edits the unsaved draft (nothing persists until Save), and the grid shows
    // the well emptied immediately, so no native confirm is needed.
    plateDraft = plateDraft.filter(function (w) { return normWellId(w.well) !== plateSel; });
    disarmClose();
    loadWellIntoForm();
    renderWellGrid();
  }
  function savePlate() {
    if (!plateNode) { hidePlate(); return; }
    readFormIntoDraft();
    writeWells(plateNode, plateDraft);
    // Keep the plate's scalar default in sync with the lowest-index seeded well, so
    // the canvas label + badges + donor reconciliation keep working.
    var wells = parseWells(plateNode).slice().sort(function (a, b) { return compareWellIds_(a.well, b.well); });
    var first = wells[0];
    if (first) {
      write(plateNode, "Donor", first.donor || "");
      write(plateNode, "Eye", first.eye || "");
      write(plateNode, "Passage", first.passage || "");
      write(plateNode, "Status", first.status || "active");
      write(plateNode, "SeedDate", first.seedDate || "");
    } else {
      // No wells left — clear the scalar default too, so migration can't resurrect
      // a well from a stale scalar donor/passage.
      ["Donor", "Eye", "Passage", "SeedDate"].forEach(function (k) { write(plateNode, k, ""); });
    }
    if (typeof window.wlpMarkCanvasDirty === "function") { try { window.wlpMarkCanvasDirty(); } catch (e) { /* ignore */ } }
    try { renderBadges(); } catch (e) { /* ignore */ }
    if (typeof window.wlpPaintPlateGlyphRecords === "function") { try { window.wlpPaintPlateGlyphRecords(plateNode); } catch (e) { /* ignore */ } }
    hidePlate();
    if (view && view.style.display !== "none") renderView();
  }
  function hidePlate() {
    if (!plateModal) return;
    disarmClose();
    plateModal.classList.add("is-hidden");
    plateModal.style.display = "none";
    plateNode = null; plateDraft = []; plateSel = "";
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
    // One batched warnings pass (O(N)) instead of N×O(N). This also runs on the
    // 1.2s syncView tick while the map is active, so keeping it cheap matters.
    var warnMap = LOGIC().cultureWarningsBatch(records);
    nodes.forEach(function (n, i) {
      var warns = (warnMap[String(records[i].nodeId)] || []).length;
      var status = read(n, "Status", "active");
      var badge = n.querySelector(".wlpc-badge");
      // The badge is fully determined by (status, warn-count); skip the innerHTML
      // write (a reflow) when neither changed — the common no-change tick case.
      var sig = status + "|" + warns;
      if (badge && badge.dataset.sig === sig) return;
      if (!badge) {
        badge = document.createElement("div");
        badge.className = "wlpc-badge";
        // Sits just outside the node box: inside, it painted over the plate
        // overlay's title and the tidy-timeline card's donor name.
        badge.style.cssText =
          "position:absolute;top:-8px;right:-6px;display:flex;gap:3px;align-items:center;pointer-events:none;z-index:8";
        n.appendChild(badge);
      }
      var dot = '<span title="' + esc(status) + '" style="width:9px;height:9px;border-radius:50%;background:' +
        statusColor(status) + ';border:1.5px solid #2c2c2e;box-sizing:content-box"></span>';
      var warn = warns
        ? '<span title="' + warns + (warns === 1 ? " thing" : " things") + ' to check" ' +
          'style="background:#ff453a;color:#2c2c2e;font:600 9px/1 system-ui;border-radius:8px;padding:2px 4px;border:1.5px solid #2c2c2e">&#9888; ' + warns + "</span>"
        : "";
      badge.innerHTML = dot + warn;
      badge.dataset.sig = sig;
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
        return id.indexOf("_flask") >= 0 || id.indexOf("dish_") === 0 || id.indexOf("plate_") === 0 || id === "cell_line" || id === "primary_tissue";
      });
  }

  // Warning messages (strings) for a node. Pass a precomputed peer-record list
  // to avoid re-gathering for every grid row.
  function warningsFor(node, peers, warnMap) {
    var w = warnMap
      ? (warnMap[String(node.dataset.nodeId)] || [])
      : LOGIC().cultureWarnings(recordOf(node), peers || allRecords());
    return w.map(function (x) { return x.message; });
  }

  function compareNodes(a, b) {
    return LOGIC().compareCultureRecords(recordOf(a), recordOf(b));
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  // "field=Header; field=Header" (the pipeline's LogFieldSources) -> {field: header}.
  function parseFieldSources(s) {
    var out = {};
    String(s == null ? "" : s).split(";").forEach(function (p) {
      var i = p.indexOf("=");
      if (i < 0) return;
      var k = p.slice(0, i).trim(), v = p.slice(i + 1).trim();
      if (k && v) out[k] = v;
    });
    return out;
  }

  var view = null;
  var viewMode = "table"; // "table" | "tree"
  var filterQuery = "";
  var filterStatus = "all";
  var filterNeedsAttn = false;

  // The records to display after applying search + status + needs-attention
  // filters. Warnings are still computed against ALL records (peers) for context.
  function filteredRecords(all, warnMap) {
    var q = filterQuery.trim();
    return all.filter(function (r) {
      if (q && !LOGIC().recordMatchesQuery(r, q)) return false;
      if (filterStatus !== "all" && (r.status || "active") !== filterStatus) return false;
      if (filterNeedsAttn) {
        var w = warnMap ? (warnMap[String(r.nodeId)] || []) : LOGIC().cultureWarnings(r, all);
        if (!w.length) return false;
      }
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
            '<button type="button" id="wlpcModeTree">Timeline</button>' +
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
      '<div id="wlpcReconcile" class="wlpc-reconcile" style="display:none"></div>' +
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
    try { renderReconcilePanel(); } catch (e) { /* ignore */ }
    if (viewMode === "tree") renderTree();
    else renderGrid();
  }

  // Subtitle shared by both views: "N vessels (M of N when filtered) · K need attention".
  function updateSubtitle(all, shown, warnMap) {
    var flagged = all.filter(function (r) {
      var w = warnMap ? (warnMap[String(r.nodeId)] || []) : LOGIC().cultureWarnings(r, all);
      return w.length;
    }).length;
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

  // ─── "Needs confirmation" region ───────────────────────────────────────────
  // Surfaces the reconciliation gaps between the donor ground-truth registry and
  // the cultured vessels: donor↔vessel matches that are ambiguous (fuzzy), vessels
  // whose declared lineage parent never resolved (orphans), and — collapsed —
  // donors with no vessel and vessels with no donor record. The user confirms,
  // links, or dismisses each; confirming fuses ground truth onto the vessel(s).
  var reconcileCollapsed = false;
  var confirmShown = 30;      // how many donor-match rows to render (paged)
  var confirmFilter = "";     // substring filter over the donor id
  var donorsHydrateTried = false;
  // The effective value for a ground-truth field: the PDF value by default, or the
  // spreadsheet ("log") value if the user chose it for this donor.
  function gtValue(d, field) {
    var log = (d.chosen && d.chosen[field]) === "log";
    if (field === "deceased") return log ? d.deceasedLog : d.deceased;
    if (field === "endothelial") return log ? d.ecdLog : d.endothelial;
    if (field === "age") return log ? d.ageLog : d.age;
    if (field === "sex") return log ? d.sexLog : d.sex;
    return "";
  }
  // Fields where the PDF and the spreadsheet disagree — the user picks which wins.
  function donorConflicts(d) {
    if (!d || !d.gtSource) return [];
    var out = [];
    var ip = function (s) { var m = String(s == null ? "" : s).match(/\d+/); return m ? m[0] : ""; };
    // strip a trailing US zone abbreviation ("… 1450 EDT") before coercing, so a
    // log that holds the same instant as the PDF (just US-stamped) isn't flagged.
    var logRaw = String(d.deceasedLog || "").replace(/\s+[A-Za-z]{2,5}$/, "").trim();
    var logD = logRaw ? LOGIC().coerceDate(logRaw) : "";
    var pdfUS = String(d.deathUS || "").slice(0, 10);
    if (d.deceasedLog && pdfUS && logD !== pdfUS)
      out.push({ field: "deceased", label: "Deceased date", pdf: (shortDate(d.deceased) || d.deceased), log: (shortDate(d.deceasedLog) || d.deceasedLog) });
    if (d.ecdLog && d.endothelial && ip(d.ecdLog) !== ip(d.endothelial))
      out.push({ field: "endothelial", label: "Endothelial density", pdf: d.endothelial, log: d.ecdLog });
    if (d.ageLog && d.age && ip(d.ageLog) !== ip(d.age))
      out.push({ field: "age", label: "Donor age", pdf: d.age, log: d.ageLog });
    if (d.sexLog && d.sex && String(d.sexLog).charAt(0).toUpperCase() !== String(d.sex).charAt(0).toUpperCase())
      out.push({ field: "sex", label: "Donor sex", pdf: d.sex, log: d.sexLog });
    return out;
  }
  function donorGtBits(d) {
    var b = [];
    if (d.dissociation) b.push("dissoc " + shortDate(d.dissociation));
    var dec = gtValue(d, "deceased");
    if (dec) b.push("deceased " + (shortDate(dec) || dec));
    if (d.cod) b.push(d.cod);
    if (d.seeding) b.push("seeding " + d.seeding);
    var age = gtValue(d, "age");
    if (age) b.push(age + (gtValue(d, "sex") ? " " + gtValue(d, "sex") : ""));
    if (d.serology) b.push(d.serology);
    return b.join(" · ");
  }
  // A small "eye-bank verified" chip when the donor's ground truth came from a PDF.
  // Dates are stored Singapore-local; the tooltip shows the original US date-time.
  function gtSourceChip(d) {
    if (!d || !d.gtSource) return "";
    var t = "Ground truth available from " + d.gtSource + " (not applied until you confirm a vessel)";
    if (d.deathUS) t += " · dates converted to Singapore time (death recorded " + d.deathUS + " " + (d.sourceTz || "US") + ")";
    return ' <span class="wlpc-rc-src" title="' + esc(t) + '">eye-bank source</span>';
  }
  // Where a value came from. Spreadsheet: "file :: tab :: column" (from Source +
  // the pipeline's per-field LogFieldSources). PDF: the eye-bank filename.
  function logProvenance(d, field) {
    var c = d && d.fieldSources && d.fieldSources[field];
    if (!c) return "";
    var src = String((d && d.source) || "").replace(/\s*\+\s*PDF\s*$/i, "").trim();
    return (src ? src + " :: " : "") + c;
  }
  function pdfProvenance(d) { return (d && d.gtSource) || ""; }
  // An expandable per-field provenance table: field · effective value · where it
  // came from (eye-bank PDF, or the exact spreadsheet file :: tab :: column). This
  // is the literal answer to "show the field name where the log came from".
  function donorProvenanceDetails(d) {
    var rows = [];
    var srcFor = function (f, isConflict) {
      var usingLog = isConflict && d.chosen && d.chosen[f] === "log";
      if (isConflict && d.gtSource && !usingLog) return "eye-bank PDF · " + d.gtSource;
      var lp = logProvenance(d, f);
      if (lp) return lp;
      if (d.gtSource) return "eye-bank PDF · " + d.gtSource;
      return "—";
    };
    [["deceased", "Deceased date", true], ["endothelial", "Endothelial density", true],
     ["age", "Donor age", true], ["sex", "Donor sex", true]].forEach(function (fr) {
      var v = gtValue(d, fr[0]); if (!v) return;
      rows.push([fr[1], (fr[0] === "deceased" ? (shortDate(v) || v) : v), srcFor(fr[0], true)]);
    });
    [["dissociation", "Dissociation date"], ["seeding", "Seeding success"], ["ethnicity", "Ethnicity"]].forEach(function (fr) {
      var v = d[fr[0]]; if (!v) return;
      rows.push([fr[1], (fr[0] === "dissociation" ? (shortDate(v) || v) : v), srcFor(fr[0], false)]);
    });
    if (d.cod) rows.push(["Cause of death", d.cod, d.gtSource ? ("eye-bank PDF · " + d.gtSource) : "—"]);
    if (d.serology) rows.push(["Serology", d.serology, d.gtSource ? ("eye-bank PDF · " + d.gtSource) : "—"]);
    if (!rows.length) return "";
    return '<details class="wlpc-rc-prov-det"><summary>where these came from</summary>' +
      '<table class="wlpc-rc-pvtab"><tr><th>Field</th><th>Value</th><th>Source</th></tr>' +
      rows.map(function (r) {
        return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td class="wlpc-rc-pvsrc">' + esc(r[2]) + '</td></tr>';
      }).join("") + '</table></details>';
  }
  function renderReconcilePanel() {
    if (!view) return;
    var box = view.querySelector("#wlpcReconcile");
    if (!box) return;
    var donorsAll = (typeof window.wlpLoadCultureDonors === "function") ? (window.wlpLoadCultureDonors() || []) : [];
    // If the registry looks empty, pull it from the sidecar once and re-render
    // when the donors arrive (survives app restarts — the initial render happens
    // before the async hydration completes).
    if (!donorsAll.length && !donorsHydrateTried && typeof window.wlpEnsureDonorsHydrated === "function") {
      donorsHydrateTried = true;
      Promise.resolve(window.wlpEnsureDonorsHydrated()).then(function (n) {
        if (n) renderReconcilePanel();
      }).catch(function () { /* ignore */ });
    }
    var vesselRecords = allRecords();
    var flags = LOGIC().lineageFlags(vesselRecords);
    var orphans = vesselRecords.filter(function (r) { return (flags[String(r.nodeId)] || {}).orphan; });

    if (!donorsAll.length && !orphans.length && !(imagingPending && imagingPending.length)) { box.style.display = "none"; box.innerHTML = ""; return; }

    var active = donorsAll.filter(function (d) { return !d._dismissed && !d.confirmedVessel; });
    var rec = LOGIC().reconcileDonors(active, vesselRecords);
    var fuzzy = rec.fuzzy;
    var confirmedCount = donorsAll.filter(function (d) { return d.confirmedVessel; }).length;
    var conflicts = donorsAll.filter(function (d) { return !d._dismissed && donorConflicts(d).length; });
    var imgGroups = buildImagingGroups(vesselRecords);
    var needCount = fuzzy.length + orphans.length + conflicts.length + imgGroups.length;

    box.style.display = "";
    if (reconcileCollapsed) {
      box.innerHTML =
        '<div class="wlpc-rc-hd" data-rc-toggle="1">' +
          '<span class="wlpc-rc-title">Needs confirmation</span>' +
          '<span class="wlpc-rc-count' + (needCount ? " is-warn" : " is-ok") + '">' + needCount + '</span>' +
          '<span class="wlpc-rc-chev">▸ show</span>' +
        '</div>';
      wireReconcile(box);
      return;
    }

    var html =
      '<div class="wlpc-rc-hd" data-rc-toggle="1">' +
        '<span class="wlpc-rc-title">Needs confirmation</span>' +
        '<span class="wlpc-rc-count' + (needCount ? " is-warn" : " is-ok") + '">' + needCount + '</span>' +
        '<span class="wlpc-rc-sub">' + donorsAll.length + ' donor records · ' + confirmedCount + ' confirmed</span>' +
        '<span class="wlpc-rc-chev">▾ hide</span>' +
      '</div>';

    // Section 0 — ground-truth conflicts: the PDF and the spreadsheet disagree on a
    // field. Show both (PDF marked) and let the user choose which is correct.
    if (conflicts.length) {
      html += '<div class="wlpc-rc-sec"><div class="wlpc-rc-sec-hd">Ground-truth conflicts — PDF vs spreadsheet, choose which is correct (' + conflicts.length + ')</div>';
      conflicts.slice(0, 20).forEach(function (d) {
        var idx = donorsAll.indexOf(d);
        var pdfSrc = pdfProvenance(d);
        html += '<div class="wlpc-rc-row">' +
          '<div class="wlpc-rc-main"><span class="wlpc-rc-id">' + esc(d.donor) + '</span>' +
            (d.eye ? ' <span class="wlpc-rc-eye">' + esc(String(d.eye).toUpperCase()) + '</span>' : '') +
            gtSourceChip(d) + donorProvenanceDetails(d) + '</div>' +
          '<div class="wlpc-rc-cflist">' +
            donorConflicts(d).map(function (c) {
              var pick = (d.chosen && d.chosen[c.field]) || "pdf";
              var logSrc = logProvenance(d, c.field);
              return '<div class="wlpc-rc-cf"><span class="wlpc-rc-cf-lbl">' + esc(c.label) + '</span>' +
                '<button type="button" class="wlpc-rc-cf-opt' + (pick === "pdf" ? " is-on" : "") + '" data-rc-choose="' + idx + '" data-rc-field="' + esc(c.field) + '" data-rc-which="pdf" title="Eye-bank PDF' + (pdfSrc ? ": " + esc(pdfSrc) : "") + '">📄 ' + esc(String(c.pdf)) + (pdfSrc ? ' <span class="wlpc-rc-prov">' + esc(pdfSrc) + '</span>' : '') + '</button>' +
                '<button type="button" class="wlpc-rc-cf-opt' + (pick === "log" ? " is-on" : "") + '" data-rc-choose="' + idx + '" data-rc-field="' + esc(c.field) + '" data-rc-which="log" title="Spreadsheet' + (logSrc ? ": " + esc(logSrc) : "") + '">log: ' + esc(String(c.log)) + (logSrc ? ' <span class="wlpc-rc-prov">' + esc(logSrc) + '</span>' : '') + '</button>' +
                '</div>';
            }).join("") +
          '</div></div>';
      });
      if (conflicts.length > 20) html += '<div class="wlpc-rc-more">…and ' + (conflicts.length - 20) + ' more</div>';
      html += '</div>';
    }

    // Section 1 — confirm & apply donor ground truth. EVERY donor with a vessel
    // candidate (single-hit included) lands here and requires an explicit click;
    // nothing is fused until confirmed. Opposite-cornea / cross-year candidates are
    // flagged red and never pre-selected.
    var QB = {
      exact: { cls: "", badge: "✓ id match" },
      weak: { cls: " is-warnloose", badge: "⚠ loose match" },
      year: { cls: " is-warnmatch", badge: "⚠ year mismatch" },
      eye: { cls: " is-warnmatch", badge: "⚠ opposite cornea" }
    };
    if (fuzzy.length) {
      var filt = confirmFilter.trim().toLowerCase();
      var fshown = filt ? fuzzy.filter(function (f) { return String(f.donor.donor || "").toLowerCase().indexOf(filt) >= 0; }) : fuzzy;
      var exactN = fuzzy.filter(function (f) { return f.single && f.cands && f.cands[0] && f.cands[0].quality === "exact"; }).length;
      html += '<div class="wlpc-rc-sec"><div class="wlpc-rc-sec-hd">Confirm &amp; apply donor ground truth — nothing is applied until you confirm (' + fuzzy.length + ')</div>' +
        '<div class="wlpc-rc-tools">' +
          (exactN ? '<button type="button" class="wlpc-rc-btn is-go" data-rc-applyexact="1">✓ Apply all exact single matches (' + exactN + ')</button>' : '') +
          '<input type="text" class="wlpc-rc-filter" data-rc-filter placeholder="filter by donor id…" value="' + esc(confirmFilter) + '">' +
          (filt ? '<span class="wlpc-rc-hint">' + fshown.length + ' of ' + fuzzy.length + ' match "' + esc(confirmFilter) + '"</span>' : '') +
        '</div>';
      fshown.slice(0, confirmShown).forEach(function (f) {
        var idx = donorsAll.indexOf(f.donor);
        var gt = donorGtBits(f.donor);
        var flagged = (f.cands || []).some(function (c) { return c.quality === "eye" || c.quality === "year"; });
        var hint = f.single ? "one candidate — confirm to apply its ground truth" : "matches " + f.candidates.length + " vessel ids — pick the right one";
        html += '<div class="wlpc-rc-row is-unconfirmed">' +
          '<div class="wlpc-rc-main"><span class="wlpc-rc-id">' + esc(f.donor.donor) + '</span>' +
            (f.donor.eye ? ' <span class="wlpc-rc-eye">' + esc(String(f.donor.eye).toUpperCase()) + '</span>' : '') +
            ' <span class="wlpc-rc-unconf">● not applied</span>' +
            gtSourceChip(f.donor) +
            (gt ? ' <span class="wlpc-rc-gt">' + esc(gt) + '</span>' : '') +
            '<span class="wlpc-rc-hint' + (flagged ? " is-warn" : "") + '">' + esc(hint) + '</span>' +
            donorProvenanceDetails(f.donor) + '</div>' +
          '<div class="wlpc-rc-acts">' +
            (f.cands || []).map(function (c) {
              var q = QB[c.quality] || QB.weak;
              return '<button type="button" class="wlpc-rc-btn' + q.cls + '" data-rc-link="' + idx + '" data-rc-vessel="' + esc(c.vessel) + '" title="' + esc(c.reason || "") + '">' + esc(c.vessel) +
                ' <span class="wlpc-rc-mq">' + esc(q.badge) + '</span></button>';
            }).join("") +
            '<button type="button" class="wlpc-rc-btn" data-rc-dismiss="' + idx + '">not a match</button>' +
          '</div></div>';
      });
      if (fshown.length > confirmShown) html += '<div class="wlpc-rc-more"><button type="button" class="wlpc-rc-btn" data-rc-showmore="1">Show 30 more (' + (fshown.length - confirmShown) + ' hidden)</button></div>';
      html += '</div>';
    }

    // Section 2 — unresolved lineage parents (pick the real parent).
    if (orphans.length) {
      html += '<div class="wlpc-rc-sec"><div class="wlpc-rc-sec-hd">Unresolved lineage parents (' + orphans.length + ')</div>';
      orphans.slice(0, 20).forEach(function (r) {
        var cands = vesselRecords.filter(function (v) { return v.nodeId !== r.nodeId && LOGIC().sameDonorEye(v, r); });
        var opts = '<option value="">— pick parent —</option>' + cands.map(function (v) {
          return '<option value="' + esc(v.nodeId) + '">' + esc(recLabelOf(v)) + '</option>';
        }).join("");
        html += '<div class="wlpc-rc-row">' +
          '<div class="wlpc-rc-main"><span class="wlpc-rc-id">' + esc(recLabelOf(r)) + '</span>' +
            '<span class="wlpc-rc-hint">declares parent “' + esc(r.parentLabel || "?") + '” — not found</span></div>' +
          '<div class="wlpc-rc-acts">' +
            '<select class="wlpc-rc-sel" data-rc-orphan="' + esc(r.nodeId) + '">' + opts + '</select>' +
            '<button type="button" class="wlpc-rc-btn" data-rc-clearorphan="' + esc(r.nodeId) + '">clear label</button>' +
          '</div></div>';
      });
      if (orphans.length > 20) html += '<div class="wlpc-rc-more">…and ' + (orphans.length - 20) + ' more</div>';
      html += '</div>';
    }

    // Section 2b — uncertain microscopy image matches (typos / gaps): the parsed
    // filename didn't confidently match a vessel. Confirm the suggested vessel or
    // pick the right one (a name correction; the real files are never renamed).
    if (imgGroups.length) {
      html += '<div class="wlpc-rc-sec"><div class="wlpc-rc-sec-hd">🔬 Microscopy — uncertain image matches, confirm or correct (' + imgGroups.length + ')</div>';
      imgGroups.slice(0, 20).forEach(function (g) {
        var dates = g.sessions.map(function (s) { return s.date; }).filter(Boolean).sort();
        var span = dates.length ? (shortDate(dates[0]) + (dates.length > 1 ? "→" + shortDate(dates[dates.length - 1]) : "")) : "";
        var hint = g.ambiguous === "yes" ? "ambiguous — near more than one donor, choose carefully"
          : (g.status === "fuzzy" ? "several vessels at this passage — pick which one was imaged"
          : (g.status === "donor-only" ? "donor matches, but no vessel logged at this passage — pick one or ignore"
          : (g.nearest ? "likely typo — nearest vessel donor is " + esc(g.nearest)
          : "no matching vessel — imaged but not in the culture log")));
        html += '<div class="wlpc-rc-row">' +
          '<div class="wlpc-rc-main"><span class="wlpc-rc-id">' + esc(g.donor) + '</span>' +
            (g.passage !== "" ? ' <span class="wlpc-rc-eye">P' + esc(g.passage) + '</span>' : '') +
            ' <span class="wlpc-rc-gt">' + g.sessions.length + ' session' + (g.sessions.length === 1 ? "" : "s") + ' · ' + g.images + ' fields' + (span ? " · " + span : "") + '</span>' +
            '<span class="wlpc-rc-hint">' + hint + '</span></div>' +
          '<div class="wlpc-rc-acts">' +
            (g.target ? '<button type="button" class="wlpc-rc-btn is-go" data-img-assign="' + esc(g.key) + '" data-img-node="' + esc(g.target) + '">→ ' + esc(g.targetLabel) + '</button>' : '') +
            '<select class="wlpc-rc-sel" data-img-pick="' + esc(g.key) + '"><option value="">— pick vessel —</option>' +
              g.candidates.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.label) + '</option>'; }).join("") + '</select>' +
            '<button type="button" class="wlpc-rc-btn" data-img-ignore="' + esc(g.key) + '">not a vessel</button>' +
          '</div></div>';
      });
      if (imgGroups.length > 20) html += '<div class="wlpc-rc-more">…and ' + (imgGroups.length - 20) + ' more</div>';
      html += '</div>';
    }

    // Confirmed & applied — donors whose ground truth HAS been fused onto a vessel.
    // Shown (collapsed) so the applied state is visible and reversible.
    var confirmedList = donorsAll.filter(function (d) { return d.confirmedVessel && !d._dismissed; });
    if (confirmedList.length) {
      html += '<details class="wlpc-rc-info wlpc-rc-confirmed"><summary>✓ Confirmed &amp; applied (' + confirmedList.length + ')</summary>';
      confirmedList.slice(0, 40).forEach(function (d) {
        var idx = donorsAll.indexOf(d);
        html += '<div class="wlpc-rc-row is-confirmed">' +
          '<div class="wlpc-rc-main"><span class="wlpc-rc-id">' + esc(d.donor) + '</span>' +
            (d.eye ? ' <span class="wlpc-rc-eye">' + esc(String(d.eye).toUpperCase()) + '</span>' : '') +
            ' <span class="wlpc-rc-appliedto">→ ' + esc(d.confirmedVessel) + '</span>' +
            donorProvenanceDetails(d) + '</div>' +
          '<div class="wlpc-rc-acts"><button type="button" class="wlpc-rc-btn" data-rc-unconfirm="' + idx + '">undo</button></div>' +
          '</div>';
      });
      if (confirmedList.length > 40) html += '<div class="wlpc-rc-more">…and ' + (confirmedList.length - 40) + ' more</div>';
      html += '</details>';
    }

    // Section 3/4 — informational, collapsed lists.
    html += infoSection("Donor records with no vessel", rec.donorsWithoutVessel.map(function (d) {
      return esc(d.donor) + (d.eye ? " " + esc(String(d.eye).toUpperCase()) : "") + (donorGtBits(d) ? ' · ' + esc(donorGtBits(d)) : "");
    }));
    html += infoSection("Vessels with no donor record", rec.vesselsWithoutDonor.map(esc));

    if (!needCount) html = html.replace('class="wlpc-rc-count is-warn"', 'class="wlpc-rc-count is-ok"');
    box.innerHTML = html;
    wireReconcile(box);
  }

  function infoSection(title, items) {
    if (!items.length) return "";
    var shown = items.slice(0, 40).join(" · ");
    return '<details class="wlpc-rc-info"><summary>' + esc(title) + ' (' + items.length + ')</summary>' +
      '<div class="wlpc-rc-info-list">' + shown + (items.length > 40 ? " …" : "") + '</div></details>';
  }

  function recLabelOf(r) {
    return (r.label && String(r.label).trim()) ||
      (LOGIC().normalizeDonor(r.donor) + (r.eye && r.eye !== "unknown" ? " " + String(r.eye).toUpperCase() : "") +
        (r.passage !== "" && r.passage != null ? " P" + r.passage : "")).trim() ||
      ("Vessel " + r.nodeId);
  }

  function wireReconcile(box) {
    box.onclick = function (e) {
      var t = e.target;
      // toggle is a header div; check it before collapsing clicks onto a button
      if (t.closest && t.closest("[data-rc-toggle]")) { reconcileCollapsed = !reconcileCollapsed; renderReconcilePanel(); return; }
      // action controls carry inner spans (emoji / quality badge / provenance) —
      // resolve any click inside a button back to the button that owns the data-*.
      if (t.closest) { var btn = t.closest("button"); if (btn) t = btn; }
      var ch = t.getAttribute && t.getAttribute("data-rc-choose");
      if (ch != null) { chooseGt(parseInt(ch, 10), t.getAttribute("data-rc-field"), t.getAttribute("data-rc-which")); return; }
      var link = t.getAttribute && t.getAttribute("data-rc-link");
      if (link != null) { confirmDonorMatch(parseInt(link, 10), t.getAttribute("data-rc-vessel")); return; }
      var dis = t.getAttribute && t.getAttribute("data-rc-dismiss");
      if (dis != null) { dismissDonor(parseInt(dis, 10)); return; }
      var unc = t.getAttribute && t.getAttribute("data-rc-unconfirm");
      if (unc != null) { unconfirmDonor(parseInt(unc, 10)); return; }
      var clr = t.getAttribute && t.getAttribute("data-rc-clearorphan");
      if (clr != null) { clearOrphanLabel(clr); return; }
      var ia = t.getAttribute && t.getAttribute("data-img-assign");
      if (ia != null) { assignImaging(ia, t.getAttribute("data-img-node")); return; }
      var ig = t.getAttribute && t.getAttribute("data-img-ignore");
      if (ig != null) { ignoreImaging(ig); return; }
      if (t.getAttribute && t.getAttribute("data-rc-applyexact") != null) { applyExactSingles(); return; }
      if (t.getAttribute && t.getAttribute("data-rc-showmore") != null) { confirmShown += 30; renderReconcilePanel(); return; }
    };
    box.onchange = function (e) {
      var pick = e.target.getAttribute && e.target.getAttribute("data-img-pick");
      if (pick != null && e.target.value) { assignImaging(pick, e.target.value); return; }
      var sel = e.target.getAttribute && e.target.getAttribute("data-rc-orphan");
      if (sel != null && e.target.value) setOrphanParent(sel, e.target.value);
    };
    // live filter — re-render on each keystroke, preserving focus + caret
    box.oninput = function (e) {
      if (!(e.target.getAttribute && e.target.getAttribute("data-rc-filter") != null)) return;
      confirmFilter = e.target.value; confirmShown = 30;
      var caret = e.target.selectionStart;
      renderReconcilePanel();
      var again = box.querySelector("[data-rc-filter]");
      if (again) { again.focus(); try { again.setSelectionRange(caret, caret); } catch (err) { /* ignore */ } }
    };
  }
  // Bulk-confirm every donor whose SINGLE candidate is an exact id match — the safe
  // subset — in one pass with a single re-render.
  function applyExactSingles() {
    var donorsAll = (typeof window.wlpLoadCultureDonors === "function") ? (window.wlpLoadCultureDonors() || []) : [];
    var active = donorsAll.filter(function (d) { return !d._dismissed && !d.confirmedVessel; });
    var rec = LOGIC().reconcileDonors(active, allRecords());
    var n = 0;
    (rec.fuzzy || []).forEach(function (f) {
      if (f.single && f.cands && f.cands[0] && f.cands[0].quality === "exact") {
        f.donor.confirmedVessel = f.cands[0].vessel; fuseDonorOntoVessels(f.donor, f.cands[0].vessel); n++;
      }
    });
    if (n && typeof window.wlpSaveCultureDonors === "function") window.wlpSaveCultureDonors(donorsAll);
    renderView();
    showImportStatus("Applied " + n + " exact single donor match" + (n === 1 ? "" : "es") + " and fused their ground truth.", false);
  }

  function confirmDonorMatch(idx, vesselDonor) {
    var donorsAll = (typeof window.wlpLoadCultureDonors === "function") ? (window.wlpLoadCultureDonors() || []) : [];
    var d = donorsAll[idx];
    if (!d || !vesselDonor) return;
    d.confirmedVessel = vesselDonor;
    if (typeof window.wlpSaveCultureDonors === "function") window.wlpSaveCultureDonors(donorsAll);
    fuseDonorOntoVessels(d, vesselDonor);
    renderView();
    showImportStatus("Linked donor " + d.donor + " → " + vesselDonor + " and fused its ground truth.", false);
  }
  function dismissDonor(idx) {
    var donorsAll = (typeof window.wlpLoadCultureDonors === "function") ? (window.wlpLoadCultureDonors() || []) : [];
    var d = donorsAll[idx];
    if (!d) return;
    d._dismissed = true;
    if (typeof window.wlpSaveCultureDonors === "function") window.wlpSaveCultureDonors(donorsAll);
    renderView();
  }
  // Undo a confirmation: remove the fused ground truth from the vessel(s) and put
  // the donor back in the confirm list. Only strips what fusion added.
  function unfuseDonorFromVessels(d, vesselDonor) {
    var nodes = allCultureVessels().filter(function (n) { return read(n, "Donor", "") === vesselDonor; });
    var changed = 0;
    nodes.forEach(function (n) {
      var note = read(n, "Notes", "");
      var stripped = note.replace(/\s*\[donor GT:[^\]]*\]/g, "").trim();
      if (stripped !== note) { write(n, "Notes", stripped); changed++; }
      // clear the dissociation date ONLY if fusion set it (marked) — never a value
      // the user typed themselves.
      if (n.dataset.cultureGtSetDissoc === "1") { write(n, "DissociationDate", ""); delete n.dataset.cultureGtSetDissoc; changed++; }
    });
    if (changed && typeof window.wlpMarkCanvasDirty === "function") window.wlpMarkCanvasDirty();
  }
  function unconfirmDonor(idx) {
    var donorsAll = (typeof window.wlpLoadCultureDonors === "function") ? (window.wlpLoadCultureDonors() || []) : [];
    var d = donorsAll[idx];
    if (!d) return;
    var vd = d.confirmedVessel;
    delete d.confirmedVessel;
    if (typeof window.wlpSaveCultureDonors === "function") window.wlpSaveCultureDonors(donorsAll);
    if (vd) unfuseDonorFromVessels(d, vd);
    renderView();
    showImportStatus("Un-applied donor " + d.donor + " — ground truth removed from " + (vd || "the vessel") + ".", false);
  }
  // Choose the ground-truth source for one field of a donor (pdf | log). Re-fuses
  // onto the vessels if the donor is already confirmed. Persisted with the donor.
  function chooseGt(idx, field, which) {
    var donorsAll = (typeof window.wlpLoadCultureDonors === "function") ? (window.wlpLoadCultureDonors() || []) : [];
    var d = donorsAll[idx];
    if (!d || !field) return;
    d.chosen = d.chosen || {};
    d.chosen[field] = which;
    if (typeof window.wlpSaveCultureDonors === "function") window.wlpSaveCultureDonors(donorsAll);
    if (d.confirmedVessel) fuseDonorOntoVessels(d, d.confirmedVessel);
    renderView();
    showImportStatus("Ground truth for " + d.donor + " · " + field + " → " + (which === "log" ? "spreadsheet" : "eye-bank PDF") + ".", false);
  }
  // Fuse a donor's ground truth onto every vessel with the confirmed donor id:
  // the dissociation date (if the vessel lacks one) and a compact GT note so the
  // deceased date / seeding outcome aren't lost.
  function fuseDonorOntoVessels(d, vesselDonor) {
    var nodes = allCultureVessels().filter(function (n) { return read(n, "Donor", "") === vesselDonor; });
    var changed = 0;
    nodes.forEach(function (n) {
      // Only fill an EMPTY dissociation date, and mark that fusion set it so undo
      // can clear ONLY fusion-set dates (never a value the user typed themselves).
      if (d.dissociation && !read(n, "DissociationDate", "")) {
        write(n, "DissociationDate", d.dissociation); n.dataset.cultureGtSetDissoc = "1"; changed++;
      }
      var gt = [];
      var dec = gtValue(d, "deceased");
      if (dec) gt.push("deceased " + dec);
      if (d.cod) gt.push("COD " + d.cod);
      if (d.serology) gt.push(d.serology);
      if (d.seeding) gt.push("seeding " + d.seeding);
      var age = gtValue(d, "age");
      if (age) gt.push("age " + age + (gtValue(d, "sex") || ""));
      var note = read(n, "Notes", "");
      if (gt.length) {
        var block = "[donor GT: " + gt.join(", ") + "]";
        // Rewrite an existing block (so re-choosing PDF vs spreadsheet updates the
        // fused value); otherwise append a fresh one.
        if (/\[donor GT:[^\]]*\]/.test(note)) {
          var nn = note.replace(/\[donor GT:[^\]]*\]/, block);
          if (nn !== note) { write(n, "Notes", nn); changed++; }
        } else {
          write(n, "Notes", (note ? note + " " : "") + block); changed++;
        }
      }
    });
    if (changed && typeof window.wlpMarkCanvasDirty === "function") window.wlpMarkCanvasDirty();
  }
  function setOrphanParent(childId, parentId) {
    if (!parentId) return;
    var node = document.querySelector('.drop[data-node-id="' + childId + '"]');
    if (!node) return;
    var recs = allCultureVessels().map(function (n) { return { nodeId: n.dataset.nodeId || "", parentNodeId: n.dataset.cultureParentNodeId || "" }; });
    if (LOGIC().wouldCreateCycle(recs, childId, parentId)) { showImportStatus("That parent would create a cycle — pick another.", true); return; }
    node.dataset.cultureParentNodeId = parentId;
    delete node.dataset.cultureParentLabel;
    if (typeof window.wlpSyncAllLineageConnections === "function") { try { window.wlpSyncAllLineageConnections(); } catch (e) { /* ignore */ } }
    if (typeof window.wlpMarkCanvasDirty === "function") window.wlpMarkCanvasDirty();
    renderView();
    showImportStatus("Linked lineage parent.", false);
  }
  function clearOrphanLabel(childId) {
    var node = document.querySelector('.drop[data-node-id="' + childId + '"]');
    if (!node) return;
    delete node.dataset.cultureParentLabel;
    if (typeof window.wlpMarkCanvasDirty === "function") window.wlpMarkCanvasDirty();
    renderView();
  }

  // ── Microscopy: uncertain image→vessel matches (typos / gaps) to correct ──────
  var imagingIgnored = {};   // group keys the user dismissed this session
  function buildImagingGroups() {
    if (!imagingPending || !imagingPending.length) return [];
    var nodes = allCultureVessels();
    var idxCP = {}, idxC = {};   // by core+passage and by core
    nodes.forEach(function (n) {
      var p = String(read(n, "Passage", "")).replace(/\D/g, "");
      LOGIC().donorIdentity(read(n, "Donor", "")).aliases.forEach(function (a) {
        (idxCP[a + "|" + p] = idxCP[a + "|" + p] || []).push(n);
        (idxC[a] = idxC[a] || []).push(n);
      });
    });
    var gm = {}, groups = [];
    imagingPending.forEach(function (s) {
      var key = s.donor + "|" + s.passage;
      if (imagingIgnored[key]) return;
      var g = gm[key];
      if (!g) {
        g = gm[key] = { key: key, donor: s.donor, passage: s.passage, eye: s.eye, nearest: s.nearest,
          ambiguous: s.ambiguous, status: s.status, sessions: [], images: 0 };
        groups.push(g);
      }
      g.sessions.push(s); g.images += (s.images || 0);
    });
    groups.forEach(function (g) {
      g.target = ""; g.targetLabel = ""; g.candidates = [];
      // Candidate core: the fuzzy "nearest" donor when the filename donor didn't
      // match, otherwise the session's own donor core (for split / donor-only
      // groups where the donor is right but the vessel is not uniquely known).
      var core = g.nearest || LOGIC().donorIdentity(g.donor).core;
      var amb = (g.ambiguous === "yes" || g.status === "ambiguous");
      var cp = core ? (idxCP[core + "|" + g.passage] || []) : [];
      // Offer a one-click "assign to suggested vessel" ONLY when that suggestion is
      // unique and unambiguous — otherwise force an explicit pick so a low-
      // confidence guess can't be attached by a single stray click.
      if (cp.length === 1 && !amb) { g.target = cp[0].dataset.nodeId; g.targetLabel = recLabelOf(recordOf(cp[0])); }
      var seen = {};
      (core ? (idxC[core] || []) : []).forEach(function (n) {
        var id = n.dataset.nodeId; if (seen[id]) return; seen[id] = true;
        g.candidates.push({ id: id, label: recLabelOf(recordOf(n)) });
      });
    });
    return groups;
  }
  // Assign an uncertain imaging group to a vessel (a NAME CORRECTION — the real
  // image files are never touched). Sessions attach to the node, marked manual so
  // they survive re-import.
  function assignImaging(groupKey, nodeId) {
    var node = nodeId && document.querySelector('.drop[data-node-id="' + nodeId + '"]');
    if (!node) return;
    var group = imagingPending.filter(function (s) { return (s.donor + "|" + s.passage) === groupKey; });
    if (!group.length) return;
    var existing = parseImagingSessions(node), have = {};
    existing.forEach(function (s) { have[s.key] = true; });
    group.forEach(function (s) {
      if (have[s.key]) return;
      existing.push({ key: s.key, date: s.date, cond: s.cond, images: s.images, path: s.path, donor: s.donor, passage: s.passage, manual: true });
    });
    writeImagingSessions(node, existing);
    imagingPending = imagingPending.filter(function (s) { return (s.donor + "|" + s.passage) !== groupKey; });
    if (typeof window.wlpMarkCanvasDirty === "function") window.wlpMarkCanvasDirty();
    renderView();
    showImportStatus("Linked " + group.length + " image session" + (group.length === 1 ? "" : "s") + " to " + (read(node, "Donor", "") || "vessel") + " (files unchanged).", false);
  }
  function ignoreImaging(groupKey) {
    imagingIgnored[groupKey] = true;
    imagingPending = imagingPending.filter(function (s) { return (s.donor + "|" + s.passage) !== groupKey; });
    renderView();
  }

  // app.js calls this after the donor registry is hydrated from the backend.
  window.wlpOnDonorsHydrated = function () { try { if (view) renderReconcilePanel(); } catch (e) { /* ignore */ } };

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
    var warnMap = LOGIC().cultureWarningsBatch(peers); // one O(N) pass, reused below
    var shown = filteredRecords(peers, warnMap);
    var shownIds = {};
    shown.forEach(function (r) { shownIds[r.nodeId] = true; });
    var vessels = allCultureVessels().filter(function (n) { return shownIds[n.dataset.nodeId]; }).sort(compareNodes);
    updateSubtitle(peers, shown, warnMap);
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
      var w = warningsFor(n, peers, warnMap);
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

    // A multiwell plate expands to a summary row + one sub-row per seeded well.
    function plateSummaryRow(n, wr) {
      return '<tr data-node-id="' + esc(n.dataset.nodeId) + '" class="wlpc-plate-sum">' +
        '<td class="wlpc-col-label">' + esc(nodeLabel(n)) + '</td>' +
        '<td class="wlpc-col-p"></td>' +
        '<td>' + esc(vesselTypeFromIcon(n)) + '</td>' +
        '<td colspan="4"><span class="wlpc-chip">' + wr.length + " / " + plateWellCount(n) + " wells seeded</span> " +
          '<span class="wlpc-plate-hint">click a well row to edit, or this row for the grid</span></td>' +
        '<td class="wlpc-col-warn"></td>' +
        '</tr>';
    }
    function wellSubRow(n, r) {
      var status = r.status || "active";
      return '<tr data-plate-id="' + esc(n.dataset.nodeId) + '" data-well="' + esc(r.well) + '" class="wlpc-well-row">' +
        '<td class="wlpc-col-label"><span class="wlpc-well-tag">' + esc(r.well) + '</span> ' + esc(r.donor || "—") +
          (r.eye && r.eye !== "unknown" ? " " + esc(r.eye) : "") + '</td>' +
        '<td class="wlpc-col-p">' + (r.passage !== "" ? "P" + esc(r.passage) : "") + '</td>' +
        '<td></td>' +
        '<td><span class="wlpc-pill" style="color:' + statusColor(status) + '">' + esc(status.charAt(0).toUpperCase() + status.slice(1)) + '</span></td>' +
        '<td>' + esc(r.medium || "") + '</td>' +
        '<td class="wlpc-col-date">' + esc(r.seedDate || "") + '</td>' +
        '<td></td>' +
        '<td class="wlpc-col-warn"></td>' +
        '</tr>';
    }
    function nodeRows(n) {
      try {
        if (isPlateNode(n)) {
          var wr = plateWellRecords(n);
          if (wr.length) return plateSummaryRow(n, wr) + wr.map(function (r) { return wellSubRow(n, r); }).join("");
        }
      } catch (e) { /* fall back to a plain vessel row — never break the whole table */ }
      return vesselRow(n);
    }

    var bodyRows = groups.map(function (g) {
      var warnN = g.nodes.filter(function (n) { return warningsFor(n, peers, warnMap).length; }).length;
      var countChip = '<span class="wlpc-chip">' + g.nodes.length + (g.nodes.length === 1 ? " vessel" : " vessels") + "</span>";
      var warnChip = warnN ? '<span class="wlpc-chip wlpc-chip--warn">' + warnN + " to check</span>" : "";
      var header =
        '<tr class="wlpc-group"><td colspan="8">' +
          '<span class="wlpc-group__name">' + esc(g.label) + "</span>" + countChip + warnChip +
        "</td></tr>";
      return header + g.nodes.map(nodeRows).join("");
    }).join("");

    body.innerHTML =
      '<table class="wlpc-table"><thead><tr>' +
        th("Vessel / label") + th("P#") + th("Type") + th("Status") + th("Medium") +
        th("Seed date") + th("Lineage parent") + th("⚠") +
      "</tr></thead><tbody>" + bodyRows + "</tbody></table>";
    function jumpTo(plateId, cb) {
      if (typeof window.wlpSetWorkspace === "function") window.wlpSetWorkspace("cell-culture");
      syncView();
      setTimeout(function () { if (typeof window.wlpFocusNode === "function") window.wlpFocusNode(plateId); cb(); }, 80);
    }
    Array.prototype.forEach.call(body.querySelectorAll("tr[data-node-id]"), function (tr) {
      tr.addEventListener("click", function () {
        var id = tr.getAttribute("data-node-id");
        var node = document.querySelector('.drop[data-node-id="' + id + '"]');
        if (!node) return;
        // A plate opens its well-grid editor straight away (a modal — no need to
        // jump to the canvas); other vessels jump + focus their node then open.
        if (isPlateNode(node)) { openPlateRecord(node); return; }
        jumpTo(id, function () { openRecord(node); });
      });
    });
    // Per-well sub-rows open the plate editor focused on that well.
    Array.prototype.forEach.call(body.querySelectorAll("tr[data-plate-id]"), function (tr) {
      tr.addEventListener("click", function (e) {
        e.stopPropagation();
        var pid = tr.getAttribute("data-plate-id"), well = tr.getAttribute("data-well");
        var node = document.querySelector('.drop[data-node-id="' + pid + '"]');
        if (node) openPlateRecord(node, well);
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
  // Open a vessel's record: switch to the Cell Culture canvas, focus the node,
  // then pop the editor (the behaviour used throughout the recorder).
  // Open a record by node id. A plate-well id ("plateId#well") opens the plate
  // editor on that well (a modal — no canvas node to focus); a plain id opens the
  // vessel record.
  function openRecordById(id) {
    var sid = String(id || ""), h = sid.indexOf("#");
    if (h >= 0) {
      var pnode = document.querySelector('.drop[data-node-id="' + sid.slice(0, h) + '"]');
      if (pnode) openPlateRecord(pnode, sid.slice(h + 1));
      return;
    }
    var node = document.querySelector('.drop[data-node-id="' + sid + '"]');
    if (node) openRecord(node);
  }
  function focusAndOpen(id) {
    var sid = String(id || "");
    if (sid.indexOf("#") >= 0) { openRecordById(sid); return; } // a plate well — modal only
    var node = document.querySelector('.drop[data-node-id="' + sid + '"]');
    if (!node) return;
    if (typeof window.wlpSetWorkspace === "function") window.wlpSetWorkspace("cell-culture");
    syncView();
    setTimeout(function () {
      if (typeof window.wlpFocusNode === "function") window.wlpFocusNode(sid);
      openRecord(node);
    }, 80);
  }

  function wireRowClick(el) {
    el.addEventListener("click", function () {
      // A ×N cluster (vessels sharing a passage + seed date) expands to its
      // members so the user can decide split-vs-duplicate; a lone node opens
      // its record directly.
      var members = (el.getAttribute("data-cluster-members") || "").split(",").filter(Boolean);
      if (members.length > 1) { openClusterPanel(members); return; }
      focusAndOpen(el.getAttribute("data-node-id"));
    });
  }

  var clusterBackdrop = null;
  function closeClusterPanel() {
    if (clusterBackdrop) { clusterBackdrop.classList.add("is-hidden"); clusterBackdrop.style.display = "none"; }
  }
  // Expand a ×N timeline cluster: list the individual flasks that share this
  // passage + seed date so the user can open any one, or — if they turn out to
  // be the same flask logged twice — pick which to KEEP and merge the rest in.
  function openClusterPanel(memberIds) {
    var members = memberIds
      .map(function (id) { return document.querySelector('.drop[data-node-id="' + id + '"]'); })
      .filter(Boolean);
    if (members.length <= 1) { if (members[0]) focusAndOpen(members[0].dataset.nodeId); return; }

    if (!clusterBackdrop) {
      clusterBackdrop = document.createElement("div");
      clusterBackdrop.className = "modal-backdrop modal-backdrop--center is-hidden";
      clusterBackdrop.style.zIndex = "10001";
      document.body.appendChild(clusterBackdrop);
      clusterBackdrop.addEventListener("click", function (e) { if (e.target === clusterBackdrop) closeClusterPanel(); });
    }
    var rep = recordOf(members[0]);
    var head = (LOGIC().normalizeDonor(rep.donor) || "Unknown donor") +
      (rep.eye && rep.eye !== "unknown" ? " · " + String(rep.eye).toUpperCase() : "") +
      " · P" + (rep.passage !== "" && rep.passage != null ? esc(rep.passage) : "?") +
      (rep.seedDate ? " · " + esc(shortDate(rep.seedDate)) : "");

    var rows = members.map(function (n, i) {
      var r = recordOf(n);
      var notes = read(n, "Notes", "");
      var media = read(n, "Medium", "");
      var meta = [LOGIC().vesselTypeFromIcon(r.iconId), r.status || "active"];
      if (media) meta.push(media);
      if (notes) meta.push(notes.slice(0, 48) + (notes.length > 48 ? "…" : ""));
      return '<div class="wlpc-cl-row">' +
        '<label class="wlpc-cl-keep" title="Keep this one when merging">' +
          '<input type="radio" name="wlpcSurv" value="' + esc(n.dataset.nodeId) + '"' + (i === 0 ? " checked" : "") + ">" +
          "<span>keep</span>" +
        "</label>" +
        '<button type="button" class="wlpc-cl-open" data-open="' + esc(n.dataset.nodeId) + '">' +
          '<span class="wlpc-cl-name">' + esc(nodeLabel(n)) + "</span>" +
          '<span class="wlpc-cl-meta">' + esc(meta.join(" · ")) + "</span>" +
        "</button>" +
      "</div>";
    }).join("");

    clusterBackdrop.innerHTML =
      '<div class="modal" style="max-width:540px;width:540px;margin-top:9vh">' +
        '<div class="modal__header" style="display:flex;align-items:center;justify-content:space-between">' +
          "<h3 style=\"margin:0\">" + members.length + " vessels — split or duplicate?</h3>" +
          '<button type="button" class="btn wlpc-cl-x" id="wlpcClX" aria-label="Close">✕</button>' +
        "</div>" +
        '<div class="modal__body">' +
          '<p class="wlpc-cl-lead">' + head + "</p>" +
          '<p class="wlpc-cl-hint">These vessels share a passage <em>and</em> a seed date. If they are the same vessel entered more than once, choose which to <strong>keep</strong> and merge the rest into it. If they are real splits from one parent, leave them as ' + members.length + " separate vessels.</p>" +
          '<div class="wlpc-cl-list">' + rows + "</div>" +
        "</div>" +
        '<div class="modal__footer" style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">' +
          '<button type="button" class="btn" id="wlpcClCancel">Keep separate</button>' +
          '<button type="button" class="btn btn--danger" id="wlpcClMerge">Merge into 1</button>' +
        "</div>" +
      "</div>";
    clusterBackdrop.classList.remove("is-hidden");
    clusterBackdrop.style.display = "flex";

    clusterBackdrop.querySelector("#wlpcClX").onclick = closeClusterPanel;
    clusterBackdrop.querySelector("#wlpcClCancel").onclick = closeClusterPanel;
    Array.prototype.forEach.call(clusterBackdrop.querySelectorAll(".wlpc-cl-open"), function (b) {
      b.onclick = function () { closeClusterPanel(); focusAndOpen(b.getAttribute("data-open")); };
    });
    clusterBackdrop.querySelector("#wlpcClMerge").onclick = function () {
      var sel = clusterBackdrop.querySelector('input[name="wlpcSurv"]:checked');
      var survivor = sel ? sel.value : members[0].dataset.nodeId;
      var victims = members
        .map(function (n) { return n.dataset.nodeId; })
        .filter(function (id) { return id && id !== survivor; });
      if (typeof window.wlpMergeCultureNodes !== "function") { closeClusterPanel(); return; }
      var removed = window.wlpMergeCultureNodes(survivor, victims);
      closeClusterPanel();
      renderView();
      try { renderBadges(); } catch (e) { /* ignore */ }
      showImportStatus("Merged " + removed + " duplicate" + (removed === 1 ? "" : "s") + " into one vessel.", false);
    };
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

  // A donor ground-truth CSV (from the donor-consolidation step) vs. a vessel CSV.
  function isDonorCsv(text) {
    var first = String(text || "").split(/\r?\n/, 1)[0].toLowerCase();
    return first.indexOf("rawdonorid") >= 0 ||
      (first.indexOf("allfields") >= 0 && first.indexOf("matchstatus") >= 0);
  }

  // Import a donor ground-truth CSV into the registry (persisted per project via
  // app.js). Records are keyed by donor id + source so re-importing is idempotent.
  function runDonorImport(text) {
    var rows = LOGIC().parseCsv(text) || [];
    if (rows.length < 2) { showImportStatus("No donor rows found in that CSV.", true); return; }
    var hdr = rows[0].map(function (h) { return String(h || "").trim().toLowerCase(); });
    function col(r, name) { var i = hdr.indexOf(name); return i >= 0 && i < r.length ? String(r[i] == null ? "" : r[i]).trim() : ""; }
    var recs = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (!r || !r.length) continue;
      var donor = col(r, "rawdonorid") || col(r, "donor") || col(r, "donor id");
      if (!donor) continue;
      recs.push({
        donor: donor, eye: col(r, "eye"), source: col(r, "source"),
        deceased: col(r, "deceaseddate"), dissociation: col(r, "dissociationdate"),
        preservation: col(r, "preservationdate"), processing: col(r, "processingdate"),
        seeding: col(r, "seedingsuccess"), age: col(r, "age"), sex: col(r, "sex"),
        ethnicity: col(r, "ethnicity"), endothelial: col(r, "endothelialdensity"),
        cod: col(r, "causeofdeath"), deathTime: col(r, "deathdatetime"),
        sourceTz: col(r, "sourcetimezone"), deathUS: col(r, "deathlocalus"),
        serology: col(r, "serology"), gtSource: col(r, "groundtruthsource"),
        deceasedLog: col(r, "deceaseddatelog"), ecdLog: col(r, "endothelialdensitylog"),
        ageLog: col(r, "agelog"), sexLog: col(r, "sexlog"),
        fieldSources: parseFieldSources(col(r, "logfieldsources")),
        allFields: col(r, "allfields")
      });
    }
    if (!recs.length) { showImportStatus("No donor rows found in that CSV.", true); return; }
    // combined_donors.csv is a COMPLETE consolidation, so replace the registry
    // rather than append (re-running the consolidation changes source strings and
    // would otherwise duplicate rows). Carry over the user's confirm/dismiss
    // decisions by donor id so re-importing an updated file doesn't lose them.
    var prev = (typeof window.wlpLoadCultureDonors === "function") ? (window.wlpLoadCultureDonors() || []) : [];
    var decided = {};
    prev.forEach(function (d) {
      if (d && (d.confirmedVessel || d._dismissed)) {
        decided[String(d.donor || "").toLowerCase()] = { confirmedVessel: d.confirmedVessel, _dismissed: d._dismissed };
      }
    });
    var carried = 0;
    recs.forEach(function (d) {
      var v = decided[String(d.donor || "").toLowerCase()];
      if (v) { if (v.confirmedVessel) d.confirmedVessel = v.confirmedVessel; if (v._dismissed) d._dismissed = true; carried++; }
    });
    if (typeof window.wlpSaveCultureDonors === "function") window.wlpSaveCultureDonors(recs);
    renderView();
    showImportStatus("Imported " + recs.length + " donor record" + (recs.length === 1 ? "" : "s") +
      (carried ? " (kept " + carried + " confirmed/dismissed)" : "") + " — see “Needs confirmation”.", false);
  }

  // A microscopy-imaging CSV (from imaging_consolidate.py) vs. a vessel/donor CSV.
  function isImagingCsv(text) {
    var first = String(text || "").split(/\r?\n/, 1)[0].toLowerCase();
    return first.indexOf("matchedvessel") >= 0 && first.indexOf("images") >= 0 && first.indexOf("condition") >= 0;
  }
  function eyesOk(a, b) {
    a = String(a || "").toLowerCase(); b = String(b || "").toLowerCase();
    var blank = function (e) { return e === "" || e === "unknown" || e === "ou"; };
    return blank(a) || blank(b) || a === b;
  }
  // ─── Microscopy imaging (source 4) ─────────────────────────────────────────
  // A stable identity for an imaging session (used to remember user corrections).
  function imgSessionKey(s) { return [s.date, s.donor, s.passage, s.cond].join("|"); }
  function parseImagingSessions(node) {
    try { var a = JSON.parse(node.dataset.cultureImagingSessions || "[]"); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function writeImagingSessions(node, arr) {
    if (arr && arr.length) {
      node.dataset.cultureImagingSessions = JSON.stringify(arr);
      var dates = arr.map(function (s) { return s.date; }).filter(Boolean).sort();
      var span = dates.length ? (shortDate(dates[0]) + (dates.length > 1 ? "→" + shortDate(dates[dates.length - 1]) : "")) : "";
      var imgs = arr.reduce(function (n, s) { return n + (s.images || 0); }, 0);
      write(node, "Imaging", arr.length + " session" + (arr.length === 1 ? "" : "s") + " · " + imgs + " fields" + (span ? " · " + span : ""));
    } else {
      delete node.dataset.cultureImagingSessions;
      write(node, "Imaging", "");
    }
  }
  // Uncertain / gap sessions awaiting user review (rebuilt on each import).
  var imagingPending = [];

  // Import brightfield-imaging sessions and attach each to its vessel. Only
  // HIGH-CONFIDENCE (exact donor core + passage) matches auto-attach; typo /
  // ambiguous / gap sessions go to imagingPending for the user to confirm or
  // reassign. User corrections (sessions manually placed on a node) are preserved
  // across re-import. The real image files are never touched.
  function runImagingImport(text) {
    var rows = LOGIC().parseCsv(text) || [];
    if (rows.length < 2) { showImportStatus("No imaging rows found in that CSV.", true); return; }
    var hdr = rows[0].map(function (h) { return String(h || "").trim().toLowerCase(); });
    function col(r, name) { var i = hdr.indexOf(name); return i >= 0 && i < r.length ? String(r[i] == null ? "" : r[i]).trim() : ""; }

    var nodes = allCultureVessels();
    // Preserve manual corrections at the GROUP level (filename donor|passage ->
    // nodeId), so a re-import re-attaches EVERY session the user placed on that
    // vessel — including new imaging dates — without depending on the exact
    // per-session key (which carries the lossy condition token).
    var manualByGroup = {};
    nodes.forEach(function (n) {
      parseImagingSessions(n).forEach(function (s) {
        if (s.manual && s.donor != null) manualByGroup[s.donor + "|" + (s.passage || "")] = n.dataset.nodeId || "";
      });
    });

    var nodeInfo = nodes.map(function (n) {
      return { node: n, aliases: LOGIC().donorIdentity(read(n, "Donor", "")).aliases,
        eye: read(n, "Eye", ""), passage: String(read(n, "Passage", "")).replace(/\D/g, ""), out: [] };
    });
    var aliasIndex = {}, byId = {};
    nodeInfo.forEach(function (ni, i) {
      byId[ni.node.dataset.nodeId || ""] = ni;
      ni.aliases.forEach(function (a) { (aliasIndex[a] = aliasIndex[a] || []).push(i); });
    });

    imagingPending = [];
    var total = 0, matched = 0, gap = 0;
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r]; if (!row || !row.length) continue;
      var donor = col(row, "donor"); if (!donor) continue;
      total++;
      var s = { donor: donor, eye: col(row, "eye"), passage: col(row, "passage").replace(/\D/g, ""),
        date: col(row, "date"), cond: col(row, "condition"), images: parseInt(col(row, "images"), 10) || 0,
        status: col(row, "matchstatus"), nearest: col(row, "nearestvessel"), editDist: col(row, "editdist"),
        ambiguous: col(row, "ambiguous"), path: col(row, "samplepath") || col(row, "samplefile") };
      s.key = imgSessionKey(s);
      var entry = { key: s.key, date: s.date, cond: s.cond, images: s.images, path: s.path, donor: s.donor, passage: s.passage };

      // 1) honour a prior manual correction (group-level, so new dates follow it)
      var gkey = s.donor + "|" + (s.passage || "");
      if (manualByGroup[gkey] && byId[manualByGroup[gkey]]) {
        byId[manualByGroup[gkey]].out.push(Object.assign({ manual: true }, entry)); matched++; continue;
      }
      // 2) high-confidence auto-attach: status "matched" (exact donor core +
      //    passage). Imaging is recorded per PASSAGE and the timeline shows one 🔬
      //    per passage, so a plain SPLIT — several flasks of the same (or blank)
      //    eye at this passage — is not ambiguous: attach to a single
      //    representative rather than fanning the image onto every flask (which
      //    would double-count fields and pin sibling images to each other).
      //    Genuine EYE ambiguity — a blank / both-eyes session when the donor has
      //    BOTH an OD and an OS vessel at this passage — must not be pinned to one
      //    cornea, so route those to review.
      if (s.status === "matched") {
        var sid = LOGIC().donorIdentity(s.donor), seen = {}, cands = [], eyeSet = {};
        sid.aliases.forEach(function (a) {
          (aliasIndex[a] || []).forEach(function (i) {
            if (seen[i]) return; seen[i] = true;
            var ni = nodeInfo[i];
            if (ni.passage !== s.passage || !eyesOk(ni.eye, s.eye)) return;
            cands.push(i);
            var e = String(ni.eye || "").toLowerCase(); if (e === "od" || e === "os") eyeSet[e] = true;
          });
        });
        if (cands.length) {
          var sEye = String(s.eye || "").toLowerCase();
          var sBlank = (sEye === "" || sEye === "unknown" || sEye === "ou" || sEye === "odos");
          var eyeAmbiguous = sBlank && eyeSet.od && eyeSet.os;
          if (!eyeAmbiguous) { nodeInfo[cands[0]].out.push(entry); matched++; continue; }
          imagingPending.push(s); continue;
        }
        // no candidate on this canvas — fall through to review/gap
      }
      // 3) everything not confidently placed -> review queue. Only sessions with no
      //    plausible vessel anywhere are counted as gaps (surfaced in the status
      //    line, never silently dropped).
      if (s.status === "uncertain" || s.status === "ambiguous" || s.status === "fuzzy" ||
          s.status === "donor-only" || s.status === "matched" || s.nearest) {
        imagingPending.push(s);
      } else { gap++; }
    }

    var covered = 0;
    nodeInfo.forEach(function (ni) { if (ni.out.length) covered++; writeImagingSessions(ni.node, ni.out); });
    if (typeof window.wlpMarkCanvasDirty === "function") window.wlpMarkCanvasDirty();
    renderView();
    showImportStatus("Imaging: " + covered + " vessels matched · " + matched + "/" + total + " sessions linked · " +
      imagingPending.length + " uncertain to review · " + gap + " no-match.", false);
  }

  function runCsvImport(text) {
    if (isImagingCsv(text)) { runImagingImport(text); return; }
    if (isDonorCsv(text)) { runDonorImport(text); return; }
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
      var rawPl = String(c.draft.parentLabel || "").replace(/\s+/g, " ").trim();
      // Remember the raw parent label the CSV declared, even if it can't be
      // resolved — the family tree uses it to flag unlinked / cross-donor parents
      // so messy imports are legible rather than silently orphaned.
      var cnode0 = document.querySelector('.drop[data-node-id="' + c.nodeId + '"]');
      if (cnode0 && rawPl) cnode0.dataset.cultureParentLabel = rawPl;
      var pl = rawPl.toLowerCase();
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

  // The lineage as a per-donor·eye TIMELINE: each donor gets its own compact
  // horizontal date axis, vessels drawn as their vessel-type SYMBOL (tinted by
  // status) positioned by seed date and joined by passage lineage. Uncertain
  // ("?"/best-guess) donor ids get a marker; anomalies (unlinked / cross-donor /
  // passage↓) are flagged. Click a symbol to open its record.
  function renderTree() {
    if (!buildView()) return;
    var body = view.querySelector("#wlpcGridBody");
    var all = allRecordsExpanded(); // each seeded plate well is its own timeline point
    var warnMapAll = LOGIC().cultureWarningsBatch(all); // warnings vs the fanned-out set
    var shown = filteredRecords(all, warnMapAll);
    // Count physical vessels (nodes) in the subtitle so it matches the Table view —
    // the timeline still *renders* the fanned-out per-well points.
    var nodeRecs = allRecords();
    var warnMapNode = LOGIC().cultureWarningsBatch(nodeRecs); // warnings vs physical nodes
    updateSubtitle(nodeRecs, filteredRecords(nodeRecs, warnMapNode), warnMapNode);
    var forest = LOGIC().buildLineageForest(shown);
    if (!forest.length) {
      body.innerHTML = emptyMessage(all.length > 0);
      return;
    }
    var flags = LOGIC().lineageFlags(all); // anomalies computed against the full set

    var groups = [], byKey = {};
    forest.forEach(function (root) {
      var r = root.record;
      var key = LOGIC().normalizeDonor(r.donor).toLowerCase() + "|" + String(r.eye || "").trim().toLowerCase();
      var g = byKey[key];
      if (!g) {
        g = byKey[key] = {
          label: (LOGIC().normalizeDonor(r.donor) || "Unknown donor") +
            (r.eye && r.eye !== "unknown" ? " · " + String(r.eye).toUpperCase() : ""),
          roots: [], vessels: [], issues: 0,
        };
        groups.push(g);
      }
      g.roots.push(root);
    });
    groups.forEach(function (g) {
      (function collect(nodes) { nodes.forEach(function (n) { g.vessels.push(n.record); collect(n.children || []); }); })(g.roots);
      g.vessels.forEach(function (r) {
        var f = flags[String(r.nodeId)] || {};
        if (f.orphan || f.crossDonor || f.passageBack || (warnMapAll[String(r.nodeId)] || []).length) g.issues++;
      });
    });

    var html = '<div class="wlpc-tl">';
    groups.forEach(function (g) {
      html +=
        '<div class="wlpc-tl-group">' +
          '<div class="wlpc-tree-group__hd">' +
            '<span class="wlpc-tree-group__name">' + esc(g.label) + "</span>" +
            '<span class="wlpc-tree-group__count">' + g.vessels.length + (g.vessels.length === 1 ? " vessel" : " vessels") + "</span>" +
            (g.issues ? '<span class="wlpc-tree-group__issues" title="Records with an anomaly or that need attention">&#9888; ' +
              g.issues + (g.issues === 1 ? " issue" : " issues") + "</span>" : "") +
          "</div>" +
          groupTimelineSvg(g.vessels, flags, all) +
        "</div>";
    });
    html += "</div>";
    body.innerHTML = html;
    Array.prototype.forEach.call(body.querySelectorAll("[data-node-id]"), wireRowClick);
    // Click a 🔬 icon to open/view its image (never renames the file).
    Array.prototype.forEach.call(body.querySelectorAll(".wlpc-tl-imgpt.is-openable"), function (el) {
      el.addEventListener("click", function (e) {
        e.stopPropagation();
        var p = el.getAttribute("data-img-path");
        if (!p) return;
        if (typeof window.wlpOpenImage !== "function") { showImportStatus("Opening images needs the desktop app.", true); return; }
        Promise.resolve(window.wlpOpenImage(p)).then(function (res) {
          if (res && res.ok) showImportStatus(res.mode === "reveal" ? "Revealed the image in Finder." : "Opening image…", false);
          else showImportStatus("Couldn’t open the image" + (res && res.error ? " (" + res.error + ")" : "") + ".", true);
        });
      });
    });
  }

  function shortDate(s) { var m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? (m[2] + "/" + m[3] + "/" + m[1].slice(2)) : ""; }

  // Render one donor·eye group's vessels as an SVG date-axis timeline.
  function groupTimelineSvg(vessels, flags, all) {
    var GUT = 42, LEFT = 100, RIGHT = 968, TOP = 22, SUBH = 54, NR = 15, MINGAP = NR * 2 + 24;
    var msOf = function (s) { var t = Date.parse(s); return isNaN(t) ? NaN : t; };
    function pnum(v) { var n = Number(v.passage); return (v.passage !== "" && v.passage != null && !isNaN(n)) ? n : null; }

    // A vessel that takes part in lineage — it has a parent, or it IS a parent —
    // gets its OWN node, so a passage BRANCH POINT shows as independent lines from
    // the parent to each daughter (rather than the daughters collapsing into one
    // ×N node with a single merged link). Vessels with no lineage still collapse by
    // passage + seed date into one node with a ×N badge (duplicate/parallel entries).
    var hasChild = {};
    vessels.forEach(function (v) { if (v.parentNodeId) hasChild[v.parentNodeId] = true; });
    var clusters = [], byKey = {}, clOf = {};
    vessels.forEach(function (v) {
      var pk = (pnum(v) === null ? "?" : pnum(v));
      // Lineage vessels AND individual plate wells each get their own node (a well
      // is a distinct entry with no real .drop node, so it must not fold into a ×N
      // cluster whose expand/merge acts on nodes).
      var inLineage = v.parentNodeId || hasChild[v.nodeId] || v.isWell;
      var key = inLineage ? ("solo::" + v.nodeId) : (pk + "||" + String(v.seedDate || ""));
      var c = byKey[key];
      if (!c) { c = byKey[key] = { pk: pk, seed: v.seedDate, ms: msOf(v.seedDate), members: [], rep: v, id: clusters.length }; clusters.push(c); }
      c.members.push(v);
      clOf[v.nodeId] = c;
    });

    // Imaging sessions per passage band — one 🔬 per (passage, date), placed at its
    // imaging date along the growth span. Their dates extend the axis domain so a
    // session imaged after the last seed date still lands on the timeline.
    var imgByBand = {}, imgMs = [];
    vessels.forEach(function (v) {
      var pk = (pnum(v) === null ? "?" : pnum(v));
      (v.imagingSessions || []).forEach(function (s) {
        if (!s || !s.date) return;
        var ms = msOf(s.date); if (isNaN(ms)) return;
        imgMs.push(ms);
        var band = imgByBand[pk] = imgByBand[pk] || {};
        var e = band[s.date] = band[s.date] || { ms: ms, imgs: 0, n: 0, conds: {}, path: "" };
        e.imgs += (s.images || 0); e.n++; if (s.cond) e.conds[s.cond] = true; if (!e.path && s.path) e.path = s.path;
      });
    });

    var datedC = clusters.filter(function (c) { return !isNaN(c.ms); });
    var seedMs = datedC.map(function (c) { return c.ms; });
    var baseMin = seedMs.length ? Math.min.apply(null, seedMs) : (imgMs.length ? Math.min.apply(null, imgMs) : 0);
    var baseMax = seedMs.length ? Math.max.apply(null, seedMs) : (imgMs.length ? Math.max.apply(null, imgMs) : 0);
    // The axis is anchored to the vessel SEED dates. Imaging dates may extend it,
    // but only within ~120 days of the seed span — a wild typo date (e.g. 2026 on a
    // 2025 donor) must not rescale and collapse the vessel layout. Out-of-window
    // icons are clamped to the axis edge by xOf().
    var PAD = 120 * 24 * 3600 * 1000;
    var minMs = baseMin, maxMs = baseMax;
    imgMs.forEach(function (m) { if (m >= baseMin - PAD && m <= baseMax + PAD) { if (m < minMs) minMs = m; if (m > maxMs) maxMs = m; } });
    function xOf(ms) {
      if (isNaN(ms)) return LEFT;
      if (maxMs === minMs) return (LEFT + RIGHT) / 2;
      var x = LEFT + (ms - minMs) / (maxMs - minMs) * (RIGHT - LEFT);
      return x < LEFT ? LEFT : (x > RIGHT ? RIGHT : x);
    }
    function baseX(c) { return xOf(c.ms); }

    // Passage bands (numeric ascending, then unknown "P?").
    var bandKeys = [], sBand = {};
    clusters.forEach(function (c) { if (!sBand[c.pk]) { sBand[c.pk] = true; bandKeys.push(c.pk); } });
    bandKeys.sort(function (a, b) { if (a === "?") return 1; if (b === "?") return -1; return a - b; });
    var bandTop = {}, bandRows = {}, y = TOP;
    bandKeys.forEach(function (k) {
      var arr = clusters.filter(function (c) { return c.pk === k; }).sort(function (a, b) { return baseX(a) - baseX(b); });
      var lastX = [];
      arr.forEach(function (c) { var x = baseX(c), row = 0; for (; row < lastX.length; row++) { if (lastX[row] <= x - MINGAP) break; } lastX[row] = x; c._x = x; c._row = row; });
      var rows = Math.max(1, lastX.length);
      bandTop[k] = y; bandRows[k] = rows;
      arr.forEach(function (c) { c._y = y + c._row * SUBH + SUBH / 2; });
      y += rows * SUBH;
    });
    var H = y + 18;

    // Lineage edges between CLUSTERS (parent's cluster → child's cluster), deduped.
    // One independent link per parent→daughter vessel (no per-cluster dedup), so a
    // branch point fans out: a shared vertical drop from the parent, then a separate
    // right-angle arm to each daughter's date. Orthogonal — no curves.
    var edges = "";
    vessels.forEach(function (v) {
      if (!v.parentNodeId) return;
      var pc = clOf[v.parentNodeId], cc = clOf[v.nodeId];
      if (!pc || !cc || pc === cc) return;
      var my = (pc._y + cc._y) / 2;
      edges += '<path class="wlpc-tl-edge" d="M' + pc._x.toFixed(1) + " " + pc._y + " V" + my.toFixed(1) + " H" + cc._x.toFixed(1) + " V" + cc._y + '"/>';
    });

    var bands = "";
    bandKeys.forEach(function (k) {
      var yc = bandTop[k] + bandRows[k] * SUBH / 2;
      bands += '<line class="wlpc-tl-grid" x1="' + GUT + '" y1="' + yc + '" x2="' + RIGHT + '" y2="' + yc + '"/>' +
        '<text class="wlpc-tl-band" x="' + (GUT - 6) + '" y="' + (yc + 4) + '" text-anchor="end">' + (k === "?" ? "P?" : "P" + k) + "</text>";
    });

    var axis = "";
    if (datedC.length && maxMs > minMs) {
      var yb = H - 4;
      axis = '<line class="wlpc-tl-axis" x1="' + LEFT + '" y1="' + yb + '" x2="' + RIGHT + '" y2="' + yb + '"/>' +
        '<text class="wlpc-tl-axlabel" x="' + LEFT + '" y="' + (yb - 4) + '" text-anchor="start">' + esc(shortDate(new Date(minMs).toISOString().slice(0, 10))) + "</text>" +
        '<text class="wlpc-tl-axlabel" x="' + RIGHT + '" y="' + (yb - 4) + '" text-anchor="end">' + esc(shortDate(new Date(maxMs).toISOString().slice(0, 10))) + "</text>";
    }

    var nodes = "";
    clusters.forEach(function (c) {
      var v = c.rep, n = c.members.length;
      var color = statusColor(v.status || "active");
      var uncertain = c.members.some(function (m) { return /^\s*[?~*]/.test(String(m.donor || "")); });
      var anyFlag = c.members.some(function (m) { var f = flags[m.nodeId] || {}; return f.orphan || f.crossDonor || f.passageBack; });
      var inner = (typeof window.wlpIconInner === "function") ? window.wlpIconInner(v.iconId) : "";
      var pass = (v.passage !== "" && v.passage != null) ? "P" + esc(v.passage) : "P?";
      var t = [(n > 1 ? n + "× " : "") + (v.isWell ? "Well " + v.well + " · " : "") + pass + (v.seedDate ? " · " + shortDate(v.seedDate) : ""), LOGIC().vesselTypeFromIcon(v.iconId), v.status || "active"];
      if (n > 1) t.push(n + " flasks at this passage on one date — a split, or duplicate entries");
      if (uncertain) t.push("best guess (source marked uncertain)");
      nodes +=
        '<g class="wlpc-tl-node' + (anyFlag ? " is-flagged" : "") + (n > 1 ? " is-cluster" : "") + (v.isWell ? " is-well" : "") + '" data-node-id="' + esc(v.nodeId) + '"' +
          (n > 1 ? ' data-cluster-members="' + esc(c.members.map(function (m) { return m.nodeId; }).join(",")) + '"' : "") +
          ' transform="translate(' + c._x.toFixed(1) + "," + c._y + ')">' +
          "<title>" + esc(t.join(" · ")) + "</title>" +
          '<circle class="wlpc-tl-ring" r="' + NR + '" style="stroke:' + color + '"/>' +
          '<g transform="translate(-11.5,-11.5) scale(0.36)" style="color:' + color + '">' + inner + "</g>" +
          '<text class="wlpc-tl-date" y="' + (NR + 12) + '" text-anchor="middle">' + (v.seedDate ? esc(shortDate(v.seedDate)) : "—") + "</text>" +
          (n > 1 ? '<circle class="wlpc-tl-count-bg" cx="' + (NR - 1) + '" cy="-' + (NR - 3) + '" r="8"/><text class="wlpc-tl-count" x="' + (NR - 1) + '" y="-' + (NR - 6) + '" text-anchor="middle">' + n + "</text>" : "") +
          // Backed by its own chip and lifted clear of the ring — as bare text the
          // well id straddled the node outline and was hard to read.
          (v.isWell ? '<rect class="wlpc-tl-wellbg" x="' + (NR - 21) + '" y="' + (-NR - 10) + '" width="24" height="13" rx="6.5"/>' +
            '<text class="wlpc-tl-well" x="' + (NR - 9) + '" y="' + (-NR - 1) + '" text-anchor="middle">' + esc(v.well) + "</text>" : "") +
          (uncertain ? '<text class="wlpc-tl-guess" x="-' + (NR - 1) + '" y="-' + (NR - 5) + '" text-anchor="end">?</text>' : "") +
          (anyFlag ? '<circle class="wlpc-tl-flag" cx="-' + (NR - 2) + '" cy="' + (NR - 3) + '" r="4"/>' : "") +
        "</g>";
    });

    // Date-placed 🔬 icons: one per (passage, imaging date), sitting ON the passage
    // band line at the imaging date it was taken. Only nudged apart by a hair when
    // two dates would otherwise fully overlap (so each stays clickable) — otherwise
    // each lands exactly on its date. Clickable to open the image.
    var IMG_R = 7, IMG_SEP = 15;
    var imgIcons = "";
    Object.keys(imgByBand).forEach(function (pk) {
      if (bandTop[pk] == null) return;
      var yc = bandTop[pk] + bandRows[pk] * SUBH / 2;
      var band = imgByBand[pk];
      var entries = Object.keys(band).map(function (d) { return { d: d, e: band[d], x: xOf(band[d].ms) }; });
      entries.sort(function (a, b) { return a.x - b.x; });
      var lastX = -1e9;
      entries.forEach(function (it) {
        var x = it.x; if (x < lastX + IMG_SEP) x = lastX + IMG_SEP; if (x > RIGHT) x = RIGHT; lastX = x;
        var e = it.e;
        var conds = Object.keys(e.conds).join(", ");
        var title = "🔬 " + shortDate(it.d) + " · " + e.imgs + " field" + (e.imgs === 1 ? "" : "s") +
          (conds ? " · " + conds : "") + (e.path ? " · click to view" : " · (no path)");
        imgIcons +=
          '<g class="wlpc-tl-imgpt' + (e.path ? " is-openable" : "") + '"' + (e.path ? ' data-img-path="' + esc(e.path) + '"' : "") +
            ' transform="translate(' + x.toFixed(1) + "," + yc + ')">' +
            "<title>" + esc(title) + "</title>" +
            '<circle class="wlpc-tl-imgpt-bg" r="' + IMG_R + '"/>' +
            '<text class="wlpc-tl-imgpt-ico" y="3" text-anchor="middle">🔬</text>' +
          "</g>";
      });
    });

    // Paint 🔬 icons BEFORE nodes so that when an imaging date coincides with a
    // vessel's seed date (same x on the band line) the vessel node is on top and
    // wins the click — the icon still opens elsewhere along the line.
    // Pinned to the 1000-unit design size (not width="100%"), so the drawing keeps
    // 1:1 scale and its labels stay legible; .wlpc-tl scrolls sideways instead.
    return '<svg class="wlpc-tl-svg" viewBox="0 0 1000 ' + H + '" width="1000" height="' + H + '" preserveAspectRatio="xMinYMid meet">' + bands + axis + edges + imgIcons + nodes + "</svg>";
  }

  // Show the records view (and hide the canvas + palette) while the recorder
  // workspace tab is active; restore them otherwise.
  var canvasEl = null;
  var paletteEl = null;
  var workspaceEl = null;
  var recorderWasActive = false;
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
      // Only (re)render when the recorder first becomes active — not on every
      // 1.2s tick. A per-tick rebuild is wasteful for hundreds of vessels and
      // resets interactive state (open panels, scroll position). Explicit actions
      // (import, add, filter, confirm) call renderView() directly.
      if (!recorderWasActive) {
        renderView();
        // Pull the donor registry from the sidecar if it isn't loaded yet, then
        // re-render the reconciliation panel once it arrives. The initial render
        // happens before the async hydration completes, so also re-render on a
        // short delay as a guaranteed catch-up (survives app restarts).
        if (typeof window.wlpEnsureDonorsHydrated === "function") {
          try {
            Promise.resolve(window.wlpEnsureDonorsHydrated())
              .then(function () { try { renderReconcilePanel(); } catch (e) { /* ignore */ } })
              .catch(function () { /* ignore */ });
          } catch (e) { /* ignore */ }
        }
        setTimeout(function () {
          if (view && view.style.display !== "none") { try { renderReconcilePanel(); } catch (e) { /* ignore */ } }
        }, 900);
      }
      recorderWasActive = true;
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
      recorderWasActive = false;
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
