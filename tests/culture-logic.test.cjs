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
