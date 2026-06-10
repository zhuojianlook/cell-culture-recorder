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

  // Culture fields persisted on node.dataset (camelCase -> data-culture-*).
  function read(node, key, fallback) {
    var v = node.dataset["culture" + key];
    return v == null || v === "" ? (fallback == null ? "" : fallback) : v;
  }
  function write(node, key, val) {
    if (val == null || val === "") delete node.dataset["culture" + key];
    else node.dataset["culture" + key] = String(val);
  }

  function vesselTypeFromIcon(node) {
    var id = String(node.dataset.iconId || "");
    var map = {
      t25_flask: "T25 flask", t75_flask: "T75 flask", t150_flask: "T150 flask",
      t175_flask: "T175 flask", t225_flask: "T225 flask", t300_flask: "T300 flask",
      dish_35mm: "35mm dish", dish_60mm: "60mm dish", dish_100mm: "100mm dish", dish_150mm: "150mm dish",
      cell_line: "Cell line", primary_tissue: "Primary tissue"
    };
    return map[id] || id || "Vessel";
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
          '<span id="wlpcRecVessel" style="font-size:.8125rem;color:var(--muted,#94a3b8)"></span>' +
        '</div>' +
        '<div class="modal__body" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
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
          '<div id="wlpcErr" class="form-status" style="grid-column:1/-1;color:#fca5a5"></div>' +
        '</div>' +
        '<div class="modal__footer" style="display:flex;gap:8px;justify-content:flex-end;padding:14px 16px">' +
          '<button type="button" id="wlpcCancel" class="btn">Cancel</button>' +
          '<button type="button" id="wlpcSave" class="btn btn--primary">Save record</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(backdrop);
    backdrop.querySelector("#wlpcCancel").onclick = hide;
    backdrop.querySelector("#wlpcSave").onclick = save;
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) hide(); });
    modal = backdrop;
    return modal;
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
    // Lineage parent options
    var sel = val("wlpcParent");
    sel.innerHTML = '<option value="">— none —</option>';
    otherVessels(node).forEach(function (n) {
      var opt = document.createElement("option");
      opt.value = n.dataset.nodeId || "";
      opt.textContent = nodeLabel(n);
      sel.appendChild(opt);
    });
    sel.value = read(node, "ParentNodeId", "");
    val("wlpcErr").textContent = "";
    modal.classList.remove("is-hidden");
    modal.style.display = "flex";
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
    write(node, "Donor", val("wlpcDonor").value.trim());
    write(node, "Eye", val("wlpcEye").value);
    write(node, "Passage", val("wlpcPassage").value.trim());
    write(node, "Status", val("wlpcStatus").value);
    write(node, "Medium", val("wlpcMedium").value.trim());
    write(node, "Seeding", val("wlpcSeeding").value.trim());
    write(node, "Incubator", val("wlpcIncubator").value.trim());
    write(node, "SeedDate", val("wlpcSeedDate").value);
    write(node, "ParentNodeId", val("wlpcParent").value);
    write(node, "Notes", val("wlpcNotes").value.trim());

    // Reflect the culture identity on the canvas node label (so the timeline
    // shows what each vessel is). Only when a donor is set.
    var donor = read(node, "Donor", "");
    if (donor) {
      var eye = read(node, "Eye", "");
      var p = read(node, "Passage", "");
      var summary = donor + (eye && eye !== "unknown" ? " " + eye : "") + (p !== "" ? " P" + p : "");
      var ta = node.querySelector(".node-label");
      if (ta) {
        ta.value = summary;
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        ta.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    // Tell app.js to persist the canvas (best-effort hooks).
    if (typeof window.wlpMarkCanvasDirty === "function") {
      try { window.wlpMarkCanvasDirty(); } catch (e) { /* ignore */ }
    }
    hide();
  }

  // Status → a small colour for badges/grid.
  function statusColor(s) {
    return { active: "#5eead4", frozen: "#7dd3fc", contaminated: "#fca5a5", discarded: "#94a3b8" }[s] || "#94a3b8";
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

  function warningsFor(node) {
    var w = [];
    if (!read(node, "Donor", "")) w.push("no donor");
    if (!read(node, "SeedDate", "")) w.push("no seed date");
    return w;
  }

  function compareNodes(a, b) {
    return (
      read(a, "Donor", "").localeCompare(read(b, "Donor", "")) ||
      read(a, "Eye", "").localeCompare(read(b, "Eye", "")) ||
      (Number(read(a, "Passage", "0")) - Number(read(b, "Passage", "0"))) ||
      read(a, "SeedDate", "").localeCompare(read(b, "SeedDate", ""))
    );
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  var grid = null;

  function buildGrid() {
    if (grid) return grid;
    var el = document.createElement("div");
    el.id = "wlpcGrid";
    el.className = "modal-backdrop is-hidden";
    el.style.cssText =
      "position:fixed;inset:0;z-index:9000;background:rgba(2,6,23,.78);display:none;" +
      "padding:4vh 4vw;overflow:auto";
    el.innerHTML =
      '<div style="max-width:1100px;margin:0 auto;background:#0f172a;border:1px solid rgba(148,163,184,.18);' +
      'border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.5)">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;' +
        'border-bottom:1px solid rgba(148,163,184,.14)">' +
          '<div><h2 style="margin:0;font-size:1.1rem;color:#e5e7eb">Cell Culture Records</h2>' +
          '<div id="wlpcGridSub" style="font-size:.8125rem;color:#94a3b8;margin-top:2px"></div></div>' +
          '<button type="button" id="wlpcGridClose" class="btn">Back to timeline</button>' +
        '</div>' +
        '<div id="wlpcGridBody" style="padding:8px 14px 18px"></div>' +
      '</div>';
    document.body.appendChild(el);
    el.querySelector("#wlpcGridClose").onclick = closeGrid;
    el.addEventListener("click", function (e) { if (e.target === el) closeGrid(); });
    grid = el;
    return el;
  }

  function renderGrid() {
    var body = grid.querySelector("#wlpcGridBody");
    var vessels = allCultureVessels().sort(compareNodes);
    grid.querySelector("#wlpcGridSub").textContent =
      vessels.length + (vessels.length === 1 ? " vessel" : " vessels") + " in this project";
    if (!vessels.length) {
      body.innerHTML =
        '<p style="color:#94a3b8;padding:24px;text-align:center">No vessels yet. Drop a flask, dish, ' +
        'or cell line onto the Cell Culture timeline, then double-click it to add its record.</p>';
      return;
    }
    var rows = vessels.map(function (n) {
      var w = warningsFor(n);
      var status = read(n, "Status", "active");
      var warn = w.length
        ? '<span title="' + esc(w.join(", ")) + '" style="color:#fca5a5">&#9888; ' + w.length + "</span>"
        : '<span style="color:#475569">&#10003;</span>';
      return (
        '<tr data-node-id="' + esc(n.dataset.nodeId) + '" style="cursor:pointer;border-top:1px solid rgba(148,163,184,.10)">' +
        td(read(n, "Donor", "") || '<span style="color:#64748b">—</span>', "font-weight:600") +
        td(read(n, "Eye", "")) +
        td(read(n, "Passage", "") !== "" ? "P" + read(n, "Passage", "") : "") +
        td(vesselTypeFromIcon(n)) +
        '<td style="padding:8px 10px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;' +
          'background:' + statusColor(status) + ';margin-right:6px"></span>' + esc(status) + "</td>" +
        td(read(n, "Medium", "")) +
        td(read(n, "SeedDate", "")) +
        td(parentLabelOf(n)) +
        '<td style="padding:8px 10px;text-align:center">' + warn + "</td>" +
        "</tr>"
      );
    }).join("");
    body.innerHTML =
      '<table style="width:100%;border-collapse:collapse;font-size:.8125rem;color:#e5e7eb">' +
      '<thead><tr style="color:#94a3b8;text-align:left">' +
        th("Donor") + th("Eye") + th("P#") + th("Vessel") + th("Status") + th("Medium") +
        th("Seed date") + th("Lineage parent") + th("⚠") +
      "</tr></thead><tbody>" + rows + "</tbody></table>";
    Array.prototype.forEach.call(body.querySelectorAll("tr[data-node-id]"), function (tr) {
      tr.addEventListener("mouseenter", function () { tr.style.background = "rgba(148,163,184,.06)"; });
      tr.addEventListener("mouseleave", function () { tr.style.background = ""; });
      tr.addEventListener("click", function () {
        var id = tr.getAttribute("data-node-id");
        var node = document.querySelector('.drop[data-node-id="' + id + '"]');
        if (!node) return;
        closeGrid();
        if (typeof window.wlpFocusNode === "function") window.wlpFocusNode(id);
        setTimeout(function () { openRecord(node); }, 60);
      });
    });
  }
  function td(html, extra) { return '<td style="padding:8px 10px;' + (extra || "") + '">' + html + "</td>"; }
  function th(t) { return '<th style="padding:8px 10px;font-weight:600">' + t + "</th>"; }
  function parentLabelOf(n) {
    var pid = read(n, "ParentNodeId", "");
    if (!pid) return "";
    var p = document.querySelector('.drop[data-node-id="' + pid + '"]');
    return p ? esc(nodeLabel(p)) : "";
  }

  function openGrid() {
    buildGrid();
    renderGrid();
    grid.classList.remove("is-hidden");
    grid.style.display = "block";
  }
  function closeGrid() {
    if (!grid) return;
    grid.classList.add("is-hidden");
    grid.style.display = "none";
  }

  // Inject a "Records" toggle into the workspace toolbar, visible only while the
  // Cell Culture workspace is active.
  function injectRecordsButton() {
    var actions = document.querySelector(".workspace__actions");
    if (!actions || document.getElementById("wlpcRecordsBtn")) return;
    var btn = document.createElement("button");
    btn.id = "wlpcRecordsBtn";
    btn.type = "button";
    btn.textContent = "🧫 Records";
    btn.title = "Cell culture records for this project";
    btn.style.display = "none";
    btn.onclick = openGrid;
    actions.insertBefore(btn, actions.firstChild);
    function sync() {
      var ws = typeof window.wlpActiveWorkspace === "function" ? window.wlpActiveWorkspace() : "";
      btn.style.display = ws === "cell-culture" ? "" : "none";
    }
    document.addEventListener("click", function (e) {
      if (e.target && e.target.closest && e.target.closest(".workspace-tab")) setTimeout(sync, 50);
    });
    sync();
    // Re-check periodically in case the workspace changes by other means.
    setInterval(sync, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectRecordsButton);
  } else {
    injectRecordsButton();
  }
  // The toolbar may render slightly after load; retry a few times.
  var tries = 0;
  var retry = setInterval(function () {
    injectRecordsButton();
    if (document.getElementById("wlpcRecordsBtn") || ++tries > 20) clearInterval(retry);
  }, 500);

  window.WLPCulture = {
    openRecord: openRecord,
    openGrid: openGrid,
    read: read,
    statusColor: statusColor,
    vesselTypeFromIcon: vesselTypeFromIcon,
    nodeLabel: nodeLabel,
  };
})();
