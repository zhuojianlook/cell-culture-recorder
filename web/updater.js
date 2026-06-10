// In-app auto-updater UI for the WetLab Planner desktop build.
//
// Talks to the Rust commands (check_for_update / download_and_install_update /
// restart_app) which use the updater endpoint + minisign pubkey configured in
// tauri.conf.json. On launch it silently checks for a newer release and, if one
// exists, shows a small banner offering a one-click "Install & Restart". Runs
// only inside the Tauri shell — a no-op in a plain browser.
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

  var BTN = "padding:6px 12px;border-radius:7px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font:inherit;cursor:pointer";
  var BTN_PRIMARY = "padding:6px 12px;border-radius:7px;border:1px solid #2dd4bf;background:#134e4a;color:#5eead4;font:inherit;cursor:pointer;font-weight:600";

  function ensureBanner() {
    var el = document.getElementById("wlpUpdateBanner");
    if (el) return el;
    el = document.createElement("div");
    el.id = "wlpUpdateBanner";
    el.style.cssText =
      "position:fixed;bottom:18px;right:18px;z-index:99999;max-width:340px;" +
      "background:#0f172a;border:1px solid #334155;color:#e2e8f0;" +
      "padding:14px 16px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.45);" +
      "font:13px/1.45 system-ui,-apple-system,sans-serif;display:none";
    el.innerHTML =
      '<div id="wlpUpdText" style="margin-bottom:10px"></div>' +
      '<div id="wlpUpdActions" style="display:flex;gap:8px;justify-content:flex-end"></div>';
    document.body.appendChild(el);
    return el;
  }

  function setText(t) {
    ensureBanner().querySelector("#wlpUpdText").textContent = t;
  }
  function setActions(buttons) {
    var box = ensureBanner().querySelector("#wlpUpdActions");
    box.innerHTML = "";
    buttons.forEach(function (b) {
      var btn = document.createElement("button");
      btn.textContent = b.label;
      btn.style.cssText = b.primary ? BTN_PRIMARY : BTN;
      btn.onclick = b.onClick;
      box.appendChild(btn);
    });
  }
  function show() { ensureBanner().style.display = "block"; }
  function hide() { ensureBanner().style.display = "none"; }

  function showAvailable(info) {
    setText("Update available: v" + info.version + " (you have v" + info.current_version + ").");
    setActions([
      { label: "Later", onClick: hide },
      { label: "Install & Restart", primary: true, onClick: function () { install(); } },
    ]);
    show();
  }

  function install() {
    setText("Downloading update…");
    setActions([]);
    var listen = getListen();
    if (listen) {
      listen("updater://progress", function (ev) {
        var p = (ev && ev.payload) || {};
        var got = (p.downloaded || 0) / 1048576;
        var tot = p.total ? " / " + (p.total / 1048576).toFixed(1) : "";
        setText("Downloading update… " + got.toFixed(1) + tot + " MB");
      }).catch(function () {});
    }
    invoke("download_and_install_update")
      .then(function () {
        setText("Update installed. Restarting…");
        setTimeout(function () { invoke("restart_app").catch(function () {}); }, 900);
      })
      .catch(function (err) {
        setText("Update failed: " + (err && err.message ? err.message : err));
        setActions([
          { label: "Dismiss", onClick: hide },
          { label: "Retry", primary: true, onClick: install },
        ]);
      });
  }

  // Check the release endpoint. `silent` = only surface when an update exists
  // (used on launch); when false, also report "up to date" (manual button).
  function check(silent) {
    return invoke("check_for_update")
      .then(function (info) {
        if (info && info.available) {
          showAvailable(info);
        } else if (!silent) {
          setText("You're up to date (v" + (info ? info.current_version : "?") + ").");
          setActions([{ label: "OK", primary: true, onClick: hide }]);
          show();
        }
        return info;
      })
      .catch(function (err) {
        if (!silent) {
          setText("Couldn't check for updates: " + (err && err.message ? err.message : err));
          setActions([{ label: "OK", onClick: hide }]);
          show();
        }
      });
  }

  // Manual trigger (wired to the dashboard "Check for updates" button) + global.
  window.wlpCheckForUpdate = function () { return check(false); };
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t && t.id === "dashboardCheckUpdate") {
      setText("Checking for updates…");
      setActions([]);
      show();
      check(false);
    }
  });

  // Auto-check shortly after launch (give the sidecar + UI a moment to settle).
  setTimeout(function () { check(true); }, 3000);
})();
