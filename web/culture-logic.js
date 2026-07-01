// Pure Cell Culture logic for WetLab Planner — NO DOM, NO globals.
//
// UMD: exposed as window.WLPCultureLogic in the browser (loaded before app.js +
// culture.js) and as a CommonJS module in Node (so it's unit-testable with the
// built-in test runner — see tests/culture-logic.test.js). Keep this file pure:
// every export is a function of its arguments with no side effects, so the same
// code that runs in the app is the code the tests exercise.
//
// A "record" here is a plain object: { nodeId, donor, eye, passage, seedDate,
// status, parentNodeId, ... } — the shape culture.js builds from a node's dataset.
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else (root || (typeof self !== "undefined" ? self : this)).WLPCultureLogic = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var VESSEL_TYPES = {
    t25_flask: "T25 flask", t75_flask: "T75 flask", t150_flask: "T150 flask",
    t175_flask: "T175 flask", t225_flask: "T225 flask", t300_flask: "T300 flask",
    plate_6: "6-well plate", plate_12: "12-well plate", plate_24: "24-well plate",
    plate_48: "48-well plate", plate_96: "96-well plate", plate_384: "384-well plate", plate_1536: "1536-well plate",
    dish_35mm: "35mm dish", dish_60mm: "60mm dish", dish_100mm: "100mm dish", dish_150mm: "150mm dish",
    cell_line: "Cell line", primary_tissue: "Primary tissue"
  };

  // Provenance / source-tracking enums (camelCase record fields stored on the
  // node dataset as culture<Field>). Ported from the original recorder's
  // SourceRecordType / GroundTruthDateField in src/types.ts.
  var SOURCE_RECORD_TYPES = ["culture_vessel", "primary_tissue_dissociation", "mixed_source_note"];
  var GROUND_TRUTH_DATE_FIELDS = ["seed_date", "dissociation_date", "pretreatment_date", "unresolved"];

  function str(v) { return v == null ? "" : String(v); }

  function vesselTypeFromIcon(iconId) {
    var id = str(iconId);
    return VESSEL_TYPES[id] || id || "Vessel";
  }

  function isCultureVesselIcon(iconId) {
    var id = str(iconId);
    return id.indexOf("_flask") >= 0 || id.indexOf("dish_") === 0 || id.indexOf("plate_") === 0 || id === "cell_line" || id === "primary_tissue";
  }

  // The canvas-label summary for a vessel, e.g. "6769 OD P2". Empty when no donor.
  function cultureLabelSummary(rec) {
    rec = rec || {};
    var donor = str(rec.donor).trim();
    if (!donor) return "";
    var eye = str(rec.eye).trim();
    var p = str(rec.passage).trim();
    return donor + (eye && eye !== "unknown" ? " " + eye : "") + (p !== "" ? " P" + p : "");
  }

  // Only overwrite a node's label when the user hasn't given it a genuinely
  // custom name: it's blank, it still equals the summary we last auto-generated,
  // or it's still the default vessel-type placeholder a freshly dropped node
  // carries (e.g. "T75 Flask", case-insensitive).
  function shouldOverwriteLabel(currentLabel, lastAuto, placeholder) {
    var cur = str(currentLabel).trim();
    if (cur === "") return true;
    if (cur === str(lastAuto).trim()) return true;
    if (placeholder && cur.toLowerCase() === str(placeholder).trim().toLowerCase()) return true;
    return false;
  }

  function dateMs(s) {
    var t = Date.parse(str(s));
    return isNaN(t) ? NaN : t;
  }
  function recLabel(p) {
    return str(p.label).trim() || (str(p.donor) + " " + str(p.eye)).trim() || str(p.nodeId);
  }
  function num(v) {
    return v === "" || v == null ? null : Number(v);
  }

  // ─── Provenance helpers (ported from the original recorder) ─────────────────
  // A flask, dish or multiwell-plate icon (a physical culture vessel, as opposed
  // to a cell line or primary-tissue record). Used by the source-type-vs-vessel rule.
  function isFlaskOrDishIcon(iconId) {
    var id = str(iconId);
    return id.indexOf("_flask") >= 0 || id.indexOf("dish_") === 0 || id.indexOf("plate_") === 0;
  }
  // Normalize a raw source / donor identifier for equality (strip case + punctuation).
  function normalizeSourceId(value) {
    return str(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  }
  // Same calendar day (compares the YYYY-MM-DD prefix).
  function sameDate(a, b) {
    return str(a).slice(0, 10) === str(b).slice(0, 10);
  }
  // The ISO date shown in a warning message ("" when empty).
  function displayDate(value) {
    var s = str(value).trim();
    return s ? s.slice(0, 10) : "";
  }
  function sourceRecordLabel(type) {
    if (type === "primary_tissue_dissociation") return "Donor Tissue";
    if (type === "mixed_source_note") return "Mixed / Ambiguous";
    return "Culture Vessel";
  }
  function groundTruthLabel(field) {
    if (field === "dissociation_date") return "Dissociation date";
    if (field === "pretreatment_date") return "Pretreatment date";
    if (field === "unresolved") return "Unresolved";
    return "Seed date";
  }
  // The authoritative date a record sorts/ages by, per its ground_truth_date_field
  // (null when unresolved or the chosen date is empty).
  function groundTruthDate(record) {
    record = record || {};
    var f = str(record.groundTruthDateField) || "seed_date";
    if (f === "dissociation_date") return str(record.dissociationDate).trim() || null;
    if (f === "pretreatment_date") return str(record.pretreatmentDate).trim() || null;
    if (f === "unresolved") return null;
    return str(record.seedDate).trim() || null;
  }
  // A human suggestion for disambiguating a raw-source conflict.
  function suggestSourceConflictRename(record) {
    record = record || {};
    var donor = str(record.donor).trim() || str(record.rawSourceIdentifier).trim() || "source ID";
    var e = str(record.eye).trim();
    var eye = e && e !== "unknown" ? " " + e : "";
    var p = num(record.passage);
    if (record.sourceRecordType === "primary_tissue_dissociation") {
      return donor + eye + " tissue dissociation source; reserve the flask label for " +
        (str(record.label).trim() || (donor + eye + " P0 flask"));
    }
    return donor + eye + " " + (p === 0 ? "P0" : "P" + (p == null ? "?" : p)) +
      " flask; keep the tissue source as a separate raw-source record";
  }

  // Needs-attention warnings for a record, given its peer records (the other
  // vessels in the project). Each warning is { fields, message } — `fields` tags
  // the editable field(s) it concerns so the UI can highlight the exact cell(s).
  // Ported from the original recorder's buildDraftWarnings (the lineage + passage
  // /date consistency rules that the current field set supports; the provenance
  // /ground-truth rules will be added when that schema lands).
  function cultureWarnings(record, peers) {
    record = record || {};
    var W = [];
    function add(fields, message) { W.push({ fields: fields, message: message }); }

    var donor = str(record.donor).trim().toLowerCase();
    var label = str(record.label).trim().toLowerCase();
    var eye = str(record.eye).trim() || "unknown";
    var passage = num(record.passage);
    var seedMs = dateMs(record.seedDate);
    var others = (peers || []).filter(function (p) { return str(p.nodeId) !== str(record.nodeId); });

    // Required fields
    if (!str(record.donor).trim()) add(["donor"], "No donor ID — vessel will be grouped under unknown donor.");
    if (!str(record.seedDate).trim()) add(["seedDate"], "No seed date entered.");

    // Duplicate label
    if (label) {
      var dups = others.filter(function (p) { return str(p.label).trim().toLowerCase() === label; });
      if (dups.length) {
        add(["label"], "Duplicate vessel label (" + dups.map(recLabel).join(", ") + "). Verify this is a distinct flask.");
      }
    }

    // Parent (lineage) consistency
    var parent = null;
    if (record.parentNodeId) {
      parent = others.filter(function (p) { return str(p.nodeId) === str(record.parentNodeId); })[0] || null;
    }
    if (parent) {
      var pPass = num(parent.passage);
      if (passage !== null && pPass !== null && passage <= pPass) {
        add(["parentNodeId", "passage"], "Parent is P" + pPass + "; child passage should usually be higher.");
      }
      var pSeed = dateMs(parent.seedDate);
      if (!isNaN(seedMs) && !isNaN(pSeed) && seedMs < pSeed) {
        add(["parentNodeId", "seedDate"], "Seed date is before the parent vessel's seed date.");
      }
      var pDonor = str(parent.donor).trim().toLowerCase();
      if (donor && pDonor && donor !== pDonor) {
        add(["parentNodeId", "donor"], "Parent donor (" + str(parent.donor) + ") does not match this donor.");
      }
      var pEye = str(parent.eye).trim() || "unknown";
      if (eye !== "unknown" && pEye !== "unknown" && eye !== pEye) {
        add(["parentNodeId", "eye"], "Parent eye (" + pEye + ") does not match this eye.");
      }
    }

    // Passage/date monotonicity among same donor + eye peers
    if (donor && passage !== null && !isNaN(seedMs)) {
      others.forEach(function (p) {
        if (str(p.donor).trim().toLowerCase() !== donor) return;
        if ((str(p.eye).trim() || "unknown") !== eye) return;
        var oPass = num(p.passage);
        var oSeed = dateMs(p.seedDate);
        if (oPass === null || isNaN(oSeed)) return;
        if (oPass < passage && oSeed > seedMs) {
          add(["seedDate", "passage"], "P" + passage + " date is before existing P" + oPass + ' vessel "' + recLabel(p) + '".');
        }
        if (oPass > passage && oSeed < seedMs) {
          add(["seedDate", "passage"], "Existing P" + oPass + ' vessel "' + recLabel(p) + '" is dated before this lower passage.');
        }
      });
    }

    // ─── Provenance / source-tracking rules ──────────────────────────────────
    // These only fire once the relevant provenance fields are filled in, so a
    // plain vessel (no provenance) raises none of them.
    var sourceType = str(record.sourceRecordType) || "culture_vessel";
    var gtField = str(record.groundTruthDateField) || "seed_date";

    // Split date should not precede the seed date.
    if (str(record.splitDate).trim() && !isNaN(seedMs) && dateMs(record.splitDate) < seedMs) {
      add(["splitDate", "seedDate"], "Split date is before the seed date.");
    }

    // Media-change / feed events should not predate the seed date.
    if (!isNaN(seedMs) && Array.isArray(record.events)) {
      var early = record.events.filter(function (ev) {
        var t = ev && ev.type;
        return (t === "media_change" || t === "feed") && ev.at && dateMs(ev.at) < seedMs;
      });
      if (early.length) {
        add(["seedDate"], "A media-change/feed event (" + displayDate(early[0].at) + ") is dated before the seed date.");
      }
    }

    // A Donor Tissue record sitting on a flask/dish vessel.
    if (sourceType === "primary_tissue_dissociation" && isFlaskOrDishIcon(record.iconId)) {
      add(["sourceRecordType"], "Marked as Donor Tissue but placed on a flask/dish vessel. Consider recording the donor tissue and the P0 flask as separate vessels if their dates differ.");
    }

    // P0 with both a seed date and a differing dissociation date → choose ground truth.
    if (passage === 0 && str(record.seedDate).trim() && str(record.dissociationDate).trim() &&
        !sameDate(record.seedDate, record.dissociationDate)) {
      add(["seedDate", "dissociationDate"],
        "P0 seed date (" + displayDate(record.seedDate) + ") differs from the dissociation date (" +
        displayDate(record.dissociationDate) + "). Choose a ground-truth date and keep the other as raw provenance.");
    }

    // Ground-truth date field must point at a non-null date (or carry a resolution note).
    if (gtField === "dissociation_date" && !str(record.dissociationDate).trim()) {
      add(["groundTruthDateField", "dissociationDate"], "Dissociation date is selected as ground truth, but no dissociation date is entered.");
    }
    if (gtField === "pretreatment_date" && !str(record.pretreatmentDate).trim()) {
      add(["groundTruthDateField", "pretreatmentDate"], "Pretreatment date is selected as ground truth, but no pretreatment date is entered.");
    }
    if (gtField === "unresolved" && !str(record.conflictResolution).trim()) {
      add(["groundTruthDateField", "conflictResolution"], "Ground truth is unresolved. Add a resolution note so the ambiguity is traceable.");
    }

    // Source conflict — only when an EXPLICIT raw source identifier is recorded.
    // (The donor ID is not a raw source; falling back to it flagged every normal
    // donor-tissue → flask lineage as a conflict.) Compared among same-eye peers.
    var sourceId = normalizeSourceId(str(record.rawSourceIdentifier).trim());
    if (sourceId) {
      var suggested = suggestSourceConflictRename(record);
      others.forEach(function (p) {
        if (normalizeSourceId(str(p.rawSourceIdentifier).trim()) !== sourceId) return;
        if ((str(p.eye).trim() || "unknown") !== eye) return;
        var pType = str(p.sourceRecordType) || "culture_vessel";
        if (pType !== sourceType) {
          add(["rawSourceIdentifier", "sourceRecordType"],
            "Raw source ID already appears as " + sourceRecordLabel(pType) + ' on "' + recLabel(p) +
            '". Suggested rename: ' + suggested + ".");
        }
        if (str(record.dissociationDate).trim() && str(p.dissociationDate).trim() &&
            !sameDate(record.dissociationDate, p.dissociationDate)) {
          add(["dissociationDate"], 'Dissociation date differs from raw-source match "' + recLabel(p) +
            '" (' + displayDate(p.dissociationDate) + ").");
        }
        var pPass = num(p.passage);
        if (passage !== null && pPass === passage && str(record.seedDate).trim() && str(p.seedDate).trim() &&
            !sameDate(record.seedDate, p.seedDate)) {
          add(["seedDate", "rawSourceIdentifier", "passage"],
            'Same raw source and passage as "' + recLabel(p) + '", but seed dates differ (' +
            displayDate(p.seedDate) + " vs " + displayDate(record.seedDate) + ").");
        }
        if (passage === 0 && str(record.dissociationDate).trim() && pPass === 0 && str(p.seedDate).trim() &&
            !sameDate(record.dissociationDate, p.seedDate)) {
          add(["dissociationDate", "passage"],
            'Dissociation date does not match the existing P0 seed date for "' + recLabel(p) +
            '". Suggested rename: ' + suggested + ".");
        }
      });
    }

    // Dedup by message
    var seen = {};
    return W.filter(function (w) {
      if (seen[w.message]) return false;
      seen[w.message] = true;
      return true;
    });
  }

  // Free-text match across a record's searchable fields (donor, label, eye,
  // passage, medium, status, seed date, vessel type).
  function recordMatchesQuery(record, query) {
    var q = str(query).trim().toLowerCase();
    if (!q) return true;
    record = record || {};
    var hay = [
      record.donor, record.label, record.eye,
      record.passage !== "" && record.passage != null ? "p" + record.passage : "",
      record.medium, record.status, record.seedDate,
      vesselTypeFromIcon(record.iconId),
    ].join(" ").toLowerCase();
    return hay.indexOf(q) >= 0;
  }

  // Grid sort: donor, then eye, then passage (numeric), then seed date.
  function compareCultureRecords(a, b) {
    a = a || {}; b = b || {};
    return (
      str(a.donor).localeCompare(str(b.donor)) ||
      str(a.eye).localeCompare(str(b.eye)) ||
      ((Number(a.passage) || 0) - (Number(b.passage) || 0)) ||
      str(a.seedDate).localeCompare(str(b.seedDate))
    );
  }

  // The largest N across node ids of the form "n-<N>".
  function maxNodeIdNumber(nodeIds) {
    var max = 0;
    (nodeIds || []).forEach(function (id) {
      var m = /^n-(\d+)$/.exec(str(id));
      if (m) max = Math.max(max, Number(m[1]));
    });
    return max;
  }

  // The next safe nodeIdCounter: always ahead of both the saved counter and
  // every existing id, so a freshly placed vessel can't reuse an id that a
  // lineage pointer still references.
  function nextNodeIdCounter(nodeIds, current) {
    return Math.max(Number(current) || 0, maxNodeIdNumber(nodeIds) + 1);
  }

  // nodeIds of records whose parentNodeId points at a vessel that no longer
  // exists (dangling lineage) — these should have their parent cleared.
  function danglingChildIds(records) {
    var ids = {};
    (records || []).forEach(function (r) { ids[str(r.nodeId)] = true; });
    return (records || [])
      .filter(function (r) { return str(r.parentNodeId) && !ids[str(r.parentNodeId)]; })
      .map(function (r) { return str(r.nodeId); });
  }

  // A lineage parent/child must be the SAME donor + eye — a passage is always
  // within one tissue. Case-insensitive; a blank donor or blank/"unknown" eye on
  // either side is a wildcard (so partially-filled records still link rather than
  // being wrongly rejected). Used by CSV import, the editor dropdown, the canvas
  // connection coupling, and the load-time migration below.
  // Canonicalize a donor id so common data-entry variants of the SAME donor
  // reconcile instead of fragmenting the lineage: collapse/trim whitespace, strip
  // a leading descriptor prefix (Donor/Patient/Subject/Sample/Case) when a numeric
  // id follows, and strip an Excel ".0" float artifact on a numeric id. Case is
  // preserved for display; callers lower-case for comparison. Conservative on
  // purpose — e.g. "Donor 6769", "6769 " and "6769.0" all → "6769", but "Donor
  // Smith" is left untouched (no digit follows the prefix).
  function normalizeDonor(raw) {
    var s = str(raw).replace(/\s+/g, " ").trim();
    s = s.replace(/^[?~*]+\s*(?=[\w])/, "");                                    // stray "not sure" markers: "?2025-4392" -> "2025-4392"
    s = s.replace(/^(donor|patient|subject|sample|case)\b[\s:#.\-]*(?=\d)/i, ""); // descriptor prefix
    s = s.replace(/^(\d+)\.0+$/, "$1");                                          // excel ".0" float
    return s.trim();
  }

  function sameDonorEye(a, b) {
    a = a || {}; b = b || {};
    var da = normalizeDonor(a.donor).toLowerCase(), db = normalizeDonor(b.donor).toLowerCase();
    if (da && db && da !== db) return false;
    var ea = str(a.eye).trim().toLowerCase(), eb = str(b.eye).trim().toLowerCase();
    function blankEye(e) { return e === "" || e === "unknown"; }
    if (!blankEye(ea) && !blankEye(eb) && ea !== eb) return false;
    return true;
  }

  // nodeIds whose parent points at a vessel of a DIFFERENT donor+eye (an
  // impossible passage — e.g. an older CSV import that resolved a parent label
  // across donors). Cleared on load so existing projects self-heal.
  function crossDonorChildIds(records) {
    var byId = {};
    (records || []).forEach(function (r) { byId[str(r.nodeId)] = r; });
    return (records || [])
      .filter(function (r) {
        var p = str(r.parentNodeId) ? byId[str(r.parentNodeId)] : null;
        return p && !sameDonorEye(r, p);
      })
      .map(function (r) { return str(r.nodeId); });
  }

  // nodeIds of the direct children of a vessel.
  function childrenOf(records, parentNodeId) {
    var pid = str(parentNodeId);
    return (records || [])
      .filter(function (r) { return str(r.parentNodeId) === pid; })
      .map(function (r) { return str(r.nodeId); });
  }

  // Would setting child's parent to proposedParentId create a lineage cycle?
  function wouldCreateCycle(records, childId, proposedParentId) {
    var byId = {};
    (records || []).forEach(function (r) { byId[str(r.nodeId)] = r; });
    var cur = str(proposedParentId);
    var seen = {};
    while (cur) {
      if (cur === str(childId)) return true;
      if (seen[cur]) break;
      seen[cur] = true;
      var r = byId[cur];
      cur = r && r.parentNodeId ? str(r.parentNodeId) : "";
    }
    return false;
  }

  // ─── CSV import ───────────────────────────────────────────────────────────
  // RFC-4180 CSV parser (handles quotes, escaped quotes, CRLF, BOM). Ported from
  // the original recorder's parseCsv.
  function parseCsv(input) {
    var text = str(input);
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    var rows = [], row = [], field = "", inQuotes = false, i = 0, n = text.length;
    function endField() { row.push(field); field = ""; }
    function endRow() { endField(); rows.push(row); row = []; }
    while (i < n) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
          inQuotes = false; i += 1; continue;
        }
        field += c; i += 1; continue;
      }
      if (c === '"') { inQuotes = true; i += 1; }
      else if (c === ",") { endField(); i += 1; }
      else if (c === "\n") { endRow(); i += 1; }
      else if (c === "\r") { if (text[i + 1] === "\n") i += 1; else { endRow(); i += 1; } }
      else { field += c; i += 1; }
    }
    if (field.length > 0 || row.length > 0) endRow();
    return rows.filter(function (r) { return r.some(function (cell) { return str(cell).trim() !== ""; }); });
  }

  function normalizeHeader(h) {
    return str(h).trim().toLowerCase().replace(/[_\-/.]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function coerceEye(raw) {
    var v = str(raw).trim().toLowerCase();
    if (v === "" || v === "?" || v === "-") return "unknown";
    if (["od", "r", "right", "right eye", "oculus dexter", "dexter", "odod"].indexOf(v) >= 0) return "OD";
    if (["os", "l", "left", "left eye", "oculus sinister", "sinister", "osos"].indexOf(v) >= 0) return "OS";
    // Both eyes / pooled — including the "ODOS" form these logs use most often.
    if (["ou", "both", "both eyes", "bilateral", "pooled", "odos", "osod", "od os", "os od"].indexOf(v) >= 0) return "OU";
    return "unknown";
  }

  // Some logs concatenate the eye onto the donor id ("045986OD", "2025-4392ODOS",
  // "2025-5923 OD"). Split so the donor id is clean and the eye is recovered.
  // Returns { donor, eye } — eye is "" when nothing eye-like was embedded.
  function splitDonorEye(raw) {
    var s = str(raw).trim();
    var m = s.match(/^(.*\d)\s*((?:od|os)+)$/i);
    if (m) {
      var eye = coerceEye(m[2]);
      return { donor: m[1].trim(), eye: eye === "unknown" ? "" : eye };
    }
    return { donor: s, eye: "" };
  }

  // Missing-value tokens used throughout the logs ("?", "-", "n/a", "none").
  function notMissing(v) {
    var s = str(v).trim(), lo = s.toLowerCase();
    return (s === "?" || s === "-" || lo === "n/a" || lo === "na" || lo === "none") ? "" : s;
  }
  function coerceStatus(raw) {
    var v = str(raw).trim().toLowerCase();
    if (["frozen", "freeze", "cryo", "banked", "cryopreserved"].indexOf(v) >= 0) return "frozen";
    if (["contaminated", "contamination", "contam", "infected"].indexOf(v) >= 0) return "contaminated";
    if (["discarded", "discard", "disposed", "dead", "trashed", "binned"].indexOf(v) >= 0) return "discarded";
    return "active";
  }
  var MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
    january: 1, february: 2, march: 3, april: 4, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
  function validYmd(y, m, d) {
    if (m < 1 || m > 12 || d < 1 || d > 31) return false;
    var dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
  }
  function fmtYmd(y, m, d) {
    function pad(x) { return (x < 10 ? "0" : "") + x; }
    return validYmd(y, m, d) ? y + "-" + pad(m) + "-" + pad(d) : null;
  }
  // ISO YYYY-MM-DD or null when empty/ambiguous (a bare "5/4/2026" is NOT guessed).
  function coerceDate(raw) {
    var v = str(raw).trim();
    if (!v || v === "-" || v === "?") return null;
    var iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (iso) return fmtYmd(Number(iso[1]), Number(iso[2]), Number(iso[3]));
    var ymd = v.match(/^(\d{4})[/.](\d{1,2})[/.](\d{1,2})$/);
    if (ymd) return fmtYmd(Number(ymd[1]), Number(ymd[2]), Number(ymd[3]));
    // Compact YYYYMMDD, optionally trailed by an HHMM time (a common raw entry,
    // e.g. "20240828" or "20250813 0154").
    var compact = v.match(/^(20\d{2})(\d{2})(\d{2})(?:[ T]?\d{3,4})?$/);
    if (compact) {
      var cy = Number(compact[1]), cm = Number(compact[2]), cd = Number(compact[3]);
      if (validYmd(cy, cm, cd)) return fmtYmd(cy, cm, cd);
    }
    var cleaned = v.replace(/,/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
    cleaned = cleaned.replace(/(\d)(st|nd|rd|th)\b/g, "$1"); // "20th aug 2025" -> "20 aug 2025"
    var m = cleaned.match(/^(\d{1,2})[ -]([a-z]+)[ -](\d{4})$/);
    if (m && MONTHS[m[2]]) return fmtYmd(Number(m[3]), MONTHS[m[2]], Number(m[1]));
    m = cleaned.match(/^([a-z]+)[ -](\d{1,2})[ -](\d{4})$/);
    if (m && MONTHS[m[1]]) return fmtYmd(Number(m[3]), MONTHS[m[1]], Number(m[2]));
    return null;
  }

  // Free text -> a known source_record_type ("" when absent/unrecognised, so the
  // record keeps its default rather than writing an explicit one).
  function coerceSourceRecordType(raw) {
    var v = str(raw).trim().toLowerCase();
    if (!v) return "";
    if (v.indexOf("tissue") >= 0 || v.indexOf("dissoc") >= 0 || v.indexOf("primary") >= 0) return "primary_tissue_dissociation";
    if (v.indexOf("mixed") >= 0 || v.indexOf("ambig") >= 0 || v.indexOf("note") >= 0) return "mixed_source_note";
    if (v.indexOf("vessel") >= 0 || v.indexOf("flask") >= 0 || v.indexOf("culture") >= 0 || v.indexOf("dish") >= 0) return "culture_vessel";
    return "";
  }
  // Free text -> a known ground_truth_date_field ("" when absent/unrecognised).
  function coerceGroundTruthField(raw) {
    var v = str(raw).trim().toLowerCase();
    if (!v) return "";
    if (v.indexOf("dissoc") >= 0) return "dissociation_date";
    if (v.indexOf("pretreat") >= 0 || v.indexOf("pre treat") >= 0 || v.indexOf("pre-treat") >= 0) return "pretreatment_date";
    if (v.indexOf("unresolved") >= 0 || v.indexOf("conflict") >= 0) return "unresolved";
    if (v.indexOf("seed") >= 0 || v.indexOf("start") >= 0) return "seed_date";
    return "";
  }

  // Snap a well count to the nearest plate size the app actually has an icon for.
  function snapPlateSize(n) {
    var sizes = [6, 12, 24, 48, 96, 384, 1536], v = Number(n);
    if (sizes.indexOf(v) >= 0) return String(v);
    var best = sizes[0], i;
    for (i = 1; i < sizes.length; i++) { if (Math.abs(sizes[i] - v) < Math.abs(best - v)) best = sizes[i]; }
    return String(best);
  }
  // Free vessel text -> a known iconId (default t75_flask).
  function vesselIconFromText(text) {
    var t = str(text).toLowerCase().replace(/[^a-z0-9]/g, "");
    var m = t.match(/t(25|75|150|175|225|300)/);
    if (m) return "t" + m[1] + "_flask";
    // Multiwell plates: "24 well plate", "6-well", "plate 96" -> plate_24 etc.
    m = t.match(/(\d+)well/) || t.match(/plate(\d+)/);
    if (m) return "plate_" + snapPlateSize(m[1]);
    if (t.indexOf("well") >= 0 || t.indexOf("plate") >= 0) return "plate_24";
    m = t.match(/(\d+)mm/);
    if (m && ["35", "60", "100", "150"].indexOf(m[1]) >= 0) return "dish_" + m[1] + "mm";
    if (t.indexOf("dish") >= 0) return "dish_60mm";
    if (t.indexOf("tissue") >= 0 || t.indexOf("primary") >= 0) return "primary_tissue";
    if (t.indexOf("line") >= 0) return "cell_line";
    return "t75_flask";
  }

  var IMPORT_FIELDS = [
    { key: "donor", aliases: ["donor", "donor id", "donor identifier", "patient", "subject", "donornumber", "cell id", "cellid"] },
    { key: "eye", aliases: ["eye", "laterality", "side", "od os"] },
    { key: "passage", aliases: ["passage", "passage number", "passage no", "pn"] },
    // vessel BEFORE label so a "flask"/"vessel" column claims the type, not the
    // free-text label (whose "flask label" alias would otherwise fuzzy-grab it).
    { key: "vessel", aliases: ["vessel", "flask", "flask type", "container", "format", "vessel type"] },
    { key: "label", aliases: ["label", "vessel label", "flask label", "sample", "sample id", "name"] },
    { key: "seedDate", aliases: ["seed date", "seed", "seeded", "date seeded", "seeding date", "start date", "started", "p0 date"] },
    { key: "medium", aliases: ["medium", "media"] },
    { key: "status", aliases: ["status", "state"] },
    { key: "parentLabel", aliases: ["parent", "parent label", "parent vessel", "mother", "from", "parent flask"] },
    { key: "notes", aliases: ["notes", "comment", "comments", "growth notes", "note"] },
    // Provenance / source-tracking columns (all optional).
    { key: "rawSourceIdentifier", aliases: ["raw source", "raw source id", "raw source identifier", "source id", "source identifier", "tissue id", "tissue sample id", "specimen id", "notebook ref"] },
    { key: "sourceRecordType", aliases: ["source type", "source record type", "record type"] },
    { key: "dissociationDate", aliases: ["dissociation date", "dissociation", "dissociated", "date dissociated"] },
    { key: "pretreatmentDate", aliases: ["pretreatment date", "pretreatment", "pre treatment date", "prep date"] },
    { key: "splitDate", aliases: ["split date", "split", "subculture date", "split on"] },
    { key: "groundTruthDateField", aliases: ["ground truth", "ground truth date field", "ground truth field"] },
    { key: "conflictResolution", aliases: ["conflict resolution", "resolution note", "resolution"] },
  ];
  function autoMapImport(headers) {
    var normalized = (headers || []).map(normalizeHeader);
    var used = {}, mapping = {};
    IMPORT_FIELDS.forEach(function (field) {
      var candidates = [normalizeHeader(field.key)].concat(field.aliases);
      var found = null, i;
      for (i = 0; i < normalized.length; i++) {
        if (used[i]) continue;
        if (candidates.indexOf(normalized[i]) >= 0) { found = i; break; }
      }
      if (found === null) {
        for (i = 0; i < normalized.length; i++) {
          if (used[i]) continue;
          var h = normalized[i];
          if (field.aliases.some(function (a) { return h.indexOf(a) >= 0 || (h.length >= 3 && a.indexOf(h) >= 0); })) { found = i; break; }
        }
      }
      if (found !== null) used[found] = true;
      mapping[field.key] = found;
    });
    return mapping;
  }

  // Parse CSV text into vessel drafts ({donor,eye,passage,label,iconId,seedDate,
  // medium,status,parentLabel,notes}) plus the header mapping (for a preview).
  function importCsvToDrafts(text) {
    var rows = parseCsv(text);
    if (rows.length < 2) return { drafts: [], headers: rows[0] || [], mapping: {}, rowCount: 0 };
    var headers = rows[0];
    var mapping = autoMapImport(headers);
    function cell(row, key) { var i = mapping[key]; return i == null ? "" : str(row[i]).trim(); }
    var drafts = rows.slice(1).map(function (row) {
      var passageRaw = cell(row, "passage").replace(/^p\.?\s*/i, "");
      var passageDigits = (passageRaw.match(/-?\d+/) || [""])[0];
      // Donor id may carry the eye ("045986OD") — split it, and fall back to the
      // embedded eye when there's no separate (usable) eye column.
      var split = splitDonorEye(notMissing(cell(row, "donor")));
      var eyeVal = coerceEye(cell(row, "eye"));
      if (eyeVal === "unknown" && split.eye) eyeVal = split.eye;
      return {
        donor: split.donor,
        eye: eyeVal,
        passage: passageDigits,
        label: cell(row, "label"),
        iconId: vesselIconFromText(cell(row, "vessel")),
        seedDate: coerceDate(cell(row, "seedDate")) || "",
        medium: cell(row, "medium"),
        status: coerceStatus(cell(row, "status")),
        parentLabel: cell(row, "parentLabel"),
        notes: cell(row, "notes"),
        // Provenance / source-tracking ("" when the column is absent, so the
        // record keeps its defaults rather than carrying explicit ones).
        rawSourceIdentifier: cell(row, "rawSourceIdentifier"),
        sourceRecordType: coerceSourceRecordType(cell(row, "sourceRecordType")),
        dissociationDate: coerceDate(cell(row, "dissociationDate")) || "",
        pretreatmentDate: coerceDate(cell(row, "pretreatmentDate")) || "",
        splitDate: coerceDate(cell(row, "splitDate")) || "",
        groundTruthDateField: coerceGroundTruthField(cell(row, "groundTruthDateField")),
        conflictResolution: cell(row, "conflictResolution"),
      };
    });
    return { drafts: drafts, headers: headers, mapping: mapping, rowCount: drafts.length };
  }

  // ─── Lineage tree ─────────────────────────────────────────────────────────
  // Build a forest of parent→child trees from the records. Roots are vessels
  // with no parent (or a dangling parent). Children are sorted by passage then
  // seed date; roots by donor/eye/passage/seed. A shared visited set makes it
  // cycle-safe. Each tree node is { record, depth, children }.
  function buildLineageForest(records) {
    records = records || [];
    var byId = {};
    records.forEach(function (r) { byId[str(r.nodeId)] = r; });
    var childrenMap = {};
    records.forEach(function (r) {
      var pid = str(r.parentNodeId);
      if (pid && byId[pid]) (childrenMap[pid] = childrenMap[pid] || []).push(r);
    });
    var seen = {};
    function build(rec, depth) {
      var idk = str(rec.nodeId);
      if (seen[idk]) return { record: rec, depth: depth, children: [] };
      seen[idk] = true;
      var kids = (childrenMap[idk] || []).slice().sort(function (a, b) {
        return ((Number(a.passage) || 0) - (Number(b.passage) || 0)) || str(a.seedDate).localeCompare(str(b.seedDate));
      });
      return {
        record: rec,
        depth: depth,
        children: kids.map(function (k) { return build(k, depth + 1); }),
      };
    }
    var roots = records.filter(function (r) {
      var pid = str(r.parentNodeId);
      return !pid || !byId[pid];
    });
    var forest = roots.sort(compareCultureRecords).map(function (r) { return build(r, 0); });
    // Any record not reached from a root (e.g. trapped in a cycle) becomes its
    // own root, so nothing is silently hidden from the tree.
    records
      .filter(function (r) { return !seen[str(r.nodeId)]; })
      .sort(compareCultureRecords)
      .forEach(function (r) { forest.push(build(r, 0)); });
    return forest;
  }

  // Depth-first flattening of the forest into [{ record, depth }] (the render order).
  function flattenForest(forest) {
    var out = [];
    function walk(node) {
      out.push({ record: node.record, depth: node.depth });
      (node.children || []).forEach(walk);
    }
    (forest || []).forEach(walk);
    return out;
  }

  // Per-record lineage anomaly flags for the family-tree view — the signals that
  // matter when reconciling messy bookkeeping:
  //   orphan      : a parent was intended (a raw parentLabel, or a parentNodeId
  //                 pointing at a now-missing vessel) but nothing is linked.
  //   crossDonor  : the linked parent is a DIFFERENT donor/eye (impossible passage).
  //   passageBack : child passage number <= parent's (passages should increase).
  // (No "duplicate" flag: same-passage siblings are normal here — splits and
  // replicates routinely produce several vessels at one passage — so flagging
  // them would just cry wolf. cultureWarnings covers the real per-record gaps.)
  // Returns a map of nodeId -> flags object.
  function lineageFlags(records) {
    records = records || [];
    var byId = {};
    records.forEach(function (r) { byId[str(r.nodeId)] = r; });
    var out = {};
    records.forEach(function (r) {
      var id = str(r.nodeId);
      var f = (out[id] = { orphan: false, orphanLabel: "", crossDonor: false, passageBack: false });
      var pid = str(r.parentNodeId);
      var parent = pid && byId[pid] ? byId[pid] : null;
      if (parent) {
        if (!sameDonorEye(r, parent)) f.crossDonor = true;
        var cp = num(r.passage), pp = num(parent.passage);
        if (cp != null && pp != null && !isNaN(cp) && !isNaN(pp) && cp <= pp) f.passageBack = true;
      } else if (str(r.parentLabel).trim() || pid) {
        // A parent was intended (a raw label, or a dangling id) but isn't linked.
        f.orphan = true;
        f.orphanLabel = str(r.parentLabel).trim();
      }
    });
    return out;
  }

  // ─── Events / passaging ───────────────────────────────────────────────────
  // An event is { type, at (YYYY-MM-DD), confluence, viability, splitRatio,
  // medium, operator, notes, seq }. Stored as a JSON array on
  // node.dataset.cultureEvents. Ported from the original recorder's event model.
  var EVENT_TYPES = ["passage", "feed", "media_change", "observation", "freeze", "thaw", "contamination", "discard"];

  function parseEvents(json) {
    try {
      var a = JSON.parse(str(json) || "[]");
      return Array.isArray(a) ? a : [];
    } catch (e) {
      return [];
    }
  }

  // The vessel status an event implies, or null for no change.
  function statusFromEvent(ev) {
    ev = ev || {};
    if (ev.nextStatus) return ev.nextStatus;
    if (ev.type === "freeze") return "frozen";
    if (ev.type === "contamination") return "contaminated";
    if (ev.type === "discard") return "discarded";
    if (ev.type === "thaw") return "active";
    return null;
  }

  // Newest first (by date, then insertion seq).
  function sortEvents(events) {
    return (events || []).slice().sort(function (a, b) {
      return str(b.at).localeCompare(str(a.at)) || ((Number(b.seq) || 0) - (Number(a.seq) || 0));
    });
  }

  // A short human summary of an event for the timeline.
  function summarizeEvent(ev) {
    ev = ev || {};
    var bits = [];
    if (ev.confluence !== "" && ev.confluence != null) bits.push(str(ev.confluence) + "% conf");
    if (ev.viability !== "" && ev.viability != null) bits.push(str(ev.viability) + "% via");
    if (ev.splitRatio) bits.push("split " + str(ev.splitRatio));
    if (ev.medium) bits.push(str(ev.medium));
    if (ev.operator) bits.push(str(ev.operator));
    return bits.join(" · ");
  }

  return {
    EVENT_TYPES: EVENT_TYPES,
    parseEvents: parseEvents,
    statusFromEvent: statusFromEvent,
    sortEvents: sortEvents,
    summarizeEvent: summarizeEvent,
    buildLineageForest: buildLineageForest,
    flattenForest: flattenForest,
    lineageFlags: lineageFlags,
    parseCsv: parseCsv,
    coerceEye: coerceEye,
    splitDonorEye: splitDonorEye,
    coerceStatus: coerceStatus,
    coerceDate: coerceDate,
    coerceSourceRecordType: coerceSourceRecordType,
    coerceGroundTruthField: coerceGroundTruthField,
    vesselIconFromText: vesselIconFromText,
    autoMapImport: autoMapImport,
    importCsvToDrafts: importCsvToDrafts,
    VESSEL_TYPES: VESSEL_TYPES,
    vesselTypeFromIcon: vesselTypeFromIcon,
    isCultureVesselIcon: isCultureVesselIcon,
    cultureLabelSummary: cultureLabelSummary,
    shouldOverwriteLabel: shouldOverwriteLabel,
    recordMatchesQuery: recordMatchesQuery,
    cultureWarnings: cultureWarnings,
    SOURCE_RECORD_TYPES: SOURCE_RECORD_TYPES,
    GROUND_TRUTH_DATE_FIELDS: GROUND_TRUTH_DATE_FIELDS,
    isFlaskOrDishIcon: isFlaskOrDishIcon,
    normalizeSourceId: normalizeSourceId,
    sameDate: sameDate,
    displayDate: displayDate,
    sourceRecordLabel: sourceRecordLabel,
    groundTruthLabel: groundTruthLabel,
    groundTruthDate: groundTruthDate,
    suggestSourceConflictRename: suggestSourceConflictRename,
    compareCultureRecords: compareCultureRecords,
    maxNodeIdNumber: maxNodeIdNumber,
    nextNodeIdCounter: nextNodeIdCounter,
    danglingChildIds: danglingChildIds,
    normalizeDonor: normalizeDonor,
    sameDonorEye: sameDonorEye,
    crossDonorChildIds: crossDonorChildIds,
    childrenOf: childrenOf,
    wouldCreateCycle: wouldCreateCycle,
  };
});
