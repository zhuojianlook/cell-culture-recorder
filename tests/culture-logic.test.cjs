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

test("cultureWarnings flags missing donor + seed date", () => {
  assert.deepEqual(L.cultureWarnings({ donor: "6769", seedDate: "2026-05-10" }), []);
  assert.deepEqual(L.cultureWarnings({ donor: "", seedDate: "2026-05-10" }), ["no donor"]);
  assert.deepEqual(L.cultureWarnings({ donor: "6769", seedDate: "" }), ["no seed date"]);
  assert.deepEqual(L.cultureWarnings({}), ["no donor", "no seed date"]);
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
