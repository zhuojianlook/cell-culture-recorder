"use strict";
// Unit tests for the pure Cell Culture logic (web/culture-logic.js).
// Run with: npm test   (node --test, built-in runner, no dependencies).
//
// culture-logic.js ships as a browser UMD script and the repo is "type":
// "module", so we can't `require()`/`import` it directly. Instead we load the
// real source in a CommonJS sandbox via vm — same code the browser runs.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Load the real UMD source in THIS realm (so returned arrays/objects share
// prototypes with the test realm — vm's separate realm breaks deepStrictEqual).
function loadUMD(rel) {
  const src = fs.readFileSync(path.join(__dirname, rel), "utf8");
  const mod = { exports: {} };
  // eslint-disable-next-line no-new-func
  const run = new Function("module", "self", src + "\nreturn module.exports;");
  return run(mod, {});
}
const L = loadUMD("../web/culture-logic.js");

test("vesselTypeFromIcon maps known icons, falls back gracefully", () => {
  assert.equal(L.vesselTypeFromIcon("t75_flask"), "T75 flask");
  assert.equal(L.vesselTypeFromIcon("dish_60mm"), "60mm dish");
  assert.equal(L.vesselTypeFromIcon("cell_line"), "Cell line");
  assert.equal(L.vesselTypeFromIcon("totally_unknown"), "totally_unknown");
  assert.equal(L.vesselTypeFromIcon(""), "Vessel");
  assert.equal(L.vesselTypeFromIcon(null), "Vessel");
});

test("isCultureVesselIcon recognises culture vessels only", () => {
  ["t25_flask", "t300_flask", "dish_35mm", "dish_150mm", "cell_line", "primary_tissue"].forEach((id) =>
    assert.equal(L.isCultureVesselIcon(id), true, id)
  );
  ["task", "cage_5", "animal_mouse", "", null].forEach((id) =>
    assert.equal(L.isCultureVesselIcon(id), false, String(id))
  );
});

test("cultureLabelSummary builds the canvas identity", () => {
  assert.equal(L.cultureLabelSummary({ donor: "6769", eye: "OD", passage: "2" }), "6769 OD P2");
  assert.equal(L.cultureLabelSummary({ donor: "6769", eye: "unknown", passage: "0" }), "6769 P0");
  assert.equal(L.cultureLabelSummary({ donor: "6769", eye: "", passage: "" }), "6769");
  assert.equal(L.cultureLabelSummary({ donor: "", eye: "OD", passage: "2" }), "");
  assert.equal(L.cultureLabelSummary({}), "");
});

test("shouldOverwriteLabel protects user-typed labels", () => {
  // blank or matching the last auto summary -> overwritable
  assert.equal(L.shouldOverwriteLabel("", "6769 OD P2"), true);
  assert.equal(L.shouldOverwriteLabel("   ", "anything"), true);
  assert.equal(L.shouldOverwriteLabel("6769 OD P1", "6769 OD P1"), true);
  // a genuinely custom name is protected
  assert.equal(L.shouldOverwriteLabel("My favourite flask", "6769 OD P1"), false);
  assert.equal(L.shouldOverwriteLabel("My favourite flask", "6769 OD P1", "T75 flask"), false);
  // the default vessel-type placeholder (case-insensitive) is overwritable
  assert.equal(L.shouldOverwriteLabel("T75 Flask", "", "T75 flask"), true);
  assert.equal(L.shouldOverwriteLabel("60mm dish", "", "60mm dish"), true);
});

function msgs(record, peers) {
  return L.cultureWarnings(record, peers).map((w) => w.message);
}

test("cultureWarnings: required fields", () => {
  assert.deepEqual(msgs({ donor: "6769", seedDate: "2026-05-10" }, []), []);
  assert.equal(msgs({ donor: "", seedDate: "2026-05-10" }, [])[0], "No donor ID — vessel will be grouped under unknown donor.");
  assert.equal(msgs({ donor: "6769", seedDate: "" }, [])[0], "No seed date entered.");
  assert.equal(msgs({}, []).length, 2);
});

test("cultureWarnings: duplicate label", () => {
  const rec = { nodeId: "n-2", donor: "6769", seedDate: "2026-05-10", label: "6769 OD T75" };
  const peers = [rec, { nodeId: "n-1", donor: "6769", seedDate: "2026-05-01", label: "6769 OD T75" }];
  const m = msgs(rec, peers);
  assert.ok(m.some((x) => /Duplicate vessel label/.test(x)), m.join("|"));
});

test("cultureWarnings: parent lineage consistency", () => {
  const parent = { nodeId: "n-1", donor: "6769", eye: "OD", passage: "2", seedDate: "2026-05-10", label: "P2" };
  // child passage not higher than parent
  let child = { nodeId: "n-2", donor: "6769", eye: "OD", passage: "2", seedDate: "2026-05-12", parentNodeId: "n-1" };
  assert.ok(msgs(child, [parent, child]).some((x) => /child passage should usually be higher/.test(x)));
  // child seed before parent seed
  child = { nodeId: "n-2", donor: "6769", eye: "OD", passage: "3", seedDate: "2026-05-01", parentNodeId: "n-1" };
  assert.ok(msgs(child, [parent, child]).some((x) => /before the parent vessel's seed date/.test(x)));
  // donor mismatch
  child = { nodeId: "n-2", donor: "9999", eye: "OD", passage: "3", seedDate: "2026-05-20", parentNodeId: "n-1" };
  assert.ok(msgs(child, [parent, child]).some((x) => /Parent donor .* does not match/.test(x)));
  // eye mismatch
  child = { nodeId: "n-2", donor: "6769", eye: "OS", passage: "3", seedDate: "2026-05-20", parentNodeId: "n-1" };
  assert.ok(msgs(child, [parent, child]).some((x) => /Parent eye .* does not match/.test(x)));
  // a clean child raises no lineage warning
  child = { nodeId: "n-2", donor: "6769", eye: "OD", passage: "3", seedDate: "2026-05-20", parentNodeId: "n-1", label: "P3" };
  assert.deepEqual(msgs(child, [parent, child]), []);
});

test("cultureWarnings: passage/date monotonicity among donor+eye peers", () => {
  const p1 = { nodeId: "n-1", donor: "6769", eye: "OD", passage: "1", seedDate: "2026-05-20", label: "P1" };
  // a P2 vessel dated BEFORE the existing P1 is suspicious
  const p2 = { nodeId: "n-2", donor: "6769", eye: "OD", passage: "2", seedDate: "2026-05-10", label: "P2" };
  assert.ok(msgs(p2, [p1, p2]).some((x) => /date is before existing P1 vessel/.test(x)));
  // different eye -> no cross-warning
  const otherEye = { nodeId: "n-3", donor: "6769", eye: "OS", passage: "2", seedDate: "2026-05-10", label: "OS P2" };
  assert.deepEqual(msgs(otherEye, [p1, otherEye]), []);
});

test("cultureWarnings: field tagging + dedup", () => {
  const ws = L.cultureWarnings({ donor: "", seedDate: "" }, []);
  assert.deepEqual(ws[0].fields, ["donor"]);
  assert.deepEqual(ws[1].fields, ["seedDate"]);
});

test("recordMatchesQuery searches across fields", () => {
  const r = { donor: "6769", eye: "OD", passage: "2", medium: "F99", status: "frozen", iconId: "t75_flask", label: "6769 OD P2" };
  assert.equal(L.recordMatchesQuery(r, ""), true); // empty matches all
  assert.equal(L.recordMatchesQuery(r, "6769"), true);
  assert.equal(L.recordMatchesQuery(r, "f99"), true); // medium, case-insensitive
  assert.equal(L.recordMatchesQuery(r, "frozen"), true); // status
  assert.equal(L.recordMatchesQuery(r, "p2"), true); // passage token
  assert.equal(L.recordMatchesQuery(r, "T75 flask"), true); // vessel type
  assert.equal(L.recordMatchesQuery(r, "9999"), false);
});

test("compareCultureRecords sorts by donor, eye, passage, seed date", () => {
  const recs = [
    { donor: "6769", eye: "OS", passage: "1" },
    { donor: "6769", eye: "OD", passage: "2" },
    { donor: "6769", eye: "OD", passage: "1" },
    { donor: "1001", eye: "OD", passage: "5" },
  ];
  const sorted = recs.slice().sort(L.compareCultureRecords).map((r) => r.donor + r.eye + r.passage);
  assert.deepEqual(sorted, ["1001OD5", "6769OD1", "6769OD2", "6769OS1"]);
});

test("nextNodeIdCounter never reuses an existing id (M3)", () => {
  assert.equal(L.maxNodeIdNumber(["n-1", "n-7", "n-3"]), 7);
  assert.equal(L.maxNodeIdNumber([]), 0);
  assert.equal(L.nextNodeIdCounter(["n-1", "n-7", "n-3"], 2), 8);
  assert.equal(L.nextNodeIdCounter(["n-1", "n-2"], 50), 50);
  assert.equal(L.nextNodeIdCounter(["n-4", "weird", "task-9"], 0), 5);
});

test("danglingChildIds finds lineage pointers to deleted vessels (M2)", () => {
  const recs = [
    { nodeId: "n-1", parentNodeId: "" },
    { nodeId: "n-2", parentNodeId: "n-1" },
    { nodeId: "n-3", parentNodeId: "n-99" },
    { nodeId: "n-4", parentNodeId: "n-3" },
  ];
  assert.deepEqual(L.danglingChildIds(recs), ["n-3"]);
  assert.deepEqual(L.danglingChildIds([]), []);
});

test("childrenOf returns direct children", () => {
  const recs = [
    { nodeId: "n-1" },
    { nodeId: "n-2", parentNodeId: "n-1" },
    { nodeId: "n-3", parentNodeId: "n-1" },
    { nodeId: "n-4", parentNodeId: "n-2" },
  ];
  assert.deepEqual(L.childrenOf(recs, "n-1").sort(), ["n-2", "n-3"]);
  assert.deepEqual(L.childrenOf(recs, "n-2"), ["n-4"]);
  assert.deepEqual(L.childrenOf(recs, "n-4"), []);
});

test("parseCsv handles quotes, escaped quotes, CRLF, BOM", () => {
  const csv = '﻿a,b,c\r\n1,"two, 2","say ""hi"""\n3,,5\n';
  assert.deepEqual(L.parseCsv(csv), [
    ["a", "b", "c"],
    ["1", "two, 2", 'say "hi"'],
    ["3", "", "5"],
  ]);
  assert.deepEqual(L.parseCsv(""), []);
});

test("coerceEye / coerceStatus normalize free text", () => {
  assert.equal(L.coerceEye("Right"), "OD");
  assert.equal(L.coerceEye("os"), "OS");
  assert.equal(L.coerceEye("both"), "OU");
  assert.equal(L.coerceEye("whatever"), "unknown");
  assert.equal(L.coerceStatus("Cryo"), "frozen");
  assert.equal(L.coerceStatus("contam"), "contaminated");
  assert.equal(L.coerceStatus(""), "active");
});

test("coerceDate accepts ISO/named, refuses ambiguous", () => {
  assert.equal(L.coerceDate("2026-05-10"), "2026-05-10");
  assert.equal(L.coerceDate("2026/5/4"), "2026-05-04");
  assert.equal(L.coerceDate("10 May 2026"), "2026-05-10");
  assert.equal(L.coerceDate("May 10, 2026"), "2026-05-10");
  assert.equal(L.coerceDate("5/4/2026"), null); // ambiguous: not guessed
  assert.equal(L.coerceDate(""), null);
  assert.equal(L.coerceDate("2026-13-40"), null); // invalid
});

test("vesselIconFromText maps free text to icon ids", () => {
  assert.equal(L.vesselIconFromText("T75 flask"), "t75_flask");
  assert.equal(L.vesselIconFromText("t-150"), "t150_flask");
  assert.equal(L.vesselIconFromText("60mm dish"), "dish_60mm");
  assert.equal(L.vesselIconFromText("petri dish"), "dish_60mm");
  assert.equal(L.vesselIconFromText("primary tissue"), "primary_tissue");
  assert.equal(L.vesselIconFromText("cell line"), "cell_line");
  assert.equal(L.vesselIconFromText("???"), "t75_flask"); // default
});

test("autoMapImport maps headers (exact + fuzzy) without reuse", () => {
  const m = L.autoMapImport(["Donor ID", "Eye", "Passage No", "Flask Type", "Seed Date", "Parent Flask"]);
  assert.equal(m.donor, 0);
  assert.equal(m.eye, 1);
  assert.equal(m.passage, 2);
  assert.equal(m.vessel, 3);
  assert.equal(m.seedDate, 4);
  assert.equal(m.parentLabel, 5);
  assert.equal(m.medium, null); // absent
});

test("importCsvToDrafts produces normalized vessel drafts", () => {
  const csv = [
    "donor,eye,passage,flask,seed date,parent",
    "6769,Right,P0,T75,2026-05-01,",
    "6769,right,p1,t75,10 May 2026,6769 P0",
  ].join("\n");
  const out = L.importCsvToDrafts(csv);
  assert.equal(out.rowCount, 2);
  assert.deepEqual(out.drafts[0], {
    donor: "6769", eye: "OD", passage: "0", label: "", iconId: "t75_flask",
    seedDate: "2026-05-01", medium: "", status: "active", parentLabel: "", notes: "",
    // Provenance columns are absent in this CSV -> stable empty defaults.
    rawSourceIdentifier: "", sourceRecordType: "", dissociationDate: "",
    pretreatmentDate: "", splitDate: "", groundTruthDateField: "", conflictResolution: "",
  });
  assert.equal(out.drafts[1].passage, "1");
  assert.equal(out.drafts[1].seedDate, "2026-05-10");
  assert.equal(out.drafts[1].parentLabel, "6769 P0");
});

test("buildLineageForest builds parent->child trees", () => {
  const recs = [
    { nodeId: "n-1", donor: "6769", eye: "OD", passage: "0", seedDate: "2026-05-01", label: "P0" },
    { nodeId: "n-2", donor: "6769", eye: "OD", passage: "1", seedDate: "2026-05-10", parentNodeId: "n-1", label: "P1" },
    { nodeId: "n-3", donor: "6769", eye: "OD", passage: "2", seedDate: "2026-05-20", parentNodeId: "n-2", label: "P2" },
    { nodeId: "n-4", donor: "6769", eye: "OD", passage: "1", seedDate: "2026-05-12", parentNodeId: "n-1", label: "P1b" },
  ];
  const forest = L.buildLineageForest(recs);
  assert.equal(forest.length, 1); // single root n-1
  assert.equal(forest[0].record.nodeId, "n-1");
  // n-1 has two children (n-2, n-4), sorted by passage then seed date
  assert.deepEqual(forest[0].children.map((c) => c.record.nodeId), ["n-2", "n-4"]);
  // n-2 -> n-3
  assert.equal(forest[0].children[0].children[0].record.nodeId, "n-3");
  // flatten gives depth-first render order with depths
  const flat = L.flattenForest(forest).map((x) => x.record.nodeId + "@" + x.depth);
  assert.deepEqual(flat, ["n-1@0", "n-2@1", "n-3@2", "n-4@1"]);
});

test("buildLineageForest treats dangling parents as roots + is cycle-safe", () => {
  // dangling parent (n-99 doesn't exist) -> n-2 is a root
  const dangling = [
    { nodeId: "n-1", donor: "a", passage: "0" },
    { nodeId: "n-2", donor: "b", passage: "0", parentNodeId: "n-99" },
  ];
  assert.equal(L.buildLineageForest(dangling).length, 2);
  // a broken cycle must not hang and must still produce output
  const cyclic = [
    { nodeId: "a", donor: "x", parentNodeId: "b" },
    { nodeId: "b", donor: "x", parentNodeId: "a" },
  ];
  const f = L.buildLineageForest(cyclic);
  assert.ok(Array.isArray(f));
  assert.ok(L.flattenForest(f).length >= 1);
});

test("parseEvents is tolerant of bad input", () => {
  assert.deepEqual(L.parseEvents('[{"type":"feed"}]'), [{ type: "feed" }]);
  assert.deepEqual(L.parseEvents(""), []);
  assert.deepEqual(L.parseEvents(null), []);
  assert.deepEqual(L.parseEvents("not json"), []);
  assert.deepEqual(L.parseEvents('{"not":"array"}'), []);
});

test("statusFromEvent maps event types to status transitions", () => {
  assert.equal(L.statusFromEvent({ type: "freeze" }), "frozen");
  assert.equal(L.statusFromEvent({ type: "contamination" }), "contaminated");
  assert.equal(L.statusFromEvent({ type: "discard" }), "discarded");
  assert.equal(L.statusFromEvent({ type: "thaw" }), "active");
  assert.equal(L.statusFromEvent({ type: "passage" }), null);
  assert.equal(L.statusFromEvent({ type: "feed" }), null);
  assert.equal(L.statusFromEvent({ type: "passage", nextStatus: "discarded" }), "discarded");
  assert.equal(L.statusFromEvent({}), null);
});

test("sortEvents orders newest-first by date then seq", () => {
  const evs = [
    { type: "feed", at: "2026-05-01", seq: 1 },
    { type: "passage", at: "2026-05-10", seq: 2 },
    { type: "freeze", at: "2026-05-10", seq: 3 },
  ];
  const order = L.sortEvents(evs).map((e) => e.type);
  assert.deepEqual(order, ["freeze", "passage", "feed"]);
});

test("summarizeEvent builds a compact detail string", () => {
  assert.equal(L.summarizeEvent({ confluence: "80", splitRatio: "1:3", operator: "ZL" }), "80% conf · split 1:3 · ZL");
  assert.equal(L.summarizeEvent({ type: "feed" }), "");
  assert.equal(L.summarizeEvent({ viability: "95" }), "95% via");
});

test("wouldCreateCycle blocks lineage cycles", () => {
  const recs = [
    { nodeId: "n-1", parentNodeId: "" },
    { nodeId: "n-2", parentNodeId: "n-1" },
    { nodeId: "n-3", parentNodeId: "n-2" },
  ];
  assert.equal(L.wouldCreateCycle(recs, "n-1", "n-3"), true);
  assert.equal(L.wouldCreateCycle(recs, "n-2", "n-2"), true);
  assert.equal(L.wouldCreateCycle(recs, "n-3", "n-1"), false);
  const broken = [
    { nodeId: "a", parentNodeId: "b" },
    { nodeId: "b", parentNodeId: "a" },
  ];
  assert.equal(L.wouldCreateCycle(broken, "c", "a"), false);
});

// ─── Provenance / source-tracking validation ────────────────────────────────

test("cultureWarnings: provenance-free records raise no provenance warnings (regression)", () => {
  // A plain vessel (no provenance fields) must behave exactly as before.
  assert.deepEqual(msgs({ donor: "6769", seedDate: "2026-05-10" }, []), []);
  const parent = { nodeId: "n-1", donor: "6769", eye: "OD", passage: "2", seedDate: "2026-05-10", label: "P2" };
  const child = { nodeId: "n-2", donor: "6769", eye: "OD", passage: "3", seedDate: "2026-05-20", parentNodeId: "n-1", label: "P3" };
  assert.deepEqual(msgs(child, [parent, child]), []);
});

test("cultureWarnings: split date before seed date", () => {
  assert.ok(msgs({ donor: "d", seedDate: "2026-05-10", splitDate: "2026-05-01" }, []).some((x) => /Split date is before the seed date/.test(x)));
  assert.deepEqual(msgs({ donor: "d", seedDate: "2026-05-10", splitDate: "2026-05-12" }, []), []);
});

test("cultureWarnings: media-change/feed event before seed date", () => {
  const before = { donor: "d", seedDate: "2026-05-10", events: [{ type: "media_change", at: "2026-05-01" }] };
  assert.ok(msgs(before, []).some((x) => /media-change\/feed event \(2026-05-01\) is dated before the seed date/.test(x)));
  // a feed after seed, and a passage before seed, are both fine
  assert.deepEqual(msgs({ donor: "d", seedDate: "2026-05-10", events: [{ type: "feed", at: "2026-05-12" }] }, []), []);
  assert.deepEqual(msgs({ donor: "d", seedDate: "2026-05-10", events: [{ type: "passage", at: "2026-05-01" }] }, []), []);
});

test("cultureWarnings: primary-tissue/dissociation on a flask/dish vessel", () => {
  assert.ok(msgs({ donor: "d", seedDate: "2026-05-10", sourceRecordType: "primary_tissue_dissociation", iconId: "t75_flask" }, [])
    .some((x) => /primary tissue \/ dissociation but placed on a flask\/dish/.test(x)));
  // on the primary_tissue icon itself: no warning
  assert.deepEqual(msgs({ donor: "d", seedDate: "2026-05-10", sourceRecordType: "primary_tissue_dissociation", iconId: "primary_tissue" }, []), []);
});

test("cultureWarnings: P0 seed date differs from dissociation date", () => {
  assert.ok(msgs({ donor: "d", passage: "0", seedDate: "2026-05-10", dissociationDate: "2026-05-08" }, [])
    .some((x) => /P0 seed date \(2026-05-10\) differs from the dissociation date \(2026-05-08\)/.test(x)));
  // same date: fine
  assert.deepEqual(msgs({ donor: "d", passage: "0", seedDate: "2026-05-10", dissociationDate: "2026-05-10" }, []), []);
  // not P0: this particular rule does not apply
  assert.ok(!msgs({ donor: "d", passage: "1", seedDate: "2026-05-10", dissociationDate: "2026-05-08" }, []).some((x) => /P0 seed date/.test(x)));
});

test("cultureWarnings: ground-truth date field must point at a non-null date", () => {
  assert.ok(msgs({ donor: "d", seedDate: "2026-05-10", groundTruthDateField: "dissociation_date" }, [])
    .some((x) => /Dissociation date is selected as ground truth/.test(x)));
  assert.deepEqual(msgs({ donor: "d", seedDate: "2026-05-10", groundTruthDateField: "dissociation_date", dissociationDate: "2026-05-09" }, []), []);
  assert.ok(msgs({ donor: "d", seedDate: "2026-05-10", groundTruthDateField: "pretreatment_date" }, [])
    .some((x) => /Pretreatment date is selected as ground truth/.test(x)));
  assert.ok(msgs({ donor: "d", seedDate: "2026-05-10", groundTruthDateField: "unresolved" }, [])
    .some((x) => /Ground truth is unresolved/.test(x)));
  assert.deepEqual(msgs({ donor: "d", seedDate: "2026-05-10", groundTruthDateField: "unresolved", conflictResolution: "renamed flask" }, []), []);
});

test("cultureWarnings: source conflict by raw source identifier (same eye)", () => {
  const tissue = { nodeId: "n-1", donor: "6769", eye: "OD", rawSourceIdentifier: "T-12", sourceRecordType: "primary_tissue_dissociation", passage: "0", seedDate: "2026-05-01", dissociationDate: "2026-05-01", label: "tissue" };
  const flask = { nodeId: "n-2", donor: "6769", eye: "OD", rawSourceIdentifier: "T-12", sourceRecordType: "culture_vessel", passage: "0", seedDate: "2026-05-01", label: "flask" };
  assert.ok(msgs(flask, [tissue, flask]).some((x) => /Raw source ID already appears as Primary tissue \/ dissociation/.test(x)));

  // dissociation date differs between raw-source matches
  const a1 = { nodeId: "a", donor: "6769", eye: "OD", rawSourceIdentifier: "S1", passage: "1", seedDate: "2026-05-10", dissociationDate: "2026-05-01", label: "A" };
  const a2 = { nodeId: "b", donor: "6769", eye: "OD", rawSourceIdentifier: "S1", passage: "2", seedDate: "2026-05-20", dissociationDate: "2026-05-02", label: "B" };
  assert.ok(msgs(a2, [a1, a2]).some((x) => /Dissociation date differs from raw-source match/.test(x)));

  // same raw source + passage, differing seed dates
  const s1 = { nodeId: "a", donor: "6769", eye: "OD", rawSourceIdentifier: "Z", passage: "2", seedDate: "2026-05-10", label: "A" };
  const s2 = { nodeId: "b", donor: "6769", eye: "OD", rawSourceIdentifier: "Z", passage: "2", seedDate: "2026-05-12", label: "B" };
  assert.ok(msgs(s2, [s1, s2]).some((x) => /Same raw source and passage .* but seed dates differ/.test(x)));

  // both P0, dissociation vs existing P0 seed differ
  const z1 = { nodeId: "a", donor: "6769", eye: "OD", rawSourceIdentifier: "Q", passage: "0", seedDate: "2026-05-01", label: "P0a" };
  const z2 = { nodeId: "b", donor: "6769", eye: "OD", rawSourceIdentifier: "Q", passage: "0", seedDate: "2026-05-05", dissociationDate: "2026-05-03", label: "P0b" };
  assert.ok(msgs(z2, [z1, z2]).some((x) => /Dissociation date does not match the existing P0 seed date/.test(x)));

  // different eye -> no cross warning
  const e1 = { nodeId: "a", donor: "6769", eye: "OD", rawSourceIdentifier: "W", sourceRecordType: "primary_tissue_dissociation", passage: "0", seedDate: "2026-05-01", label: "OD" };
  const e2 = { nodeId: "b", donor: "6769", eye: "OS", rawSourceIdentifier: "W", sourceRecordType: "culture_vessel", passage: "0", seedDate: "2026-05-01", label: "OS" };
  assert.ok(!msgs(e2, [e1, e2]).some((x) => /Raw source ID already appears/.test(x)));
});

test("groundTruthDate resolves the authoritative date per field", () => {
  assert.equal(L.groundTruthDate({ groundTruthDateField: "seed_date", seedDate: "2026-05-10" }), "2026-05-10");
  assert.equal(L.groundTruthDate({ groundTruthDateField: "dissociation_date", dissociationDate: "2026-05-02" }), "2026-05-02");
  assert.equal(L.groundTruthDate({ groundTruthDateField: "pretreatment_date", pretreatmentDate: "2026-04-30" }), "2026-04-30");
  assert.equal(L.groundTruthDate({ groundTruthDateField: "unresolved", seedDate: "2026-05-10" }), null);
  assert.equal(L.groundTruthDate({ seedDate: "2026-05-10" }), "2026-05-10"); // defaults to seed
  assert.equal(L.groundTruthDate({ groundTruthDateField: "dissociation_date" }), null); // empty -> null
});

test("provenance helpers: normalize / sameDate / coercers / icon", () => {
  assert.equal(L.normalizeSourceId("T-12 / a"), "t12a");
  assert.equal(L.sameDate("2026-05-10T00:00", "2026-05-10"), true);
  assert.equal(L.coerceSourceRecordType("Primary tissue"), "primary_tissue_dissociation");
  assert.equal(L.coerceSourceRecordType("flask"), "culture_vessel");
  assert.equal(L.coerceSourceRecordType(""), "");
  assert.equal(L.coerceGroundTruthField("dissociation"), "dissociation_date");
  assert.equal(L.coerceGroundTruthField("seeding"), "seed_date");
  assert.equal(L.coerceGroundTruthField(""), "");
  assert.equal(L.isFlaskOrDishIcon("dish_60mm"), true);
  assert.equal(L.isFlaskOrDishIcon("primary_tissue"), false);
});

test("importCsvToDrafts maps provenance columns", () => {
  const csv = [
    "donor,eye,passage,flask,seed date,raw source,source type,dissociation date,ground truth",
    "6769,Right,P0,T75,2026-05-01,T-12,primary tissue,2026-04-29,dissociation",
  ].join("\n");
  const d = L.importCsvToDrafts(csv).drafts[0];
  assert.equal(d.rawSourceIdentifier, "T-12");
  assert.equal(d.sourceRecordType, "primary_tissue_dissociation");
  assert.equal(d.dissociationDate, "2026-04-29");
  assert.equal(d.groundTruthDateField, "dissociation_date");
  assert.equal(d.splitDate, "");
  assert.equal(d.pretreatmentDate, "");
  assert.equal(d.conflictResolution, "");
});
