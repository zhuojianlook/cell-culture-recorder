// About dialog + in-app auto-updater for the WetLab Planner desktop build.
//
// Modeled on the Multi-Panel Figure Builder's About dialog: an About window
// auto-opens once per session on startup, showing the app version, a curated
// changelog, a citation, and an in-app updater. The updater talks to the Rust
// commands (check_for_update / download_and_install_update / restart_app) which
// use the updater endpoint + minisign pubkey in tauri.conf.json. Runs only
// inside the Tauri shell — a no-op in a plain browser.
(function () {
  "use strict";

  function getInvoke() {
    var t = window.__TAURI__;
    return t && t.core && typeof t.core.invoke === "function" ? t.core.invoke : null;
  }
  function getListen() {
    var t = window.__TAURI__;
    return t && t.event && typeof t.event.listen === "function" ? t.event.listen : null;
  }

  var invoke = getInvoke();
  if (!invoke) return; // not running in Tauri — nothing to do

  var REPO = "zhuojianlook/cell-culture-recorder";
  var APP_NAME = "WetLab Planner";
  var AUTHOR = "Zhuojian Look";
  var DESCRIPTION =
    "A canvas planner + Cell Culture Recorder for wet-lab work — design protocols and " +
    "animal/cell workflows on a timeline, and record donor-derived culture vessels with " +
    "lineage, events, provenance and validation. For the benefit of scientists.";

  // Curated changelog (newest first). Drives both the collapsible changelog and
  // the "what's new" list shown when an update is available. Append a new entry
  // here each release.
  var CHANGELOG = [
    { version: "0.2.60", date: "2026-09-10", changes: [
      "Records → Timeline is much easier to read. When several vessels share the same seed date — most obviously every well of one plate — they now fan out sideways along that date instead of stacking into a tall vertical column. The microscopy 🔬 markers moved into their own lane just below each passage row, so they no longer sit on top of the vessel circles or their dates. And the date axis no longer prints a date twice when a vessel already sits on the first or last date.",
    ] },
    { version: "0.2.59", date: "2026-09-08", changes: [
      "Display fixes across the whole app. The root cause of many of them: every inline style in the app was being silently blocked by the desktop shell's content-security policy, so elements meant to be hidden (a stray “Choose File” control, an empty grey bar) were showing, and status pills lost their colour. Those now render correctly — Active is green again.",
      "Things you could not reach or read are fixed: the culture-record editor now keeps its title and the Save row on screen and scrolls its fields (before, on a short window, the top of the form and the Save button were off-screen); the Timeline no longer shrinks its own labels to an unreadable size on a narrow panel; the “Needs confirmation” panel is capped and scrolls, instead of pushing the records table several screens down; and the left palette scrolls, so Storage / Export Project Data are always reachable.",
      "Readability and spacing: the Records table now has proper column widths, so “6-well plate” fits on one line and rows are a uniform height; long donor ids and labels truncate with a tooltip instead of stretching the app wider than the window; the “no warnings” tick and the donor-group headings have readable contrast; vessel status and “N seeded” badges no longer sit on top of a plate's own labels; and hovering a vessel lifts its label above its neighbours' when dates overlap.",
    ] },
    { version: "0.2.58", date: "2026-07-03", changes: [
      "Performance: switching between the Cell Culture map and Cell Culture Records is much snappier, and the map no longer feels janky while idle. The needs-attention warnings for every vessel are now computed in a single pass (indexed by donor/eye, label and source id) instead of re-scanning all ~600 vessels once per vessel — so the map's status badges (which refresh on a timer), the Records table, and the Timeline all render in roughly linear time. Vessel status badges also skip redundant redraws when nothing changed.",
    ] },
    { version: "0.2.57", date: "2026-07-03", changes: [
      "Review fixes + UI polish. Bugs: a microscopy 🔬 icon on the same date as a vessel no longer steals that vessel's click; canvas plate glyphs no longer wash out their seeded-well colours under the media overlay; a seeded plate used in a lineage no longer drops its connector / falsely flags its child as orphan on the Timeline; browsing through empty wells no longer creates phantom “seeded” wells, and clearing every well now sticks (no ghost A1 on reload); plate well sub-rows in the table now show their Medium; the “N vessels” count agrees between Table and Timeline.",
      "The donor “Confirm & apply” list is no longer a dead-end past 30: an “Apply all exact single matches (N)” bulk button, a donor-id filter, and a “Show 30 more” pager. The per-well plate editor now works for 24/96/384-well plates (scrolling grid), warns before discarding unsaved wells (and on Escape), moved “Remove this well” to the footer with a confirm, autofocuses the donor field, and has a clearer selected-well highlight. A “loose match” now reads amber (distinct from the red opposite-cornea / year-mismatch), and long provenance paths no longer balloon the conflict buttons.",
    ] },
    { version: "0.2.56", date: "2026-07-02", changes: [
      "Multiwell-plate wells now show up everywhere. On the Timeline, each seeded well is its own point placed in its donor's passage band (tagged with its well id, e.g. A1) — so a plate seeded with different donors across its wells appears under each donor; click a well point to edit it. On the planning canvas, a plate's glyph now colours in the wells that have a record (by status) and shows a small “N seeded” badge, so you can see at a glance which wells are filled. Completes the per-well plate support across the editor, the Records table, the Timeline, and the canvas.",
    ] },
    { version: "0.2.55", date: "2026-07-02", changes: [
      "Multiwell plates: each well can now be its own entry. Double-click a plate (in the Cell Culture Records or on the canvas) to open a well-grid editor laid out like the physical plate (a 6-well plate is 2×3); click any well to record its own donor / eye / passage / status / seed date / notes. The Records table shows a plate as a “N / M wells seeded” summary that expands to one row per seeded well. A plate that already had a single record keeps it (it becomes well A1); nothing is lost. (Timeline + on-canvas well colouring to follow.)",
    ] },
    { version: "0.2.54", date: "2026-07-02", changes: [
      "Passage branch points are now shown properly: when a vessel is split into several daughter vessels, each daughter is drawn as its own node with its OWN independent line back to the parent, so a 1→N split fans out as a branch instead of collapsing into a single merged link. Vessels that take part in a lineage are shown individually; the ×N badge is now reserved for genuine duplicate/parallel entries with no lineage.",
    ] },
    { version: "0.2.53", date: "2026-07-02", changes: [
      "Timeline is cleaner: lineage links are now straight lines with right-angle bends instead of curves, and each microscopy 🔬 icon sits directly ON the passage line at the exact date its image was taken (no longer floated above it). Click a 🔬 to view the image as before.",
    ] },
    { version: "0.2.52", date: "2026-07-02", changes: [
      "Donor ground truth is now mapped to the RIGHT spreadsheet column, and shows its source. The consolidation matched columns by loose text before, so a donor’s “age” was silently read from an “Average Viability” column (giving ‘#DIV/0!’) and the “deceased date” from a “Death to Preservation Time” column (giving ‘9:56:00’) — producing bogus PDF-vs-spreadsheet conflicts. Fields are now matched precisely (an allow/deny list per field), formula errors and wrong-typed cells are dropped, and every value carries its exact origin — the eye-bank PDF filename, or the spreadsheet file :: tab :: column. The Needs-confirmation panel now shows that origin on each value and in an expandable “where these came from” table, so you can see a value came from ‘Donor Age’ and not ‘Average Viability’.",
      "Every donor↔vessel match now requires an explicit human confirmation — nothing is applied until you confirm. Previously a donor that matched exactly one vessel was hidden and its ground truth silently (never) applied; now all matches, single or multiple, appear under “Confirm & apply donor ground truth”, marked “● not applied”, and only fuse onto the vessel when you click. Matching is cornea-aware (a right-cornea donor is flagged ⚠ opposite cornea against a left-cornea vessel) and year-aware (2024-XXXX and 2025-XXXX no longer silently collide — flagged ⚠ year mismatch). Confirmed donors move to a “✓ Confirmed & applied” list with an Undo that removes the fused note.",
    ] },
    { version: "0.2.51", date: "2026-07-02", changes: [
      "Microscopy matching is now safer and harder to mis-link. Imaging is recorded per passage, so a session whose donor number and passage match is attached to a single vessel at that passage — it is no longer fanned out onto every flask of a split (which double-counted fields and pinned sibling images to each other). Anything genuinely uncertain — a blank/both-eyes image where the donor has BOTH a left and right cornea at that passage, an exact-donor image at a passage with no logged vessel, a near-collision, or a low-confidence typo — is routed to the “🔬 Microscopy” review section for you to place, never guessed or silently dropped. Adjacent-digit transpositions (e.g. ‘5406’ vs ‘5046’) now score as a single typo, and 3-digit donor fragments are no longer fuzzy-matched (too collision-prone). A one-click “assign to suggested vessel” appears only when the suggestion is unique and unambiguous; otherwise you must pick explicitly. Your corrections are remembered per donor+passage, so re-importing (including new imaging dates) keeps them.",
      "Timeline 🔬 placement fixed: the date axis is anchored to the vessel seed dates, so a single stray/typo imaging date far in the future can no longer rescale and collapse the whole layout — out-of-range icons clamp to the axis edge. Icons now sit just above the passage line (no longer covering a vessel’s click target) and same-week sessions are spread apart so each stays individually clickable. Click-to-view’s reveal-in-Finder fallback (used when there’s no default app for a .nd2/.tif) now works.",
    ] },
    { version: "0.2.50", date: "2026-07-02", changes: [
      "Microscopy matching is now fuzzy + reviewable. Image filenames that don’t confidently match a vessel — donor-number typos (e.g. ‘08326’→‘38326’, edit-distance 1), ambiguous near-collisions, or genuine gaps — are surfaced in a new “🔬 Microscopy” review section instead of being silently mis-linked. Confirm the suggested vessel or pick the right one; this is a name correction that NEVER renames or touches the real image file.",
      "Each imaging session now shows as a 🔬 icon placed at its imaging DATE along the passage’s growth span on the Timeline (the date axis extends to cover imaging dates). Click a 🔬 to open/view that image in your default app, or reveal it in Finder — the file is never copied or renamed.",
    ] },
    { version: "0.2.49", date: "2026-07-02", changes: [
      "New source of truth — brightfield microscopy. Import the imaging-session CSV (built from the .nd2 / .tif filenames only — the large image files are never downloaded) and each matched vessel gains an imaging summary (sessions · fields · observation date span), shown as a 🔬 marker + tooltip on the Timeline. The import reports coverage and how many donors were imaged with no matching vessel record — a real gap the images reveal. Because the filenames are hand-typed and lossy, matching is by donor core + passage.",
    ] },
    { version: "0.2.48", date: "2026-07-01", changes: [
      "Ground-truth conflicts: the eye-bank PDF is no longer assumed always-right. When the PDF and the spreadsheet disagree on a donor field (deceased date, endothelial density, age, sex), the Needs-confirmation panel now shows BOTH values — the PDF one marked 📄 — and lets you choose which is correct. This surfaced real spreadsheet errors (ages that were formula artifacts like averages or ‘#DIV/0!’, and a ‘deceased date’ that held a duration). Your choice is remembered and re-fused onto the vessel.",
    ] },
    { version: "0.2.47", date: "2026-07-01", changes: [
      "Timezone correctness: the eye-bank PDFs report US time (each states Central or Eastern), but the lab works in Singapore time. All US-sourced date-times (death, preservation, ocular cooling, release) are now converted to Asia/Singapore, DST-correct per each form's stated zone — which moves 22 of 27 death dates to the correct Singapore calendar day. The original US date-time and zone are kept for reference (hover the “✓ eye-bank” chip).",
    ] },
    { version: "0.2.46", date: "2026-07-01", changes: [
      "Donor ground truth now includes the eye-bank Tissue Report PDFs, as the authoritative source: precise date-time of death, cause of death, per-eye endothelial density, age/sex/race and serology override the spreadsheet-derived values where they differ (they agreed on 26/26 death dates and corrected one). Donor records backed by a PDF are marked “✓ eye-bank” in the Needs confirmation panel, and confirming such a match fuses that ground truth onto the vessel(s).",
      "Re-importing a donor CSV now replaces the registry (it's a full consolidation) instead of appending duplicate rows, and preserves your existing confirm / dismiss decisions by donor id.",
    ] },
    { version: "0.2.45", date: "2026-07-01", changes: [
      "New donor ground-truth layer: import a donor CSV (donor identity + deceased / dissociation / preservation dates, seeding success, demographics) and it’s stored per-project and reconciled against your vessels. Import auto-detects donor vs. vessel CSVs.",
      "New “Needs confirmation” region at the top of Cell Culture Records: surfaces the reconciliation gaps for you to resolve — ambiguous donor↔vessel matches (the same donor logged as ‘2025-4392’, ‘?2025-4392’, a ‘LEI-25-…’ id, or a date-id with a ‘(3468)’ cross-reference), vessels whose declared lineage parent was never found, and — collapsed — donors with no vessel and vessels with no donor record.",
      "Confirming a donor↔vessel match fuses that donor’s ground truth (dissociation date, deceased date, seeding outcome, age) onto the vessel(s); resolving an unlinked parent draws the lineage.",
    ] },
    { version: "0.2.44", date: "2026-07-01", changes: [
      "Multiwell plates are now first-class culture vessels (6 / 12 / 24 / 48 / 96-well): they appear in the ‘Add vessel’ picker, render as plate symbols in the Timeline, and count as vessels everywhere in the records. Previously any plate was silently treated as a T75 flask.",
      "CSV import recognises plate types in the vessel column — ‘24 Well Plate’, ‘6-well’, ‘plate 96’, etc. — and maps them to the right plate, snapping odd well counts to the nearest supported size.",
    ] },
    { version: "0.2.43", date: "2026-07-01", changes: [
      "Records → Timeline: click a ×N cluster to expand it. A panel lists the individual flasks that share that passage and seed date — each with its vessel type, status, medium and notes — so you can tell a real split (different conditions) from the same flask logged twice.",
      "If they are duplicates, pick which flask to keep and ‘Merge into 1’: the rest are removed, any lineage that pointed at them is re-pointed onto the one you kept, and any distinct notes / medium / seed date are carried over so nothing is lost.",
    ] },
    { version: "0.2.42", date: "2026-07-01", changes: [
      "Cell Culture Records → Timeline is much cleaner: passages are now banded top-to-bottom (P0, P1, P2 …) with time running left-to-right, so a lineage reads straight down the page instead of tangling across lanes.",
      "Vessels that share the same passage AND the same seed date are collapsed into a single node with a ×N badge. This surfaces the 'split or duplicate' case directly — N flasks split from one parent on the same day, or N repeated log entries — instead of stacking N identical symbols on top of each other.",
    ] },
    { version: "0.2.41", date: "2026-06-18", changes: [
      "Cell Culture Records → Timeline: the lineage view is now a real timeline. Each donor·eye is a compact date axis; every vessel is drawn as its vessel-type symbol tinted by status, placed at its seed date and joined to its parent by a lineage curve. Click a symbol to open its record.",
      "Uncertain ('?' best-guess) donor entries now keep that marker — they still reconcile to the right donor for grouping and lineage, but are flagged so you can see which identifications were a guess.",
    ] },
    { version: "0.2.40", date: "2026-06-18", changes: [
      "CSV import is far more tolerant of real-world culture logs: it now parses compact YYYYMMDD dates (e.g. 20240828) and ordinal forms ('20th Aug 2025'), recognises 'ODOS' as both eyes (plus common typos), treats '?' and '-' as blank, and maps a 'Cell ID' column to the donor.",
      "Donor IDs that carry the eye ('045986OD', '2025-4392ODOS') are split automatically — the donor reconciles into one lineage and the eye is recovered even when there's no separate eye column.",
    ] },
    { version: "0.2.39", date: "2026-06-18", changes: [
      "Cell Culture Records → Tree: the lineage view is now a real family tree — card nodes with status colour, passage, vessel type and seed date, branch connectors, and per donor·eye group headers with an issue count.",
      "Messy-import reconciliation: inconsistent donor entry for the same donor (e.g. '6769', '6769.0', 'Donor 6769') is now normalised so passages stop fragmenting into separate lineages.",
      "The tree flags the problems that matter in real bookkeeping: 'unlinked' (a declared parent that wasn't found, with its label), 'cross-donor' (an impossible passage), and 'passage ↓' (a child whose passage isn't greater than its parent).",
    ] },
    { version: "0.2.38", date: "2026-06-18", changes: [
      "Fix: drag-and-drop works again in the desktop app — you can drag icons from the palette onto the canvas to place vessels/nodes, drag to reposition them, and rearrange storage-box slots. The Tauri webview had been intercepting HTML5 drag-and-drop; that native interception is now disabled.",
    ] },
    { version: "0.2.37", date: "2026-06-18", changes: [
      "Fix: recording reagent aliquots into a box that already held a stored vessel no longer overwrites the vessel — vessel occupants are now preserved and shown locked (cyan) in the aliquot grid",
      "Fix: deleting a vessel that was placed in a storage box now frees its slot instead of leaving an orphaned occupant",
      "Fix: storage-box grid sizes other than 9×9 now work everywhere (the size parser was matching nothing, so every box was forced to 9×9)",
      "Safer box editing: shrinking a box's grid now warns before dropping any occupied slots and cleans up affected vessel links",
    ] },
    { version: "0.2.36", date: "2026-06-18", changes: [
      "Cell Culture editor: a 'Store' button places a vessel into a real Storage Box slot (cryo / freezer location) — click an empty slot in the box grid to drop the vessel in, or its current slot to clear it",
      "Storage boxes now show vessel occupants in cyan (distinct from reagent aliquots), with the vessel's full label on hover; the placement is remembered on the vessel and survives renames",
    ] },
    { version: "0.2.35", date: "2026-06-18", changes: [
      "Cell Culture editor: a 'Protocol' button opens the full step-based protocol builder for the passage that produced the vessel (set a lineage parent first)",
    ] },
    { version: "0.2.34", date: "2026-06-18", changes: [
      "Cell Culture editor: a 'Media plan' button opens the scheduler so you can specify media changes / feeds (dates, recurrence, volume) for a vessel — the same planner feature that was previously only reachable on non-culture nodes",
    ] },
    { version: "0.2.33", date: "2026-06-17", changes: [
      "App-wide restyle to match the Multi-Panel Figure Builder: Apple-dark palette (steel-blue accent, #1c1c1e background), system font, and flat surfaces (no gradients or blur)",
    ] },
    { version: "0.2.32", date: "2026-06-17", changes: [
      "Cell Culture timeline rework: 'Tidy timeline' now draws donor·eye lane bands with labels, shows each vessel as a compact card (donor · passage · status · date), and routes passages as clean left→right curves",
    ] },
    { version: "0.2.31", date: "2026-06-17", changes: [
      "Cell Culture Records redesigned: sticky column + donor·eye group headers, status & warning pills, cleaner toolbar, aligned (tabular) dates and passages",
    ] },
    { version: "0.2.30", date: "2026-06-17", changes: [
      "Fix: passages can no longer link across donors/eyes (a passage stays within one donor·eye); existing impossible links auto-repair on load",
      "Fix: the About dialog's changelog now scrolls in its own area, so expanding it no longer pushes the dialog past the window",
    ] },
    { version: "0.2.29", date: "2026-06-17", changes: [
      "Cell Culture map: a 'Tidy timeline' button arranges vessels into donor·eye lanes at their seed/ground-truth date, so passages flow left→right with time",
    ] },
    { version: "0.2.28", date: "2026-06-17", changes: [
      "Fix: the About window now fits inside the app and scrolls, instead of overflowing",
    ] },
    { version: "0.2.27", date: "2026-06-17", changes: [
      "Map: each vessel now shows a status dot + warning badge on the Cell Culture canvas",
      "Editor: 'View in Records' jumps from a vessel to its row in the records table",
      "Fix: no more false 'raw source conflict' warning on a normal donor-tissue → flask lineage",
      "Drawing a vessel link that would form a lineage cycle is now blocked",
      "Security hardening: escaped records-grid cells, loopback-only local server, stricter content policy",
    ] },
    { version: "0.2.26", date: "2026-06-16", changes: [
      "Passages are now real node-to-node connections: drawing a vessel→vessel link sets the lineage parent, and setting a parent draws the link — kept in sync, with existing lineage backfilled",
    ] },
    { version: "0.2.25", date: "2026-06-16", changes: [
      "Passage lineage links now draw on the Cell Culture canvas (vessel → its parent)",
      "Renamed the tab to \"Cell Culture Records\"",
    ] },
    { version: "0.2.24", date: "2026-06-16", changes: [
      "Records table groups passages under their Donor + Eye (the source tissue)",
    ] },
    { version: "0.2.23", date: "2026-06-16", changes: [
      "New doom-one (Doom Emacs) color scheme — slate background, soft fg, blue accent",
    ] },
    { version: "0.2.22", date: "2026-06-16", changes: [
      "Pick a record type up front — Donor Tissue / Culture Vessel / Mixed — in the culture editor",
      "A primary-tissue vessel defaults to Donor Tissue",
    ] },
    { version: "0.2.21", date: "2026-06-16", changes: [
      "About dialog on startup with an in-app updater (check / install / restart)",
    ] },
    { version: "0.2.20", date: "2026-06-16", changes: [
      "Fixed the squished Cell Culture Recorder tab — the records view now fills the window",
      "Add culture vessels directly from the recorder (vessel-type picker + editor)",
    ] },
    { version: "0.2.19", date: "2026-06-16", changes: [
      "Provenance & source-tracking fields on each vessel (raw source, ground-truth date, dissociation/pretreatment/split dates)",
      "Provenance-dependent validation: source conflicts, ground-truth consistency, P0 seed-vs-dissociation, chronology",
    ] },
    { version: "0.2.16", date: "2026-06-11", changes: [
      "Search, status, and needs-attention filters in the recorder",
    ] },
    { version: "0.2.15", date: "2026-06-11", changes: [
      "CSV import — bulk-create vessels on the canvas",
    ] },
    { version: "0.2.14", date: "2026-06-11", changes: [
      "Lineage tree view in the recorder",
    ] },
    { version: "0.2.13", date: "2026-06-11", changes: [
      "Events / passaging log on vessels",
    ] },
    { version: "0.2.12", date: "2026-06-11", changes: [
      "Validation rule engine — surfaces needs-attention warnings",
    ] },
    { version: "0.2.10", date: "2026-06-10", changes: [
      "Cell Culture Recorder is its own per-project workspace tab",
    ] },
    { version: "0.2.2", date: "2026-06-10", changes: [
      "In-app auto-updater",
    ] },
  ];

  // ── State ──────────────────────────────────────────────────────────────────
  var modal = null;
  var autoShown = false;
  var state = {
    status: "idle", // idle | checking | up-to-date | available | downloading | ready | error
    currentVersion: "…",
    latestVersion: null,
    downloaded: 0,
    total: null,
    error: "",
  };
  var progressUnlisten = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function errMsg(e) { return e && e.message ? e.message : String(e); }
  function cmp(a, b) {
    var x = String(a).split("."), y = String(b).split(".");
    for (var i = 0; i < 3; i++) {
      var dx = (Number(x[i]) || 0) - (Number(y[i]) || 0);
      if (dx) return dx;
    }
    return 0;
  }

  // The Tauri app version (independent of network); falls back to the updater's
  // reported current_version, then "unknown".
  function loadVersion() {
    var t = window.__TAURI__;
    var p;
    try {
      if (t && t.app && typeof t.app.getVersion === "function") p = t.app.getVersion();
    } catch (e) { /* ignore */ }
    if (p && typeof p.then === "function") {
      return p.then(function (v) { return v || "unknown"; }).catch(function () { return null; });
    }
    return Promise.resolve(null);
  }

  // ── Modal ──────────────────────────────────────────────────────────────────
  function build() {
    if (modal) return modal;
    var backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop modal-backdrop--center is-hidden";
    backdrop.style.zIndex = "100000";
    backdrop.innerHTML =
      '<div class="modal" style="width:min(600px,92vw);max-height:calc(100vh - 64px);display:flex;flex-direction:column;overflow:hidden">' +
        '<div class="modal__header" style="display:flex;align-items:center;justify-content:space-between;flex:0 0 auto">' +
          '<h3 style="margin:0">About</h3>' +
          '<button type="button" id="wlpAboutX" class="btn" title="Close" style="padding:2px 9px">&times;</button>' +
        '</div>' +
        '<div class="modal__body" style="flex:1 1 auto;min-height:0;overflow:auto">' +
          '<div style="text-align:center;padding:10px 0 4px">' +
            '<div style="font-size:1.3rem;font-weight:700;color:#e5e5ea">' + esc(APP_NAME) + '</div>' +
            '<div id="wlpAboutVer" style="color:#8e8e93;font-size:.85rem;margin-top:2px"></div>' +
            '<div style="margin-top:8px;font-size:.85rem;color:#c7c7cc">Created by <strong>' + esc(AUTHOR) + '</strong></div>' +
            '<div style="margin-top:6px;font-size:.78rem;color:#8e8e93;line-height:1.5;max-width:440px;margin-left:auto;margin-right:auto">' + esc(DESCRIPTION) + '</div>' +
          '</div>' +
          '<hr style="border:0;border-top:1px solid rgba(142, 142, 147,.18);margin:14px 0">' +
          // Update section
          '<div style="display:flex;flex-direction:column;align-items:center;gap:8px">' +
            '<button type="button" id="wlpAboutCheck" class="btn">Check for updates</button>' +
            '<div id="wlpAboutUpd" style="width:100%"></div>' +
          '</div>' +
          '<hr style="border:0;border-top:1px solid rgba(142, 142, 147,.18);margin:14px 0">' +
          // Citation
          '<div style="font-size:.8rem;color:#e5e5ea;font-weight:600;margin-bottom:6px">Citation</div>' +
          '<div style="position:relative;background:rgba(20, 20, 22,.45);border:1px solid rgba(142, 142, 147,.16);' +
            'border-radius:8px;padding:10px 36px 10px 12px;font:.72rem/1.5 ui-monospace,Menlo,monospace;color:#8e8e93">' +
            '<span id="wlpAboutCite"></span>' +
            '<button type="button" id="wlpAboutCopy" class="btn" title="Copy citation" ' +
              'style="position:absolute;top:6px;right:6px;padding:2px 8px;font-size:.7rem">Copy</button>' +
          '</div>' +
          '<hr style="border:0;border-top:1px solid rgba(142, 142, 147,.18);margin:14px 0">' +
          // Changelog (collapsible)
          // Changelog: its own bounded scroll region with a sticky toggle, so
          // expanding it can never grow the dialog past the window and the
          // collapse control stays reachable. (top:-14px cancels the body padding.)
          '<details style="position:relative">' +
            '<summary style="position:sticky;top:-14px;z-index:1;background:#2c2c2e;padding:4px 0;cursor:pointer;color:#e5e5ea;font-size:.8rem;font-weight:600;user-select:none">Changelog</summary>' +
            '<div id="wlpAboutLog" style="margin-top:10px;max-height:40vh;overflow:auto"></div>' +
          '</details>' +
        '</div>' +
        '<div class="modal__footer" style="display:flex;justify-content:flex-end;padding:14px 16px;flex:0 0 auto">' +
          '<button type="button" id="wlpAboutClose" class="btn btn--primary">Close</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(backdrop);
    modal = backdrop;

    backdrop.querySelector("#wlpAboutX").onclick = close;
    backdrop.querySelector("#wlpAboutClose").onclick = close;
    backdrop.querySelector("#wlpAboutCheck").onclick = function () { runCheck(); };
    backdrop.querySelector("#wlpAboutCopy").onclick = copyCitation;
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal && modal.style.display === "flex") close();
    });

    renderChangelog();
    return modal;
  }

  function q(id) { return modal.querySelector("#" + id); }

  function renderVersion() {
    if (!modal) return;
    q("wlpAboutVer").textContent = "Version " + state.currentVersion;
    var cite =
      AUTHOR.split(" ").slice(-1)[0] + ", Z. (2026). " + APP_NAME + " (Version " + state.currentVersion +
      ") [Computer software]. https://github.com/" + REPO;
    q("wlpAboutCite").textContent = cite;
  }

  function changelogSince(version) {
    return CHANGELOG.filter(function (e) { return cmp(e.version, version) > 0; });
  }

  function entryHtml(e, small) {
    var size = small ? ".68rem" : ".75rem";
    return (
      '<div style="margin-bottom:10px">' +
        '<div style="font-weight:600;font-size:' + (small ? ".72rem" : ".8rem") + ';color:#e5e5ea">v' +
          esc(e.version) + " <span style=\"color:#636366;font-weight:400\">— " + esc(e.date) + "</span></div>" +
        '<ul style="margin:3px 0 0;padding-left:18px">' +
          e.changes.map(function (c) {
            return '<li style="font-size:' + size + ';color:#8e8e93;line-height:1.45">' + esc(c) + "</li>";
          }).join("") +
        "</ul>" +
      "</div>"
    );
  }

  function renderChangelog() {
    if (!modal) return;
    q("wlpAboutLog").innerHTML = CHANGELOG.map(function (e) { return entryHtml(e, false); }).join("");
  }

  // Render the update section per state.status.
  function renderUpdate() {
    if (!modal) return;
    var box = q("wlpAboutUpd");
    var checkBtn = q("wlpAboutCheck");
    var s = state.status;
    if (checkBtn) checkBtn.disabled = s === "checking" || s === "downloading";
    if (checkBtn) checkBtn.textContent = s === "checking" ? "Checking…" : "Check for updates";

    if (s === "idle" || s === "checking") { box.innerHTML = ""; return; }

    if (s === "up-to-date") {
      box.innerHTML = note("ok", "You're on the latest version (v" + esc(state.currentVersion) + ").");
      return;
    }
    if (s === "available") {
      var whatsNew = changelogSince(state.currentVersion);
      box.innerHTML =
        note("info",
          '<div style="font-weight:600;color:#e5e5ea;margin-bottom:6px">Version ' + esc(state.latestVersion) + " is available</div>" +
          (whatsNew.length
            ? '<div style="max-height:150px;overflow:auto;margin-bottom:8px">' + whatsNew.map(function (e) { return entryHtml(e, true); }).join("") + "</div>"
            : "") +
          '<button type="button" id="wlpAboutInstall" class="btn btn--primary" style="font-size:.8rem">Download &amp; install update</button>'
        );
      q("wlpAboutInstall").onclick = function () { runInstall(); };
      return;
    }
    if (s === "downloading") {
      var got = (state.downloaded / 1048576).toFixed(1);
      var tot = state.total ? " / " + (state.total / 1048576).toFixed(1) + " MB" : " MB";
      var pct = state.total ? Math.min(100, Math.round((state.downloaded / state.total) * 100)) : null;
      box.innerHTML = note("info",
        "Downloading update… " + got + tot + (pct != null ? " (" + pct + "%)" : "") +
        '<div style="height:6px;border-radius:3px;background:rgba(142, 142, 147,.18);margin-top:8px;overflow:hidden">' +
          '<div style="height:100%;width:' + (pct != null ? pct : 30) + '%;background:#5a7fa8;transition:width .2s"></div>' +
        "</div>");
      return;
    }
    if (s === "ready") {
      box.innerHTML = note("ok",
        '<div style="font-weight:600;color:#e5e5ea;margin-bottom:6px">Update installed.</div>' +
        '<button type="button" id="wlpAboutRestart" class="btn btn--primary" style="font-size:.8rem">Restart now</button>');
      q("wlpAboutRestart").onclick = function () { invoke("restart_app").catch(function () {}); };
      return;
    }
    if (s === "error") {
      box.innerHTML = note("warn", "Couldn't update: " + esc(state.error || "check your internet connection.") +
        ' <a href="https://github.com/' + REPO + '/releases/latest" target="_blank" rel="noreferrer" style="color:#7dd3fc">Open releases</a>');
      return;
    }
  }

  function note(kind, html) {
    var c = kind === "ok"
      ? "rgba(90, 127, 168,.12);color:#5a7fa8;border-color:rgba(90, 127, 168,.35)"
      : kind === "warn"
      ? "rgba(252,165,165,.12);color:#ff6961;border-color:rgba(252,165,165,.35)"
      : "rgba(125,211,252,.12);color:#bae6fd;border-color:rgba(125,211,252,.30)";
    return '<div style="width:100%;border:1px solid;border-radius:8px;padding:8px 12px;font-size:.78rem;background:' + c + '">' + html + "</div>";
  }

  // ── Update actions ──────────────────────────────────────────────────────────
  function runCheck() {
    state.status = "checking";
    renderUpdate();
    invoke("check_for_update")
      .then(function (info) {
        if (info && info.current_version) { state.currentVersion = info.current_version; renderVersion(); }
        if (info && info.available) { state.latestVersion = info.version; state.status = "available"; }
        else state.status = "up-to-date";
        renderUpdate();
      })
      .catch(function (err) { state.error = errMsg(err); state.status = "error"; renderUpdate(); });
  }

  function runInstall() {
    state.status = "downloading";
    state.downloaded = 0;
    state.total = null;
    renderUpdate();
    var listen = getListen();
    var attach = listen
      ? listen("updater://progress", function (ev) {
          var p = (ev && ev.payload) || {};
          state.downloaded = p.downloaded || 0;
          if (p.total) state.total = p.total;
          renderUpdate();
        }).then(function (un) { progressUnlisten = un; }).catch(function () {})
      : Promise.resolve();
    attach.then(function () {
      return invoke("download_and_install_update");
    }).then(function () {
      if (progressUnlisten) { try { progressUnlisten(); } catch (e) {} progressUnlisten = null; }
      state.status = "ready";
      renderUpdate();
    }).catch(function (err) {
      if (progressUnlisten) { try { progressUnlisten(); } catch (e) {} progressUnlisten = null; }
      state.error = errMsg(err);
      state.status = "error";
      renderUpdate();
    });
  }

  function copyCitation() {
    var text = q("wlpAboutCite").textContent;
    var done = function () {
      var b = q("wlpAboutCopy");
      if (!b) return;
      b.textContent = "Copied!";
      setTimeout(function () { if (b) b.textContent = "Copy"; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {});
    }
  }

  // ── Open / close ────────────────────────────────────────────────────────────
  function open(autoCheck) {
    build();
    // Refresh the version each open (cheap, keeps it accurate after an update).
    loadVersion().then(function (v) {
      if (v) { state.currentVersion = v; renderVersion(); }
    });
    renderVersion();
    renderUpdate();
    modal.classList.remove("is-hidden");
    modal.style.display = "flex";
    if (autoCheck !== false) runCheck();
  }
  function close() {
    if (!modal) return;
    modal.classList.add("is-hidden");
    modal.style.display = "none";
    if (state.status === "checking" || state.status === "error" || state.status === "up-to-date") state.status = "idle";
  }

  // ── Public hooks ────────────────────────────────────────────────────────────
  window.wlpOpenAbout = function () { open(true); };
  window.wlpCheckForUpdate = function () { open(true); };
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t && (t.id === "dashboardCheckUpdate" || t.id === "dashboardAbout")) open(true);
  });

  // Auto-open the About dialog once per session, shortly after launch (give the
  // sidecar + UI a moment to settle).
  function autoOpen() {
    if (autoShown) return;
    autoShown = true;
    open(true);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(autoOpen, 1500); });
  } else {
    setTimeout(autoOpen, 1500);
  }
})();
