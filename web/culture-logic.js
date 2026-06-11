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
    dish_35mm: "35mm dish", dish_60mm: "60mm dish", dish_100mm: "100mm dish", dish_150mm: "150mm dish",
    cell_line: "Cell line", primary_tissue: "Primary tissue"
  };

  function str(v) { return v == null ? "" : String(v); }

  function vesselTypeFromIcon(iconId) {
    var id = str(iconId);
    return VESSEL_TYPES[id] || id || "Vessel";
  }

  function isCultureVesselIcon(iconId) {
    var id = str(iconId);
    return id.indexOf("_flask") >= 0 || id.indexOf("dish_") === 0 || id === "cell_line" || id === "primary_tissue";
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

    // Dedup by message
    var seen = {};
    return W.filter(function (w) {
      if (seen[w.message]) return false;
      seen[w.message] = true;
      return true;
    });
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

  return {
    VESSEL_TYPES: VESSEL_TYPES,
    vesselTypeFromIcon: vesselTypeFromIcon,
    isCultureVesselIcon: isCultureVesselIcon,
    cultureLabelSummary: cultureLabelSummary,
    shouldOverwriteLabel: shouldOverwriteLabel,
    cultureWarnings: cultureWarnings,
    compareCultureRecords: compareCultureRecords,
    maxNodeIdNumber: maxNodeIdNumber,
    nextNodeIdCounter: nextNodeIdCounter,
    danglingChildIds: danglingChildIds,
    childrenOf: childrenOf,
    wouldCreateCycle: wouldCreateCycle,
  };
});
