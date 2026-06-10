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

  // Status → a small colour for any future badges/grid.
  function statusColor(s) {
    return { active: "#5eead4", frozen: "#7dd3fc", contaminated: "#fca5a5", discarded: "#94a3b8" }[s] || "#94a3b8";
  }

  window.WLPCulture = {
    openRecord: openRecord,
    read: read,
    statusColor: statusColor,
    vesselTypeFromIcon: vesselTypeFromIcon,
    nodeLabel: nodeLabel,
  };
})();
