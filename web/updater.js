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
      '<div class="modal" style="margin-top:6vh;max-width:560px;width:560px;max-height:84vh;display:flex;flex-direction:column">' +
        '<div class="modal__header" style="display:flex;align-items:center;justify-content:space-between">' +
          '<h3 style="margin:0">About</h3>' +
          '<button type="button" id="wlpAboutX" class="btn" title="Close" style="padding:2px 9px">&times;</button>' +
        '</div>' +
        '<div class="modal__body" style="overflow:auto">' +
          '<div style="text-align:center;padding:10px 0 4px">' +
            '<div style="font-size:1.3rem;font-weight:700;color:#bbc2cf">' + esc(APP_NAME) + '</div>' +
            '<div id="wlpAboutVer" style="color:#828a94;font-size:.85rem;margin-top:2px"></div>' +
            '<div style="margin-top:8px;font-size:.85rem;color:#a7afbd">Created by <strong>' + esc(AUTHOR) + '</strong></div>' +
            '<div style="margin-top:6px;font-size:.78rem;color:#828a94;line-height:1.5;max-width:440px;margin-left:auto;margin-right:auto">' + esc(DESCRIPTION) + '</div>' +
          '</div>' +
          '<hr style="border:0;border-top:1px solid rgba(130, 138, 148,.18);margin:14px 0">' +
          // Update section
          '<div style="display:flex;flex-direction:column;align-items:center;gap:8px">' +
            '<button type="button" id="wlpAboutCheck" class="btn">Check for updates</button>' +
            '<div id="wlpAboutUpd" style="width:100%"></div>' +
          '</div>' +
          '<hr style="border:0;border-top:1px solid rgba(130, 138, 148,.18);margin:14px 0">' +
          // Citation
          '<div style="font-size:.8rem;color:#bbc2cf;font-weight:600;margin-bottom:6px">Citation</div>' +
          '<div style="position:relative;background:rgba(27, 31, 37,.45);border:1px solid rgba(130, 138, 148,.16);' +
            'border-radius:8px;padding:10px 36px 10px 12px;font:.72rem/1.5 ui-monospace,Menlo,monospace;color:#828a94">' +
            '<span id="wlpAboutCite"></span>' +
            '<button type="button" id="wlpAboutCopy" class="btn" title="Copy citation" ' +
              'style="position:absolute;top:6px;right:6px;padding:2px 8px;font-size:.7rem">Copy</button>' +
          '</div>' +
          '<hr style="border:0;border-top:1px solid rgba(130, 138, 148,.18);margin:14px 0">' +
          // Changelog (collapsible)
          '<details>' +
            '<summary style="cursor:pointer;color:#bbc2cf;font-size:.8rem;font-weight:600;user-select:none">Changelog</summary>' +
            '<div id="wlpAboutLog" style="margin-top:10px"></div>' +
          '</details>' +
        '</div>' +
        '<div class="modal__footer" style="display:flex;justify-content:flex-end;padding:14px 16px">' +
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
        '<div style="font-weight:600;font-size:' + (small ? ".72rem" : ".8rem") + ';color:#bbc2cf">v' +
          esc(e.version) + " <span style=\"color:#5b6268;font-weight:400\">— " + esc(e.date) + "</span></div>" +
        '<ul style="margin:3px 0 0;padding-left:18px">' +
          e.changes.map(function (c) {
            return '<li style="font-size:' + size + ';color:#828a94;line-height:1.45">' + esc(c) + "</li>";
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
          '<div style="font-weight:600;color:#bbc2cf;margin-bottom:6px">Version ' + esc(state.latestVersion) + " is available</div>" +
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
        '<div style="height:6px;border-radius:3px;background:rgba(130, 138, 148,.18);margin-top:8px;overflow:hidden">' +
          '<div style="height:100%;width:' + (pct != null ? pct : 30) + '%;background:#51afef;transition:width .2s"></div>' +
        "</div>");
      return;
    }
    if (s === "ready") {
      box.innerHTML = note("ok",
        '<div style="font-weight:600;color:#bbc2cf;margin-bottom:6px">Update installed.</div>' +
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
      ? "rgba(81, 175, 239,.12);color:#51afef;border-color:rgba(81, 175, 239,.35)"
      : kind === "warn"
      ? "rgba(252,165,165,.12);color:#ff7b7b;border-color:rgba(252,165,165,.35)"
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
