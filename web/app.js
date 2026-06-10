const CELL_ICONS = [
  { id: "t25_flask", label: "T25 Flask", category: "vessels", iconKind: "flask", iconMark: "T25" },
  { id: "t75_flask", label: "T75 Flask", category: "vessels", iconKind: "flask", iconMark: "T75" },
  { id: "t150_flask", label: "T150 Flask", category: "vessels", iconKind: "flask", iconMark: "T150" },
  { id: "t175_flask", label: "T175 Flask", category: "vessels", iconKind: "flask", iconMark: "T175" },
  { id: "t225_flask", label: "T225 Flask", category: "vessels", iconKind: "flask", iconMark: "T225" },
  { id: "t300_flask", label: "T300 Flask", category: "vessels", iconKind: "flask", iconMark: "T300" },
  { id: "plate_6", label: "6 Well Plate", category: "plates", iconKind: "plate", iconMark: "6" },
  { id: "plate_12", label: "12 Well Plate", category: "plates", iconKind: "plate", iconMark: "12" },
  { id: "plate_24", label: "24 Well Plate", category: "plates", iconKind: "plate", iconMark: "24" },
  { id: "plate_48", label: "48 Well Plate", category: "plates", iconKind: "plate", iconMark: "48" },
  { id: "plate_96", label: "96 Well Plate", category: "plates", iconKind: "plate", iconMark: "96" },
  { id: "plate_384", label: "384 Well Plate", category: "plates", iconKind: "plate", iconMark: "384" },
  { id: "plate_1536", label: "1536 Well Plate", category: "plates", iconKind: "plate", iconMark: "1536" },
  { id: "dish_35mm", label: "35mm Dish", category: "dishes", iconKind: "dish", iconMark: "35" },
  { id: "dish_60mm", label: "60mm Dish", category: "dishes", iconKind: "dish", iconMark: "60" },
  { id: "dish_100mm", label: "100mm Dish", category: "dishes", iconKind: "dish", iconMark: "100" },
  { id: "dish_150mm", label: "150mm Dish", category: "dishes", iconKind: "dish", iconMark: "150" },
  { id: "cell_line", label: "Cell Line", category: "starting", iconKind: "cell-line", iconMark: "CL" },
  { id: "primary_tissue", label: "Primary Tissue", category: "starting", iconKind: "tissue", iconMark: "PT" }
];
const ANIMAL_ICONS = [
  { id: "cage_mouse", label: "Mouse Cage", category: "cages", iconKind: "cage", iconMark: "MC", cageType: "mouse" },
  { id: "cage_rat", label: "Rat Cage", category: "cages", iconKind: "cage", iconMark: "RC", cageType: "rat" },
  { id: "cage_rabbit", label: "Rabbit Cage", category: "cages", iconKind: "cage", iconMark: "RBC", cageType: "rabbit" },
  { id: "cage_guinea_pig", label: "Guinea Pig Cage", category: "cages", iconKind: "cage", iconMark: "GPC", cageType: "guinea_pig" },
  { id: "animal_mouse", label: "Mouse", category: "animals", iconKind: "animal", iconMark: "M", animalType: "mouse" },
  { id: "animal_rat", label: "Rat", category: "animals", iconKind: "animal", iconMark: "R", animalType: "rat" },
  { id: "animal_rabbit", label: "Rabbit", category: "animals", iconKind: "animal", iconMark: "RB", animalType: "rabbit" },
  { id: "animal_guinea_pig", label: "Guinea Pig", category: "animals", iconKind: "animal", iconMark: "GP", animalType: "guinea_pig" },
  {
    id: "procedure_slit_lamp",
    label: "Slit-lamp Measurement",
    category: "procedures",
    iconKind: "animal-procedure",
    iconMark: "SL",
    procedureType: "slit-lamp"
  },
  {
    id: "procedure_oct",
    label: "OCT Measurement",
    category: "procedures",
    iconKind: "animal-procedure",
    iconMark: "OCT",
    procedureType: "oct"
  },
  {
    id: "procedure_ivcm",
    label: "IVCM Measurement",
    category: "procedures",
    iconKind: "animal-procedure",
    iconMark: "IVCM",
    procedureType: "ivcm"
  },
  {
    id: "procedure_eyedrops",
    label: "Eyedrops",
    category: "procedures",
    iconKind: "animal-procedure",
    iconMark: "ED",
    procedureType: "eyedrops"
  }
];
const PLANNING_ICONS = [
  { id: "plan_task", label: "Task", category: "tasks", iconKind: "planning-task", iconMark: "T" },
  { id: "plan_milestone", label: "Milestone", category: "tasks", iconKind: "deadline", iconMark: "MS", color: "#f472b6" }
];
const ALL_ICONS = [...CELL_ICONS, ...ANIMAL_ICONS, ...PLANNING_ICONS];

const CELL_PALETTE_TABS = [
  { id: "vessels", label: "Vessels" },
  { id: "plates", label: "Plates" },
  { id: "dishes", label: "Dishes" },
  { id: "starting", label: "Starting Material" },
  { id: "protocols", label: "Protocols" }
];
const ANIMAL_PALETTE_TABS = [
  { id: "cages", label: "Cages" },
  { id: "animals", label: "Animals" },
  { id: "procedures", label: "Procedures" },
  { id: "protocols", label: "Protocols" }
];
const PLANNING_PALETTE_TABS = [
  { id: "tasks", label: "Tasks" }
];

const WORKSPACES = [
  {
    id: "planning",
    label: "Planning",
    paletteTitle: "Planning Workspace",
    paletteSubtitle: "Drag tasks and link them to define dependencies.",
    tabs: PLANNING_PALETTE_TABS,
    icons: PLANNING_ICONS
  },
  {
    id: "animal-work",
    label: "Animal Work",
    paletteTitle: "Animal Work Workspace",
    paletteSubtitle: "Manage cages in housing board and schedule procedures on timeline.",
    tabs: ANIMAL_PALETTE_TABS,
    icons: ANIMAL_ICONS
  },
  {
    id: "cell-culture",
    label: "Cell Culture",
    paletteTitle: "Culture Vessels and Starting Material",
    paletteSubtitle: "Drag an icon into the canvas to place it.",
    tabs: CELL_PALETTE_TABS,
    icons: CELL_ICONS
  },
  {
    // The recorder is a per-project ledger view of the Cell Culture vessels —
    // no palette/canvas of its own; culture.js renders the grid when active.
    id: "culture-records",
    label: "Cell Culture Recorder",
    paletteTitle: "Cell Culture Records",
    paletteSubtitle: "Every culture vessel in this project.",
    tabs: [],
    icons: []
  }
];
const WORKSPACE_BY_ID = WORKSPACES.reduce((acc, entry) => {
  acc[entry.id] = entry;
  return acc;
}, {});
const DEFAULT_WORKSPACE_ID = "cell-culture";

const paletteList = document.getElementById("paletteList");
const paletteTabs = document.getElementById("paletteTabs");
const paletteTitleEl = document.getElementById("paletteTitle");
const paletteSubtitleEl = document.getElementById("paletteSubtitle");
const workspaceTabsEl = document.getElementById("workspaceTabs");
const canvas = document.getElementById("canvas");
const hint = canvas.querySelector(".canvas__hint");
const milestoneLayer = document.getElementById("milestoneLayer");
const deleteButton = document.getElementById("deleteSelection");
const userMgmtBtn = document.getElementById("userMgmt");
const mediaFormBtn = document.getElementById("mediaFormBtn");
const inventoryBtn = document.getElementById("inventoryBtn");
const aliquotBtn = document.getElementById("aliquotBtn");
const storageBtn = document.getElementById("storageBtn");
const storageBoxBtn = document.getElementById("storageBoxBtn");
const exportProjectBtn = document.getElementById("exportProjectBtn");
const planningTaskPanel = document.getElementById("planningTaskPanel");
const planningTaskList = document.getElementById("planningTaskList");
const animalHousingPanel = document.getElementById("animalHousingPanel");
const animalHousingToggleBtn = document.getElementById("animalHousingToggle");
const animalHousingBoard = document.getElementById("animalHousingBoard");
const animalHousingStage = document.getElementById("animalHousingStage");
const animalHousingList = document.getElementById("animalHousingList");
const animalHousingDrawer = document.getElementById("animalHousingDrawer");
const housingDrawerToggle = document.getElementById("housingDrawerToggle");
const housingDrawerCloseBtn = document.getElementById("housingDrawerClose");
const animalTransferPanel = document.getElementById("animalTransferPanel");
const animalTransferList = document.getElementById("animalTransferList");
const signInBtn = document.getElementById("userSignIn");
const billingBtn = document.getElementById("billingBtn");
const connectionsLayer = document.getElementById("connectionsLayer");
const connectionsTopLayer = document.getElementById("connectionsTopLayer");
const timelineEl = document.getElementById("timeline");
const todayLineEl = document.getElementById("todayLine");
const todayTriangleEl = document.getElementById("todayTriangle");
const todayTimeEl = document.getElementById("todayTimeLabel");
const editTemplatesBtn = document.getElementById("editTemplates");
const timelinePrevBtn = document.getElementById("timelinePrev");
const timelineNextBtn = document.getElementById("timelineNext");
const jumpTodayBtn = document.getElementById("jumpToday");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");
let modalDragActive = false;
let nodeMenu = null;
let mediaModal = null;
let mediaForm = null;
let mediaTargetNode = null;
let mediaPlanWorking = [];
let additivesWorking = [];
let removalsWorking = [];
let mediaRecurringWorking = [];
let mediaPlateGroupId = "";
let mediaTemplates = [];
let users = [];
let templateManager = null;
let templateManagerListEl = null;
let mediaModalMode = "node"; // "node" | "template"
let lastDragData = null;
let modalTaskStatus = {};
let modalTaskCompletion = {};
let modalTaskMeta = {};
let inventoryModal = null;
let inventoryListEl = null;
let inventoryForm = {};
let inventoryItems = [];
let mediaFormulationModal = null;
let mediaFormulationListEl = null;
let mediaFormulationForm = {};
let mediaFormulations = [];
let aliquotModal = null;
let aliquotForm = {};
let editingInventoryIndex = -1;
let storageModal = null;
let storageForm = {};
let storageListEl = null;
let storageItems = [];
let editingStorageIndex = -1;
let storageBoxModal = null;
let storageBoxForm = {};
let storageBoxListEl = null;
let storageBoxes = [];
let editingStorageBoxIndex = -1;
let storageBoxViewModal = null;
let storageBoxViewIndex = -1;
let aliquotBoxCurrent = null;
let aliquotPlacement = null;
let aliquotPlacementBox = null;
let currentAliquotDragFrom = null;
let startModal = null;
let startModalDate = null;
let startModalDateProxy = null;
let startModalDatePickerBtn = null;
let startModalTime = null;
let startModalTimePickerBtn = null;
let startModalTitleEl = null;
let startModalLabelEl = null;
let startModalHintEl = null;
let startModalNoteEl = null;
let startModalSexWrap = null;
let startModalSex = null;
let startModalSave = null;
let startModalCancel = null;
let startModalNode = null;
let startModalPendingPlacement = false;
let startModalPlateGroupId = "";
let plateSelectorModal = null;
let plateSelectorNode = null;
let plateSelectorGrid = null;
let plateSelectorInfo = null;
let plateSelectorProceed = null;
let plateSelectorCreateGroup = null;
let plateSelectorUnbindGroup = null;
let plateSelectorRenameGroup = null;
let plateSelectorGroupList = null;
let plateSelectorData = null;
let plateSelectorMode = "edit"; // "edit" | "link-source" | "link-target" | "change-wells"
let plateSelectorEditGroupId = "";
let plateSelectorTitle = null;
let plateSelectorCopy = null;
let plateSelectorSelection = new Set();
let plateSelectorButtonsByWell = new Map();
let plateSelectorDragActive = false;
let plateSelectorDragMode = "";
let plateSelectorDragPointerId = null;
let plateSelectorDragStart = null;
let plateSelectorDragMoved = false;
let plateSelectorDragStartWellId = "";
let plateSelectorDragBaseSelection = new Set();
let plateSelectorMarquee = null;
const plateRowClickTimers = new Map();
let plateGroupRenameModal = null;
let plateGroupRenameInput = null;
let plateGroupRenameNode = null;
let plateGroupRenameGroupId = "";
let completionModal = null;
let completionUserSelect = null;
let completionUserOther = null;
let completionDate = null;
let completionTime = null;
let completionSave = null;
let completionCancel = null;
let completionRecurringPrompt = null;
let completionRecurringContinue = null;
let completionRecurringFinal = null;
let completionTargetNode = null;
let completionTaskKey = null;
let completionTaskData = null;
let completionFromToggle = false;
let completionSkipToggle = false;
let planningTaskModal = null;
let planningTaskModalNodeId = "";
let planningTaskModalName = null;
let planningTaskModalComplete = null;
let planningTaskModalColorList = null;
let planningTaskModalSelectedColor = "";
let planningTaskModalStartDate = null;
let planningTaskModalEndDate = null;
let planningTaskModalAssignee = null;
let milestoneModal = null;
let milestoneModalMilestoneId = "";
let milestoneModalName = null;
let milestoneModalColorList = null;
let milestoneModalSelectedColor = "";
let milestoneModalDate = null;
let milestoneDragState = null;
let cageCapacityModal = null;
let cageCapacityModalNodeId = "";
let cageCapacitySpeciesLabel = null;
let cageCapacityInput = null;
let cageCapacitySaveDefaultInput = null;
let logPanel = null;
let logPanelBody = null;
let logPanelToggle = null;
let workspaceEl = null;
let logFilterSelect = null;
let logAnimalFilterBtn = null;
let logAnimalFilterStatus = null;
let userModal = null;
let userListEl = null;
let userForm = {};
let editingUserIndex = -1;
let assignModal = null;
let assignUserSelect = null;
let assignSave = null;
let assignCancel = null;
let assignTargetNode = null;
let assignTaskKey = null;
let assignCustomSave = null;
let signInModal = null;
let signInUserSelect = null;
let signInPassInput = null;
let signInStatus = null;
let signInGoogleMount = null;
let signInGoogleHint = null;
let signInSignOutBtn = null;
let billingModal = null;
let billingStatusEl = null;
let billingUpgradeBtn = null;
let billingManageBtn = null;
let billingRefreshBtn = null;
let animalDetailsModal = null;
let animalDetailsModalAnimalId = "";
let animalDetailsNameInput = null;
let animalDetailsIdInput = null;
let animalDetailsDateInput = null;
let animalDetailsTimeInput = null;
let animalDetailsSexInput = null;
let animalDetailsProjectsInput = null;
let animalDetailsPendingCreate = false;
let animalProcedureModal = null;
let animalProcedureModalNodeId = "";
let animalProcedureList = null;
let animalProcedureSummary = null;
let animalFilterModal = null;
let animalFilterAgeMode = null;
let animalFilterAgeDays = null;
let animalFilterSex = null;
let animalFilterProject = null;
let animalFilterIds = null;
let animalFilterState = {
  active: false,
  ageMode: "any",
  ageDays: "",
  sex: "",
  project: "",
  ids: []
};
let animalHousingState = {
  cages: [],
  animals: []
};
let animalHousingCollapsed = false;
let sidebarCageCollapsed = new Set();
let googleSignInInitialized = false;
let googleSignInRetryTimer = null;
let protocolTemplates = [];
let protocolBuilderModal = null;
let protocolBuilderTitleInput = null;
let protocolBuilderTemplateInput = null;
let protocolBuilderCanvas = null;
let protocolBuilderSurface = null;
let protocolBuilderScrollXWrap = null;
let protocolBuilderScrollX = null;
let protocolBuilderLinks = null;
let protocolBuilderLinkLabels = null;
let protocolBuilderTaskPreview = null;
let protocolBuilderEmpty = null;
let protocolBuilderConnectionId = "";
let protocolBuilderWorking = null;
let protocolBuilderDragStepId = "";
let protocolBuilderDragPointerId = null;
let protocolBuilderDragOffsetX = 0;
let protocolBuilderDragOffsetY = 0;
let protocolBuilderLinking = null;
let protocolBuilderEndpoints = [];
let currentUser = null;
let currentUserEmail = "";
let currentUserIsAdmin = false;
let currentAuthProvider = "";
let apiSessionToken = "";
let apiSessionExpiresAt = "";
let backendStateHydratedProjectId = "";
let backendStateSyncTimer = null;
let backendStateSyncInFlight = false;
let backendStatePullInFlight = false;
let localProjectStateRevision = 0;
let backendInitialHydrationPending = false;
let localProjectStateDirtySinceHydration = false;
let activeCanvasId = "";
let canvasSyncTimer = null;
let canvasSyncInFlight = false;
let canvasLoadedFromBackend = false;
let taskToast = null;
let selectedFocus = null;
let activeWorkspaceId = DEFAULT_WORKSPACE_ID;
let activePaletteTab = WORKSPACE_BY_ID[DEFAULT_WORKSPACE_ID].tabs[0].id;
const PROJECT_ID_STORAGE_KEY = "activeProjectIdV1";
const LAST_SIGNED_IN_USER_STORAGE_KEY = "lastSignedInUserV1";
const API_SESSION_TOKEN_STORAGE_KEY = "apiSessionTokenV1";
const API_SESSION_EXPIRES_STORAGE_KEY = "apiSessionExpiresAtV1";
const ANIMAL_HOUSING_STORAGE_KEY = "animalHousingV1";
let activeProjectId = String(localStorage.getItem(PROJECT_ID_STORAGE_KEY) || "default-project").trim() || "default-project";
let currentRoute = { view: "auth", canvasId: null };
const paletteTabByWorkspace = {
  planning: WORKSPACE_BY_ID.planning.tabs[0].id,
  "animal-work": WORKSPACE_BY_ID["animal-work"].tabs[0].id,
  "cell-culture": WORKSPACE_BY_ID["cell-culture"].tabs[0].id
};
const animalTransferLog = [];
const globalMilestones = [];
const DAY_MS = 86400000;
const PLATE_MULTI_WELL_MAX = 1536;
const PROTOCOL_TEMPLATES_STORAGE_KEY = "protocolTemplatesV1";
const PROTOCOL_CANVAS_MIN_WIDTH = 980;
const PROTOCOL_CANVAS_MIN_HEIGHT = 520;
const PROTOCOL_CANVAS_STEP_WIDTH = 230;
const PROTOCOL_CANVAS_STEP_HEIGHT = 260;
const PROTOCOL_CANVAS_PADDING = 140;
const PROTOCOL_ENDPOINT_NODE_WIDTH = 190;
const PROTOCOL_ENDPOINT_SPACING = 110;
apiSessionToken = String(localStorage.getItem(API_SESSION_TOKEN_STORAGE_KEY) || "").trim();
apiSessionExpiresAt = String(localStorage.getItem(API_SESSION_EXPIRES_STORAGE_KEY) || "").trim();
const PROTOCOL_STEP_LIBRARY = [
  { type: "wash", label: "Wash", icon: "PBS", defaults: { inventoryRef: "", volume: "1", volumeUnit: "mL", temperature: "25", task: true } },
  { type: "incubate", label: "Incubate", icon: "37°C", defaults: { temperature: "37", duration: "5", durationUnit: "min", task: true } },
  { type: "shake", label: "Shake", icon: "RPM", defaults: { speed: "120", speedUnit: "rpm", duration: "10", durationUnit: "min", task: true } },
  { type: "split", label: "Split", icon: "1:3", defaults: { ratio: "1:3", notes: "", task: true } },
  { type: "centrifuge", label: "Centrifuge", icon: "g", defaults: { speed: "300", speedUnit: "g", temperature: "4", duration: "5", durationUnit: "min", task: true } },
  { type: "dissect", label: "Dissect", icon: "DS", defaults: { description: "", task: true } },
  { type: "scrape", label: "Scrape", icon: "SC", defaults: { notes: "", task: true } },
  { type: "move", label: "Move", icon: "MV", defaults: { location: "", notes: "", task: true } }
];
const DEFAULT_PROTOCOL_TEMPLATES = [
  {
    id: "protocol-template-blank",
    name: "Blank Protocol",
    builtin: true,
    protocol: {
      name: "Blank Protocol",
      steps: [],
      links: []
    }
  },
  {
    id: "protocol-template-passage",
    name: "Standard Passage",
    builtin: true,
    protocol: {
      name: "Standard Passage",
      steps: [
        { id: "ps-passage-1", type: "wash", title: "Wash culture", x: 80, y: 90, inventoryRef: "", volume: "1", volumeUnit: "mL", temperature: "25", task: true, notes: "" },
        { id: "ps-passage-2", type: "scrape", title: "Scrape to detach", x: 320, y: 70, task: true, notes: "Use sterile scraper." },
        { id: "ps-passage-3", type: "centrifuge", title: "Pellet cells", x: 560, y: 140, speed: "300", speedUnit: "g", temperature: "4", duration: "5", durationUnit: "min", task: true, notes: "" },
        { id: "ps-passage-4", type: "split", title: "Split and seed", x: 800, y: 95, ratio: "1:3", task: true, notes: "Seed at target density." },
        { id: "ps-passage-5", type: "incubate", title: "Incubate", x: 1030, y: 95, temperature: "37", duration: "5", durationUnit: "min", task: true, notes: "" }
      ],
      links: [
        { id: "pl-passage-1", fromId: "ps-passage-1", toId: "ps-passage-2", label: "1" },
        { id: "pl-passage-2", fromId: "ps-passage-2", toId: "ps-passage-3", label: "2" },
        { id: "pl-passage-3", fromId: "ps-passage-3", toId: "ps-passage-4", label: "3" },
        { id: "pl-passage-4", fromId: "ps-passage-4", toId: "ps-passage-5", label: "4" }
      ]
    }
  }
];
const GOOGLE_CLIENT_ID = resolveGoogleClientId();
const PLATE_GROUP_COLORS = [
  "#22d3ee",
  "#34d399",
  "#f59e0b",
  "#f472b6",
  "#a78bfa",
  "#fb7185",
  "#60a5fa",
  "#84cc16",
  "#f97316",
  "#14b8a6"
];
const MILESTONE_COLORS = [
  "#f472b6",
  "#ef4444",
  "#f59e0b",
  "#22d3ee",
  "#60a5fa",
  "#34d399",
  "#a78bfa",
  "#84cc16",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#eab308"
];

function escapeSvgText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolveGoogleClientId() {
  const fromWindow = String(window.CELLCULTURE_GOOGLE_CLIENT_ID || "").trim();
  if (fromWindow) return fromWindow;
  const meta = document.querySelector('meta[name="google-signin-client_id"]');
  return String(meta?.content || "").trim();
}

function resolveApiBaseUrl() {
  const explicit = String(window.CELLCULTURE_API_BASE || "").trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  return "";
}

function buildApiUrl(path) {
  const cleanPath = String(path || "").startsWith("/") ? String(path || "") : `/${String(path || "")}`;
  const base = resolveApiBaseUrl();
  return base ? `${base}${cleanPath}` : cleanPath;
}

function normalizeUserEmailForBackend(name, email = "") {
  const normalized = String(email || "").trim().toLowerCase();
  if (normalized) return normalized;
  const safe = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return `${safe || "user"}@local.cellculture`;
}

function getCurrentSignedInUserRecord() {
  if (!currentUser) return null;
  loadUsers();
  return users.find((u) => u.name === currentUser) || null;
}

function setApiSession(token, expiresAt = "") {
  apiSessionToken = String(token || "").trim();
  apiSessionExpiresAt = String(expiresAt || "").trim();
  try {
    if (apiSessionToken) localStorage.setItem(API_SESSION_TOKEN_STORAGE_KEY, apiSessionToken);
    else localStorage.removeItem(API_SESSION_TOKEN_STORAGE_KEY);
    if (apiSessionExpiresAt) localStorage.setItem(API_SESSION_EXPIRES_STORAGE_KEY, apiSessionExpiresAt);
    else localStorage.removeItem(API_SESSION_EXPIRES_STORAGE_KEY);
  } catch {
    // ignore storage write failures
  }
}

function clearApiSession() {
  setApiSession("", "");
}

function hasActiveBackendSession() {
  // Offline desktop: the bundled server requires no auth and maps every request
  // to a fixed local user, so a real session token is unnecessary.
  if (!window.__REQUIRE_AUTH) return !!currentUser;
  if (!currentUser || !apiSessionToken) return false;
  if (!apiSessionExpiresAt) return true;
  const expiresMs = new Date(apiSessionExpiresAt).getTime();
  if (!Number.isFinite(expiresMs)) return true;
  return expiresMs > Date.now();
}

function getTauriInvoke() {
  // withGlobalTauri exposes window.__TAURI__.core.invoke in the desktop shell.
  const inv =
    (typeof window !== "undefined" &&
      window.__TAURI__ &&
      window.__TAURI__.core &&
      window.__TAURI__.core.invoke) ||
    null;
  return typeof inv === "function" ? inv : null;
}

// Desktop (Tauri) networking: route every API call through the Rust
// `proxy_request` command, which performs the HTTP request to the bundled
// sidecar from native code (the WebView itself can't reach 127.0.0.1). The
// command returns a {status, body} envelope. Falls back to a plain fetch when
// running outside Tauri (e.g. a browser preview during development).
async function apiFetch(path, options = {}) {
  const init = { ...(options || {}) };
  const skipAuth = !!init.skipAuth;
  const invoke = getTauriInvoke();

  if (invoke) {
    const method = String(init.method || "GET").toUpperCase();
    let body = null;
    if (init.body != null) {
      body = typeof init.body === "string" ? init.body : JSON.stringify(init.body);
    }
    try {
      const envelopeText = await invoke("proxy_request", {
        method,
        path: buildApiUrl(path),
        body,
      });
      let envelope = null;
      try {
        envelope = typeof envelopeText === "string" ? JSON.parse(envelopeText) : envelopeText;
      } catch {
        envelope = null;
      }
      const status = Number(envelope && envelope.status) || 0;
      const rawBody = (envelope && envelope.body) || "";
      let data = null;
      if (typeof rawBody === "string" && rawBody.length) {
        try {
          data = JSON.parse(rawBody);
        } catch {
          data = rawBody;
        }
      }
      const ok = status >= 200 && status < 300;
      if (status === 401 && !skipAuth) clearApiSession();
      return { ok, status, data, response: null };
    } catch (err) {
      // Transport failure (sidecar down / connection refused after retries).
      // Pull the sidecar's own startup/exit error, if any, so the cause is
      // visible instead of a bare "error sending request".
      let detail = String((err && err.message) || err);
      try {
        const se = await invoke("get_sidecar_error");
        if (se) detail += " — local server: " + String(se);
      } catch {
        /* ignore */
      }
      return {
        ok: false,
        status: 0,
        data: { error: detail },
        response: null,
      };
    }
  }

  // --- Browser fallback (no Tauri): original fetch path ---
  const headers = new Headers(init.headers || {});
  if (!skipAuth && apiSessionToken) {
    headers.set("Authorization", `Bearer ${apiSessionToken}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  init.headers = headers;
  if (typeof init.credentials === "undefined") init.credentials = "same-origin";
  const response = await fetch(buildApiUrl(path), init);
  const contentType = String(response.headers.get("content-type") || "").toLowerCase();
  let data = null;
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }
  if (response.status === 401 && !skipAuth) {
    clearApiSession();
  }
  return { ok: response.ok, status: response.status, data, response };
}

function ensureArrayClone(value) {
  if (!Array.isArray(value)) return [];
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return [];
  }
}

function markProjectStateMutatedLocally() {
  localProjectStateRevision += 1;
  localProjectStateDirtySinceHydration = true;
}

function collectProjectStatePayloadForBackend() {
  loadInventory();
  loadStorage();
  loadStorageBoxes();
  loadMediaFormulations();
  return {
    inventory: ensureArrayClone(inventoryItems),
    storage: ensureArrayClone(storageItems),
    storageBoxes: ensureArrayClone(storageBoxes),
    mediaFormulations: ensureArrayClone(mediaFormulations)
  };
}

function applyBackendProjectStateLocally(state) {
  if (!state || typeof state !== "object") return;
  inventoryItems = ensureArrayClone(state.inventory);
  storageItems = ensureArrayClone(state.storage);
  storageBoxes = ensureArrayClone(state.storageBoxes);
  mediaFormulations = ensureArrayClone(state.mediaFormulations);
  localProjectStateDirtySinceHydration = false;
  try {
    localStorage.setItem("inventoryV1", JSON.stringify(inventoryItems));
    localStorage.setItem("storageV1", JSON.stringify(storageItems));
    localStorage.setItem("storageBoxesV1", JSON.stringify(storageBoxes));
    localStorage.setItem("mediaFormulationsV1", JSON.stringify(mediaFormulations));
  } catch {
    // ignore storage sync failures
  }
  refreshStorageLocationOptions();
  refreshComponentSelects();
  renderInventoryList();
  renderStorageList();
  renderStorageBoxList();
  renderMediaFormulationList();
  updateLogPanel();
}

async function pullProjectStateFromBackend(force = false) {
  if (!hasActiveBackendSession()) return;
  const projectId = sanitizeProjectId(activeProjectId);
  if (!force && backendStateHydratedProjectId === projectId) return;
  if (backendStatePullInFlight) return;
  const revisionAtStart = localProjectStateRevision;
  const dirtyAtStart = localProjectStateDirtySinceHydration;
  const initialHydrationPull = force && backendInitialHydrationPending;
  backendStatePullInFlight = true;
  try {
    const result = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}/state`);
    if (!result.ok || !result.data?.state) return;
    if (initialHydrationPull && (dirtyAtStart || localProjectStateDirtySinceHydration)) return;
    if (localProjectStateRevision !== revisionAtStart) return;
    applyBackendProjectStateLocally(result.data.state);
    backendStateHydratedProjectId = projectId;
  } catch {
    // keep local fallback data if network fails
  } finally {
    backendStatePullInFlight = false;
  }
}

async function pushProjectStateToBackend() {
  if (!hasActiveBackendSession()) return;
  if (backendStateSyncInFlight) return;
  const projectId = sanitizeProjectId(activeProjectId);
  if (backendStateHydratedProjectId !== projectId && !localProjectStateDirtySinceHydration) {
    await pullProjectStateFromBackend(true);
  }
  backendStateSyncInFlight = true;
  try {
    const payload = collectProjectStatePayloadForBackend();
    const result = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}/state`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    if (result.ok) {
      backendStateHydratedProjectId = projectId;
      localProjectStateDirtySinceHydration = false;
    }
  } catch {
    // keep local fallback data if network fails
  } finally {
    backendStateSyncInFlight = false;
  }
}

function scheduleProjectStateSync() {
  if (!hasActiveBackendSession()) return;
  if (backendStateSyncTimer) clearTimeout(backendStateSyncTimer);
  backendStateSyncTimer = setTimeout(() => {
    backendStateSyncTimer = null;
    void pushProjectStateToBackend();
  }, 450);
}

async function loadOrCreateCanvas() {
  if (!hasActiveBackendSession()) return;
  try {
    const listResult = await apiFetch("/api/canvases");
    if (!listResult.ok) return;
    const canvases = listResult.data || [];
    if (canvases.length > 0) {
      // Load the first canvas (later Phase 2 adds dashboard selection)
      const first = canvases[0];
      activeCanvasId = first.id;
      const dataResult = await apiFetch(`/api/canvases/${encodeURIComponent(activeCanvasId)}`);
      if (dataResult.ok && dataResult.data?.data) {
        deserializeCanvasState(dataResult.data.data);
        canvasLoadedFromBackend = true;
      }
    } else {
      // Create a new canvas for this user
      const state = serializeCanvasState();
      const createResult = await apiFetch("/api/canvases", {
        method: "POST",
        body: JSON.stringify({ name: `${currentUser || "My"} Project`, data: state })
      });
      if (createResult.ok && createResult.data?.id) {
        activeCanvasId = createResult.data.id;
        canvasLoadedFromBackend = true;
      }
    }
  } catch {
    // Graceful fallback — continue with local state
  }
}

async function saveCanvasToBackend() {
  if (!hasActiveBackendSession() || !activeCanvasId || canvasSyncInFlight) return;
  canvasSyncInFlight = true;
  try {
    const state = serializeCanvasState();
    await apiFetch(`/api/canvases/${encodeURIComponent(activeCanvasId)}`, {
      method: "PUT",
      body: JSON.stringify({ data: state })
    });
  } catch {
    // keep local state as fallback
  } finally {
    canvasSyncInFlight = false;
  }
}

function scheduleCanvasSync() {
  if (!hasActiveBackendSession() || !activeCanvasId) return;
  if (canvasSyncTimer) clearTimeout(canvasSyncTimer);
  canvasSyncTimer = setTimeout(() => {
    canvasSyncTimer = null;
    void saveCanvasToBackend();
  }, 2000);
}

// Let the culture-record editor (culture.js) trigger a debounced canvas save
// after it writes culture fields onto a vessel node's dataset.
window.wlpMarkCanvasDirty = scheduleCanvasSync;
// Jump the timeline to a vessel node + select it (used by the Records grid).
window.wlpFocusNode = function (nodeId) {
  try { focusNodeById(nodeId); } catch (e) { /* ignore */ }
};
window.wlpActiveWorkspace = function () { return activeWorkspaceId; };
window.wlpSetWorkspace = function (id) { try { setActiveWorkspace(id); } catch (e) { /* ignore */ } };

// ── Hash Router ──────────────────────────────────────────────────────
function parseHashRoute() {
  const hash = window.location.hash || "";
  const m = hash.match(/^#\/project\/(.+)$/);
  if (m) return { view: "project", canvasId: decodeURIComponent(m[1]) };
  if (hash === "#/dashboard") return { view: "dashboard", canvasId: null };
  return { view: hasActiveBackendSession() ? "dashboard" : "auth", canvasId: null };
}

function navigateTo(route) {
  if (route.view === "project" && route.canvasId) {
    window.location.hash = `#/project/${encodeURIComponent(route.canvasId)}`;
  } else if (route.view === "dashboard") {
    window.location.hash = "#/dashboard";
  } else {
    window.location.hash = "";
  }
}

function applyRoute(route) {
  currentRoute = route;
  const gate = document.getElementById("authGate");
  const dashboard = document.getElementById("projectDashboard");
  const page = document.querySelector(".page");
  const backBtn = document.getElementById("backToDashboard");
  if (!gate || !page) return;

  if (route.view === "auth") {
    gate.classList.remove("is-hidden");
    if (dashboard) dashboard.classList.add("is-hidden");
    page.style.display = "none";
  } else if (route.view === "dashboard") {
    gate.classList.add("is-hidden");
    if (dashboard) dashboard.classList.remove("is-hidden");
    page.style.display = "none";
    renderDashboard();
  } else if (route.view === "project") {
    gate.classList.add("is-hidden");
    if (dashboard) dashboard.classList.add("is-hidden");
    page.style.display = "";
    if (backBtn) backBtn.style.display = "";
    if (route.canvasId && route.canvasId !== activeCanvasId) {
      void loadCanvasById(route.canvasId);
    }
  }
}

// ── Dashboard ────────────────────────────────────────────────────────
// ── New Project Modal ────────────────────────────────────────────────
function initNewProjectModal() {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop modal-backdrop--center is-hidden";
  backdrop.style.zIndex = "10000";
  backdrop.innerHTML = `
    <div class="modal" style="margin-top:18vh">
      <div class="modal__header"><h3 style="margin:0">New Project</h3></div>
      <div class="modal__body">
        <label style="display:block;margin-bottom:6px;font-size:0.8125rem;color:var(--muted,#94a3b8)">Project name</label>
        <input type="text" class="modal__input" placeholder="My Project" maxlength="120">
        <label style="display:block;margin-bottom:6px;margin-top:14px;font-size:0.8125rem;color:var(--muted,#94a3b8)">Lab <span style="font-weight:400;opacity:0.7">(optional — projects in the same lab share resources)</span></label>
        <input type="text" class="modal__input modal__lab-input" placeholder="e.g. Smith Lab" maxlength="80" list="newProjectLabList">
        <datalist id="newProjectLabList"></datalist>
        <p class="modal__error" style="color:#fca5a5;font-size:0.8125rem;margin:8px 0 0;min-height:1em"></p>
      </div>
      <div class="modal__footer">
        <button type="button" class="modal__cancel">Cancel</button>
        <button type="button" class="btn btn--accent modal__create">Create</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);

  const input = backdrop.querySelector(".modal__input");
  const labInput = backdrop.querySelector(".modal__lab-input");
  const labDatalist = backdrop.querySelector("#newProjectLabList");
  const errorEl = backdrop.querySelector(".modal__error");
  const createBtn = backdrop.querySelector(".modal__create");
  const cancelBtn = backdrop.querySelector(".modal__cancel");

  function generateDefaultName() {
    const existingNames = new Set(dashboardCanvasList.map(c => (c.name || "").toLowerCase()));
    for (let i = 1; ; i++) {
      const candidate = `Project ${i}`;
      if (!existingNames.has(candidate.toLowerCase())) return candidate;
    }
  }

  async function populateLabDatalist() {
    try {
      const res = await apiFetch("/api/labs");
      if (res.ok && Array.isArray(res.data?.labs)) {
        labDatalist.innerHTML = res.data.labs.map(l => `<option value="${escapeHtml(l)}">`).join("");
      }
    } catch { /* ignore */ }
  }

  function open() {
    input.value = generateDefaultName();
    labInput.value = "";
    errorEl.textContent = "";
    backdrop.classList.remove("is-hidden");
    backdrop.style.display = "flex";
    populateLabDatalist();
    setTimeout(() => { input.focus(); input.select(); }, 50);
  }
  function close() {
    backdrop.classList.add("is-hidden");
    backdrop.style.display = "none";
  }

  createBtn.addEventListener("click", async () => {
    const name = input.value.trim();
    if (!name) { errorEl.textContent = "Name is required."; return; }
    const lab = labInput.value.trim();
    errorEl.textContent = "";
    createBtn.disabled = true;
    createBtn.textContent = "Creating...";
    try {
      const result = await apiFetch("/api/canvases", {
        method: "POST",
        body: JSON.stringify({ name, lab, data: {} })
      });
      const created = result.data?.canvas || result.data;
      if (result.ok && created?.id) {
        close();
        navigateTo({ view: "project", canvasId: created.id });
      } else {
        errorEl.textContent = result.data?.error || "Failed to create project.";
      }
    } catch {
      errorEl.textContent = "Network error. Please try again.";
    } finally {
      createBtn.disabled = false;
      createBtn.textContent = "Create";
    }
  });

  cancelBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") labInput.focus(); });
  labInput.addEventListener("keydown", (e) => { if (e.key === "Enter") createBtn.click(); });

  return { open, close };
}

function initDeleteProjectModal() {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop modal-backdrop--center is-hidden";
  backdrop.style.zIndex = "10000";
  backdrop.innerHTML = `
    <div class="modal" style="margin-top:18vh">
      <div class="modal__header"><h3 style="margin:0">Delete Project</h3></div>
      <div class="modal__body">
        <p style="margin:0 0 8px;font-size:0.875rem;color:var(--fg,#e2e8f0)">Are you sure you want to delete <strong class="modal__project-name"></strong>?</p>
        <p style="margin:0;font-size:0.8125rem;color:#fca5a5">This cannot be undone.</p>
      </div>
      <div class="modal__footer">
        <button type="button" class="modal__cancel">Cancel</button>
        <button type="button" class="btn btn--danger modal__confirm-delete">Delete</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);

  const nameEl = backdrop.querySelector(".modal__project-name");
  const deleteBtn = backdrop.querySelector(".modal__confirm-delete");
  const cancelBtn = backdrop.querySelector(".modal__cancel");
  let pendingCanvasId = "";

  function open(name, canvasId) {
    nameEl.textContent = name || "Untitled";
    pendingCanvasId = canvasId;
    backdrop.classList.remove("is-hidden");
    backdrop.style.display = "flex";
    deleteBtn.focus();
  }
  function close() {
    backdrop.classList.add("is-hidden");
    backdrop.style.display = "none";
    pendingCanvasId = "";
  }

  deleteBtn.addEventListener("click", async () => {
    if (!pendingCanvasId) return;
    deleteBtn.disabled = true;
    deleteBtn.textContent = "Deleting...";
    try {
      const result = await apiFetch(`/api/canvases/${encodeURIComponent(pendingCanvasId)}`, { method: "DELETE" });
      if (result.ok) {
        close();
        renderDashboard();
      }
    } catch { /* ignore */ }
    finally {
      deleteBtn.disabled = false;
      deleteBtn.textContent = "Delete";
    }
  });
  cancelBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });

  return { open, close };
}

let dashboardCanvasList = [];
let deleteProjectModal = null;
let shareProjectModal = null;

function initShareProjectModal() {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop modal-backdrop--center is-hidden";
  backdrop.style.zIndex = "10000";
  backdrop.innerHTML = `
    <div class="modal" style="max-width:520px;margin-top:12vh">
      <div class="modal__header" style="display:flex;align-items:center;justify-content:space-between">
        <h3 style="margin:0">Share Project</h3>
        <button type="button" class="share-modal__close" aria-label="Close" style="background:none;border:none;color:var(--muted,#9ca3af);font-size:1.25rem;cursor:pointer;padding:4px">&times;</button>
      </div>
      <div class="modal__body">
        <div class="share-form">
          <input type="email" class="modal__input share-form__email" placeholder="Email address" style="flex:1">
          <select class="share-form__role">
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button type="button" class="btn btn--accent share-form__add">Add</button>
        </div>
        <p class="share-form__error" style="color:#fca5a5;font-size:0.8125rem;margin:6px 0 0;min-height:1em"></p>
        <div class="share-list" style="margin-top:16px;max-height:260px;overflow-y:auto"></div>
      </div>
    </div>`;
  document.body.appendChild(backdrop);

  const emailInput = backdrop.querySelector(".share-form__email");
  const roleSelect = backdrop.querySelector(".share-form__role");
  const addBtn = backdrop.querySelector(".share-form__add");
  const errorEl = backdrop.querySelector(".share-form__error");
  const listEl = backdrop.querySelector(".share-list");
  const closeBtn = backdrop.querySelector(".share-modal__close");
  let currentCanvasIdForShare = "";

  async function loadShares() {
    listEl.innerHTML = '<p style="color:var(--muted);font-size:0.8125rem">Loading...</p>';
    try {
      const res = await apiFetch(`/api/canvases/${encodeURIComponent(currentCanvasIdForShare)}/shares`);
      if (!res.ok) { listEl.innerHTML = '<p style="color:#fca5a5;font-size:0.8125rem">Failed to load shares.</p>'; return; }
      const shares = res.data?.shares || [];
      if (shares.length === 0) {
        listEl.innerHTML = '<p style="color:var(--muted);font-size:0.8125rem">No members yet.</p>';
        return;
      }
      listEl.innerHTML = "";
      shares.forEach(s => {
        const row = document.createElement("div");
        row.className = "share-row";
        const userName = s.user?.name || "Unknown";
        const userEmail = s.user?.email || "";
        row.innerHTML = `
          <div class="share-row__info">
            <span class="share-row__name">${escapeHtml(userName)}</span>
            <span class="share-row__email">${escapeHtml(userEmail)}</span>
          </div>
          <span class="share-row__role share-row__role--${s.role}">${s.role}</span>
          <button class="share-row__remove" title="Remove member" data-share-id="${s.id}">&times;</button>
        `;
        listEl.appendChild(row);
      });
      listEl.querySelectorAll(".share-row__remove").forEach(btn => {
        btn.addEventListener("click", async () => {
          const shareId = btn.dataset.shareId;
          btn.disabled = true;
          try {
            const res = await apiFetch(`/api/canvases/${encodeURIComponent(currentCanvasIdForShare)}/shares/${encodeURIComponent(shareId)}`, { method: "DELETE" });
            if (res.ok) loadShares();
          } catch { /* ignore */ }
          finally { btn.disabled = false; }
        });
      });
    } catch {
      listEl.innerHTML = '<p style="color:#fca5a5;font-size:0.8125rem">Network error.</p>';
    }
  }

  addBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const role = roleSelect.value;
    if (!email) { errorEl.textContent = "Email is required."; return; }
    errorEl.textContent = "";
    addBtn.disabled = true;
    addBtn.textContent = "Adding...";
    try {
      const res = await apiFetch(`/api/canvases/${encodeURIComponent(currentCanvasIdForShare)}/shares`, {
        method: "POST",
        body: JSON.stringify({ email, role })
      });
      if (res.ok) {
        emailInput.value = "";
        loadShares();
      } else {
        errorEl.textContent = res.data?.error || "Failed to add member.";
      }
    } catch {
      errorEl.textContent = "Network error.";
    } finally {
      addBtn.disabled = false;
      addBtn.textContent = "Add";
    }
  });

  emailInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addBtn.click(); });

  function open(canvasId) {
    currentCanvasIdForShare = canvasId;
    emailInput.value = "";
    errorEl.textContent = "";
    backdrop.classList.remove("is-hidden");
    backdrop.style.display = "flex";
    loadShares();
    setTimeout(() => emailInput.focus(), 50);
  }
  function close() {
    backdrop.classList.add("is-hidden");
    backdrop.style.display = "none";
    currentCanvasIdForShare = "";
  }

  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });

  return { open, close };
}

// ── Admin Panel ──────────────────────────────────────────────────────
let adminPanel = null;
let adminActiveTab = "users";

function updateAdminButtonVisibility() {
  const btn = document.getElementById("dashboardAdminBtn");
  if (btn) btn.classList.toggle("is-hidden", !currentUserIsAdmin);
}

function initAdminPanel() {
  if (adminPanel) return adminPanel;
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop admin-panel-backdrop is-hidden";
  backdrop.style.zIndex = "10001";
  backdrop.innerHTML = `
    <div class="admin-panel">
      <div class="admin-panel__header">
        <h2 style="margin:0;font-size:1.25rem;font-weight:600">Admin Panel</h2>
        <button type="button" class="admin-panel__close" aria-label="Close">&times;</button>
      </div>
      <div class="admin-panel__tabs">
        <button class="admin-tab is-active" data-admin-tab="users">Users</button>
        <button class="admin-tab" data-admin-tab="labs">Labs</button>
        <button class="admin-tab" data-admin-tab="projects">Projects</button>
        <button class="admin-tab" data-admin-tab="analytics">Analytics</button>
        <button class="admin-tab" data-admin-tab="audit">Audit Log</button>
      </div>
      <div class="admin-panel__content" id="adminPanelContent"></div>
    </div>`;
  document.body.appendChild(backdrop);

  const contentEl = backdrop.querySelector("#adminPanelContent");
  const closeBtn = backdrop.querySelector(".admin-panel__close");

  backdrop.querySelectorAll("[data-admin-tab]").forEach(tab => {
    tab.addEventListener("click", () => {
      adminActiveTab = tab.dataset.adminTab;
      backdrop.querySelectorAll(".admin-tab").forEach(t => t.classList.toggle("is-active", t === tab));
      renderAdminTab(contentEl);
    });
  });

  closeBtn.addEventListener("click", () => {
    backdrop.classList.add("is-hidden");
    backdrop.style.display = "none";
  });
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) { backdrop.classList.add("is-hidden"); backdrop.style.display = "none"; }
  });

  adminPanel = { backdrop, contentEl };
  return adminPanel;
}

function openAdminPanel() {
  const { backdrop, contentEl } = initAdminPanel();
  backdrop.classList.remove("is-hidden");
  backdrop.style.display = "flex";
  renderAdminTab(contentEl);
}

async function renderAdminTab(contentEl) {
  contentEl.innerHTML = '<p style="color:var(--muted);padding:24px;text-align:center">Loading...</p>';
  try {
    switch (adminActiveTab) {
      case "users": await renderAdminUsers(contentEl); break;
      case "labs": await renderAdminLabs(contentEl); break;
      case "projects": await renderAdminProjects(contentEl); break;
      case "analytics": await renderAdminAnalytics(contentEl); break;
      case "audit": await renderAdminAudit(contentEl); break;
    }
  } catch {
    contentEl.innerHTML = '<p style="color:#fca5a5;padding:24px;text-align:center">Failed to load data.</p>';
  }
}

async function renderAdminUsers(el) {
  const res = await apiFetch("/api/admin/users?limit=200");
  if (!res.ok) { el.innerHTML = '<p style="color:#fca5a5">Error loading users.</p>'; return; }
  const users = res.data?.users || [];
  el.innerHTML = `
    <div class="admin-section">
      <div class="admin-toolbar">
        <span class="admin-count">${users.length} users</span>
      </div>
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Provider</th><th>Admin</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>`;
  const tbody = el.querySelector("tbody");
  users.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.email || "")}</td>
      <td><span class="admin-badge admin-badge--${u.authProvider || 'local'}">${u.authProvider || "local"}</span></td>
      <td>${u.admin ? '<span class="admin-badge admin-badge--admin">admin</span>' : ""}</td>
      <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ""}</td>
      <td>
        <button class="pill-btn" data-admin-toggle-admin="${u.id}" title="${u.admin ? 'Remove admin' : 'Make admin'}">${u.admin ? "Revoke" : "Grant"} Admin</button>
        <button class="pill-btn pill-btn--danger" data-admin-delete-user="${u.id}" title="Delete user">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("[data-admin-toggle-admin]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.adminToggleAdmin;
      const user = users.find(u => u.id === userId);
      if (!user) return;
      btn.disabled = true;
      await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: "PUT", body: JSON.stringify({ admin: !user.admin })
      });
      renderAdminTab(el);
    });
  });
  tbody.querySelectorAll("[data-admin-delete-user]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.adminDeleteUser;
      if (!confirm("Delete this user? This cannot be undone.")) return;
      btn.disabled = true;
      await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}`, { method: "DELETE" });
      renderAdminTab(el);
    });
  });
}

async function renderAdminLabs(el) {
  const res = await apiFetch("/api/admin/labs");
  if (!res.ok) { el.innerHTML = '<p style="color:#fca5a5">Error loading labs.</p>'; return; }
  const labs = res.data?.labs || [];
  el.innerHTML = `
    <div class="admin-section">
      <div class="admin-toolbar">
        <span class="admin-count">${labs.length} labs</span>
      </div>
      <table class="admin-table">
        <thead><tr><th>Lab Name</th><th>Projects</th><th>Actions</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>`;
  const tbody = el.querySelector("tbody");
  labs.forEach(l => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(l.name)}</td>
      <td>${l.projectCount || 0}</td>
      <td>
        <button class="pill-btn" data-admin-rename-lab="${encodeURIComponent(l.name)}">Rename</button>
        <button class="pill-btn pill-btn--danger" data-admin-delete-lab="${encodeURIComponent(l.name)}">Remove</button>
      </td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("[data-admin-rename-lab]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const oldName = decodeURIComponent(btn.dataset.adminRenameLab);
      const newName = prompt("New lab name:", oldName);
      if (!newName || newName === oldName) return;
      btn.disabled = true;
      await apiFetch(`/api/admin/labs/${encodeURIComponent(oldName)}`, {
        method: "PUT", body: JSON.stringify({ name: newName })
      });
      renderAdminTab(el);
    });
  });
  tbody.querySelectorAll("[data-admin-delete-lab]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const labName = decodeURIComponent(btn.dataset.adminDeleteLab);
      if (!confirm(`Remove lab tag "${labName}" from all projects?`)) return;
      btn.disabled = true;
      await apiFetch(`/api/admin/labs/${encodeURIComponent(labName)}`, { method: "DELETE" });
      renderAdminTab(el);
    });
  });
}

async function renderAdminProjects(el) {
  const res = await apiFetch("/api/admin/projects?limit=200");
  if (!res.ok) { el.innerHTML = '<p style="color:#fca5a5">Error loading projects.</p>'; return; }
  const projects = res.data?.projects || [];
  el.innerHTML = `
    <div class="admin-section">
      <div class="admin-toolbar">
        <span class="admin-count">${projects.length} projects</span>
      </div>
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Owner</th><th>Lab</th><th>Shares</th><th>Created</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>`;
  const tbody = el.querySelector("tbody");
  projects.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.ownerName || "")}</td>
      <td>${p.lab ? `<span class="project-card__lab">${escapeHtml(p.lab)}</span>` : ""}</td>
      <td>${p.shareCount || 0}</td>
      <td>${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}</td>`;
    tbody.appendChild(tr);
  });
}

async function renderAdminAnalytics(el) {
  const res = await apiFetch("/api/admin/stats");
  if (!res.ok) { el.innerHTML = '<p style="color:#fca5a5">Error loading stats.</p>'; return; }
  const s = res.data || {};
  el.innerHTML = `
    <div class="admin-stats-grid">
      <div class="admin-stat-card">
        <div class="admin-stat-card__value">${s.totalUsers || 0}</div>
        <div class="admin-stat-card__label">Total Users</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-card__value">${s.totalProjects || 0}</div>
        <div class="admin-stat-card__label">Total Projects</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-card__value">${s.activeSessions || 0}</div>
        <div class="admin-stat-card__label">Active Sessions</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-card__value">${s.totalShares || 0}</div>
        <div class="admin-stat-card__label">Total Shares</div>
      </div>
    </div>`;
}

async function renderAdminAudit(el) {
  const res = await apiFetch("/api/admin/audit?limit=100");
  if (!res.ok) { el.innerHTML = '<p style="color:#fca5a5">Error loading audit log.</p>'; return; }
  const events = res.data?.events || [];
  if (events.length === 0) {
    el.innerHTML = '<p style="color:var(--muted);padding:24px;text-align:center">No audit events yet.</p>';
    return;
  }
  el.innerHTML = `
    <div class="admin-section">
      <table class="admin-table">
        <thead><tr><th>Time</th><th>Action</th><th>Resource</th><th>User</th><th>Details</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>`;
  const tbody = el.querySelector("tbody");
  events.forEach(ev => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="white-space:nowrap">${ev.createdAt ? new Date(ev.createdAt).toLocaleString() : ""}</td>
      <td>${escapeHtml(ev.action)}</td>
      <td>${escapeHtml(ev.resourceType)}${ev.resourceId ? ` <span style="color:var(--muted);font-size:0.75rem">${escapeHtml(ev.resourceId.slice(0,8))}</span>` : ""}</td>
      <td>${escapeHtml(ev.userName || ev.userId || "")}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(JSON.stringify(ev.details || {}))}</td>`;
    tbody.appendChild(tr);
  });
}

async function renderDashboard() {
  const grid = document.getElementById("dashboardProjectGrid");
  const userNameEl = document.getElementById("dashboardUserName");
  if (!grid) return;
  if (userNameEl) userNameEl.textContent = currentUser || "";
  updateAdminButtonVisibility();
  grid.innerHTML = '<p style="color:var(--muted)">Loading projects...</p>';

  try {
    const result = await apiFetch("/api/canvases");
    if (!result.ok) { grid.innerHTML = '<p style="color:#fca5a5">Failed to load projects.</p>'; return; }
    const canvases = (result.data?.canvases || result.data || []);
    dashboardCanvasList = canvases;

    const owned = canvases.filter(c => c.role === "owner");
    const shared = canvases.filter(c => c.role !== "owner");

    grid.innerHTML = "";

    const ownedLabel = document.createElement("div");
    ownedLabel.className = "dashboard__section-label";
    ownedLabel.textContent = "My Projects";
    grid.appendChild(ownedLabel);

    if (owned.length === 0) {
      const msg = document.createElement("p");
      msg.style.cssText = "grid-column:1/-1;color:var(--muted,#94a3b8);font-size:0.8125rem";
      msg.textContent = "No projects yet. Create one to get started!";
      grid.appendChild(msg);
    } else {
      renderProjectCards(grid, owned);
    }

    const sharedLabel = document.createElement("div");
    sharedLabel.className = "dashboard__section-label";
    sharedLabel.textContent = "Shared With Me";
    grid.appendChild(sharedLabel);

    if (shared.length === 0) {
      const msg = document.createElement("p");
      msg.style.cssText = "grid-column:1/-1;color:var(--muted,#94a3b8);font-size:0.8125rem";
      msg.textContent = "None yet.";
      grid.appendChild(msg);
    } else {
      renderProjectCards(grid, shared);
    }
  } catch {
    grid.innerHTML = '<p style="color:#fca5a5">Network error loading projects.</p>';
  }
}

function renderProjectCards(container, canvases) {
  canvases.forEach(canvas => {
    const card = document.createElement("div");
    card.className = "project-card";
    const role = canvas.role || "owner";
    const roleCls = `project-card__role project-card__role--${role}`;
    const deleteBtn = role === "owner"
      ? `<button class="project-card__delete" title="Delete project">&times;</button>`
      : "";
    const shareBtn = role === "owner"
      ? `<button class="project-card__share" title="Share project">
           <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM10 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM4 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" stroke="currentColor" stroke-width="1.3"/><path d="M5.8 7.2l4.4-2.4M5.8 8.8l4.4 2.4" stroke="currentColor" stroke-width="1.3"/></svg>
         </button>`
      : "";
    const labBadge = canvas.lab
      ? `<span class="project-card__lab" title="Lab: ${escapeHtml(canvas.lab)}">${escapeHtml(canvas.lab)}</span>`
      : "";
    card.innerHTML = `
      <div class="project-card__top">
        <div class="project-card__name">${escapeHtml(canvas.name || "Untitled")}</div>
        <div class="project-card__actions">${shareBtn}${deleteBtn}</div>
      </div>
      <div class="project-card__meta">
        <span class="${roleCls}">${role}</span>
        ${labBadge}
        <span>${formatRelativeTime(canvas.updatedAt || canvas.createdAt)}</span>
      </div>`;
    let isEditing = false;
    card.addEventListener("click", () => {
      if (isEditing) return;
      navigateTo({ view: "project", canvasId: canvas.id });
    });

    // Inline rename on double-click (owner only)
    if (role === "owner") {
      const nameEl = card.querySelector(".project-card__name");
      nameEl.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        if (isEditing) return;
        isEditing = true;
        nameEl.setAttribute("contenteditable", "true");
        nameEl.focus();
        const range = document.createRange();
        range.selectNodeContents(nameEl);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });
      const commitRename = async () => {
        if (!isEditing) return;
        isEditing = false;
        nameEl.setAttribute("contenteditable", "false");
        const newName = (nameEl.textContent || "").trim();
        if (!newName || newName === (canvas.name || "Untitled")) return;
        try {
          await apiFetch(`/api/canvases/${encodeURIComponent(canvas.id)}`, {
            method: "PUT",
            body: JSON.stringify({ name: newName })
          });
          canvas.name = newName;
        } catch { nameEl.textContent = canvas.name || "Untitled"; }
      };
      nameEl.addEventListener("blur", commitRename);
      nameEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); nameEl.blur(); }
        if (e.key === "Escape") {
          isEditing = false;
          nameEl.setAttribute("contenteditable", "false");
          nameEl.textContent = canvas.name || "Untitled";
        }
      });
    }

    // Share button (owner only) — opens share modal
    const share = card.querySelector(".project-card__share");
    if (share) {
      share.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!shareProjectModal) shareProjectModal = initShareProjectModal();
        shareProjectModal.open(canvas.id);
      });
    }

    // Delete button (owner only) — opens modal
    const del = card.querySelector(".project-card__delete");
    if (del) {
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteProjectModal.open(canvas.name || "Untitled", canvas.id);
      });
    }
    container.appendChild(card);
  });
}

function formatRelativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  try { return new Date(iso).toLocaleDateString(); } catch { return ""; }
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

async function loadCanvasById(canvasId) {
  if (!hasActiveBackendSession()) return;
  try {
    const result = await apiFetch(`/api/canvases/${encodeURIComponent(canvasId)}`);
    if (!result.ok) {
      navigateTo({ view: "dashboard" });
      return;
    }
    activeCanvasId = canvasId;
    const canvasPayload = result.data?.canvas || result.data;
    const canvasData = canvasPayload?.data;
    deserializeCanvasState(canvasData || {});
    canvasLoadedFromBackend = true;
  } catch {
    navigateTo({ view: "dashboard" });
  }
}

async function ensureBackendSessionForCurrentUser() {
  if (!currentUser) return;
  const record = getCurrentSignedInUserRecord();
  const email = normalizeUserEmailForBackend(currentUser, currentUserEmail || record?.email || "");
  const payload = {
    email,
    name: currentUser,
    googleSub: String(record?.googleSub || "").trim()
  };
  try {
    const result = await apiFetch("/api/auth/google-placeholder", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(payload)
    });
    if (!result.ok || !result.data?.token) return;
    setApiSession(result.data.token, result.data.expiresAt || "");
    if (record && !record.email) {
      record.email = email;
      persistUsers();
    }
    // Fetch admin status from /api/me
    try {
      const meRes = await apiFetch("/api/me");
      if (meRes.ok && meRes.data?.user) {
        currentUserIsAdmin = !!meRes.data.user.admin;
        updateAdminButtonVisibility();
      }
    } catch { /* ignore */ }
    await pullProjectStateFromBackend(true);
    backendInitialHydrationPending = false;
    if (localProjectStateDirtySinceHydration) {
      void pushProjectStateToBackend();
    }
    // Canvas loading now happens via router when user selects a project
  } catch {
    // graceful fallback to local-only behavior
  } finally {
    backendInitialHydrationPending = false;
  }
}

async function signOutBackendSession() {
  if (!apiSessionToken) return;
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch {
    // ignore logout failures
  } finally {
    clearApiSession();
  }
}

function protocolStepLibraryByType(type) {
  const key = String(type || "").trim();
  return PROTOCOL_STEP_LIBRARY.find((entry) => entry.type === key) || null;
}

function createProtocolTemplateId() {
  return `protocol-template-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function createProtocolStepId() {
  return `ps-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function createProtocolLinkId() {
  return `pl-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function nextProtocolLinkOrderLabel(links = []) {
  let maxOrder = 0;
  (Array.isArray(links) ? links : []).forEach((link) => {
    const value = Number.parseInt(String(link?.label || "").trim(), 10);
    if (Number.isFinite(value) && value > maxOrder) maxOrder = value;
  });
  return String(maxOrder + 1);
}

function createProtocolEndpointId(kind, nodeId, groupId = "") {
  const safeKind = String(kind || "").trim() || "end";
  const safeNode = String(nodeId || "").trim();
  const safeGroup = String(groupId || "").trim() || "-";
  return `endpoint:${safeKind}:${safeNode}:${safeGroup}`;
}

function isProtocolEndpointId(id) {
  return String(id || "").startsWith("endpoint:");
}

function getProtocolEndpointLabel(node, groupId = "", role = "end") {
  const base = getNodeDisplayName(node);
  if (!isMultiWellPlateNode(node) || !groupId) {
    return role === "start" ? `Start: ${base}` : base;
  }
  const parsed = readPlateGroups(node, false);
  const group = parsed?.groups?.find((entry) => entry.id === groupId);
  if (!group) return role === "start" ? `Start: ${base}` : base;
  const groupName = getPlateGroupDisplayName(group, 0);
  const wellsText = formatWellSelection(group.wells, 3);
  const suffix = wellsText && wellsText !== "-" ? `${groupName} (${wellsText})` : groupName;
  return role === "start" ? `Start: ${base} • ${suffix}` : `${base} • ${suffix}`;
}

function buildProtocolBuilderEndpoints(connection) {
  const src = connection && typeof connection === "object" ? connection : null;
  if (!src) return [];
  const fromId = String(src.fromId || "").trim();
  if (!fromId) return [];
  const fromGroupId = String(src.fromGroupId || "").trim();
  const fromNode = getNodeById(fromId);
  if (!fromNode) return [];

  const out = [];
  out.push({
    id: createProtocolEndpointId("start", fromId, fromGroupId),
    role: "start",
    nodeId: fromId,
    groupId: fromGroupId,
    iconId: String(fromNode.dataset.iconId || ""),
    label: getProtocolEndpointLabel(fromNode, fromGroupId, "start"),
    x: 26,
    y: 160
  });

  const matchingConnections = connections.filter((entry) => {
    if (!entry || entry.id === src.id) return false;
    if (String(entry.fromId || "") !== fromId) return false;
    return String(entry.fromGroupId || "") === fromGroupId;
  });
  matchingConnections.push(src);

  const endMap = new Map();
  matchingConnections.forEach((entry) => {
    const toId = String(entry?.toId || "").trim();
    if (!toId) return;
    const toGroupId = String(entry?.toGroupId || "").trim();
    const key = `${toId}::${toGroupId}`;
    if (endMap.has(key)) return;
    const node = getNodeById(toId);
    if (!node) return;
    endMap.set(key, {
      id: createProtocolEndpointId("end", toId, toGroupId),
      role: "end",
      nodeId: toId,
      groupId: toGroupId,
      iconId: String(node.dataset.iconId || ""),
      label: getProtocolEndpointLabel(node, toGroupId, "end"),
      x: 0,
      y: 0
    });
  });

  const endList = Array.from(endMap.values());
  endList.sort((a, b) => a.label.localeCompare(b.label));
  out.push(...endList);
  return out;
}

function stripEndpointLinksFromProtocol(data) {
  const src = data && typeof data === "object" ? cloneProtocolData(data) : { name: "Protocol", steps: [], links: [] };
  const links = Array.isArray(src.links) ? src.links : [];
  src.links = links.filter((link) => {
    const fromId = String(link?.fromId || "");
    const toId = String(link?.toId || "");
    return !isProtocolEndpointId(fromId) && !isProtocolEndpointId(toId);
  });
  return src;
}

function getProtocolInventoryOptions() {
  loadInventory();
  const seen = new Set();
  const options = [];
  (Array.isArray(inventoryItems) ? inventoryItems : []).forEach((item) => {
    const name = String(item?.name || "").trim();
    const lot = String(item?.lot || "").trim();
    if (!name) return;
    const value = `${name}|${lot}`;
    if (seen.has(value)) return;
    seen.add(value);
    options.push({
      value,
      label: lot ? `${name} (Lot ${lot})` : name
    });
  });
  return options;
}

function formatProtocolInventoryRef(ref) {
  const value = String(ref || "").trim();
  if (!value) return "";
  const [name = "", lot = ""] = value.split("|");
  const safeName = String(name || "").trim();
  const safeLot = String(lot || "").trim();
  if (!safeName) return "";
  return safeLot ? `${safeName} (Lot ${safeLot})` : safeName;
}

function cloneProtocolData(data) {
  try {
    return JSON.parse(JSON.stringify(data || {}));
  } catch {
    return { name: "Protocol", steps: [], links: [], taskState: {} };
  }
}

function normalizeProtocolStep(step, index = 0) {
  const src = step && typeof step === "object" ? step : {};
  const type = String(src.type || "incubate").trim() || "incubate";
  const lib = protocolStepLibraryByType(type);
  const fallbackTitle = lib?.label || `Step ${index + 1}`;
  const x = Number.isFinite(Number(src.x)) ? Number(src.x) : 60 + index * 180;
  const y = Number.isFinite(Number(src.y)) ? Number(src.y) : 90 + (index % 2) * 80;
  return {
    id: String(src.id || createProtocolStepId()),
    type,
    title: String(src.title || fallbackTitle).trim() || fallbackTitle,
    x: Math.max(12, x),
    y: Math.max(16, y),
    duration: String(src.duration ?? lib?.defaults?.duration ?? ""),
    durationUnit: String(src.durationUnit || lib?.defaults?.durationUnit || "min"),
    temperature: String(src.temperature ?? lib?.defaults?.temperature ?? ""),
    storage: String(src.storage ?? lib?.defaults?.storage ?? ""),
    speed: String(src.speed ?? lib?.defaults?.speed ?? ""),
    speedUnit: String(src.speedUnit || lib?.defaults?.speedUnit || "g"),
    repeats: String(src.repeats ?? lib?.defaults?.repeats ?? ""),
    ratio: String(src.ratio ?? lib?.defaults?.ratio ?? ""),
    volume: String(src.volume ?? lib?.defaults?.volume ?? ""),
    volumeUnit: String(src.volumeUnit || lib?.defaults?.volumeUnit || "mL"),
    inventoryRef: String(src.inventoryRef || lib?.defaults?.inventoryRef || ""),
    location: String(src.location || lib?.defaults?.location || ""),
    description: String(src.description || lib?.defaults?.description || ""),
    notes: String(src.notes || src.description || lib?.defaults?.notes || ""),
    task: src.task !== undefined ? !!src.task : !!lib?.defaults?.task
  };
}

function normalizeProtocolLink(link) {
  const src = link && typeof link === "object" ? link : {};
  const fromId = String(src.fromId || "").trim();
  const toId = String(src.toId || "").trim();
  if (!fromId || !toId || fromId === toId) return null;
  return {
    id: String(src.id || createProtocolLinkId()),
    fromId,
    toId,
    label: String(src.label || "").trim()
  };
}

function normalizeProtocolTaskState(taskState, steps = []) {
  const src = taskState && typeof taskState === "object" ? taskState : {};
  const out = {};
  steps.forEach((step) => {
    if (!step.task) return;
    const prev = src[step.id] && typeof src[step.id] === "object" ? src[step.id] : {};
    out[step.id] = {
      assignee: String(prev.assignee || "").trim(),
      completed: !!prev.completed,
      completedAt: Number.isFinite(Number(prev.completedAt)) ? Number(prev.completedAt) : 0,
      completedBy: String(prev.completedBy || "").trim()
    };
  });
  return out;
}

function normalizeProtocolData(data, fallbackName = "Protocol") {
  const src = data && typeof data === "object" ? data : {};
  const steps = Array.isArray(src.steps) ? src.steps.map((step, idx) => normalizeProtocolStep(step, idx)) : [];
  const stepIdSet = new Set(steps.map((step) => step.id));
  const links = (Array.isArray(src.links) ? src.links : [])
    .map((link) => normalizeProtocolLink(link))
    .filter((link) => {
      if (!link) return false;
      const fromValid = stepIdSet.has(link.fromId) || isProtocolEndpointId(link.fromId);
      const toValid = stepIdSet.has(link.toId) || isProtocolEndpointId(link.toId);
      return fromValid && toValid;
    });
  links.forEach((link, idx) => {
    if (String(link.label || "").trim()) return;
    link.label = String(idx + 1);
  });
  return {
    name: String(src.name || fallbackName || "Protocol").trim() || "Protocol",
    steps,
    links,
    taskState: normalizeProtocolTaskState(src.taskState, steps)
  };
}

function normalizeProtocolTemplateEntry(entry, index = 0) {
  const src = entry && typeof entry === "object" ? entry : {};
  const builtin = !!src.builtin;
  const fallback = DEFAULT_PROTOCOL_TEMPLATES[index] || DEFAULT_PROTOCOL_TEMPLATES[0];
  const name = String(src.name || fallback?.name || `Protocol ${index + 1}`).trim() || `Protocol ${index + 1}`;
  const protocol = normalizeProtocolData(stripEndpointLinksFromProtocol(src.protocol || fallback?.protocol || { name }), name);
  return {
    id: String(src.id || createProtocolTemplateId()),
    name,
    builtin,
    protocol
  };
}

function loadProtocolTemplates() {
  let custom = [];
  try {
    const raw = localStorage.getItem(PROTOCOL_TEMPLATES_STORAGE_KEY);
    custom = raw ? JSON.parse(raw) : [];
  } catch {
    custom = [];
  }
  const builtins = DEFAULT_PROTOCOL_TEMPLATES.map((entry, idx) =>
    normalizeProtocolTemplateEntry({ ...entry, builtin: true }, idx)
  );
  const customTemplates = (Array.isArray(custom) ? custom : [])
    .map((entry, idx) => normalizeProtocolTemplateEntry({ ...entry, builtin: false }, idx))
    .filter((entry) => !builtins.some((base) => base.id === entry.id));
  protocolTemplates = [...builtins, ...customTemplates];
}

function persistProtocolTemplates() {
  const custom = (protocolTemplates || [])
    .filter((entry) => !entry.builtin)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      protocol: normalizeProtocolData(entry.protocol, entry.name)
    }));
  try {
    localStorage.setItem(PROTOCOL_TEMPLATES_STORAGE_KEY, JSON.stringify(custom));
  } catch {
    // ignore storage failures
  }
}

function protocolTemplateById(templateId) {
  const id = String(templateId || "").trim();
  if (!id) return null;
  return protocolTemplates.find((entry) => entry.id === id) || null;
}

function getProtocolTileSvg() {
  return `
    <svg class="lab-icon lab-icon--palette" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="10" width="48" height="44" rx="8" stroke="currentColor" stroke-width="2" fill="none"></rect>
      <path d="M16 22h28M16 30h32M16 38h26" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
      <path d="M43 37l8-5-8-5v10z" fill="currentColor"></path>
    </svg>
  `;
}

function getIconDefinition(id, label) {
  if (id) {
    const byId = ALL_ICONS.find((icon) => icon.id === id);
    if (byId) return byId;
  }
  if (label) {
    const byLabel = ALL_ICONS.find((icon) => icon.label === label);
    if (byLabel) return byLabel;
  }
  return null;
}

function getWorkspaceConfig(workspaceId = activeWorkspaceId) {
  return WORKSPACE_BY_ID[workspaceId] || WORKSPACE_BY_ID[DEFAULT_WORKSPACE_ID];
}

function getWorkspaceTabs(workspaceId = activeWorkspaceId) {
  return getWorkspaceConfig(workspaceId).tabs || [];
}

function getWorkspaceIcons(workspaceId = activeWorkspaceId) {
  return getWorkspaceConfig(workspaceId).icons || [];
}

function getNodeWorkspace(node) {
  if (!node) return DEFAULT_WORKSPACE_ID;
  const raw = String(node.dataset.workspace || "").trim();
  if (raw && WORKSPACE_BY_ID[raw]) return raw;
  return DEFAULT_WORKSPACE_ID;
}

function isNodeInActiveWorkspace(node) {
  return getNodeWorkspace(node) === activeWorkspaceId;
}

function applyWorkspaceVisibility() {
  canvas.querySelectorAll(".drop").forEach((node) => {
    const isAnimalHousingNode = getNodeWorkspace(node) === "animal-work" && (isCageNode(node) || isAnimalNode(node));
    const visible = isNodeInActiveWorkspace(node) && !isAnimalHousingNode;
    node.classList.toggle("is-workspace-hidden", !visible);
    if (visible && isCageNode(node) && getNodeWorkspace(node) === "animal-work") {
      ensureCageNodeSize(node);
    }
  });
}

function buildWorkspaceTabs() {
  if (!workspaceTabsEl) return;
  workspaceTabsEl.innerHTML = "";
  WORKSPACES.forEach((workspace) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "workspace-tab";
    btn.textContent = workspace.label;
    btn.dataset.workspaceId = workspace.id;
    btn.setAttribute("role", "tab");
    btn.addEventListener("click", () => setActiveWorkspace(workspace.id));
    workspaceTabsEl.appendChild(btn);
  });
}

function updateWorkspaceTabsUI() {
  if (!workspaceTabsEl) return;
  workspaceTabsEl.querySelectorAll(".workspace-tab").forEach((btn) => {
    const workspaceId = String(btn.dataset.workspaceId || "");
    const isActive = workspaceId === activeWorkspaceId;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

function updateWorkspaceSidebarPanels() {
  const isPlanning = activeWorkspaceId === "planning";
  const isAnimal = activeWorkspaceId === "animal-work";
  planningTaskPanel?.classList.toggle("is-hidden", !isPlanning);
  animalHousingPanel?.classList.toggle("is-hidden", !isAnimal);
  animalTransferPanel?.classList.toggle("is-hidden", !isAnimal);
  if (isPlanning) renderPlanningTaskPanel();
  if (isAnimal) {
    renderAnimalHousingPanel();
    renderAnimalTransferPanel();
  }
}

function setActiveWorkspace(workspaceId) {
  const next = getWorkspaceConfig(workspaceId).id;
  if (next === activeWorkspaceId) return;
  activeWorkspaceId = next;
  activePaletteTab = paletteTabByWorkspace[next] || getWorkspaceTabs(next)[0]?.id || "";
  hideNodeMenu();
  clearSelection();
  clearPendingLink();
  applyWorkspaceVisibility();
  updateWorkspaceTabsUI();
  updateWorkspaceSidebarPanels();
  buildPalette();
  toggleHint();
  updateAllConnections();
  updateTaskAlerts();
  updateLogPanel();
  renderAnimalHousingPanel();
  renderGlobalMilestones();
}

function iconMarkNumber(mark) {
  const m = String(mark || "").match(/\d+/);
  return m ? parseInt(m[0], 10) : NaN;
}

function flaskBodyLength(mark) {
  const n = iconMarkNumber(mark);
  if (!Number.isFinite(n)) return 30;
  if (n <= 25) return 24;
  if (n <= 75) return 28;
  if (n <= 150) return 32;
  if (n <= 175) return 34;
  if (n <= 225) return 37;
  return 40;
}

function plateGridSpec(mark) {
  const n = iconMarkNumber(mark);
  if (n === 6) return { rows: 2, cols: 3, r: 2.5 };
  if (n === 12) return { rows: 3, cols: 4, r: 1.9 };
  if (n === 24) return { rows: 4, cols: 6, r: 1.4 };
  if (n === 48) return { rows: 6, cols: 8, r: 1.0 };
  if (n === 96) return { rows: 8, cols: 12, r: 0.72 };
  if (n === 384) return { rows: 16, cols: 24, r: 0.5 };
  if (n === 1536) return { rows: 32, cols: 48, r: 0.22 };
  return { rows: 4, cols: 6, r: 1.3 };
}

function getPlateWellCount(iconId) {
  const match = String(iconId || "").match(/^plate_(\d+)$/);
  if (!match) return null;
  const count = parseInt(match[1], 10);
  return Number.isFinite(count) && count > 0 ? count : null;
}

function getPlateWellIds(count) {
  if (!Number.isFinite(count) || count <= 0) return [];
  const spec = plateGridSpec(`${count}`);
  const ids = [];
  const rows = Math.max(1, spec.rows);
  const cols = Math.max(1, spec.cols);
  const rowLabel = (index) => {
    let n = index + 1;
    let out = "";
    while (n > 0) {
      const rem = (n - 1) % 26;
      out = String.fromCharCode(65 + rem) + out;
      n = Math.floor((n - 1) / 26);
    }
    return out;
  };
  for (let r = 0; r < rows; r++) {
    const row = rowLabel(r);
    for (let c = 1; c <= cols; c++) {
      ids.push(`${row}${c}`);
      if (ids.length >= count) return ids;
    }
  }
  return ids;
}

function parseWellId(wellId) {
  const m = String(wellId || "").toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!m) return { row: 999, col: 999, text: String(wellId || "") };
  let row = 0;
  for (let i = 0; i < m[1].length; i++) {
    row = row * 26 + (m[1].charCodeAt(i) - 64);
  }
  return { row, col: parseInt(m[2], 10) || 0, text: `${m[1]}${m[2]}` };
}

function normalizeWellSelection(wells) {
  const dedup = Array.from(new Set((wells || []).map((w) => parseWellId(w).text)));
  dedup.sort((a, b) => {
    const pa = parseWellId(a);
    const pb = parseWellId(b);
    if (pa.row !== pb.row) return pa.row - pb.row;
    return pa.col - pb.col;
  });
  return dedup;
}

function wellSelectionKey(wells) {
  return normalizeWellSelection(wells).join("|");
}

function formatWellSelection(wells, maxVisible = 4) {
  const list = normalizeWellSelection(wells);
  if (!list.length) return "-";
  if (list.length <= maxVisible) return list.join(", ");
  return `${list.slice(0, maxVisible).join(", ")} +${list.length - maxVisible}`;
}

function isMultiWellPlateIconId(iconId) {
  const count = getPlateWellCount(iconId);
  return Number.isFinite(count) && count > 1 && count <= PLATE_MULTI_WELL_MAX;
}

function isMultiWellPlateNode(node) {
  if (!node) return false;
  return isMultiWellPlateIconId(node.dataset.iconId);
}

function isVesselOrDishNode(node) {
  if (!node) return false;
  const iconId = String(node.dataset.iconId || "");
  return iconId.endsWith("_flask") || iconId.startsWith("dish_");
}

function isCageNode(node) {
  if (!node) return false;
  const icon = getIconDefinition(node.dataset.iconId, "");
  return icon?.iconKind === "cage";
}

function isAnimalNode(node) {
  if (!node) return false;
  const icon = getIconDefinition(node.dataset.iconId, "");
  return icon?.iconKind === "animal";
}

function isPlanningTaskNode(node) {
  if (!node) return false;
  const icon = getIconDefinition(node.dataset.iconId, "");
  return icon?.iconKind === "planning-task";
}

function getAnimalSpeciesForIconId(iconId) {
  const icon = getIconDefinition(iconId, "");
  const species = String(icon?.animalType || "").trim().toLowerCase();
  if (species) return species;
  const legacyId = String(iconId || "").trim();
  if (legacyId === "animal_mouse") return "mouse";
  if (legacyId === "animal_rat") return "rat";
  if (legacyId === "animal_rabbit") return "rabbit";
  if (legacyId === "animal_guinea_pig") return "guinea_pig";
  return "";
}

function getCageSpeciesForIconId(iconId) {
  const icon = getIconDefinition(iconId, "");
  const species = String(icon?.cageType || "").trim().toLowerCase();
  if (species) return species;
  const legacyId = String(iconId || "").trim();
  if (legacyId === "cage_standard") return "mouse";
  if (legacyId === "cage_breeding") return "rat";
  return "";
}

function getAnimalSpeciesForNode(node) {
  if (!node) return "";
  const fromData = String(node.dataset.animalSpecies || "").trim().toLowerCase();
  if (fromData) return fromData;
  return getAnimalSpeciesForIconId(node.dataset.iconId);
}

function getCageSpeciesForNode(node) {
  if (!node) return "";
  const fromData = String(node.dataset.cageSpecies || "").trim().toLowerCase();
  if (fromData) return fromData;
  return getCageSpeciesForIconId(node.dataset.iconId);
}

function getCageSpeciesLabel(speciesKey) {
  const key = String(speciesKey || "").trim().toLowerCase();
  if (!key) return "Cage";
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getDefaultCageCapacityForSpecies(speciesKey) {
  const key = String(speciesKey || "").trim().toLowerCase();
  const raw = Number(animalCageCapacityDefaults[key]);
  if (Number.isFinite(raw) && raw > 0) return Math.round(raw);
  return 1;
}

function getCageCapacity(node) {
  if (!node || !isCageNode(node)) return 0;
  const fromData = Number(node.dataset.cageCapacity);
  if (Number.isFinite(fromData) && fromData > 0) return Math.round(fromData);
  const species = getCageSpeciesForNode(node);
  return getDefaultCageCapacityForSpecies(species);
}

function createAnimalHousingId(prefix = "ah") {
  const seed = Math.floor(Math.random() * 1e6).toString(36);
  return `${prefix}-${Date.now().toString(36)}-${seed}`;
}

function parseAnimalProjectsInput(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .filter((item, index, arr) => arr.indexOf(item) === index);
  }
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, arr) => arr.indexOf(item) === index);
}

function serializeAnimalProjects(projects) {
  return parseAnimalProjectsInput(projects).join(", ");
}

function findAnimalHousingCageById(cageId) {
  const targetId = String(cageId || "");
  return animalHousingState.cages.find((entry) => String(entry.id || "") === targetId) || null;
}

function findAnimalHousingAnimalById(animalId) {
  const targetId = String(animalId || "");
  return animalHousingState.animals.find((entry) => String(entry.id || "") === targetId) || null;
}

function getAnimalsInHousingCage(cageId) {
  const targetId = String(cageId || "");
  if (!targetId) return [];
  return animalHousingState.animals.filter((entry) => String(entry.cageId || "") === targetId);
}

function getAllAnimalProjectNames() {
  const names = new Set();
  animalHousingState.animals.forEach((animal) => {
    parseAnimalProjectsInput(animal.projects).forEach((name) => names.add(name));
  });
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

function normalizeAnimalHousingState(state) {
  const src = state && typeof state === "object" ? state : {};
  const cages = Array.isArray(src.cages) ? src.cages : [];
  const animals = Array.isArray(src.animals) ? src.animals : [];
  return {
    cages: cages.map((entry, index) => {
      const species = String(entry?.species || "").trim().toLowerCase();
      const resolvedSpecies = species || "mouse";
      const fallbackName = `${getCageSpeciesLabel(resolvedSpecies)} Cage ${index + 1}`;
      const rawCapacity = Number(entry?.capacity);
      const defaultCapacity = getDefaultCageCapacityForSpecies(resolvedSpecies);
      return {
        id: String(entry?.id || createAnimalHousingId("cage")),
        name: String(entry?.name || "").trim() || fallbackName,
        species: resolvedSpecies,
        capacity: Number.isFinite(rawCapacity) && rawCapacity > 0 ? Math.round(rawCapacity) : defaultCapacity,
        x: Number.isFinite(Number(entry?.x)) ? Math.round(Number(entry.x)) : 24 + (index % 2) * 262,
        y: Number.isFinite(Number(entry?.y)) ? Math.round(Number(entry.y)) : 24 + Math.floor(index / 2) * 204
      };
    }),
    animals: animals.map((entry, index) => {
      const species = String(entry?.species || "").trim().toLowerCase();
      const resolvedSpecies = species || "mouse";
      const projects = parseAnimalProjectsInput(entry?.projects);
      const fallbackName = `${getCageSpeciesLabel(resolvedSpecies)} ${index + 1}`;
      return {
        id: String(entry?.id || createAnimalHousingId("animal")),
        name: String(entry?.name || "").trim() || fallbackName,
        animalId: String(entry?.animalId || "").trim(),
        species: resolvedSpecies,
        cageId: String(entry?.cageId || "").trim(),
        birthIso: String(entry?.birthIso || "").trim(),
        sex: (() => {
          const sex = String(entry?.sex || "unknown").trim().toLowerCase();
          return sex === "male" || sex === "female" ? sex : "unknown";
        })(),
        projects
      };
    })
  };
}

function loadAnimalHousingState() {
  const key = `${ANIMAL_HOUSING_STORAGE_KEY}:${sanitizeProjectId(activeProjectId)}`;
  try {
    const raw = localStorage.getItem(key) || localStorage.getItem(ANIMAL_HOUSING_STORAGE_KEY);
    if (!raw) {
      animalHousingState = { cages: [], animals: [] };
      return;
    }
    const parsed = JSON.parse(raw);
    animalHousingState = normalizeAnimalHousingState(parsed);
  } catch {
    animalHousingState = { cages: [], animals: [] };
  }
}

function persistAnimalHousingState() {
  const key = `${ANIMAL_HOUSING_STORAGE_KEY}:${sanitizeProjectId(activeProjectId)}`;
  try {
    localStorage.setItem(key, JSON.stringify(animalHousingState));
  } catch {
    // ignore storage persistence failures
  }
}

function isAnimalNameTaken(name, excludeAnimalId = "") {
  const wanted = String(name || "").trim().toLowerCase();
  const excludeId = String(excludeAnimalId || "");
  if (!wanted) return false;
  return animalHousingState.animals.some((animal) => {
    if (excludeId && String(animal.id || "") === excludeId) return false;
    return String(animal.name || "").trim().toLowerCase() === wanted;
  });
}

function generateUniqueAnimalName(speciesKey = "animal", excludeAnimalId = "") {
  const base = getCageSpeciesLabel(speciesKey) || "Animal";
  let index = 1;
  let nextName = `${base} ${index}`;
  while (isAnimalNameTaken(nextName, excludeAnimalId)) {
    index += 1;
    nextName = `${base} ${index}`;
  }
  return nextName;
}

function animalAgeDays(animal, nowMs = Date.now()) {
  const birthIso = String(animal?.birthIso || "").trim();
  if (!birthIso) return null;
  const birthMs = new Date(birthIso).getTime();
  if (!Number.isFinite(birthMs)) return null;
  const delta = nowMs - birthMs;
  if (!Number.isFinite(delta)) return null;
  return Math.max(0, Math.floor(delta / DAY_MS));
}

function getAnimalsInCage(cageNode, excludeNodeId = "") {
  if (!cageNode) return [];
  const cageId = String(cageNode.dataset.nodeId || "");
  if (!cageId) return [];
  const workspaceId = getNodeWorkspace(cageNode);
  const excludeId = String(excludeNodeId || "");
  return Array.from(canvas.querySelectorAll(".drop")).filter((node) => {
    if (!isAnimalNode(node)) return false;
    if (getNodeWorkspace(node) !== workspaceId) return false;
    if (excludeId && String(node.dataset.nodeId || "") === excludeId) return false;
    return String(node.dataset.cageId || "") === cageId;
  });
}

function isPointInsideNode(node, x, y) {
  if (!node) return false;
  const left = parseFloat(node.style.left) || 0;
  const top = parseFloat(node.style.top) || 0;
  const width = parseFloat(node.style.width) || node.offsetWidth || MIN_NODE_WIDTH;
  const height = parseFloat(node.style.height) || node.offsetHeight || MIN_NODE_WIDTH;
  return x >= left && x <= left + width && y >= top && y <= top + height;
}

function findCageAtCanvasPoint(x, y, workspaceId = activeWorkspaceId) {
  return Array.from(canvas.querySelectorAll(".drop")).find((node) => {
    if (!isCageNode(node)) return false;
    if (getNodeWorkspace(node) !== workspaceId) return false;
    return isPointInsideNode(node, x, y);
  }) || null;
}

function validateAnimalPlacementInCage(animalSpecies, cageNode, excludeAnimalNodeId = "") {
  const species = String(animalSpecies || "").trim().toLowerCase();
  if (!species || !cageNode || !isCageNode(cageNode)) {
    return { ok: false, message: "Drop the animal into a matching cage." };
  }
  const cageSpecies = getCageSpeciesForNode(cageNode);
  if (!cageSpecies || cageSpecies !== species) {
    return {
      ok: false,
      message: `${getCageSpeciesLabel(species)} can only be placed in ${getCageSpeciesLabel(species)} cages.`
    };
  }
  const currentOccupancy = getAnimalsInCage(cageNode, excludeAnimalNodeId).length;
  const capacity = getCageCapacity(cageNode);
  if (currentOccupancy >= capacity) {
    return {
      ok: false,
      message: `${getNodeLabelText(cageNode)} is full (${capacity} max).`
    };
  }
  return { ok: true, message: "" };
}

function escapeCssAttrValue(value) {
  const raw = String(value ?? "");
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(raw);
  }
  return raw.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function setTaskProgressHover(node, taskKey, active) {
  if (!node || !taskKey) return;
  const safeKey = escapeCssAttrValue(taskKey);
  node
    .querySelectorAll(`.progress-task-link[data-task-key="${safeKey}"]`)
    .forEach((el) => el.classList.toggle("is-hover", !!active));
}

function isRecurUntilStep(step) {
  if (!step || typeof step !== "object") return false;
  return !!(step.recurUntil || step.until);
}

function getStepIntervalHours(step, fallback = 24) {
  const raw = parseFloat(step?.duration);
  if (Number.isFinite(raw) && raw > 0) return raw;
  if (isRecurUntilStep(step)) return fallback;
  return 0;
}

function getStepDurationHours(step, fallback = 24) {
  const interval = getStepIntervalHours(step, fallback);
  if (!(interval > 0)) return 0;
  const pad = parseFloat(step?.schedulePadHours);
  if (Number.isFinite(pad) && pad > 0) return interval + pad;
  return interval;
}

function normalizeRecurringTaskEntry(entry, index = 0) {
  if (!entry || typeof entry !== "object") return null;
  const key = String(entry.key || "").trim();
  if (!key) return null;
  const rawHour = Number(entry.hour);
  const hour = Number.isFinite(rawHour) ? Math.max(0, rawHour) : 0;
  const mediaType = String(entry?.recurrenceConfig?.mediaType || entry.mediaType || "Media").trim() || "Media";
  const rawInterval = Number(entry?.recurrenceConfig?.intervalHours ?? entry.intervalHours);
  const intervalHours = Number.isFinite(rawInterval) && rawInterval > 0 ? rawInterval : 24;
  const endPoint = String(entry?.recurrenceConfig?.endPoint || entry.endPoint || "custom end point").trim() || "custom end point";
  const label = String(entry.label || "").trim() || `${mediaType} every ${intervalHours}h until ${endPoint}`;
  const baseLabel = String(entry.baseLabel || "").trim() || label;
  return {
    key,
    hour,
    type: "media-recur",
    label,
    baseLabel,
    recurrenceConfig: {
      enabled: true,
      mediaType,
      intervalHours,
      endPoint
    },
    sourceType: "generated-recur",
    recurSequence: Number(entry.recurSequence ?? index + 1) || index + 1
  };
}

function sanitizeRecurringTasks(entries) {
  const src = Array.isArray(entries) ? entries : [];
  return src
    .map((entry, index) => normalizeRecurringTaskEntry(entry, index))
    .filter(Boolean)
    .sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.key.localeCompare(b.key);
    });
}

function readNodeRecurringTasks(node) {
  let parsed = [];
  try {
    parsed = node?.dataset?.taskRecurringTasks ? JSON.parse(node.dataset.taskRecurringTasks) : [];
  } catch {
    parsed = [];
  }
  return sanitizeRecurringTasks(parsed);
}

function writeNodeRecurringTasks(node, entries) {
  if (!node) return;
  node.dataset.taskRecurringTasks = JSON.stringify(sanitizeRecurringTasks(entries));
}

function readNodeTaskPlans(node) {
  let plan = [];
  let adds = [];
  let rems = [];
  let recurring = [];
  try {
    plan = node?.dataset?.mediaPlan ? JSON.parse(node.dataset.mediaPlan) : [];
    adds = node?.dataset?.additivesPlan ? JSON.parse(node.dataset.additivesPlan) : [];
    rems = node?.dataset?.removalsPlan ? JSON.parse(node.dataset.removalsPlan) : [];
    recurring = node?.dataset?.taskRecurringTasks ? JSON.parse(node.dataset.taskRecurringTasks) : [];
  } catch {
    plan = [];
    adds = [];
    rems = [];
    recurring = [];
  }
  return {
    plan: Array.isArray(plan) ? plan : [],
    adds: Array.isArray(adds) ? adds : [],
    rems: Array.isArray(rems) ? rems : [],
    recurringTasks: sanitizeRecurringTasks(recurring)
  };
}

function buildTasksForNode(node) {
  const { plan, adds, rems, recurringTasks } = readNodeTaskPlans(node);
  return buildTasks(plan, adds, rems, recurringTasks);
}

function setVesselDishOverdueState(node, tasks = [], statusMap = {}) {
  if (!node) return;
  if (!isVesselOrDishNode(node)) {
    node.classList.remove("drop--overdue-alert");
    return;
  }
  const overdue = (tasks || []).some((task) => !statusMap?.[task.key] && isTaskOverdue(node, task));
  node.classList.toggle("drop--overdue-alert", overdue);
}

function toggleVesselDishTaskStrip(node) {
  if (!isVesselOrDishNode(node)) return;
  const tasks = buildTasksForNode(node);
  if (!tasks.length) {
    delete node.dataset.nodeTaskCollapsed;
    setVesselDishOverdueState(node, [], {});
    return;
  }
  if (node.dataset.nodeTaskCollapsed === "1") {
    delete node.dataset.nodeTaskCollapsed;
  } else {
    node.dataset.nodeTaskCollapsed = "1";
  }
  renderNodeTasks(node);
}

function getNodeLabelText(node) {
  if (!node) return "Unnamed";
  const text = String(node.querySelector(".node-label")?.value || "").trim();
  return text || "Unnamed";
}

function findContainingCageForAnimal(animalNode) {
  if (!animalNode) return null;
  const left = parseFloat(animalNode.style.left) || 0;
  const top = parseFloat(animalNode.style.top) || 0;
  const width = parseFloat(animalNode.style.width) || animalNode.offsetWidth || ANIMAL_NODE_MIN_WIDTH;
  const height = parseFloat(animalNode.style.height) || animalNode.offsetHeight || ANIMAL_NODE_HEIGHT;
  const centerX = left + width / 2;
  const centerY = top + height / 2;
  return findCageAtCanvasPoint(centerX, centerY, getNodeWorkspace(animalNode));
}

function settleAnimalsInCage(cageNode) {
  if (!cageNode || !isCageNode(cageNode)) return;
  const animals = getAnimalsInCage(cageNode).sort((a, b) =>
    String(a.dataset.nodeId || "").localeCompare(String(b.dataset.nodeId || ""))
  );
  const capacity = Math.max(1, getCageCapacity(cageNode));
  const cols = Math.max(2, Math.min(4, Math.ceil(Math.sqrt(capacity))));
  const left = parseFloat(cageNode.style.left) || 0;
  const top = parseFloat(cageNode.style.top) || 0;
  const width = parseFloat(cageNode.style.width) || CAGE_NODE_MIN_WIDTH;
  const height = parseFloat(cageNode.style.height) || CAGE_NODE_HEIGHT;
  const innerPadX = 8;
  const innerPadY = 8;
  const usableWidth = Math.max(24, width - innerPadX * 2);
  const usableHeight = Math.max(24, height - innerPadY * 2);
  const rows = Math.max(1, Math.ceil(animals.length / cols));
  // Keep each animal fully inside cage bounds: compute slot positions for top-left coordinates.
  const animalSize = Math.max(
    ANIMAL_NODE_MIN_WIDTH,
    Math.round(Math.min(ANIMAL_NODE_HEIGHT, width * 0.32, height * 0.46))
  );
  const minX = left + innerPadX;
  const maxX = left + width - innerPadX - animalSize;
  const minY = top + innerPadY;
  const maxY = top + height - innerPadY - animalSize;
  const stepX = cols > 1 ? Math.max(0, (maxX - minX) / (cols - 1)) : 0;
  const stepY = rows > 1 ? Math.max(0, (maxY - minY) / (rows - 1)) : 0;

  animals.forEach((animalNode, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const targetX = minX + col * stepX;
    const targetY = minY + row * stepY;
    animalNode.style.width = `${animalSize}px`;
    animalNode.style.height = `${animalSize}px`;
    animalNode.style.left = `${Math.round(targetX)}px`;
    animalNode.style.top = `${Math.round(targetY)}px`;
  });
}

function settleAnimalNodeInCage(animalNode, cageNode) {
  if (!animalNode || !cageNode) return;
  animalNode.dataset.cageId = String(cageNode.dataset.nodeId || "");
  settleAnimalsInCage(cageNode);
}

function logAnimalTransfer(animalNode, fromCageNode, toCageNode) {
  const fromId = String(fromCageNode?.dataset?.nodeId || "");
  const toId = String(toCageNode?.dataset?.nodeId || "");
  if (fromId === toId) return;
  animalTransferLog.push({
    id: `atr-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    workspaceId: activeWorkspaceId,
    animalNodeId: String(animalNode?.dataset?.nodeId || ""),
    animalName: getNodeLabelText(animalNode),
    fromCageId: fromId,
    toCageId: toId,
    fromCageName: getNodeLabelText(fromCageNode),
    toCageName: getNodeLabelText(toCageNode),
    timeMs: Date.now()
  });
  renderAnimalTransferPanel();
  updateLogPanel();
}

function handleAnimalTransferAfterMove(animalNode) {
  if (!animalNode || activeWorkspaceId !== "animal-work" || !isAnimalNode(animalNode)) return;
  const previousCageId = String(animalNode.dataset.cageId || "");
  const previousCageNode = previousCageId ? getNodeById(previousCageId) : null;
  const species = getAnimalSpeciesForNode(animalNode);
  const animalId = String(animalNode.dataset.nodeId || "");
  const targetCage = findContainingCageForAnimal(animalNode);
  const nextCageId = String(targetCage?.dataset?.nodeId || "");

  if (nextCageId) {
    const validation = validateAnimalPlacementInCage(species, targetCage, animalId);
    if (validation.ok) {
      animalNode.dataset.cageId = nextCageId;
      settleAnimalNodeInCage(animalNode, targetCage);
      if (previousCageNode && previousCageId && previousCageId !== nextCageId) {
        settleAnimalsInCage(previousCageNode);
      }
    } else if (previousCageNode) {
      animalNode.dataset.cageId = previousCageId;
      settleAnimalNodeInCage(animalNode, previousCageNode);
      if (validation.message) showTaskToast(validation.message);
    } else {
      delete animalNode.dataset.cageId;
      if (validation.message) showTaskToast(validation.message);
    }
  } else if (previousCageNode) {
    animalNode.dataset.cageId = previousCageId;
    settleAnimalNodeInCage(animalNode, previousCageNode);
    showTaskToast("Animals must remain inside a matching cage.");
  } else {
    delete animalNode.dataset.cageId;
    showTaskToast("Drop the animal into a matching cage.");
  }
  if (previousCageId !== nextCageId) {
    const effectiveCage = animalNode.dataset.cageId ? getNodeById(animalNode.dataset.cageId) : null;
    logAnimalTransfer(animalNode, previousCageNode, effectiveCage);
  }
}

function renderPlanningTaskPanel() {
  if (!planningTaskList) return;
  planningTaskList.innerHTML = "";
  if (activeWorkspaceId !== "planning") return;
  const dependencyState = buildPlanningDependencyState();
  const tasks = Array.from(canvas.querySelectorAll(".drop"))
    .filter((node) => isNodeInActiveWorkspace(node) && isPlanningTaskNode(node))
    .map((node) => {
      const nodeId = String(node.dataset.nodeId || "");
      const absStart = Number(node.dataset.absDay || 0) || 0;
      const startDay = Number(node.dataset.startDay || node.dataset.dayIndex || 0) || 0;
      const spanDaysRaw = Number(node.dataset.spanDays || 1);
      const spanDays = Number.isFinite(spanDaysRaw) && spanDaysRaw > 0 ? spanDaysRaw : 1;
      const endAbs = absStart + spanDays;
      const startDate = new Date(absStart * DAY_MS);
      const endDate = new Date(endAbs * DAY_MS);
      const startIso = splitDateTime(startDate).dateStr;
      const endIso = splitDateTime(endDate).dateStr;
      const durationDays = Math.round(spanDays * 10) / 10;
      const inCount = dependencyState.inboundCountByNodeId.get(nodeId) || 0;
      const outCount = dependencyState.outboundCountByNodeId.get(nodeId) || 0;
      const depColor = dependencyState.nodeColorById.get(nodeId) || "";
      const order = Number(dependencyState.orderByNodeId.get(nodeId));
      const isComplete = node.dataset.planningComplete === "1";
      return {
        nodeId,
        name: getNodeLabelText(node),
        startDay,
        endDay: startDay + spanDays,
        startIso,
        endIso,
        durationDays,
        inCount,
        outCount,
        depColor,
        order,
        isComplete
      };
    })
    .sort((a, b) => {
      const orderDelta = (Number.isFinite(a.order) ? a.order : Number.MAX_SAFE_INTEGER)
        - (Number.isFinite(b.order) ? b.order : Number.MAX_SAFE_INTEGER);
      if (orderDelta !== 0) return orderDelta;
      return a.startDay - b.startDay;
    });
  if (!tasks.length) {
    const li = document.createElement("li");
    li.textContent = "No planning tasks yet.";
    planningTaskList.appendChild(li);
    return;
  }
  const taskById = new Map(tasks.map((task) => [task.nodeId, task]));
  const parentById = new Map();
  const childrenById = new Map();
  tasks.forEach((task) => {
    childrenById.set(task.nodeId, []);
  });
  tasks.forEach((task) => {
    const inbound = Array.from(dependencyState.inboundByNodeId.get(task.nodeId) || [])
      .filter((parentId) => taskById.has(parentId));
    if (!inbound.length) {
      parentById.set(task.nodeId, "");
      return;
    }
    inbound.sort((aId, bId) => {
      const aDepth = dependencyState.depthByNodeId.get(aId) || 0;
      const bDepth = dependencyState.depthByNodeId.get(bId) || 0;
      if (aDepth !== bDepth) return bDepth - aDepth;
      const aOrder = dependencyState.orderByNodeId.get(aId) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = dependencyState.orderByNodeId.get(bId) ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return aId.localeCompare(bId);
    });
    const parentId = inbound[0];
    parentById.set(task.nodeId, parentId);
    childrenById.get(parentId)?.push(task.nodeId);
  });
  childrenById.forEach((children) => {
    children.sort((aId, bId) => {
      const aOrder = dependencyState.orderByNodeId.get(aId) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = dependencyState.orderByNodeId.get(bId) ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      const aTask = taskById.get(aId);
      const bTask = taskById.get(bId);
      return (aTask?.startDay || 0) - (bTask?.startDay || 0);
    });
  });
  const rootIds = tasks
    .map((task) => task.nodeId)
    .filter((nodeId) => !parentById.get(nodeId));
  planningPanelCollapsedRoots = new Set(
    Array.from(planningPanelCollapsedRoots).filter((nodeId) => rootIds.includes(nodeId))
  );

  const visibleRows = [];
  const visit = (nodeId, depth, rootId) => {
    const task = taskById.get(nodeId);
    if (!task) return;
    const childIds = childrenById.get(nodeId) || [];
    const rowRootId = rootId || nodeId;
    visibleRows.push({
      task,
      depth,
      rootId: rowRootId,
      hasChildren: childIds.length > 0,
      isRoot: !parentById.get(nodeId)
    });
    if (planningPanelCollapsedRoots.has(rowRootId)) return;
    childIds.forEach((childId) => visit(childId, depth + 1, rowRootId));
  };
  rootIds.forEach((rootId) => visit(rootId, 0, rootId));

  visibleRows.forEach((row) => {
    const task = row.task;
    const li = document.createElement("li");
    li.className = "planning-task-item";
    li.style.setProperty("--planning-task-depth", `${Math.min(8, row.depth)}`);
    if (task.depColor) {
      li.style.setProperty("--planning-task-color", task.depColor);
      li.classList.add("is-linked");
    }
    if (task.isComplete) li.classList.add("is-complete");
    if (row.isRoot) li.classList.add("is-root");
    if (row.hasChildren) li.classList.add("has-children");
    if (row.isRoot && planningPanelCollapsedRoots.has(row.rootId)) li.classList.add("is-collapsed");

    const toggle = document.createElement("span");
    toggle.className = "planning-task-item__toggle";
    toggle.textContent = row.hasChildren ? (planningPanelCollapsedRoots.has(row.rootId) ? "▸" : "▾") : "•";

    const name = document.createElement("span");
    name.className = "planning-task-item__name";
    name.textContent = task.name;
    const heading = document.createElement("div");
    heading.className = "planning-task-item__heading";
    heading.append(toggle, name);
    const meta = document.createElement("span");
    meta.className = "planning-task-item__meta";
    meta.textContent = `${task.startIso} -> ${task.endIso} (${task.durationDays}d)`;
    const deps = document.createElement("span");
    deps.className = "planning-task-item__deps";
    deps.textContent = `in ${task.inCount} · out ${task.outCount}`;
    li.append(heading, meta, deps);
    li.dataset.nodeId = task.nodeId;
    li.dataset.taskKey = "";
    li.addEventListener("click", () => {
      if (row.isRoot && row.hasChildren) {
        if (planningPanelCollapsedRoots.has(row.rootId)) planningPanelCollapsedRoots.delete(row.rootId);
        else planningPanelCollapsedRoots.add(row.rootId);
        renderPlanningTaskPanel();
        return;
      }
      if (selectedFocus && selectedFocus.nodeId === task.nodeId && selectedFocus.taskKey === "") {
        clearSelectedPulse();
        return;
      }
      focusNodeById(task.nodeId, "");
    });
    li.addEventListener("dblclick", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const node = getNodeById(task.nodeId);
      if (!node) return;
      openPlanningTaskModal(node);
    });
    planningTaskList.appendChild(li);
  });
  applySelectedRowHighlight();
}

function renderAnimalTransferPanel() {
  if (!animalTransferList) return;
  animalTransferList.innerHTML = "";
  if (activeWorkspaceId !== "animal-work") return;
  const rows = animalTransferLog
    .filter((entry) => String(entry.workspaceId || "") === activeWorkspaceId)
    .slice()
    .sort((a, b) => b.timeMs - a.timeMs)
    .slice(0, 40);
  if (!rows.length) {
    const li = document.createElement("li");
    li.textContent = "No transfers yet.";
    animalTransferList.appendChild(li);
    return;
  }
  rows.forEach((entry) => {
    const li = document.createElement("li");
    const dt = new Date(entry.timeMs || Date.now()).toISOString().slice(0, 16).replace("T", " ");
    li.textContent = `${entry.animalName}: ${entry.fromCageName || "Unassigned"} -> ${entry.toCageName || "Unassigned"} (${dt})`;
    animalTransferList.appendChild(li);
  });
}

let housingDrawerOpen = false;

function toggleHousingDrawer(forceState) {
  housingDrawerOpen = typeof forceState === "boolean" ? forceState : !housingDrawerOpen;
  if (animalHousingDrawer) {
    animalHousingDrawer.classList.toggle("is-hidden", !housingDrawerOpen);
  }
  if (housingDrawerToggle) {
    housingDrawerToggle.classList.toggle("is-open", housingDrawerOpen);
  }
  if (housingDrawerOpen) {
    renderAnimalHousingBoard();
    applyAnimalFilterHighlights();
  }
}

function initAnimalHousingPanel() {
  animalHousingToggleBtn?.addEventListener("click", () => {
    animalHousingCollapsed = !animalHousingCollapsed;
    renderAnimalHousingPanel();
  });

  // Housing drawer toggle (pull-tab)
  housingDrawerToggle?.addEventListener("click", () => toggleHousingDrawer());
  housingDrawerCloseBtn?.addEventListener("click", () => toggleHousingDrawer(false));

  const onDragOver = (event) => {
    if (activeWorkspaceId !== "animal-work") return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  };

  animalHousingBoard?.addEventListener("dragover", onDragOver);
  animalHousingStage?.addEventListener("dragover", onDragOver);

  animalHousingBoard?.addEventListener("drop", (event) => {
    handleAnimalHousingDrop(event);
  });
  animalHousingStage?.addEventListener("drop", (event) => {
    event.stopPropagation();
    handleAnimalHousingDrop(event);
  });
}

function migrateLegacyAnimalCanvasNodesToHousing() {
  const legacyCages = Array.from(canvas.querySelectorAll(".drop")).filter((node) =>
    isCageNode(node) && getNodeWorkspace(node) === "animal-work"
  );
  const legacyAnimals = Array.from(canvas.querySelectorAll(".drop")).filter((node) =>
    isAnimalNode(node) && getNodeWorkspace(node) === "animal-work"
  );
  if (!legacyCages.length && !legacyAnimals.length) return;

  const cageMap = new Map();
  legacyCages.forEach((node, index) => {
    const species = getCageSpeciesForNode(node) || "mouse";
    const capacity = getCageCapacity(node);
    const next = {
      id: createAnimalHousingId("cage"),
      name: getNodeLabelText(node),
      species,
      capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : getDefaultCageCapacityForSpecies(species),
      x: (Number(parseFloat(node.style.left)) || 0) + 12 + (index % 2) * 10,
      y: (Number(parseFloat(node.style.top)) || 0) + 12 + (index % 2) * 10
    };
    animalHousingState.cages.push(next);
    cageMap.set(String(node.dataset.nodeId || ""), next.id);
  });

  legacyAnimals.forEach((node) => {
    const species = getAnimalSpeciesForNode(node) || "mouse";
    const legacyCageId = String(node.dataset.cageId || "");
    const mappedCageId = cageMap.get(legacyCageId) || "";
    const safeName = (() => {
      const desired = getNodeLabelText(node);
      if (desired && !isAnimalNameTaken(desired)) return desired;
      return generateUniqueAnimalName(species);
    })();
    animalHousingState.animals.push({
      id: createAnimalHousingId("animal"),
      name: safeName,
      animalId: String(node.dataset.animalId || safeName).trim(),
      species,
      cageId: mappedCageId,
      birthIso: String(node.dataset.animalBirthIso || "").trim(),
      sex: String(node.dataset.animalSex || "unknown").trim().toLowerCase(),
      projects: parseAnimalProjectsInput(node.dataset.animalProjects || "")
    });
  });

  [...legacyAnimals, ...legacyCages].forEach((node) => node.remove());
  persistAnimalHousingState();
  renderAnimalTransferPanel();
  updateLogPanel();
  toggleHint();
}

function getCageNodeFromHousingEvent(event) {
  const target = event?.target;
  if (!target || typeof target.closest !== "function") return null;
  return target.closest(".housing-cage");
}

function addHousingCageFromIcon(iconDef, x = 24, y = 24) {
  const species = String(iconDef?.cageType || "").trim().toLowerCase() || "mouse";
  const sameSpeciesCount = animalHousingState.cages.filter((cage) => cage.species === species).length;
  const cage = {
    id: createAnimalHousingId("cage"),
    name: `${getCageSpeciesLabel(species)} Cage ${sameSpeciesCount + 1}`,
    species,
    capacity: getDefaultCageCapacityForSpecies(species),
    x: Math.max(12, Math.round(x || 24)),
    y: Math.max(12, Math.round(y || 24))
  };
  animalHousingState.cages.push(cage);
  persistAnimalHousingState();
  renderAnimalHousingPanel();
  return cage;
}

function addHousingAnimalFromIcon(iconDef, cageId = "") {
  const species = String(iconDef?.animalType || "").trim().toLowerCase();
  const cage = findAnimalHousingCageById(cageId);
  if (!cage) {
    showTaskToast("Drop the animal into a matching cage.");
    return null;
  }
  if (!species || cage.species !== species) {
    showTaskToast(`${getCageSpeciesLabel(species)} can only be placed in ${getCageSpeciesLabel(species)} cages.`);
    return null;
  }
  const occupants = getAnimalsInHousingCage(cage.id);
  if (occupants.length >= cage.capacity) {
    showTaskToast(`${cage.name} is full (${cage.capacity} max).`);
    return null;
  }
  const name = generateUniqueAnimalName(species);
  const animal = {
    id: createAnimalHousingId("animal"),
    name,
    animalId: name,
    species,
    cageId: cage.id,
    birthIso: "",
    sex: "unknown",
    projects: []
  };
  animalHousingState.animals.push(animal);
  persistAnimalHousingState();
  renderAnimalHousingPanel();
  openAnimalDetailsModal(animal.id, true);
  return animal;
}

function handleAnimalHousingDrop(event) {
  if (activeWorkspaceId !== "animal-work") return;
  event.preventDefault();

  const rect = animalHousingStage?.getBoundingClientRect();
  const dragPayload = readDragPayload(event);
  const iconId = dragPayload.id || "";
  const iconLabel = dragPayload.label || "";
  const iconGlyph = dragPayload.glyph || "";
  const itemType = dragPayload.itemType || "icon";
  const boardAnimalId = dragPayload.animalId || "";

  if (itemType === "animal-housing-animal" && boardAnimalId) {
    const cageEl = getCageNodeFromHousingEvent(event);
    const cageId = String(cageEl?.dataset.cageId || "");
    transferHousingAnimal(boardAnimalId, cageId);
    lastDragData = null;
    return;
  }

  if (itemType !== "icon") return;
  const iconDef = getIconDefinition(iconId, iconLabel)
    || getIconDefinition(iconGlyph, iconLabel)
    || getIconDefinition(dragPayload.plain || "", dragPayload.plain || "");
  if (!iconDef) return;

  if (iconDef.iconKind === "cage") {
    const localX = rect ? event.clientX - rect.left + (animalHousingBoard?.scrollLeft || 0) : 24;
    const localY = rect ? event.clientY - rect.top + (animalHousingBoard?.scrollTop || 0) : 24;
    addHousingCageFromIcon(iconDef, localX, localY);
    lastDragData = null;
    return;
  }

  if (iconDef.iconKind === "animal") {
    const cageEl = getCageNodeFromHousingEvent(event);
    const cageId = String(cageEl?.dataset.cageId || "");
    if (!cageId) {
      showTaskToast(`Drop ${iconDef.label || "animal"} into a matching cage.`);
      return;
    }
    addHousingAnimalFromIcon(iconDef, cageId);
    lastDragData = null;
  }
}

function transferHousingAnimal(animalId, targetCageId = "") {
  const animal = findAnimalHousingAnimalById(animalId);
  const target = findAnimalHousingCageById(targetCageId);
  if (!animal || !target) return false;
  if (target.species !== animal.species) {
    showTaskToast(`${getCageSpeciesLabel(animal.species)} can only be placed in ${getCageSpeciesLabel(animal.species)} cages.`);
    return false;
  }
  const occupants = getAnimalsInHousingCage(target.id).filter((entry) => entry.id !== animal.id);
  if (occupants.length >= target.capacity) {
    showTaskToast(`${target.name} is full (${target.capacity} max).`);
    return false;
  }
  const previousCage = findAnimalHousingCageById(animal.cageId);
  const prevId = String(previousCage?.id || "");
  animal.cageId = target.id;
  persistAnimalHousingState();
  renderAnimalHousingPanel();
  if (prevId !== target.id) {
    animalTransferLog.push({
      id: `atr-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
      workspaceId: "animal-work",
      animalNodeId: animal.id,
      animalName: animal.name,
      fromCageId: prevId,
      toCageId: target.id,
      fromCageName: previousCage?.name || "",
      toCageName: target.name,
      timeMs: Date.now()
    });
  }
  renderAnimalTransferPanel();
  updateLogPanel();
  return true;
}

function setAnimalHousingCollapsed(collapsed) {
  animalHousingCollapsed = !!collapsed;
  renderAnimalHousingPanel();
}

function renderAnimalHousingPanel() {
  if (!animalHousingPanel) return;
  const isAnimal = activeWorkspaceId === "animal-work";
  // Show/hide the drawer pull-tab based on active workspace
  if (housingDrawerToggle) {
    housingDrawerToggle.classList.toggle("is-hidden", !isAnimal);
  }
  // Close the drawer when switching away from animal workspace
  if (!isAnimal && housingDrawerOpen) {
    toggleHousingDrawer(false);
  }
  if (!isAnimal) return;
  migrateLegacyAnimalCanvasNodesToHousing();
  const expanded = !animalHousingCollapsed;
  animalHousingPanel.classList.toggle("is-collapsed", !expanded);
  if (animalHousingToggleBtn) {
    animalHousingToggleBtn.textContent = expanded ? "Hide" : "Show";
    animalHousingToggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
  }
  if (housingDrawerOpen) {
    renderAnimalHousingBoard();
  }
  renderAnimalHousingList();
  applyAnimalFilterHighlights();
}

function handleSidebarCageDrop(event, cageId) {
  event.preventDefault();
  event.currentTarget.classList.remove("is-drag-over");
  const dragPayload = readDragPayload(event);
  const iconId = dragPayload.id || "";
  const iconLabel = dragPayload.label || "";
  const iconGlyph = dragPayload.glyph || "";
  const itemType = dragPayload.itemType || "icon";
  const boardAnimalId = dragPayload.animalId || "";

  if (itemType === "animal-housing-animal" && boardAnimalId) {
    transferHousingAnimal(boardAnimalId, cageId);
    lastDragData = null;
    return;
  }
  if (itemType !== "icon") return;
  const iconDef = getIconDefinition(iconId, iconLabel)
    || getIconDefinition(iconGlyph, iconLabel)
    || getIconDefinition(dragPayload.plain || "", dragPayload.plain || "");
  if (!iconDef || iconDef.iconKind !== "animal") return;
  addHousingAnimalFromIcon(iconDef, cageId);
  lastDragData = null;
}

function renderAnimalHousingList() {
  if (!animalHousingList) return;
  animalHousingList.innerHTML = "";
  const sortedCages = animalHousingState.cages.slice().sort((a, b) => a.name.localeCompare(b.name));
  if (!sortedCages.length) {
    const li = document.createElement("li");
    li.textContent = "No cages created yet.";
    animalHousingList.appendChild(li);
    return;
  }
  sortedCages.forEach((cage) => {
    const animals = getAnimalsInHousingCage(cage.id);
    const isExpanded = !sidebarCageCollapsed.has(cage.id);
    const li = document.createElement("li");
    li.className = "animal-housing-list__item";
    li.dataset.cageId = cage.id;

    // Header row with toggle
    const header = document.createElement("div");
    header.className = "animal-housing-list__header";
    const toggle = document.createElement("span");
    toggle.className = "animal-housing-list__toggle";
    toggle.textContent = isExpanded ? "\u25BE" : "\u25B8";
    toggle.setAttribute("role", "button");
    toggle.setAttribute("tabindex", "0");
    toggle.setAttribute("aria-label", isExpanded ? "Collapse" : "Expand");
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (sidebarCageCollapsed.has(cage.id)) {
        sidebarCageCollapsed.delete(cage.id);
      } else {
        sidebarCageCollapsed.add(cage.id);
      }
      renderAnimalHousingList();
      applyAnimalFilterHighlights();
    });
    const headerText = document.createElement("span");
    headerText.textContent = `${cage.name} (${animals.length}/${cage.capacity})`;
    header.append(toggle, headerText);
    li.appendChild(header);

    // Animal rows (only when expanded)
    if (isExpanded) {
      if (!animals.length) {
        const empty = document.createElement("div");
        empty.className = "animal-housing-list__empty";
        empty.textContent = "No animals.";
        li.appendChild(empty);
      } else {
        animals
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach((animal) => {
            const row = document.createElement("div");
            row.className = "animal-housing-list__animal";
            const name = document.createElement("span");
            name.textContent = animal.name;
            const idInput = document.createElement("input");
            idInput.type = "text";
            idInput.value = String(animal.animalId || "");
            idInput.placeholder = "ID";
            idInput.setAttribute("aria-label", `Animal ID for ${animal.name}`);
            idInput.addEventListener("change", () => {
              animal.animalId = String(idInput.value || "").trim();
              persistAnimalHousingState();
              renderAnimalHousingBoard();
              updateLogPanel();
            });
            row.append(name, idInput);
            row.addEventListener("dblclick", () => openAnimalDetailsModal(animal.id, false));
            li.appendChild(row);
          });
      }
    }

    // Drop target for animals
    li.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
      li.classList.add("is-drag-over");
    });
    li.addEventListener("dragleave", () => li.classList.remove("is-drag-over"));
    li.addEventListener("drop", (e) => handleSidebarCageDrop(e, cage.id));

    animalHousingList.appendChild(li);
  });
}

function updateAnimalHousingStageBounds() {
  if (!animalHousingStage) return;
  const cages = animalHousingState.cages;
  if (!cages.length) {
    animalHousingStage.style.width = "100%";
    animalHousingStage.style.height = "240px";
    return;
  }
  const maxX = cages.reduce((acc, cage) => Math.max(acc, Number(cage.x || 0)), 0);
  const maxY = cages.reduce((acc, cage) => Math.max(acc, Number(cage.y || 0)), 0);
  const width = Math.max(740, maxX + 260);
  const height = Math.max(320, maxY + 210);
  animalHousingStage.style.width = `${width}px`;
  animalHousingStage.style.height = `${height}px`;
}

function bindHousingCageDrag(card, cage) {
  const handle = card.querySelector(".housing-cage__drag");
  if (!handle) return;
  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let baseX = 0;
  let baseY = 0;
  const onMove = (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    cage.x = Math.max(8, Math.round(baseX + dx));
    cage.y = Math.max(8, Math.round(baseY + dy));
    card.style.left = `${cage.x}px`;
    card.style.top = `${cage.y}px`;
    updateAnimalHousingStageBounds();
  };
  const onUp = (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    dragging = false;
    pointerId = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    persistAnimalHousingState();
    renderAnimalHousingList();
  };
  handle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    dragging = true;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    baseX = Number(cage.x || 0);
    baseY = Number(cage.y || 0);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    event.preventDefault();
  });
}

function renderAnimalHousingBoard() {
  if (!animalHousingStage) return;
  animalHousingStage.innerHTML = "";
  updateAnimalHousingStageBounds();
  const sortedCages = animalHousingState.cages.slice().sort((a, b) => a.name.localeCompare(b.name));
  sortedCages.forEach((cage) => {
    const card = document.createElement("div");
    card.className = "housing-cage";
    card.dataset.cageId = cage.id;
    card.style.left = `${Math.max(8, Number(cage.x || 0))}px`;
    card.style.top = `${Math.max(8, Number(cage.y || 0))}px`;

    const header = document.createElement("div");
    header.className = "housing-cage__header";
    const drag = document.createElement("button");
    drag.type = "button";
    drag.className = "housing-cage__drag";
    drag.textContent = "⋮⋮";
    drag.title = "Drag cage";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "housing-cage__name";
    nameInput.value = cage.name;
    nameInput.addEventListener("change", () => {
      cage.name = String(nameInput.value || "").trim() || cage.name;
      persistAnimalHousingState();
      renderAnimalHousingPanel();
    });
    const capInput = document.createElement("input");
    capInput.type = "number";
    capInput.className = "housing-cage__capacity";
    capInput.min = "1";
    capInput.max = "40";
    capInput.value = String(cage.capacity);
    capInput.title = "Capacity";
    capInput.addEventListener("change", () => {
      const next = Math.max(1, Math.round(Number(capInput.value || cage.capacity)));
      const occupants = getAnimalsInHousingCage(cage.id).length;
      if (next < occupants) {
        showTaskToast(`Cannot set capacity below occupancy (${occupants}).`);
        capInput.value = String(cage.capacity);
        return;
      }
      cage.capacity = next;
      persistAnimalHousingState();
      renderAnimalHousingPanel();
    });
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "housing-cage__delete";
    delBtn.textContent = "\u00d7";
    delBtn.title = "Remove cage";
    delBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const occupants = getAnimalsInHousingCage(cage.id);
      if (occupants.length > 0) {
        if (!confirm(`Remove cage? ${occupants.length} animal(s) will be unassigned.`)) return;
      }
      occupants.forEach((a) => { a.cageId = ""; });
      const idx = animalHousingState.cages.indexOf(cage);
      if (idx !== -1) animalHousingState.cages.splice(idx, 1);
      persistAnimalHousingState();
      renderAnimalHousingPanel();
    });
    header.append(drag, nameInput, capInput, delBtn);

    const sub = document.createElement("div");
    sub.className = "housing-cage__sub";
    const occupancy = getAnimalsInHousingCage(cage.id).length;
    sub.textContent = `${getCageSpeciesLabel(cage.species)} · ${occupancy}/${cage.capacity}`;

    const animalsWrap = document.createElement("div");
    animalsWrap.className = "housing-cage__animals";
    animalsWrap.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    });
    animalsWrap.addEventListener("drop", (event) => {
      event.preventDefault();
      const dragPayload = readDragPayload(event);
      const itemType = dragPayload.itemType || "";
      if (itemType !== "animal-housing-animal") return;
      event.stopPropagation();
      const animalId = dragPayload.animalId || "";
      if (animalId) transferHousingAnimal(animalId, cage.id);
      lastDragData = null;
    });

    const animals = getAnimalsInHousingCage(cage.id)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
    animals.forEach((animal) => {
      const chip = document.createElement("div");
      chip.className = "housing-animal";
      chip.dataset.animalId = animal.id;
      chip.draggable = true;
      chip.addEventListener("dragstart", (event) => {
        event.dataTransfer?.setData("text/item-type", "animal-housing-animal");
        event.dataTransfer?.setData("text/animal-id", animal.id);
        event.dataTransfer?.setData("text/plain", animal.name);
        lastDragData = { id: animal.id, label: animal.name, itemType: "animal-housing-animal", animalId: animal.id };
        toggleHousingDrawer(false);
      });
      chip.addEventListener("dragend", () => {
        lastDragData = null;
        toggleHousingDrawer(true);
      });
      chip.addEventListener("dblclick", () => openAnimalDetailsModal(animal.id, false));

      const name = document.createElement("span");
      name.className = "housing-animal__name";
      name.textContent = animal.name;
      const idInput = document.createElement("input");
      idInput.type = "text";
      idInput.className = "housing-animal__id";
      idInput.value = String(animal.animalId || "");
      idInput.placeholder = "ID";
      idInput.addEventListener("click", (event) => event.stopPropagation());
      idInput.addEventListener("change", () => {
        animal.animalId = String(idInput.value || "").trim();
        persistAnimalHousingState();
        renderAnimalHousingList();
        applyAnimalFilterHighlights();
      });

      chip.append(name, idInput);
      animalsWrap.appendChild(chip);
    });

    card.append(header, sub, animalsWrap);
    animalHousingStage.appendChild(card);
    bindHousingCageDrag(card, cage);
  });
}

function getProcedureNodeAtCanvasPoint(x, y) {
  return Array.from(canvas.querySelectorAll(".drop")).find((node) => {
    if (!isNodeInActiveWorkspace(node)) return false;
    if (String(node.dataset.nodeType || "") !== "animal-procedure") return false;
    return isPointInsideNode(node, x, y);
  }) || null;
}

function assignAnimalToProcedureNode(node, animalId) {
  if (!node || String(node.dataset.nodeType || "") !== "animal-procedure") return false;
  const animal = findAnimalHousingAnimalById(animalId);
  if (!animal) return false;
  let ids = [];
  try {
    ids = node.dataset.procedureAnimalIds ? JSON.parse(node.dataset.procedureAnimalIds) : [];
  } catch {
    ids = [];
  }
  const set = new Set((Array.isArray(ids) ? ids : []).map((entry) => String(entry || "").trim()).filter(Boolean));
  set.add(animal.id);
  node.dataset.procedureAnimalIds = JSON.stringify(Array.from(set));
  renderAnimalProcedureBadge(node);
  updateLogPanel();
  return true;
}

function renderAnimalProcedureBadge(node) {
  if (!node || String(node.dataset.nodeType || "") !== "animal-procedure") return;
  node.querySelector(".animal-procedure-badge")?.remove();
  let ids = [];
  try {
    ids = node.dataset.procedureAnimalIds ? JSON.parse(node.dataset.procedureAnimalIds) : [];
  } catch {
    ids = [];
  }
  const unique = Array.from(new Set((Array.isArray(ids) ? ids : []).map((entry) => String(entry || "").trim()).filter(Boolean)));
  if (!unique.length) return;
  const badge = document.createElement("span");
  badge.className = "animal-procedure-badge";
  badge.textContent = `${unique.length} assigned`;
  node.appendChild(badge);
}

function doesAnimalMatchActiveFilter(animal) {
  if (!animalFilterState.active) return true;
  const sexFilter = String(animalFilterState.sex || "").trim().toLowerCase();
  if (sexFilter && String(animal.sex || "").trim().toLowerCase() !== sexFilter) return false;
  const projectFilter = String(animalFilterState.project || "").trim().toLowerCase();
  if (projectFilter) {
    const projects = parseAnimalProjectsInput(animal.projects).map((entry) => entry.toLowerCase());
    if (!projects.includes(projectFilter)) return false;
  }
  const idsFilter = Array.isArray(animalFilterState.ids) ? animalFilterState.ids : [];
  if (idsFilter.length) {
    const idValue = String(animal.animalId || "").trim();
    if (!idsFilter.includes(idValue)) return false;
  }
  const ageMode = String(animalFilterState.ageMode || "any");
  const ageDaysRaw = Number(animalFilterState.ageDays);
  if (ageMode !== "any" && Number.isFinite(ageDaysRaw) && ageDaysRaw >= 0) {
    const age = animalAgeDays(animal);
    if (!Number.isFinite(age)) return false;
    if (ageMode === "older" && age < ageDaysRaw) return false;
    if (ageMode === "younger" && age > ageDaysRaw) return false;
  }
  return true;
}

function applyAnimalFilterHighlights() {
  if (!animalHousingStage) return;
  const chips = animalHousingStage.querySelectorAll(".housing-animal");
  chips.forEach((chip) => {
    const animalId = String(chip.dataset.animalId || "");
    const animal = findAnimalHousingAnimalById(animalId);
    const matched = !!animal && doesAnimalMatchActiveFilter(animal);
    chip.classList.toggle("is-filter-match", !!animalFilterState.active && matched);
    chip.classList.toggle("is-filter-dim", !!animalFilterState.active && !matched);
  });
  if (logAnimalFilterStatus) {
    if (!animalFilterState.active) {
      logAnimalFilterStatus.textContent = "";
    } else {
      const matchedCount = animalHousingState.animals.filter((animal) => doesAnimalMatchActiveFilter(animal)).length;
      logAnimalFilterStatus.textContent = `${matchedCount} animals highlighted`;
    }
  }
}

function renderPlateWells(mark) {
  const { rows, cols, r } = plateGridSpec(mark);
  const xMin = 14;
  const xMax = 50;
  const yMin = 20;
  const yMax = 38;
  const dx = cols > 1 ? (xMax - xMin) / (cols - 1) : 0;
  const dy = rows > 1 ? (yMax - yMin) / (rows - 1) : 0;
  const parts = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = xMin + col * dx;
      const cy = yMin + row * dy;
      parts.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}"></circle>`);
    }
  }
  return parts.join("");
}

function getIconSvg(icon, variant = "palette") {
  const mark = escapeSvgText(icon?.iconMark || "");
  const modeClass = variant === "node" ? "lab-icon--node" : "lab-icon--palette";
  const outline = `stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const detail = `stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  switch (icon?.iconKind) {
    case "flask": {
      const len = flaskBodyLength(mark);
      const bodyRight = 10 + len;
      return `
        <svg class="lab-icon ${modeClass}" viewBox="0 0 64 64" aria-hidden="true">
          <path d="M10 22h${bodyRight - 10}q2 0 3 2l3 3h7v10h-7l-3 3q-1 2-3 2H10q-2 0-2-2V24q0-2 2-2z" ${outline}></path>
          <rect x="53" y="25" width="5" height="14" rx="1.4" ${outline}></rect>
          <path d="M14 28h${Math.max(12, len - 10)}M14 36h${Math.max(12, len - 10)}" ${detail}></path>
          <text x="32" y="54" text-anchor="middle" fill="currentColor" font-size="7.5" font-weight="700" font-family="Avenir Next, Segoe UI, sans-serif">${mark}</text>
        </svg>
      `;
    }
    case "plate":
      return `
        <svg class="lab-icon ${modeClass}" viewBox="0 0 64 64" aria-hidden="true">
          <rect x="8" y="13" width="48" height="33" rx="5" ${outline}></rect>
          <rect x="11" y="16" width="42" height="27" rx="3.5" ${detail}></rect>
          <g fill="currentColor" opacity="0.72">
            ${renderPlateWells(mark)}
          </g>
          <text x="32" y="54" text-anchor="middle" fill="currentColor" font-size="7.5" font-weight="700" font-family="Avenir Next, Segoe UI, sans-serif">${mark}</text>
        </svg>
      `;
    case "dish":
      return `
        <svg class="lab-icon ${modeClass}" viewBox="0 0 64 64" aria-hidden="true">
          <ellipse cx="32" cy="31" rx="22" ry="14" ${outline}></ellipse>
          <ellipse cx="32" cy="31" rx="17" ry="10" ${detail}></ellipse>
          <path d="M16 31h32" ${detail}></path>
          <text x="32" y="54" text-anchor="middle" fill="currentColor" font-size="7.5" font-weight="700" font-family="Avenir Next, Segoe UI, sans-serif">${mark} mm</text>
        </svg>
      `;
    case "cell-line":
      return `
        <svg class="lab-icon ${modeClass}" viewBox="0 0 64 64" aria-hidden="true">
          <rect x="24" y="16" width="16" height="34" rx="4" ${outline}></rect>
          <rect x="22" y="9" width="20" height="8" rx="2" ${outline}></rect>
          <path d="M27 23h10M27 28h10M27 33h10" ${detail}></path>
          <g stroke="currentColor" stroke-width="1" fill="none">
            <circle cx="31" cy="42" r="1.8"></circle><circle cx="35.5" cy="45" r="1.5"></circle><circle cx="27.8" cy="45" r="1.2"></circle>
          </g>
          <text x="32" y="56" text-anchor="middle" fill="currentColor" font-size="7.5" font-weight="700" font-family="Avenir Next, Segoe UI, sans-serif">${mark}</text>
        </svg>
      `;
    case "tissue":
      return `
        <svg class="lab-icon ${modeClass}" viewBox="0 0 64 64" aria-hidden="true">
          <ellipse cx="32" cy="34" rx="21" ry="13" ${outline}></ellipse>
          <ellipse cx="32" cy="34" rx="16" ry="9" ${detail}></ellipse>
          <path d="M24 38c-2.5-2.4-1.7-6 1.4-7.5 2.3-1.1 4.8-.4 6.2-2.1 2.2-2.6 6.8-1.9 7.8 1.5 1.1 3.7-.9 7.1-4.3 8-4 1-7.8.8-11.1.1z" ${detail}></path>
          <path d="M28.5 34.3l1.6 1.4M33 35.3l1.8 1.6" ${detail}></path>
          <text x="32" y="56" text-anchor="middle" fill="currentColor" font-size="7.5" font-weight="700" font-family="Avenir Next, Segoe UI, sans-serif">${mark}</text>
        </svg>
      `;
    case "cage":
      return `
        <svg class="lab-icon ${modeClass}" viewBox="0 0 64 64" aria-hidden="true">
          <rect x="8" y="16" width="48" height="30" rx="4" ${outline}></rect>
          <path d="M8 22h48M8 28h48M8 34h48M8 40h48" ${detail}></path>
          <path d="M16 16v30M24 16v30M32 16v30M40 16v30M48 16v30" ${detail}></path>
          <text x="32" y="55" text-anchor="middle" fill="currentColor" font-size="7.5" font-weight="700" font-family="Avenir Next, Segoe UI, sans-serif">${mark}</text>
        </svg>
      `;
    case "animal":
      return `
        <svg class="lab-icon ${modeClass}" viewBox="0 0 64 64" aria-hidden="true">
          <ellipse cx="32" cy="35" rx="16" ry="10" ${outline}></ellipse>
          <circle cx="20" cy="31" r="5" ${outline}></circle>
          <path d="M17 26l-2-4M22 26l2-4M44 39l5 3M25 45l-2 4M38 45l2 4" ${detail}></path>
          <circle cx="19" cy="31" r="0.9" fill="currentColor"></circle>
          <text x="32" y="55" text-anchor="middle" fill="currentColor" font-size="7.5" font-weight="700" font-family="Avenir Next, Segoe UI, sans-serif">${mark}</text>
        </svg>
      `;
    case "animal-procedure":
      return `
        <svg class="lab-icon ${modeClass}" viewBox="0 0 64 64" aria-hidden="true">
          <rect x="9" y="13" width="46" height="34" rx="6" ${outline}></rect>
          <path d="M18 23h28M18 30h18M18 37h12" ${detail}></path>
          <circle cx="46" cy="36" r="6" ${outline}></circle>
          <path d="M46 32v8M42 36h8" ${detail}></path>
          <text x="32" y="55" text-anchor="middle" fill="currentColor" font-size="7.5" font-weight="700" font-family="Avenir Next, Segoe UI, sans-serif">${mark}</text>
        </svg>
      `;
    case "planning-task":
      return `
        <svg class="lab-icon ${modeClass}" viewBox="0 0 64 64" aria-hidden="true">
          <rect x="10" y="12" width="44" height="40" rx="6" ${outline}></rect>
          <path d="M18 24h28M18 31h28M18 38h18" ${detail}></path>
          <circle cx="17" cy="24" r="1.2" fill="currentColor"></circle>
          <circle cx="17" cy="31" r="1.2" fill="currentColor"></circle>
          <circle cx="17" cy="38" r="1.2" fill="currentColor"></circle>
          <text x="32" y="55" text-anchor="middle" fill="currentColor" font-size="7.5" font-weight="700" font-family="Avenir Next, Segoe UI, sans-serif">${mark}</text>
        </svg>
      `;
    case "deadline":
      return `
        <svg class="lab-icon ${modeClass}" viewBox="0 0 64 64" aria-hidden="true">
          <path d="M32 12v36" ${outline}></path>
          <path d="M32 14l8 8-8 8-8-8z" ${outline}></path>
          <path d="M16 48h32" ${detail}></path>
          <text x="32" y="57" text-anchor="middle" fill="currentColor" font-size="7.5" font-weight="700" font-family="Avenir Next, Segoe UI, sans-serif">${mark}</text>
        </svg>
      `;
    default:
      return `
        <svg class="lab-icon ${modeClass}" viewBox="0 0 64 64" aria-hidden="true">
          <rect x="12" y="12" width="40" height="40" rx="8" ${outline}></rect>
        </svg>
      `;
  }
}

function buildTasks(plan, adds, rems, recurringTasks = []) {
  const tasks = [];
  let cursorHour = 0;
  plan.forEach((step, idx) => {
    const dur = getStepDurationHours(step, 24);
    const intervalHours = getStepIntervalHours(step, 24);
    const recurUntil = isRecurUntilStep(step);
    const recurEndPoint = String(step?.recurEndPoint || "custom end point").trim() || "custom end point";
    const mediaType = String(step?.type || "").trim();
    const label = step.type
      ? `${step.type} ${recurUntil ? `every ${intervalHours}h until ${recurEndPoint}` : `${step.duration}h`}`
      : `Media ${idx + 1}`;
    tasks.push({
      key: mediaKey(idx),
      label,
      hour: cursorHour,
      type: "media",
      duration: dur || 24,
      baseLabel: label,
      sourceType: "media-step",
      mediaStepIndex: idx,
      recurrenceConfig: recurUntil
        ? {
            enabled: true,
            mediaType: mediaType || `Media ${idx + 1}`,
            intervalHours: intervalHours || 24,
            endPoint: recurEndPoint
          }
        : { enabled: false }
    });
    cursorHour += dur || 24;
  });
  adds.forEach((add, idx) => {
    const lbl = `[Add] ${add.drug || "Add"} @ ${add.hour || 0}h`;
    tasks.push({ key: addKey(idx), label: lbl, hour: Number(add.hour) || 0, type: "add", baseLabel: lbl });
  });
  rems.forEach((rem, idx) => {
    const lbl = `[Rm] ${rem.type || "media"} @ ${rem.hour || 0}h`;
    tasks.push({ key: remKey(idx), label: lbl, hour: Number(rem.hour) || 0, type: "rem", baseLabel: lbl });
  });
  sanitizeRecurringTasks(recurringTasks).forEach((item) => {
    tasks.push({
      ...item,
      key: item.key,
      label: item.label,
      hour: item.hour,
      type: "media-recur",
      baseLabel: item.baseLabel || item.label
    });
  });
  const typeRank = {
    media: 0,
    "media-recur": 1,
    add: 2,
    rem: 3
  };
  tasks.sort((a, b) => {
    if (a.hour !== b.hour) return a.hour - b.hour;
    const rankA = Number.isFinite(typeRank[a.type]) ? typeRank[a.type] : 99;
    const rankB = Number.isFinite(typeRank[b.type]) ? typeRank[b.type] : 99;
    if (rankA !== rankB) return rankA - rankB;
    return String(a.key || "").localeCompare(String(b.key || ""));
  });
  return tasks;
}

function normalizeTaskMetaMap(taskMeta, tasks = []) {
  const validTasks = Array.isArray(tasks) ? tasks : [];
  const validKeys = new Set(
    validTasks
      .map((task) => String(task?.key || "").trim())
      .filter(Boolean)
  );
  if (!validKeys.size) return {};
  const src = taskMeta && typeof taskMeta === "object" ? taskMeta : {};
  const normalized = {};
  Object.entries(src).forEach(([key, value]) => {
    if (!validKeys.has(key)) return;
    if (!value || typeof value !== "object") return;
    const entry = { ...value };
    const assignee = String(entry.assignee || "").trim();
    if (assignee) {
      entry.assignee = assignee;
    } else {
      delete entry.assignee;
    }
    if (Object.keys(entry).length) {
      normalized[key] = entry;
    }
  });
  return normalized;
}

function normalizeTaskStatusMap(taskStatus, tasks = []) {
  const validTasks = Array.isArray(tasks) ? tasks : [];
  const validKeys = new Set(
    validTasks
      .map((task) => String(task?.key || "").trim())
      .filter(Boolean)
  );
  if (!validKeys.size) return {};
  const src = taskStatus && typeof taskStatus === "object" ? taskStatus : {};
  const normalized = {};
  Object.entries(src).forEach(([key, value]) => {
    if (!validKeys.has(key)) return;
    if (value) normalized[key] = true;
  });
  return normalized;
}

function normalizeTaskCompletionMap(taskCompletion, tasks = []) {
  const validTasks = Array.isArray(tasks) ? tasks : [];
  const validKeys = new Set(
    validTasks
      .map((task) => String(task?.key || "").trim())
      .filter(Boolean)
  );
  if (!validKeys.size) return {};
  const src = taskCompletion && typeof taskCompletion === "object" ? taskCompletion : {};
  const normalized = {};
  Object.entries(src).forEach(([key, value]) => {
    if (!validKeys.has(key)) return;
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) normalized[key] = num;
  });
  return normalized;
}

const HANDLE_OFFSET = 12; // px, keep in sync with CSS --handle-offset
const TIMELINE_HEIGHT = 72; // px, keep in sync with CSS --timeline-height
const MIN_DAY_COUNT = 1;
const MAX_DAY_COUNT = 365;
let dayCount = 14;
const START_OFFSET_DAYS = -3; // timeline starts 3 days before today
const MIN_NODE_WIDTH = 64;
const PLANNING_TASK_HEIGHT = 36;
const PLANNING_TASK_MIN_WIDTH = 56;
const CAGE_NODE_MIN_WIDTH = 224;
const CAGE_NODE_HEIGHT = 168;
const ANIMAL_NODE_MIN_WIDTH = 56;
const ANIMAL_NODE_HEIGHT = 56;
const ANIMAL_PROCEDURE_NODE_MIN_WIDTH = 132;
const ANIMAL_PROCEDURE_NODE_HEIGHT = 42;
const PLATE_NODE_ROW_HEIGHT = 14;
const DAY_PADDING = 4;
const PLATE_TIMELINE_AXIS_LEFT_OFFSET = 59;
const PLATE_TIMELINE_AXIS_RIGHT_OFFSET = 13;
const PLATE_TIMELINE_AXIS_OVERHEAD = PLATE_TIMELINE_AXIS_LEFT_OFFSET + PLATE_TIMELINE_AXIS_RIGHT_OFFSET;
const CONNECT_OFFSET = 20; // px extra step away from node before turning
const LANE_OFFSET = 12; // px spacing between parallel connections
const HORIZONTAL_LINK_Y_TOLERANCE = 2; // px snap tolerance for same-row side-to-side links
const MOVE_DRAG_THRESHOLD = 12; // px before pointer motion counts as a drag
const ROUTE_GRID_SIZE = 14;
const ROUTE_NODE_PADDING = 16;
const ROUTE_ENDPOINT_PADDING = 0;
const ROUTE_TURN_PENALTY = 4.0;
const ROUTE_CORNER_RADIUS = 7;
const ROUTE_MAX_VISITED = 35000;
const ARROW_TAIL_VECTOR_MIN = 6;
const ARROW_TAIL_SEGMENT_MIN = 16;
const ARROW_TAIL_SEGMENT_MAX = 28;
const PLANNING_DEPENDENCY_COLORS = [
  "#5eead4",
  "#f59e0b",
  "#60a5fa",
  "#f472b6",
  "#34d399",
  "#f87171",
  "#a78bfa",
  "#22d3ee",
  "#fb7185",
  "#eab308"
];
const DEFAULT_ANIMAL_CAGE_CAPACITY = Object.freeze({
  mouse: 6,
  rat: 2,
  rabbit: 1,
  guinea_pig: 2
});
let animalCageCapacityDefaults = { ...DEFAULT_ANIMAL_CAGE_CAPACITY };

let dayWidth = 0;
let dayCenters = [];
let startDate;
let todayIndex = 0;
let nowTimer = null;

let nodeIdCounter = 1;
let connectionIdCounter = 1;
const connections = [];
let planningPanelCollapsedRoots = new Set();
let pendingLink = null;
let selection = null;

loadProtocolTemplates();
loadAnimalHousingState();
buildWorkspaceTabs();
updateWorkspaceTabsUI();
buildPalette();
wireCanvas();
initTimeline();
initNodeMenu();
initMediaModal();
initPlateSelectorModal();
initStartModal();
initCompletionModal();
initPlanningTaskModal();
initMilestoneModal();
initCageCapacityModal();
initLogPanel();
initAnimalHousingPanel();
initAnimalDetailsModal();
initAnimalProcedureModal();
initAnimalFilterModal();
initInventoryModal();
initMediaFormulationModal();
initAliquotModal();
initStorageModal();
initStorageBoxModal();
timelinePrevBtn?.addEventListener("click", () => shiftTimeline(-7));
timelineNextBtn?.addEventListener("click", () => shiftTimeline(7));
timelinePrevBtn?.addEventListener("click", hideNodeMenu);
timelineNextBtn?.addEventListener("click", hideNodeMenu);
jumpTodayBtn?.addEventListener("click", () => {
  jumpToToday();
  hideNodeMenu();
});
zoomInBtn?.addEventListener("click", () => {
  adjustDayCount(-3);
});
zoomOutBtn?.addEventListener("click", () => {
  adjustDayCount(7);
});
setInterval(updateTaskAlerts, 30000);
setInterval(() => { if (activeCanvasId && hasActiveBackendSession()) scheduleCanvasSync(); }, 30000);
startNowTimer();

// clearButton removed; placeholder kept intentionally

deleteButton.addEventListener("click", handleDeleteSelection);
if (editTemplatesBtn) editTemplatesBtn.addEventListener("click", openTemplateManager);
if (userMgmtBtn) userMgmtBtn.addEventListener("click", openUserManager);
if (inventoryBtn) inventoryBtn.addEventListener("click", openInventoryModal);
if (mediaFormBtn) mediaFormBtn.addEventListener("click", openMediaFormulationModal);
if (aliquotBtn) aliquotBtn.addEventListener("click", openAliquotModal);
if (storageBtn) storageBtn.addEventListener("click", openStorageModal);
if (storageBoxBtn) storageBoxBtn.addEventListener("click", openStorageBoxModal);
if (exportProjectBtn) exportProjectBtn.addEventListener("click", exportProjectData);
if (signInBtn) signInBtn.addEventListener("click", openSignInModal);
if (billingBtn) billingBtn.addEventListener("click", openBillingModal);
setBillingButtonState();
handleBillingRedirectFeedback();
restoreSignedInUserFromStorage();
updateWorkspaceSidebarPanels();
renderAnimalHousingPanel();
initAuthGate();
initRouter();

function initRouter() {
  // Offline single-user desktop (no login): establish a local front-end session
  // so the project dashboard + "New Project" button get wired and backend sync
  // works. The bundled server runs with REQUIRE_AUTH off and maps every request
  // to a fixed local user, so no real token is needed. Without this the router
  // used to bail here and the app dropped straight into an empty workspace.
  if (!window.__REQUIRE_AUTH && !currentUser) {
    applySignedInUser("Local User", "local", "local@wetlab.app");
  }

  const page = document.querySelector(".page");
  if (page) page.style.display = "none";

  // E2E test compatibility: skip dashboard, auto-load workspace
  if (window.__E2E_AUTO_WORKSPACE && hasActiveBackendSession()) {
    if (page) page.style.display = "";
    void loadOrCreateCanvas();
    return;
  }

  // Wire dashboard buttons
  const signOutBtn = document.getElementById("dashboardSignOut");
  if (signOutBtn) signOutBtn.addEventListener("click", () => signOutCurrentUser());

  const newProjectModal = initNewProjectModal();
  deleteProjectModal = initDeleteProjectModal();
  const newProjectBtn = document.getElementById("dashboardNewProject");
  if (newProjectBtn) {
    newProjectBtn.addEventListener("click", () => newProjectModal.open());
  }

  const adminBtn = document.getElementById("dashboardAdminBtn");
  if (adminBtn) adminBtn.addEventListener("click", openAdminPanel);

  // Wire back button
  const backBtn = document.getElementById("backToDashboard");
  if (backBtn) {
    backBtn.addEventListener("click", async () => {
      if (activeCanvasId && hasActiveBackendSession()) {
        await saveCanvasToBackend();
      }
      navigateTo({ view: "dashboard" });
    });
  }

  // Hash change listener
  window.addEventListener("hashchange", () => {
    const route = parseHashRoute();
    applyRoute(route);
  });

  // Initial route
  if (!hasActiveBackendSession()) {
    applyRoute({ view: "auth", canvasId: null });
  } else {
    applyRoute(parseHashRoute());
  }
}

function initAuthGate() {
  if (!window.__REQUIRE_AUTH) return;
  const gate = document.getElementById("authGate");
  const page = document.querySelector(".page");
  if (!gate || !page) return;

  function showGate() {
    gate.classList.remove("is-hidden");
    page.style.display = "none";
  }
  function hideGate() {
    gate.classList.add("is-hidden");
    page.style.display = "";
  }

  // Initial visibility handled by initRouter, not here

  // Wire Google sign-in button in auth gate
  const googleMount = document.getElementById("authGateGoogleMount");
  const hint = document.getElementById("authGateHint");
  if (googleMount && window.CELLCULTURE_GOOGLE_CLIENT_ID) {
    renderGoogleSignInButtonInto(googleMount);
  } else if (hint && !window.CELLCULTURE_GOOGLE_CLIENT_ID) {
    hint.textContent = "Google sign-in is not configured on this server.";
  }

  // Wire login/signup toggle
  const loginForm = document.getElementById("authGateLoginForm");
  const signupForm = document.getElementById("authGateSignupForm");
  const subtitle = document.getElementById("authGateSubtitle");
  const showSignupLink = document.getElementById("authGateShowSignup");
  const showLoginLink = document.getElementById("authGateShowLogin");

  if (showSignupLink) {
    showSignupLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (loginForm) loginForm.classList.add("is-hidden");
      if (signupForm) signupForm.classList.remove("is-hidden");
      if (subtitle) subtitle.textContent = "Create a new account";
      setGateStatus("", "");
    });
  }
  if (showLoginLink) {
    showLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (signupForm) signupForm.classList.add("is-hidden");
      if (loginForm) loginForm.classList.remove("is-hidden");
      if (subtitle) subtitle.textContent = "Sign in to access your projects";
      setGateStatus("", "");
    });
  }

  // Wire local sign-in in auth gate
  const emailInput = document.getElementById("authGateEmail");
  const passInput = document.getElementById("authGatePass");
  const localBtn = document.getElementById("authGateLocalBtn");
  const statusEl = document.getElementById("authGateStatus");

  function setGateStatus(msg, tone) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = tone === "error" ? "#fca5a5" : tone === "success" ? "#bbf7d0" : "";
  }

  if (localBtn) {
    localBtn.addEventListener("click", async () => {
      const email = String(emailInput?.value || "").trim().toLowerCase();
      const pass = String(passInput?.value || "");
      if (!email) return setGateStatus("Email is required.", "error");
      if (!pass) return setGateStatus("Password is required.", "error");
      localBtn.disabled = true;
      localBtn.textContent = "Signing in\u2026";
      setGateStatus("", "");
      try {
        const result = await apiFetch("/api/auth/local", {
          method: "POST",
          skipAuth: true,
          body: JSON.stringify({ email, password: pass })
        });
        if (!result.ok || !result.data?.token) {
          localBtn.disabled = false;
          localBtn.textContent = "Sign in";
          return setGateStatus(result.data?.error || "Invalid credentials.", "error");
        }
        const user = result.data.user || {};
        setApiSession(result.data.token, result.data.expiresAt || "");
        applySignedInUser(user.name || email.split("@")[0], "local", email);
        setGateStatus("Signed in!", "success");
      } catch {
        localBtn.disabled = false;
        localBtn.textContent = "Sign in";
        setGateStatus("Network error. Please try again.", "error");
      }
    });
    if (passInput) {
      passInput.addEventListener("keydown", (e) => { if (e.key === "Enter") localBtn.click(); });
    }
  }

  // Wire signup
  const signupBtn = document.getElementById("authGateSignupBtn");
  if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
      const name = String(document.getElementById("authGateSignupName")?.value || "").trim();
      const email = String(document.getElementById("authGateSignupEmail")?.value || "").trim().toLowerCase();
      const pass = String(document.getElementById("authGateSignupPass")?.value || "");
      const confirm = String(document.getElementById("authGateSignupConfirm")?.value || "");
      if (!name) return setGateStatus("Name is required.", "error");
      if (!email) return setGateStatus("Email is required.", "error");
      if (!pass) return setGateStatus("Password is required.", "error");
      if (pass.length < 8) return setGateStatus("Password must be at least 8 characters.", "error");
      if (pass !== confirm) return setGateStatus("Passwords do not match.", "error");
      signupBtn.disabled = true;
      signupBtn.textContent = "Creating account\u2026";
      setGateStatus("", "");
      try {
        const result = await apiFetch("/api/auth/register", {
          method: "POST",
          skipAuth: true,
          body: JSON.stringify({ name, email, password: pass })
        });
        if (!result.ok || !result.data?.token) {
          signupBtn.disabled = false;
          signupBtn.textContent = "Create account";
          return setGateStatus(result.data?.error || "Registration failed.", "error");
        }
        const user = result.data.user || {};
        setApiSession(result.data.token, result.data.expiresAt || "");
        applySignedInUser(user.name || name, "local", email);
        setGateStatus("Account created!", "success");
      } catch {
        signupBtn.disabled = false;
        signupBtn.textContent = "Create account";
        setGateStatus("Network error. Please try again.", "error");
      }
    });
    const confirmInput = document.getElementById("authGateSignupConfirm");
    if (confirmInput) {
      confirmInput.addEventListener("keydown", (e) => { if (e.key === "Enter") signupBtn.click(); });
    }
  }

  // Listen for auth state changes to hide gate
  window.__authGateHide = hideGate;
}

function renderGoogleSignInButtonInto(container) {
  const clientId = window.CELLCULTURE_GOOGLE_CLIENT_ID;
  if (!clientId) return;
  const api = window.google?.accounts?.id;
  if (!api) {
    // GIS script not loaded yet, retry
    setTimeout(() => renderGoogleSignInButtonInto(container), 500);
    return;
  }
  try {
    if (!googleSignInInitialized) {
      api.initialize({ client_id: clientId, callback: handleGoogleSignInCredential });
      googleSignInInitialized = true;
    }
    api.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "continue_with",
      logo_alignment: "left",
      width: 300
    });
  } catch {
    setTimeout(() => renderGoogleSignInButtonInto(container), 500);
  }
}

function handleBillingRedirectFeedback() {
  let url;
  try {
    url = new URL(window.location.href);
  } catch {
    return;
  }
  const state = String(url.searchParams.get("billing") || "").trim().toLowerCase();
  if (!state) return;
  if (state === "success") {
    showTaskToast("Billing checkout completed.");
  } else if (state === "cancelled") {
    showTaskToast("Billing checkout cancelled.");
  } else {
    showTaskToast(`Billing status: ${state}`);
  }
  url.searchParams.delete("billing");
  url.searchParams.delete("session_id");
  try {
    window.history.replaceState({}, document.title, url.toString());
  } catch {
    // ignore history replacement failures
  }
}

function buildPalette() {
  const config = getWorkspaceConfig(activeWorkspaceId);
  if (paletteTitleEl) paletteTitleEl.textContent = config.paletteTitle;
  if (paletteSubtitleEl) paletteSubtitleEl.textContent = config.paletteSubtitle;
  const isCellCulture = activeWorkspaceId === "cell-culture";
  [editTemplatesBtn, userMgmtBtn, mediaFormBtn, inventoryBtn, aliquotBtn, storageBtn, storageBoxBtn]
    .forEach((btn) => {
      if (!btn) return;
      btn.style.display = isCellCulture ? "" : "none";
    });
  if (exportProjectBtn) exportProjectBtn.style.display = "";

  if (paletteTabs) {
    paletteTabs.innerHTML = "";
    paletteTabs.setAttribute("role", "tablist");
    getWorkspaceTabs(activeWorkspaceId).forEach((tab) => {
      const btn = document.createElement("button");
      btn.className = "palette-tab";
      btn.type = "button";
      btn.dataset.tabId = tab.id;
      btn.textContent = tab.label;
      btn.setAttribute("aria-controls", "paletteList");
      btn.addEventListener("click", () => {
        if (activePaletteTab === tab.id) return;
        activePaletteTab = tab.id;
        paletteTabByWorkspace[activeWorkspaceId] = tab.id;
        updatePaletteTabButtons();
        renderPaletteTiles();
      });
      paletteTabs.appendChild(btn);
    });
    if (!getWorkspaceTabs(activeWorkspaceId).some((tab) => tab.id === activePaletteTab)) {
      activePaletteTab = getWorkspaceTabs(activeWorkspaceId)[0]?.id || "";
      paletteTabByWorkspace[activeWorkspaceId] = activePaletteTab;
    }
    updatePaletteTabButtons();
  }
  renderPaletteTiles();
}

function updatePaletteTabButtons() {
  if (!paletteTabs) return;
  paletteTabs.querySelectorAll(".palette-tab").forEach((btn) => {
    const isActive = btn.dataset.tabId === activePaletteTab;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

function renderPaletteTiles() {
  if (!paletteList) return;
  paletteList.innerHTML = "";
  const workspaceIcons = getWorkspaceIcons(activeWorkspaceId);
  if (activePaletteTab === "protocols") {
    loadProtocolTemplates();
    protocolTemplates.forEach((template) => {
      const tile = document.createElement("button");
      tile.className = "icon-tile";
      tile.type = "button";
      tile.draggable = true;
      tile.dataset.itemType = "protocol-template";
      tile.dataset.protocolTemplateId = template.id;
      tile.dataset.iconLabel = template.name;
      tile.dataset.iconGlyph = template.id;
      tile.innerHTML = `
        <span class="icon-tile__glyph" aria-hidden="true">${getProtocolTileSvg()}</span>
        <span class="icon-tile__label">${template.name}</span>
      `;
      tile.addEventListener("dragstart", onPaletteDragStart);
      tile.addEventListener("dragend", () => {
        canvas.classList.remove("canvas--active");
        lastDragData = null;
      });
      tile.addEventListener("click", () => {
        showTaskToast("Drag this protocol onto a connection arrow.");
      });
      paletteList.appendChild(tile);
    });
    return;
  }
  const visibleIcons = paletteTabs
    ? workspaceIcons.filter((icon) => icon.category === activePaletteTab)
    : workspaceIcons;
  visibleIcons.forEach((icon) => {
    const tile = document.createElement("button");
    tile.className = "icon-tile";
    tile.type = "button";
    tile.draggable = true;
    tile.dataset.iconId = icon.id;
    tile.dataset.iconLabel = icon.label;
    tile.dataset.iconGlyph = icon.id;
    tile.dataset.itemType = "icon";

    tile.innerHTML = `
      <span class="icon-tile__glyph" aria-hidden="true">${getIconSvg(icon, "palette")}</span>
      <span class="icon-tile__label">${icon.label}</span>
    `;

    tile.addEventListener("dragstart", onPaletteDragStart);
    tile.addEventListener("dragend", () => {
      canvas.classList.remove("canvas--active");
      lastDragData = null;
    });
    // Fallback: click to place in center if drag/drop blocked by browser
    tile.addEventListener("click", () => {
      const canvasRect = canvas.getBoundingClientRect();
      const x = canvasRect.width / 2;
      const y = canvasRect.height / 2;
      if (icon.iconKind === "deadline") {
        createGlobalMilestoneAtPoint(x, icon.label, icon.color || "#f472b6");
        return;
      }
      placeIcon({ x, y, iconId: icon.id, label: icon.label });
    });

    paletteList.appendChild(tile);
  });
}

function wireCanvas() {
  const isDropInsideVisibleModal = (event) => {
    const target = event?.target;
    if (!target || typeof target.closest !== "function") return false;
    return !!target.closest(".modal-backdrop:not(.is-hidden)");
  };
  // Allow drops globally and forward to canvas if pointer is over it.
  document.addEventListener("dragover", (e) => e.preventDefault(), true);
  document.addEventListener("drop", (e) => {
    if (isDropInsideVisibleModal(e)) {
      return;
    }
    if (modalDragActive) {
      // Let modal targets handle their own drop events.
      e.preventDefault();
      return;
    }
    // Don't intercept drops inside the housing drawer overlay
    const dropTarget = e.target;
    if (dropTarget && typeof dropTarget.closest === "function" &&
        dropTarget.closest("#animalHousingDrawer")) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      e.preventDefault();
      e.stopPropagation();
      canvas.classList.remove("canvas--active");
      handleDrop(e);
    }
  }, true);

  ["dragover", "dragenter"].forEach((eventName) => {
    canvas.addEventListener(eventName, (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
      canvas.classList.add("canvas--active");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    canvas.addEventListener(eventName, () => {
      canvas.classList.remove("canvas--active");
    });
  });

  canvas.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleDrop(event);
  });

  initCanvasPan();
}

var canvasPanInitialized = false;
function initCanvasPan() {
  if (canvasPanInitialized) return;
  canvasPanInitialized = true;
  let panState = null;

  const endPan = () => {
    if (!panState) return;
    canvas.classList.remove("canvas--panning");
    try {
      canvas.releasePointerCapture?.(panState.pointerId);
    } catch {}
    panState = null;
  };

  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (modalDragActive) return;
    if (canvas.classList.contains("canvas--active")) return;
    if (event.target !== canvas) return;
    panState = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      appliedDayDelta: 0,
      moved: false
    };
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!panState || event.pointerId !== panState.pointerId) return;
    const dx = event.clientX - panState.startClientX;
    if (!panState.moved && Math.abs(dx) < 8) return;
    panState.moved = true;
    canvas.classList.add("canvas--panning");
    const dayDelta = Math.round(dx / Math.max(1, dayWidth));
    const increment = dayDelta - panState.appliedDayDelta;
    if (increment !== 0) {
      // Drag right -> earlier dates; drag left -> later dates.
      shiftTimeline(-increment);
      panState.appliedDayDelta = dayDelta;
    }
    event.preventDefault();
  });

  canvas.addEventListener("pointerup", (event) => {
    if (!panState || event.pointerId !== panState.pointerId) return;
    endPan();
  });

  canvas.addEventListener("pointercancel", (event) => {
    if (!panState || event.pointerId !== panState.pointerId) return;
    endPan();
  });
}

function onPaletteDragStart(event) {
  const { iconId, iconGlyph, iconLabel, itemType, protocolTemplateId } = event.currentTarget.dataset;
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("text/item-type", itemType || "icon");
  event.dataTransfer.setData("text/icon-id", iconId);
  event.dataTransfer.setData("text/icon-glyph", iconGlyph);
  event.dataTransfer.setData("text/icon-label", iconLabel);
  if (protocolTemplateId) event.dataTransfer.setData("text/protocol-template-id", protocolTemplateId);
  event.dataTransfer.setData("text/plain", iconLabel || iconId || "icon");
  console.debug("dragstart", { iconId, iconGlyph, iconLabel, itemType, protocolTemplateId });
  lastDragData = { id: iconId, glyph: iconGlyph, label: iconLabel, itemType, protocolTemplateId };
}

function readDragPayload(event) {
  const dt = event?.dataTransfer || null;
  const fromTransfer = {
    id: String(dt?.getData("text/icon-id") || "").trim(),
    glyph: String(dt?.getData("text/icon-glyph") || "").trim(),
    label: String(dt?.getData("text/icon-label") || "").trim(),
    itemType: String(dt?.getData("text/item-type") || "").trim(),
    protocolTemplateId: String(dt?.getData("text/protocol-template-id") || "").trim(),
    animalId: String(dt?.getData("text/animal-id") || "").trim(),
    plain: String(dt?.getData("text/plain") || "").trim()
  };
  const hasTransferData = !!(
    fromTransfer.id
    || fromTransfer.glyph
    || fromTransfer.label
    || fromTransfer.itemType
    || fromTransfer.protocolTemplateId
    || fromTransfer.animalId
    || fromTransfer.plain
  );
  const fallback = hasTransferData
    ? null
    : {
      id: String(lastDragData?.id || "").trim(),
      glyph: String(lastDragData?.glyph || "").trim(),
      label: String(lastDragData?.label || "").trim(),
      itemType: String(lastDragData?.itemType || "").trim(),
      protocolTemplateId: String(lastDragData?.protocolTemplateId || "").trim(),
      animalId: String(lastDragData?.animalId || "").trim(),
      plain: String(lastDragData?.label || lastDragData?.id || "").trim()
    };
  const payload = fallback || fromTransfer;
  payload.itemType = payload.itemType || "icon";
  return payload;
}

function handleDrop(event) {
  if (modalDragActive) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  event.preventDefault();

  const dragPayload = readDragPayload(event);
  let id = dragPayload.id;
  let glyph = dragPayload.glyph;
  let label = dragPayload.label;
  const itemType = dragPayload.itemType || "icon";
  const protocolTemplateId = dragPayload.protocolTemplateId || "";
  const droppedAnimalId = dragPayload.animalId || "";
  const plain = dragPayload.plain || "";
  console.debug("drop event", { id, glyph, label, plain, itemType, protocolTemplateId, lastDragData });
  if (!id && plain) id = plain.trim();
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  if (itemType === "animal-housing-animal" && droppedAnimalId) {
    // If dropped on a procedure node, assign the animal to it
    const targetProcedure = getProcedureNodeAtCanvasPoint(x, y);
    if (targetProcedure) {
      if (!assignAnimalToProcedureNode(targetProcedure, droppedAnimalId)) {
        showTaskToast("Unable to assign animal to procedure.");
      }
      lastDragData = null;
      return;
    }
    // Otherwise, place the animal as a regular icon on the canvas
    const animalRecord = findAnimalHousingAnimalById(droppedAnimalId);
    const species = animalRecord?.species || "mouse";
    const animalIconId = `animal_${species}`;
    const animalLabel = animalRecord?.name || label || "Animal";
    placeIcon({ x, y, iconId: animalIconId, label: animalLabel, forceCanvas: true });
    lastDragData = null;
    return;
  }
  if (itemType === "protocol-template") {
    const attached = attachProtocolTemplateAtPoint(protocolTemplateId, x, y);
    if (!attached) {
      showTaskToast("Drop protocol icons directly onto an existing connection arrow.");
    }
    lastDragData = null;
    return;
  }
  const matchedIcon = getIconDefinition(id, label)
    || getIconDefinition(glyph, label)
    || getIconDefinition(plain, plain);
  if (matchedIcon) {
    id = matchedIcon.id;
    label = label || matchedIcon.label;
  }
  if (matchedIcon?.iconKind === "deadline") {
    createGlobalMilestoneAtPoint(x, label || matchedIcon.label, matchedIcon.color || "#f472b6");
    return;
  }
  const finalIconId = id || matchedIcon?.id || "";
  const finalLabel = label || matchedIcon?.label || id || "Item";

  placeIcon({ x, y, iconId: finalIconId, label: finalLabel });
  lastDragData = null;
}

function placeIcon({ x, y, iconId, label, forceCanvas = false }) {
  const iconDef = getIconDefinition(iconId, label);
  const isPlanningTask = activeWorkspaceId === "planning" && iconDef?.iconKind === "planning-task";
  const isAnimalWorkspace = activeWorkspaceId === "animal-work";
  const isAnimalProcedure = isAnimalWorkspace && iconDef?.iconKind === "animal-procedure";
  const isCageIcon = !forceCanvas && isAnimalWorkspace && iconDef?.iconKind === "cage";
  const isAnimalIcon = !forceCanvas && isAnimalWorkspace && iconDef?.iconKind === "animal";
  if (isCageIcon) {
    const stageRect = animalHousingStage?.getBoundingClientRect();
    const boardX = stageRect ? x + (animalHousingBoard?.scrollLeft || 0) : 24;
    const boardY = stageRect ? y + (animalHousingBoard?.scrollTop || 0) : 24;
    addHousingCageFromIcon(iconDef, boardX, boardY);
    return null;
  }
  if (isAnimalIcon) {
    const species = String(iconDef?.animalType || "").trim().toLowerCase();
    const preferred = animalHousingState.cages.find((cage) => {
      if (String(cage.species || "") !== species) return false;
      return getAnimalsInHousingCage(cage.id).length < Number(cage.capacity || 0);
    });
    if (!preferred) {
      showTaskToast(`Create an available ${getCageSpeciesLabel(species)} cage first.`);
      return null;
    }
    addHousingAnimalFromIcon(iconDef, preferred.id);
    return null;
  }
  const defaultHeight = isPlanningTask
    ? PLANNING_TASK_HEIGHT
    : isAnimalProcedure
    ? ANIMAL_PROCEDURE_NODE_HEIGHT
    : isCageIcon
    ? CAGE_NODE_HEIGHT
    : isAnimalIcon
    ? ANIMAL_NODE_HEIGHT
    : MIN_NODE_WIDTH;
  const minWidth = isPlanningTask
    ? PLANNING_TASK_MIN_WIDTH
    : isAnimalProcedure
    ? ANIMAL_PROCEDURE_NODE_MIN_WIDTH
    : isCageIcon
    ? CAGE_NODE_MIN_WIDTH
    : isAnimalIcon
    ? ANIMAL_NODE_MIN_WIDTH
    : MIN_NODE_WIDTH;
  const spanDays = 1;
  let startDay = getDayIndexForX(x);
  startDay = clamp(startDay, 0, dayCount - spanDays);
  const absDay = getBaseDay() + startDay;
  const width = Math.max(minWidth, spanDays * dayWidth - DAY_PADDING * 2);
  const boundedX = clamp(dayToLeft(startDay), 8, canvas.clientWidth - width - 8);
  const { y: snappedY } = snapY(y - defaultHeight / 2, null, defaultHeight);
  const minY = TIMELINE_HEIGHT + 12;
  const boundedY = clamp(snappedY, minY, getCanvasMaxTopForHeight(defaultHeight));

  let targetCage = null;
  if (isAnimalIcon) {
    const animalSpecies = String(iconDef?.animalType || "").trim().toLowerCase();
    targetCage = findCageAtCanvasPoint(x, y, activeWorkspaceId);
    if (!targetCage) {
      showTaskToast(`Drop ${label || "animal"} into a matching cage.`);
      return null;
    }
    const validation = validateAnimalPlacementInCage(animalSpecies, targetCage);
    if (!validation.ok) {
      showTaskToast(validation.message);
      return null;
    }
  }

  const drop = document.createElement("div");
  drop.className = "drop";
  const dropIcon = document.createElement("span");
  dropIcon.className = "drop__icon";
  dropIcon.setAttribute("aria-hidden", "true");
  if (iconDef) {
    dropIcon.innerHTML = getIconSvg(iconDef, "node");
  } else {
    dropIcon.textContent = "⬜";
  }
  drop.style.left = `${boundedX}px`;
  drop.style.top = `${boundedY}px`;
  drop.style.width = `${width}px`;
  if (defaultHeight !== MIN_NODE_WIDTH) {
    drop.style.height = `${defaultHeight}px`;
  }
  drop.tabIndex = 0;
  drop.setAttribute("role", "img");
  drop.setAttribute("aria-label", label || "Placed icon");
  drop.dataset.nodeId = `n-${nodeIdCounter++}`;
  drop.dataset.dayIndex = startDay;
  drop.dataset.startDay = startDay;
  drop.dataset.spanDays = spanDays;
  drop.dataset.absDay = absDay;
  drop.dataset.startMinuteOffset = 0;
  drop.dataset.taskRecurringTasks = "[]";
  drop.dataset.workspace = activeWorkspaceId;
  drop.dataset.nodeType = iconDef?.iconKind || "";
  if (iconDef?.id) drop.dataset.iconId = iconDef.id;
  if (activeWorkspaceId === "planning" && iconDef?.iconKind === "planning-task") {
    drop.classList.add("drop--planning-task");
  }
  if (isAnimalProcedure) {
    drop.classList.add("drop--animal-procedure");
    drop.dataset.procedureAnimalIds = "[]";
    if (iconDef?.procedureType) drop.dataset.procedureType = String(iconDef.procedureType);
  }
  if (isCageIcon) {
    const cageSpecies = String(iconDef?.cageType || "").trim().toLowerCase();
    const defaultCapacity = getDefaultCageCapacityForSpecies(cageSpecies);
    if (cageSpecies) drop.dataset.cageSpecies = cageSpecies;
    drop.dataset.cageCapacity = String(defaultCapacity);
    drop.classList.add("drop--cage");
  }
  if (isAnimalIcon) {
    const animalSpecies = String(iconDef?.animalType || "").trim().toLowerCase();
    if (animalSpecies) drop.dataset.animalSpecies = animalSpecies;
    drop.classList.add("drop--animal");
  }
  if (isMultiWellPlateIconId(iconDef?.id)) {
    drop.dataset.plateGroups = JSON.stringify({ selectedGroupId: "", groups: [] });
    // Plate wells carry their own plans, keep node-level plans empty.
    drop.dataset.mediaPlan = "[]";
    drop.dataset.additivesPlan = "[]";
    drop.dataset.removalsPlan = "[]";
    drop.dataset.taskStatus = "{}";
    drop.dataset.taskCompletedAt = "{}";
    drop.dataset.taskMeta = "{}";
  }

  const nameInput = document.createElement("textarea");
  nameInput.className = "node-label";
  nameInput.placeholder = (activeWorkspaceId === "planning" && iconDef?.iconKind === "planning-task")
    ? "Task name..."
    : isAnimalProcedure
    ? "Procedure..."
    : "Name...";
  nameInput.value = label || "";
  nameInput.addEventListener("click", (event) => event.stopPropagation());
  nameInput.addEventListener("dblclick", (event) => {
    event.stopPropagation();
    if (isPlanningTaskNode(drop) && getNodeWorkspace(drop) === "planning") {
      openPlanningTaskModal(drop);
      return;
    }
    if (isAnimalProcedure) {
      openAnimalProcedureModal(drop);
      return;
    }
    if (isAnimalNode(drop) && getNodeWorkspace(drop) === "animal-work") {
      showStartModal(drop, false);
      return;
    }
    // Cell Culture: a vessel/dish/starting-material node IS its culture record —
    // double-clicking it opens the record editor (the label intercepts dblclick
    // before it can reach the node-level handler, so the branch lives here too).
    if (getNodeWorkspace(drop) === "cell-culture" && window.WLPCulture) {
      const iconId = String(drop.dataset.iconId || "");
      if (isVesselOrDishNode(drop) || iconId === "cell_line" || iconId === "primary_tissue") {
        window.WLPCulture.openRecord(drop);
        return;
      }
    }
    enableLabelEditing(nameInput);
  });
  nameInput.addEventListener("input", () => {
    autosizeLabel(nameInput);
    renderPlanningTaskPanel();
    renderAnimalTransferPanel();
    updateLogPanel();
  });
  nameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      nameInput.blur();
    }
  });
  nameInput.addEventListener("blur", () => {
    nameInput.readOnly = true;
    nameInput.classList.add("node-label--readonly");
  });

  addHandles(drop);
  addResizeHandle(drop);
  drop.appendChild(dropIcon);
  drop.appendChild(nameInput);

  drop.addEventListener("click", (event) => {
    if (event.target.classList.contains("handle")) return;
    if (event.target.classList.contains("node-label")) return;
    selectNode(drop);
    if (isVesselOrDishNode(drop)) {
      toggleVesselDishTaskStrip(drop);
    }
  });
  drop.addEventListener("dblclick", (event) => {
    event.stopPropagation();
    if (isPlanningTaskNode(drop) && getNodeWorkspace(drop) === "planning") {
      openPlanningTaskModal(drop);
      return;
    }
    if (isAnimalProcedure) {
      openAnimalProcedureModal(drop);
      return;
    }
    if (isAnimalNode(drop) && getNodeWorkspace(drop) === "animal-work") {
      showStartModal(drop, false);
      return;
    }
    if (isCageNode(drop) && getNodeWorkspace(drop) === "animal-work") {
      openCageCapacityModal(drop);
      return;
    }
    if (isMultiWellPlateNode(drop)) {
      openPlateSelectorModal(drop);
      return;
    }
    showNodeMenu(drop);
  });

  enableMove(drop);

  canvas.appendChild(drop);
  if (targetCage) {
    drop.dataset.cageId = String(targetCage.dataset.nodeId || "");
    settleAnimalNodeInCage(drop, targetCage);
  }
  toggleHint();
  enableLabelEditing(nameInput);
  autosizeLabel(nameInput);
  if (isAnimalProcedure) renderAnimalProcedureBadge(drop);
  if (isMultiWellPlateNode(drop)) renderPlateNodeOverlay(drop);
  applyWorkspaceVisibility();
  applyPlanningDependencyVisuals();
  renderPlanningTaskPanel();
  scheduleCanvasSync();

  if (isPlanningTaskNode(drop) && getNodeWorkspace(drop) === "planning") {
    return drop;
  }

  showStartModal(drop, true);
  return drop;
}

function wireDropNode(drop) {
  const nameInput = drop.querySelector(".node-label");
  if (nameInput) {
    nameInput.addEventListener("click", (event) => event.stopPropagation());
    nameInput.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      if (isPlanningTaskNode(drop) && getNodeWorkspace(drop) === "planning") {
        openPlanningTaskModal(drop);
        return;
      }
      if (isAnimalProcedureNode(drop)) {
        openAnimalProcedureModal(drop);
        return;
      }
      if (isAnimalNode(drop) && getNodeWorkspace(drop) === "animal-work") {
        showStartModal(drop, false);
        return;
      }
      enableLabelEditing(nameInput);
    });
    nameInput.addEventListener("input", () => {
      autosizeLabel(nameInput);
      renderPlanningTaskPanel();
      renderAnimalTransferPanel();
      updateLogPanel();
    });
    nameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") nameInput.blur();
    });
    nameInput.addEventListener("blur", () => {
      nameInput.readOnly = true;
      nameInput.classList.add("node-label--readonly");
    });
  }
  addHandles(drop);
  addResizeHandle(drop);
  drop.addEventListener("click", (event) => {
    if (event.target.classList.contains("handle")) return;
    if (event.target.classList.contains("node-label")) return;
    selectNode(drop);
    if (isVesselOrDishNode(drop)) toggleVesselDishTaskStrip(drop);
  });
  drop.addEventListener("dblclick", (event) => {
    event.stopPropagation();
    if (isPlanningTaskNode(drop) && getNodeWorkspace(drop) === "planning") {
      openPlanningTaskModal(drop); return;
    }
    if (isAnimalProcedureNode(drop)) {
      openAnimalProcedureModal(drop); return;
    }
    if (isAnimalNode(drop) && getNodeWorkspace(drop) === "animal-work") {
      showStartModal(drop, false); return;
    }
    if (isCageNode(drop) && getNodeWorkspace(drop) === "animal-work") {
      openCageCapacityModal(drop); return;
    }
    if (isMultiWellPlateNode(drop)) {
      openPlateSelectorModal(drop); return;
    }
    // Cell Culture: a vessel/dish/starting-material node IS its culture record.
    if (getNodeWorkspace(drop) === "cell-culture" && window.WLPCulture) {
      const iconId = String(drop.dataset.iconId || "");
      const isCulture = isVesselOrDishNode(drop) || iconId === "cell_line" || iconId === "primary_tissue";
      if (isCulture) { window.WLPCulture.openRecord(drop); return; }
    }
    showNodeMenu(drop);
  });
  enableMove(drop);
  if (isAnimalProcedureNode(drop)) renderAnimalProcedureBadge(drop);
  if (isMultiWellPlateNode(drop)) renderPlateNodeOverlay(drop);
}

function isAnimalProcedureNode(node) {
  return node.classList.contains("drop--animal-procedure") || String(node.dataset.nodeType || "") === "animal-procedure";
}

// Allow repositioning of placed icons without affecting the main canvas drop handling.
function enableMove(element) {
  let startX;
  let startY;
  let originLeft;
  let originTop;
  let moved = false;
  let cageFollowers = [];

  const onPointerMove = (event) => {
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (!moved) {
      const distance = Math.hypot(deltaX, deltaY);
      if (distance < MOVE_DRAG_THRESHOLD) return;
      moved = true;
    }
    const nextX = clamp(originLeft + deltaX, 0, canvas.clientWidth - element.offsetWidth);
    const { y: snappedY } = snapY(originTop + deltaY, element);
    element.style.left = `${nextX}px`;
    element.style.top = `${snappedY}px`;
    if (cageFollowers.length) {
      cageFollowers.forEach((entry) => {
        const animalNode = entry.node;
        if (!animalNode || !canvas.contains(animalNode)) return;
        animalNode.style.left = `${Math.round(entry.left + deltaX)}px`;
        animalNode.style.top = `${Math.round(entry.top + deltaY)}px`;
      });
    }
    updateAllConnections();
  };

  const onPointerUp = () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    if (moved) {
      snapNodeToDay(element);
      snapNodeToY(element);
      if (isCageNode(element) && getNodeWorkspace(element) === "animal-work") {
        settleAnimalsInCage(element);
      }
      handleAnimalTransferAfterMove(element);
      updateAllConnections();
      updateTaskAlerts();
      renderPlanningTaskPanel();
      scheduleCanvasSync();
    }
    cageFollowers = [];
    moved = false;
  };

  element.addEventListener("pointerdown", (event) => {
    if (event.target.classList.contains("node-label")) return;
    if (event.target.closest(".task-strip")) return;
    if (event.target.closest(".plate-well-row")) return;
    startX = event.clientX;
    startY = event.clientY;
    originLeft = parseFloat(element.style.left);
    originTop = parseFloat(element.style.top);
    if (isCageNode(element) && getNodeWorkspace(element) === "animal-work") {
      cageFollowers = getAnimalsInCage(element).map((animalNode) => ({
        node: animalNode,
        left: parseFloat(animalNode.style.left) || 0,
        top: parseFloat(animalNode.style.top) || 0
      }));
    } else {
      cageFollowers = [];
    }
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  });
}

function toggleHint() {
  if (!hint) return;
  const hasDrops = Array.from(canvas.querySelectorAll(".drop")).some((node) => isNodeInActiveWorkspace(node));
  hint.style.display = hasDrops ? "none" : "block";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function addHandles(node) {
  const directions = ["top", "right", "bottom", "left"];
  directions.forEach((dir) => {
    const handle = document.createElement("span");
    handle.className = `handle handle--${dir}`;
    handle.dataset.handleDir = dir;
    handle.addEventListener("pointerdown", (event) => startLinkDrag(event, node, dir));
    node.appendChild(handle);
  });
}

function addResizeHandle(node) {
  const handle = document.createElement("span");
  handle.className = "resize-handle";
  handle.addEventListener("pointerdown", (event) => startResize(event, node, handle));
  node.appendChild(handle);
}

function startLinkDrag(event, node, dir) {
  event.preventDefault();
  event.stopPropagation();

  const pointerId = event.pointerId;
  canvas.classList.add("canvas--linking");
  const tempLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  tempLine.classList.add("temp-line");
  connectionsLayer.appendChild(tempLine);

  const start = getHandlePosition(node, dir);
  tempLine.setAttribute("x1", start.x);
  tempLine.setAttribute("y1", start.y);
  tempLine.setAttribute("x2", start.x);
  tempLine.setAttribute("y2", start.y);

  const onMove = (moveEvent) => {
    const point = toCanvasPoint(moveEvent.clientX, moveEvent.clientY);
    tempLine.setAttribute("x2", point.x);
    tempLine.setAttribute("y2", point.y);
  };

  const onUp = (upEvent) => {
    node.releasePointerCapture?.(pointerId);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    canvas.classList.remove("canvas--linking");

    const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
    const targetHandle = target?.closest(".handle");
    const targetNode = targetHandle?.closest(".drop");
    const targetDir = targetHandle?.dataset.handleDir;

    if (
      targetNode &&
      targetNode !== node &&
      targetDir
    ) {
      beginPendingLink(node, dir, targetNode, targetDir);
    }

    tempLine.remove();
  };

  node.setPointerCapture?.(pointerId);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function startResize(event, node, handleEl) {
  event.preventDefault();
  event.stopPropagation();

  const pointerId = event.pointerId;
  const startSpan = parseInt(node.dataset.spanDays ?? "1", 10);
  const startDay = getNodeStartDay(node);
  const canvasRect = canvas.getBoundingClientRect();

  const onMove = (moveEvent) => {
    const x = moveEvent.clientX - canvasRect.left;
    const dayLeft = dayToLeft(startDay);
    const rawSpan = Math.round((x - dayLeft) / dayWidth);
    const newSpan = clamp(rawSpan, 1, dayCount - startDay);
    node.dataset.spanDays = newSpan;
    node.dataset.spanManual = "1";
    const width = spanToWidth(newSpan, node);
    node.style.width = `${width}px`;
    updateAllConnections();
  };

  const onUp = () => {
    node.releasePointerCapture?.(pointerId);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    snapNodeToDay(node);
    renderNodeTasks(node);
    renderPlanningTaskPanel();
    updateAllConnections();
  };

  node.setPointerCapture?.(pointerId);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function toCanvasPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function clearPendingLink() {
  pendingLink = null;
}

function getNodeById(nodeId) {
  if (!nodeId) return null;
  return canvas.querySelector(`.drop[data-node-id="${nodeId}"]`);
}

function beginPendingLink(fromNode, fromDir, toNode, toDir) {
  const fromId = fromNode?.dataset?.nodeId || "";
  const toId = toNode?.dataset?.nodeId || "";
  if (!fromId || !toId || fromId === toId) return;
  pendingLink = {
    fromId,
    toId,
    fromDir,
    toDir,
    fromGroupId: "",
    toGroupId: ""
  };
  resolvePendingLinkSource();
}

function resolvePendingLinkSource() {
  if (!pendingLink) return;
  const fromNode = getNodeById(pendingLink.fromId);
  const toNode = getNodeById(pendingLink.toId);
  if (!fromNode || !toNode) {
    clearPendingLink();
    return;
  }
  if (!isMultiWellPlateNode(fromNode)) {
    resolvePendingLinkTarget();
    return;
  }
  openPlateSelectorModal(fromNode, { mode: "link-source" });
}

function resolvePendingLinkTarget() {
  if (!pendingLink) return;
  const fromNode = getNodeById(pendingLink.fromId);
  const toNode = getNodeById(pendingLink.toId);
  if (!fromNode || !toNode) {
    clearPendingLink();
    return;
  }
  if (!isMultiWellPlateNode(toNode)) {
    finalizePendingLink();
    return;
  }

  const parsed = readPlateGroups(toNode, false) || { selectedGroupId: "", groups: [] };
  const groups = Array.isArray(parsed.groups) ? parsed.groups : [];
  if (groups.length) {
    writePlateGroups(toNode, parsed);
  }
  // Always show target-group selector for plate targets so each link can be bound explicitly.
  openPlateSelectorModal(toNode, { mode: "link-target" });
}

function finalizePendingLink() {
  if (!pendingLink) return;
  const fromNode = getNodeById(pendingLink.fromId);
  const toNode = getNodeById(pendingLink.toId);
  if (!fromNode || !toNode) {
    clearPendingLink();
    return;
  }

  const fromGroupId = pendingLink.fromGroupId || "";
  const toGroupId = pendingLink.toGroupId || "";
  if (isMultiWellPlateNode(fromNode) && !fromGroupId) {
    clearPendingLink();
    return;
  }
  if (isMultiWellPlateNode(toNode) && !toGroupId) {
    clearPendingLink();
    return;
  }

  addConnection(fromNode, pendingLink.fromDir, toNode, pendingLink.toDir, {
    fromGroupId,
    toGroupId
  });
  clearPendingLink();
  requestAnimationFrame(() => {
    if (isMultiWellPlateNode(toNode) && toGroupId) {
      showNodeMenu(toNode, { plateGroupId: toGroupId });
    }
  });
}

function connectionGroupIdExists(node, groupId) {
  if (!groupId) return true;
  if (!isMultiWellPlateNode(node)) return false;
  const parsed = readPlateGroups(node, false);
  if (!parsed?.groups?.length) return false;
  return parsed.groups.some((group) => group.id === groupId);
}

function getPlateGroupAnchorPosition(node, groupId, dir) {
  if (!node || !groupId || !isMultiWellPlateNode(node)) return null;
  const canvasRect = canvas.getBoundingClientRect();
  const anchor = node.querySelector(`.plate-well-row__start-anchor[data-group-id="${groupId}"]`);
  if (!anchor) return null;
  const anchorRect = anchor.getBoundingClientRect();
  const anchorX = anchorRect.left - canvasRect.left + anchorRect.width / 2;
  const anchorY = anchorRect.top - canvasRect.top + anchorRect.height / 2;
  // Push endpoint just outside the start marker so arrowheads remain fully visible.
  const markerRadius = Math.max(anchorRect.width, anchorRect.height) / 2;
  const edgeOffset = Math.max(10, Math.round(markerRadius + 7));
  if (dir === "left") return { x: anchorX - edgeOffset, y: anchorY };
  if (dir === "right") return { x: anchorX + edgeOffset, y: anchorY };
  if (dir === "top") return { x: anchorX, y: anchorY - edgeOffset };
  if (dir === "bottom") return { x: anchorX, y: anchorY + edgeOffset };
  return { x: anchorX, y: anchorY };
}

function getConnectionTailVector(points, fallbackDir) {
  const end = points[points.length - 1];
  for (let i = points.length - 2; i >= 0; i -= 1) {
    const prev = points[i];
    const dx = end.x - prev.x;
    const dy = end.y - prev.y;
    const len = Math.hypot(dx, dy);
    if (len > ARROW_TAIL_VECTOR_MIN) {
      return { end, dx, dy, len };
    }
  }
  for (let i = points.length - 2; i >= 0; i -= 1) {
    const prev = points[i];
    const dx = end.x - prev.x;
    const dy = end.y - prev.y;
    const len = Math.hypot(dx, dy);
    if (len > 0.5) {
      return { end, dx, dy, len };
    }
  }
  if (fallbackDir === "left") return { end, dx: -1, dy: 0, len: 1 };
  if (fallbackDir === "right") return { end, dx: 1, dy: 0, len: 1 };
  if (fallbackDir === "top") return { end, dx: 0, dy: -1, len: 1 };
  if (fallbackDir === "bottom") return { end, dx: 0, dy: 1, len: 1 };
  return { end, dx: 1, dy: 0, len: 1 };
}

function getConnectionEndpointPosition(node, dir, groupId = "") {
  if (groupId && isMultiWellPlateNode(node)) {
    const anchor = getPlateGroupAnchorPosition(node, groupId, dir);
    if (anchor) return anchor;
  }
  return getHandlePosition(node, dir);
}

function orthogonalSegmentIntersectsRect(a, b, rect) {
  const vertical = Math.abs(a.x - b.x) < 0.1;
  const horizontal = Math.abs(a.y - b.y) < 0.1;
  if (!vertical && !horizontal) return false;
  if (vertical) {
    const x = a.x;
    if (x < rect.left || x > rect.right) return false;
    const segMin = Math.min(a.y, b.y);
    const segMax = Math.max(a.y, b.y);
    return segMax >= rect.top && segMin <= rect.bottom;
  }
  const y = a.y;
  if (y < rect.top || y > rect.bottom) return false;
  const segMin = Math.min(a.x, b.x);
  const segMax = Math.max(a.x, b.x);
  return segMax >= rect.left && segMin <= rect.right;
}

function polylineIntersectsRoutingObstacles(points, sourceNode = null, targetNode = null) {
  if (!Array.isArray(points) || points.length < 2) return false;
  const bounds = getRoutingBounds();
  const obstacles = collectRoutingObstacles(sourceNode, targetNode, bounds, {
    includeSource: true,
    includeTarget: true,
    endpointPadding: ROUTE_ENDPOINT_PADDING
  });
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (obstacles.some((rect) => orthogonalSegmentIntersectsRect(a, b, rect))) {
      return true;
    }
  }
  return false;
}

function addConnection(fromNode, fromDir, toNode, toDir, options = {}) {
  const fromId = fromNode.dataset.nodeId;
  const toId = toNode.dataset.nodeId;
  const fromWorkspace = getNodeWorkspace(fromNode);
  const toWorkspace = getNodeWorkspace(toNode);
  const workspaceId = String(options?.workspaceId || fromWorkspace || activeWorkspaceId || DEFAULT_WORKSPACE_ID);
  const fromGroupId = String(options?.fromGroupId || "").trim();
  const toGroupId = String(options?.toGroupId || "").trim();

  if (!fromId || !toId) return;
  if (fromWorkspace !== toWorkspace) return;
  if (isMultiWellPlateNode(fromNode) && !connectionGroupIdExists(fromNode, fromGroupId)) return;
  if (isMultiWellPlateNode(toNode) && !connectionGroupIdExists(toNode, toGroupId)) return;
  // Prevent duplicate directional links.
  const exists = connections.some(
    (c) =>
      (c.workspaceId || DEFAULT_WORKSPACE_ID) === workspaceId &&
      c.fromId === fromId &&
      c.toId === toId
  );
  if (exists) {
    showTaskToast("A link between these two nodes already exists.");
    return;
  }

  const id = `c-${connectionIdCounter++}`;
  const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
  line.dataset.connectionId = id;
  line.dataset.workspaceId = workspaceId;
  line.dataset.fromId = fromId;
  line.dataset.toId = toId;
  line.dataset.fromGroupId = fromGroupId;
  line.dataset.toGroupId = toGroupId;
  line.addEventListener("click", (event) => {
    event.stopPropagation();
    selectConnection(id, line);
  });
  connectionsLayer.appendChild(line);

  let topEl = null;
  if (connectionsTopLayer) {
    topEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
    topEl.classList.add("link-end-overlay");
    topEl.setAttribute("marker-end", "url(#arrowhead-top)");
    connectionsTopLayer.appendChild(topEl);
  }

  connections.push({
    id,
    fromId,
    toId,
    fromDir,
    toDir,
    workspaceId,
    fromGroupId,
    toGroupId,
    el: line,
    topEl,
    cachedPoints: null,
    protocol: null,
    protocolIconEl: null,
    protocolTaskEl: null,
    protocolTasksCollapsed: false
  });
  updateAllConnections();
  renderPlanningTaskPanel();
  scheduleCanvasSync();
}

function removeConnection(id) {
  const index = connections.findIndex((c) => c.id === id);
  if (index === -1) return;
  const [removed] = connections.splice(index, 1);
  if (selection?.id === id) {
    clearSelection();
  }
  removed.el.remove();
  removed.topEl?.remove();
  removed.protocolIconEl?.remove();
  removed.protocolTaskEl?.remove();
  applyPlanningDependencyVisuals();
  renderPlanningTaskPanel();
  scheduleCanvasSync();
}

function removeConnectionsForNode(nodeId) {
  const affected = connections.filter((c) => c.fromId === nodeId || c.toId === nodeId);
  affected.forEach((c) => removeConnection(c.id));
}

function getHandlePosition(node, dir) {
  const handle = node.querySelector(`.handle--${dir}`);
  const canvasRect = canvas.getBoundingClientRect();

  if (handle) {
    const rect = handle.getBoundingClientRect();
    return {
      x: rect.left - canvasRect.left + rect.width / 2,
      y: rect.top - canvasRect.top + rect.height / 2
    };
  }

  // Fallback to geometric calculation if handle missing
  const rect = node.getBoundingClientRect();
  const centerX = rect.left - canvasRect.left + rect.width / 2;
  const centerY = rect.top - canvasRect.top + rect.height / 2;
  const offsetX = rect.width / 2 + HANDLE_OFFSET;
  const offsetY = rect.height / 2 + HANDLE_OFFSET;

  if (dir === "top") return { x: centerX, y: centerY - offsetY };
  if (dir === "bottom") return { x: centerX, y: centerY + offsetY };
  if (dir === "left") return { x: centerX - offsetX, y: centerY };
  if (dir === "right") return { x: centerX + offsetX, y: centerY };
  return { x: centerX, y: centerY };
}

function updateAllConnections() {
  const prepared = [];

  connections.forEach((connection) => {
    const connectionWorkspace = String(connection.workspaceId || DEFAULT_WORKSPACE_ID);
    const workspaceVisible = connectionWorkspace === activeWorkspaceId;
    connection.el.style.display = workspaceVisible ? "" : "none";
    if (connection.topEl) connection.topEl.style.display = workspaceVisible ? "" : "none";
    if (connection.protocolIconEl) connection.protocolIconEl.style.display = workspaceVisible ? "" : "none";
    if (connection.protocolTaskEl) connection.protocolTaskEl.style.display = workspaceVisible ? "" : "none";
    if (!workspaceVisible) return;

    const fromNode = canvas.querySelector(`.drop[data-node-id="${connection.fromId}"]`);
    const toNode = canvas.querySelector(`.drop[data-node-id="${connection.toId}"]`);
    const fromGroupId = String(connection.fromGroupId || "");
    const toGroupId = String(connection.toGroupId || "");

    if (!fromNode || !toNode) {
      removeConnection(connection.id);
      return;
    }
    if (fromGroupId && !connectionGroupIdExists(fromNode, fromGroupId)) {
      removeConnection(connection.id);
      return;
    }
    if (toGroupId && !connectionGroupIdExists(toNode, toGroupId)) {
      removeConnection(connection.id);
      return;
    }

    const fromPos = getConnectionEndpointPosition(fromNode, connection.fromDir, fromGroupId);
    const toPos = getConnectionEndpointPosition(toNode, connection.toDir, toGroupId);

    const points = buildOrthogonalPoints(
      { ...fromPos, dir: connection.fromDir, node: fromNode },
      { ...toPos, dir: connection.toDir, node: toNode }
    );

    prepared.push({
      connection,
      points,
      basePoints: points.map((point) => ({ ...point })),
      fromNode,
      toNode,
      fromKey: `${connection.fromId}-${connection.fromDir}`,
      toKey: `${connection.toId}-${connection.toDir}`
    });
  });

  // Build overlap map keyed by each segment's orientation + coord
  const segmentsMap = new Map(); // key -> list of {connId, idx, dir}

  prepared.forEach((item, connIdx) => {
    const pts = item.points;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const vertical = Math.abs(a.x - b.x) < 0.1;
      const horizontal = Math.abs(a.y - b.y) < 0.1;
      const key = vertical
        ? `v:${roundCoord(a.x)}:${rangeKey(a.y, b.y)}`
        : horizontal
        ? `h:${roundCoord(a.y)}:${rangeKey(a.x, b.x)}`
        : null;
      if (!key) continue;
      if (!segmentsMap.has(key)) segmentsMap.set(key, []);
      segmentsMap.get(key).push({ item, segIndex: i, vertical });
    }
  });

  // Accumulate offsets per point to keep joints orthogonal and shared
  const pointOffsets = new WeakMap(); // points array reference -> {dx:[], dy:[]}

  const getOffsets = (pts) => {
    if (!pointOffsets.has(pts)) {
      pointOffsets.set(pts, {
        dx: Array(pts.length).fill(0),
        dy: Array(pts.length).fill(0)
      });
    }
    return pointOffsets.get(pts);
  };

  segmentsMap.forEach((list) => {
    if (list.length <= 1) return;
    list.forEach((entry, idx) => {
      const offsetAmount = (idx - (list.length - 1) / 2) * LANE_OFFSET;
      const { item, segIndex, vertical } = entry;
      const pts = item.points;
      const { dx, dy } = getOffsets(pts);
      const i1 = segIndex;
      const i2 = segIndex + 1;

      const apply = (i, isEnd) => {
        // Keep endpoints and their immediate elbows fixed so lane spacing cannot push routes
        // back through node bodies when many links share lanes.
        const protectStartZone = i <= 1;
        const protectEndZone = i >= pts.length - 2;
        if (isEnd || protectStartZone || protectEndZone) return;
        if (vertical) dx[i] += offsetAmount;
        else dy[i] += offsetAmount;
      };

      const isLast = i2 === pts.length - 1;

      apply(i1, false);
      apply(i2, isLast);
    });
  });

  // Apply accumulated offsets to points (except endpoints)
  prepared.forEach((item) => {
    const pts = item.points;
    const offsets = pointOffsets.get(pts);
    if (offsets) {
      for (let i = 1; i < pts.length - 1; i++) {
        pts[i].x += offsets.dx[i];
        pts[i].y += offsets.dy[i];
      }
    }

    // Re-enforce orthogonality: each segment stays horizontal or vertical
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x;
      const dy = pts[i + 1].y - pts[i].y;
      if (Math.abs(dx) >= Math.abs(dy)) {
        // horizontal segment
        pts[i + 1].y = pts[i].y;
      } else {
        // vertical segment
        pts[i + 1].x = pts[i].x;
      }
    }

    // Remove collinear points created by lane offset + orthogonality re-enforcement
    item.points = mergeCollinear(item.points);

    // Lane offsetting can push a route into an icon. Fall back to the unshifted path in that case.
    if (polylineIntersectsRoutingObstacles(item.points, item.fromNode, item.toNode)) {
      item.points = item.basePoints.map((point) => ({ ...point }));
    }
  });

  // Write back
  prepared.forEach((item) => {
    item.points.forEach((point) => {
      point.x = roundCoord(point.x);
      point.y = roundCoord(point.y);
    });
    item.connection.cachedPoints = item.points;
    const pathD = polylinePointsToRoundedPath(item.points, ROUTE_CORNER_RADIUS);
    item.connection.el.setAttribute("d", pathD);
    if (item.connection.topEl) {
      const hasGroupEndpoint = !!(item.connection.fromGroupId || item.connection.toGroupId);
      if (hasGroupEndpoint) {
        // For plate-group links, keep the full stroke on the top layer so it never dips behind node overlays.
        item.connection.topEl.setAttribute("d", pathD);
      } else {
        const { end, dx, dy, len } = getConnectionTailVector(item.points, item.connection.toDir);
        const seg = Math.max(ARROW_TAIL_SEGMENT_MIN, Math.min(ARROW_TAIL_SEGMENT_MAX, len));
        const x1 = end.x - (dx / len) * seg;
        const y1 = end.y - (dy / len) * seg;
        item.connection.topEl.setAttribute("d", `M${x1},${y1} L${end.x},${end.y}`);
      }
    }
    updateConnectionProtocolDisplay(item.connection, item.points);
  });

  applyPlanningDependencyVisuals();
}

function getConnectionById(connectionId) {
  const id = String(connectionId || "").trim();
  if (!id) return null;
  return connections.find((connection) => connection.id === id) || null;
}

function parseConnectionPointsAttribute(raw) {
  const text = String(raw || "").trim();
  if (!text) return [];
  return text
    .split(/\s+/)
    .map((pair) => {
      const [xText, yText] = pair.split(",");
      const x = Number(xText);
      const y = Number(yText);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return { x, y };
    })
    .filter(Boolean);
}

function pointSegmentDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return Math.hypot(px - ax, py - ay);
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1);
  const qx = ax + t * dx;
  const qy = ay + t * dy;
  return Math.hypot(px - qx, py - qy);
}

function getPolylineMidpoint(points) {
  if (!Array.isArray(points) || points.length < 2) return null;
  let total = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    total += Math.hypot(b.x - a.x, b.y - a.y);
  }
  if (total <= 0) return { ...points[0] };
  const half = total / 2;
  let cursor = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (cursor + len >= half) {
      const t = (half - cursor) / (len || 1);
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t
      };
    }
    cursor += len;
  }
  return { ...points[points.length - 1] };
}

function getClosestConnectionAtPoint(x, y, threshold = 22) {
  let best = null;
  connections.forEach((connection) => {
    if (String(connection.workspaceId || DEFAULT_WORKSPACE_ID) !== activeWorkspaceId) return;
    const points = connection.cachedPoints || parseConnectionPointsAttribute(connection.el?.getAttribute("points"));
    if (points.length < 2) return;
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      const distance = pointSegmentDistance(x, y, a.x, a.y, b.x, b.y);
      if (!best || distance < best.distance) {
        best = { connection, distance };
      }
    }
  });
  if (!best || best.distance > threshold) return null;
  return best.connection;
}

function getProtocolTaskSteps(protocol) {
  const steps = Array.isArray(protocol?.steps) ? protocol.steps : [];
  return steps.filter((step) => step?.task);
}

function syncConnectionProtocolTaskState(connection) {
  if (!connection?.protocol) return;
  const normalized = normalizeProtocolData(connection.protocol, connection.protocol.name || "Protocol");
  normalized.taskState = normalizeProtocolTaskState(normalized.taskState, normalized.steps);
  connection.protocol = normalized;
}

function getProtocolTaskSummary(step) {
  const bits = [];
  const inventoryText = formatProtocolInventoryRef(step.inventoryRef);
  if (inventoryText) bits.push(inventoryText);
  const duration = String(step.duration || "").trim();
  const durationUnit = String(step.durationUnit || "").trim();
  if (duration) bits.push(`${duration}${durationUnit ? ` ${durationUnit}` : ""}`);
  const temperature = String(step.temperature || "").trim();
  if (temperature) bits.push(`${temperature}°C`);
  const storage = String(step.storage || "").trim();
  if (storage) bits.push(`${storage}°C`);
  const speed = String(step.speed || "").trim();
  const speedUnit = String(step.speedUnit || "").trim() || "g";
  if (speed) bits.push(`${speed} ${speedUnit}`);
  const repeats = String(step.repeats || "").trim();
  if (repeats) bits.push(`${repeats}x`);
  const ratio = String(step.ratio || "").trim();
  if (ratio) bits.push(`ratio ${ratio}`);
  const volume = String(step.volume || "").trim();
  const volumeUnit = String(step.volumeUnit || "").trim() || "mL";
  if (volume) bits.push(`${volume} ${volumeUnit}`);
  const location = String(step.location || "").trim();
  if (location) bits.push(`to ${location}`);
  const description = String(step.description || "").trim();
  if (description) bits.push(description);
  const notes = String(step.notes || "").trim();
  if (notes && !description) bits.push(notes);
  return bits.join(" • ");
}

function getNodeDisplayName(node) {
  if (!node) return "Untitled";
  const typed = String(node.querySelector(".node-label")?.value || "").trim();
  if (typed) return typed;
  const iconDef = getIconDefinition(node.dataset.iconId, "");
  return iconDef?.label || "Untitled";
}

function getConnectionDisplayName(connection) {
  const fromNode = getNodeById(connection?.fromId);
  const toNode = getNodeById(connection?.toId);
  const fromName = getNodeDisplayName(fromNode);
  const toName = getNodeDisplayName(toNode);
  return `${fromName} -> ${toName}`;
}

function updateConnectionProtocolTaskStrip(connection, anchor) {
  if (!connection?.protocol) {
    connection?.protocolTaskEl?.remove();
    connection.protocolTaskEl = null;
    return;
  }
  syncConnectionProtocolTaskState(connection);
  const tasks = getProtocolTaskSteps(connection.protocol);
  if (!tasks.length) {
    connection.protocolTaskEl?.remove();
    connection.protocolTaskEl = null;
    return;
  }
  let strip = connection.protocolTaskEl;
  if (!strip) {
    strip = document.createElement("div");
    strip.className = "connection-protocol-tasks";
    strip.addEventListener("click", (event) => event.stopPropagation());
    canvas.appendChild(strip);
    connection.protocolTaskEl = strip;
  }
  strip.innerHTML = "";
  const header = document.createElement("button");
  header.type = "button";
  header.className = "connection-protocol-tasks__header";
  header.textContent = `${connection.protocol.name} tasks`;
  header.addEventListener("click", () => {
    connection.protocolTasksCollapsed = !connection.protocolTasksCollapsed;
    updateConnectionProtocolTaskStrip(connection, anchor);
  });
  strip.appendChild(header);

  const body = document.createElement("div");
  body.className = "connection-protocol-tasks__body";
  body.style.display = connection.protocolTasksCollapsed ? "none" : "block";
  tasks.forEach((step) => {
    const state = connection.protocol.taskState?.[step.id] || {};
    const row = document.createElement("div");
    row.className = "connection-protocol-task-row";
    if (state.completed) row.classList.add("is-done");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = !!state.completed;
    check.addEventListener("change", () => {
      const next = { ...(connection.protocol.taskState?.[step.id] || {}) };
      if (check.checked) {
        if (next.assignee && currentUser && next.assignee !== currentUser) {
          check.checked = false;
          showTaskToast(`Assigned to ${next.assignee}. Reassign before completing.`);
          return;
        }
        next.completed = true;
        next.completedAt = Date.now();
        next.completedBy = currentUser || next.assignee || "Unknown";
      } else {
        next.completed = false;
        next.completedAt = 0;
        next.completedBy = "";
      }
      if (!connection.protocol.taskState) connection.protocol.taskState = {};
      connection.protocol.taskState[step.id] = next;
      updateConnectionProtocolTaskStrip(connection, anchor);
      updateConnectionProtocolDisplay(connection);
      updateLogPanel();
    });

    const text = document.createElement("div");
    text.className = "connection-protocol-task-row__text";
    const title = document.createElement("div");
    title.className = "connection-protocol-task-row__title";
    title.textContent = step.title || protocolStepLibraryByType(step.type)?.label || "Protocol step";
    const detail = document.createElement("div");
    detail.className = "connection-protocol-task-row__detail";
    const summary = getProtocolTaskSummary(step);
    detail.textContent = summary || "No timing details";
    text.appendChild(title);
    text.appendChild(detail);

    const assignBtn = document.createElement("button");
    assignBtn.type = "button";
    assignBtn.className = "connection-protocol-task-row__assign";
    assignBtn.textContent = state.assignee ? state.assignee : "Assign";
    assignBtn.addEventListener("click", () => {
      showAssignModal(null, null, {
        selectedAssignee: state.assignee || "",
        onSave: (user) => {
          const next = { ...(connection.protocol.taskState?.[step.id] || {}) };
          next.assignee = user;
          if (!connection.protocol.taskState) connection.protocol.taskState = {};
          connection.protocol.taskState[step.id] = next;
          updateConnectionProtocolTaskStrip(connection, anchor);
          updateLogPanel();
        }
      });
    });

    row.appendChild(check);
    row.appendChild(text);
    row.appendChild(assignBtn);
    body.appendChild(row);
  });
  strip.appendChild(body);

  const stripW = 280;
  const stripH = connection.protocolTasksCollapsed ? 46 : Math.min(360, 58 + tasks.length * 60);
  const left = clamp((anchor?.x || 0) + 12, 8, Math.max(8, canvas.clientWidth - stripW - 8));
  const top = clamp((anchor?.y || 0) + 18, TIMELINE_HEIGHT + 12, Math.max(TIMELINE_HEIGHT + 12, canvas.clientHeight - stripH - 10));
  strip.style.left = `${left}px`;
  strip.style.top = `${top}px`;
}

function updateConnectionProtocolDisplay(connection, points = null) {
  if (!connection) return;
  if (!connection.protocol) {
    connection.protocolIconEl?.remove();
    connection.protocolIconEl = null;
    connection.protocolTaskEl?.remove();
    connection.protocolTaskEl = null;
    return;
  }
  syncConnectionProtocolTaskState(connection);
  const polyPoints = Array.isArray(points) && points.length >= 2
    ? points
    : (connection.cachedPoints || parseConnectionPointsAttribute(connection.el?.getAttribute("points")));
  if (!polyPoints.length) return;
  const mid = getPolylineMidpoint(polyPoints) || polyPoints[Math.floor(polyPoints.length / 2)];
  let icon = connection.protocolIconEl;
  if (!icon) {
    icon = document.createElement("button");
    icon.type = "button";
    icon.className = "connection-protocol-icon";
    icon.addEventListener("click", (event) => {
      event.stopPropagation();
      openProtocolBuilder(connection.id);
    });
    canvas.appendChild(icon);
    connection.protocolIconEl = icon;
  }
  const tasks = getProtocolTaskSteps(connection.protocol);
  const doneCount = tasks.filter((step) => connection.protocol.taskState?.[step.id]?.completed).length;
  icon.textContent = `P`;
  icon.title = `${connection.protocol.name} (${doneCount}/${tasks.length} tasks complete)`;
  icon.classList.toggle("is-complete", tasks.length > 0 && doneCount === tasks.length);
  icon.style.left = `${mid.x}px`;
  icon.style.top = `${mid.y}px`;
  updateConnectionProtocolTaskStrip(connection, mid);
}

function attachProtocolTemplateAtPoint(templateId, x, y) {
  const connection = getClosestConnectionAtPoint(x, y, 24);
  if (!connection) return false;
  const template = protocolTemplateById(templateId) || protocolTemplates[0];
  if (!template) return false;
  connection.protocol = normalizeProtocolData(
    {
      name: template.name,
      steps: cloneProtocolData(template.protocol?.steps || []),
      links: cloneProtocolData(template.protocol?.links || []),
      taskState: {}
    },
    template.name
  );
  syncConnectionProtocolTaskState(connection);
  updateConnectionProtocolDisplay(connection);
  updateLogPanel();
  openProtocolBuilder(connection.id);
  showTaskToast(`Attached protocol "${template.name}" to ${getConnectionDisplayName(connection)}.`);
  return true;
}

function groupBy(list, keyFn) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return map;
}

window.addEventListener("resize", updateAllConnections);
window.addEventListener("resize", updateTimelineLayout);

canvas.addEventListener("click", (event) => {
  if (event.target === canvas || event.target === connectionsLayer) {
    clearSelection();
  }
});

function selectNode(node) {
  clearSelection();
  selection = { type: "node", id: node.dataset.nodeId, el: node };
  node.classList.add("drop--selected");
  deleteButton.classList.remove("is-hidden");
}

function selectConnection(id, el) {
  clearSelection();
  selection = { type: "connection", id, el };
  el.classList.add("link--selected");
  deleteButton.classList.remove("is-hidden");
}

function clearSelection() {
  if (!selection) return;
  if (selection.type === "node") {
    selection.el.classList.remove("drop--selected");
  } else if (selection.type === "connection") {
    selection.el.classList.remove("link--selected");
  }
  selection = null;
  deleteButton.classList.add("is-hidden");
}

function handleDeleteSelection() {
  if (!selection) return;
  if (selection.type === "node") {
    removeConnectionsForNode(selection.id);
    // Cell-culture lineage: clear any child's parent pointer before its parent
    // node disappears, so lineage references don't dangle (P0/M2).
    try {
      canvas
        .querySelectorAll('.drop[data-culture-parent-node-id="' + selection.id + '"]')
        .forEach((child) => { delete child.dataset.cultureParentNodeId; });
    } catch { /* */ }
    selection.el.remove();
    toggleHint();
    updateAllConnections();
    renderPlanningTaskPanel();
  } else if (selection.type === "connection") {
    removeConnection(selection.id);
  }
  clearSelection();
  updateLogPanel();
  scheduleCanvasSync();
}

function enableLabelEditing(input) {
  input.readOnly = false;
  input.classList.remove("node-label--readonly");
  setTimeout(() => {
    input.focus();
    input.select();
  }, 0);
  autosizeLabel(input);
}

function autosizeLabel(input) {
  const node = input?.closest(".drop");
  if (node && isPlanningTaskNode(node) && getNodeWorkspace(node) === "planning") {
    input.style.height = "18px";
    return;
  }
  input.style.height = "auto";
  input.style.height = `${input.scrollHeight}px`;
}

function initTimeline() {
  const today = new Date();
  startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(today.getDate() + START_OFFSET_DAYS);
  rebuildTimeline();
}

function rebuildTimeline() {
  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
  const today = new Date();
  timelineEl.style.gridTemplateColumns = `repeat(${dayCount}, 1fr)`;
  timelineEl.innerHTML = "";
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dayEl = document.createElement("div");
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    dayEl.className = `timeline__day${isWeekend ? " weekend" : ""}`;
    dayEl.textContent = getTimelineLabel(d, i);
    timelineEl.appendChild(dayEl);
  }
  todayIndex = Math.round((today.setHours(0, 0, 0, 0) - startDate.getTime()) / (1000 * 60 * 60 * 24));
  updateTimelineLayout();
}

function getTimelineLabel(dateObj, index) {
  // Dynamic granularity: days up to 5 weeks, weeks up to ~5 months, months beyond.
  if (dayCount <= 35) {
    return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(dateObj);
  }
  if (dayCount <= 150) {
    // show label on first day of each week (Monday)
    const isWeekStart = dateObj.getDay() === 1 || index === 0;
    if (!isWeekStart) return "";
    const { week, year } = getISOWeek(dateObj);
    return `W${week} ${year}`;
  }
  // Month view: label first day of month
  const isMonthStart = dateObj.getDate() === 1 || index === 0;
  if (!isMonthStart) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(dateObj);
}

function getISOWeek(date) {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
  return { week: weekNum, year: tmp.getUTCFullYear() };
}

function startNowTimer() {
  if (nowTimer) clearInterval(nowTimer);
  updateNowMarker();
  nowTimer = setInterval(updateNowMarker, 1000);
}

function updateNowMarker() {
  if (!todayLineEl || !startDate) return;
  const now = new Date();
  const msPerDay = 86400000;
  const offsetDays = (now - startDate) / msPerDay;
  const rawX = offsetDays * dayWidth;
  const x = clamp(rawX, 0, canvas.clientWidth);
  const canvasRect = canvas.getBoundingClientRect();
  const screenX = canvasRect.left + x;

  todayLineEl.style.display = "block";
  todayLineEl.style.left = `${x}px`;
  todayTriangleEl.style.display = "block";
  todayTriangleEl.style.left = `${x}px`;
  const triTop = -2; // bring triangle a bit lower
  todayTriangleEl.style.top = `${triTop}px`;
  todayTimeEl.style.display = "block";
  todayTimeEl.style.left = `${screenX}px`;
  const labelTop = canvasRect.top + triTop - 36; // place above triangle, outside canvas
  todayTimeEl.style.top = `${labelTop}px`;
  todayTimeEl.textContent = now.toLocaleTimeString([], { hour12: false });
}

function shiftTimeline(deltaDays) {
  startDate.setDate(startDate.getDate() + deltaDays);
  rebuildTimeline();
  resnapAllNodes();
  updateTaskAlerts();
  hideNodeMenu();
  updateNowMarker();
}

function jumpToToday() {
  const today = new Date();
  startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(today.getDate() + START_OFFSET_DAYS);
  rebuildTimeline();
  resnapAllNodes();
  updateTaskAlerts();
  updateNowMarker();
}

function adjustDayCount(delta) {
  const next = clamp(dayCount + delta, MIN_DAY_COUNT, MAX_DAY_COUNT);
  if (next === dayCount) return;
  dayCount = next;
  rebuildTimeline();
  resnapAllNodes();
  updateTaskAlerts();
  updateNowMarker();
}

function updateTimelineLayout() {
  dayWidth = canvas.clientWidth / dayCount;
  dayCenters = Array.from({ length: dayCount }, (_, i) => i * dayWidth + dayWidth / 2);
  renderDayGrid();

  // Position today's line if within range
  if (todayIndex >= 0 && todayIndex < dayCount) {
    updateNowMarker();
  } else {
    todayLineEl.style.display = "none";
    todayTriangleEl.style.display = "none";
    todayTimeEl.style.display = "none";
  }

  // Re-snap existing nodes to their stored day index or nearest
  canvas.querySelectorAll(".drop").forEach((node) => {
    snapNodeToStoredDay(node);
  });

  renderWeekendStripes();
  updateAllConnections();
  renderGlobalMilestones();
}

function renderWeekendStripes() {
  const stripeLayer = document.getElementById("weekendStripes");
  if (!stripeLayer) return;
  stripeLayer.innerHTML = "";
  stripeLayer.style.setProperty("--day-count", dayCount);
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    if (!isWeekend) continue;
    const band = document.createElement("div");
    band.className = "weekend-stripes__band";
    band.style.left = `${i * dayWidth}px`;
    band.style.width = `${dayWidth}px`;
    stripeLayer.appendChild(band);
  }
}

function renderDayGrid() {
  const grid = document.getElementById("dayGrid");
  if (!grid) return;
  grid.innerHTML = "";
  for (let i = 1; i < dayCount; i++) {
    const line = document.createElement("div");
    line.className = "day-grid__line";
    const x = i * dayWidth;
    line.style.left = `${x}px`;
    grid.appendChild(line);
  }
}

function getNearestDayCenter(x) {
  const index = getDayIndexForX(x);
  return dayCenters[index] ?? x;
}

function getDayIndexForX(x) {
  if (!dayCenters.length || dayWidth === 0) return 0;
  const index = Math.floor(x / dayWidth);
  return clamp(index, 0, dayCount - 1);
}

function dayToLeft(dayIndex) {
  return dayIndex * dayWidth + DAY_PADDING;
}

function canvasXToAbsDay(x) {
  if (!Number.isFinite(x) || dayWidth <= 0) return getBaseDay();
  const rawDay = x / dayWidth;
  return getBaseDay() + clamp(rawDay, 0, dayCount);
}

function normalizeMilestoneColor(color) {
  const normalized = normalizePlateGroupColor(color);
  if (!normalized) return "";
  if (MILESTONE_COLORS.includes(normalized)) return normalized;
  return normalized;
}

function getMilestoneById(milestoneId) {
  const id = String(milestoneId || "").trim();
  if (!id) return null;
  return globalMilestones.find((entry) => String(entry.id || "") === id) || null;
}

function ensureMilestoneModalColorSwatches(selectedColor = "") {
  if (!milestoneModalColorList) return;
  const normalizedSelected = normalizeMilestoneColor(selectedColor) || MILESTONE_COLORS[0];
  milestoneModalSelectedColor = normalizedSelected;
  milestoneModalColorList.innerHTML = "";
  MILESTONE_COLORS.forEach((color) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "color-swatch";
    btn.dataset.color = color;
    btn.style.setProperty("--swatch-color", color);
    btn.classList.toggle("is-selected", color === normalizedSelected);
    btn.setAttribute("aria-label", `Select color ${color}`);
    btn.addEventListener("click", () => {
      milestoneModalSelectedColor = color;
      ensureMilestoneModalColorSwatches(color);
    });
    milestoneModalColorList.appendChild(btn);
  });
}

function initMilestoneModal() {
  if (milestoneModal) return;
  milestoneModal = document.createElement("div");
  milestoneModal.className = "modal-backdrop modal-backdrop--center is-hidden";
  milestoneModal.innerHTML = `
    <div class="modal modal--milestone">
      <div class="modal__header">
        <h3 class="modal__title">Edit Milestone</h3>
        <button type="button" data-milestone-close>&times;</button>
      </div>
      <div class="modal__body">
        <div class="field field--stacked">
          <label for="milestoneNameInput">Milestone name</label>
          <input id="milestoneNameInput" type="text" maxlength="48" placeholder="Milestone">
        </div>
        <div class="field field--stacked">
          <label>Color</label>
          <div id="milestoneColorList" class="color-swatch-list"></div>
        </div>
        <div class="field field--stacked">
          <label for="milestoneDateInput">Date</label>
          <input id="milestoneDateInput" type="date">
        </div>
      </div>
      <div class="modal__footer">
        <button type="button" data-milestone-delete>Delete</button>
        <button type="button" data-milestone-cancel>Cancel</button>
        <button type="button" data-milestone-save>Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(milestoneModal);

  milestoneModalName = milestoneModal.querySelector("#milestoneNameInput");
  milestoneModalColorList = milestoneModal.querySelector("#milestoneColorList");
  milestoneModalDate = milestoneModal.querySelector("#milestoneDateInput");

  const closeEls = milestoneModal.querySelectorAll("[data-milestone-close], [data-milestone-cancel]");
  closeEls.forEach((el) => el.addEventListener("click", hideMilestoneModal));
  milestoneModal.querySelector("[data-milestone-save]")?.addEventListener("click", saveMilestoneModal);
  milestoneModal.querySelector("[data-milestone-delete]")?.addEventListener("click", deleteMilestoneModal);
  milestoneModal.addEventListener("click", (event) => {
    if (event.target === milestoneModal) hideMilestoneModal();
  });
}

function openMilestoneModal(milestoneId) {
  const id = String(milestoneId || "").trim();
  const milestone = getMilestoneById(id);
  if (!milestone) return;
  initMilestoneModal();
  milestoneModalMilestoneId = id;
  if (milestoneModalName) {
    milestoneModalName.value = String(milestone.label || "Milestone").trim() || "Milestone";
  }
  const color = normalizeMilestoneColor(milestone.color) || MILESTONE_COLORS[0];
  ensureMilestoneModalColorSwatches(color);
  if (milestoneModalDate) {
    const dt = new Date((Number(milestone.absDay) || getBaseDay()) * DAY_MS);
    const { dateStr } = splitDateTime(dt);
    milestoneModalDate.value = dateStr;
  }
  milestoneModal.classList.remove("is-hidden");
  milestoneModal.style.display = "flex";
  setTimeout(() => milestoneModalName?.focus(), 0);
}

function hideMilestoneModal() {
  if (!milestoneModal) return;
  milestoneModal.classList.add("is-hidden");
  milestoneModal.style.display = "none";
  milestoneModalMilestoneId = "";
  milestoneModalSelectedColor = "";
  if (milestoneModalDate) milestoneModalDate.value = "";
}

function saveMilestoneModal() {
  const milestone = getMilestoneById(milestoneModalMilestoneId);
  if (!milestone) {
    hideMilestoneModal();
    return;
  }
  const rawName = String(milestoneModalName?.value || "").trim();
  const name = rawName || "Milestone";
  const color = normalizeMilestoneColor(milestoneModalSelectedColor) || MILESTONE_COLORS[0];
  const parsedAbsDay = parseYyyyMmDdToAbsDay(milestoneModalDate?.value || "");
  milestone.label = name;
  milestone.color = color;
  if (Number.isFinite(parsedAbsDay)) {
    milestone.absDay = parsedAbsDay;
  }
  renderGlobalMilestones();
  hideMilestoneModal();
  scheduleCanvasSync();
}

function deleteMilestoneModal() {
  const id = String(milestoneModalMilestoneId || "").trim();
  if (!id) {
    hideMilestoneModal();
    return;
  }
  const idx = globalMilestones.findIndex((entry) => String(entry.id || "") === id);
  if (idx !== -1) {
    globalMilestones.splice(idx, 1);
    renderGlobalMilestones();
  }
  hideMilestoneModal();
  scheduleCanvasSync();
}

function milestoneXToAbsDay(x) {
  if (!Number.isFinite(x) || dayWidth <= 0) return getBaseDay();
  const adjusted = (x - DAY_PADDING) / dayWidth;
  return getBaseDay() + clamp(adjusted, 0, dayCount);
}

function milestoneAbsDayToX(absDay) {
  const startDay = Number(absDay) - getBaseDay();
  return dayToLeft(startDay);
}

function startMilestoneDrag(event, milestoneId, marker) {
  if (!event || event.button !== 0 || !marker) return;
  const id = String(milestoneId || "").trim();
  const milestone = getMilestoneById(id);
  if (!milestone) return;
  event.preventDefault();
  event.stopPropagation();

  const pointerId = event.pointerId;
  const initialX = milestoneAbsDayToX(milestone.absDay);
  milestoneDragState = {
    marker,
    pointerId,
    milestoneId: id,
    startClientX: event.clientX,
    startX: initialX,
    moved: false
  };
  marker.classList.add("is-dragging");
  marker.setPointerCapture?.(pointerId);

  const onMove = (moveEvent) => {
    if (!milestoneDragState || moveEvent.pointerId !== milestoneDragState.pointerId) return;
    const dx = moveEvent.clientX - milestoneDragState.startClientX;
    if (!milestoneDragState.moved && Math.abs(dx) < 2) return;
    milestoneDragState.moved = true;
    const targetX = clamp(milestoneDragState.startX + dx, 0, canvas.clientWidth);
    const targetAbsDay = milestoneXToAbsDay(targetX);
    milestone.absDay = targetAbsDay;
    marker.style.left = `${milestoneAbsDayToX(targetAbsDay)}px`;
  };

  const endDrag = (upEvent) => {
    if (!milestoneDragState || upEvent.pointerId !== milestoneDragState.pointerId) return;
    marker.releasePointerCapture?.(pointerId);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
    marker.classList.remove("is-dragging");
    if (milestoneDragState.moved) {
      renderGlobalMilestones();
    }
    milestoneDragState = null;
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);
}

function initCageCapacityModal() {
  if (cageCapacityModal) return;
  cageCapacityModal = document.createElement("div");
  cageCapacityModal.className = "modal-backdrop modal-backdrop--center is-hidden";
  cageCapacityModal.innerHTML = `
    <div class="modal modal--cage-capacity">
      <div class="modal__header">
        <h3 class="modal__title">Cage Capacity</h3>
        <button type="button" data-cage-capacity-close>&times;</button>
      </div>
      <div class="modal__body">
        <div class="field field--stacked">
          <label>Species</label>
          <div id="cageCapacitySpeciesLabel" class="pill">-</div>
        </div>
        <div class="field field--stacked">
          <label for="cageCapacityInput">Max animals per cage</label>
          <input id="cageCapacityInput" type="number" min="1" max="24" step="1" inputmode="numeric">
          <label class="check-row cage-capacity-default-row">
            <input id="cageCapacitySaveDefaultInput" type="checkbox" checked>
            Save as default for future cages of this species
          </label>
          <small class="muted-text">Uncheck to change only this cage.</small>
        </div>
      </div>
      <div class="modal__footer">
        <button type="button" data-cage-capacity-cancel>Cancel</button>
        <button type="button" data-cage-capacity-save>Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(cageCapacityModal);
  cageCapacitySpeciesLabel = cageCapacityModal.querySelector("#cageCapacitySpeciesLabel");
  cageCapacityInput = cageCapacityModal.querySelector("#cageCapacityInput");
  cageCapacitySaveDefaultInput = cageCapacityModal.querySelector("#cageCapacitySaveDefaultInput");
  cageCapacityModal
    .querySelectorAll("[data-cage-capacity-close], [data-cage-capacity-cancel]")
    .forEach((el) => el.addEventListener("click", hideCageCapacityModal));
  cageCapacityModal
    .querySelector("[data-cage-capacity-save]")
    ?.addEventListener("click", saveCageCapacityModal);
  cageCapacityModal.addEventListener("click", (event) => {
    if (event.target === cageCapacityModal) hideCageCapacityModal();
  });
}

function openCageCapacityModal(node) {
  if (!node || !isCageNode(node) || getNodeWorkspace(node) !== "animal-work") return;
  initCageCapacityModal();
  cageCapacityModalNodeId = String(node.dataset.nodeId || "");
  const species = getCageSpeciesForNode(node);
  if (cageCapacitySpeciesLabel) {
    cageCapacitySpeciesLabel.textContent = `${getCageSpeciesLabel(species)} cage`;
  }
  if (cageCapacityInput) {
    cageCapacityInput.value = String(getCageCapacity(node));
  }
  if (cageCapacitySaveDefaultInput) {
    cageCapacitySaveDefaultInput.checked = true;
  }
  cageCapacityModal.classList.remove("is-hidden");
  cageCapacityModal.style.display = "flex";
  setTimeout(() => cageCapacityInput?.focus(), 0);
}

function hideCageCapacityModal() {
  if (!cageCapacityModal) return;
  cageCapacityModal.classList.add("is-hidden");
  cageCapacityModal.style.display = "none";
  cageCapacityModalNodeId = "";
}

function saveCageCapacityModal() {
  const cageNode = getNodeById(cageCapacityModalNodeId);
  if (!cageNode || !isCageNode(cageNode)) {
    hideCageCapacityModal();
    return;
  }
  const raw = Number(cageCapacityInput?.value);
  const nextCapacity = Number.isFinite(raw) ? Math.max(1, Math.min(24, Math.round(raw))) : NaN;
  if (!Number.isFinite(nextCapacity)) {
    showTaskToast("Enter a valid cage capacity.");
    return;
  }
  const occupants = getAnimalsInCage(cageNode).length;
  if (nextCapacity < occupants) {
    showTaskToast(`Cannot set below current occupancy (${occupants}).`);
    return;
  }
  const species = getCageSpeciesForNode(cageNode);
  cageNode.dataset.cageCapacity = String(nextCapacity);
  if (species && cageCapacitySaveDefaultInput?.checked) {
    animalCageCapacityDefaults[species] = nextCapacity;
  }
  settleAnimalsInCage(cageNode);
  hideCageCapacityModal();
}

function createGlobalMilestoneAtPoint(x, label = "Milestone", color = "#f472b6") {
  const absDay = milestoneXToAbsDay(x);
  const entry = {
    id: `ms-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    absDay,
    label: String(label || "Milestone").trim() || "Milestone",
    color: normalizeMilestoneColor(color) || MILESTONE_COLORS[0],
    createdAt: Date.now()
  };
  globalMilestones.push(entry);
  renderGlobalMilestones();
}

function renderGlobalMilestones() {
  if (!milestoneLayer) return;
  milestoneLayer.innerHTML = "";
  const baseDay = getBaseDay();
  globalMilestones.forEach((milestone) => {
    const startDay = Number(milestone.absDay) - baseDay;
    const x = dayToLeft(startDay);
    if (!Number.isFinite(x) || x < -8 || x > canvas.clientWidth + 8) return;
    const marker = document.createElement("div");
    marker.className = "milestone-marker";
    marker.dataset.milestoneId = String(milestone.id || "");
    marker.style.left = `${x}px`;
    marker.style.setProperty("--milestone-color", normalizeMilestoneColor(milestone.color) || MILESTONE_COLORS[0]);
    marker.title = "Double-click to edit milestone";
    marker.innerHTML = `
      <span class="milestone-marker__diamond" aria-hidden="true"></span>
      <span class="milestone-marker__label">${escapeSvgText(milestone.label || "Milestone")}</span>
    `;
    marker.addEventListener("pointerdown", (event) => {
      startMilestoneDrag(event, milestone.id, marker);
    });
    marker.addEventListener("dblclick", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openMilestoneModal(milestone.id);
    });
    milestoneLayer.appendChild(marker);
  });
}

function spanToWidth(span, node = null) {
  let minWidth = MIN_NODE_WIDTH;
  if (node) {
    if (isPlanningTaskNode(node) && getNodeWorkspace(node) === "planning") {
      minWidth = PLANNING_TASK_MIN_WIDTH;
    } else if (isCageNode(node) && getNodeWorkspace(node) === "animal-work") {
      minWidth = CAGE_NODE_MIN_WIDTH;
    } else if (isAnimalNode(node) && getNodeWorkspace(node) === "animal-work") {
      minWidth = ANIMAL_NODE_MIN_WIDTH;
    }
  }
  return Math.max(minWidth, span * dayWidth - DAY_PADDING * 2);
}

function hashTextToIndex(text, size) {
  const limit = Math.max(1, size | 0);
  let hash = 2166136261;
  const src = String(text || "");
  for (let i = 0; i < src.length; i += 1) {
    hash ^= src.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0) % limit;
}

function buildPlanningDependencyState() {
  const planningNodes = Array.from(canvas.querySelectorAll(".drop"))
    .filter((node) => getNodeWorkspace(node) === "planning" && isPlanningTaskNode(node));
  const nodeById = new Map();
  planningNodes.forEach((node) => {
    const nodeId = String(node.dataset.nodeId || "");
    if (!nodeId) return;
    nodeById.set(nodeId, node);
  });
  const adjacency = new Map();
  const outboundByNodeId = new Map();
  const inboundByNodeId = new Map();
  const inboundCountByNodeId = new Map();
  const outboundCountByNodeId = new Map();
  nodeById.forEach((_, nodeId) => {
    adjacency.set(nodeId, new Set());
    outboundByNodeId.set(nodeId, new Set());
    inboundByNodeId.set(nodeId, new Set());
    inboundCountByNodeId.set(nodeId, 0);
    outboundCountByNodeId.set(nodeId, 0);
  });

  const planningConnectionIds = new Set();
  connections.forEach((connection) => {
    if (String(connection.workspaceId || DEFAULT_WORKSPACE_ID) !== "planning") return;
    const fromId = String(connection.fromId || "");
    const toId = String(connection.toId || "");
    if (!nodeById.has(fromId) || !nodeById.has(toId)) return;
    planningConnectionIds.add(connection.id);
    adjacency.get(fromId)?.add(toId);
    adjacency.get(toId)?.add(fromId);
    outboundByNodeId.get(fromId)?.add(toId);
    inboundByNodeId.get(toId)?.add(fromId);
    outboundCountByNodeId.set(fromId, (outboundCountByNodeId.get(fromId) || 0) + 1);
    inboundCountByNodeId.set(toId, (inboundCountByNodeId.get(toId) || 0) + 1);
  });

  const compareNodeIds = (aId, bId) => {
    const a = nodeById.get(aId);
    const b = nodeById.get(bId);
    const aAbs = parseFloat(a?.dataset?.absDay ?? "NaN");
    const bAbs = parseFloat(b?.dataset?.absDay ?? "NaN");
    const aStart = Number.isFinite(aAbs) ? aAbs : (parseFloat(a?.dataset?.startDay ?? a?.dataset?.dayIndex ?? "0") || 0);
    const bStart = Number.isFinite(bAbs) ? bAbs : (parseFloat(b?.dataset?.startDay ?? b?.dataset?.dayIndex ?? "0") || 0);
    if (aStart !== bStart) return aStart - bStart;
    return getNodeLabelText(a).localeCompare(getNodeLabelText(b));
  };

  const nodeColorById = new Map();
  const visited = new Set();
  Array.from(nodeById.keys()).sort(compareNodeIds).forEach((seedId) => {
    if (visited.has(seedId)) return;
    const queue = [seedId];
    const component = [];
    visited.add(seedId);
    while (queue.length) {
      const current = queue.shift();
      component.push(current);
      (adjacency.get(current) || []).forEach((nextId) => {
        if (visited.has(nextId)) return;
        visited.add(nextId);
        queue.push(nextId);
      });
    }
    const overrideColor = component
      .map((nodeId) => normalizePlateGroupColor(nodeById.get(nodeId)?.dataset?.planningGroupColor))
      .find(Boolean);
    const hasDependencyLinks = component.some((nodeId) => (adjacency.get(nodeId)?.size || 0) > 0);
    const key = component.slice().sort().join("|");
    const autoColor = hasDependencyLinks
      ? PLANNING_DEPENDENCY_COLORS[hashTextToIndex(key, PLANNING_DEPENDENCY_COLORS.length)]
      : "";
    const color = overrideColor || autoColor || "";
    if (color) component.forEach((nodeId) => nodeColorById.set(nodeId, color));
  });

  const connectionColorById = new Map();
  connections.forEach((connection) => {
    if (!planningConnectionIds.has(connection.id)) return;
    const fromColor = nodeColorById.get(String(connection.fromId || ""));
    const toColor = nodeColorById.get(String(connection.toId || ""));
    const color = fromColor || toColor || "";
    if (color) connectionColorById.set(connection.id, color);
  });

  const indegree = new Map();
  const depthByNodeId = new Map();
  nodeById.forEach((_, nodeId) => {
    indegree.set(nodeId, inboundByNodeId.get(nodeId)?.size || 0);
    depthByNodeId.set(nodeId, 0);
  });
  const ready = Array.from(nodeById.keys())
    .filter((nodeId) => (indegree.get(nodeId) || 0) === 0)
    .sort(compareNodeIds);
  const ordered = [];
  const seen = new Set();
  while (ready.length) {
    const current = ready.shift();
    if (seen.has(current)) continue;
    seen.add(current);
    ordered.push(current);
    const baseDepth = depthByNodeId.get(current) || 0;
    const nextNodes = Array.from(outboundByNodeId.get(current) || []).sort(compareNodeIds);
    nextNodes.forEach((nextId) => {
      const nextDepth = Math.max(depthByNodeId.get(nextId) || 0, baseDepth + 1);
      depthByNodeId.set(nextId, nextDepth);
      const remaining = (indegree.get(nextId) || 0) - 1;
      indegree.set(nextId, remaining);
      if (remaining === 0) {
        ready.push(nextId);
      }
    });
    ready.sort(compareNodeIds);
  }
  Array.from(nodeById.keys()).sort(compareNodeIds).forEach((nodeId) => {
    if (seen.has(nodeId)) return;
    ordered.push(nodeId);
  });
  const orderByNodeId = new Map();
  ordered.forEach((nodeId, idx) => orderByNodeId.set(nodeId, idx));

  return {
    nodeById,
    adjacency,
    inboundByNodeId,
    outboundByNodeId,
    nodeColorById,
    connectionColorById,
    inboundCountByNodeId,
    outboundCountByNodeId,
    depthByNodeId,
    orderByNodeId,
    planningConnectionIds
  };
}

function getPlanningComponentNodeIds(seedNodeId, dependencyState = null) {
  const seed = String(seedNodeId || "").trim();
  if (!seed) return [];
  const state = dependencyState || buildPlanningDependencyState();
  const adjacency = state?.adjacency;
  if (!adjacency || !adjacency.has(seed)) return [seed];
  const queue = [seed];
  const visited = new Set([seed]);
  while (queue.length) {
    const current = queue.shift();
    (adjacency.get(current) || []).forEach((nextId) => {
      if (visited.has(nextId)) return;
      visited.add(nextId);
      queue.push(nextId);
    });
  }
  return Array.from(visited);
}

function ensurePlanningTaskDependencyBadge(node) {
  if (!node) return null;
  let badge = node.querySelector(".planning-task-deps");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "planning-task-deps";
    node.appendChild(badge);
  }
  return badge;
}

function applyPlanningDependencyVisuals() {
  const state = buildPlanningDependencyState();
  const planningNodes = Array.from(canvas.querySelectorAll(".drop"))
    .filter((node) => getNodeWorkspace(node) === "planning" && isPlanningTaskNode(node));

  planningNodes.forEach((node) => {
    const nodeId = String(node.dataset.nodeId || "");
    const depColor = state.nodeColorById.get(nodeId) || "";
    const inbound = state.inboundCountByNodeId.get(nodeId) || 0;
    const outbound = state.outboundCountByNodeId.get(nodeId) || 0;
    const isComplete = node.dataset.planningComplete === "1";
    node.classList.add("drop--planning-task");
    node.classList.toggle("drop--planning-linked", !!depColor);
    node.classList.toggle("drop--planning-has-inbound", inbound > 0);
    node.classList.toggle("drop--planning-has-outbound", outbound > 0);
    node.classList.toggle("drop--planning-complete", isComplete);
    if (depColor) node.style.setProperty("--planning-dependency-color", depColor);
    else node.style.removeProperty("--planning-dependency-color");

    const label = node.querySelector(".node-label");
    if (label && !label.dataset.planningPlaceholderSet) {
      label.placeholder = "Task name...";
      label.dataset.planningPlaceholderSet = "1";
    }

    node.querySelector(".planning-task-deps")?.remove();

    // Assignee badge
    node.querySelector(".planning-task-assignee")?.remove();
    const assignee = node.dataset.planningAssignee || "";
    if (assignee) {
      const badge = document.createElement("span");
      badge.className = "planning-task-assignee";
      badge.textContent = assignee;
      node.appendChild(badge);
    }

    // Overdue flash
    const absStart = parseFloat(node.dataset.absDay ?? "NaN");
    const span = parseFloat(node.dataset.spanDays ?? "1");
    const endAbsDay = Number.isFinite(absStart) ? absStart + (Number.isFinite(span) ? span : 1) : NaN;
    const endMs = Number.isFinite(endAbsDay) ? endAbsDay * DAY_MS : NaN;
    const isPastDue = !isComplete && Number.isFinite(endMs) && Date.now() > endMs;
    node.classList.toggle("drop--overdue-alert", isPastDue);
  });

  connections.forEach((connection) => {
    const depColor = state.connectionColorById.get(connection.id) || "";
    if (!depColor || !state.planningConnectionIds.has(connection.id)) {
      connection.el.classList.remove("link--planning");
      connection.el.style.removeProperty("color");
      if (connection.topEl) {
        connection.topEl.classList.remove("link--planning");
        connection.topEl.style.removeProperty("color");
      }
      return;
    }
    connection.el.classList.add("link--planning");
    connection.el.style.color = depColor;
    if (connection.topEl) {
      connection.topEl.classList.add("link--planning");
      connection.topEl.style.color = depColor;
    }
  });

  return state;
}

function getBaseDay() {
  if (!startDate) return 0;
  const d = new Date(startDate);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / DAY_MS);
}

function getNodeStartDay(node) {
  const baseDay = getBaseDay();
  const absDay = parseFloat(node.dataset.absDay ?? "NaN");
  if (Number.isFinite(absDay)) return absDay - baseDay;
  const rawStart = parseFloat(node.dataset.startDay ?? node.dataset.dayIndex ?? "0");
  return Number.isFinite(rawStart) ? rawStart : 0;
}

function getNodeVisualHeight(node, fallback = MIN_NODE_WIDTH) {
  if (!node) return fallback;
  const inline = parseFloat(node.style.height);
  if (Number.isFinite(inline) && inline > 0) return inline;
  const measured = node.offsetHeight;
  if (Number.isFinite(measured) && measured > 0) return measured;
  return fallback;
}

function ensureCageNodeSize(node) {
  if (!node || !isCageNode(node) || getNodeWorkspace(node) !== "animal-work") return;
  const currentWidth = parseFloat(node.style.width) || node.offsetWidth || MIN_NODE_WIDTH;
  const currentHeight = parseFloat(node.style.height) || node.offsetHeight || MIN_NODE_WIDTH;
  const nextWidth = Math.max(CAGE_NODE_MIN_WIDTH, currentWidth);
  const nextHeight = Math.max(CAGE_NODE_HEIGHT, currentHeight);
  if (nextWidth !== currentWidth) node.style.width = `${nextWidth}px`;
  if (nextHeight !== currentHeight) node.style.height = `${nextHeight}px`;
  const left = parseFloat(node.style.left) || 0;
  const top = parseFloat(node.style.top) || (TIMELINE_HEIGHT + 12);
  const maxLeft = Math.max(8, canvas.clientWidth - nextWidth - 8);
  const snappedY = snapY(top, node, nextHeight).y;
  node.style.left = `${clamp(left, 8, maxLeft)}px`;
  node.style.top = `${snappedY}px`;
  settleAnimalsInCage(node);
}

function getCanvasMaxTopForHeight(height = MIN_NODE_WIDTH) {
  const minY = TIMELINE_HEIGHT + 12;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : MIN_NODE_WIDTH;
  return Math.max(minY, canvas.clientHeight - safeHeight - 8);
}

function plateNodeHeightForGroupCount(groupCount = 0) {
  const rows = Math.max(1, Number(groupCount) || 0);
  const raw = MIN_NODE_WIDTH + Math.max(0, rows - 1) * PLATE_NODE_ROW_HEIGHT;
  const maxHeight = Math.max(MIN_NODE_WIDTH, canvas.clientHeight - (TIMELINE_HEIGHT + 12) - 8);
  return clamp(Math.round(raw), MIN_NODE_WIDTH, maxHeight);
}

function snapNodeToY(node) {
  if (!node) return;
  const rawTop = parseFloat(node.style.top);
  const fallbackTop = TIMELINE_HEIGHT + 12;
  const currentTop = Number.isFinite(rawTop) ? rawTop : fallbackTop;
  const { y } = snapY(currentTop, node);
  node.style.top = `${y}px`;
}

function snapNodeToStoredDay(node) {
  const span = parseInt(node.dataset.spanDays ?? "1", 10);
  const baseDay = getBaseDay();
  let absDay = parseFloat(node.dataset.absDay ?? "NaN");
  if (!Number.isFinite(absDay)) {
    const rawStart = parseFloat(node.dataset.startDay ?? node.dataset.dayIndex ?? "0");
    absDay = baseDay + (Number.isFinite(rawStart) ? rawStart : 0);
    node.dataset.absDay = absDay;
  }
  let startDay = absDay - baseDay;
  const left = dayToLeft(startDay);
  const width = spanToWidth(span, node);
  const { y: top } = snapY(parseFloat(node.style.top), node);
  node.style.left = `${left}px`;
  node.style.width = `${width}px`;
  node.style.top = `${top}px`;
  node.dataset.startDay = startDay;
  node.dataset.dayIndex = Math.floor(startDay);
  node.dataset.spanDays = span;
  node.dataset.absDay = absDay;
  if (isMultiWellPlateNode(node)) renderPlateNodeOverlay(node);
  updateTaskAlerts();
}

function snapNodeToDay(node) {
  const oldAbsDay = parseFloat(node.dataset.absDay ?? "NaN");
  const span = parseInt(node.dataset.spanDays ?? "1", 10);
  const rect = node.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const currentLeft = rect.left - canvasRect.left;
  let startDayInt = clamp(Math.round(currentLeft / dayWidth), 0, Math.max(0, dayCount - span));
  const timeFrac = (parseFloat(node.dataset.startMinuteOffset ?? "0") || 0) / 1440;
  let startDay = startDayInt + timeFrac;
  startDay = clamp(startDay, 0, Math.max(0, dayCount - span));
  const left = dayToLeft(startDay);
  const width = spanToWidth(span, node);
  const { y: top } = snapY(parseFloat(node.style.top), node);
  node.style.left = `${left}px`;
  node.style.width = `${width}px`;
  node.style.top = `${top}px`;
  node.dataset.startDay = startDay;
  node.dataset.dayIndex = Math.floor(startDay);
  const newAbsDay = getBaseDay() + startDay;
  node.dataset.absDay = newAbsDay;
  if (isMultiWellPlateNode(node) && Number.isFinite(oldAbsDay)) {
    shiftPlateGroupStarts(node, newAbsDay - oldAbsDay);
    renderPlateNodeOverlay(node);
  }
  updateTaskAlerts();
  renderPlanningTaskPanel();
}

function resnapAllNodes() {
  canvas.querySelectorAll(".drop").forEach((node) => snapNodeToStoredDay(node));
  updateAllConnections();
}

function initNodeMenu() {
  nodeMenu = document.createElement("div");
  nodeMenu.className = "node-menu is-hidden";
  const context = document.createElement("div");
  context.className = "node-menu__context is-hidden";
  context.setAttribute("data-node-menu-context", "true");
  nodeMenu.appendChild(context);
  const actionsWrap = document.createElement("div");
  actionsWrap.className = "node-menu__actions";
  const actions = [
    { label: "Edit Settings", key: "settings" },
    { label: "Media Plan", key: "media" },
    { label: "Adjust start time", key: "start" },
    { label: "Notes", key: "notes" }
  ];
  actions.forEach((action) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = action.label;
    btn.dataset.action = action.key;
    btn.addEventListener("click", () => {
      const targetId = nodeMenu?.dataset.nodeId;
      const targetPlateGroupId = nodeMenu?.dataset.plateGroupId || "";
      hideNodeMenu();
      const targetNode = targetId ? canvas.querySelector(`.drop[data-node-id="${targetId}"]`) : null;
      if (!targetNode) return;
      const activePlateGroupId = isMultiWellPlateNode(targetNode)
        ? resolvePlateGroupSelection(targetNode, targetPlateGroupId)
        : "";
      if (action.key === "media") {
        if (isMultiWellPlateNode(targetNode)) {
          if (activePlateGroupId) {
            showMediaModal(targetNode);
          } else {
            openPlateSelectorModal(targetNode);
          }
        } else {
          showMediaModal(targetNode);
        }
      } else if (action.key === "start") {
        showStartModal(targetNode, false, activePlateGroupId);
      } else {
        console.log(`Clicked ${action.key} for node ${targetId}`);
      }
    }, { capture: true });
    actionsWrap.appendChild(btn);
  });
  nodeMenu.appendChild(actionsWrap);
  canvas.appendChild(nodeMenu);

  canvas.addEventListener("click", (event) => {
    if (!nodeMenu) return;
    if (!nodeMenu.classList.contains("is-hidden")) {
      const withinMenu = nodeMenu.contains(event.target);
      const withinNode = event.target.closest(".drop");
      if (!withinMenu && !withinNode) hideNodeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!nodeMenu) return;
    if (nodeMenu.classList.contains("is-hidden")) return;
    const withinMenu = nodeMenu.contains(event.target);
    const withinNode = event.target.closest(".drop");
    if (!withinMenu && !withinNode) hideNodeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideNodeMenu();
    }
  });
}

function showNodeMenu(node, options = {}) {
  if (!nodeMenu) return;
  const mediaBtn = nodeMenu.querySelector('button[data-action="media"]');
  const startBtn = nodeMenu.querySelector('button[data-action="start"]');
  if (mediaBtn) {
    mediaBtn.style.display = activeWorkspaceId === "cell-culture" ? "" : "none";
  }
  if (startBtn) {
    const showStart = !(isPlanningTaskNode(node) && getNodeWorkspace(node) === "planning");
    startBtn.style.display = showStart ? "" : "none";
  }
  nodeMenu.dataset.nodeId = node.dataset.nodeId;
  const contextEl = nodeMenu.querySelector("[data-node-menu-context]");
  if (contextEl) {
    contextEl.classList.add("is-hidden");
    contextEl.innerHTML = "";
    contextEl.style.removeProperty("--node-menu-group-color");
  }
  const requestedGroupId = String(options?.plateGroupId || "").trim();
  if (isMultiWellPlateNode(node)) {
    const activePlateGroupId = resolvePlateGroupSelection(node, requestedGroupId);
    if (activePlateGroupId) {
      nodeMenu.dataset.plateGroupId = activePlateGroupId;
      if (contextEl) {
        const parsed = readPlateGroups(node, false);
        const idx = parsed?.groups?.findIndex((group) => group.id === activePlateGroupId) ?? -1;
        const activeGroup = idx >= 0 ? parsed.groups[idx] : null;
        if (activeGroup) {
          const color = normalizePlateGroupColor(activeGroup.color) || plateGroupColorByIndex(idx);
          const label = getPlateGroupDisplayName(activeGroup, idx);
          const wellsText = formatWellSelection(activeGroup.wells, 6);

          const small = document.createElement("span");
          small.className = "node-menu__context-label";
          small.textContent = "Editing group";
          const name = document.createElement("strong");
          name.className = "node-menu__context-name";
          name.textContent = label;
          const wells = document.createElement("span");
          wells.className = "node-menu__context-wells";
          wells.textContent = wellsText;

          contextEl.style.setProperty("--node-menu-group-color", color);
          contextEl.appendChild(small);
          contextEl.appendChild(name);
          contextEl.appendChild(wells);
          contextEl.classList.remove("is-hidden");
        }
      }
    } else {
      delete nodeMenu.dataset.plateGroupId;
    }
  } else {
    delete nodeMenu.dataset.plateGroupId;
  }
  nodeMenu.classList.remove("is-hidden");
  nodeMenu.style.display = "block";

  // Position menu above the node, centered, clamped within canvas.
  const nodeRect = node.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const menuRect = nodeMenu.getBoundingClientRect();

  const centerX = nodeRect.left - canvasRect.left + nodeRect.width / 2;
  const aboveY = nodeRect.top - canvasRect.top - menuRect.height - 10;
  const x = clamp(centerX - menuRect.width / 2, 8, canvas.clientWidth - menuRect.width - 8);
  const y = Math.max(8, aboveY);

  nodeMenu.style.left = `${x}px`;
  nodeMenu.style.top = `${y}px`;
}

function hideNodeMenu() {
  if (!nodeMenu) return;
  nodeMenu.classList.add("is-hidden");
  delete nodeMenu.dataset.nodeId;
  delete nodeMenu.dataset.plateGroupId;
  const contextEl = nodeMenu.querySelector("[data-node-menu-context]");
  if (contextEl) {
    contextEl.classList.add("is-hidden");
    contextEl.innerHTML = "";
    contextEl.style.removeProperty("--node-menu-group-color");
  }
  nodeMenu.style.display = "none";
}

function initMediaModal() {
  mediaModal = document.createElement("div");
  mediaModal.className = "modal-backdrop is-hidden";
  mediaModal.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <div>
          <h3 class="modal__title" id="mediaModalTitle">Media Plan</h3>
          <div class="field" style="margin-top:6px;">
            <label style="font-size:12px;">Template</label>
            <select id="templateSelect" style="min-width:180px;"></select>
            <button type="button" data-load-template>Load</button>
          </div>
          <div id="plateGroupControls" class="field is-hidden" style="margin-top:6px;">
            <label style="font-size:12px;">Wells</label>
            <span id="plateGroupWells" class="pill">-</span>
            <label style="font-size:12px;">Start</label>
            <input id="plateGroupDate" type="date">
            <input id="plateGroupTime" type="time" step="60">
            <button type="button" data-plate-group-change>Change wells</button>
          </div>
        </div>
        <button type="button" data-media-close>&times;</button>
      </div>
      <div class="modal__body">
        <div class="field field--stacked media-type-field">
          <label>Media formulation</label>
          <div class="media-type-preset-row">
            <select id="mediaTypePresetSelect" aria-label="Select saved media formulation">
              <option value="">Select a saved formulation</option>
            </select>
            <button type="button" data-open-media-formulations>Media formulations</button>
          </div>
          <div class="media-type-note">Select a saved formulation. Create one in Media formulations if needed.</div>
        </div>
        <div class="field">
          <label>Duration (hours)</label>
          <input id="mediaDurationInput" type="number" min="1" step="1" placeholder="48">
          <label><input id="mediaUntilConf" type="checkbox"> Recur until custom end point</label>
          <input id="mediaRecurEndPoint" type="text" placeholder="e.g., 70% confluency" class="is-hidden">
        </div>
        <div class="field">
          <label>Volume</label>
          <input id="mediaVolumeInput" type="number" min="0" step="0.01" placeholder="0.1">
          <select id="mediaVolumeUnit">
            <option value="ratio">mL/cm²</option>
            <option value="absolute">mL</option>
          </select>
          <div style="font-size:11px;color:var(--muted);">Converts using vessel area.</div>
        </div>
        <div class="field">
          <button type="button" data-media-add>+ Add step</button>
        </div>
        <div id="mediaStatus" class="form-status"></div>
        <div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:4px;">Steps</div>
          <ol id="mediaStepsList" class="plan-steps"></ol>
          <div style="font-size:13px;color:var(--muted);margin:10px 0 6px;">Timeline map</div>
          <div id="mediaTimeline" class="plan-timeline"></div>
          <div class="timeline-actions">
            <button type="button" data-open-additives>Additives</button>
            <button type="button" data-open-removals>Removals</button>
          </div>
          <div id="additiveForm" class="additive-form is-hidden">
            <div class="field">
              <label>Type</label>
              <select id="additiveTypeInput">
                <option value="drug">Drug</option>
                <option value="cells">Cells</option>
                <option value="biomaterial">Biomaterial</option>
              </select>
              <input id="additiveNameInput" type="text" placeholder="Name (e.g., Drug X, Cell line)">
            </div>
            <div class="field">
              <label>Concentration</label>
              <input id="additiveConcValueInput" type="number" min="0" step="any" placeholder="10">
              <select id="additiveConcUnitInput" aria-label="Concentration unit">
                <option value="nM">nM</option>
                <option value="uM" selected>uM</option>
                <option value="mM">mM</option>
              </select>
              <label>Hour</label>
              <input id="additiveHourInput" type="number" min="0" step="1" placeholder="24">
            </div>
            <div class="field">
              <button type="button" data-add-additive>+ Add additive</button>
            </div>
            <div id="additiveList" class="additive-list"></div>
          </div>
          <div id="removalForm" class="additive-form is-hidden">
            <div class="field">
              <label>Remove</label>
              <select id="removalTypeInput">
                <option value="media">Media</option>
                <option value="cells">Cells</option>
                <option value="organoids">Organoids</option>
              </select>
              <label>Hour</label>
              <input id="removalHourInput" type="number" min="0" step="1" placeholder="48">
            </div>
            <div class="field">
              <label>Wash before</label>
              <input id="washBeforeInput" type="text" placeholder="e.g., 3× DPBS 25C 0.1 mL/cm²">
            </div>
            <div class="field">
              <label>Wash after</label>
              <input id="washAfterInput" type="text" placeholder="e.g., 1× DPBS 25C 0.1 mL/cm²">
            </div>
            <div class="field">
              <button type="button" data-add-removal>+ Add removal</button>
            </div>
            <div id="removalList" class="additive-list"></div>
          </div>
        </div>
      </div>
      <div class="modal__footer">
        <button type="button" data-media-save-template>Save as template</button>
        <button type="button" data-media-cancel>Cancel</button>
        <button type="button" data-media-save>Save plan</button>
      </div>
    </div>
  `;
  document.body.appendChild(mediaModal);

  const closeButtons = mediaModal.querySelectorAll("[data-media-close], [data-media-cancel]");
  closeButtons.forEach((btn) => btn.addEventListener("click", hideMediaModal));
  mediaModal.addEventListener("click", (event) => {
    if (event.target === mediaModal) hideMediaModal();
  });

  mediaForm = {
    typePreset: mediaModal.querySelector("#mediaTypePresetSelect"),
    openMediaFormulationsBtn: mediaModal.querySelector("[data-open-media-formulations]"),
    duration: mediaModal.querySelector("#mediaDurationInput"),
    until: mediaModal.querySelector("#mediaUntilConf"),
    recurEndPoint: mediaModal.querySelector("#mediaRecurEndPoint"),
    volume: mediaModal.querySelector("#mediaVolumeInput"),
    volumeUnit: mediaModal.querySelector("#mediaVolumeUnit"),
    addBtn: mediaModal.querySelector("[data-media-add]"),
    saveBtn: mediaModal.querySelector("[data-media-save]"),
    saveTemplateBtn: mediaModal.querySelector("[data-media-save-template]"),
    list: mediaModal.querySelector("#mediaStepsList"),
    timeline: mediaModal.querySelector("#mediaTimeline"),
    openAdditives: mediaModal.querySelector("[data-open-additives]"),
    openRemovals: mediaModal.querySelector("[data-open-removals]"),
    additiveForm: mediaModal.querySelector("#additiveForm"),
    removalForm: mediaModal.querySelector("#removalForm"),
    removalList: mediaModal.querySelector("#removalList"),
    additiveName: mediaModal.querySelector("#additiveNameInput"),
    additiveConcValue: mediaModal.querySelector("#additiveConcValueInput"),
    additiveConcUnit: mediaModal.querySelector("#additiveConcUnitInput"),
    additiveType: mediaModal.querySelector("#additiveTypeInput"),
    additiveHour: mediaModal.querySelector("#additiveHourInput"),
    additiveAddBtn: mediaModal.querySelector("[data-add-additive]"),
    additiveList: mediaModal.querySelector("#additiveList"),
    templateSelect: mediaModal.querySelector("#templateSelect"),
    loadTemplateBtn: mediaModal.querySelector("[data-load-template]"),
    plateGroupControls: mediaModal.querySelector("#plateGroupControls"),
    plateGroupWells: mediaModal.querySelector("#plateGroupWells"),
    plateGroupDate: mediaModal.querySelector("#plateGroupDate"),
    plateGroupTime: mediaModal.querySelector("#plateGroupTime"),
    plateGroupChangeBtn: mediaModal.querySelector("[data-plate-group-change]"),
    status: mediaModal.querySelector("#mediaStatus"),
    title: mediaModal.querySelector("#mediaModalTitle"),
    timelineScroll: document.createElement("div"),
    timelineThumb: document.createElement("div")
  };

  // build persistent custom scrollbar for timeline
  mediaForm.timelineScroll.className = "timeline-scrollbar";
  mediaForm.timelineThumb.className = "timeline-scrollbar__thumb";
  mediaForm.timelineScroll.appendChild(mediaForm.timelineThumb);
  mediaForm.timeline.insertAdjacentElement("afterend", mediaForm.timelineScroll);

  const syncMediaRecurFields = () => {
    const recurEnabled = !!mediaForm.until?.checked;
    if (mediaForm.recurEndPoint) {
      mediaForm.recurEndPoint.classList.toggle("is-hidden", !recurEnabled);
      mediaForm.recurEndPoint.style.display = recurEnabled ? "block" : "none";
      if (!recurEnabled) mediaForm.recurEndPoint.value = "";
    }
  };
  mediaForm.until.addEventListener("change", syncMediaRecurFields);
  syncMediaRecurFields();

  const handleTemplateLoad = () => {
    const raw = mediaForm.templateSelect.value;
    if (raw === "") {
      mediaPlanWorking = [];
      additivesWorking = [];
      removalsWorking = [];
      mediaRecurringWorking = [];
      renderMediaPlan();
      renderAdditivesList();
      renderRemovalsList();
      refreshMediaTypePresetOptions({ keepSelection: false, matchName: "" });
      showMediaStatus("Template cleared.", "success");
      return;
    }
    const idx = parseInt(raw, 10);
    const template = mediaTemplates[idx];
    if (!template) return;
    mediaPlanWorking = JSON.parse(JSON.stringify(template.media || []));
    additivesWorking = JSON.parse(JSON.stringify(template.additives || []));
    removalsWorking = JSON.parse(JSON.stringify(template.removals || []));
    mediaRecurringWorking = [];
    const templateType = mediaPlanWorking.length
      ? String(mediaPlanWorking[mediaPlanWorking.length - 1]?.type || "").trim()
      : "";
    refreshMediaTypePresetOptions({ keepSelection: false, matchName: templateType });
    renderMediaPlan();
    renderAdditivesList();
    renderRemovalsList();
    showMediaStatus("Template loaded. You can keep adding steps.", "success");
  };

  mediaForm.loadTemplateBtn.addEventListener("click", handleTemplateLoad);
  mediaForm.templateSelect.addEventListener("change", handleTemplateLoad);

  mediaForm.typePreset?.addEventListener("change", () => {
    const selectedName = getSelectedMediaFormulationName();
    if (!selectedName) return;
    showMediaStatus(`Selected "${selectedName}".`, "success");
  });

  mediaForm.openMediaFormulationsBtn?.addEventListener("click", () => {
    openMediaFormulationModal();
  });

  mediaForm.plateGroupChangeBtn?.addEventListener("click", () => {
    if (!mediaTargetNode || !isMultiWellPlateNode(mediaTargetNode)) return;
    const targetNode = mediaTargetNode;
    if (mediaPlateGroupId) {
      const saved = saveMediaWorkingToPlateGroup(targetNode, mediaPlateGroupId);
      if (saved) {
        try {
          refreshPlateNodeFromGroups(targetNode);
        } catch (err) {
          console.warn("Failed to refresh plate node after group save", err);
        }
      }
    }
    hideMediaModal();
    openPlateSelectorModal(targetNode, { mode: "change-wells", groupId: mediaPlateGroupId });
  });

  mediaForm.saveTemplateBtn.addEventListener("click", () => {
    openTemplateModal();
  });

  mediaForm.openAdditives.addEventListener("click", () => {
    mediaForm.additiveForm.classList.toggle("is-hidden");
    mediaForm.removalForm.classList.add("is-hidden");
  });

  mediaForm.openRemovals.addEventListener("click", () => {
    mediaForm.removalForm.classList.toggle("is-hidden");
    mediaForm.additiveForm.classList.add("is-hidden");
  });

  mediaForm.additiveAddBtn.addEventListener("click", () => {
    const drug = mediaForm.additiveName.value.trim();
    const concRaw = mediaForm.additiveConcValue?.value.trim() || "";
    const concUnit = normalizeConcentrationUnit(mediaForm.additiveConcUnit?.value || "uM") || "uM";
    const concValue = concRaw === "" ? null : Number(concRaw);
    const hourVal = parseInt(mediaForm.additiveHour.value, 10);
    const type = mediaForm.additiveType.value;
    if (concRaw !== "" && (!Number.isFinite(concValue) || concValue < 0)) {
      showMediaStatus("Concentration must be a non-negative number.");
      return;
    }
    if (!drug || Number.isNaN(hourVal) || hourVal < 0) return;
    const entry = { drug, hour: hourVal, type };
    if (concRaw !== "") {
      const concText = formatConcentrationValue(concValue);
      entry.concValue = concValue;
      entry.concUnit = concUnit;
      entry.conc = concText ? `${concText} ${concUnit}` : "";
    }
    additivesWorking.push(entry);
    renderAdditivesList();
    renderMediaTimeline();
    mediaForm.additiveName.value = "";
    if (mediaForm.additiveConcValue) mediaForm.additiveConcValue.value = "";
    if (mediaForm.additiveConcUnit) mediaForm.additiveConcUnit.value = "uM";
    mediaForm.additiveHour.value = "";
  });

  mediaForm.addBtn.addEventListener("click", () => {
    const type = getSelectedMediaFormulationName();
    const recurUntil = mediaForm.until.checked;
    const recurEndPoint = (mediaForm.recurEndPoint?.value || "").trim();
    const durationVal = mediaForm.duration.value.trim();
    const duration = parseInt(durationVal, 10);
    const volumeVal = parseFloat(mediaForm.volume.value);
    const volumeUnit = mediaForm.volumeUnit.value; // "ratio" or "absolute"

    if (!type) {
      return showMediaStatus("Select a saved media formulation first.");
    }

    let durationSafe = duration;
    if (!durationSafe || durationSafe <= 0) {
      durationSafe = 24; // sensible default
      showMediaStatus("Duration empty; defaulted to 24 h.", "success");
    }
    if (recurUntil && !recurEndPoint) {
      return showMediaStatus("Specify a custom end point (e.g., 70% confluency).");
    }

    let volumeSafe = volumeVal;
    if (Number.isNaN(volumeSafe) || volumeSafe <= 0) {
      volumeSafe = volumeUnit === "ratio" ? 0.1 : 1;
      showMediaStatus("Volume empty; defaulted to 0.1 mL/cm².", "success");
    }

    const area = getCurrentNodeArea();
    const volumeMl = volumeUnit === "ratio" ? volumeSafe * area : volumeSafe;
    const ratio = volumeUnit === "absolute" ? volumeSafe / area : volumeSafe;

    mediaPlanWorking.push({
      type,
      duration: durationSafe,
      recurUntil,
      recurEndPoint: recurUntil ? recurEndPoint : "",
      volumeMl,
      ratio,
      volumeUnit,
      volumeVal: volumeSafe
    });
    renderMediaPlan();
    mediaForm.duration.value = "";
    mediaForm.until.checked = false;
    if (mediaForm.recurEndPoint) mediaForm.recurEndPoint.value = "";
    syncMediaRecurFields();
    mediaForm.volume.value = "";
    showMediaStatus("Step added.", "success");
  });

  mediaForm.saveBtn.addEventListener("click", () => {
    if (!mediaTargetNode) return;
    const tasks = buildTasks(mediaPlanWorking, additivesWorking, removalsWorking, mediaRecurringWorking);
    modalTaskMeta = normalizeTaskMetaMap(modalTaskMeta, tasks);
    modalTaskStatus = normalizeTaskStatusMap(modalTaskStatus, tasks);
    modalTaskCompletion = normalizeTaskCompletionMap(modalTaskCompletion, tasks);
    let shouldClose = false;
    try {
      if (isMultiWellPlateNode(mediaTargetNode)) {
        const targetGroup = mediaPlateGroupId;
        const saved = saveMediaWorkingToPlateGroup(mediaTargetNode, targetGroup);
        if (!saved) throw new Error("Could not save plate group data");

        // Plate node plans are group-scoped; keep node-level plan arrays empty.
        mediaTargetNode.dataset.mediaPlan = "[]";
        mediaTargetNode.dataset.additivesPlan = "[]";
        mediaTargetNode.dataset.removalsPlan = "[]";
        mediaTargetNode.dataset.taskStatus = "{}";
        mediaTargetNode.dataset.taskCompletedAt = "{}";
        mediaTargetNode.dataset.taskMeta = "{}";
        mediaTargetNode.dataset.taskRecurringTasks = "[]";
        shouldClose = true;

        try {
          syncPlateNodeFromGroups(mediaTargetNode);
        } catch (err) {
          console.warn("Failed to sync plate node after media group save", err);
        }
        try {
          renderPlateNodeOverlay(mediaTargetNode);
        } catch (err) {
          console.warn("Failed to refresh plate overlay after media group save", err);
        }
        try {
          renderNodeTasks(mediaTargetNode);
        } catch (err) {
          console.warn("Failed to clear node tasks after plate media save", err);
        }
      } else {
        mediaTargetNode.dataset.mediaPlan = JSON.stringify(mediaPlanWorking);
        mediaTargetNode.dataset.additivesPlan = JSON.stringify(additivesWorking);
        mediaTargetNode.dataset.removalsPlan = JSON.stringify(removalsWorking);
        mediaTargetNode.dataset.taskMeta = JSON.stringify(modalTaskMeta);
        mediaTargetNode.dataset.taskStatus = JSON.stringify(modalTaskStatus);
        mediaTargetNode.dataset.taskCompletedAt = JSON.stringify(modalTaskCompletion);
        mediaTargetNode.dataset.taskRecurringTasks = JSON.stringify(sanitizeRecurringTasks(mediaRecurringWorking));

        // Close should happen after successful persistence, regardless of optional UI refresh failures.
        shouldClose = true;

        // auto-resize node to match plan length starting at its current start day
        const totalHours = computePlanTotalHours(mediaPlanWorking, additivesWorking, removalsWorking, mediaRecurringWorking);
        const spanDays = Math.max(1, Math.ceil(totalHours / 24));
        mediaTargetNode.dataset.spanDays = spanDays;
        delete mediaTargetNode.dataset.spanManual;
        try {
          snapNodeToStoredDay(mediaTargetNode);
        } catch (err) {
          console.warn("Failed to snap node after media plan save", err);
        }
        try {
          updateAllConnections();
        } catch (err) {
          console.warn("Failed to refresh connections after media plan save", err);
        }
        try {
          renderNodeTasks(mediaTargetNode);
        } catch (err) {
          console.warn("Failed to render node tasks after media plan save", err);
        }
      }
      try {
        updateAllConnections();
      } catch (err) {
        console.warn("Failed to refresh connections after save", err);
      }
    } catch (err) {
      console.error("Failed to save media plan", err);
      showMediaStatus("Failed to save media plan.");
    } finally {
      if (shouldClose) {
        hideMediaModal();
        hideNodeMenu();
      }
    }
  });
}

function showMediaModal(node, mode = "node") {
  if (mode === "node" && isMultiWellPlateNode(node)) {
    const parsed = readPlateGroups(node, false);
    if (!getSelectedPlateGroup(node, parsed)) {
      openPlateSelectorModal(node);
      return;
    }
  }
  const isPlateWellMode = mode === "node" && isMultiWellPlateNode(node);
  mediaModalMode = mode;
  mediaTargetNode = node || null;
  try {
    if (mode === "node" && node) {
      if (isPlateWellMode) {
        updatePlateGroupControls(node);
      } else {
        mediaPlanWorking = node.dataset.mediaPlan ? JSON.parse(node.dataset.mediaPlan) : [];
        additivesWorking = node.dataset.additivesPlan ? JSON.parse(node.dataset.additivesPlan) : [];
        removalsWorking = node.dataset.removalsPlan ? JSON.parse(node.dataset.removalsPlan) : [];
        mediaRecurringWorking = sanitizeRecurringTasks(
          node.dataset.taskRecurringTasks ? JSON.parse(node.dataset.taskRecurringTasks) : []
        );
        modalTaskStatus = node.dataset.taskStatus ? JSON.parse(node.dataset.taskStatus) : {};
        modalTaskCompletion = node.dataset.taskCompletedAt ? JSON.parse(node.dataset.taskCompletedAt) : {};
        modalTaskMeta = node.dataset.taskMeta ? JSON.parse(node.dataset.taskMeta) : {};
        setMediaPlateGroupControlsVisible(false);
        mediaPlateGroupId = "";
      }
    } else {
      mediaPlanWorking = [];
      additivesWorking = [];
      removalsWorking = [];
      mediaRecurringWorking = [];
      modalTaskStatus = {};
      modalTaskCompletion = {};
      modalTaskMeta = {};
      setMediaPlateGroupControlsVisible(false);
      mediaPlateGroupId = "";
    }
  } catch {
    mediaPlanWorking = [];
    additivesWorking = [];
    removalsWorking = [];
    mediaRecurringWorking = [];
    modalTaskStatus = {};
    modalTaskCompletion = {};
    modalTaskMeta = {};
    setMediaPlateGroupControlsVisible(false);
    mediaPlateGroupId = "";
  }
  mediaModal.classList.toggle("media-modal--plate", isPlateWellMode);
  loadTemplates();
  refreshTemplateOptions();
  const initialType = mediaPlanWorking.length
    ? String(mediaPlanWorking[mediaPlanWorking.length - 1]?.type || "").trim()
    : "";
  refreshMediaTypePresetOptions({ keepSelection: false, matchName: initialType });
  renderMediaPlan();
  renderAdditivesList();
  renderRemovalsList();
  if (mediaForm?.until) mediaForm.until.checked = false;
  if (mediaForm?.recurEndPoint) {
    mediaForm.recurEndPoint.value = "";
    mediaForm.recurEndPoint.classList.add("is-hidden");
    mediaForm.recurEndPoint.style.display = "none";
  }
  mediaForm.saveBtn.style.display = mode === "node" ? "inline-flex" : "none";
  mediaForm.title.textContent = mode === "template" ? "New Template" : (isPlateWellMode ? "Plate Group Media Plan" : "Media Plan");
  showMediaStatus(mode === "template" ? "Add steps then click 'Save as template'." : (isPlateWellMode ? `Editing wells ${mediaForm?.plateGroupWells?.textContent || "-"}.` : ""), "success");
  mediaModal.classList.remove("is-hidden");
  mediaModal.style.display = "flex";
}

function hideMediaModal() {
  mediaModal.classList.add("is-hidden");
  mediaModal.classList.remove("media-modal--plate");
  mediaModal.style.display = "none";
  mediaTargetNode = null;
  mediaModalMode = "node";
  mediaPlateGroupId = "";
  mediaRecurringWorking = [];
  modalTaskStatus = {};
  modalTaskCompletion = {};
  modalTaskMeta = {};
  setMediaPlateGroupControlsVisible(false);
  hideNodeMenu();
  // Ensure the menu is hidden even if it was re-opened during modal interactions
  nodeMenu?.classList.add("is-hidden");
  closeTemplateModal();
}

function renderPlanningTaskModalColorSwatches(selectedColor = "") {
  if (!planningTaskModalColorList) return;
  const normalized = normalizePlateGroupColor(selectedColor);
  planningTaskModalSelectedColor = normalized || "";
  planningTaskModalColorList.innerHTML = "";

  const autoBtn = document.createElement("button");
  autoBtn.type = "button";
  autoBtn.className = "color-swatch color-swatch--auto";
  autoBtn.textContent = "Auto";
  autoBtn.classList.toggle("is-selected", !planningTaskModalSelectedColor);
  autoBtn.addEventListener("click", () => {
    planningTaskModalSelectedColor = "";
    renderPlanningTaskModalColorSwatches("");
  });
  planningTaskModalColorList.appendChild(autoBtn);

  PLANNING_DEPENDENCY_COLORS.forEach((color) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "color-swatch";
    btn.dataset.color = color;
    btn.style.setProperty("--swatch-color", color);
    btn.setAttribute("aria-label", `Set group color ${color}`);
    btn.classList.toggle("is-selected", planningTaskModalSelectedColor === color);
    btn.addEventListener("click", () => {
      planningTaskModalSelectedColor = color;
      renderPlanningTaskModalColorSwatches(color);
    });
    planningTaskModalColorList.appendChild(btn);
  });
}

function initPlanningTaskModal() {
  if (planningTaskModal) return;
  planningTaskModal = document.createElement("div");
  planningTaskModal.className = "modal-backdrop modal-backdrop--center is-hidden";
  planningTaskModal.innerHTML = `
    <div class="modal modal--planning-task">
      <div class="modal__header">
        <h3 class="modal__title">Edit Planning Task</h3>
        <button type="button" data-planning-task-close>&times;</button>
      </div>
      <div class="modal__body">
        <div class="field field--stacked">
          <label for="planningTaskNameInput">Task name</label>
          <input id="planningTaskNameInput" type="text" maxlength="64" placeholder="Task name">
        </div>
        <div class="completion-date-row">
          <div class="completion-date-cell">
            <label for="planningTaskStartDateInput">Start date</label>
            <input id="planningTaskStartDateInput" type="date">
          </div>
          <div class="completion-date-cell">
            <label for="planningTaskEndDateInput">End date</label>
            <input id="planningTaskEndDateInput" type="date">
          </div>
        </div>
        <div class="field field--stacked">
          <label>Dependency group color</label>
          <div id="planningTaskColorList" class="color-swatch-list"></div>
        </div>
        <div class="field field--stacked">
          <label class="check-row">
            <input id="planningTaskCompleteInput" type="checkbox">
            <span>Mark task complete</span>
          </label>
        </div>
        <div class="field field--stacked">
          <label for="planningTaskAssigneeSelect">Assignee</label>
          <select id="planningTaskAssigneeSelect"><option value="">Unassigned</option></select>
        </div>
      </div>
      <div class="modal__footer">
        <button type="button" data-planning-task-cancel>Cancel</button>
        <button type="button" data-planning-task-save>Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(planningTaskModal);
  planningTaskModalName = planningTaskModal.querySelector("#planningTaskNameInput");
  planningTaskModalComplete = planningTaskModal.querySelector("#planningTaskCompleteInput");
  planningTaskModalAssignee = planningTaskModal.querySelector("#planningTaskAssigneeSelect");
  planningTaskModalColorList = planningTaskModal.querySelector("#planningTaskColorList");
  planningTaskModalStartDate = planningTaskModal.querySelector("#planningTaskStartDateInput");
  planningTaskModalEndDate = planningTaskModal.querySelector("#planningTaskEndDateInput");
  planningTaskModal.querySelectorAll("[data-planning-task-close], [data-planning-task-cancel]")
    .forEach((el) => el.addEventListener("click", hidePlanningTaskModal));
  planningTaskModal.querySelector("[data-planning-task-save]")?.addEventListener("click", savePlanningTaskModal);
  planningTaskModal.addEventListener("click", (event) => {
    if (event.target === planningTaskModal) hidePlanningTaskModal();
  });
}

function populatePlanningTaskAssigneeOptions(selected = "") {
  if (!planningTaskModalAssignee) return;
  loadUsers();
  planningTaskModalAssignee.innerHTML = "";
  const emptyOpt = document.createElement("option");
  emptyOpt.value = "";
  emptyOpt.textContent = "Unassigned";
  if (!selected) emptyOpt.selected = true;
  planningTaskModalAssignee.appendChild(emptyOpt);
  users.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.name;
    opt.textContent = u.name;
    if (u.name === selected) opt.selected = true;
    planningTaskModalAssignee.appendChild(opt);
  });
}

function openPlanningTaskModal(node) {
  if (!node || !isPlanningTaskNode(node) || getNodeWorkspace(node) !== "planning") return;
  initPlanningTaskModal();
  planningTaskModalNodeId = String(node.dataset.nodeId || "");
  if (!planningTaskModalNodeId) return;

  const dependencyState = buildPlanningDependencyState();
  const componentIds = getPlanningComponentNodeIds(planningTaskModalNodeId, dependencyState);
  const overrideColor = componentIds
    .map((nodeId) => normalizePlateGroupColor(getNodeById(nodeId)?.dataset?.planningGroupColor))
    .find(Boolean) || "";
  const defaultColor = overrideColor || dependencyState.nodeColorById.get(planningTaskModalNodeId) || "";
  planningTaskModalSelectedColor = normalizePlateGroupColor(defaultColor) || "";
  renderPlanningTaskModalColorSwatches(planningTaskModalSelectedColor);

  if (planningTaskModalName) planningTaskModalName.value = getNodeLabelText(node);
  if (planningTaskModalComplete) planningTaskModalComplete.checked = node.dataset.planningComplete === "1";
  populatePlanningTaskAssigneeOptions(node.dataset.planningAssignee || "");
  const absStartRaw = parseFloat(node.dataset.absDay ?? "NaN");
  const spanRaw = parseFloat(node.dataset.spanDays ?? "1");
  const spanDays = Number.isFinite(spanRaw) && spanRaw > 0 ? spanRaw : 1;
  const absStart = Number.isFinite(absStartRaw)
    ? absStartRaw
    : getBaseDay() + getNodeStartDay(node);
  const absEnd = absStart + spanDays;
  if (planningTaskModalStartDate) planningTaskModalStartDate.value = absDayToYyyyMmDd(absStart);
  if (planningTaskModalEndDate) planningTaskModalEndDate.value = absDayToYyyyMmDd(absEnd);
  planningTaskModal.classList.remove("is-hidden");
  planningTaskModal.style.display = "flex";
  setTimeout(() => planningTaskModalName?.focus(), 0);
}

function hidePlanningTaskModal() {
  if (!planningTaskModal) return;
  planningTaskModal.classList.add("is-hidden");
  planningTaskModal.style.display = "none";
  planningTaskModalNodeId = "";
  planningTaskModalSelectedColor = "";
  if (planningTaskModalStartDate) planningTaskModalStartDate.value = "";
  if (planningTaskModalEndDate) planningTaskModalEndDate.value = "";
}

function collectPlanningPrerequisiteIds(nodeId, dependencyState = null) {
  const seedId = String(nodeId || "").trim();
  if (!seedId) return [];
  const state = dependencyState || buildPlanningDependencyState();
  const inbound = state?.inboundByNodeId;
  if (!inbound || !inbound.has(seedId)) return [];

  const queue = Array.from(inbound.get(seedId) || []);
  const visited = new Set();
  while (queue.length) {
    const current = String(queue.shift() || "");
    if (!current || visited.has(current)) continue;
    visited.add(current);
    Array.from(inbound.get(current) || []).forEach((prevId) => {
      const normalized = String(prevId || "");
      if (!normalized || visited.has(normalized)) return;
      queue.push(normalized);
    });
  }
  const rows = Array.from(visited);
  rows.sort((aId, bId) => {
    const aOrder = state?.orderByNodeId?.get(aId) ?? Number.MAX_SAFE_INTEGER;
    const bOrder = state?.orderByNodeId?.get(bId) ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return aId.localeCompare(bId);
  });
  return rows;
}

function savePlanningTaskModal() {
  const node = getNodeById(planningTaskModalNodeId);
  if (!node) {
    hidePlanningTaskModal();
    return;
  }
  const nameValue = String(planningTaskModalName?.value || "").trim();
  const labelEl = node.querySelector(".node-label");
  if (labelEl && nameValue) {
    labelEl.value = nameValue;
    autosizeLabel(labelEl);
  }

  const startDateValue = String(planningTaskModalStartDate?.value || "").trim();
  const endDateValue = String(planningTaskModalEndDate?.value || "").trim();
  const parsedStartAbs = parseYyyyMmDdToAbsDay(startDateValue);
  const parsedEndAbs = parseYyyyMmDdToAbsDay(endDateValue);
  if (Number.isFinite(parsedStartAbs) && Number.isFinite(parsedEndAbs)) {
    if (parsedEndAbs <= parsedStartAbs) {
      showTaskToast("End date must be after start date.");
      return;
    }
    const requestedSpan = parsedEndAbs - parsedStartAbs;
    const spanDays = clamp(requestedSpan, 1, Math.max(1, dayCount));
    let baseDay = getBaseDay();
    let startDay = parsedStartAbs - baseDay;
    const minStart = 0;
    const maxStart = Math.max(0, dayCount - spanDays);
    if (startDay < minStart || startDay > maxStart) {
      const shiftAmount = startDay < minStart
        ? Math.floor(startDay - minStart)
        : Math.ceil(startDay - maxStart);
      if (shiftAmount) {
        shiftTimeline(shiftAmount);
      }
      baseDay = getBaseDay();
      startDay = parsedStartAbs - baseDay;
    }
    startDay = clamp(startDay, minStart, Math.max(0, dayCount - spanDays));
    const appliedAbsStart = baseDay + startDay;
    node.dataset.startDay = startDay;
    node.dataset.dayIndex = Math.floor(startDay);
    node.dataset.spanDays = spanDays;
    node.dataset.absDay = appliedAbsStart;
    node.style.left = `${dayToLeft(startDay)}px`;
    node.style.width = `${spanToWidth(spanDays, node)}px`;
    snapNodeToY(node);
    if (planningTaskModalStartDate) planningTaskModalStartDate.value = absDayToYyyyMmDd(appliedAbsStart);
    if (planningTaskModalEndDate) planningTaskModalEndDate.value = absDayToYyyyMmDd(appliedAbsStart + spanDays);
  }

  const dependencyState = buildPlanningDependencyState();
  const wantsComplete = !!planningTaskModalComplete?.checked;
  const alreadyComplete = node.dataset.planningComplete === "1";
  if (wantsComplete && !alreadyComplete) {
    const prerequisiteIds = collectPlanningPrerequisiteIds(planningTaskModalNodeId, dependencyState);
    const blocking = prerequisiteIds.filter((depId) => {
      const depNode = getNodeById(depId);
      return depNode && depNode.dataset.planningComplete !== "1";
    });
    if (blocking.length) {
      const labels = blocking
        .slice(0, 3)
        .map((depId) => getNodeLabelText(getNodeById(depId)))
        .join(", ");
      const more = blocking.length > 3 ? ` +${blocking.length - 3} more` : "";
      showTaskToast(`Complete dependencies first: ${labels}${more}.`);
      if (planningTaskModalComplete) planningTaskModalComplete.checked = false;
      delete node.dataset.planningComplete;
    } else {
      node.dataset.planningComplete = "1";
    }
  } else if (wantsComplete) {
    node.dataset.planningComplete = "1";
  } else {
    delete node.dataset.planningComplete;
  }

  const componentIds = getPlanningComponentNodeIds(planningTaskModalNodeId, dependencyState);
  const color = normalizePlateGroupColor(planningTaskModalSelectedColor);
  const targets = componentIds.length ? componentIds : [planningTaskModalNodeId];
  targets.forEach((nodeId) => {
    const target = getNodeById(nodeId);
    if (!target || !isPlanningTaskNode(target)) return;
    if (color) target.dataset.planningGroupColor = color;
    else delete target.dataset.planningGroupColor;
  });

  const assignee = planningTaskModalAssignee?.value || "";
  if (assignee) node.dataset.planningAssignee = assignee;
  else delete node.dataset.planningAssignee;

  applyPlanningDependencyVisuals();
  renderPlanningTaskPanel();
  updateAllConnections();
  updateLogPanel();
  hidePlanningTaskModal();
  scheduleCanvasSync();
}

function syncStartDateProxyValue() {
  if (!startModalDate || !startModalDateProxy) return;
  const dateVal = (startModalDate.value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    startModalDateProxy.value = dateVal;
  }
}

function openStartDatePicker() {
  if (!startModalDateProxy) return;
  syncStartDateProxyValue();
  try {
    if (typeof startModalDateProxy.showPicker === "function") {
      startModalDateProxy.showPicker();
      return;
    }
  } catch {
    // ignore and focus as fallback
  }
  startModalDate?.focus();
}

function openStartTimePicker() {
  if (!startModalTime) return;
  if (window.clocklet?.open) {
    window.clocklet.open(startModalTime, {
      format: "HH:mm",
      zIndex: 1000,
      className: "clocklet-start",
    });
    return;
  }
  try {
    if (typeof startModalTime.showPicker === "function") {
      startModalTime.showPicker();
      return;
    }
  } catch {
    // ignore and focus as fallback
  }
  startModalTime.focus();
}

function initStartModal() {
  if (startModal) return;
  startModal = document.createElement("div");
  startModal.className = "modal-backdrop modal-backdrop--center is-hidden";
  startModal.innerHTML = `
    <div class="modal modal--start">
      <div class="modal__header">
        <h3 id="startModalTitle" class="modal__title">Set start date & time</h3>
        <button type="button" class="modal__close-btn" data-start-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <label id="startModalLabel" class="start-modal__label" for="startDateInput">Start date & time</label>
        <div class="start-datetime-row">
          <div class="start-date-wrap">
            <input type="text" id="startDateInput" class="start-modal-input" inputmode="numeric" placeholder="YYYY-MM-DD" autocomplete="off" />
            <button type="button" id="startDatePickerBtn" class="start-date-picker-btn" aria-label="Open date picker">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2"></rect>
                <path d="M3 10h18"></path>
                <path d="M8 3v4"></path>
                <path d="M16 3v4"></path>
              </svg>
            </button>
            <input type="date" id="startDatePickerProxy" class="start-date-proxy" tabindex="-1" aria-hidden="true" />
          </div>
          <div class="start-time-wrap">
            <button type="button" id="startTimePickerBtn" class="start-time-picker-btn" aria-label="Open time picker">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8"></circle>
                <path d="M12 7v5l3 2"></path>
              </svg>
            </button>
            <input type="text" id="startTimeInput" class="start-modal-input" inputmode="numeric" data-clocklet="format: HH:mm; z-index: 1000; class-name: clocklet-start;" placeholder="HH:MM" autocomplete="off" />
          </div>
        </div>
        <div id="startModalSexWrap" class="field field--stacked start-modal-animal is-hidden">
          <label for="startAnimalSexInput">Sex</label>
          <select id="startAnimalSexInput">
            <option value="unknown">Unknown</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
        <p id="startModalHint" class="start-modal__hint">Format: YYYY-MM-DD and HH:MM (24-hour)</p>
        <p id="startModalNote" class="start-modal__note">Used for snapping and overdue warnings.</p>
      </div>
      <div class="modal__footer">
        <button type="button" data-start-cancel>Cancel</button>
        <button type="button" data-start-save>Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(startModal);
  startModalDate = startModal.querySelector("#startDateInput");
  startModalDateProxy = startModal.querySelector("#startDatePickerProxy");
  startModalDatePickerBtn = startModal.querySelector("#startDatePickerBtn");
  startModalTime = startModal.querySelector("#startTimeInput");
  startModalTimePickerBtn = startModal.querySelector("#startTimePickerBtn");
  startModalTitleEl = startModal.querySelector("#startModalTitle");
  startModalLabelEl = startModal.querySelector("#startModalLabel");
  startModalHintEl = startModal.querySelector("#startModalHint");
  startModalNoteEl = startModal.querySelector("#startModalNote");
  startModalSexWrap = startModal.querySelector("#startModalSexWrap");
  startModalSex = startModal.querySelector("#startAnimalSexInput");
  startModalSave = startModal.querySelector("[data-start-save]");
  startModalCancel = startModal.querySelector("[data-start-cancel]");
  startModalDatePickerBtn?.addEventListener("click", () => {
    openStartDatePicker();
  });
  startModalTimePickerBtn?.addEventListener("click", () => {
    openStartTimePicker();
  });
  startModalDate?.addEventListener("input", () => {
    startModalDate.setCustomValidity("");
    syncStartDateProxyValue();
  });
  const applyProxyDate = () => {
    const picked = (startModalDateProxy?.value || "").trim();
    if (!picked || !startModalDate) return;
    startModalDate.value = picked;
    startModalDate.setCustomValidity("");
  };
  startModalDateProxy?.addEventListener("input", applyProxyDate);
  startModalDateProxy?.addEventListener("change", applyProxyDate);
  startModalTime?.addEventListener("input", () => {
    startModalTime.setCustomValidity("");
  });

  const closeEls = startModal.querySelectorAll("[data-start-close], [data-start-cancel]");
  closeEls.forEach((el) => el.addEventListener("click", () => hideStartModal(true)));
  startModal.addEventListener("click", (e) => {
    if (e.target === startModal) hideStartModal(true);
  });
  startModalSave.addEventListener("click", saveStartModal);
}

function initAnimalDetailsModal() {
  if (animalDetailsModal) return;
  animalDetailsModal = document.createElement("div");
  animalDetailsModal.className = "modal-backdrop modal-backdrop--center is-hidden";
  animalDetailsModal.innerHTML = `
    <div class="modal modal--animal-details">
      <div class="modal__header">
        <h3 class="modal__title">Animal Details</h3>
        <button type="button" data-animal-details-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <div class="field field--stacked">
          <label for="animalDetailsNameInput">Animal name</label>
          <input type="text" id="animalDetailsNameInput" placeholder="Mouse 1">
        </div>
        <div class="field field--stacked">
          <label for="animalDetailsIdInput">Animal ID</label>
          <input type="text" id="animalDetailsIdInput" placeholder="M-001">
        </div>
        <div class="completion-date-row">
          <div class="completion-date-cell">
            <label for="animalDetailsDateInput">Birth date</label>
            <input type="date" id="animalDetailsDateInput">
          </div>
          <div class="completion-date-cell">
            <label for="animalDetailsTimeInput">Birth time</label>
            <input type="time" id="animalDetailsTimeInput" step="60">
          </div>
        </div>
        <div class="field field--stacked">
          <label for="animalDetailsSexInput">Sex</label>
          <select id="animalDetailsSexInput">
            <option value="unknown">Unknown</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
        <div class="field field--stacked">
          <label for="animalDetailsProjectsInput">Projects (comma-separated)</label>
          <input type="text" id="animalDetailsProjectsInput" placeholder="Project A, Drug Study 2">
        </div>
      </div>
      <div class="modal__footer">
        <button type="button" data-animal-details-cancel>Cancel</button>
        <button type="button" data-animal-details-save>Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(animalDetailsModal);
  animalDetailsNameInput = animalDetailsModal.querySelector("#animalDetailsNameInput");
  animalDetailsIdInput = animalDetailsModal.querySelector("#animalDetailsIdInput");
  animalDetailsDateInput = animalDetailsModal.querySelector("#animalDetailsDateInput");
  animalDetailsTimeInput = animalDetailsModal.querySelector("#animalDetailsTimeInput");
  animalDetailsSexInput = animalDetailsModal.querySelector("#animalDetailsSexInput");
  animalDetailsProjectsInput = animalDetailsModal.querySelector("#animalDetailsProjectsInput");
  animalDetailsModal
    .querySelectorAll("[data-animal-details-close], [data-animal-details-cancel]")
    .forEach((el) => el.addEventListener("click", () => hideAnimalDetailsModal(true)));
  animalDetailsModal.querySelector("[data-animal-details-save]")?.addEventListener("click", saveAnimalDetailsModal);
  animalDetailsModal.addEventListener("click", (event) => {
    if (event.target === animalDetailsModal) hideAnimalDetailsModal(true);
  });
}

function openAnimalDetailsModal(animalId, pendingCreate = false) {
  initAnimalDetailsModal();
  const animal = findAnimalHousingAnimalById(animalId);
  if (!animal || !animalDetailsModal) return;
  animalDetailsModalAnimalId = String(animal.id || "");
  animalDetailsPendingCreate = !!pendingCreate;
  const birthDate = animal.birthIso ? new Date(animal.birthIso) : null;
  const { dateStr, timeStr } = splitDateTime(birthDate || new Date());
  if (animalDetailsNameInput) animalDetailsNameInput.value = String(animal.name || "");
  if (animalDetailsIdInput) animalDetailsIdInput.value = String(animal.animalId || "");
  if (animalDetailsDateInput) animalDetailsDateInput.value = animal.birthIso ? dateStr : "";
  if (animalDetailsTimeInput) animalDetailsTimeInput.value = animal.birthIso ? timeStr : "00:00";
  if (animalDetailsSexInput) {
    const sex = String(animal.sex || "unknown").trim().toLowerCase();
    animalDetailsSexInput.value = sex === "male" || sex === "female" ? sex : "unknown";
  }
  if (animalDetailsProjectsInput) {
    animalDetailsProjectsInput.value = serializeAnimalProjects(animal.projects);
  }
  animalDetailsModal.classList.remove("is-hidden");
  animalDetailsModal.style.display = "flex";
}

function hideAnimalDetailsModal(abortPending = false) {
  if (!animalDetailsModal) return;
  if (abortPending && animalDetailsPendingCreate && animalDetailsModalAnimalId) {
    animalHousingState.animals = animalHousingState.animals.filter((entry) => String(entry.id || "") !== animalDetailsModalAnimalId);
    persistAnimalHousingState();
    renderAnimalHousingPanel();
  }
  animalDetailsModal.classList.add("is-hidden");
  animalDetailsModal.style.display = "none";
  animalDetailsModalAnimalId = "";
  animalDetailsPendingCreate = false;
}

function saveAnimalDetailsModal() {
  const animal = findAnimalHousingAnimalById(animalDetailsModalAnimalId);
  if (!animal) {
    hideAnimalDetailsModal(false);
    return;
  }
  const nextNameRaw = String(animalDetailsNameInput?.value || "").trim();
  const nextName = nextNameRaw || generateUniqueAnimalName(animal.species, animal.id);
  if (isAnimalNameTaken(nextName, animal.id)) {
    showTaskToast("Animal name must be unique.");
    animalDetailsNameInput?.focus();
    return;
  }
  const dateVal = String(animalDetailsDateInput?.value || "").trim();
  const timeVal = String(animalDetailsTimeInput?.value || "").trim() || "00:00";
  let birthIso = "";
  if (dateVal) {
    const maybe = new Date(`${dateVal}T${timeVal}`);
    if (!Number.isFinite(maybe.getTime())) {
      showTaskToast("Enter a valid birth date/time.");
      return;
    }
    birthIso = maybe.toISOString();
  }
  const sex = String(animalDetailsSexInput?.value || "unknown").trim().toLowerCase();
  animal.name = nextName;
  animal.animalId = String(animalDetailsIdInput?.value || nextName).trim();
  animal.birthIso = birthIso;
  animal.sex = sex === "male" || sex === "female" ? sex : "unknown";
  animal.projects = parseAnimalProjectsInput(animalDetailsProjectsInput?.value || "");
  animalDetailsPendingCreate = false;
  persistAnimalHousingState();
  renderAnimalHousingPanel();
  updateLogPanel();
  hideAnimalDetailsModal(false);
}

function initAnimalProcedureModal() {
  if (animalProcedureModal) return;
  animalProcedureModal = document.createElement("div");
  animalProcedureModal.className = "modal-backdrop modal-backdrop--center is-hidden";
  animalProcedureModal.innerHTML = `
    <div class="modal modal--animal-procedure">
      <div class="modal__header">
        <h3 class="modal__title">Procedure Animals</h3>
        <button type="button" data-animal-proc-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <p id="animalProcedureSummary" class="muted-text" style="margin-top:0;">Assign animals to this scheduled procedure.</p>
        <div id="animalProcedureList" class="animal-procedure-list"></div>
      </div>
      <div class="modal__footer">
        <button type="button" data-animal-proc-cancel>Cancel</button>
        <button type="button" data-animal-proc-save>Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(animalProcedureModal);
  animalProcedureSummary = animalProcedureModal.querySelector("#animalProcedureSummary");
  animalProcedureList = animalProcedureModal.querySelector("#animalProcedureList");
  animalProcedureModal
    .querySelectorAll("[data-animal-proc-close], [data-animal-proc-cancel]")
    .forEach((el) => el.addEventListener("click", hideAnimalProcedureModal));
  animalProcedureModal.querySelector("[data-animal-proc-save]")?.addEventListener("click", saveAnimalProcedureModal);
  animalProcedureModal.addEventListener("click", (event) => {
    if (event.target === animalProcedureModal) hideAnimalProcedureModal();
  });
}

function openAnimalProcedureModal(node) {
  initAnimalProcedureModal();
  if (!node || String(node.dataset.nodeType || "") !== "animal-procedure" || !animalProcedureModal || !animalProcedureList) return;
  animalProcedureModalNodeId = String(node.dataset.nodeId || "");
  let selectedIds = [];
  try {
    selectedIds = node.dataset.procedureAnimalIds ? JSON.parse(node.dataset.procedureAnimalIds) : [];
  } catch {
    selectedIds = [];
  }
  const selectedSet = new Set((Array.isArray(selectedIds) ? selectedIds : []).map((entry) => String(entry || "").trim()).filter(Boolean));
  animalProcedureList.innerHTML = "";
  if (!animalHousingState.cages.length) {
    const empty = document.createElement("div");
    empty.className = "muted-text";
    empty.textContent = "No cages available. Create cages and animals in Animal Housing first.";
    animalProcedureList.appendChild(empty);
  } else {
    const cages = animalHousingState.cages.slice().sort((a, b) => a.name.localeCompare(b.name));
    cages.forEach((cage) => {
      const section = document.createElement("div");
      section.className = "animal-procedure-list__section";
      const title = document.createElement("div");
      title.className = "animal-procedure-list__title";
      title.textContent = cage.name;
      section.appendChild(title);
      const animals = getAnimalsInHousingCage(cage.id).slice().sort((a, b) => a.name.localeCompare(b.name));
      if (!animals.length) {
        const empty = document.createElement("div");
        empty.className = "muted-text";
        empty.textContent = "No animals.";
        section.appendChild(empty);
      } else {
        animals.forEach((animal) => {
          const row = document.createElement("label");
          row.className = "animal-procedure-list__row";
          const cb = document.createElement("input");
          cb.type = "checkbox";
          cb.value = animal.id;
          cb.checked = selectedSet.has(animal.id);
          const text = document.createElement("span");
          text.textContent = `${animal.name}${animal.animalId ? ` (${animal.animalId})` : ""}`;
          row.append(cb, text);
          section.appendChild(row);
        });
      }
      animalProcedureList.appendChild(section);
    });
  }
  if (animalProcedureSummary) {
    animalProcedureSummary.textContent = `Assign animals to "${getNodeLabelText(node)}".`;
  }
  animalProcedureModal.classList.remove("is-hidden");
  animalProcedureModal.style.display = "flex";
}

function hideAnimalProcedureModal() {
  if (!animalProcedureModal) return;
  animalProcedureModal.classList.add("is-hidden");
  animalProcedureModal.style.display = "none";
  animalProcedureModalNodeId = "";
}

function saveAnimalProcedureModal() {
  const node = getNodeById(animalProcedureModalNodeId);
  if (!node || String(node.dataset.nodeType || "") !== "animal-procedure" || !animalProcedureList) {
    hideAnimalProcedureModal();
    return;
  }
  const checked = Array.from(animalProcedureList.querySelectorAll('input[type="checkbox"]:checked'))
    .map((el) => String(el.value || "").trim())
    .filter(Boolean);
  node.dataset.procedureAnimalIds = JSON.stringify(Array.from(new Set(checked)));
  renderAnimalProcedureBadge(node);
  updateLogPanel();
  hideAnimalProcedureModal();
}

function initAnimalFilterModal() {
  if (animalFilterModal) return;
  animalFilterModal = document.createElement("div");
  animalFilterModal.className = "modal-backdrop modal-backdrop--center is-hidden";
  animalFilterModal.innerHTML = `
    <div class="modal modal--animal-filter">
      <div class="modal__header">
        <h3 class="modal__title">Active Animal Filter</h3>
        <button type="button" data-animal-filter-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <div class="field field--stacked">
          <label for="animalFilterAgeMode">Age filter</label>
          <select id="animalFilterAgeMode">
            <option value="any">Any age</option>
            <option value="older">Older than days</option>
            <option value="younger">Younger than days</option>
          </select>
          <input id="animalFilterAgeDays" type="number" min="0" step="1" placeholder="Days">
        </div>
        <div class="field field--stacked">
          <label for="animalFilterSex">Sex</label>
          <select id="animalFilterSex">
            <option value="">Any</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div class="field field--stacked">
          <label for="animalFilterProject">Project</label>
          <select id="animalFilterProject"></select>
        </div>
        <div class="field field--stacked">
          <label for="animalFilterIds">Animal IDs</label>
          <select id="animalFilterIds" multiple size="6"></select>
          <small class="muted-text">Use Cmd/Ctrl-click to select multiple IDs.</small>
        </div>
      </div>
      <div class="modal__footer">
        <button type="button" data-animal-filter-clear>Clear</button>
        <button type="button" data-animal-filter-save>Apply</button>
      </div>
    </div>
  `;
  document.body.appendChild(animalFilterModal);
  animalFilterAgeMode = animalFilterModal.querySelector("#animalFilterAgeMode");
  animalFilterAgeDays = animalFilterModal.querySelector("#animalFilterAgeDays");
  animalFilterSex = animalFilterModal.querySelector("#animalFilterSex");
  animalFilterProject = animalFilterModal.querySelector("#animalFilterProject");
  animalFilterIds = animalFilterModal.querySelector("#animalFilterIds");
  animalFilterModal
    .querySelectorAll("[data-animal-filter-close]")
    .forEach((el) => el.addEventListener("click", hideAnimalFilterModal));
  animalFilterModal.querySelector("[data-animal-filter-save]")?.addEventListener("click", saveAnimalFilterModal);
  animalFilterModal.querySelector("[data-animal-filter-clear]")?.addEventListener("click", clearAnimalFilterState);
  animalFilterModal.addEventListener("click", (event) => {
    if (event.target === animalFilterModal) hideAnimalFilterModal();
  });
}

function openAnimalFilterModal() {
  initAnimalFilterModal();
  if (!animalFilterModal || !animalFilterProject || !animalFilterIds) return;
  animalFilterProject.innerHTML = "";
  const projectAny = document.createElement("option");
  projectAny.value = "";
  projectAny.textContent = "Any project";
  animalFilterProject.appendChild(projectAny);
  getAllAnimalProjectNames().forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    animalFilterProject.appendChild(option);
  });
  animalFilterIds.innerHTML = "";
  const knownIds = animalHousingState.animals
    .map((animal) => String(animal.animalId || "").trim())
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .sort((a, b) => a.localeCompare(b));
  knownIds.forEach((idValue) => {
    const option = document.createElement("option");
    option.value = idValue;
    option.textContent = idValue;
    animalFilterIds.appendChild(option);
  });
  if (animalFilterAgeMode) animalFilterAgeMode.value = String(animalFilterState.ageMode || "any");
  if (animalFilterAgeDays) animalFilterAgeDays.value = String(animalFilterState.ageDays || "");
  if (animalFilterSex) animalFilterSex.value = String(animalFilterState.sex || "");
  if (animalFilterProject) animalFilterProject.value = String(animalFilterState.project || "");
  Array.from(animalFilterIds.options).forEach((opt) => {
    opt.selected = Array.isArray(animalFilterState.ids) && animalFilterState.ids.includes(opt.value);
  });
  animalFilterModal.classList.remove("is-hidden");
  animalFilterModal.style.display = "flex";
}

function hideAnimalFilterModal() {
  if (!animalFilterModal) return;
  animalFilterModal.classList.add("is-hidden");
  animalFilterModal.style.display = "none";
}

function saveAnimalFilterModal() {
  const selectedIds = animalFilterIds
    ? Array.from(animalFilterIds.selectedOptions).map((entry) => String(entry.value || "").trim()).filter(Boolean)
    : [];
  animalFilterState = {
    active: true,
    ageMode: String(animalFilterAgeMode?.value || "any"),
    ageDays: String(animalFilterAgeDays?.value || "").trim(),
    sex: String(animalFilterSex?.value || "").trim().toLowerCase(),
    project: String(animalFilterProject?.value || "").trim(),
    ids: selectedIds
  };
  applyAnimalFilterHighlights();
  hideAnimalFilterModal();
}

function clearAnimalFilterState() {
  animalFilterState = {
    active: false,
    ageMode: "any",
    ageDays: "",
    sex: "",
    project: "",
    ids: []
  };
  applyAnimalFilterHighlights();
  hideAnimalFilterModal();
}

function initCompletionModal() {
  if (completionModal) return;
  completionModal = document.createElement("div");
  completionModal.className = "modal-backdrop modal-backdrop--center is-hidden";
  completionModal.innerHTML = `
    <div class="modal modal--completion">
      <div class="modal__header">
        <h3 class="modal__title">Task completion</h3>
        <button type="button" data-comp-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <div class="field field--stacked">
          <label>User</label>
          <select id="compUserSelect"></select>
          <input type="text" id="compUserOther" placeholder="Enter user name" style="margin-top:6px; display:none;">
        </div>
        <div class="completion-date-row">
          <div class="completion-date-cell">
            <label>Date</label>
            <input type="date" id="compDate">
          </div>
          <div class="completion-date-cell">
            <label>Time</label>
            <input type="time" id="compTime" step="60">
          </div>
        </div>
        <div id="compRecurringPrompt" class="completion-recur-prompt is-hidden">
          <p class="completion-recur-title">Recurring step handling</p>
          <div class="completion-recur-options" role="radiogroup" aria-label="Recurring step handling">
            <label class="completion-recur-option" for="compRecurringContinue">
              <input type="radio" name="compRecurringMode" id="compRecurringContinue" value="continue" checked>
              <span class="completion-recur-option__text">
                <span class="completion-recur-option__title">Recurrence required</span>
                <span class="completion-recur-option__hint">Insert next cycle and push later tasks forward.</span>
              </span>
            </label>
            <label class="completion-recur-option" for="compRecurringFinal">
              <input type="radio" name="compRecurringMode" id="compRecurringFinal" value="final">
              <span class="completion-recur-option__text">
                <span class="completion-recur-option__title">Final step reached</span>
                <span class="completion-recur-option__hint">Stop recurring this step.</span>
              </span>
            </label>
          </div>
        </div>
        <p class="completion-note">Use this to backdate when the step was performed.</p>
      </div>
      <div class="modal__footer">
        <button type="button" data-comp-cancel>Cancel</button>
        <button type="button" data-comp-save>Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(completionModal);
  completionUserSelect = completionModal.querySelector("#compUserSelect");
  completionUserOther = completionModal.querySelector("#compUserOther");
  completionDate = completionModal.querySelector("#compDate");
  completionTime = completionModal.querySelector("#compTime");
  completionRecurringPrompt = completionModal.querySelector("#compRecurringPrompt");
  completionRecurringContinue = completionModal.querySelector("#compRecurringContinue");
  completionRecurringFinal = completionModal.querySelector("#compRecurringFinal");
  completionSave = completionModal.querySelector("[data-comp-save]");
  completionCancel = completionModal.querySelector("[data-comp-cancel]");
  [completionRecurringContinue, completionRecurringFinal].forEach((radio) =>
    radio?.addEventListener("change", updateCompletionRecurringChoiceStyles)
  );

  const closers = completionModal.querySelectorAll("[data-comp-close], [data-comp-cancel]");
  closers.forEach((el) => el.addEventListener("click", hideCompletionModal));
  completionModal.addEventListener("click", (e) => {
    if (e.target === completionModal) hideCompletionModal();
  });
  completionSave.addEventListener("click", saveCompletionModal);
}

function updateCompletionRecurringChoiceStyles() {
  if (!completionRecurringPrompt) return;
  completionRecurringPrompt.querySelectorAll(".completion-recur-option").forEach((option) => {
    const input = option.querySelector('input[type="radio"]');
    option.classList.toggle("is-selected", !!input?.checked);
  });
}

function initAssignModal() {
  if (assignModal) return;
  assignModal = document.createElement("div");
  assignModal.className = "modal-backdrop modal-backdrop--center is-hidden";
  assignModal.innerHTML = `
    <div class="modal" style="max-width: 320px;">
      <div class="modal__header">
        <h3 class="modal__title">Assign task</h3>
        <button type="button" data-assign-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <div class="field">
          <label>User</label>
          <select id="assignUserSelect"></select>
        </div>
      </div>
      <div class="modal__footer" style="justify-content:flex-end;">
        <button type="button" data-assign-cancel>Cancel</button>
        <button type="button" data-assign-save style="margin-left:8px;">Assign</button>
      </div>
    </div>
  `;
  document.body.appendChild(assignModal);
  assignUserSelect = assignModal.querySelector("#assignUserSelect");
  assignSave = assignModal.querySelector("[data-assign-save]");
  assignCancel = assignModal.querySelector("[data-assign-cancel]");
  assignModal.querySelectorAll("[data-assign-close], [data-assign-cancel]").forEach((el) =>
    el.addEventListener("click", hideAssignModal)
  );
  assignModal.addEventListener("click", (e) => {
    if (e.target === assignModal) hideAssignModal();
  });
  assignSave.addEventListener("click", saveAssignModal);
}

function showAssignModal(node, taskKey, options = {}) {
  initAssignModal();
  assignTargetNode = node || null;
  assignTaskKey = String(taskKey || "");
  assignCustomSave = typeof options.onSave === "function" ? options.onSave : null;
  let selected = String(options.selectedAssignee || "").trim();
  if (!selected && assignTargetNode && assignTaskKey) {
    const meta = loadTaskMeta(assignTargetNode);
    selected = String(meta?.[assignTaskKey]?.assignee || "").trim();
  }
  populateAssignUsers(selected);
  assignModal.classList.remove("is-hidden");
  assignModal.style.display = "flex";
}

function hideAssignModal() {
  if (!assignModal) return;
  assignModal.classList.add("is-hidden");
  assignModal.style.display = "none";
  assignTargetNode = null;
  assignTaskKey = null;
  assignCustomSave = null;
}

function saveAssignModal() {
  const user = assignUserSelect?.value || "";
  if (!user) return hideAssignModal();
  if (assignCustomSave) {
    assignCustomSave(user);
    hideAssignModal();
    return;
  }
  if (!assignTargetNode || !assignTaskKey) return hideAssignModal();
  const meta = loadTaskMeta(assignTargetNode);
  if (!meta[assignTaskKey]) meta[assignTaskKey] = {};
  meta[assignTaskKey].assignee = user;
  assignTargetNode.dataset.taskMeta = JSON.stringify(meta);
  if (isMultiWellPlateNode(assignTargetNode)) {
    persistPlateTaskProxyToSelectedGroup(assignTargetNode);
  }
  hideAssignModal();
  // refresh tasks UI
  renderNodeTasks(assignTargetNode);
  refreshAssignButtons(assignTargetNode);
  refreshAssignButtonsAll();
  updateLogPanel();
}

function populateAssignUsers(selected = "") {
  if (!assignUserSelect) return;
  loadUsers();
  assignUserSelect.innerHTML = "";
  const disabledOpt = document.createElement("option");
  disabledOpt.value = "";
  disabledOpt.textContent = "Select user...";
  disabledOpt.disabled = true;
  disabledOpt.selected = !selected;
  assignUserSelect.appendChild(disabledOpt);
  users.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.name;
    opt.textContent = u.name;
    if (u.name === selected) opt.selected = true;
    assignUserSelect.appendChild(opt);
  });
}

function initSignInModal() {
  if (signInModal) return;
  signInModal = document.createElement("div");
  signInModal.className = "modal-backdrop modal-backdrop--center is-hidden";
  signInModal.innerHTML = `
    <div class="modal modal--signin" style="max-width: 380px;">
      <div class="modal__header">
        <h3 class="modal__title">Sign in</h3>
        <button type="button" data-sign-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <div class="field sign-in-google">
          <label>Google account</label>
          <div id="googleSignInMount" class="google-signin-mount"></div>
          <small id="googleSignInHint" class="sign-in-help"></small>
        </div>
        <div class="sign-in-divider" aria-hidden="true"><span>or local account</span></div>
        <div class="field">
          <label>User</label>
          <select id="signUserSelect"></select>
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" id="signPassInput" placeholder="Password">
        </div>
        <div id="signStatus" class="form-status"></div>
      </div>
      <div class="modal__footer" style="justify-content:flex-end;">
        <button type="button" data-sign-cancel>Cancel</button>
        <button type="button" data-sign-signout style="margin-left:8px;">Sign out</button>
        <button type="button" data-sign-save style="margin-left:8px;">Sign in local</button>
      </div>
    </div>
  `;
  document.body.appendChild(signInModal);
  signInUserSelect = signInModal.querySelector("#signUserSelect");
  signInPassInput = signInModal.querySelector("#signPassInput");
  signInStatus = signInModal.querySelector("#signStatus");
  signInGoogleMount = signInModal.querySelector("#googleSignInMount");
  signInGoogleHint = signInModal.querySelector("#googleSignInHint");
  signInSignOutBtn = signInModal.querySelector("[data-sign-signout]");
  const closers = signInModal.querySelectorAll("[data-sign-close], [data-sign-cancel]");
  closers.forEach((el) => el.addEventListener("click", hideSignInModal));
  signInModal.addEventListener("click", (e) => {
    if (e.target === signInModal) hideSignInModal();
  });
  signInModal.querySelector("[data-sign-save]").addEventListener("click", saveSignIn);
  signInSignOutBtn?.addEventListener("click", signOutCurrentUser);
}

function openSignInModal() {
  initSignInModal();
  populateSignInUsers();
  if (signInPassInput) signInPassInput.value = "";
  setSignInStatus("");
  updateSignOutButtonState();
  renderGoogleSignInButton();
  signInModal.classList.remove("is-hidden");
  signInModal.style.display = "flex";
}

function hideSignInModal() {
  if (!signInModal) return;
  signInModal.classList.add("is-hidden");
  signInModal.style.display = "none";
  if (googleSignInRetryTimer) {
    clearTimeout(googleSignInRetryTimer);
    googleSignInRetryTimer = null;
  }
}

function populateSignInUsers() {
  if (!signInUserSelect) return;
  loadUsers();
  signInUserSelect.innerHTML = "";
  const disabled = document.createElement("option");
  disabled.value = "";
  disabled.textContent = "Select user...";
  disabled.disabled = true;
  disabled.selected = true;
  signInUserSelect.appendChild(disabled);
  users.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.name;
    opt.textContent = u.name;
    signInUserSelect.appendChild(opt);
  });
}

function saveSignIn() {
  loadUsers();
  const name = signInUserSelect?.value || "";
  const pass = signInPassInput?.value || "";
  const found = users.find((u) => u.name === name);
  if (!found) return setSignInStatus("Invalid credentials", "error");
  if (found.authProvider === "google" && !found.pass) {
    return setSignInStatus("Use Google sign-in for this account.", "error");
  }
  if (String(found.pass ?? "") !== pass) {
    return setSignInStatus("Invalid credentials", "error");
  }
  applySignedInUser(found.name, "local", found.email || "");
  setSignInStatus("Signed in", "success");
  setTimeout(hideSignInModal, 600);
}

function setSignInStatus(message, tone = "") {
  if (!signInStatus) return;
  signInStatus.textContent = message;
  if (tone === "success") {
    signInStatus.style.color = "#bbf7d0";
  } else if (tone === "error") {
    signInStatus.style.color = "#fca5a5";
  } else {
    signInStatus.style.color = "";
  }
}

function applySignedInUser(name, provider = "local", email = "") {
  currentUser = name;
  currentAuthProvider = provider;
  currentUserEmail = email || "";
  activeProjectId = sanitizeProjectId(`${currentUser || "default"}-project`);
  localStorage.setItem(PROJECT_ID_STORAGE_KEY, activeProjectId);
  loadAnimalHousingState();
  renderAnimalHousingPanel();
  applyAnimalFilterHighlights();
  try {
    localStorage.setItem(
      LAST_SIGNED_IN_USER_STORAGE_KEY,
      JSON.stringify({ name: currentUser, provider: currentAuthProvider, email: currentUserEmail })
    );
  } catch {
    // ignore persistence failures
  }
  backendStateHydratedProjectId = "";
  backendInitialHydrationPending = true;
  localProjectStateDirtySinceHydration = false;
  if (signInBtn) {
    signInBtn.textContent =
      currentAuthProvider === "google" ? `Signed in: ${currentUser} (Google)` : `Signed in: ${currentUser}`;
  }
  setBillingButtonState();
  populateLogFilter();
  updateSignOutButtonState();
  void ensureBackendSessionForCurrentUser();
  if (window.__REQUIRE_AUTH) {
    navigateTo({ view: "dashboard" });
  } else if (typeof window.__authGateHide === "function") {
    window.__authGateHide();
  }
}

function signOutCurrentUser() {
  // Save canvas before signing out
  if (activeCanvasId && hasActiveBackendSession()) {
    void saveCanvasToBackend();
  }
  activeCanvasId = "";
  canvasLoadedFromBackend = false;
  if (canvasSyncTimer) { clearTimeout(canvasSyncTimer); canvasSyncTimer = null; }
  void signOutBackendSession();
  currentUser = null;
  currentUserEmail = "";
  currentUserIsAdmin = false;
  currentAuthProvider = "";
  backendStateHydratedProjectId = "";
  backendStateSyncInFlight = false;
  backendStatePullInFlight = false;
  backendInitialHydrationPending = false;
  localProjectStateDirtySinceHydration = false;
  if (backendStateSyncTimer) {
    clearTimeout(backendStateSyncTimer);
    backendStateSyncTimer = null;
  }
  try {
    localStorage.removeItem(LAST_SIGNED_IN_USER_STORAGE_KEY);
  } catch {
    // ignore persistence failures
  }
  if (signInBtn) signInBtn.textContent = "Sign in";
  activeProjectId = sanitizeProjectId(String(localStorage.getItem(PROJECT_ID_STORAGE_KEY) || "default-project"));
  loadAnimalHousingState();
  renderAnimalHousingPanel();
  clearAnimalFilterState();
  setBillingButtonState();
  if (window.google?.accounts?.id) {
    try {
      window.google.accounts.id.disableAutoSelect();
    } catch {
      // ignore
    }
  }
  setSignInStatus("Signed out", "success");
  updateSignOutButtonState();
  if (window.__REQUIRE_AUTH) navigateTo({ view: "auth" });
}

function updateSignOutButtonState() {
  if (!signInSignOutBtn) return;
  signInSignOutBtn.disabled = !currentUser;
}

function restoreSignedInUserFromStorage() {
  try {
    const raw = localStorage.getItem(LAST_SIGNED_IN_USER_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const name = String(parsed?.name || "").trim();
    if (!name) return;
    const provider = parsed?.provider === "google" ? "google" : "local";
    const email = String(parsed?.email || "").trim().toLowerCase();
    applySignedInUser(name, provider, email);
  } catch {
    // ignore malformed storage state
  }
}

function setBillingButtonState() {
  if (!billingBtn) return;
  billingBtn.disabled = !currentUser;
  billingBtn.textContent = currentUser ? "Billing" : "Billing";
}

function initBillingModal() {
  if (billingModal) return;
  billingModal = document.createElement("div");
  billingModal.className = "modal-backdrop is-hidden";
  billingModal.innerHTML = `
    <div class="modal modal--billing" style="max-width: 480px;">
      <div class="modal__header">
        <h3 class="modal__title">Billing</h3>
        <button type="button" data-billing-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <div id="billingStatus" class="form-status" style="min-height:56px;white-space:pre-line;"></div>
      </div>
      <div class="modal__footer" style="justify-content:flex-end;">
        <button type="button" data-billing-refresh>Refresh</button>
        <button type="button" data-billing-manage style="margin-left:8px;">Manage</button>
        <button type="button" data-billing-upgrade style="margin-left:8px;">Upgrade</button>
      </div>
    </div>
  `;
  document.body.appendChild(billingModal);
  billingStatusEl = billingModal.querySelector("#billingStatus");
  billingUpgradeBtn = billingModal.querySelector("[data-billing-upgrade]");
  billingManageBtn = billingModal.querySelector("[data-billing-manage]");
  billingRefreshBtn = billingModal.querySelector("[data-billing-refresh]");
  billingModal.querySelectorAll("[data-billing-close]").forEach((el) => el.addEventListener("click", hideBillingModal));
  billingModal.addEventListener("click", (e) => {
    if (e.target === billingModal) hideBillingModal();
  });
  billingUpgradeBtn?.addEventListener("click", startBillingCheckout);
  billingManageBtn?.addEventListener("click", openBillingPortal);
  billingRefreshBtn?.addEventListener("click", () => {
    void refreshBillingStatus();
  });
}

function renderBillingStatusText(info) {
  if (!billingStatusEl) return;
  if (!info) {
    billingStatusEl.textContent = "Billing status unavailable.";
    billingStatusEl.style.color = "#fca5a5";
    return;
  }
  const configured = !!info.configuredCheckout;
  const hasActive = !!info.hasActiveSubscription;
  const statusText = String(info.status || "free");
  const periodEnd = info.currentPeriodEnd ? `\nRenews/ends: ${new Date(info.currentPeriodEnd).toLocaleString()}` : "";
  const modeText = configured
    ? (hasActive ? `Plan: Pro\nStatus: ${statusText}` : `Plan: Free\nStatus: ${statusText}`)
    : "Stripe is not configured on this server yet.";
  billingStatusEl.textContent = `${modeText}${periodEnd}`;
  billingStatusEl.style.color = configured ? "#bbf7d0" : "#fbbf24";
  if (billingUpgradeBtn) billingUpgradeBtn.disabled = !currentUser || !configured;
  if (billingManageBtn) billingManageBtn.disabled = !currentUser || !info.configuredPortal || !info.stripeCustomerId;
}

async function refreshBillingStatus() {
  if (!currentUser) {
    renderBillingStatusText({
      configuredCheckout: false,
      configuredPortal: false,
      status: "signed_out",
      hasActiveSubscription: false
    });
    return;
  }
  if (!hasActiveBackendSession()) {
    await ensureBackendSessionForCurrentUser();
  }
  const result = await apiFetch("/api/billing/status");
  if (!result.ok || !result.data?.billing) {
    renderBillingStatusText(null);
    return;
  }
  renderBillingStatusText(result.data.billing);
}

async function startBillingCheckout() {
  if (!currentUser) {
    showTaskToast("Sign in first.");
    return;
  }
  if (!hasActiveBackendSession()) {
    await ensureBackendSessionForCurrentUser();
  }
  const result = await apiFetch("/api/billing/create-checkout-session", {
    method: "POST",
    body: JSON.stringify({ projectId: activeProjectId || "default-project" })
  });
  if (!result.ok) {
    showTaskToast(result.data?.error || "Unable to start checkout.");
    void refreshBillingStatus();
    return;
  }
  const checkoutUrl = String(result.data?.checkoutUrl || "");
  if (!checkoutUrl) {
    showTaskToast("Checkout URL missing.");
    return;
  }
  window.location.href = checkoutUrl;
}

async function openBillingPortal() {
  if (!currentUser) {
    showTaskToast("Sign in first.");
    return;
  }
  if (!hasActiveBackendSession()) {
    await ensureBackendSessionForCurrentUser();
  }
  const result = await apiFetch("/api/billing/create-portal-session", { method: "POST" });
  if (!result.ok) {
    showTaskToast(result.data?.error || "Unable to open billing portal.");
    void refreshBillingStatus();
    return;
  }
  const portalUrl = String(result.data?.portalUrl || "");
  if (!portalUrl) {
    showTaskToast("Portal URL missing.");
    return;
  }
  window.location.href = portalUrl;
}

function openBillingModal() {
  initBillingModal();
  if (!currentUser) {
    showTaskToast("Sign in first.");
    openSignInModal();
    return;
  }
  billingModal.classList.remove("is-hidden");
  billingModal.style.display = "flex";
  renderBillingStatusText({
    configuredCheckout: false,
    configuredPortal: false,
    status: "loading",
    hasActiveSubscription: false
  });
  void refreshBillingStatus();
}

function hideBillingModal() {
  if (!billingModal) return;
  billingModal.classList.add("is-hidden");
  billingModal.style.display = "none";
}

function renderGoogleSignInButton() {
  if (!signInGoogleMount) return;
  signInGoogleMount.innerHTML = "";
  if (googleSignInRetryTimer) {
    clearTimeout(googleSignInRetryTimer);
    googleSignInRetryTimer = null;
  }
  if (!GOOGLE_CLIENT_ID) {
    if (signInGoogleHint) {
      signInGoogleHint.textContent = "Google sign-in not configured. Set window.CELLCULTURE_GOOGLE_CLIENT_ID or the google-signin-client_id meta tag.";
    }
    return;
  }
  const api = window.google?.accounts?.id;
  if (!api) {
    if (signInGoogleHint) signInGoogleHint.textContent = "Loading Google sign-in...";
    googleSignInRetryTimer = setTimeout(() => {
      if (signInModal && !signInModal.classList.contains("is-hidden")) {
        renderGoogleSignInButton();
      }
    }, 250);
    return;
  }
  try {
    if (!googleSignInInitialized) {
      api.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSignInCredential
      });
      googleSignInInitialized = true;
    }
    api.renderButton(signInGoogleMount, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "continue_with",
      logo_alignment: "left",
      width: 280
    });
    if (signInGoogleHint) signInGoogleHint.textContent = "Use your Google account to sign in.";
  } catch {
    if (signInGoogleHint) signInGoogleHint.textContent = "Unable to initialize Google sign-in.";
  }
}

async function handleGoogleSignInCredential(response) {
  const rawCredential = response?.credential || "";
  const payload = decodeJwtPayload(rawCredential);
  if (!payload) return setSignInStatus("Google sign-in failed. Please try again.", "error");

  setSignInStatus("Verifying with server...", "");

  try {
    const result = await apiFetch("/api/auth/google", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ credential: rawCredential })
    });

    if (!result.ok || !result.data?.token) {
      const errorMsg = result.data?.error || "Server verification failed.";
      return setSignInStatus(errorMsg, "error");
    }

    const verifiedUser = result.data.user || {};
    const email = String(verifiedUser.email || payload.email || "").trim().toLowerCase();
    const displayName = String(verifiedUser.name || payload.name || payload.given_name || email || "").trim();
    const googleSub = String(payload.sub || "").trim();

    if (!displayName) return setSignInStatus("Google profile is missing a display name.", "error");

    const finalName = ensureGoogleUser(displayName, email, googleSub);
    setApiSession(result.data.token, result.data.expiresAt || "");
    applySignedInUser(finalName, "google", email);
    setSignInStatus("Signed in with Google", "success");
    populateSignInUsers();

    try {
      await pullProjectStateFromBackend(true);
      backendInitialHydrationPending = false;
      if (localProjectStateDirtySinceHydration) {
        void pushProjectStateToBackend();
      }
      // Canvas loading now happens via router when user selects a project
    } catch {
      // graceful fallback
    }

    setTimeout(hideSignInModal, 500);
  } catch {
    return setSignInStatus("Network error during sign-in. Please try again.", "error");
  }
}

function decodeJwtPayload(token) {
  // Client-side decode for UX only. Production auth should verify token signature server-side.
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const raw = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = raw + "=".repeat((4 - (raw.length % 4 || 4)) % 4);
    const binary = atob(padded);
    const bytes = Array.from(binary, (char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join("");
    return JSON.parse(decodeURIComponent(bytes));
  } catch {
    return null;
  }
}

function ensureGoogleUser(displayName, email = "", googleSub = "") {
  loadUsers();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedSub = String(googleSub || "").trim();
  let user = null;
  if (normalizedSub) {
    user = users.find((u) => String(u.googleSub || "").trim() === normalizedSub) || null;
  }
  if (!user && normalizedEmail) {
    user = users.find((u) => String(u.email || "").trim().toLowerCase() === normalizedEmail) || null;
  }
  if (user) {
    if (normalizedEmail && user.email !== normalizedEmail) user.email = normalizedEmail;
    if (normalizedSub && user.googleSub !== normalizedSub) user.googleSub = normalizedSub;
    user.authProvider = "google";
    if (typeof user.pass !== "string") user.pass = "";
    persistUsers();
    renderUserList();
    return user.name;
  }
  const baseName = String(displayName || normalizedEmail || "Google User").trim() || "Google User";
  let uniqueName = baseName;
  let suffix = 2;
  while (users.some((u) => u.name === uniqueName)) {
    uniqueName = `${baseName} (${suffix++})`;
  }
  users.push({
    name: uniqueName,
    admin: false,
    pass: "",
    authProvider: "google",
    email: normalizedEmail,
    googleSub: normalizedSub
  });
  persistUsers();
  renderUserList();
  return uniqueName;
}

function getNodeTaskBaseMs(node) {
  if (!node || !startDate) return null;
  const proxyAbsDay = isMultiWellPlateNode(node)
    ? parseFloat(node.dataset.taskBaseAbsDay ?? "NaN")
    : Number.NaN;
  const absDay = Number.isFinite(proxyAbsDay) ? proxyAbsDay : parseFloat(node.dataset.absDay ?? "NaN");
  const startMin = parseFloat(node.dataset.startMinuteOffset ?? "0") || 0;
  if (Number.isFinite(absDay)) return absDay * DAY_MS;
  const startDay = parseFloat(node.dataset.startDay ?? node.dataset.dayIndex ?? "0") || 0;
  return startDate.getTime() + startDay * DAY_MS + startMin * 60000;
}

function findNodeTaskByKey(node, taskKey) {
  if (!node || !taskKey) return null;
  const { plan, adds, rems, recurringTasks } = readNodeTaskPlans(node);
  const tasks = buildTasks(plan, adds, rems, recurringTasks);
  return tasks.find((task) => task.key === taskKey) || null;
}

function createRecurringTaskKey(baseKey = "mr") {
  const seed = Math.floor(Math.random() * 1e6).toString(36);
  return `${baseKey}-${Date.now().toString(36)}-${seed}`;
}

function shiftTaskPlansAfterHour(node, insertionHour, shiftHours, options = {}) {
  if (!node || !Number.isFinite(insertionHour) || !Number.isFinite(shiftHours) || shiftHours <= 0) return;
  const skipRecurringKey = String(options.skipRecurringKey || "").trim();

  const mediaPlan = parseDatasetArray(node.dataset.mediaPlan);
  if (mediaPlan.length) {
    const EPS = 1e-6;
    let cursor = 0;
    let targetIndex = mediaPlan.length - 1;
    for (let idx = 0; idx < mediaPlan.length; idx += 1) {
      const step = mediaPlan[idx];
      const dur = getStepDurationHours(step, 24);
      const start = cursor;
      const end = cursor + dur;
      const startsAtInsertion = Math.abs(start - insertionHour) <= EPS;
      if (startsAtInsertion) {
        // Insert gap at/after this boundary without moving the just-completed task start.
        targetIndex = idx;
        break;
      }
      if (insertionHour < (end - EPS) || idx === mediaPlan.length - 1) {
        targetIndex = idx;
        break;
      }
      cursor = end;
    }
    const target = { ...(mediaPlan[targetIndex] || {}) };
    const existingPad = Number(target.schedulePadHours);
    const currentPad = Number.isFinite(existingPad) && existingPad > 0 ? existingPad : 0;
    target.schedulePadHours = currentPad + shiftHours;
    mediaPlan[targetIndex] = target;
    node.dataset.mediaPlan = JSON.stringify(mediaPlan);
  }

  const shiftEntryHour = (entry, key = "") => {
    const hour = Number(entry?.hour);
    if (!Number.isFinite(hour) || hour <= insertionHour) return entry;
    if (key && key === skipRecurringKey) return entry;
    return { ...entry, hour: hour + shiftHours };
  };

  const adds = parseDatasetArray(node.dataset.additivesPlan).map((entry) => shiftEntryHour(entry));
  const rems = parseDatasetArray(node.dataset.removalsPlan).map((entry) => shiftEntryHour(entry));
  const recurring = readNodeRecurringTasks(node).map((entry) => shiftEntryHour(entry, entry?.key));

  node.dataset.additivesPlan = JSON.stringify(adds);
  node.dataset.removalsPlan = JSON.stringify(rems);
  writeNodeRecurringTasks(node, recurring);
}

function syncNodeSpanToTaskPlans(node) {
  if (!node || isMultiWellPlateNode(node)) return;
  const { plan, adds, rems, recurringTasks } = readNodeTaskPlans(node);
  const totalHours = computePlanTotalHours(plan, adds, rems, recurringTasks);
  const spanDays = Math.max(1, Math.ceil(totalHours / 24));
  const currentSpan = parseFloat(node.dataset.spanDays ?? "NaN");
  if (Number.isFinite(currentSpan) && Math.abs(currentSpan - spanDays) < 0.001) return;
  node.dataset.spanDays = `${spanDays}`;
  delete node.dataset.spanManual;
  try {
    snapNodeToStoredDay(node);
  } catch (err) {
    console.warn("Failed to resnap node after recurring insertion", err);
  }
  try {
    updateAllConnections();
  } catch (err) {
    console.warn("Failed to update connections after recurring insertion", err);
  }
}

function appendRecurringTaskFromCompletion(node, task, completedMs) {
  if (!node || !task?.recurrenceConfig?.enabled) return null;
  const baseMs = getNodeTaskBaseMs(node);
  if (!Number.isFinite(baseMs)) return null;
  const intervalHours = Math.max(1, Number(task.recurrenceConfig.intervalHours) || 24);
  const insertionHour = Math.max(0, Number(task.hour) || 0);
  const nextHour = insertionHour + intervalHours;
  const mediaType = String(task.recurrenceConfig.mediaType || task.baseLabel || task.label || "Media").trim() || "Media";
  const endPoint = String(task.recurrenceConfig.endPoint || "custom end point").trim() || "custom end point";
  const label = `${mediaType} every ${intervalHours}h until ${endPoint}`;
  shiftTaskPlansAfterHour(node, insertionHour, intervalHours, { skipRecurringKey: task.key });
  const entry = normalizeRecurringTaskEntry({
    key: createRecurringTaskKey("mr"),
    hour: nextHour,
    label,
    baseLabel: label,
    recurrenceConfig: {
      enabled: true,
      mediaType,
      intervalHours,
      endPoint
    }
  });
  if (!entry) return null;
  const current = readNodeRecurringTasks(node);
  current.push(entry);
  writeNodeRecurringTasks(node, current);
  syncNodeSpanToTaskPlans(node);
  return entry;
}

function showCompletionModal(node, taskKey, options = {}) {
  if (!node || !taskKey) return;
  completionTargetNode = node;
  completionTaskKey = taskKey;
  completionTaskData = findNodeTaskByKey(node, taskKey);
  completionFromToggle = !!options.fromToggle;
  initCompletionModal();

  const metaMap = loadTaskMeta(node);
  const meta = metaMap[taskKey];
  const now = new Date();
  const dt = meta?.time ? new Date(meta.time) : now;
  const pad = (n) => `${n}`.padStart(2, "0");
  populateCompletionUsers(meta?.user);
  completionDate.value = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  completionTime.value = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  const recurrencePromptVisible = completionFromToggle && !!completionTaskData?.recurrenceConfig?.enabled;
  if (completionRecurringPrompt) {
    completionRecurringPrompt.classList.toggle("is-hidden", !recurrencePromptVisible);
    completionRecurringPrompt.style.display = recurrencePromptVisible ? "flex" : "none";
  }
  if (completionRecurringContinue) completionRecurringContinue.checked = recurrencePromptVisible;
  if (completionRecurringFinal) completionRecurringFinal.checked = false;
  updateCompletionRecurringChoiceStyles();

  completionModal.classList.remove("is-hidden");
  completionModal.style.display = "flex";
}

function hideCompletionModal() {
  if (!completionModal) return;
  completionModal.classList.add("is-hidden");
  completionModal.style.display = "none";
  completionTargetNode = null;
  completionTaskKey = null;
  completionTaskData = null;
  completionFromToggle = false;
}

function saveCompletionModal() {
  if (!completionTargetNode || !completionTaskKey) return hideCompletionModal();
  const taskData = completionTaskData;
  const selVal = completionUserSelect?.value || "";
  const user = selVal.trim();
  if (!user) {
    if (signInStatus) {
      signInStatus.textContent = "Select a user to complete the task.";
      signInStatus.style.color = "#fca5a5";
    }
    return;
  }
  const d = completionDate.value;
  const t = completionTime.value || "00:00";
  const ts = new Date(`${d}T${t}`);
  if (Number.isNaN(ts.getTime())) {
    hideCompletionModal();
    return;
  }
  const completedMs = ts.getTime();
  // persist completion time
  let compMap = {};
  try {
    compMap = completionTargetNode.dataset.taskCompletedAt ? JSON.parse(completionTargetNode.dataset.taskCompletedAt) : {};
  } catch {
    compMap = {};
  }
  compMap[completionTaskKey] = completedMs;
  completionTargetNode.dataset.taskCompletedAt = JSON.stringify(compMap);

  // persist meta
  const metaMap = loadTaskMeta(completionTargetNode);
  const existing = metaMap[completionTaskKey] || {};
  metaMap[completionTaskKey] = { ...existing, user, time: ts.toISOString() };
  completionTargetNode.dataset.taskMeta = JSON.stringify(metaMap);

  const shouldCreateRecurring =
    completionFromToggle &&
    !!taskData?.recurrenceConfig?.enabled &&
    !completionRecurringFinal?.checked;
  if (shouldCreateRecurring) {
    appendRecurringTaskFromCompletion(completionTargetNode, taskData, completedMs);
  }
  if (isMultiWellPlateNode(completionTargetNode)) {
    persistPlateTaskProxyToSelectedGroup(completionTargetNode);
    try {
      renderPlateNodeOverlay(completionTargetNode);
    } catch (err) {
      console.warn("Failed to refresh plate overlay after recurring insertion", err);
    }
  }

  renderNodeTasks(completionTargetNode);
  updateTaskAlerts();
  updateLogPanel();
  hideCompletionModal();
}

function loadTaskMeta(node) {
  try {
    return node.dataset.taskMeta ? JSON.parse(node.dataset.taskMeta) : {};
  } catch {
    return {};
  }
}

function refreshAssignButtons(node) {
  if (!node) return;
  const meta = loadTaskMeta(node);
  node.querySelectorAll(".task-chip").forEach((chip) => {
    const key = chip.dataset.taskKey;
    const btn = chip.querySelector(".task-assign");
    if (!btn) return;
    const hasAssignee = !!meta[key]?.assignee;
    btn.textContent = hasAssignee ? "Reassign" : "Assign";
    btn.classList.toggle("task-assign--assigned", hasAssignee);
  });
}

function refreshAssignButtonsAll() {
  canvas.querySelectorAll(".drop").forEach((node) => refreshAssignButtons(node));
}

function focusNodeById(nodeId, taskKey) {
  const node = canvas.querySelector(`.drop[data-node-id="${nodeId}"]`);
  if (!node) return;
  const absDay = parseFloat(node.dataset.absDay ?? "NaN");
  if (Number.isFinite(absDay)) {
    const desiredBase = Math.floor(absDay - Math.max(0, Math.floor(dayCount / 2)));
    startDate = new Date(desiredBase * DAY_MS);
    startDate.setHours(0, 0, 0, 0);
    rebuildTimeline();
    resnapAllNodes();
    updateNowMarker();
  }
  selectNode(node);
  highlightNodeTask(node, taskKey, true);
}

function clearNodePulse() {
  if (!selectedFocus) return;
  const { nodeId, taskKey } = selectedFocus;
  const node = canvas.querySelector(`.drop[data-node-id="${nodeId}"]`);
  if (node) {
    node.classList.remove("drop--pulse-selected");
    if (taskKey) {
      const chip = node.querySelector(`.task-chip[data-task-key="${taskKey}"]`);
      chip?.classList.remove("task-chip--pulse-selected");
    } else {
      node.querySelectorAll(".task-chip").forEach((chip) => chip.classList.remove("task-chip--pulse-selected"));
    }
  }
}

function clearSelectedPulse() {
  clearNodePulse();
  selectedFocus = null;
  applySelectedRowHighlight();
}

function highlightNodeTask(node, taskKey, persist = false) {
  if (!node) return;
  if (persist) {
    clearNodePulse();
    selectedFocus = { nodeId: node.dataset.nodeId, taskKey };
    applySelectedRowHighlight();
    node.classList.add("drop--pulse-selected");
    if (taskKey) {
      const chip = node.querySelector(`.task-chip[data-task-key="${taskKey}"]`);
      chip?.classList.add("task-chip--pulse-selected");
    } else {
      node.querySelectorAll(".task-chip").forEach((chip) => chip.classList.add("task-chip--pulse-selected"));
    }
  } else {
    node.classList.add("drop--pulse");
    const chip = taskKey ? node.querySelector(`.task-chip[data-task-key="${taskKey}"]`) : null;
    if (chip) chip.classList.add("task-chip--pulse");
    setTimeout(() => {
      node.classList.remove("drop--pulse");
      if (chip) chip.classList.remove("task-chip--pulse");
    }, 1600);
  }
}

function initProtocolBuilderModal() {
  if (protocolBuilderModal) return;
  protocolBuilderModal = document.createElement("div");
  protocolBuilderModal.className = "modal-backdrop is-hidden";
  protocolBuilderModal.innerHTML = `
    <div class="modal modal--protocol-builder">
      <div class="modal__header">
        <h3 class="modal__title">Protocol Builder</h3>
        <button type="button" data-protocol-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body protocol-builder">
        <aside class="protocol-builder__library">
          <h4>Process Steps</h4>
          <p>Drag these tiles into the mini canvas.</p>
          <div class="protocol-builder__legend">
            <span class="protocol-builder__legend-chip protocol-builder__legend-chip--drag">Drag tile</span>
            <span class="protocol-builder__legend-chip protocol-builder__legend-chip--text">Type in fields</span>
          </div>
          <div id="protocolStepLibrary" class="protocol-step-library"></div>
        </aside>
        <section class="protocol-builder__workspace">
          <div class="protocol-builder__toolbar">
            <div class="field">
              <label>Protocol Name</label>
              <input id="protocolBuilderName" type="text" placeholder="Protocol name">
            </div>
            <div class="field protocol-builder__template-field">
              <label>Template</label>
              <select id="protocolBuilderTemplateSelect"></select>
              <div class="protocol-builder__template-actions">
                <button type="button" data-protocol-template-load>Load</button>
                <button type="button" data-protocol-template-update>Update</button>
                <button type="button" data-protocol-template-delete>Delete</button>
              </div>
            </div>
            <div class="field protocol-builder__template-save-field">
              <label>Save Template As</label>
              <input id="protocolBuilderTemplateName" type="text" placeholder="Template name">
              <button type="button" data-protocol-template-save>Save template</button>
            </div>
            <div class="protocol-builder__toolbar-actions">
              <button type="button" data-protocol-detach>Detach protocol</button>
            </div>
          </div>
          <div class="protocol-builder__usage-note">Drag tiles and step cards. Arrow labels and settings are text fields.</div>
          <div class="protocol-canvas-wrap">
            <div id="protocolBuilderCanvas" class="protocol-canvas">
              <div id="protocolBuilderSurface" class="protocol-canvas__surface">
                <svg id="protocolBuilderLinks" class="protocol-canvas__links" aria-hidden="true">
                  <defs>
                    <marker id="protocol-flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="currentColor"></path>
                    </marker>
                  </defs>
                </svg>
                <div id="protocolBuilderLinkLabels" class="protocol-canvas__link-labels"></div>
                <div id="protocolBuilderEmpty" class="protocol-canvas__empty">Drag a step tile to add it. Use the right-side dot on a step to draw arrows manually.</div>
              </div>
            </div>
            <div id="protocolBuilderScrollXWrap" class="protocol-canvas__scrollx">
              <span class="protocol-canvas__scrollx-label">Horizontal pan</span>
              <input id="protocolBuilderScrollX" type="range" min="0" max="0" step="1" value="0" aria-label="Protocol canvas horizontal pan">
            </div>
          </div>
        </section>
        <aside class="protocol-builder__tasks">
          <h4>Task Export Preview</h4>
          <p>Steps marked as tasks will appear on the main canvas.</p>
          <div id="protocolBuilderTaskPreview" class="protocol-task-preview"></div>
        </aside>
      </div>
      <div class="modal__footer">
        <button type="button" data-protocol-cancel>Cancel</button>
        <button type="button" data-protocol-save>Save & exit</button>
      </div>
    </div>
  `;
  document.body.appendChild(protocolBuilderModal);

  protocolBuilderTitleInput = protocolBuilderModal.querySelector("#protocolBuilderName");
  protocolBuilderTemplateInput = protocolBuilderModal.querySelector("#protocolBuilderTemplateName");
  protocolBuilderCanvas = protocolBuilderModal.querySelector("#protocolBuilderCanvas");
  protocolBuilderSurface = protocolBuilderModal.querySelector("#protocolBuilderSurface");
  protocolBuilderScrollXWrap = protocolBuilderModal.querySelector("#protocolBuilderScrollXWrap");
  protocolBuilderScrollX = protocolBuilderModal.querySelector("#protocolBuilderScrollX");
  protocolBuilderLinks = protocolBuilderModal.querySelector("#protocolBuilderLinks");
  protocolBuilderLinkLabels = protocolBuilderModal.querySelector("#protocolBuilderLinkLabels");
  protocolBuilderTaskPreview = protocolBuilderModal.querySelector("#protocolBuilderTaskPreview");
  protocolBuilderEmpty = protocolBuilderModal.querySelector("#protocolBuilderEmpty");
  window.addEventListener("resize", () => {
    if (!protocolBuilderWorking) return;
    syncProtocolCanvasSurfaceSize();
    renderProtocolBuilderLinks();
  });

  protocolBuilderModal.querySelectorAll("[data-protocol-close], [data-protocol-cancel]").forEach((btn) => {
    btn.addEventListener("click", closeProtocolBuilder);
  });
  protocolBuilderModal.addEventListener("click", (event) => {
    if (event.target === protocolBuilderModal) closeProtocolBuilder();
  });
  protocolBuilderModal.querySelector("[data-protocol-save]")?.addEventListener("click", saveProtocolBuilder);
  protocolBuilderModal.querySelector("[data-protocol-template-load]")?.addEventListener("click", loadProtocolTemplateIntoBuilder);
  protocolBuilderModal.querySelector("[data-protocol-template-save]")?.addEventListener("click", saveProtocolTemplateFromBuilder);
  protocolBuilderModal.querySelector("[data-protocol-template-update]")?.addEventListener("click", updateProtocolTemplateFromBuilder);
  protocolBuilderModal.querySelector("[data-protocol-template-delete]")?.addEventListener("click", deleteProtocolTemplateFromBuilder);
  protocolBuilderModal.querySelector("[data-protocol-detach]")?.addEventListener("click", detachProtocolFromBuilder);

  const libraryHost = protocolBuilderModal.querySelector("#protocolStepLibrary");
  PROTOCOL_STEP_LIBRARY.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "protocol-step-library__item";
    button.draggable = true;
    button.dataset.stepType = entry.type;
    button.innerHTML = `<span class="protocol-step-library__icon">${escapeSvgText(entry.icon)}</span><span>${escapeSvgText(entry.label)}</span>`;
    button.addEventListener("dragstart", (event) => {
      modalDragActive = true;
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("text/protocol-step-type", entry.type);
      event.dataTransfer.setData("text/plain", entry.type);
    });
    button.addEventListener("dragend", () => {
      modalDragActive = false;
    });
    button.addEventListener("click", () => addProtocolStepToBuilder(entry.type));
    libraryHost?.appendChild(button);
  });

  protocolBuilderCanvas?.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  protocolBuilderCanvas?.addEventListener("scroll", () => {
    syncProtocolCanvasScrollX();
    renderProtocolBuilderLinks();
  });
  protocolBuilderScrollX?.addEventListener("input", () => {
    if (!protocolBuilderCanvas || !protocolBuilderScrollX) return;
    protocolBuilderCanvas.scrollLeft = Number(protocolBuilderScrollX.value) || 0;
    renderProtocolBuilderLinks();
  });
  protocolBuilderCanvas?.addEventListener("drop", (event) => {
    event.preventDefault();
    const type = event.dataTransfer?.getData("text/protocol-step-type");
    modalDragActive = false;
    if (!type) return;
    const rect = protocolBuilderCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left + protocolBuilderCanvas.scrollLeft - 80;
    const y = event.clientY - rect.top + protocolBuilderCanvas.scrollTop - 20;
    addProtocolStepToBuilder(type, x, y);
  });
}

function openProtocolBuilder(connectionId) {
  const connection = getConnectionById(connectionId);
  if (!connection) return;
  initProtocolBuilderModal();
  loadInventory();
  protocolBuilderConnectionId = connection.id;
  protocolBuilderEndpoints = buildProtocolBuilderEndpoints(connection);
  const allowedEndpointIds = new Set(protocolBuilderEndpoints.map((entry) => entry.id));
  const fallbackName = connection.protocol?.name || `Protocol: ${getConnectionDisplayName(connection)}`;
  protocolBuilderWorking = normalizeProtocolData(connection.protocol || { name: fallbackName, steps: [], links: [] }, fallbackName);
  protocolBuilderWorking.links = (protocolBuilderWorking.links || []).filter((link) => {
    if (!link) return false;
    const fromId = String(link.fromId || "");
    const toId = String(link.toId || "");
    if (isProtocolEndpointId(fromId) && !allowedEndpointIds.has(fromId)) return false;
    if (isProtocolEndpointId(toId) && !allowedEndpointIds.has(toId)) return false;
    return true;
  });
  protocolBuilderTitleInput.value = protocolBuilderWorking.name;
  protocolBuilderTemplateInput.value = protocolBuilderWorking.name;
  refreshProtocolBuilderTemplateSelect();
  renderProtocolBuilder();
  protocolBuilderCanvas.scrollLeft = 0;
  protocolBuilderCanvas.scrollTop = 0;
  syncProtocolCanvasScrollX();
  protocolBuilderModal.classList.remove("is-hidden");
  protocolBuilderModal.style.display = "flex";
}

function closeProtocolBuilder() {
  if (!protocolBuilderModal) return;
  protocolBuilderModal.classList.add("is-hidden");
  protocolBuilderModal.style.display = "none";
  protocolBuilderConnectionId = "";
  protocolBuilderWorking = null;
  protocolBuilderEndpoints = [];
  protocolBuilderDragStepId = "";
  protocolBuilderDragPointerId = null;
  protocolBuilderLinking = null;
}

function refreshProtocolBuilderTemplateSelect() {
  const select = protocolBuilderModal?.querySelector("#protocolBuilderTemplateSelect");
  if (!select) return;
  loadProtocolTemplates();
  select.innerHTML = "";
  const emptyOpt = document.createElement("option");
  emptyOpt.value = "";
  emptyOpt.textContent = "Choose template...";
  select.appendChild(emptyOpt);
  protocolTemplates.forEach((template) => {
    const opt = document.createElement("option");
    opt.value = template.id;
    opt.textContent = template.builtin ? `${template.name} (built-in)` : template.name;
    select.appendChild(opt);
  });
}

function syncProtocolCanvasScrollX() {
  if (!protocolBuilderCanvas || !protocolBuilderScrollX || !protocolBuilderScrollXWrap) return;
  const maxScroll = Math.max(0, protocolBuilderCanvas.scrollWidth - protocolBuilderCanvas.clientWidth);
  const current = clamp(protocolBuilderCanvas.scrollLeft, 0, maxScroll);
  protocolBuilderScrollX.max = String(Math.max(1, Math.round(maxScroll)));
  protocolBuilderScrollX.value = String(Math.round(current));
  protocolBuilderScrollX.disabled = maxScroll <= 1;
  protocolBuilderScrollXWrap.classList.toggle("is-disabled", maxScroll <= 1);
}

function syncProtocolCanvasSurfaceSize() {
  if (!protocolBuilderCanvas || !protocolBuilderSurface) return;
  const viewportW = Math.max(0, protocolBuilderCanvas.clientWidth);
  const viewportH = Math.max(0, protocolBuilderCanvas.clientHeight);
  let maxX = 0;
  let maxY = 0;
  const endCount = (protocolBuilderEndpoints || []).filter((entry) => entry.role === "end").length;
  (protocolBuilderWorking?.steps || []).forEach((step) => {
    const x = Number.isFinite(Number(step?.x)) ? Number(step.x) : 0;
    const y = Number.isFinite(Number(step?.y)) ? Number(step.y) : 0;
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
  const endpointHeight = endCount > 0
    ? (endCount - 1) * PROTOCOL_ENDPOINT_SPACING + 240
    : 0;
  const neededW = Math.max(
    maxX + PROTOCOL_CANVAS_STEP_WIDTH + PROTOCOL_CANVAS_PADDING,
    (protocolBuilderEndpoints || []).length ? 28 + PROTOCOL_ENDPOINT_NODE_WIDTH + 260 + PROTOCOL_ENDPOINT_NODE_WIDTH : 0
  );
  const neededH = Math.max(maxY + PROTOCOL_CANVAS_STEP_HEIGHT + PROTOCOL_CANVAS_PADDING, endpointHeight);
  const width = Math.max(viewportW, PROTOCOL_CANVAS_MIN_WIDTH, neededW);
  const height = Math.max(viewportH, PROTOCOL_CANVAS_MIN_HEIGHT, neededH);
  protocolBuilderSurface.style.width = `${Math.round(width)}px`;
  protocolBuilderSurface.style.height = `${Math.round(height)}px`;
  const start = (protocolBuilderEndpoints || []).find((entry) => entry.role === "start");
  if (start) {
    start.x = 28;
    start.y = clamp(height / 2, 84, Math.max(84, height - 84));
  }
  const ends = (protocolBuilderEndpoints || []).filter((entry) => entry.role === "end");
  if (ends.length) {
    const totalSpan = (ends.length - 1) * PROTOCOL_ENDPOINT_SPACING;
    const baseY = clamp((height - totalSpan) / 2, 90, Math.max(90, height - totalSpan - 90));
    const endX = Math.max(300, width - PROTOCOL_ENDPOINT_NODE_WIDTH - 28);
    ends.forEach((entry, idx) => {
      entry.x = endX;
      entry.y = baseY + idx * PROTOCOL_ENDPOINT_SPACING;
    });
  }
  syncProtocolCanvasScrollX();
}

function addProtocolStepToBuilder(type, x = null, y = null) {
  if (!protocolBuilderWorking) return;
  const lib = protocolStepLibraryByType(type);
  if (!lib) return;
  const count = protocolBuilderWorking.steps.length;
  const step = normalizeProtocolStep(
    {
      id: createProtocolStepId(),
      type,
      title: lib.label,
      x: x === null ? 50 + (count % 4) * 210 : x,
      y: y === null ? 70 + Math.floor(count / 4) * 120 : y,
      ...lib.defaults
    },
    count
  );
  protocolBuilderWorking.steps.push(step);
  protocolBuilderWorking.taskState = normalizeProtocolTaskState(protocolBuilderWorking.taskState, protocolBuilderWorking.steps);
  renderProtocolBuilder();
}

function getProtocolLinkAnchor(stepId, direction = "out") {
  if (!protocolBuilderSurface) return null;
  const safeId = escapeCssAttrValue(stepId);
  const handle = protocolBuilderSurface.querySelector(`.protocol-step-handle--${direction}[data-step-id="${safeId}"]`);
  const el = handle || protocolBuilderSurface.querySelector(`.protocol-step-node[data-step-id="${safeId}"], .protocol-endpoint-node[data-endpoint-id="${safeId}"]`);
  if (!el) return null;
  const canvasRect = protocolBuilderSurface.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left - canvasRect.left + rect.width / 2,
    y: rect.top - canvasRect.top + rect.height / 2
  };
}

function renderProtocolBuilderLinks() {
  if (!protocolBuilderWorking || !protocolBuilderLinks || !protocolBuilderLinkLabels) return;
  protocolBuilderLinks.querySelectorAll(".protocol-flow-link, .protocol-flow-link-temp").forEach((el) => el.remove());
  protocolBuilderLinkLabels.innerHTML = "";
  protocolBuilderWorking.links = (protocolBuilderWorking.links || [])
    .map((link) => normalizeProtocolLink(link))
    .filter((link) => !!link);
  protocolBuilderWorking.links.forEach((link) => {
    const from = getProtocolLinkAnchor(link.fromId, "out");
    const to = getProtocolLinkAnchor(link.toId, "in");
    if (!from || !to) return;
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.classList.add("protocol-flow-link");
    const midX = (from.x + to.x) / 2;
    const bendX = from.x <= to.x ? midX : midX - 18;
    polyline.setAttribute("points", `${from.x},${from.y} ${bendX},${from.y} ${bendX},${to.y} ${to.x},${to.y}`);
    polyline.setAttribute("marker-end", "url(#protocol-flow-arrow)");
    protocolBuilderLinks.appendChild(polyline);

    const labelWrap = document.createElement("div");
    labelWrap.className = "protocol-link-label";
    labelWrap.style.left = `${(from.x + to.x) / 2}px`;
    labelWrap.style.top = `${(from.y + to.y) / 2}px`;

    const input = document.createElement("input");
    input.type = "text";
    input.value = link.label || "";
    input.placeholder = "Arrow label";
    input.addEventListener("input", () => {
      link.label = input.value;
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      protocolBuilderWorking.links = protocolBuilderWorking.links.filter((item) => item.id !== link.id);
      renderProtocolBuilderLinks();
    });
    labelWrap.appendChild(input);
    labelWrap.appendChild(remove);
    protocolBuilderLinkLabels.appendChild(labelWrap);
  });
}

function beginProtocolLinking(stepId, event) {
  if (!protocolBuilderWorking || !protocolBuilderLinks || !protocolBuilderCanvas) return;
  event.preventDefault();
  event.stopPropagation();
  const start = getProtocolLinkAnchor(stepId, "out");
  if (!start) return;
  const temp = document.createElementNS("http://www.w3.org/2000/svg", "line");
  temp.classList.add("protocol-flow-link-temp");
  temp.setAttribute("x1", start.x);
  temp.setAttribute("y1", start.y);
  temp.setAttribute("x2", start.x);
  temp.setAttribute("y2", start.y);
  protocolBuilderLinks.appendChild(temp);
  protocolBuilderLinking = { fromId: stepId, temp };

  const onMove = (moveEvent) => {
    const rect = protocolBuilderCanvas.getBoundingClientRect();
    const x = moveEvent.clientX - rect.left + protocolBuilderCanvas.scrollLeft;
    const y = moveEvent.clientY - rect.top + protocolBuilderCanvas.scrollTop;
    temp.setAttribute("x2", x);
    temp.setAttribute("y2", y);
  };
  const onUp = (upEvent) => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
    const toStepId = target?.closest(".protocol-step-handle--in")?.dataset.stepId || "";
    if (toStepId && toStepId !== stepId) {
      const exists = protocolBuilderWorking.links.some((link) => link.fromId === stepId && link.toId === toStepId);
      if (!exists) {
        const defaultOrderLabel = nextProtocolLinkOrderLabel(protocolBuilderWorking.links);
        protocolBuilderWorking.links.push({
          id: createProtocolLinkId(),
          fromId: stepId,
          toId: toStepId,
          label: defaultOrderLabel
        });
      }
    }
    temp.remove();
    protocolBuilderLinking = null;
    renderProtocolBuilderLinks();
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function beginProtocolStepDrag(stepId, event) {
  if (!protocolBuilderWorking || !protocolBuilderCanvas || !protocolBuilderSurface) return;
  const step = protocolBuilderWorking.steps.find((entry) => entry.id === stepId);
  if (!step) return;
  const node = protocolBuilderSurface.querySelector(`.protocol-step-node[data-step-id="${stepId}"]`);
  if (!node) return;
  event.preventDefault();
  protocolBuilderDragStepId = stepId;
  protocolBuilderDragPointerId = event.pointerId;
  const rect = node.getBoundingClientRect();
  protocolBuilderDragOffsetX = event.clientX - rect.left;
  protocolBuilderDragOffsetY = event.clientY - rect.top;
  const onMove = (moveEvent) => {
    const canvasRect = protocolBuilderCanvas.getBoundingClientRect();
    const rawX = moveEvent.clientX - canvasRect.left + protocolBuilderCanvas.scrollLeft - protocolBuilderDragOffsetX;
    const rawY = moveEvent.clientY - canvasRect.top + protocolBuilderCanvas.scrollTop - protocolBuilderDragOffsetY;
    const nextX = Math.max(12, rawX);
    const nextY = Math.max(16, rawY);
    step.x = Math.round(nextX);
    step.y = Math.round(nextY);
    syncProtocolCanvasSurfaceSize();
    node.style.left = `${step.x}px`;
    node.style.top = `${step.y}px`;
    if (moveEvent.clientX > canvasRect.right - 40) {
      protocolBuilderCanvas.scrollLeft += 28;
    } else if (moveEvent.clientX < canvasRect.left + 40) {
      protocolBuilderCanvas.scrollLeft = Math.max(0, protocolBuilderCanvas.scrollLeft - 28);
    }
    if (moveEvent.clientY > canvasRect.bottom - 40) {
      protocolBuilderCanvas.scrollTop += 24;
    } else if (moveEvent.clientY < canvasRect.top + 40) {
      protocolBuilderCanvas.scrollTop = Math.max(0, protocolBuilderCanvas.scrollTop - 24);
    }
    renderProtocolBuilderLinks();
  };
  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    protocolBuilderDragStepId = "";
    protocolBuilderDragPointerId = null;
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function renderProtocolTaskPreview() {
  if (!protocolBuilderTaskPreview || !protocolBuilderWorking) return;
  const tasks = getProtocolTaskSteps(protocolBuilderWorking);
  protocolBuilderTaskPreview.innerHTML = "";
  if (!tasks.length) {
    const empty = document.createElement("div");
    empty.className = "protocol-task-preview__empty";
    empty.textContent = "No steps marked as tasks yet.";
    protocolBuilderTaskPreview.appendChild(empty);
    return;
  }
  tasks.forEach((step, idx) => {
    const row = document.createElement("div");
    row.className = "protocol-task-preview__row";
    const title = document.createElement("strong");
    title.textContent = `${idx + 1}. ${step.title}`;
    const detail = document.createElement("span");
    detail.textContent = getProtocolTaskSummary(step) || "No details";
    row.appendChild(title);
    row.appendChild(detail);
    protocolBuilderTaskPreview.appendChild(row);
  });
}

function renderProtocolBuilderEndpoints() {
  if (!protocolBuilderSurface) return;
  (protocolBuilderEndpoints || []).forEach((endpoint) => {
    const iconDef = getIconDefinition(endpoint.iconId, "");
    const node = document.createElement("div");
    node.className = `protocol-endpoint-node protocol-endpoint-node--${endpoint.role === "start" ? "start" : "end"}`;
    node.dataset.endpointId = endpoint.id;
    node.style.left = `${Math.round(endpoint.x || 0)}px`;
    node.style.top = `${Math.round(endpoint.y || 0)}px`;
    node.innerHTML = `
      <div class="protocol-endpoint-node__icon" aria-hidden="true">
        ${iconDef ? getIconSvg(iconDef, "node") : `<span>${endpoint.role === "start" ? "S" : "E"}</span>`}
      </div>
      <div class="protocol-endpoint-node__text">
        <div class="protocol-endpoint-node__badge">${endpoint.role === "start" ? "Start node" : "End node"}</div>
        <div class="protocol-endpoint-node__label">${escapeSvgText(endpoint.label || "Endpoint")}</div>
      </div>
      ${endpoint.role === "start"
        ? `<button type="button" class="protocol-step-handle protocol-step-handle--out protocol-step-handle--endpoint-out" data-step-id="${escapeSvgText(endpoint.id)}" title="Link from start node"></button>`
        : `<button type="button" class="protocol-step-handle protocol-step-handle--in protocol-step-handle--endpoint-in" data-step-id="${escapeSvgText(endpoint.id)}" title="Link to end node"></button>`
      }
    `;
    const outHandle = node.querySelector(".protocol-step-handle--out");
    outHandle?.addEventListener("pointerdown", (event) => {
      beginProtocolLinking(endpoint.id, event);
    });
    protocolBuilderSurface.appendChild(node);
  });
}

function renderProtocolBuilder() {
  if (!protocolBuilderWorking || !protocolBuilderCanvas || !protocolBuilderSurface) return;
  protocolBuilderSurface.querySelectorAll(".protocol-step-node, .protocol-endpoint-node").forEach((el) => el.remove());
  protocolBuilderWorking.steps = protocolBuilderWorking.steps.map((step, idx) => normalizeProtocolStep(step, idx));
  protocolBuilderWorking.taskState = normalizeProtocolTaskState(protocolBuilderWorking.taskState, protocolBuilderWorking.steps);
  syncProtocolCanvasSurfaceSize();
  protocolBuilderWorking.steps.forEach((step) => {
    const notesLabel = step.type === "dissect" ? "Description" : "Notes";
    const notesPlaceholder = step.type === "dissect" ? "Describe the dissection details" : "Notes";
    const notesValue = step.type === "dissect" ? (step.description || step.notes || "") : (step.notes || "");
    const node = document.createElement("div");
    node.className = "protocol-step-node";
    node.dataset.stepId = step.id;
    node.style.left = `${step.x}px`;
    node.style.top = `${step.y}px`;
    node.innerHTML = `
      <div class="protocol-step-node__header">
        <span class="protocol-step-node__type">${escapeSvgText(protocolStepLibraryByType(step.type)?.label || step.type)}</span>
        <button type="button" class="protocol-step-node__remove" title="Remove step">&times;</button>
      </div>
      <div class="protocol-step-node__mode-hint">
        <span class="mode-drag">Drag header</span>
        <span class="mode-text">Type below</span>
      </div>
      <input class="protocol-step-node__title" type="text" value="${escapeSvgText(step.title)}" />
      <div class="protocol-step-node__fields"></div>
      <label class="protocol-step-node__task"><input type="checkbox" ${step.task ? "checked" : ""}> Create task</label>
      <label class="protocol-step-node__notes-label">${escapeSvgText(notesLabel)}</label>
      <textarea class="protocol-step-node__notes" placeholder="${escapeSvgText(notesPlaceholder)}">${escapeSvgText(notesValue)}</textarea>
      <button type="button" class="protocol-step-handle protocol-step-handle--in" data-step-id="${escapeSvgText(step.id)}" title="Link target"></button>
      <button type="button" class="protocol-step-handle protocol-step-handle--out" data-step-id="${escapeSvgText(step.id)}" title="Link from this step"></button>
    `;
    const header = node.querySelector(".protocol-step-node__header");
    header?.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      beginProtocolStepDrag(step.id, event);
    });
    const removeBtn = node.querySelector(".protocol-step-node__remove");
    removeBtn?.addEventListener("click", () => {
      protocolBuilderWorking.steps = protocolBuilderWorking.steps.filter((entry) => entry.id !== step.id);
      protocolBuilderWorking.links = protocolBuilderWorking.links.filter((link) => link.fromId !== step.id && link.toId !== step.id);
      delete protocolBuilderWorking.taskState?.[step.id];
      renderProtocolBuilder();
    });
    const titleInput = node.querySelector(".protocol-step-node__title");
    titleInput?.addEventListener("input", () => {
      step.title = titleInput.value;
      renderProtocolTaskPreview();
    });
    const taskInput = node.querySelector(".protocol-step-node__task input");
    taskInput?.addEventListener("change", () => {
      step.task = !!taskInput.checked;
      protocolBuilderWorking.taskState = normalizeProtocolTaskState(protocolBuilderWorking.taskState, protocolBuilderWorking.steps);
      renderProtocolTaskPreview();
    });
    const notesInput = node.querySelector(".protocol-step-node__notes");
    notesInput?.addEventListener("input", () => {
      if (step.type === "dissect") {
        step.description = notesInput.value;
        step.notes = notesInput.value;
      } else {
        step.notes = notesInput.value;
      }
      renderProtocolTaskPreview();
    });
    node.querySelector(".protocol-step-handle--out")?.addEventListener("pointerdown", (event) => {
      beginProtocolLinking(step.id, event);
    });

    const fields = node.querySelector(".protocol-step-node__fields");
    const addField = (label, key, opts = {}) => {
      const field = document.createElement("label");
      field.className = "protocol-step-node__field";
      const caption = document.createElement("span");
      caption.textContent = label;
      field.appendChild(caption);
      if (opts.type === "select") {
        const select = document.createElement("select");
        (opts.options || []).forEach((option) => {
          const opt = document.createElement("option");
          opt.value = option.value;
          opt.textContent = option.label;
          if (String(step[key] || "") === option.value) opt.selected = true;
          select.appendChild(opt);
        });
        select.addEventListener("change", () => {
          step[key] = select.value;
        });
        field.appendChild(select);
      } else {
        const input = document.createElement("input");
        input.type = opts.inputType || "text";
        input.value = step[key] || "";
        input.placeholder = opts.placeholder || "";
        input.addEventListener("input", () => {
          step[key] = input.value;
        });
        field.appendChild(input);
      }
      fields?.appendChild(field);
    };

    if (step.type === "wash") {
      const inventoryOptions = [{ value: "", label: "Select inventory..." }, ...getProtocolInventoryOptions()];
      addField("Inventory", "inventoryRef", { type: "select", options: inventoryOptions });
      addField("Volume", "volume", { inputType: "number", placeholder: "1" });
      addField("Vol unit", "volumeUnit", {
        type: "select",
        options: [
          { value: "uL", label: "uL" },
          { value: "mL", label: "mL" },
          { value: "L", label: "L" }
        ]
      });
      addField("Temp (°C)", "temperature", { inputType: "number", placeholder: "25" });
    } else if (step.type === "incubate") {
      addField("Duration (min)", "duration", { inputType: "number", placeholder: "5" });
      step.durationUnit = "min";
      addField("Temperature (°C)", "temperature", { inputType: "number", placeholder: "37" });
    } else if (step.type === "shake") {
      addField("Duration (min)", "duration", { inputType: "number", placeholder: "10" });
      step.durationUnit = "min";
      addField("Speed (rpm)", "speed", { inputType: "number", placeholder: "120" });
      step.speedUnit = "rpm";
    } else if (step.type === "centrifuge") {
      addField("Duration (min)", "duration", { inputType: "number", placeholder: "5" });
      step.durationUnit = "min";
      addField("Speed", "speed", { inputType: "number", placeholder: "300" });
      addField("Unit", "speedUnit", {
        type: "select",
        options: [
          { value: "g", label: "g" },
          { value: "rpm", label: "rpm" }
        ]
      });
      addField("Temp (°C)", "temperature", { inputType: "number", placeholder: "4" });
    } else if (step.type === "split") {
      addField("Split ratio", "ratio", { placeholder: "1:3" });
    } else if (step.type === "move") {
      addField("Location", "location", { placeholder: "e.g. -80 freezer rack B3" });
    } else if (step.type === "dissect") {
      // Description is captured in the notes/description field.
    } else if (step.type === "scrape") {
      // Notes only.
    } else {
      addField("Duration", "duration", { inputType: "number", placeholder: "0" });
      addField("Unit", "durationUnit", {
        type: "select",
        options: [
          { value: "min", label: "min" },
          { value: "h", label: "h" },
          { value: "d", label: "d" }
        ]
      });
    }

    protocolBuilderSurface.appendChild(node);
  });
  renderProtocolBuilderEndpoints();
  protocolBuilderEmpty.style.display = protocolBuilderWorking.steps.length ? "none" : "block";
  renderProtocolBuilderLinks();
  renderProtocolTaskPreview();
}

function loadProtocolTemplateIntoBuilder() {
  if (!protocolBuilderWorking) return;
  const select = protocolBuilderModal?.querySelector("#protocolBuilderTemplateSelect");
  const template = protocolTemplateById(select?.value || "");
  if (!template) return;
  protocolBuilderWorking = normalizeProtocolData(cloneProtocolData(template.protocol), template.name);
  protocolBuilderTitleInput.value = protocolBuilderWorking.name;
  renderProtocolBuilder();
}

function saveProtocolTemplateFromBuilder() {
  if (!protocolBuilderWorking) return;
  const name = String(protocolBuilderTemplateInput?.value || protocolBuilderTitleInput?.value || "").trim();
  if (!name) {
    showTaskToast("Provide a template name first.");
    return;
  }
  const entry = {
    id: createProtocolTemplateId(),
    name,
    builtin: false,
    protocol: normalizeProtocolData(stripEndpointLinksFromProtocol(protocolBuilderWorking), name)
  };
  protocolTemplates.push(entry);
  persistProtocolTemplates();
  refreshProtocolBuilderTemplateSelect();
  renderPaletteTiles();
  showTaskToast(`Saved protocol template "${name}".`);
}

function updateProtocolTemplateFromBuilder() {
  if (!protocolBuilderWorking) return;
  const select = protocolBuilderModal?.querySelector("#protocolBuilderTemplateSelect");
  const targetId = String(select?.value || "").trim();
  const idx = protocolTemplates.findIndex((entry) => entry.id === targetId);
  if (idx === -1) return;
  if (protocolTemplates[idx].builtin) {
    showTaskToast("Built-in templates cannot be overwritten.");
    return;
  }
  const name = String(protocolBuilderTitleInput?.value || protocolTemplates[idx].name).trim() || protocolTemplates[idx].name;
  protocolTemplates[idx] = {
    ...protocolTemplates[idx],
    name,
    protocol: normalizeProtocolData(stripEndpointLinksFromProtocol(protocolBuilderWorking), name)
  };
  persistProtocolTemplates();
  refreshProtocolBuilderTemplateSelect();
  renderPaletteTiles();
  showTaskToast(`Updated template "${name}".`);
}

function deleteProtocolTemplateFromBuilder() {
  const select = protocolBuilderModal?.querySelector("#protocolBuilderTemplateSelect");
  const targetId = String(select?.value || "").trim();
  const idx = protocolTemplates.findIndex((entry) => entry.id === targetId);
  if (idx === -1) return;
  if (protocolTemplates[idx].builtin) {
    showTaskToast("Built-in templates cannot be deleted.");
    return;
  }
  const name = protocolTemplates[idx].name;
  protocolTemplates.splice(idx, 1);
  persistProtocolTemplates();
  refreshProtocolBuilderTemplateSelect();
  renderPaletteTiles();
  showTaskToast(`Deleted template "${name}".`);
}

function detachProtocolFromBuilder() {
  const connection = getConnectionById(protocolBuilderConnectionId);
  if (!connection) return closeProtocolBuilder();
  connection.protocol = null;
  connection.protocolTasksCollapsed = false;
  updateConnectionProtocolDisplay(connection);
  updateLogPanel();
  closeProtocolBuilder();
  showTaskToast("Protocol detached from connection.");
}

function saveProtocolBuilder() {
  const connection = getConnectionById(protocolBuilderConnectionId);
  if (!connection || !protocolBuilderWorking) return closeProtocolBuilder();
  protocolBuilderWorking.name = String(protocolBuilderTitleInput?.value || protocolBuilderWorking.name || "").trim() || "Protocol";
  const previous = connection.protocol?.taskState || {};
  const normalized = normalizeProtocolData(cloneProtocolData(protocolBuilderWorking), protocolBuilderWorking.name);
  normalized.taskState = normalizeProtocolTaskState(previous, normalized.steps);
  Object.entries(previous || {}).forEach(([stepId, state]) => {
    if (!normalized.taskState[stepId]) return;
    normalized.taskState[stepId] = {
      ...normalized.taskState[stepId],
      assignee: String(state?.assignee || "").trim(),
      completed: !!state?.completed,
      completedAt: Number.isFinite(Number(state?.completedAt)) ? Number(state.completedAt) : 0,
      completedBy: String(state?.completedBy || "").trim()
    };
  });
  connection.protocol = normalized;
  connection.protocolTasksCollapsed = false;
  updateConnectionProtocolDisplay(connection);
  updateLogPanel();
  closeProtocolBuilder();
}

function showTaskToast(msg) {
  if (!taskToast) {
    taskToast = document.createElement("div");
    taskToast.className = "task-toast";
    document.body.appendChild(taskToast);
  }
  taskToast.textContent = msg;
  taskToast.classList.add("is-visible");
  setTimeout(() => taskToast?.classList.remove("is-visible"), 2200);
}

// ---------- Inventory ----------

function loadInventory() {
  try {
    const raw = localStorage.getItem("inventoryV1");
    inventoryItems = raw ? JSON.parse(raw) : [];
  } catch {
    inventoryItems = [];
  }
}

function persistInventory() {
  try {
    localStorage.setItem("inventoryV1", JSON.stringify(inventoryItems));
  } catch {
    /* ignore */
  }
  markProjectStateMutatedLocally();
  scheduleProjectStateSync();
  scheduleCanvasSync();
  refreshComponentSelects();
}

function initInventoryModal() {
  if (inventoryModal) return;
  inventoryModal = document.createElement("div");
  inventoryModal.className = "modal-backdrop modal-backdrop--center is-hidden";
  inventoryModal.innerHTML = `
    <div class="modal" style="max-width: 1040px;">
      <div class="modal__header">
        <h3 class="modal__title">Inventory</h3>
        <button type="button" data-inv-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <div class="field-grid">
          <label>Name<input id="invName" type="text" placeholder="DMEM/F12"></label>
          <label>Catalog #<input id="invCat" type="text" placeholder="12345-AB"></label>
          <label>Lot #<input id="invLot" type="text" placeholder="L1234"></label>
          <label>Expiry<input id="invExpiry" type="date"></label>
          <label>Quantity<input id="invQty" type="number" min="0" step="0.01" placeholder="e.g., 10"></label>
          <label>Vol / unit<input id="invVolPer" type="text" placeholder="e.g., 500 mL, 10 mL"></label>
          <label>Storage<input id="invStorage" type="text" placeholder="-20°C, Fridge, RT"></label>
          <label>URL<input id="invUrl" type="url" placeholder="https://..."></label>
        </div>
        <div class="modal__footer" style="justify-content:flex-start;padding:6px 0 0;">
          <button type="button" data-inv-add>Add Item</button>
          <button type="button" data-inv-cancel style="margin-left:8px;display:none;">Cancel edit</button>
        </div>
        <div id="invList" class="table-list" style="max-height:260px;overflow:auto;margin-top:12px;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(inventoryModal);
  inventoryListEl = inventoryModal.querySelector("#invList");
  inventoryForm = {
    name: inventoryModal.querySelector("#invName"),
    cat: inventoryModal.querySelector("#invCat"),
    lot: inventoryModal.querySelector("#invLot"),
    expiry: inventoryModal.querySelector("#invExpiry"),
    storage: inventoryModal.querySelector("#invStorage"),
    qty: inventoryModal.querySelector("#invQty"),
    vol: inventoryModal.querySelector("#invVolPer"),
    url: inventoryModal.querySelector("#invUrl"),
    addBtn: inventoryModal.querySelector("[data-inv-add]"),
    cancelBtn: inventoryModal.querySelector("[data-inv-cancel]"),
  };
  inventoryModal.querySelectorAll("[data-inv-close]").forEach((el) =>
    el.addEventListener("click", closeInventoryModal)
  );
  inventoryModal.addEventListener("click", (e) => {
    if (e.target === inventoryModal) closeInventoryModal();
  });
  inventoryForm.addBtn.addEventListener("click", saveInventoryItem);
  inventoryForm.cancelBtn.addEventListener("click", () => {
    editingInventoryIndex = -1;
    inventoryForm.addBtn.textContent = "Add Item";
    inventoryForm.cancelBtn.style.display = "none";
    inventoryModal.querySelectorAll("input").forEach((i) => (i.value = ""));
  });
  loadInventory();
  renderInventoryList();
}

function openInventoryModal() {
  initInventoryModal();
  loadInventory();
  renderInventoryList();
  inventoryModal.classList.remove("is-hidden");
  inventoryModal.style.display = "flex";
}

function closeInventoryModal() {
  if (!inventoryModal) return;
  inventoryModal.classList.add("is-hidden");
  inventoryModal.style.display = "none";
}

function saveInventoryItem() {
  const name = inventoryForm.name.value.trim();
  const cat = inventoryForm.cat.value.trim();
  const lot = inventoryForm.lot.value.trim();
  const expiry = inventoryForm.expiry.value;
  const storage = inventoryForm.storage.value.trim();
  if (!name || !lot) return;
  loadInventory();
  const qty = parseFloat(inventoryForm.qty.value) || 0;
  const volPer = inventoryForm.vol.value.trim();
  const url = inventoryForm.url.value.trim();
  const payload = { name, cat, lot, expiry, storage, qty, volPer, url };
  if (editingInventoryIndex >= 0 && editingInventoryIndex < inventoryItems.length) {
    inventoryItems[editingInventoryIndex] = { ...inventoryItems[editingInventoryIndex], ...payload };
    editingInventoryIndex = -1;
    inventoryForm.addBtn.textContent = "Add Item";
    inventoryForm.cancelBtn.style.display = "none";
  } else {
    inventoryItems.push(payload);
  }
  persistInventory();
  renderInventoryList();
  inventoryForm.name.value = "";
  inventoryForm.cat.value = "";
  inventoryForm.lot.value = "";
  inventoryForm.expiry.value = "";
  inventoryForm.storage.value = "";
  inventoryForm.qty.value = "";
  inventoryForm.vol.value = "";
  inventoryForm.url.value = "";
  showTaskToast(editingInventoryIndex === -1 ? "Inventory item added" : "Inventory item updated");
  refreshComponentSelects();
}

function renderInventoryList() {
  if (!inventoryListEl) return;
  loadInventory();
  inventoryListEl.innerHTML = "";
  if (!inventoryItems.length) {
    inventoryListEl.textContent = "No inventory yet.";
    return;
  }
  const table = document.createElement("table");
  table.className = "simple-table";
  table.innerHTML = `
    <thead><tr><th>Name</th><th>Cat #</th><th>Lot</th><th>Expiry</th><th>Qty</th><th>Vol/unit</th><th>Storage</th><th>URL</th><th>Aliquots</th><th>Actions</th></tr></thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector("tbody");
  inventoryItems.forEach((it, idx) => {
    const tr = document.createElement("tr");
    const aliq = it.aliquotted ? `${it.aliquotVol || ""} @ ${it.aliquotStorage || ""}` : "No";
    const urlCell = it.url ? `<a href="${it.url}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline;">${(() => { try { return new URL(it.url).hostname; } catch { return "Link"; } })()}</a>` : "";
    tr.innerHTML = `
      <td>${it.name}</td>
      <td>${it.cat || ""}</td>
      <td>${it.lot}</td>
      <td>${it.expiry || ""}</td>
      <td>${it.qty || ""}</td>
      <td>${it.volPer || ""}</td>
      <td>${it.storage || ""}</td>
      <td>${urlCell}</td>
      <td>${aliq}</td>
      <td>
        <button class="pill-btn" data-inv-edit="${idx}">Edit</button>
        <button class="pill-btn pill-btn--danger" data-inv-del="${idx}">Del</button>
      </td>`;
    tbody.appendChild(tr);

    if (Array.isArray(it.aliquots) && it.aliquots.length) {
      const sub = document.createElement("tr");
      sub.className = "aliquot-row";
      const list = it.aliquots
        .map(
          (a) =>
            `<li>${a.count} x ${a.vol} (used ${a.unitsUsed || "?"} units, lot ${a.lot}) @ ${a.storage || "-"} on ${new Date(
              a.ts
            ).toLocaleString()}</li>`
        )
        .join("");
      sub.innerHTML = `<td colspan="10"><div class="aliquot-list"><strong>Aliquots:</strong><ul>${list}</ul></div></td>`;
      tbody.appendChild(sub);
    }
  });
  tbody.querySelectorAll("[data-inv-edit]").forEach((btn) =>
    btn.addEventListener("click", () => startEditInventory(parseInt(btn.dataset.invEdit, 10)))
  );
  tbody.querySelectorAll("[data-inv-del]").forEach((btn) =>
    btn.addEventListener("click", () => deleteInventory(parseInt(btn.dataset.invDel, 10)))
  );
  inventoryListEl.appendChild(table);
}

function startEditInventory(index) {
  loadInventory();
  if (index < 0 || index >= inventoryItems.length) return;
  const it = inventoryItems[index];
  editingInventoryIndex = index;
  inventoryForm.addBtn.textContent = "Save Item";
  inventoryForm.cancelBtn.style.display = "inline-block";
  inventoryForm.name.value = it.name || "";
  inventoryForm.cat.value = it.cat || "";
  inventoryForm.lot.value = it.lot || "";
  inventoryForm.expiry.value = it.expiry || "";
  inventoryForm.storage.value = it.storage || "";
  inventoryForm.qty.value = it.qty || "";
  inventoryForm.vol.value = it.volPer || "";
  inventoryForm.url.value = it.url || "";
}

function deleteInventory(index) {
  loadInventory();
  if (index < 0 || index >= inventoryItems.length) return;
  inventoryItems.splice(index, 1);
  persistInventory();
  renderInventoryList();
  refreshComponentSelects();
}

function getLotsForName(name) {
  loadInventory();
  return inventoryItems.filter((i) => i.name === name).map((i) => i.lot);
}

function parseVolToMl(input) {
  if (!input) return 0;
  const str = String(input).trim();
  const match = str.match(/([\d.,]+)\s*(µ?u?l|ml|mL|UL|uL|L)?/i);
  if (!match) return 0;
  const val = parseFloat(match[1].replace(",", "."));
  const unit = (match[2] || "mL").toLowerCase();
  if (Number.isNaN(val)) return 0;
  if (unit === "l") return val * 1000;
  if (unit === "ul" || unit === "µl") return val / 1000;
  return val; // mL default
}

// ---------- Aliquot Modal ----------

// ---------- Storage Modal ----------

function loadStorage() {
  try {
    const raw = localStorage.getItem("storageV1");
    storageItems = raw ? JSON.parse(raw) : [];
  } catch {
    storageItems = [];
  }
}

function persistStorage() {
  try {
    localStorage.setItem("storageV1", JSON.stringify(storageItems));
  } catch {}
  markProjectStateMutatedLocally();
  scheduleProjectStateSync();
  scheduleCanvasSync();
}

function initStorageModal() {
  if (storageModal) return;
  storageModal = document.createElement("div");
  storageModal.className = "modal-backdrop is-hidden";
  storageModal.innerHTML = `
    <div class="modal" style="max-width: 820px;">
      <div class="modal__header">
        <h3 class="modal__title">Storage Locations</h3>
        <button type="button" data-store-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <div class="field-grid">
          <label>Name<input id="storeName" type="text" placeholder="Freezer A"></label>
          <label>Type<input id="storeType" type="text" placeholder="Freezer / Fridge / RT"></label>
          <label>Temperature<input id="storeTemp" type="text" placeholder="-80°C, 4°C"></label>
          <label>Location<input id="storeLoc" type="text" placeholder="Room 2, Rack B3"></label>
          <label>Capacity / Notes<input id="storeNotes" type="text" placeholder="e.g., 10 boxes"></label>
        </div>
        <div class="modal__footer" style="justify-content:flex-start;padding:6px 0 0;">
          <button type="button" data-store-add>Add</button>
          <button type="button" data-store-cancel style="margin-left:8px;display:none;">Cancel edit</button>
        </div>
        <div id="storeList" class="table-list" style="max-height:260px;overflow:auto;margin-top:12px;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(storageModal);
  storageListEl = storageModal.querySelector("#storeList");
  storageForm = {
    name: storageModal.querySelector("#storeName"),
    type: storageModal.querySelector("#storeType"),
    temp: storageModal.querySelector("#storeTemp"),
    loc: storageModal.querySelector("#storeLoc"),
    notes: storageModal.querySelector("#storeNotes"),
    addBtn: storageModal.querySelector("[data-store-add]"),
    cancelBtn: storageModal.querySelector("[data-store-cancel]"),
  };
  storageModal.querySelectorAll("[data-store-close]").forEach((el) =>
    el.addEventListener("click", closeStorageModal)
  );
  storageModal.addEventListener("click", (e) => {
    if (e.target === storageModal) closeStorageModal();
  });
  storageForm.addBtn.addEventListener("click", saveStorageItem);
  storageForm.cancelBtn.addEventListener("click", resetStorageForm);
  loadStorage();
  renderStorageList();
}

function openStorageModal() {
  initStorageModal();
  loadStorage();
  renderStorageList();
  storageModal.classList.remove("is-hidden");
  storageModal.style.display = "flex";
}

function closeStorageModal() {
  if (!storageModal) return;
  storageModal.classList.add("is-hidden");
  storageModal.style.display = "none";
}

function resetStorageForm() {
  editingStorageIndex = -1;
  storageForm.addBtn.textContent = "Add";
  storageForm.cancelBtn.style.display = "none";
  storageForm.name.value = "";
  storageForm.type.value = "";
  storageForm.temp.value = "";
  storageForm.loc.value = "";
  storageForm.notes.value = "";
}

function saveStorageItem() {
  const name = storageForm.name.value.trim();
  if (!name) return;
  const payload = {
    name,
    type: storageForm.type.value.trim(),
    temp: storageForm.temp.value.trim(),
    loc: storageForm.loc.value.trim(),
    notes: storageForm.notes.value.trim(),
  };
  loadStorage();
  if (editingStorageIndex >= 0 && editingStorageIndex < storageItems.length) {
    storageItems[editingStorageIndex] = { ...storageItems[editingStorageIndex], ...payload };
  } else {
    storageItems.push(payload);
  }
  persistStorage();
  renderStorageList();
  resetStorageForm();
  showTaskToast("Storage saved");
}

function renderStorageList() {
  if (!storageListEl) return;
  loadStorage();
  storageListEl.innerHTML = "";
  if (!storageItems.length) {
    storageListEl.textContent = "No storage locations.";
    return;
  }
  const table = document.createElement("table");
  table.className = "simple-table";
  table.innerHTML = `
    <thead><tr><th>Name</th><th>Type</th><th>Temp</th><th>Location</th><th>Notes</th><th>Actions</th></tr></thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector("tbody");
  storageItems.forEach((s, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.type || ""}</td>
      <td>${s.temp || ""}</td>
      <td>${s.loc || ""}</td>
      <td>${s.notes || ""}</td>
      <td>
        <button class="pill-btn" data-store-edit="${idx}">Edit</button>
        <button class="pill-btn pill-btn--danger" data-store-del="${idx}">Del</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("[data-store-edit]").forEach((btn) =>
    btn.addEventListener("click", () => startEditStorage(parseInt(btn.dataset.storeEdit, 10)))
  );
  tbody.querySelectorAll("[data-store-del]").forEach((btn) =>
    btn.addEventListener("click", () => deleteStorage(parseInt(btn.dataset.storeDel, 10)))
  );
  storageListEl.appendChild(table);
}

function startEditStorage(idx) {
  loadStorage();
  if (idx < 0 || idx >= storageItems.length) return;
  const s = storageItems[idx];
  editingStorageIndex = idx;
  storageForm.addBtn.textContent = "Save";
  storageForm.cancelBtn.style.display = "inline-block";
  storageForm.name.value = s.name || "";
  storageForm.type.value = s.type || "";
  storageForm.temp.value = s.temp || "";
  storageForm.loc.value = s.loc || "";
  storageForm.notes.value = s.notes || "";
}

function deleteStorage(idx) {
  loadStorage();
  if (idx < 0 || idx >= storageItems.length) return;
  storageItems.splice(idx, 1);
  persistStorage();
  renderStorageList();
}

// ---------- Storage Boxes ----------

function loadStorageBoxes() {
  try {
    const raw = localStorage.getItem("storageBoxesV1");
    storageBoxes = raw ? JSON.parse(raw) : [];
  } catch {
    storageBoxes = [];
  }
}

function persistStorageBoxes() {
  try {
    localStorage.setItem("storageBoxesV1", JSON.stringify(storageBoxes));
  } catch {}
  markProjectStateMutatedLocally();
  scheduleProjectStateSync();
  scheduleCanvasSync();
}

function initStorageBoxModal() {
  if (storageBoxModal) return;
  storageBoxModal = document.createElement("div");
  storageBoxModal.className = "modal-backdrop is-hidden";
  storageBoxModal.innerHTML = `
    <div class="modal" style="max-width: 780px;">
      <div class="modal__header">
        <h3 class="modal__title">Storage Boxes</h3>
        <button type="button" data-sb-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <div class="field-grid">
          <label>Box name<input id="sbName" type="text" placeholder="Box A1"></label>
          <label>Location<select id="sbLoc"></select></label>
          <label>Grid size
            <div style="display:flex;gap:6px;align-items:center;">
              <button type="button" id="sbGridDec" class="pill-btn" style="padding:4px 8px;">-</button>
              <span id="sbGridDisplay" style="min-width:60px;text-align:center;font-weight:600;">9x9</span>
              <button type="button" id="sbGridInc" class="pill-btn" style="padding:4px 8px;">+</button>
            </div>
          </label>
          <label>Notes<input id="sbNotes" type="text" placeholder="e.g., cells batch 3"></label>
          <label class="sb-share-lab-label" style="display:flex;align-items:center;gap:8px;grid-column:1/-1;margin-top:4px;">
            <input id="sbShareLab" type="checkbox" style="width:auto;margin:0;">
            <span style="font-size:0.8125rem;color:var(--muted,#94a3b8)">Share with lab</span>
          </label>
        </div>
        <div class="modal__footer" style="justify-content:flex-start;padding:6px 0 0;">
          <button type="button" data-sb-add>Add</button>
          <button type="button" data-sb-cancel style="margin-left:8px;display:none;">Cancel edit</button>
        </div>
        <div id="sbList" class="table-list" style="max-height:260px;overflow:auto;margin-top:12px;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(storageBoxModal);
  storageBoxListEl = storageBoxModal.querySelector("#sbList");
  storageBoxForm = {
    name: storageBoxModal.querySelector("#sbName"),
    loc: storageBoxModal.querySelector("#sbLoc"),
    gridDisplay: storageBoxModal.querySelector("#sbGridDisplay"),
    gridInc: storageBoxModal.querySelector("#sbGridInc"),
    gridDec: storageBoxModal.querySelector("#sbGridDec"),
    notes: storageBoxModal.querySelector("#sbNotes"),
    shareLab: storageBoxModal.querySelector("#sbShareLab"),
    shareLabLabel: storageBoxModal.querySelector(".sb-share-lab-label"),
    addBtn: storageBoxModal.querySelector("[data-sb-add]"),
    cancelBtn: storageBoxModal.querySelector("[data-sb-cancel]"),
  };
  storageBoxModal.querySelectorAll("[data-sb-close]").forEach((el) =>
    el.addEventListener("click", closeStorageBoxModal)
  );
  storageBoxModal.addEventListener("click", (e) => {
    if (e.target === storageBoxModal) closeStorageBoxModal();
  });
  storageBoxForm.addBtn.addEventListener("click", saveStorageBox);
  storageBoxForm.cancelBtn.addEventListener("click", resetStorageBoxForm);
  storageBoxForm.gridInc.addEventListener("click", () => tweakGrid(1));
  storageBoxForm.gridDec.addEventListener("click", () => tweakGrid(-1));
  loadStorageBoxes();
  renderStorageBoxList();
  refreshStorageSelect();
  resetStorageBoxForm();
}

function openStorageBoxModal() {
  initStorageBoxModal();
  loadStorageBoxes();
  renderStorageBoxList();
  refreshStorageSelect();
  storageBoxModal.classList.remove("is-hidden");
  storageBoxModal.style.display = "flex";
}

function closeStorageBoxModal() {
  if (!storageBoxModal) return;
  storageBoxModal.classList.add("is-hidden");
  storageBoxModal.style.display = "none";
}

function resetStorageBoxForm() {
  editingStorageBoxIndex = -1;
  storageBoxForm.addBtn.textContent = "Add";
  storageBoxForm.cancelBtn.style.display = "none";
  storageBoxForm.name.value = "";
  refreshStorageSelect();
  storageBoxForm.gridDisplay.textContent = "9x9";
  storageBoxForm.notes.value = "";
  if (storageBoxForm.shareLab) storageBoxForm.shareLab.checked = false;
  // Show/hide share-with-lab based on whether canvas has a lab
  if (storageBoxForm.shareLabLabel) {
    const canvasLab = dashboardCanvasList.find(c => c.id === currentCanvasId)?.lab;
    storageBoxForm.shareLabLabel.style.display = canvasLab ? "flex" : "none";
  }
}

function saveStorageBox() {
  const name = storageBoxForm.name.value.trim();
  if (!name) return;
  const grid = storageBoxForm.gridDisplay.textContent.trim();
  const payload = {
    name,
    loc: storageBoxForm.loc.value,
    grid,
    notes: storageBoxForm.notes.value.trim(),
    shared_with_lab: storageBoxForm.shareLab ? storageBoxForm.shareLab.checked : false,
  };
  loadStorageBoxes();
  if (editingStorageBoxIndex >= 0 && editingStorageBoxIndex < storageBoxes.length) {
    storageBoxes[editingStorageBoxIndex] = { ...storageBoxes[editingStorageBoxIndex], ...payload };
  } else {
    storageBoxes.push(payload);
  }
  persistStorageBoxes();
  renderStorageBoxList();
  resetStorageBoxForm();
  showTaskToast("Storage box saved");
}

function renderStorageBoxList() {
  if (!storageBoxListEl) return;
  loadStorageBoxes();
  storageBoxListEl.innerHTML = "";
  if (!storageBoxes.length) {
    storageBoxListEl.textContent = "No storage boxes.";
    return;
  }
  const table = document.createElement("table");
  table.className = "simple-table";
  const canvasLab = dashboardCanvasList.find(c => c.id === currentCanvasId)?.lab;
  const showLabCol = !!canvasLab;
  table.innerHTML = `
    <thead><tr><th>Name</th><th>Location</th><th>Grid</th><th>Notes</th>${showLabCol ? "<th>Lab</th>" : ""}<th>Actions</th></tr></thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector("tbody");
  storageBoxes.forEach((s, idx) => {
    const labCell = showLabCol ? `<td>${s.shared_with_lab ? '<span style="color:#60a5fa;font-size:0.75rem">shared</span>' : ""}</td>` : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.loc || ""}</td>
      <td>${s.grid || ""}</td>
      <td>${s.notes || ""}</td>
      ${labCell}
      <td>
        <button class="pill-btn" data-sb-view="${idx}">View</button>
        <button class="pill-btn" data-sb-edit="${idx}">Edit</button>
        <button class="pill-btn pill-btn--danger" data-sb-del="${idx}">Del</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("[data-sb-view]").forEach((btn) =>
    btn.addEventListener("click", () => viewStorageBox(parseInt(btn.dataset.sbView, 10)))
  );
  tbody.querySelectorAll("[data-sb-edit]").forEach((btn) =>
    btn.addEventListener("click", () => startEditStorageBox(parseInt(btn.dataset.sbEdit, 10)))
  );
  tbody.querySelectorAll("[data-sb-del]").forEach((btn) =>
    btn.addEventListener("click", () => deleteStorageBox(parseInt(btn.dataset.sbDel, 10)))
  );
  storageBoxListEl.appendChild(table);
}

function startEditStorageBox(idx) {
  loadStorageBoxes();
  if (idx < 0 || idx >= storageBoxes.length) return;
  const s = storageBoxes[idx];
  editingStorageBoxIndex = idx;
  storageBoxForm.addBtn.textContent = "Save";
  storageBoxForm.cancelBtn.style.display = "inline-block";
  storageBoxForm.name.value = s.name || "";
  refreshStorageSelect();
  storageBoxForm.loc.value = s.loc || "";
  storageBoxForm.gridDisplay.textContent = s.grid || "9x9";
  storageBoxForm.notes.value = s.notes || "";
  if (storageBoxForm.shareLab) storageBoxForm.shareLab.checked = !!s.shared_with_lab;
}

function deleteStorageBox(idx) {
  loadStorageBoxes();
  if (idx < 0 || idx >= storageBoxes.length) return;
  storageBoxes.splice(idx, 1);
  persistStorageBoxes();
  renderStorageBoxList();
}

function refreshStorageSelect() {
  if (!storageBoxForm?.loc) return;
  loadStorage();
  const select = storageBoxForm.loc;
  select.innerHTML = "";
  const opts = storageItems.map((s) => s.name);
  if (!opts.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No storage locations";
    select.appendChild(opt);
    select.disabled = true;
  } else {
    opts.forEach((n) => {
      const opt = document.createElement("option");
      opt.value = n;
      opt.textContent = n;
      select.appendChild(opt);
    });
    select.disabled = false;
  }
}

function tweakGrid(delta) {
  const current = storageBoxForm.gridDisplay.textContent || "9x9";
  const match = current.match(/(\\d+)x(\\d+)/);
  let rows = 9, cols = 9;
  if (match) {
    rows = parseInt(match[1], 10);
    cols = parseInt(match[2], 10);
  }
  const next = Math.max(1, Math.min(20, rows + delta));
  storageBoxForm.gridDisplay.textContent = `${next}x${next}`;
}

function ensureStorageBoxViewModal() {
  if (storageBoxViewModal) return;
  storageBoxViewModal = document.createElement("div");
  storageBoxViewModal.className = "modal-backdrop is-hidden";
  storageBoxViewModal.innerHTML = `
    <div class="modal" style="max-width: 820px;">
      <div class="modal__header" style="align-items:center;gap:8px;">
        <button type="button" class="pill-btn" data-sbv-prev aria-label="Prev">◀</button>
        <h3 class="modal__title" id="sbViewTitle" style="flex:1;text-align:center;">Box</h3>
        <button type="button" class="pill-btn" data-sbv-next aria-label="Next">▶</button>
        <button type="button" data-sbv-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <div id="sbViewGrid" class="sb-grid sb-grid--round"></div>
      </div>
    </div>
  `;
  document.body.appendChild(storageBoxViewModal);
  storageBoxViewModal.querySelector("[data-sbv-close]").addEventListener("click", closeStorageBoxView);
  storageBoxViewModal.addEventListener("click", (e) => {
    if (e.target === storageBoxViewModal) closeStorageBoxView();
  });
  storageBoxViewModal.querySelector("[data-sbv-prev]").addEventListener("click", () => cycleBox(-1));
  storageBoxViewModal.querySelector("[data-sbv-next]").addEventListener("click", () => cycleBox(1));
}

function viewStorageBox(idx) {
  loadStorageBoxes();
  if (idx < 0 || idx >= storageBoxes.length) return;
  ensureStorageBoxViewModal();
  storageBoxViewIndex = idx;
  const box = storageBoxes[idx];
  ensureBoxCells(box);
  const title = storageBoxViewModal.querySelector("#sbViewTitle");
  const gridEl = storageBoxViewModal.querySelector("#sbViewGrid");
  title.textContent = `${box.name} (${box.grid || "9x9"}) @ ${box.loc || "No location"}`;
  const match = (box.grid || "9x9").match(/(\\d+)x(\\d+)/);
  const size = match ? Math.max(1, Math.min(20, parseInt(match[1], 10))) : 9;
  gridEl.innerHTML = "";
  gridEl.style.setProperty("--sb-cols", size);
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement("div");
    cell.className = "sb-cell";
    const num = document.createElement("span");
    num.className = "sb-cell__index";
    num.textContent = cellLabel(i, size);
    const content = document.createElement("span");
    content.className = "sb-cell__content";
    const filled = box.cells && box.cells[i];
    content.textContent = filled ? (filled.name || "").slice(0, 3).toUpperCase() : "";
    cell.appendChild(num);
    cell.appendChild(content);
    gridEl.appendChild(cell);
  }
  storageBoxViewModal.classList.remove("is-hidden");
  storageBoxViewModal.style.display = "flex";
}

function closeStorageBoxView() {
  if (!storageBoxViewModal) return;
  storageBoxViewModal.classList.add("is-hidden");
  storageBoxViewModal.style.display = "none";
}

function cycleBox(delta) {
  loadStorageBoxes();
  if (!storageBoxes.length) return;
  if (storageBoxViewIndex === -1) storageBoxViewIndex = 0;
  storageBoxViewIndex = (storageBoxViewIndex + delta + storageBoxes.length) % storageBoxes.length;
  viewStorageBox(storageBoxViewIndex);
}

function initAliquotModal() {
  if (aliquotModal) return;
  aliquotModal = document.createElement("div");
  aliquotModal.className = "modal-backdrop modal-backdrop--center is-hidden";
  aliquotModal.innerHTML = `
    <div class="modal" style="max-width: 520px;">
      <div class="modal__header">
        <h3 class="modal__title">Record Aliquots</h3>
        <button type="button" data-aliq-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <div class="field-grid">
          <label>Product<select id="aliqName"></select></label>
          <label>Lot<select id="aliqLot"></select></label>
          <label>Units aliquotted<input id="aliqUnits" type="number" min="1" step="1" value="1"></label>
          <label>Vol / aliquot
            <div style="display:flex;gap:6px;">
              <input id="aliqVolValue" type="number" min="0" step="0.01" placeholder="1.0" style="flex:1;">
              <select id="aliqVolUnit" style="width:80px;">
                <option value="mL">mL</option>
                <option value="uL">µL</option>
                <option value="L">L</option>
              </select>
            </div>
          </label>
          <label># of aliquots<input id="aliqCount" type="number" min="1" step="1"></label>
          <label>Aliquot storage<input id="aliqStorage" type="text" placeholder="-80°C rack B2"></label>
          <label>Storage box<select id="aliqBoxSelect"></select></label>
        </div>
        <div id="aliqBoxGridWrap" class="sb-grid sb-grid--round sb-grid--mini"></div>
      </div>
      <div class="modal__footer" style="justify-content:flex-end;">
        <button type="button" data-aliq-cancel>Cancel</button>
        <button type="button" data-aliq-save style="margin-left:8px;">Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(aliquotModal);
  aliquotForm = {
    name: aliquotModal.querySelector("#aliqName"),
    lot: aliquotModal.querySelector("#aliqLot"),
    units: aliquotModal.querySelector("#aliqUnits"),
    volValue: aliquotModal.querySelector("#aliqVolValue"),
    volUnit: aliquotModal.querySelector("#aliqVolUnit"),
    count: aliquotModal.querySelector("#aliqCount"),
    storage: aliquotModal.querySelector("#aliqStorage"),
    boxSelect: aliquotModal.querySelector("#aliqBoxSelect"),
    gridWrap: aliquotModal.querySelector("#aliqBoxGridWrap"),
    save: aliquotModal.querySelector("[data-aliq-save]"),
    cancel: aliquotModal.querySelector("[data-aliq-cancel]"),
  };
  aliquotModal.querySelectorAll("[data-aliq-close], [data-aliq-cancel]").forEach((el) =>
    el.addEventListener("click", closeAliquotModal)
  );
  aliquotModal.addEventListener("click", (e) => {
    if (e.target === aliquotModal) closeAliquotModal();
  });
  // keep canvas from receiving drops when dragging inside modal
  ["dragover", "drop"].forEach((evt) =>
    aliquotModal.addEventListener(
      evt,
      (e) => {
        e.preventDefault();
      },
      true
    )
  );
  aliquotForm.name.addEventListener("change", refreshAliquotLots);
  aliquotForm.units.addEventListener("input", autoCalcAliquotCount);
  aliquotForm.volValue.addEventListener("input", autoCalcAliquotCount);
  aliquotForm.volUnit.addEventListener("change", autoCalcAliquotCount);
  aliquotForm.boxSelect.addEventListener("change", onAliquotBoxChange);
  aliquotForm.count.addEventListener("input", renderAliquotBoxGrid);
  aliquotForm.lot.addEventListener("change", renderAliquotBoxGrid);
  aliquotForm.save.addEventListener("click", saveAliquot);
}

function openAliquotModal() {
  initAliquotModal();
  loadInventory();
  fillAliquotNameList();
  refreshAliquotLots();
  refreshAliquotBoxOptions();
  renderAliquotBoxGrid();
  autoCalcAliquotCount();
  aliquotModal.classList.remove("is-hidden");
  aliquotModal.style.display = "flex";
}

function closeAliquotModal() {
  if (!aliquotModal) return;
  aliquotModal.classList.add("is-hidden");
  aliquotModal.style.display = "none";
}

function fillAliquotNameList() {
  const select = aliquotForm.name;
  select.innerHTML = "";
  const names = [...new Set(inventoryItems.map((i) => i.name))];
  names.forEach((n) => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    select.appendChild(opt);
  });
  select.disabled = !names.length;
  if (names.length && !select.value) {
    select.value = names[0];
  }
  renderAliquotBoxGrid();
}

function refreshAliquotBoxOptions() {
  if (!aliquotForm?.boxSelect) return;
  loadStorageBoxes();
  const sel = aliquotForm.boxSelect;
  sel.innerHTML = "";
  const optNone = document.createElement("option");
  optNone.value = "";
  optNone.textContent = "No box";
  sel.appendChild(optNone);
  storageBoxes.forEach((b, idx) => {
    const opt = document.createElement("option");
    opt.value = idx.toString();
    opt.textContent = `${b.name} (${b.loc || "location?"})`;
    sel.appendChild(opt);
  });
  sel.value = optNone.value;
  aliquotBoxCurrent = null;
  renderAliquotBoxGrid();
}

function refreshAliquotLots() {
  const name = aliquotForm.name.value.trim();
  const lots = getLotsForName(name);
  const select = aliquotForm.lot;
  select.innerHTML = "";
  lots.forEach((l) => {
    const opt = document.createElement("option");
    opt.value = l;
    opt.textContent = l;
    select.appendChild(opt);
  });
  if (!lots.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No lots";
    select.appendChild(opt);
  }
  renderAliquotBoxGrid();
}

function autoCalcAliquotCount() {
  const units = Number(aliquotForm.units.value) || 0;
  const name = aliquotForm.name.value.trim();
  const lot = aliquotForm.lot.value;
  const inv = inventoryItems.find((i) => i.name === name && i.lot === lot);
  const unitVolMl = parseVolToMl(inv?.volPer);
  const aliqVol = parseVolToMl(`${aliquotForm.volValue.value || 0} ${aliquotForm.volUnit.value || "mL"}`);
  if (units > 0 && aliqVol > 0 && unitVolMl > 0) {
    const est = Math.max(1, Math.floor((units * unitVolMl) / aliqVol));
    aliquotForm.count.value = est;
  }
  renderAliquotBoxGrid();
}

function onAliquotBoxChange() {
  const v = aliquotForm.boxSelect.value;
  aliquotBoxCurrent = v === "" ? null : parseInt(v, 10);
  aliquotPlacement = null;
  aliquotPlacementBox = null;
  renderAliquotBoxGrid();
}

function ensureBoxCells(box) {
  const size = parseGridSize(box.grid || "9x9");
  const total = size * size;
  if (!Array.isArray(box.cells)) box.cells = [];
  while (box.cells.length < total) box.cells.push(null);
  if (box.cells.length > total) box.cells = box.cells.slice(0, total);
  return size;
}

function parseGridSize(gridStr) {
  const match = (gridStr || "").match(/(\\d+)x(\\d+)/);
  const n = match ? parseInt(match[1], 10) : 9;
  return Math.max(1, Math.min(20, n));
}

function alphaLabel(n) {
  let s = "";
  n += 1;
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

function cellLabel(idx, size) {
  const row = Math.floor(idx / size);
  const col = (idx % size) + 1;
  return `${alphaLabel(row)}${col}`;
}

function renderAliquotBoxGrid() {
  if (!aliquotForm?.gridWrap) return;
  const wrap = aliquotForm.gridWrap;
  wrap.innerHTML = "";
  if (aliquotBoxCurrent === null || aliquotBoxCurrent < 0 || aliquotBoxCurrent >= storageBoxes.length) {
    wrap.style.display = "none";
    return;
  }
  wrap.style.display = "grid";
  const box = storageBoxes[aliquotBoxCurrent];
  const size = ensureBoxCells(box);
  const total = size * size;
  if (!aliquotPlacement || aliquotPlacementBox !== aliquotBoxCurrent) {
    aliquotPlacement = Array.from({ length: total }, (_, i) => box.cells[i] ? { ...box.cells[i] } : null);
    aliquotPlacementBox = aliquotBoxCurrent;
  } else if (aliquotPlacement.length !== total) {
    aliquotPlacement = Array.from({ length: total }, (_, i) => aliquotPlacement[i] || null);
  }
  const targetPreviewCount = Math.max(0, Number(aliquotForm.count.value) || 0);
  const name = aliquotForm.name.value.trim();
  const lot = aliquotForm.lot.value;
  const vol = `${aliquotForm.volValue.value || ""} ${aliquotForm.volUnit.value || "mL"}`.trim();
  const previewIndices = [];
  for (let i = 0; i < aliquotPlacement.length; i++) {
    const cell = aliquotPlacement[i];
    if (!cell?.preview) continue;
    cell.name = name;
    cell.lot = lot;
    cell.vol = vol;
    previewIndices.push(i);
  }
  if (previewIndices.length > targetPreviewCount) {
    for (let i = previewIndices.length - 1; i >= targetPreviewCount; i--) {
      aliquotPlacement[previewIndices[i]] = null;
    }
  } else if (previewIndices.length < targetPreviewCount) {
    let remaining = targetPreviewCount - previewIndices.length;
    for (let i = 0; i < aliquotPlacement.length && remaining > 0; i++) {
      if (aliquotPlacement[i]) continue;
      aliquotPlacement[i] = { name, lot, vol, preview: true };
      remaining--;
    }
  }
  const previewCells = aliquotPlacement.slice();
  wrap.style.setProperty("--sb-cols", size);
  wrap.classList.add("sb-grid--round", "sb-grid--mini");
  previewCells.forEach((cell, idx) => {
    const c = document.createElement("div");
    c.className = "sb-cell sb-cell--mini";
    c.dataset.index = idx;
    const isDraggable = !!cell;
    c.draggable = isDraggable;
    c.setAttribute("draggable", isDraggable ? "true" : "false");
    const num = document.createElement("span");
    num.className = "sb-cell__index";
    num.textContent = cellLabel(idx, size);
    const content = document.createElement("span");
    content.className = "sb-cell__content";
    content.textContent = cell ? cell.name.slice(0, 3).toUpperCase() : "";
    c.title = cell ? `${cell.name} (${cell.lot || ""})` : "Empty";
    if (cell && cell.preview) c.classList.add("sb-cell--preview");
    c.addEventListener("dragstart", (e) => {
      if (!cell) {
        e.preventDefault();
        return;
      }
      modalDragActive = true;
      currentAliquotDragFrom = idx;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", idx.toString());
    });
    c.addEventListener("dragenter", (e) => {
      if (!modalDragActive) return;
      e.preventDefault();
      e.stopPropagation();
    });
    c.addEventListener("dragend", () => {
      modalDragActive = false;
      currentAliquotDragFrom = null;
    });
    c.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
    });
    c.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const fromData = e.dataTransfer.getData("text/plain");
      const from = fromData ? parseInt(fromData, 10) : currentAliquotDragFrom;
      const to = idx;
      if (Number.isNaN(from) || Number.isNaN(to) || from === to) return;
      const tmp = aliquotPlacement[from];
      aliquotPlacement[from] = aliquotPlacement[to];
      aliquotPlacement[to] = tmp;
      modalDragActive = false;
      currentAliquotDragFrom = null;
      renderAliquotBoxGrid();
    });
    c.appendChild(num);
    c.appendChild(content);
    wrap.appendChild(c);
  });
}

function placeAliquotsInBox(boxIdx, name, lot, count, vol) {
  loadStorageBoxes();
  if (boxIdx < 0 || boxIdx >= storageBoxes.length) return;
  const box = storageBoxes[boxIdx];
  const size = ensureBoxCells(box);
  if (aliquotPlacement && aliquotPlacementBox === boxIdx) {
    // commit the current placement, converting previews to real
    box.cells = aliquotPlacement.map((c) => (c ? { name: c.name, lot: c.lot, vol: c.vol } : null));
  } else {
    let remaining = count;
    for (let i = 0; i < box.cells.length && remaining > 0; i++) {
      if (!box.cells[i]) {
        box.cells[i] = { name, lot, vol };
        remaining--;
      }
    }
  }
  persistStorageBoxes();
  if (storageBoxViewIndex === boxIdx) viewStorageBox(boxIdx);
  if (aliquotBoxCurrent === boxIdx) renderAliquotBoxGrid();
}

function saveAliquot() {
  const name = aliquotForm.name.value.trim();
  const lot = aliquotForm.lot.value;
  const units = Number(aliquotForm.units.value) || 0;
  const aliqVol = `${aliquotForm.volValue.value || ""} ${aliquotForm.volUnit.value || "mL"}`.trim();
  const aliqCount = Number(aliquotForm.count.value) || 0;
  const storage = aliquotForm.storage.value.trim();
  const boxIdx = parseInt(aliquotForm.boxSelect.value || "-1", 10);
  if (!name || !lot || !aliqVol || !aliqCount) return;
  loadInventory();
  const idx = inventoryItems.findIndex((i) => i.name === name && i.lot === lot);
  if (idx === -1) {
    showTaskToast("Inventory item not found");
    return;
  }
  const item = inventoryItems[idx];
  item.aliquotted = true;
  item.aliquotVol = aliqVol;
  item.aliquotStorage = storage;
  item.aliquotCount = aliqCount;
  item.aliquotUnits = units;
  item.qty = Math.max(0, (item.qty || 0) - units);
  if (!Array.isArray(item.aliquots)) item.aliquots = [];
  item.aliquots.push({
    count: aliqCount,
    vol: aliqVol,
    storage,
    unitsUsed: units,
    lot,
    ts: Date.now(),
    user: currentUser || "System",
    boxIdx: Number.isFinite(boxIdx) && boxIdx >= 0 ? boxIdx : null,
  });
  inventoryItems[idx] = item;
  persistInventory();
  if (Number.isFinite(boxIdx) && boxIdx >= 0) {
    placeAliquotsInBox(boxIdx, name, lot, aliqCount, aliqVol);
  }
  renderInventoryList();
  refreshComponentSelects();
  showTaskToast("Aliquots recorded");
  closeAliquotModal();
}

// ---------- Media Formulation ----------

function loadMediaFormulations() {
  try {
    const raw = localStorage.getItem("mediaFormulationsV1");
    mediaFormulations = raw ? JSON.parse(raw) : [];
  } catch {
    mediaFormulations = [];
  }
}

function persistMediaFormulations() {
  try {
    localStorage.setItem("mediaFormulationsV1", JSON.stringify(mediaFormulations));
  } catch {
    /* ignore */
  }
  markProjectStateMutatedLocally();
  scheduleProjectStateSync();
  scheduleCanvasSync();
}

function initMediaFormulationModal() {
  if (mediaFormulationModal) return;
  mediaFormulationModal = document.createElement("div");
  mediaFormulationModal.className = "modal-backdrop is-hidden";
  mediaFormulationModal.innerHTML = `
    <div class="modal modal--media-formulation">
      <div class="modal__header">
        <div class="mf-header-text">
          <h3 class="modal__title">Media Formulation</h3>
          <p class="mf-subtitle">Build reusable media recipes from inventory components and tracked lots.</p>
        </div>
        <button type="button" class="modal__close-btn" data-medf-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <section class="mf-builder">
          <div class="field-grid field-grid--mf">
            <label>Media name<input id="mfName" type="text" placeholder="Custom Basal + supplements"></label>
          </div>
          <div id="mfComponents" class="mf-components"></div>
          <div class="mf-builder__actions">
            <button type="button" data-mc-add>Add Component</button>
            <button type="button" data-mc-save>Save Formulation</button>
          </div>
        </section>
        <section class="mf-library">
          <div class="mf-library__heading">Saved formulations</div>
          <div id="mfList" class="table-list mf-library__list"></div>
        </section>
      </div>
      <div class="modal__footer mf-footer">
        <button type="button" data-medf-close>Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(mediaFormulationModal);
  mediaFormulationListEl = mediaFormulationModal.querySelector("#mfList");
  mediaFormulationForm = {
    name: mediaFormulationModal.querySelector("#mfName"),
    compWrap: mediaFormulationModal.querySelector("#mfComponents"),
    addBtn: mediaFormulationModal.querySelector("[data-mc-add]"),
    saveBtn: mediaFormulationModal.querySelector("[data-mc-save]"),
  };
  mediaFormulationModal.querySelectorAll("[data-medf-close]").forEach((el) =>
    el.addEventListener("click", closeMediaFormulationModal)
  );
  mediaFormulationModal.addEventListener("click", (e) => {
    if (e.target === mediaFormulationModal) closeMediaFormulationModal();
  });
  mediaFormulationForm.addBtn.addEventListener("click", () => addComponentRow());
  mediaFormulationForm.saveBtn.addEventListener("click", saveMediaFormulation);
  loadMediaFormulations();
  renderMediaFormulationList();
  addComponentRow(); // start with one row
}

function openMediaFormulationModal() {
  initMediaFormulationModal();
  loadInventory();
  loadMediaFormulations();
  renderMediaFormulationList();
  refreshComponentSelects();
  mediaFormulationModal.classList.remove("is-hidden");
  mediaFormulationModal.style.display = "flex";
}

function closeMediaFormulationModal() {
  if (!mediaFormulationModal) return;
  mediaFormulationModal.classList.add("is-hidden");
  mediaFormulationModal.style.display = "none";
}

function addComponentRow(pref = {}) {
  const row = document.createElement("div");
  row.className = "mf-row";
  const invNames = [...new Set(inventoryItems.map((i) => i.name))];
  const lots = getLotsForName(pref.name || invNames[0] || "");
  row.innerHTML = `
    <select class="mf-comp-name"></select>
    <input type="text" class="mf-comp-conc" placeholder="Amount (e.g., 2% w/v, 20ng/mL)" value="${pref.conc || ""}">
    <select class="mf-comp-lot"></select>
    <input type="text" class="mf-comp-lot-custom" placeholder="Enter lot if not listed" style="display:none;" value="${pref.lot || ""}">
    <button type="button" class="mf-comp-del">✕</button>
  `;
  const nameSelect = row.querySelector(".mf-comp-name");
  buildNameOptions(nameSelect, pref.name);
  const lotSelect = row.querySelector(".mf-comp-lot");
  buildLotOptions(lotSelect, lots, pref.lot);
  lotSelect.addEventListener("change", () => {
    const custom = row.querySelector(".mf-comp-lot-custom");
    if (lotSelect.value === "__custom") {
      custom.style.display = "inline-block";
    } else {
      custom.style.display = "none";
      custom.value = "";
    }
  });
  nameSelect.addEventListener("change", () => {
    const lotsNow = getLotsForName(nameSelect.value);
    buildLotOptions(lotSelect, lotsNow, lotsNow[0] || "");
  });
  row.querySelector(".mf-comp-del").addEventListener("click", () => row.remove());
  mediaFormulationForm.compWrap.appendChild(row);
}

function buildNameOptions(selectEl, preselect) {
  selectEl.innerHTML = "";
  loadInventory();
  const names = [...new Set(inventoryItems.map((i) => i.name))];
  if (!names.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Add inventory first";
    selectEl.appendChild(opt);
    selectEl.disabled = true;
    return;
  }
  names.forEach((n) => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    if (preselect && preselect === n) opt.selected = true;
    selectEl.appendChild(opt);
  });
  if (!preselect) selectEl.value = names[0];
  selectEl.disabled = false;
}

function buildLotOptions(selectEl, lots, preselect) {
  selectEl.innerHTML = "";
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "Select lot";
  selectEl.appendChild(defaultOpt);
  lots.forEach((lot) => {
    const opt = document.createElement("option");
    opt.value = lot;
    opt.textContent = lot;
    if (preselect && preselect === lot) opt.selected = true;
    selectEl.appendChild(opt);
  });
  const customOpt = document.createElement("option");
  customOpt.value = "__custom";
  customOpt.textContent = "Enter lot manually";
  selectEl.appendChild(customOpt);
  if (preselect && !lots.includes(preselect)) {
    selectEl.value = "__custom";
    selectEl.dispatchEvent(new Event("change"));
    const custom = selectEl.parentElement.querySelector(".mf-comp-lot-custom");
    if (custom) custom.value = preselect;
  }
}

function saveMediaFormulation() {
  const name = mediaFormulationForm.name.value.trim();
  if (!name) return;
  const comps = [];
  mediaFormulationForm.compWrap.querySelectorAll(".mf-row").forEach((row) => {
    const cname = row.querySelector(".mf-comp-name").value.trim();
    const conc = row.querySelector(".mf-comp-conc").value.trim();
    const lotSel = row.querySelector(".mf-comp-lot").value;
    const customLot = row.querySelector(".mf-comp-lot-custom").value.trim();
    const lot = lotSel === "__custom" ? customLot : lotSel;
    if (!cname || !lot) return;
    comps.push({ name: cname, conc, lot });
  });
  loadMediaFormulations();
  mediaFormulations.push({ name, components: comps });
  persistMediaFormulations();
  renderMediaFormulationList();
  refreshMediaTypePresetOptions({ keepSelection: false, matchName: name });
  mediaFormulationForm.name.value = "";
  mediaFormulationForm.compWrap.innerHTML = "";
  addComponentRow();
  showTaskToast(comps.length ? "Media formulation saved" : "Media formulation saved (no components yet)");
  if (mediaModal && !mediaModal.classList.contains("is-hidden")) {
    showMediaStatus(`Saved formulation "${name}" and selected it.`, "success");
  }
}

function renderMediaFormulationList() {
  if (!mediaFormulationListEl) return;
  loadMediaFormulations();
  mediaFormulationListEl.innerHTML = "";
  if (!mediaFormulations.length) {
    const empty = document.createElement("div");
    empty.className = "mf-empty";
    empty.textContent = "No formulations yet.";
    mediaFormulationListEl.appendChild(empty);
    return;
  }
  const container = document.createElement("div");
  container.className = "mf-list";
  mediaFormulations.forEach((f) => {
    const card = document.createElement("div");
    card.className = "mf-card";
    const comps = (f.components || []).length
      ? f.components
        .map((c) => `<li>${c.name} — ${c.conc || "amount N/A"} (Lot: ${c.lot})</li>`)
        .join("")
      : "<li>No components listed</li>";
    card.innerHTML = `<strong>${f.name}</strong><ul>${comps}</ul>`;
    container.appendChild(card);
  });
  mediaFormulationListEl.appendChild(container);
}

function refreshComponentSelects() {
  if (!mediaFormulationForm?.compWrap) return;
  mediaFormulationForm.compWrap.querySelectorAll(".mf-comp-name").forEach((sel) => {
    const current = sel.value;
    buildNameOptions(sel, current);
  });
}

function getSelectedMediaFormulationName() {
  if (!mediaForm?.typePreset) return "";
  const raw = String(mediaForm.typePreset.value || "").trim();
  if (!raw) return "";
  const idx = parseInt(raw, 10);
  if (Number.isNaN(idx) || idx < 0 || idx >= mediaFormulations.length) return "";
  return String(mediaFormulations[idx]?.name || "").trim();
}

function refreshMediaTypePresetOptions(options = {}) {
  if (!mediaForm?.typePreset) return;
  loadMediaFormulations();
  const keepSelection = options.keepSelection !== false;
  const matchName = String(options.matchName || "").trim().toLowerCase();
  const prevValue = keepSelection ? String(mediaForm.typePreset.value || "") : "";

  mediaForm.typePreset.innerHTML = "";
  const customOption = document.createElement("option");
  customOption.value = "";
  customOption.textContent = "Select a saved formulation";
  mediaForm.typePreset.appendChild(customOption);

  let matchValue = "";
  mediaFormulations.forEach((item, idx) => {
    const name = String(item?.name || "").trim();
    if (!name) return;
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = name;
    mediaForm.typePreset.appendChild(opt);
    if (!matchValue && matchName && name.toLowerCase() === matchName) {
      matchValue = opt.value;
    }
  });

  const hasPrev = Array.from(mediaForm.typePreset.options).some((opt) => opt.value === prevValue);
  mediaForm.typePreset.value = hasPrev ? prevValue : (matchValue || "");
}

function populateCompletionUsers(selectedName = "") {
  if (!completionUserSelect) return;
  loadUsers();
  completionUserSelect.innerHTML = "";
  const makeOpt = (val, label, disabled = false) => {
    const o = document.createElement("option");
    o.value = val;
    o.textContent = label;
    o.disabled = disabled;
    return o;
  };
  completionUserSelect.appendChild(makeOpt("", "Select user...", true));
  users.forEach((u) => {
    completionUserSelect.appendChild(makeOpt(u.name, u.name));
  });

  const matched = users.find((u) => u.name === selectedName);
  completionUserSelect.value = matched ? matched.name : "";
  if (completionUserOther) {
    completionUserOther.style.display = "none";
    completionUserOther.value = "";
  }
}
function showStartModal(node, markPending = false, plateGroupId = "") {
  if (!node) return;
  initStartModal();
  const isAnimalDetails = isAnimalNode(node) && getNodeWorkspace(node) === "animal-work";
  if (startModalTitleEl) startModalTitleEl.textContent = "Set start date & time";
  if (startModalLabelEl) startModalLabelEl.textContent = "Start date & time";
  if (startModalHintEl) startModalHintEl.textContent = "Format: YYYY-MM-DD and HH:MM (24-hour)";
  if (startModalNoteEl) startModalNoteEl.textContent = "Used for snapping and overdue warnings.";
  if (startModalSexWrap) startModalSexWrap.classList.add("is-hidden");
  if (startModalSex) startModalSex.value = "unknown";

  if (isAnimalDetails) {
    if (startModalTitleEl) startModalTitleEl.textContent = "Set animal birth date & time";
    if (startModalLabelEl) startModalLabelEl.textContent = "Birth date & time";
    if (startModalNoteEl) startModalNoteEl.textContent = "Used for age tracking and transfer logs.";
    if (startModalSexWrap) startModalSexWrap.classList.remove("is-hidden");
    if (startModalSex) {
      const storedSex = String(node.dataset.animalSex || "").trim().toLowerCase();
      const normalizedSex = storedSex === "male" || storedSex === "female" ? storedSex : "unknown";
      startModalSex.value = normalizedSex;
    }
  }
  startModalNode = node;
  startModalPendingPlacement = !!markPending;
  startModalPlateGroupId = "";
  let dt = getNodeDateTime(node);
  if (isMultiWellPlateNode(node)) {
    const resolvedGroupId = resolvePlateGroupSelection(node, plateGroupId);
    if (resolvedGroupId) {
      const parsed = readPlateGroups(node, false);
      const selected = parsed?.groups?.find((group) => group.id === resolvedGroupId);
      const groupStart = selected?.startIso ? new Date(selected.startIso) : null;
      if (groupStart && !Number.isNaN(groupStart.getTime())) {
        dt = groupStart;
      }
      startModalPlateGroupId = resolvedGroupId;
    }
  }
  const { dateStr, timeStr } = splitDateTime(dt);
  if (startModalDate) startModalDate.value = dateStr;
  if (startModalDateProxy) startModalDateProxy.value = dateStr;
  if (startModalTime) startModalTime.value = timeStr;
  startModalDate?.setCustomValidity("");
  startModal.classList.remove("is-hidden");
  startModal.style.display = "flex";
}

function hideStartModal(abortPendingPlacement = false) {
  if (!startModal) return;
  if (abortPendingPlacement && startModalPendingPlacement && startModalNode) {
    // Remove the node entirely if user cancels initial placement.
    const previousCageId = String(startModalNode.dataset.cageId || "");
    startModalNode.remove();
    if (previousCageId) {
      const cageNode = getNodeById(previousCageId);
      if (cageNode) settleAnimalsInCage(cageNode);
    }
    toggleHint();
  }
  startModal.classList.add("is-hidden");
  startModal.style.display = "none";
  startModalNode = null;
  startModalPendingPlacement = false;
  startModalPlateGroupId = "";
}

function saveStartModal() {
  if (!startModalNode || !startModalDate || !startModalTime) {
    hideStartModal(true);
    return;
  }
  const node = startModalNode;
  const isAnimalDetails = isAnimalNode(node) && getNodeWorkspace(node) === "animal-work";
  const previousAbsDay = parseFloat(node.dataset.absDay ?? "NaN");
  let shouldClose = false;
  try {
    const fallback = getNodeDateTime(node);
    const dateVal = (startModalDate.value || "").trim();
    const timeVal = (startModalTime.value || "").trim() || "00:00";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      startModalDate.setCustomValidity("Use YYYY-MM-DD format");
      startModalDate.reportValidity();
      return;
    }
    const [yyyyStr, mmStr, ddStr] = dateVal.split("-");
    const yyyy = Number(yyyyStr);
    const mm = Number(mmStr);
    const dd = Number(ddStr);
    const dateCheck = new Date(yyyy, mm - 1, dd);
    if (
      dateCheck.getFullYear() !== yyyy
      || dateCheck.getMonth() !== mm - 1
      || dateCheck.getDate() !== dd
    ) {
      startModalDate.setCustomValidity("Invalid date. Use YYYY-MM-DD");
      startModalDate.reportValidity();
      return;
    }
    startModalDate.setCustomValidity("");
    startModalDate.value = `${yyyyStr}-${mmStr}-${ddStr}`;
    syncStartDateProxyValue();
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(timeVal)) {
      startModalTime.setCustomValidity("Use HH:MM (24-hour)");
      startModalTime.reportValidity();
      return;
    }
    startModalTime.setCustomValidity("");

    // User confirmed Save with valid inputs; treat placement as committed.
    startModalPendingPlacement = false;

    let chosen = new Date(`${startModalDate.value}T${timeVal}`);
    if (Number.isNaN(chosen.getTime())) chosen = fallback;
    const chosenIso = chosen.toISOString();
    if (isAnimalDetails) {
      node.dataset.animalBirthIso = chosenIso;
      const sex = String(startModalSex?.value || "").trim().toLowerCase();
      if (sex === "male" || sex === "female") {
        node.dataset.animalSex = sex;
      } else {
        node.dataset.animalSex = "unknown";
      }
      const currentCageId = String(node.dataset.cageId || "");
      if (currentCageId) {
        const currentCageNode = getNodeById(currentCageId);
        if (currentCageNode && isCageNode(currentCageNode)) {
          settleAnimalsInCage(currentCageNode);
        }
      }
      shouldClose = true;
      return;
    }
    const plateData = isMultiWellPlateNode(node) ? readPlateGroups(node, false) : null;
    if (plateData && startModalPlateGroupId) {
      const idx = plateData.groups.findIndex((group) => group.id === startModalPlateGroupId);
      if (idx !== -1) {
        const updated = normalizePlateGroupEntry(plateData.groups[idx], chosenIso);
        updated.startIso = chosenIso;
        plateData.groups[idx] = updated;
        plateData.selectedGroupId = updated.id;
        writePlateGroups(node, plateData);
        syncPlateNodeFromGroups(node, plateData);
        renderPlateNodeOverlay(node, plateData);
        shouldClose = true;
        try {
          updateAllConnections();
        } catch (err) {
          console.warn("Failed to refresh connections after plate group start save", err);
        }
        try {
          updateTaskAlerts();
        } catch (err) {
          console.warn("Failed to refresh alerts after plate group start save", err);
        }
        return;
      }
    }
    const hasPlateExperiments = !!plateData && (plateData.groups || []).some((group) => hasPlateGroupExperiment(group));
    if (plateData && hasPlateExperiments) {
      const chosenAbs = chosen.getTime() / DAY_MS;
      const fromAbs = Number.isFinite(previousAbsDay) ? previousAbsDay : chosenAbs;
      const deltaDays = chosenAbs - fromAbs;
      if (Math.abs(deltaDays) > 1e-9) {
        plateData.groups = plateData.groups.map((raw) => {
          const group = normalizePlateGroupEntry(raw, chosenIso);
          const start = new Date(group.startIso);
          if (Number.isNaN(start.getTime())) {
            group.startIso = chosenIso;
            return group;
          }
          const shifted = new Date(start.getTime() + deltaDays * DAY_MS);
          group.startIso = shifted.toISOString();
          return group;
        });
      }
      writePlateGroups(node, plateData);
      syncPlateNodeFromGroups(node, plateData);
      renderPlateNodeOverlay(node, plateData);
      shouldClose = true;
      try {
        updateAllConnections();
      } catch (err) {
        console.warn("Failed to refresh connections after plate start shift", err);
      }
      try {
        updateTaskAlerts();
      } catch (err) {
        console.warn("Failed to refresh alerts after plate start shift", err);
      }
      return;
    }
    if (plateData && !hasPlateExperiments) {
      const selectedGroup = getSelectedPlateGroup(node, plateData);
      if (selectedGroup?.id) {
        const idx = plateData.groups.findIndex((group) => group.id === selectedGroup.id);
        if (idx !== -1) {
          const updated = normalizePlateGroupEntry(plateData.groups[idx], chosenIso);
          updated.startIso = chosenIso;
          plateData.groups[idx] = updated;
          writePlateGroups(node, plateData);
        }
      }
    }

    // Ensure chosen day is visible; shift timeline if needed.
    let baseMidnight = new Date(startDate);
    baseMidnight.setHours(0, 0, 0, 0);
    const span = parseInt(node.dataset.spanDays ?? "1", 10) || 1;
    const hours = chosen.getHours();
    const minutes = chosen.getMinutes();
    let offsetDays = (chosen - baseMidnight) / DAY_MS;
    if (offsetDays < 0) {
      const shift = Math.floor(offsetDays);
      shiftTimeline(shift);
      baseMidnight = new Date(startDate);
      baseMidnight.setHours(0, 0, 0, 0);
      offsetDays = (chosen - baseMidnight) / DAY_MS;
    } else if (offsetDays > dayCount - span) {
      const shift = Math.ceil(offsetDays - (dayCount - span));
      shiftTimeline(shift);
      baseMidnight = new Date(startDate);
      baseMidnight.setHours(0, 0, 0, 0);
      offsetDays = (chosen - baseMidnight) / DAY_MS;
    }

    let startDay = offsetDays;
    startDay = clamp(startDay, 0, Math.max(0, dayCount - span));
    const startDayInt = Math.floor(startDay);
    const absDay = getBaseDay() + startDay;
    const minuteOffset = hours * 60 + minutes;
    node.dataset.absDay = absDay;
    node.dataset.startDay = startDay;
    node.dataset.dayIndex = startDayInt;
    node.dataset.startMinuteOffset = minuteOffset;

    const spanDays = parseInt(node.dataset.spanDays ?? "1", 10) || 1;
    const left = dayToLeft(startDay);
    const width = spanToWidth(spanDays, node);
    const rawTop = parseFloat(node.style.top);
    const fallbackTop = TIMELINE_HEIGHT + 12;
    const snapped = snapY(Number.isFinite(rawTop) ? rawTop : fallbackTop, node);
    const snappedTop = Number.isFinite(snapped.y) ? snapped.y : fallbackTop;
    const minTop = TIMELINE_HEIGHT + 12;
    const maxTop = getCanvasMaxTopForHeight(getNodeVisualHeight(node));
    const boundedTop = clamp(snappedTop, minTop, maxTop);
    const minLeft = 8;
    const maxLeft = Math.max(minLeft, canvas.clientWidth - width - 8);
    const boundedLeft = clamp(left, minLeft, maxLeft);

    // Re-assert committed placement before closing to prevent accidental removal.
    startModalPendingPlacement = false;
    if (!canvas.contains(node)) canvas.appendChild(node);

    node.style.left = `${boundedLeft}px`;
    node.style.width = `${width}px`;
    node.style.top = `${boundedTop}px`;
    if (isMultiWellPlateNode(node)) renderPlateNodeOverlay(node);

    // Commit modal close before optional UI refreshes.
    shouldClose = true;

    try {
      updateAllConnections();
    } catch (err) {
      console.warn("Failed to refresh connections after start save", err);
    }
    try {
      updateTaskAlerts();
    } catch (err) {
      console.warn("Failed to refresh task alerts after start save", err);
    }
  } catch (err) {
    console.error("Failed to save start date/time", err);
  } finally {
    if (shouldClose) {
      hideStartModal(false);
      scheduleCanvasSync();
    }
  }
}

function getNodeDateTime(node) {
  const absDay = parseFloat(node.dataset.absDay ?? "NaN");
  const startMin = parseFloat(node.dataset.startMinuteOffset ?? "0") || 0;
  if (Number.isFinite(absDay)) {
    return new Date(absDay * DAY_MS);
  }
  const base = new Date(startDate || Date.now());
  base.setHours(0, 0, 0, 0);
  const startDay = parseFloat(node.dataset.startDay ?? node.dataset.dayIndex ?? "0") || 0;
  base.setDate(base.getDate() + Math.floor(startDay));
  const frac = startDay - Math.floor(startDay);
  base.setMinutes(base.getMinutes() + frac * 1440 + startMin);
  return base;
}

function splitDateTime(date) {
  const pad = (n) => `${n}`.padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return { dateStr: `${yyyy}-${mm}-${dd}`, timeStr: `${hh}:${mi}` };
}

function parseYyyyMmDdToAbsDay(value) {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return Number.NaN;
  const dt = new Date(`${text}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return Number.NaN;
  dt.setHours(0, 0, 0, 0);
  return Math.floor(dt.getTime() / DAY_MS);
}

function absDayToYyyyMmDd(absDay) {
  const numeric = Number(absDay);
  if (!Number.isFinite(numeric)) return "";
  return splitDateTime(new Date(numeric * DAY_MS)).dateStr;
}

function cloneJson(value, fallback = []) {
  try {
    return JSON.parse(JSON.stringify(value ?? fallback));
  } catch {
    return JSON.parse(JSON.stringify(fallback));
  }
}

function normalizePlateGroupColor(color) {
  const raw = String(color || "").trim();
  if (/^#([0-9a-f]{6})$/i.test(raw)) return raw.toLowerCase();
  if (/^#([0-9a-f]{3})$/i.test(raw)) {
    const [, short] = raw.match(/^#([0-9a-f]{3})$/i) || [];
    if (!short) return "";
    return `#${short[0]}${short[0]}${short[1]}${short[1]}${short[2]}${short[2]}`.toLowerCase();
  }
  return "";
}

function hexToRgba(hex, alpha = 1) {
  const normalized = normalizePlateGroupColor(hex);
  if (!normalized) return `rgba(94, 234, 212, ${alpha})`;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  const a = Math.max(0, Math.min(1, Number(alpha) || 0));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function plateGroupColorByIndex(index = 0) {
  const safe = Math.max(0, Number(index) || 0);
  return PLATE_GROUP_COLORS[safe % PLATE_GROUP_COLORS.length];
}

function pickNextPlateGroupColor(groups = []) {
  const used = new Set(
    (groups || [])
      .map((group) => normalizePlateGroupColor(group?.color))
      .filter(Boolean)
  );
  for (let i = 0; i < PLATE_GROUP_COLORS.length; i++) {
    const color = plateGroupColorByIndex(i);
    if (!used.has(color)) return color;
  }
  return plateGroupColorByIndex((groups || []).length);
}

function ensurePlateGroupColors(data) {
  if (!data || !Array.isArray(data.groups)) return false;
  let changed = false;
  const used = new Set();
  data.groups = data.groups.map((raw, idx) => {
    const group = raw && typeof raw === "object" ? { ...raw } : {};
    const normalized = normalizePlateGroupColor(group.color);
    let color = normalized;
    if (!color || used.has(color)) {
      color = plateGroupColorByIndex(idx);
      let guard = 0;
      while (used.has(color) && guard < PLATE_GROUP_COLORS.length * 2) {
        color = plateGroupColorByIndex(idx + guard + 1);
        guard++;
      }
      if (!color) color = plateGroupColorByIndex(idx);
    }
    if (group.color !== color) {
      group.color = color;
      changed = true;
    }
    used.add(color);
    return group;
  });
  return changed;
}

function normalizePlateGroupName(name) {
  const normalized = String(name || "").replace(/\s+/g, " ").trim();
  return normalized.slice(0, 48);
}

function defaultPlateGroupName(index = 0) {
  const safe = Math.max(0, Number(index) || 0);
  return `Group ${safe + 1}`;
}

function getPlateGroupDisplayName(group, index = 0) {
  const custom = normalizePlateGroupName(group?.name);
  return custom || defaultPlateGroupName(index);
}

function normalizePlateGroupEntry(entry, fallbackIso) {
  const src = entry && typeof entry === "object" ? entry : {};
  const parsed = src.startIso ? new Date(src.startIso) : new Date(fallbackIso);
  const safeDate = Number.isNaN(parsed.getTime()) ? new Date(fallbackIso) : parsed;
  return {
    id: String(src.id || ""),
    name: normalizePlateGroupName(src.name),
    wells: normalizeWellSelection(src.wells || []),
    color: normalizePlateGroupColor(src.color),
    startIso: safeDate.toISOString(),
    mediaPlan: cloneJson(src.mediaPlan, []),
    additives: cloneJson(src.additives, []),
    removals: cloneJson(src.removals, []),
    recurringTasks: sanitizeRecurringTasks(src.recurringTasks),
    taskStatus: src.taskStatus && typeof src.taskStatus === "object" ? { ...src.taskStatus } : {},
    taskCompletedAt: src.taskCompletedAt && typeof src.taskCompletedAt === "object" ? { ...src.taskCompletedAt } : {},
    taskMeta: src.taskMeta && typeof src.taskMeta === "object" ? cloneJson(src.taskMeta, {}) : {}
  };
}

function createPlateGroupId() {
  return `g-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function hasPlateGroupExperiment(group) {
  if (!group) return false;
  return (group.mediaPlan?.length || 0) > 0 || (group.additives?.length || 0) > 0 || (group.removals?.length || 0) > 0;
}

function migrateLegacyPlateWells(node, wellIds, fallbackIso) {
  let legacy = null;
  try {
    legacy = node.dataset.plateWells ? JSON.parse(node.dataset.plateWells) : null;
  } catch {
    legacy = null;
  }
  if (!legacy || typeof legacy !== "object" || !legacy.wells || typeof legacy.wells !== "object") {
    return null;
  }
  const groups = [];
  const entries = Object.entries(legacy.wells);
  entries.forEach(([wellId, raw]) => {
    if (!wellIds.includes(wellId)) return;
    const normalized = normalizePlateGroupEntry({
      id: createPlateGroupId(),
      name: defaultPlateGroupName(groups.length),
      wells: [wellId],
      color: plateGroupColorByIndex(groups.length),
      startIso: raw?.startIso || fallbackIso,
      mediaPlan: raw?.mediaPlan || [],
      additives: raw?.additives || [],
      removals: raw?.removals || [],
      recurringTasks: raw?.recurringTasks || [],
      taskStatus: raw?.taskStatus || {},
      taskCompletedAt: raw?.taskCompletedAt || {},
      taskMeta: raw?.taskMeta || {}
    }, fallbackIso);
    if (hasPlateGroupExperiment(normalized) || legacy.selectedWell === wellId) {
      groups.push(normalized);
    }
  });
  return {
    selectedGroupId: groups[0]?.id || "",
    groups
  };
}

function readPlateGroups(node, createSelectedGroup = false, selectedWells = null) {
  if (!node || !isMultiWellPlateNode(node)) return null;
  const wellCount = getPlateWellCount(node.dataset.iconId);
  const wellIds = getPlateWellIds(wellCount || 0);
  if (!wellIds.length) return null;
  const fallbackIso = getNodeDateTime(node).toISOString();

  let parsed = null;
  let dirty = false;
  try {
    parsed = node.dataset.plateGroups ? JSON.parse(node.dataset.plateGroups) : null;
  } catch {
    parsed = null;
  }
  if (!parsed || typeof parsed !== "object") {
    const migrated = migrateLegacyPlateWells(node, wellIds, fallbackIso);
    parsed = migrated || { selectedGroupId: "", groups: [] };
    dirty = true;
  }
  if (!Array.isArray(parsed.groups)) {
    parsed.groups = [];
    dirty = true;
  }
  parsed.groups = parsed.groups
    .map((group) => normalizePlateGroupEntry(group, fallbackIso))
    .filter((group) => group.wells.length > 0 && group.wells.every((w) => wellIds.includes(w)));
  if (ensurePlateGroupColors(parsed)) dirty = true;
  if (!parsed.selectedGroupId || !parsed.groups.some((g) => g.id === parsed.selectedGroupId)) {
    parsed.selectedGroupId = parsed.groups[0]?.id || "";
    dirty = true;
  }
  if (createSelectedGroup && !parsed.selectedGroupId) {
    const baseWells = normalizeWellSelection(
      (selectedWells && selectedWells.length) ? selectedWells : [wellIds[0]]
    );
    const group = normalizePlateGroupEntry({
      id: createPlateGroupId(),
      name: defaultPlateGroupName(parsed.groups.length),
      wells: baseWells,
      color: pickNextPlateGroupColor(parsed.groups),
      startIso: fallbackIso
    }, fallbackIso);
    parsed.groups.push(group);
    parsed.selectedGroupId = group.id;
    dirty = true;
  }
  if (dirty) writePlateGroups(node, parsed);
  return parsed;
}

function writePlateGroups(node, data) {
  if (!node || !isMultiWellPlateNode(node) || !data) return;
  node.dataset.plateGroups = JSON.stringify(data);
}

function findPlateGroupByWells(data, wells) {
  if (!data || !Array.isArray(data.groups)) return null;
  const key = wellSelectionKey(wells);
  return data.groups.find((group) => wellSelectionKey(group.wells) === key) || null;
}

function ensurePlateGroup(node, wells, parsed = null) {
  if (!isMultiWellPlateNode(node)) return null;
  const data = parsed || readPlateGroups(node, false);
  if (!data) return null;
  ensurePlateGroupColors(data);
  const allWells = getPlateWellIds(getPlateWellCount(node.dataset.iconId) || 0);
  const normalized = normalizeWellSelection(wells).filter((w) => allWells.includes(w));
  if (!normalized.length) return null;
  const existing = findPlateGroupByWells(data, normalized);
  if (existing) {
    data.selectedGroupId = existing.id;
    writePlateGroups(node, data);
    return existing;
  }
  const created = normalizePlateGroupEntry({
    id: createPlateGroupId(),
    name: defaultPlateGroupName(data.groups.length),
    wells: normalized,
    color: pickNextPlateGroupColor(data.groups),
    startIso: getNodeDateTime(node).toISOString()
  }, getNodeDateTime(node).toISOString());
  data.groups.push(created);
  data.selectedGroupId = created.id;
  writePlateGroups(node, data);
  return created;
}

function getSelectedPlateGroup(node, parsed = null) {
  if (!isMultiWellPlateNode(node)) return null;
  const data = parsed || readPlateGroups(node, false);
  if (!data) return null;
  return data.groups.find((group) => group.id === data.selectedGroupId) || null;
}

function resolvePlateGroupSelection(node, requestedGroupId = "", parsed = null) {
  if (!isMultiWellPlateNode(node)) return "";
  const data = parsed || readPlateGroups(node, false);
  if (!data || !Array.isArray(data.groups) || !data.groups.length) return "";
  const requested = String(requestedGroupId || "").trim();
  const requestedMatch = requested ? data.groups.find((group) => group.id === requested) : null;
  const selectedMatch = data.groups.find((group) => group.id === data.selectedGroupId) || null;
  const resolved = requestedMatch?.id || selectedMatch?.id || data.groups[0].id || "";
  if (!resolved) return "";
  if (data.selectedGroupId !== resolved) {
    data.selectedGroupId = resolved;
    writePlateGroups(node, data);
  }
  return resolved;
}

function getPlateGroupExperiments(node, data = null) {
  if (!isMultiWellPlateNode(node)) return [];
  const parsed = data || readPlateGroups(node, false);
  if (!parsed) return [];
  const fallbackIso = getNodeDateTime(node).toISOString();
  const experiments = [];
  parsed.groups.forEach((raw) => {
    const group = normalizePlateGroupEntry(raw, fallbackIso);
    const start = new Date(group.startIso);
    if (Number.isNaN(start.getTime())) return;
    const hasPlan = hasPlateGroupExperiment(group);
    const totalHours = hasPlan
      ? computePlanTotalHours(
        group.mediaPlan,
        group.additives,
        group.removals,
        group.recurringTasks || [],
        { minHours: 0 }
      )
      : 0;
    const startAbs = start.getTime() / DAY_MS;
    const endAbs = startAbs + (hasPlan ? totalHours / 24 : 0);
    experiments.push({ group, startAbs, endAbs, totalHours, hasPlan });
  });
  experiments.sort((a, b) => {
    if (a.startAbs !== b.startAbs) return a.startAbs - b.startAbs;
    return wellSelectionKey(a.group.wells).localeCompare(wellSelectionKey(b.group.wells));
  });
  return experiments;
}

function getPlateGroupOverdueSet(node, data = null) {
  if (!isMultiWellPlateNode(node)) return new Set();
  const parsed = data || readPlateGroups(node, false);
  if (!parsed?.groups?.length) return new Set();
  const nowMs = Date.now();
  const overdueIds = new Set();
  parsed.groups.forEach((raw) => {
    const group = normalizePlateGroupEntry(raw, getNodeDateTime(node).toISOString());
    const start = new Date(group.startIso);
    if (Number.isNaN(start.getTime())) return;
    const tasks = buildTasks(
      group.mediaPlan || [],
      group.additives || [],
      group.removals || [],
      group.recurringTasks || []
    );
    const statusMap = group.taskStatus && typeof group.taskStatus === "object" ? group.taskStatus : {};
    const hasOverdue = tasks.some((task) => {
      if (statusMap[task.key]) return false;
      if (typeof task.hour !== "number") return false;
      return nowMs > (start.getTime() + task.hour * 3600000);
    });
    if (hasOverdue) overdueIds.add(group.id);
  });
  return overdueIds;
}

function renderPlateNodeOverlay(node, data = null, experiments = null) {
  if (!node) return;
  if (!isMultiWellPlateNode(node)) {
    node.classList.remove("drop--plate");
    node.querySelector(".plate-well-overlay")?.remove();
    return;
  }
  node.classList.add("drop--plate");
  const parsed = data || readPlateGroups(node, false);
  const active = experiments || getPlateGroupExperiments(node, parsed);
  const totalWells = getPlateWellCount(node.dataset.iconId) || 0;
  const activeWellCount = new Set(active.flatMap((exp) => exp.group.wells)).size;
  const selectedGroupId = String(parsed?.selectedGroupId || "").trim();
  const focusGroupId = String(node.dataset.plateTaskFocusGroupId || "").trim();
  const tasksCollapsed = node.dataset.plateTaskCollapsed === "1";
  const overdueGroupIds = getPlateGroupOverdueSet(node, parsed);
  const baseAbs = parseFloat(node.dataset.absDay ?? "NaN");
  const anchorAbs = Number.isFinite(baseAbs) ? baseAbs : getBaseDay();
  const rawSpan = parseFloat(node.dataset.spanDays ?? "1");
  const spanDays = Number.isFinite(rawSpan) && rawSpan > 0 ? rawSpan : 1;

  let overlay = node.querySelector(".plate-well-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "plate-well-overlay";
    node.appendChild(overlay);
  }

  const visibleRows = active
    .map((exp, idx) => {
      const relStart = (exp.startAbs - anchorAbs) / spanDays;
      const leftPct = clamp(relStart * 100, 0, 100);
      const relDuration = exp.hasPlan ? (exp.totalHours / 24) / spanDays : 0;
      const widthPct = clamp(relDuration * 100, 0, 100);
      const boundedWidth = leftPct + widthPct > 100 ? Math.max(0, 100 - leftPct) : widthPct;
      const label = normalizePlateGroupName(exp.group.name) || formatWellSelection(exp.group.wells, 3);
      const color = normalizePlateGroupColor(exp.group.color) || plateGroupColorByIndex(idx);
      const groupId = escapeSvgText(exp.group.id || "");
      const isSelected = selectedGroupId && selectedGroupId === exp.group.id;
      const isTaskFocus = focusGroupId && focusGroupId === exp.group.id;
      const isOverdue = overdueGroupIds.has(exp.group.id);
      const rowClass = [
        "plate-well-row",
        exp.hasPlan ? "" : "is-marker-only",
        isSelected ? "is-selected" : "",
        isTaskFocus ? "is-task-focus" : "",
        isOverdue ? "is-overdue" : "",
        (isTaskFocus && tasksCollapsed) ? "is-collapsed-focus" : ""
      ].filter(Boolean).join(" ");
      const bar = exp.hasPlan
        ? `<span class="plate-well-row__bar" style="left:${leftPct.toFixed(2)}%;width:${boundedWidth.toFixed(2)}%;background:${color};"></span>`
        : "";
      return `
        <div class="${rowClass}" data-group-id="${groupId}">
          <span class="plate-well-row__id" style="color:${color};">${escapeSvgText(label)}</span>
          <span class="plate-well-row__bar-wrap">
            <span class="plate-well-row__start-anchor" data-group-id="${groupId}" style="left:${leftPct.toFixed(2)}%;--plate-group-color:${color};"></span>
            ${bar}
          </span>
        </div>
      `;
    })
    .join("");
  overlay.innerHTML = `
    <div class="plate-well-title">${active.length} groups • ${activeWellCount}/${totalWells} wells</div>
    <div class="plate-well-rows">${visibleRows || '<div class="plate-well-empty">No scheduled wells</div>'}</div>
  `;
  overlay.querySelectorAll(".plate-well-row[data-group-id]").forEach((row) => {
    row.addEventListener("click", (event) => {
      const groupId = String(row.dataset.groupId || "").trim();
      if (!groupId) return;
      const nodeId = String(node.dataset.nodeId || "");
      const pending = plateRowClickTimers.get(nodeId);
      if (pending) {
        clearTimeout(pending);
        plateRowClickTimers.delete(nodeId);
      }
      const timer = window.setTimeout(() => {
        plateRowClickTimers.delete(nodeId);
        focusPlateGroupTimeline(node, groupId, parsed, { toggleExisting: true });
      }, 220);
      plateRowClickTimers.set(nodeId, timer);
    });
    row.addEventListener("dblclick", () => {
      const nodeId = String(node.dataset.nodeId || "");
      const pending = plateRowClickTimers.get(nodeId);
      if (pending) {
        clearTimeout(pending);
        plateRowClickTimers.delete(nodeId);
      }
    });
  });
}

function getPlateTimelineAxisMetrics(node) {
  if (!node) return null;
  const row = node.querySelector(".plate-well-row");
  const barWrap = row?.querySelector(".plate-well-row__bar-wrap");
  if (!barWrap) return null;
  const nodeRect = node.getBoundingClientRect();
  const barWrapRect = barWrap.getBoundingClientRect();
  if (!(nodeRect.width > 0) || !(barWrapRect.width > 0)) return null;
  return {
    axisWidth: barWrapRect.width,
    axisLeftOffset: barWrapRect.left - nodeRect.left
  };
}

function syncPlateNodeFromGroups(node, data = null) {
  if (!isMultiWellPlateNode(node)) return;
  const parsed = data || readPlateGroups(node, false);
  const experiments = getPlateGroupExperiments(node, parsed);
  const desiredHeight = plateNodeHeightForGroupCount(experiments.length);
  node.style.height = `${desiredHeight}px`;
  if (!experiments.length) {
    syncPlateTaskProxyFromSelectedGroup(node, parsed);
    renderPlateNodeOverlay(node, parsed, experiments);
    return;
  }

  const earliest = Math.min(...experiments.map((exp) => exp.startAbs));
  const latest = Math.max(...experiments.map((exp) => exp.endAbs));
  const spanDays = Math.max(1, Math.ceil(latest - earliest));
  const minTop = TIMELINE_HEIGHT + 12;
  const maxTop = getCanvasMaxTopForHeight(desiredHeight);
  const rawTop = parseFloat(node.style.top);
  const snapped = snapY(Number.isFinite(rawTop) ? rawTop : minTop, node, desiredHeight);
  const top = clamp(Number.isFinite(snapped.y) ? snapped.y : minTop, minTop, maxTop);

  let baseDay = getBaseDay();
  let startDay = earliest - baseDay;
  const leftOverflowDays = -startDay;
  if (leftOverflowDays >= 1) {
    const shift = -Math.floor(leftOverflowDays);
    if (shift !== 0) shiftTimeline(shift);
    baseDay = getBaseDay();
    startDay = earliest - baseDay;
  }
  const maxStart = Math.max(0, dayCount - spanDays);
  const rightOverflowDays = startDay - maxStart;
  if (rightOverflowDays >= 1) {
    const shift = Math.floor(rightOverflowDays);
    if (shift !== 0) shiftTimeline(shift);
    baseDay = getBaseDay();
    startDay = earliest - baseDay;
  }
  startDay = clamp(startDay, 0, Math.max(0, dayCount - spanDays));

  // Plate group rows should map one day of media duration to one full canvas day width.
  // Unlike vessel nodes, do not apply DAY_PADDING trimming on the plate timeline axis.
  const desiredAxisLeft = dayToLeft(startDay) - DAY_PADDING;
  const desiredAxisWidth = Math.max(8, spanDays * dayWidth);
  let left = desiredAxisLeft - PLATE_TIMELINE_AXIS_LEFT_OFFSET;
  let width = desiredAxisWidth + PLATE_TIMELINE_AXIS_OVERHEAD;
  const minLeft = 8 - PLATE_TIMELINE_AXIS_LEFT_OFFSET;
  const maxLeft = Math.max(
    minLeft,
    canvas.clientWidth - width - 8 + PLATE_TIMELINE_AXIS_RIGHT_OFFSET
  );
  let boundedLeft = clamp(left, minLeft, maxLeft);
  const minuteOffset = Math.round((earliest - Math.floor(earliest)) * 1440);

  node.dataset.absDay = earliest;
  node.dataset.startDay = startDay;
  node.dataset.dayIndex = Math.floor(startDay);
  node.dataset.startMinuteOffset = minuteOffset;
  node.dataset.spanDays = spanDays;
  node.style.left = `${boundedLeft}px`;
  node.style.width = `${width}px`;
  node.style.top = `${top}px`;

  syncPlateTaskProxyFromSelectedGroup(node, parsed);
  renderPlateNodeOverlay(node, parsed, experiments);

  // Plate rows reserve fixed label space; compensate node bounds so the timeline axis itself
  // matches the canvas day scale and starts at the expected day coordinate.
  const axisMetrics = getPlateTimelineAxisMetrics(node);
  if (axisMetrics) {
    const widthDelta = desiredAxisWidth - axisMetrics.axisWidth;
    const adjustedWidth = Math.max(MIN_NODE_WIDTH, width + widthDelta);
    const adjustedMaxLeft = Math.max(
      minLeft,
      canvas.clientWidth - adjustedWidth - 8 + PLATE_TIMELINE_AXIS_RIGHT_OFFSET
    );
    const currentAxisLeft = boundedLeft + axisMetrics.axisLeftOffset;
    const leftDelta = desiredAxisLeft - currentAxisLeft;
    const adjustedLeft = clamp(boundedLeft + leftDelta, minLeft, adjustedMaxLeft);

    if (Math.abs(adjustedWidth - width) > 0.5 || Math.abs(adjustedLeft - boundedLeft) > 0.5) {
      width = adjustedWidth;
      boundedLeft = adjustedLeft;
      node.style.left = `${boundedLeft}px`;
      node.style.width = `${width}px`;
      renderPlateNodeOverlay(node, parsed, experiments);
    }
  }
}

function refreshPlateNodeFromGroups(node, data = null) {
  if (!isMultiWellPlateNode(node)) return null;
  const parsed = data || readPlateGroups(node, false);
  if (!parsed) return null;
  syncPlateNodeFromGroups(node, parsed);
  renderPlateNodeOverlay(node, parsed);
  renderNodeTasks(node);
  updateAllConnections();
  updateTaskAlerts();
  return parsed;
}

function shiftPlateGroupStarts(node, deltaDays) {
  if (!isMultiWellPlateNode(node) || !Number.isFinite(deltaDays) || Math.abs(deltaDays) < 1e-9) return;
  const parsed = readPlateGroups(node, false);
  if (!parsed?.groups?.length) return;
  parsed.groups = parsed.groups.map((raw) => {
    const group = normalizePlateGroupEntry(raw, getNodeDateTime(node).toISOString());
    const start = new Date(group.startIso);
    if (Number.isNaN(start.getTime())) return group;
    const shifted = new Date(start.getTime() + deltaDays * DAY_MS);
    group.startIso = shifted.toISOString();
    return group;
  });
  writePlateGroups(node, parsed);
}

function setMediaWorkingFromPlateGroup(node, groupId, parsed = null) {
  if (!isMultiWellPlateNode(node)) return;
  const data = parsed || readPlateGroups(node, false);
  if (!data) return;
  const fallbackIso = getNodeDateTime(node).toISOString();
  const fallbackGroup = data.groups[0] || null;
  const activeGroup = data.groups.find((group) => group.id === groupId) || fallbackGroup;
  if (!activeGroup) {
    mediaPlateGroupId = "";
    mediaPlanWorking = [];
    additivesWorking = [];
    removalsWorking = [];
    mediaRecurringWorking = [];
    modalTaskStatus = {};
    modalTaskCompletion = {};
    modalTaskMeta = {};
    if (mediaForm?.plateGroupWells) mediaForm.plateGroupWells.textContent = "-";
    return;
  }
  const group = normalizePlateGroupEntry(activeGroup, fallbackIso);
  data.selectedGroupId = group.id;
  mediaPlateGroupId = group.id;
  mediaPlanWorking = cloneJson(group.mediaPlan, []);
  additivesWorking = cloneJson(group.additives, []);
  removalsWorking = cloneJson(group.removals, []);
  mediaRecurringWorking = sanitizeRecurringTasks(group.recurringTasks);
  modalTaskStatus = group.taskStatus && typeof group.taskStatus === "object" ? { ...group.taskStatus } : {};
  modalTaskCompletion = group.taskCompletedAt && typeof group.taskCompletedAt === "object" ? { ...group.taskCompletedAt } : {};
  modalTaskMeta = group.taskMeta && typeof group.taskMeta === "object" ? cloneJson(group.taskMeta, {}) : {};

  if (mediaForm?.plateGroupWells) {
    mediaForm.plateGroupWells.textContent = formatWellSelection(group.wells, 8);
  }
  if (mediaForm?.plateGroupDate && mediaForm?.plateGroupTime) {
    const { dateStr, timeStr } = splitDateTime(new Date(group.startIso));
    mediaForm.plateGroupDate.value = dateStr;
    mediaForm.plateGroupTime.value = timeStr;
  }
  writePlateGroups(node, data);
}

function getPlateGroupStartIsoFromMediaForm(fallbackIso) {
  const fallback = fallbackIso || new Date().toISOString();
  const dateVal = (mediaForm?.plateGroupDate?.value || "").trim();
  const timeVal = (mediaForm?.plateGroupTime?.value || "").trim() || "00:00";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) return fallback;
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(timeVal)) return fallback;
  const dt = new Date(`${dateVal}T${timeVal}`);
  if (Number.isNaN(dt.getTime())) return fallback;
  return dt.toISOString();
}

function setMediaPlateGroupControlsVisible(visible) {
  if (!mediaForm?.plateGroupControls) return;
  const show = !!visible;
  mediaForm.plateGroupControls.classList.toggle("is-hidden", !show);
  mediaForm.plateGroupControls.style.display = show ? "flex" : "none";
}

function saveMediaWorkingToPlateGroup(node, groupId) {
  if (!isMultiWellPlateNode(node)) return false;
  const data = readPlateGroups(node, false);
  if (!data) return false;
  const targetId = groupId || data.selectedGroupId;
  const idx = data.groups.findIndex((group) => group.id === targetId);
  if (idx === -1) return false;
  const tasks = buildTasks(mediaPlanWorking, additivesWorking, removalsWorking, mediaRecurringWorking);
  modalTaskMeta = normalizeTaskMetaMap(modalTaskMeta, tasks);
  modalTaskStatus = normalizeTaskStatusMap(modalTaskStatus, tasks);
  modalTaskCompletion = normalizeTaskCompletionMap(modalTaskCompletion, tasks);
  const current = normalizePlateGroupEntry(data.groups[idx], getNodeDateTime(node).toISOString());
  data.groups[idx] = {
    ...current,
    startIso: getPlateGroupStartIsoFromMediaForm(current.startIso),
    mediaPlan: cloneJson(mediaPlanWorking, []),
    additives: cloneJson(additivesWorking, []),
    removals: cloneJson(removalsWorking, []),
    recurringTasks: sanitizeRecurringTasks(mediaRecurringWorking),
    taskStatus: { ...modalTaskStatus },
    taskCompletedAt: { ...modalTaskCompletion },
    taskMeta: cloneJson(modalTaskMeta, {})
  };
  data.selectedGroupId = targetId;
  writePlateGroups(node, data);
  mediaPlateGroupId = targetId;
  return true;
}

function parseDatasetArray(raw) {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseDatasetObject(raw) {
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function focusPlateGroupTimeline(node, groupId, data = null, options = {}) {
  if (!isMultiWellPlateNode(node)) return;
  const targetGroupId = String(groupId || "").trim();
  if (!targetGroupId) return;
  const parsed = data || readPlateGroups(node, false);
  if (!parsed?.groups?.length) return;
  const target = parsed.groups.find((group) => group.id === targetGroupId);
  if (!target) return;
  const toggleExisting = !!options?.toggleExisting;
  const focusedGroupId = String(node.dataset.plateTaskFocusGroupId || "").trim();
  const sameGroup = focusedGroupId && focusedGroupId === target.id;
  if (toggleExisting && sameGroup) {
    if (node.dataset.plateTaskCollapsed === "1") {
      delete node.dataset.plateTaskCollapsed;
    } else {
      node.dataset.plateTaskCollapsed = "1";
    }
  } else {
    delete node.dataset.plateTaskCollapsed;
  }
  parsed.selectedGroupId = target.id;
  writePlateGroups(node, parsed);
  node.dataset.plateTaskFocusGroupId = target.id;
  syncPlateTaskProxyFromSelectedGroup(node, parsed);
  renderPlateNodeOverlay(node, parsed);
  renderNodeTasks(node);
  updateLogPanel();
}

function syncPlateTaskProxyFromSelectedGroup(node, data = null) {
  if (!isMultiWellPlateNode(node)) return null;
  const parsed = data || readPlateGroups(node, false);
  if (!parsed) return null;
  const knownIds = new Set((parsed.groups || []).map((group) => String(group.id || "")));
  const focusGroupId = String(node.dataset.plateTaskFocusGroupId || "").trim();
  if (focusGroupId && !knownIds.has(focusGroupId)) {
    delete node.dataset.plateTaskFocusGroupId;
  }
  const active = parsed.groups.find((group) => group.id === parsed.selectedGroupId) || parsed.groups[0] || null;
  if (!active) {
    node.dataset.mediaPlan = "[]";
    node.dataset.additivesPlan = "[]";
    node.dataset.removalsPlan = "[]";
    node.dataset.taskRecurringTasks = "[]";
    node.dataset.taskStatus = "{}";
    node.dataset.taskCompletedAt = "{}";
    node.dataset.taskMeta = "{}";
    node.dataset.plateSelectedGroupId = "";
    delete node.dataset.taskBaseAbsDay;
    delete node.dataset.plateTaskFocusGroupId;
    delete node.dataset.plateTaskCollapsed;
    return null;
  }
  const normalized = normalizePlateGroupEntry(active, getNodeDateTime(node).toISOString());
  node.dataset.mediaPlan = JSON.stringify(cloneJson(normalized.mediaPlan, []));
  node.dataset.additivesPlan = JSON.stringify(cloneJson(normalized.additives, []));
  node.dataset.removalsPlan = JSON.stringify(cloneJson(normalized.removals, []));
  node.dataset.taskRecurringTasks = JSON.stringify(sanitizeRecurringTasks(normalized.recurringTasks));
  node.dataset.taskStatus = JSON.stringify(
    normalized.taskStatus && typeof normalized.taskStatus === "object" ? { ...normalized.taskStatus } : {}
  );
  node.dataset.taskCompletedAt = JSON.stringify(
    normalized.taskCompletedAt && typeof normalized.taskCompletedAt === "object" ? { ...normalized.taskCompletedAt } : {}
  );
  node.dataset.taskMeta = JSON.stringify(
    normalized.taskMeta && typeof normalized.taskMeta === "object" ? cloneJson(normalized.taskMeta, {}) : {}
  );
  node.dataset.plateSelectedGroupId = normalized.id;
  const start = new Date(normalized.startIso);
  if (Number.isNaN(start.getTime())) {
    delete node.dataset.taskBaseAbsDay;
  } else {
    node.dataset.taskBaseAbsDay = `${start.getTime() / DAY_MS}`;
  }
  return normalized;
}

function persistPlateTaskProxyToSelectedGroup(node, data = null) {
  if (!isMultiWellPlateNode(node)) return false;
  const parsed = data || readPlateGroups(node, false);
  if (!parsed?.groups?.length) return false;
  const requestedId = String(parsed.selectedGroupId || node.dataset.plateSelectedGroupId || "").trim();
  let idx = parsed.groups.findIndex((group) => group.id === requestedId);
  if (idx === -1) idx = 0;
  if (idx === -1) return false;

  const current = normalizePlateGroupEntry(parsed.groups[idx], getNodeDateTime(node).toISOString());
  const tasks = buildTasks(
    parseDatasetArray(node.dataset.mediaPlan),
    parseDatasetArray(node.dataset.additivesPlan),
    parseDatasetArray(node.dataset.removalsPlan),
    sanitizeRecurringTasks(parseDatasetArray(node.dataset.taskRecurringTasks))
  );
  const sanitizedTaskMeta = normalizeTaskMetaMap(parseDatasetObject(node.dataset.taskMeta), tasks);
  parsed.groups[idx] = {
    ...current,
    mediaPlan: parseDatasetArray(node.dataset.mediaPlan),
    additives: parseDatasetArray(node.dataset.additivesPlan),
    removals: parseDatasetArray(node.dataset.removalsPlan),
    recurringTasks: sanitizeRecurringTasks(parseDatasetArray(node.dataset.taskRecurringTasks)),
    taskStatus: parseDatasetObject(node.dataset.taskStatus),
    taskCompletedAt: parseDatasetObject(node.dataset.taskCompletedAt),
    taskMeta: sanitizedTaskMeta
  };
  parsed.selectedGroupId = parsed.groups[idx].id;
  writePlateGroups(node, parsed);
  syncPlateTaskProxyFromSelectedGroup(node, parsed);
  return true;
}

function updatePlateGroupControls(node) {
  if (!mediaForm?.plateGroupControls) return;
  if (!isMultiWellPlateNode(node)) {
    setMediaPlateGroupControlsVisible(false);
    mediaPlateGroupId = "";
    return;
  }
  setMediaPlateGroupControlsVisible(true);
  const data = readPlateGroups(node, false);
  if (!data) return;
  try {
    refreshPlateNodeFromGroups(node, data);
  } catch (err) {
    console.warn("Failed to refresh plate node before editing group", err);
  }
  setMediaWorkingFromPlateGroup(node, data.selectedGroupId, data);
}

function setPlateSelectorWellState(wellId, shouldSelect) {
  const id = String(wellId || "");
  if (!id) return false;
  const has = plateSelectorSelection.has(id);
  if (shouldSelect === has) return false;
  if (shouldSelect) {
    plateSelectorSelection.add(id);
  } else {
    plateSelectorSelection.delete(id);
  }
  const btn = plateSelectorButtonsByWell.get(id);
  if (btn) {
    btn.classList.toggle("is-selected", shouldSelect);
    btn.setAttribute("aria-pressed", shouldSelect ? "true" : "false");
  }
  return true;
}

function applyPlateSelectorSelection(nextSelection) {
  let changed = false;
  plateSelectorButtonsByWell.forEach((_, wellId) => {
    const shouldSelect = nextSelection.has(wellId);
    if (setPlateSelectorWellState(wellId, shouldSelect)) changed = true;
  });
  return changed;
}

function hidePlateSelectorMarquee() {
  if (!plateSelectorMarquee) return;
  plateSelectorMarquee.style.display = "none";
  plateSelectorMarquee.style.width = "0px";
  plateSelectorMarquee.style.height = "0px";
}

function finishPlateSelectorDrag(event = null) {
  if (!plateSelectorDragActive) return;
  if (
    plateSelectorDragPointerId !== null
    && event
    && typeof event.pointerId === "number"
    && event.pointerId !== plateSelectorDragPointerId
  ) {
    return;
  }
  const moved = plateSelectorDragMoved;
  const clickedWell = plateSelectorDragStartWellId;
  if (!moved && clickedWell) {
    const toggled = setPlateSelectorWellState(clickedWell, !plateSelectorSelection.has(clickedWell));
    if (toggled) updatePlateSelectorInfo();
  }
  plateSelectorDragActive = false;
  plateSelectorDragMode = "";
  plateSelectorDragPointerId = null;
  plateSelectorDragStart = null;
  plateSelectorDragMoved = false;
  plateSelectorDragStartWellId = "";
  plateSelectorDragBaseSelection = new Set();
  plateSelectorGrid?.classList.remove("is-dragging");
  hidePlateSelectorMarquee();
  window.removeEventListener("pointermove", handlePlateSelectorPointerMove, true);
  window.removeEventListener("pointerup", finishPlateSelectorDrag, true);
  window.removeEventListener("pointercancel", finishPlateSelectorDrag, true);
}

function handlePlateSelectorPointerDown(event) {
  if (!plateSelectorGrid) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;
  finishPlateSelectorDrag();
  const target = event.target instanceof Element ? event.target.closest(".plate-select-cell") : null;
  if (target && !plateSelectorGrid.contains(target)) return;
  const gridRect = plateSelectorGrid.getBoundingClientRect();
  if (gridRect.width <= 0 || gridRect.height <= 0) return;
  const wellId = target?.dataset.wellId || "";
  const changeMode = plateSelectorMode === "change-wells";
  const editableGroup = changeMode ? getPlateSelectorEditableGroup(plateSelectorData) : null;
  const editableGroupId = editableGroup?.id || "";
  event.preventDefault();

  if (wellId) {
    const groupId = target?.dataset.groupId || "";
    if (groupId && plateSelectorData?.groups?.length) {
      if (changeMode && groupId === editableGroupId) {
        // Editable group wells should toggle like normal cells.
      } else if (changeMode && groupId !== editableGroupId) {
        // In change-wells mode, other groups are locked.
        return;
      } else {
        const group = plateSelectorData.groups.find((item) => item.id === groupId);
        if (group) {
          selectPlateSelectorGroupWells(group, { setSelectedGroup: true });
          return;
        }
      }
    }
  }

  const matchedGroup = getPlateSelectorMatchedGroup(plateSelectorData);
  const shouldStartFreshSelection = !changeMode && !!matchedGroup && (
    !wellId || !matchedGroup.wells.includes(wellId)
  );
  if (shouldStartFreshSelection) {
    applyPlateSelectorSelection(new Set());
  }

  plateSelectorDragMode = (wellId && plateSelectorSelection.has(wellId)) ? "remove" : "add";
  plateSelectorDragActive = true;
  plateSelectorDragPointerId = event.pointerId;
  plateSelectorDragStart = {
    x: clamp(event.clientX - gridRect.left, 0, gridRect.width),
    y: clamp(event.clientY - gridRect.top, 0, gridRect.height)
  };
  plateSelectorDragMoved = false;
  plateSelectorDragStartWellId = wellId;
  plateSelectorDragBaseSelection = new Set(plateSelectorSelection);
  hidePlateSelectorMarquee();
  window.addEventListener("pointermove", handlePlateSelectorPointerMove, true);
  window.addEventListener("pointerup", finishPlateSelectorDrag, true);
  window.addEventListener("pointercancel", finishPlateSelectorDrag, true);
}

function handlePlateSelectorPointerMove(event) {
  if (!plateSelectorDragActive || !plateSelectorGrid || !plateSelectorDragStart) return;
  if (plateSelectorDragPointerId !== null && event.pointerId !== plateSelectorDragPointerId) return;
  if (event.cancelable) event.preventDefault();
  const gridRect = plateSelectorGrid.getBoundingClientRect();
  if (gridRect.width <= 0 || gridRect.height <= 0) return;
  const currentX = clamp(event.clientX - gridRect.left, 0, gridRect.width);
  const currentY = clamp(event.clientY - gridRect.top, 0, gridRect.height);
  const dx = currentX - plateSelectorDragStart.x;
  const dy = currentY - plateSelectorDragStart.y;
  if (!plateSelectorDragMoved && Math.abs(dx) + Math.abs(dy) <= 3) return;
  if (!plateSelectorDragMoved) {
    plateSelectorDragMoved = true;
    plateSelectorGrid.classList.add("is-dragging");
  }

  const left = Math.min(plateSelectorDragStart.x, currentX);
  const top = Math.min(plateSelectorDragStart.y, currentY);
  const width = Math.abs(dx);
  const height = Math.abs(dy);

  if (plateSelectorMarquee) {
    plateSelectorMarquee.style.display = "block";
    plateSelectorMarquee.style.left = `${left}px`;
    plateSelectorMarquee.style.top = `${top}px`;
    plateSelectorMarquee.style.width = `${width}px`;
    plateSelectorMarquee.style.height = `${height}px`;
  }

  const viewportLeft = gridRect.left + left;
  const viewportTop = gridRect.top + top;
  const viewportRight = viewportLeft + width;
  const viewportBottom = viewportTop + height;
  const changeMode = plateSelectorMode === "change-wells";
  const editableGroup = changeMode ? getPlateSelectorEditableGroup(plateSelectorData) : null;
  const editableGroupId = editableGroup?.id || "";
  const hits = new Set();
  plateSelectorButtonsByWell.forEach((btn, wellId) => {
    const groupId = btn?.dataset?.groupId || "";
    if (groupId) {
      if (changeMode) {
        if (groupId !== editableGroupId) return;
      } else {
        return; // grouped wells are locked from new-group selection
      }
    }
    const rect = btn.getBoundingClientRect();
    if (
      rect.right >= viewportLeft
      && rect.left <= viewportRight
      && rect.bottom >= viewportTop
      && rect.top <= viewportBottom
    ) {
      hits.add(wellId);
    }
  });

  const nextSelection = new Set(plateSelectorDragBaseSelection);
  if (plateSelectorDragMode === "remove") {
    hits.forEach((wellId) => nextSelection.delete(wellId));
  } else {
    hits.forEach((wellId) => nextSelection.add(wellId));
  }
  const changed = applyPlateSelectorSelection(nextSelection);
  if (changed) updatePlateSelectorInfo();
}

function getPlateSelectorSelectedWells() {
  return normalizeWellSelection(Array.from(plateSelectorSelection));
}

function getPlateSelectorMatchedGroup(data = plateSelectorData) {
  if (!data || !Array.isArray(data.groups) || !data.groups.length) return null;
  const selected = getPlateSelectorSelectedWells();
  if (!selected.length) return null;
  return findPlateGroupByWells(data, selected);
}

function getPlateSelectorSelectionGroup(data = plateSelectorData) {
  if (!data || !Array.isArray(data.groups) || !data.groups.length) return null;
  const selected = getPlateSelectorSelectedWells();
  if (!selected.length) return null;
  const matched = findPlateGroupByWells(data, selected);
  if (matched) return matched;
  const selectedSet = new Set(selected);
  const active = data.groups.find(
    (group) => group.id === data.selectedGroupId && group.wells.some((wellId) => selectedSet.has(wellId))
  );
  if (active) return active;
  return data.groups.find((group) => group.wells.some((wellId) => selectedSet.has(wellId))) || null;
}

function getPlateSelectorGroupLabel(data, groupId) {
  if (!data || !Array.isArray(data.groups)) return "Group";
  const idx = data.groups.findIndex((group) => group.id === groupId);
  return idx >= 0 ? getPlateGroupDisplayName(data.groups[idx], idx) : "Group";
}

function getPlateSelectorEditableGroup(data = plateSelectorData) {
  if (!data || !Array.isArray(data.groups) || !data.groups.length) return null;
  if (plateSelectorEditGroupId) {
    const explicit = data.groups.find((group) => group.id === plateSelectorEditGroupId);
    if (explicit) return explicit;
  }
  if (data.selectedGroupId) {
    const selected = data.groups.find((group) => group.id === data.selectedGroupId);
    if (selected) return selected;
  }
  return data.groups[0] || null;
}

function findOverlappingPlateSelectorGroup(data, wells, ignoreGroupId = "") {
  if (!data || !Array.isArray(data.groups) || !wells.length) return null;
  const selectedKey = wellSelectionKey(wells);
  const selectedSet = new Set(wells);
  for (const group of data.groups) {
    if (!group || group.id === ignoreGroupId) continue;
    if (wellSelectionKey(group.wells) === selectedKey) continue;
    if (group.wells.some((wellId) => selectedSet.has(wellId))) return group;
  }
  return null;
}

function selectPlateSelectorGroupWells(group, options = {}) {
  if (!group || !Array.isArray(group.wells)) return;
  const next = new Set(normalizeWellSelection(group.wells));
  applyPlateSelectorSelection(next);
  if (options.setSelectedGroup && plateSelectorData && plateSelectorNode) {
    plateSelectorData.selectedGroupId = group.id;
    writePlateGroups(plateSelectorNode, plateSelectorData);
  }
  updatePlateSelectorInfo();
}

function renderPlateSelectorGroupList(data = plateSelectorData) {
  if (!plateSelectorGroupList) return;
  plateSelectorGroupList.innerHTML = "";
  if (!data || !Array.isArray(data.groups) || !data.groups.length) {
    const empty = document.createElement("div");
    empty.className = "plate-group-list__empty";
    empty.textContent = "No groups created yet.";
    plateSelectorGroupList.appendChild(empty);
    return;
  }
  const selectionGroup = getPlateSelectorSelectionGroup(data);
  const changeMode = plateSelectorMode === "change-wells";
  const editableGroupId = changeMode ? (getPlateSelectorEditableGroup(data)?.id || "") : "";
  data.groups.forEach((group, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "plate-group-chip";
    if (selectionGroup?.id === group.id) btn.classList.add("is-active");
    const color = normalizePlateGroupColor(group.color) || plateGroupColorByIndex(idx);
    btn.style.setProperty("--plate-group-color", color);
    btn.dataset.groupId = group.id;

    const dot = document.createElement("span");
    dot.className = "plate-group-chip__dot";
    const name = document.createElement("span");
    name.className = "plate-group-chip__name";
    name.textContent = getPlateGroupDisplayName(group, idx);
    const wells = document.createElement("span");
    wells.className = "plate-group-chip__wells";
    wells.textContent = formatWellSelection(group.wells, 5);

    btn.appendChild(dot);
    btn.appendChild(name);
    btn.appendChild(wells);
    btn.addEventListener("click", () => {
      if (changeMode) return;
      finishPlateSelectorDrag();
      selectPlateSelectorGroupWells(group, { setSelectedGroup: true });
    });
    if (changeMode && group.id !== editableGroupId) {
      btn.disabled = true;
      btn.title = "Locked while editing another group";
    }
    plateSelectorGroupList.appendChild(btn);
  });
}

function setPlateSelectorMode(mode = "edit") {
  plateSelectorMode = (
    mode === "link-source"
    || mode === "link-target"
    || mode === "change-wells"
  ) ? mode : "edit";
  if (!plateSelectorTitle || !plateSelectorCopy) return;
  if (plateSelectorMode === "link-source") {
    plateSelectorTitle.textContent = "Select Source Plate Group";
    plateSelectorCopy.textContent = "Choose or create the source group, then click Proceed to continue linking.";
    return;
  }
  if (plateSelectorMode === "link-target") {
    plateSelectorTitle.textContent = "Select Target Plate Group";
    plateSelectorCopy.textContent = "Choose or create the target group, then click Proceed to finish linking.";
    return;
  }
  if (plateSelectorMode === "change-wells") {
    plateSelectorTitle.textContent = "Edit Group Wells";
    plateSelectorCopy.textContent = "Click wells to add/remove them from this group, then click Proceed to return to Media Plan.";
    return;
  }
  plateSelectorTitle.textContent = "Select Plate Wells";
  plateSelectorCopy.textContent = "Select wells and click Create group. You can create multiple groups, then choose one to Proceed or Unbind.";
}

function updatePlateSelectorInfo() {
  if (!plateSelectorInfo) return;
  const data = plateSelectorData;
  const selected = getPlateSelectorSelectedWells();
  const count = selected.length;
  const matched = getPlateSelectorMatchedGroup(data);
  const selectionGroup = getPlateSelectorSelectionGroup(data);
  const changeMode = plateSelectorMode === "change-wells";
  const editableGroup = changeMode ? getPlateSelectorEditableGroup(data) : null;
  const editableGroupId = editableGroup?.id || "";
  const overlap = !matched
    ? findOverlappingPlateSelectorGroup(data, selected, changeMode ? editableGroupId : "")
    : null;
  const linkMode = plateSelectorMode === "link-source" || plateSelectorMode === "link-target";

  if (changeMode) {
    if (!editableGroup) {
      plateSelectorInfo.textContent = "No editable group selected.";
    } else if (!count) {
      const label = getPlateSelectorGroupLabel(data, editableGroup.id);
      plateSelectorInfo.textContent = `${label}: select at least one well before proceeding.`;
    } else if (overlap) {
      const label = getPlateSelectorGroupLabel(data, overlap.id);
      plateSelectorInfo.textContent = `Selection overlaps ${label}. Choose empty wells or deselect overlapping wells.`;
    } else {
      const label = getPlateSelectorGroupLabel(data, editableGroup.id);
      const preview = selected.slice(0, 10).join(", ");
      const suffix = selected.length > 10 ? ` +${selected.length - 10}` : "";
      plateSelectorInfo.textContent = `${label}: ${count} well${count === 1 ? "" : "s"} selected (${preview}${suffix})`;
    }
  } else if (!count) {
    const groupCount = data?.groups?.length || 0;
    if (linkMode) {
      plateSelectorInfo.textContent = groupCount
        ? `${groupCount} group${groupCount === 1 ? "" : "s"} available. Click a group or select wells and Create group.`
        : "No groups yet. Select wells and click Create group, then Proceed.";
    } else {
      plateSelectorInfo.textContent = groupCount
        ? `${groupCount} group${groupCount === 1 ? "" : "s"} on this plate. Select wells or click a group below.`
        : "Select wells, then click Create group.";
    }
  } else if (matched) {
    const label = getPlateSelectorGroupLabel(data, matched.id);
    plateSelectorInfo.textContent = `${label} selected: ${formatWellSelection(matched.wells, 10)}`;
  } else if (overlap) {
    const label = getPlateSelectorGroupLabel(data, overlap.id);
    plateSelectorInfo.textContent = `Selection overlaps ${label}. Unbind it first or pick different wells.`;
  } else {
    const preview = selected.slice(0, 8).join(", ");
    const suffix = selected.length > 8 ? ` +${selected.length - 8}` : "";
    plateSelectorInfo.textContent = `${count} well${count === 1 ? "" : "s"} selected: ${preview}${suffix}`;
  }

  if (plateSelectorCreateGroup) {
    const showCreate = !changeMode && count > 0 && !matched;
    plateSelectorCreateGroup.classList.toggle("is-hidden", !showCreate);
    plateSelectorCreateGroup.disabled = !showCreate || !!overlap;
  }
  if (plateSelectorProceed) {
    const proceedGroup = changeMode ? editableGroup : (linkMode ? (selectionGroup || matched) : matched);
    const showProceed = !!proceedGroup;
    const disableProceed = changeMode
      ? (!count || !!overlap)
      : !showProceed;
    plateSelectorProceed.classList.toggle("is-hidden", !showProceed);
    plateSelectorProceed.disabled = disableProceed;
  }
  if (plateSelectorUnbindGroup) {
    const showUnbind = !changeMode && !linkMode && !!matched;
    plateSelectorUnbindGroup.classList.toggle("is-hidden", !showUnbind);
    plateSelectorUnbindGroup.disabled = !showUnbind;
  }
  if (plateSelectorRenameGroup) {
    const showRename = !changeMode && !!selectionGroup;
    plateSelectorRenameGroup.classList.toggle("is-hidden", !showRename);
    plateSelectorRenameGroup.disabled = !showRename;
  }

  if (plateSelectorGroupList) {
    const activeGroupId = changeMode ? editableGroupId : (selectionGroup?.id || "");
    plateSelectorGroupList.querySelectorAll(".plate-group-chip").forEach((chip) => {
      chip.classList.toggle("is-active", activeGroupId && activeGroupId === chip.dataset.groupId);
    });
  }
}

function closePlateSelectorModal(options = {}) {
  const preservePendingLink = !!options.preservePendingLink;
  if (!plateSelectorModal) return;
  finishPlateSelectorDrag();
  hidePlateSelectorMarquee();
  plateSelectorModal.classList.add("is-hidden");
  plateSelectorModal.style.display = "none";
  const mode = plateSelectorMode;
  plateSelectorNode = null;
  plateSelectorData = null;
  plateSelectorEditGroupId = "";
  setPlateSelectorMode("edit");
  plateSelectorSelection.clear();
  plateSelectorButtonsByWell.clear();
  if (!preservePendingLink && (mode === "link-source" || mode === "link-target")) {
    clearPendingLink();
  }
}

function renderPlateSelectorGrid(node, data = null) {
  if (!plateSelectorGrid || !node) return;
  finishPlateSelectorDrag();
  const parsed = data || readPlateGroups(node, false) || { selectedGroupId: "", groups: [] };
  if (ensurePlateGroupColors(parsed)) writePlateGroups(node, parsed);
  plateSelectorData = parsed;
  const count = getPlateWellCount(node.dataset.iconId);
  const wellIds = getPlateWellIds(count || 0);
  const spec = plateGridSpec(`${count || 0}`);
  const rows = Math.max(1, spec.rows);
  const cols = Math.max(1, spec.cols);
  plateSelectorGrid.innerHTML = "";
  plateSelectorButtonsByWell = new Map();
  plateSelectorGrid.classList.remove(
    "is-sparse",
    "is-medium",
    "is-dense",
    "is-ultra-dense",
    "is-plate-384",
    "is-plate-1536"
  );
  if ((count || 0) === 1536) {
    plateSelectorGrid.classList.add("is-ultra-dense", "is-plate-1536");
  } else if ((count || 0) === 384) {
    plateSelectorGrid.classList.add("is-ultra-dense", "is-plate-384");
  } else if ((count || 0) <= 6) {
    plateSelectorGrid.classList.add("is-sparse");
  } else if ((count || 0) <= 24) {
    plateSelectorGrid.classList.add("is-medium");
  } else if ((count || 0) <= 96) {
    plateSelectorGrid.classList.add("is-dense");
  } else {
    plateSelectorGrid.classList.add("is-ultra-dense");
  }
  plateSelectorGrid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  plateSelectorGrid.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
  plateSelectorGrid.style.aspectRatio = `${cols} / ${rows}`;
  plateSelectorGrid.setAttribute("aria-label", `${count || 0} well plate layout`);

  const wellGroupMap = new Map();
  parsed.groups.forEach((group, idx) => {
    const color = normalizePlateGroupColor(group.color) || plateGroupColorByIndex(idx);
    group.color = color;
    group.wells.forEach((wellId) => {
      if (!wellGroupMap.has(wellId)) {
        wellGroupMap.set(wellId, { groupId: group.id, color });
      }
    });
  });

  wellIds.forEach((wellId) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "plate-select-cell";
    btn.textContent = wellId;
    btn.dataset.wellId = wellId;
    const isSelected = plateSelectorSelection.has(wellId);
    if (isSelected) btn.classList.add("is-selected");
    btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
    btn.title = `Select well ${wellId}`;
    const linked = wellGroupMap.get(wellId);
    if (linked) {
      btn.classList.add("has-group");
      btn.dataset.groupId = linked.groupId;
      btn.style.setProperty("--well-group-color", linked.color);
      btn.style.setProperty("--well-selected-color", linked.color);
      btn.style.setProperty("--well-selected-soft", hexToRgba(linked.color, 0.2));
      btn.style.setProperty("--well-selected-strong", hexToRgba(linked.color, 0.58));
      btn.style.setProperty("--well-selected-outline", hexToRgba(linked.color, 0.48));
      btn.style.setProperty("--well-selected-ring", hexToRgba(linked.color, 0.28));
    }
    plateSelectorButtonsByWell.set(wellId, btn);
    plateSelectorGrid.appendChild(btn);
  });
  plateSelectorMarquee = document.createElement("div");
  plateSelectorMarquee.className = "plate-select-marquee";
  plateSelectorGrid.appendChild(plateSelectorMarquee);
  hidePlateSelectorMarquee();
  renderPlateSelectorGroupList(parsed);
  updatePlateSelectorInfo();
}

function closePlateGroupRenameModal() {
  if (!plateGroupRenameModal) return;
  plateGroupRenameModal.classList.add("is-hidden");
  plateGroupRenameModal.style.display = "none";
  plateGroupRenameNode = null;
  plateGroupRenameGroupId = "";
  if (plateGroupRenameInput) {
    plateGroupRenameInput.value = "";
    plateGroupRenameInput.placeholder = "Group name";
  }
}

function savePlateGroupRenameModal() {
  if (!plateGroupRenameNode || !plateGroupRenameGroupId) {
    closePlateGroupRenameModal();
    return;
  }
  const node = plateGroupRenameNode;
  const groupId = plateGroupRenameGroupId;
  const parsed = readPlateGroups(node, false);
  if (!parsed) {
    closePlateGroupRenameModal();
    return;
  }
  const idx = parsed.groups.findIndex((group) => group.id === groupId);
  if (idx === -1) {
    closePlateGroupRenameModal();
    return;
  }

  const nextName = normalizePlateGroupName(plateGroupRenameInput?.value || "");
  parsed.groups[idx] = {
    ...parsed.groups[idx],
    name: nextName
  };
  writePlateGroups(node, parsed);

  if (
    plateSelectorNode === node
    && plateSelectorModal
    && !plateSelectorModal.classList.contains("is-hidden")
  ) {
    plateSelectorData = parsed;
    const renamedGroup = parsed.groups[idx];
    plateSelectorSelection = new Set(normalizeWellSelection(renamedGroup?.wells || []));
    renderPlateSelectorGrid(node, parsed);
  }

  try {
    renderPlateNodeOverlay(node, parsed);
  } catch (err) {
    console.warn("Failed to refresh plate overlay after group rename", err);
  }

  closePlateGroupRenameModal();
}

function initPlateGroupRenameModal() {
  if (plateGroupRenameModal) return;
  plateGroupRenameModal = document.createElement("div");
  plateGroupRenameModal.className = "modal-backdrop modal-backdrop--center is-hidden";
  plateGroupRenameModal.innerHTML = `
    <div class="modal modal--group-rename">
      <div class="modal__header">
        <h3 class="modal__title">Rename group</h3>
        <button type="button" class="modal__close-btn" data-plate-group-rename-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <div class="field field--stacked">
          <label for="plateGroupRenameInput">Group name</label>
          <input id="plateGroupRenameInput" type="text" maxlength="48" placeholder="Group name">
        </div>
        <p class="start-modal__hint">Leave blank to use the default group label.</p>
      </div>
      <div class="modal__footer">
        <button type="button" data-plate-group-rename-cancel>Cancel</button>
        <button type="button" data-plate-group-rename-save>Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(plateGroupRenameModal);
  plateGroupRenameInput = plateGroupRenameModal.querySelector("#plateGroupRenameInput");

  plateGroupRenameModal.querySelectorAll("[data-plate-group-rename-close], [data-plate-group-rename-cancel]").forEach((btn) => {
    btn.addEventListener("click", closePlateGroupRenameModal);
  });
  plateGroupRenameModal.querySelector("[data-plate-group-rename-save]")?.addEventListener("click", savePlateGroupRenameModal);
  plateGroupRenameInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      savePlateGroupRenameModal();
    }
  });
  plateGroupRenameModal.addEventListener("click", (event) => {
    if (event.target === plateGroupRenameModal) closePlateGroupRenameModal();
  });
}

function openPlateGroupRenameModal(node, group, fallbackLabel = "Group") {
  if (!node || !group?.id) return;
  initPlateGroupRenameModal();
  plateGroupRenameNode = node;
  plateGroupRenameGroupId = group.id;
  if (plateGroupRenameInput) {
    const currentName = normalizePlateGroupName(group.name);
    plateGroupRenameInput.value = currentName;
    plateGroupRenameInput.placeholder = fallbackLabel || "Group";
    requestAnimationFrame(() => {
      plateGroupRenameInput.focus();
      plateGroupRenameInput.select();
    });
  }
  plateGroupRenameModal.classList.remove("is-hidden");
  plateGroupRenameModal.style.display = "flex";
}

function createPlateSelectorGroup() {
  if (!plateSelectorNode) return;
  const selected = getPlateSelectorSelectedWells();
  if (!selected.length) return;
  const parsed = readPlateGroups(plateSelectorNode, false);
  if (!parsed) return;
  plateSelectorData = parsed;
  const matched = findPlateGroupByWells(parsed, selected);
  if (matched) {
    selectPlateSelectorGroupWells(matched, { setSelectedGroup: true });
    return;
  }
  const overlap = findOverlappingPlateSelectorGroup(parsed, selected);
  if (overlap) {
    updatePlateSelectorInfo();
    return;
  }
  const fallbackIso = getNodeDateTime(plateSelectorNode).toISOString();
  const created = normalizePlateGroupEntry({
    id: createPlateGroupId(),
    name: defaultPlateGroupName(parsed.groups.length),
    wells: selected,
    color: pickNextPlateGroupColor(parsed.groups),
    startIso: fallbackIso
  }, fallbackIso);
  parsed.groups.push(created);
  parsed.selectedGroupId = created.id;
  writePlateGroups(plateSelectorNode, parsed);
  plateSelectorSelection = new Set(created.wells);
  try {
    refreshPlateNodeFromGroups(plateSelectorNode, parsed);
  } catch (err) {
    console.warn("Failed to refresh plate node after group creation", err);
  }
  renderPlateSelectorGrid(plateSelectorNode, parsed);
}

function renamePlateSelectorGroup() {
  if (!plateSelectorNode) return;
  const parsed = readPlateGroups(plateSelectorNode, false);
  if (!parsed) return;
  plateSelectorData = parsed;
  const selectionGroup = getPlateSelectorSelectionGroup(parsed);
  if (!selectionGroup) {
    updatePlateSelectorInfo();
    return;
  }
  const currentLabel = getPlateSelectorGroupLabel(parsed, selectionGroup.id) || "Group";
  openPlateGroupRenameModal(plateSelectorNode, selectionGroup, currentLabel);
}

function unbindPlateSelectorGroup() {
  if (!plateSelectorNode) return;
  const parsed = readPlateGroups(plateSelectorNode, false);
  if (!parsed) return;
  plateSelectorData = parsed;
  const matched = getPlateSelectorMatchedGroup(parsed);
  if (!matched) {
    updatePlateSelectorInfo();
    return;
  }
  parsed.groups = parsed.groups.filter((group) => group.id !== matched.id);
  if (parsed.selectedGroupId === matched.id) {
    parsed.selectedGroupId = parsed.groups[0]?.id || "";
  }
  plateSelectorSelection.clear();
  writePlateGroups(plateSelectorNode, parsed);
  renderPlateSelectorGrid(plateSelectorNode, parsed);
  try {
    syncPlateNodeFromGroups(plateSelectorNode, parsed);
    renderPlateNodeOverlay(plateSelectorNode, parsed);
    updateAllConnections();
    updateTaskAlerts();
  } catch (err) {
    console.warn("Failed to refresh plate view after unbinding group", err);
  }
}

function proceedPlateSelector() {
  if (!plateSelectorNode) return;
  const parsed = readPlateGroups(plateSelectorNode, false);
  if (!parsed) return;
  plateSelectorData = parsed;
  const changeMode = plateSelectorMode === "change-wells";
  const linkMode = plateSelectorMode === "link-source" || plateSelectorMode === "link-target";
  const matched = getPlateSelectorMatchedGroup(parsed);
  const editableGroup = changeMode ? getPlateSelectorEditableGroup(parsed) : null;
  const selectedGroup = changeMode
    ? editableGroup
    : (linkMode ? (getPlateSelectorSelectionGroup(parsed) || matched) : matched);
  if (!selectedGroup) {
    updatePlateSelectorInfo();
    return;
  }
  const group = selectedGroup;
  if (changeMode) {
    const nextWells = getPlateSelectorSelectedWells();
    if (!nextWells.length) {
      updatePlateSelectorInfo();
      return;
    }
    const overlap = findOverlappingPlateSelectorGroup(parsed, nextWells, group.id);
    if (overlap) {
      updatePlateSelectorInfo();
      return;
    }
    const idx = parsed.groups.findIndex((item) => item.id === group.id);
    if (idx === -1) {
      updatePlateSelectorInfo();
      return;
    }
    parsed.groups[idx] = {
      ...parsed.groups[idx],
      wells: nextWells
    };
    parsed.selectedGroupId = group.id;
    writePlateGroups(plateSelectorNode, parsed);
    const node = plateSelectorNode;
    const mode = plateSelectorMode;
    closePlateSelectorModal({ preservePendingLink: mode === "link-source" || mode === "link-target" });
    try {
      refreshPlateNodeFromGroups(node, parsed);
    } catch (err) {
      console.warn("Failed to refresh plate node after changing group wells", err);
    }
    requestAnimationFrame(() => {
      showMediaModal(node);
    });
    return;
  }
  parsed.selectedGroupId = group.id;
  writePlateGroups(plateSelectorNode, parsed);
  const node = plateSelectorNode;
  const mode = plateSelectorMode;
  closePlateSelectorModal({ preservePendingLink: mode === "link-source" || mode === "link-target" });
  if (mode === "link-source") {
    if (!pendingLink || pendingLink.fromId !== node.dataset.nodeId) {
      clearPendingLink();
      return;
    }
    pendingLink.fromGroupId = group.id;
    requestAnimationFrame(resolvePendingLinkTarget);
    return;
  }
  if (mode === "link-target") {
    if (!pendingLink || pendingLink.toId !== node.dataset.nodeId) {
      clearPendingLink();
      return;
    }
    pendingLink.toGroupId = group.id;
    requestAnimationFrame(finalizePendingLink);
    return;
  }
  try {
    syncPlateNodeFromGroups(node, parsed);
    renderNodeTasks(node);
  } catch (err) {
    console.warn("Failed to sync selected plate group on proceed", err);
  }
  requestAnimationFrame(() => {
    showNodeMenu(node, { plateGroupId: group.id });
  });
}

function openPlateSelectorModal(node, options = {}) {
  if (!node || !isMultiWellPlateNode(node)) return;
  initPlateSelectorModal();
  const mode = options?.mode || "edit";
  const requestedGroupId = String(options?.groupId || "").trim();
  setPlateSelectorMode(mode);
  plateSelectorEditGroupId = "";
  plateSelectorNode = node;
  plateSelectorSelection.clear();
  plateSelectorData = null;
  const parsed = readPlateGroups(node, false);
  plateSelectorData = parsed;
  const groupCount = parsed?.groups?.length || 0;
  const requireExplicitSelection = (mode === "link-source" || mode === "link-target") && groupCount > 1;
  if (mode === "change-wells") {
    const selectedGroup = getSelectedPlateGroup(node, parsed);
    const editGroup = parsed?.groups?.find((group) => group.id === requestedGroupId) || selectedGroup || parsed?.groups?.[0] || null;
    if (editGroup?.id) {
      plateSelectorEditGroupId = editGroup.id;
      parsed.selectedGroupId = editGroup.id;
      writePlateGroups(node, parsed);
      editGroup.wells.forEach((w) => plateSelectorSelection.add(w));
    }
  } else {
    const selectedGroup = getSelectedPlateGroup(node, parsed);
    if (!requireExplicitSelection && selectedGroup?.wells?.length) {
      selectedGroup.wells.forEach((w) => plateSelectorSelection.add(w));
    }
  }
  renderPlateSelectorGrid(node, parsed);
  plateSelectorModal.classList.remove("is-hidden");
  plateSelectorModal.style.display = "flex";
}

function initPlateSelectorModal() {
  if (plateSelectorModal) return;
  plateSelectorModal = document.createElement("div");
  plateSelectorModal.className = "modal-backdrop is-hidden";
  plateSelectorModal.innerHTML = `
    <div class="modal modal--plate-select">
      <div class="modal__header">
        <h3 class="modal__title">Select Plate Wells</h3>
        <button type="button" data-plate-select-close aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <p class="plate-select-copy">Select wells and click Create group. You can create multiple groups, then choose one to Proceed or Unbind.</p>
        <div id="plateSelectGrid" class="plate-select-grid"></div>
        <div id="plateSelectInfo" class="plate-select-info">Select one or more wells</div>
        <div class="plate-group-panel">
          <div class="plate-group-panel__title">Created Groups</div>
          <div id="plateGroupList" class="plate-group-list"></div>
        </div>
      </div>
      <div class="modal__footer">
        <button type="button" data-plate-select-close>Cancel</button>
        <button type="button" data-plate-select-create>Create group</button>
        <button type="button" data-plate-select-unbind class="is-hidden">Unbind group</button>
        <button type="button" data-plate-select-rename class="is-hidden">Rename group</button>
        <button type="button" data-plate-select-proceed class="is-hidden">Proceed</button>
      </div>
    </div>
  `;
  document.body.appendChild(plateSelectorModal);
  plateSelectorTitle = plateSelectorModal.querySelector(".modal__title");
  plateSelectorCopy = plateSelectorModal.querySelector(".plate-select-copy");
  plateSelectorGrid = plateSelectorModal.querySelector("#plateSelectGrid");
  plateSelectorInfo = plateSelectorModal.querySelector("#plateSelectInfo");
  plateSelectorGroupList = plateSelectorModal.querySelector("#plateGroupList");
  plateSelectorCreateGroup = plateSelectorModal.querySelector("[data-plate-select-create]");
  plateSelectorUnbindGroup = plateSelectorModal.querySelector("[data-plate-select-unbind]");
  plateSelectorRenameGroup = plateSelectorModal.querySelector("[data-plate-select-rename]");
  plateSelectorProceed = plateSelectorModal.querySelector("[data-plate-select-proceed]");
  plateSelectorGrid?.addEventListener("pointerdown", handlePlateSelectorPointerDown);
  plateSelectorGrid?.addEventListener("dragstart", (event) => event.preventDefault());
  plateSelectorModal.querySelectorAll("[data-plate-select-close]").forEach((btn) => {
    btn.addEventListener("click", closePlateSelectorModal);
  });
  plateSelectorCreateGroup?.addEventListener("click", createPlateSelectorGroup);
  plateSelectorUnbindGroup?.addEventListener("click", unbindPlateSelectorGroup);
  plateSelectorRenameGroup?.addEventListener("click", renamePlateSelectorGroup);
  plateSelectorProceed?.addEventListener("click", proceedPlateSelector);
  plateSelectorModal.addEventListener("click", (event) => {
    if (event.target === plateSelectorModal) closePlateSelectorModal();
  });
  setPlateSelectorMode("edit");
}

function getCurrentNodeArea() {
  if (!mediaTargetNode) return 1;
  const area = parseFloat(mediaTargetNode.dataset.area);
  return Number.isFinite(area) && area > 0 ? area : 25; // fallback placeholder cm²
}

function normalizeConcentrationUnit(unit) {
  const raw = String(unit || "").trim();
  if (!raw) return "";
  const lowered = raw.toLowerCase();
  if (lowered === "nm") return "nM";
  if (lowered === "um" || lowered === "μm" || lowered === "µm") return "uM";
  if (lowered === "mm") return "mM";
  return raw;
}

function formatConcentrationValue(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return `${num}`;
}

function formatAdditiveConcentration(item) {
  if (!item || typeof item !== "object") return "";
  if (item.concValue !== undefined && item.concValue !== null && item.concValue !== "") {
    const valueText = formatConcentrationValue(item.concValue);
    const unit = normalizeConcentrationUnit(item.concUnit);
    if (valueText && unit) return `${valueText} ${unit}`;
    if (valueText) return valueText;
  }
  return String(item.conc || "").trim();
}

function renderMediaPlan() {
  if (!mediaForm?.list) return;
  mediaForm.list.innerHTML = "";
  mediaPlanWorking.forEach((step, index) => {
    const li = document.createElement("li");
    li.className = "plan-step";
    const summary = document.createElement("div");
    const stepDuration = getStepDurationHours(step, 24);
    const recurEnabled = isRecurUntilStep(step);
    const recurEndPoint = String(step?.recurEndPoint || "custom end point").trim() || "custom end point";
    const durationText = recurEnabled
      ? `every ${stepDuration} h until ${recurEndPoint}`
      : `${step.duration} h`;
    const volText = step.volumeMl ? `${step.volumeMl.toFixed(2)} mL (${step.ratio.toFixed(3)} mL/cm²)` : "";
    summary.textContent = `${step.type} — ${durationText}${volText ? " — " + volText : ""}`;
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      mediaPlanWorking.splice(index, 1);
      renderMediaPlan();
    });
    li.appendChild(summary);
    li.appendChild(removeBtn);
    mediaForm.list.appendChild(li);
  });

  renderMediaTimeline();
}

let mediaStatusTimeout = null;
function showMediaStatus(message, tone = "error") {
  if (!mediaForm?.status) return;
  mediaForm.status.textContent = message;
  mediaForm.status.style.color = tone === "success" ? "#bbf7d0" : "#fca5a5";
  if (mediaStatusTimeout) clearTimeout(mediaStatusTimeout);
  mediaStatusTimeout = setTimeout(() => {
    mediaForm.status.textContent = "";
  }, 2400);
}

function renderAdditivesList() {
  if (!mediaForm?.additiveList) return;
  mediaForm.additiveList.innerHTML = "";
  additivesWorking.forEach((item, index) => {
    const pill = document.createElement("div");
    pill.className = "additive-pill";
    const conc = formatAdditiveConcentration(item);
    const concText = conc ? ` • ${conc}` : "";
    const typeText = item.type ? `[${item.type}] ` : "";
    pill.textContent = `${typeText}${item.drug}${concText} @ ${item.hour}h`;
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "×";
    removeBtn.style.marginLeft = "6px";
    removeBtn.addEventListener("click", () => {
      additivesWorking.splice(index, 1);
      renderAdditivesList();
      renderMediaTimeline();
    });
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.appendChild(pill);
    wrapper.appendChild(removeBtn);
    mediaForm.additiveList.appendChild(wrapper);
  });
}

function renderRemovalsList() {
  if (!mediaForm?.removalList) return;
  mediaForm.removalList.innerHTML = "";
  removalsWorking.forEach((item, index) => {
    const pill = document.createElement("div");
    pill.className = "additive-pill";
    const washBefore = item.washBefore ? ` | Before: ${item.washBefore}` : "";
    const washAfter = item.washAfter ? ` | After: ${item.washAfter}` : "";
    pill.textContent = `[remove ${item.type}] @ ${item.hour}h${washBefore}${washAfter}`;
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "×";
    removeBtn.style.marginLeft = "6px";
    removeBtn.addEventListener("click", () => {
      removalsWorking.splice(index, 1);
      renderRemovalsList();
      renderMediaTimeline();
    });
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.appendChild(pill);
    wrapper.appendChild(removeBtn);
    mediaForm.removalList.appendChild(wrapper);
  });
}

// Template handling
let templateModal = null;
let templateNameInput = null;

function openTemplateModal() {
  if (!templateModal) {
    templateModal = document.createElement("div");
    templateModal.className = "modal-backdrop is-hidden";
    templateModal.innerHTML = `
      <div class="modal" style="max-width: 360px;">
        <div class="modal__header">
          <h3 class="modal__title">Save Template</h3>
          <button type="button" data-tpl-close>&times;</button>
        </div>
        <div class="modal__body">
          <div class="field">
            <label>Name</label>
            <input id="templateNameInput" type="text" placeholder="e.g., Serum-free 72h + Additive">
          </div>
        </div>
        <div class="modal__footer">
          <button type="button" data-tpl-close>Cancel</button>
          <button type="button" data-tpl-save>Save template</button>
        </div>
      </div>
    `;
    document.body.appendChild(templateModal);
    templateNameInput = templateModal.querySelector("#templateNameInput");
    templateModal.querySelectorAll("[data-tpl-close]").forEach((btn) =>
      btn.addEventListener("click", closeTemplateModal)
    );
    templateModal.querySelector("[data-tpl-save]").addEventListener("click", saveTemplateFromModal);
    templateModal.addEventListener("click", (e) => {
      if (e.target === templateModal) closeTemplateModal();
    });
  }
  templateNameInput.value = "";
  templateModal.classList.remove("is-hidden");
  templateModal.style.display = "flex";
  setTimeout(() => templateNameInput.focus(), 0);
}

function closeTemplateModal() {
  if (!templateModal) return;
  templateModal.classList.add("is-hidden");
  templateModal.style.display = "none";
}

function saveTemplateFromModal() {
  const name = templateNameInput?.value.trim();
  if (!name) return;
  const tpl = {
    name,
    media: JSON.parse(JSON.stringify(mediaPlanWorking)),
    additives: JSON.parse(JSON.stringify(additivesWorking)),
    removals: JSON.parse(JSON.stringify(removalsWorking))
  };
  loadTemplates();
  mediaTemplates.push(tpl);
  persistTemplates();
  refreshTemplateOptions();
  renderTemplateManagerList();
  closeTemplateModal();
  if (mediaModalMode === "template") {
    hideMediaModal();
  }
}

function refreshTemplateOptions() {
  if (!mediaForm?.templateSelect) return;
  loadTemplates();
  mediaForm.templateSelect.innerHTML = "";
  const noneOpt = document.createElement("option");
  noneOpt.value = "";
  noneOpt.textContent = "None";
  mediaForm.templateSelect.appendChild(noneOpt);
  mediaTemplates.forEach((tpl, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = tpl.name;
    mediaForm.templateSelect.appendChild(opt);
  });
  mediaForm.templateSelect.value = "";
}

function loadTemplates() {
  try {
    const raw = localStorage.getItem("mediaTemplatesV1");
    mediaTemplates = raw ? JSON.parse(raw) : [];
  } catch {
    mediaTemplates = [];
  }
}

function persistTemplates() {
  try {
    localStorage.setItem("mediaTemplatesV1", JSON.stringify(mediaTemplates));
  } catch {
    // ignore storage failures
  }
}

function openTemplateManager() {
  if (!templateManager) {
    templateManager = document.createElement("div");
    templateManager.className = "modal-backdrop is-hidden";
    templateManager.innerHTML = `
      <div class="modal" style="max-width: 460px;">
        <div class="modal__header">
          <h3 class="modal__title">Media Plan Templates</h3>
          <button type="button" data-tplmgr-close>&times;</button>
        </div>
        <div class="modal__body">
          <p style="color:var(--muted);margin:0 0 8px;font-size:13px;">Create or remove saved media plan templates.</p>
          <div id="templateManagerList" class="template-manager"></div>
        </div>
        <div class="modal__footer" style="justify-content: space-between;">
          <button type="button" data-tplmgr-new>New template</button>
          <div style="flex:1"></div>
          <button type="button" data-tplmgr-close>Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(templateManager);
    templateManagerListEl = templateManager.querySelector("#templateManagerList");
    templateManager.querySelectorAll("[data-tplmgr-close]").forEach((btn) =>
      btn.addEventListener("click", closeTemplateManager)
    );
    templateManager.querySelector("[data-tplmgr-new]").addEventListener("click", () => {
      closeTemplateManager();
      showMediaModal(null, "template");
    });
    templateManager.addEventListener("click", (e) => {
      if (e.target === templateManager) closeTemplateManager();
    });
  }
  renderTemplateManagerList();
  templateManager.classList.remove("is-hidden");
  templateManager.style.display = "flex";
}

function closeTemplateManager() {
  if (!templateManager) return;
  templateManager.classList.add("is-hidden");
  templateManager.style.display = "none";
}

function renderTemplateManagerList() {
  if (!templateManagerListEl) return;
  loadTemplates();
  templateManagerListEl.innerHTML = "";
  if (!mediaTemplates.length) {
    const empty = document.createElement("div");
    empty.className = "template-row template-row--empty";
    empty.textContent = "No templates saved yet.";
    templateManagerListEl.appendChild(empty);
    refreshTemplateOptions();
    return;
  }

  mediaTemplates.forEach((tpl, idx) => {
    const row = document.createElement("div");
    row.className = "template-row";
    const info = document.createElement("div");
    info.className = "template-row__info";
    const counts = `${(tpl.media || []).length} steps · ${(tpl.additives || []).length} additives · ${(tpl.removals || []).length} removals`;
    info.innerHTML = `<strong>${tpl.name}</strong><span>${counts}</span>`;
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      mediaTemplates.splice(idx, 1);
      persistTemplates();
      refreshTemplateOptions();
      renderTemplateManagerList();
    });
    row.appendChild(info);
    row.appendChild(delBtn);
    templateManagerListEl.appendChild(row);
  });
}

// -------------------- User management --------------------
function openUserManager() {
  if (!userModal) {
    userModal = document.createElement("div");
    userModal.className = "modal-backdrop modal-backdrop--center is-hidden";
    userModal.innerHTML = `
      <div class="modal" style="max-width: 500px;">
        <div class="modal__header">
          <h3 class="modal__title">User Management</h3>
          <button type="button" data-user-close>&times;</button>
        </div>
        <div class="modal__body">
          <div class="field">
            <label>Name</label>
            <input id="userNameInput" type="text" placeholder="User name">
          </div>
          <div class="field">
            <label><input id="userAdminInput" type="checkbox"> Administrator</label>
          </div>
          <div class="field">
            <label>Password</label>
            <input id="userPassInput" type="password" placeholder="Password">
            <small style="color:var(--muted);">Leave blank to keep existing password when editing.</small>
          </div>
          <div class="field" style="display:flex; gap:10px;">
            <button type="button" data-user-save>Save User</button>
            <button type="button" data-user-new>New</button>
          </div>
          <div id="userStatus" class="form-status"></div>
          <div id="userList" class="template-manager" style="max-height:240px;overflow:auto;"></div>
        </div>
        <div class="modal__footer" style="justify-content:flex-end;">
          <button type="button" data-user-close>Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(userModal);
    userListEl = userModal.querySelector("#userList");
    userForm = {
      name: userModal.querySelector("#userNameInput"),
      admin: userModal.querySelector("#userAdminInput"),
      pass: userModal.querySelector("#userPassInput"),
      status: userModal.querySelector("#userStatus"),
      save: userModal.querySelector("[data-user-save]"),
      newBtn: userModal.querySelector("[data-user-new]")
    };
    userModal.querySelectorAll("[data-user-close]").forEach((btn) =>
      btn.addEventListener("click", closeUserManager)
    );
    userModal.addEventListener("click", (e) => {
      if (e.target === userModal) closeUserManager();
    });
    userForm.save.addEventListener("click", saveUser);
    userForm.newBtn.addEventListener("click", () => {
      editingUserIndex = -1;
      userForm.name.value = "";
      userForm.admin.checked = false;
      userForm.pass.value = "";
      showUserStatus("Ready to add a new user", "success");
    });
  }
  loadUsers();
  renderUserList();
  userModal.classList.remove("is-hidden");
  userModal.style.display = "flex";
}

function closeUserManager() {
  if (!userModal) return;
  userModal.classList.add("is-hidden");
  userModal.style.display = "none";
  editingUserIndex = -1;
}

function loadUsers() {
  try {
    const raw = localStorage.getItem("usersV1");
    const parsed = raw ? JSON.parse(raw) : [];
    users = Array.isArray(parsed)
      ? parsed
          .map((entry) => normalizeUserRecord(entry))
          .filter(Boolean)
      : [];
  } catch {
    users = [];
  }
}

function normalizeUserRecord(entry) {
  const name = String(entry?.name || "").trim();
  if (!name) return null;
  return {
    name,
    admin: !!entry?.admin,
    pass: typeof entry?.pass === "string" ? entry.pass : "",
    authProvider: entry?.authProvider === "google" ? "google" : "local",
    email: typeof entry?.email === "string" ? entry.email.trim().toLowerCase() : "",
    googleSub: typeof entry?.googleSub === "string" ? entry.googleSub.trim() : ""
  };
}

function persistUsers() {
  try {
    localStorage.setItem("usersV1", JSON.stringify(users));
  } catch {
    // ignore
  }
}

function renderUserList() {
  if (!userListEl) return;
  loadUsers();
  userListEl.innerHTML = "";
  if (!users.length) {
    const empty = document.createElement("div");
    empty.className = "template-row template-row--empty";
    empty.textContent = "No users yet.";
    userListEl.appendChild(empty);
    return;
  }
  users.forEach((u, idx) => {
    const row = document.createElement("div");
    row.className = "template-row";
    const info = document.createElement("div");
    info.className = "template-row__info";
    const role = u.admin ? "Admin" : "User";
    const provider = u.authProvider === "google" ? "Google" : "Local";
    info.innerHTML = `<strong>${u.name}</strong><span>${role} · ${provider}</span>`;
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      editingUserIndex = idx;
      userForm.name.value = u.name;
      userForm.admin.checked = !!u.admin;
      userForm.pass.value = "";
      showUserStatus("Editing user. Save to apply.", "success");
    });
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      users.splice(idx, 1);
      persistUsers();
      renderUserList();
    });
    row.appendChild(info);
    row.appendChild(editBtn);
    row.appendChild(delBtn);
    userListEl.appendChild(row);
  });
}

function saveUser() {
  const name = userForm.name.value.trim();
  const admin = userForm.admin.checked;
  const pass = userForm.pass.value;
  loadUsers();
  if (!name) {
    return showUserStatus("Name required.");
  }
  if (editingUserIndex === -1) {
    if (!pass) return showUserStatus("Password required for new users.");
    users.push({
      name,
      admin,
      pass,
      authProvider: "local",
      email: "",
      googleSub: ""
    });
    showUserStatus("User added.", "success");
  } else {
    const existing = users[editingUserIndex] || {};
    users[editingUserIndex].name = name;
    users[editingUserIndex].admin = admin;
    users[editingUserIndex].authProvider = existing.authProvider === "google" ? "google" : "local";
    users[editingUserIndex].email = existing.email || "";
    users[editingUserIndex].googleSub = existing.googleSub || "";
    if (pass) users[editingUserIndex].pass = pass;
    showUserStatus("User updated.", "success");
  }
  persistUsers();
  renderUserList();
  userForm.pass.value = "";
  populateLogFilter();
}

function showUserStatus(msg, tone = "error") {
  if (!userForm.status) return;
  userForm.status.textContent = msg;
  userForm.status.style.color = tone === "success" ? "#bbf7d0" : "#fca5a5";
}
function renderMediaTimeline() {
  const container = mediaForm?.timeline;
  if (!container) return;
  container.innerHTML = "";
  if (!mediaPlanWorking.length && !additivesWorking.length && !removalsWorking.length) {
    container.style.display = "none";
    return;
  }
  container.style.display = "block";
  container.style.position = "relative";
  container.style.overflowX = "scroll"; // persistent horizontal scrollbar
  container.style.overflowY = "visible";
  container.style.scrollbarGutter = "stable both-edges";

  const deltaText = (key, hour) => {
    if (!mediaTargetNode) return "";
    const completedAt = modalTaskCompletion?.[key];
    if (!completedAt) return "";
    const due = getTaskDueDate(mediaTargetNode, { hour });
    if (!due) return "";
    const diffMs = completedAt - due.getTime();
    const late = diffMs > 0;
    const absMs = Math.abs(diffMs);
    const totalMinutes = Math.round(absMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0 && minutes === 0) return "(on time)";
    const hPart = hours ? `${hours}h` : "";
    const mPart = minutes ? `${minutes}m` : "";
    const gap = [hPart, mPart].filter(Boolean).join(" ");
    return late ? `(+${gap} late)` : `(${gap} early)`;
  };

  const spineY = 100; // lower the spine to give more headroom for labels above
  const inset = 22;
  const gutter = 70; // extra breathing room on both ends so labels aren't clipped
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "fishbone-svg");

  // marker for arrowhead
  const defs = document.createElementNS(svgNS, "defs");
  const marker = document.createElementNS(svgNS, "marker");
  marker.setAttribute("id", "fishbone-arrow");
  marker.setAttribute("viewBox", "0 0 10 10");
  marker.setAttribute("refX", "8");
  marker.setAttribute("refY", "5");
  marker.setAttribute("markerWidth", "7");
  marker.setAttribute("markerHeight", "7");
  marker.setAttribute("orient", "auto");
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", "M 0 1 L 9 5 L 0 9 z");
  path.setAttribute("fill", "currentColor");
  marker.appendChild(path);
  defs.appendChild(marker);
  svg.appendChild(defs);

  // total duration and width
  // determine total hours needed: sum media durations (open-ended treated as 24h placeholder)
  // and ensure we cover any additive/removal hour markers.
  let mediaTotal = mediaPlanWorking.reduce((sum, s) => sum + getStepDurationHours(s, 24), 0);
  if (mediaTotal < 1 && mediaPlanWorking.length > 0) {
    mediaTotal = mediaPlanWorking.length * 24; // conservative fallback to keep timeline wide
  }
  const maxAddHour = additivesWorking.reduce((m, a) => Math.max(m, Number(a.hour) || 0), 0);
  const maxRemHour = removalsWorking.reduce((m, r) => Math.max(m, Number(r.hour) || 0), 0);
  const minByCount = mediaPlanWorking.length * 24;
  const safeTotal = Math.max(mediaTotal, minByCount, maxAddHour, maxRemHour, 24);
  const pxPerHour = 12;
  const layoutBuffer = 6; // extra breathing room so end labels/arrow aren't clipped
  const layoutTotal = safeTotal + layoutBuffer;
  const parentWidth = container.parentElement?.clientWidth || 0;
  const fallbackWidth = parentWidth || container.clientWidth || 600;
  const width = Math.max(fallbackWidth, layoutTotal * pxPerHour + 2 * (inset + gutter));
  svg.setAttribute("width", width);

  const leftPad = inset + gutter;
  const rightPad = inset + gutter;
  const drawableWidth = width - leftPad - rightPad;
  const xForHour = (h) => leftPad + (h / layoutTotal) * drawableWidth;

  // track wrapper to guarantee scrollable width
  const track = document.createElement("div");
  track.style.position = "relative";
  track.style.width = `${width}px`;
  track.style.height = "1px"; // will be updated after measuring content
  track.style.flex = "0 0 auto";
  // Axis ticks/labels (hours)
  const spine = document.createElementNS(svgNS, "line");
  spine.setAttribute("x1", leftPad);
  spine.setAttribute("y1", spineY);
  spine.setAttribute("x2", width - rightPad);
  spine.setAttribute("y2", spineY);
  spine.setAttribute("stroke", "var(--text)");
  spine.setAttribute("stroke-width", "2");
  spine.setAttribute("marker-end", "url(#fishbone-arrow)");
  svg.appendChild(spine);

  for (let t = 0; t <= safeTotal; t += 3) {
    const x = xForHour(t);
    const isDay = t % 24 === 0;
    const tickLen = isDay ? 12 : 7;
    const tick = document.createElementNS(svgNS, "line");
    tick.setAttribute("x1", x);
    tick.setAttribute("y1", spineY - tickLen / 2);
    tick.setAttribute("x2", x);
    tick.setAttribute("y2", spineY + tickLen / 2);
    tick.setAttribute("stroke", "var(--muted)");
    tick.setAttribute("stroke-width", isDay ? "1.6" : "1");
    svg.appendChild(tick);

    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", x);
    label.setAttribute("y", spineY + 20);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "fishbone-axis");
    label.textContent = `${Math.round(t)} h`;
    svg.appendChild(label);
  }

  // render spine before labels so we can overlay labels later
  track.appendChild(svg);

  // Layer for HTML labels (over the SVG)
  const labelLayer = document.createElement("div");
  labelLayer.style.position = "absolute";
  labelLayer.style.top = "0";
  labelLayer.style.left = "0";
  labelLayer.style.width = "100%";
  labelLayer.style.pointerEvents = "none";
  track.appendChild(labelLayer);
  container.appendChild(track);

  const labelsAbove = [];
  const labelsBelow = [];
  let cursor = 0;

  mediaPlanWorking.forEach((step, idx) => {
    const duration = getStepDurationHours(step, 24);
    const intervalHours = getStepIntervalHours(step, 24);
    const recurEnabled = isRecurUntilStep(step);
    const recurEndPoint = String(step?.recurEndPoint || "custom end point").trim() || "custom end point";
    const boneX = xForHour(cursor);
    const boneLen = 32;
    const bone = document.createElementNS(svgNS, "line");
    bone.setAttribute("x1", boneX);
    bone.setAttribute("y1", spineY);
    bone.setAttribute("x2", boneX);
    bone.setAttribute("y2", spineY - boneLen);
    bone.setAttribute("stroke", "var(--accent)");
    bone.setAttribute("stroke-width", "2");
    svg.appendChild(bone);

    const label = document.createElement("div");
    label.className = "fishbone-label";
    label.style.left = `${boneX}px`;
    label.style.top = `${spineY - (boneLen + 18)}px`;
    const volText = step.volumeMl ? `${step.volumeMl.toFixed(2)} mL (${step.ratio.toFixed(3)} mL/cm²)` : "";
    const delta = deltaText(mediaKey(idx), cursor);
    const deltaHtml = delta ? `<span class="fishbone-delta">${delta}</span>` : "";
    label.innerHTML = `<strong>${step.type}</strong>${recurEnabled ? `every ${intervalHours} h until ${escapeSvgText(recurEndPoint)}` : `${duration} h`}<br>${volText}${deltaHtml}`;
    if (modalTaskStatus[mediaKey(idx)]) {
      bone.classList.add("is-done");
      label.classList.add("is-done");
    }
    labelLayer.appendChild(label);
    labelsAbove.push({ el: label, baseTop: parseFloat(label.style.top) || 0, direction: -1 });

    cursor += duration;
  });

  // Additive markers (red triangles below spine)
  const additiveGroups = new Map();
  additivesWorking.forEach((add, idx) => {
    const h = add.hour || 0;
    if (!additiveGroups.has(h)) additiveGroups.set(h, []);
    additiveGroups.get(h).push({ add, idx });
  });

  const labelHeight = 20;
  const additiveOffset = 52;

  additiveGroups.forEach((group, hour) => {
    const x = xForHour(hour || 0);
    const baseY = spineY + additiveOffset;
    const tri = document.createElementNS(svgNS, "polygon");
    tri.setAttribute("points", `${x - 6},${baseY} ${x + 6},${baseY} ${x},${baseY - 14}`);
    tri.setAttribute("fill", "#ef4444");
    const allDone = group.every((g) => modalTaskStatus[addKey(g.idx)]);
    if (allDone) tri.classList.add("is-done");
    svg.appendChild(tri);

    group.forEach((entry, idx) => {
      const add = entry.add;
      const lbl = document.createElement("div");
      lbl.className = "additive-label";
      const conc = formatAdditiveConcentration(add);
      const concText = conc ? ` ${conc}` : "";
      const typeText = add.type ? `[${add.type}] ` : "";
      const delta = deltaText(addKey(entry.idx), add.hour || 0);
      lbl.innerHTML = `${typeText}${add.drug}${concText} @ ${add.hour}h${delta ? `<span class=\"fishbone-delta\">${delta}</span>` : ""}`;
      lbl.style.left = `${x}px`;
      const initTop = baseY + 6 + idx * (labelHeight + 6); // keep labels closer to triangle
      lbl.style.top = `${initTop}px`;
      if (modalTaskStatus[addKey(entry.idx)]) {
        lbl.classList.add("is-done");
      }
      labelLayer.appendChild(lbl);
      labelsBelow.push({ el: lbl, baseTop: initTop, direction: 1 });
    });
  });

  // Removal markers (blue triangles above spine)
  const removalGroups = new Map();
  removalsWorking.forEach((rem, idx) => {
    const h = rem.hour || 0;
    if (!removalGroups.has(h)) removalGroups.set(h, []);
    removalGroups.get(h).push({ rem, idx });
  });

  const removalOffset = 22; // triangle position relative to spine
  const removalLaneTop = spineY - 120; // dedicated band for removal labels above media labels

  removalGroups.forEach((group, hour) => {
    const x = xForHour(hour || 0);
    const baseY = spineY - removalOffset;
    const triTipY = baseY - 14;
    const tri = document.createElementNS(svgNS, "polygon");
    tri.setAttribute("points", `${x - 6},${baseY} ${x + 6},${baseY} ${x},${baseY - 14}`);
    tri.setAttribute("fill", "#60a5fa");
    const allDone = group.every((g) => modalTaskStatus[remKey(g.idx)]);
    if (allDone) tri.classList.add("is-done");
    svg.appendChild(tri);

    group.forEach((entry, idx) => {
      const rem = entry.rem;
      const lbl = document.createElement("div");
      lbl.className = "additive-label";
      const washBefore = rem.washBefore ? ` | Before: ${rem.washBefore}` : "";
      const washAfter = rem.washAfter ? ` | After: ${rem.washAfter}` : "";
      const delta = deltaText(remKey(entry.idx), rem.hour || 0);
      lbl.innerHTML = `[remove ${rem.type}] @ ${rem.hour}h${washBefore}${washAfter}${delta ? `<span class=\"fishbone-delta\">${delta}</span>` : ""}`;
      lbl.style.left = `${x}px`;
      const stackGap = labelHeight + 10; // vertical stacking for removal labels
      const initTop = removalLaneTop - idx * stackGap; // dedicated lane well above triangle and media labels
      lbl.style.top = `${initTop}px`;
      if (modalTaskStatus[remKey(entry.idx)]) {
        lbl.classList.add("is-done");
      }
      labelLayer.appendChild(lbl);
      labelsAbove.push({ el: lbl, baseTop: initTop, direction: -1, tipY: triTipY });
    });
  });

  // Resolve label collisions separately above and below the spine
  const placedAbove = resolveLabelCollisions(labelsAbove, -1, 14);
  const placedBelow = resolveLabelCollisions(labelsBelow, 1, 8);

  // Final clamp: keep removal labels above their triangle tips and away from overlaps
  clampRemovalLabels(placedAbove, 8);
  const labelRect = labelLayer.getBoundingClientRect();
  separateRemovalOverlaps(placedAbove, [...placedAbove, ...placedBelow], 10, labelRect);

  const containerRect = container.getBoundingClientRect();

  const allLabels = [...placedAbove, ...placedBelow];
  let minTop = Infinity;
  let maxBottom = -Infinity;

  allLabels.forEach((obj) => {
    const rect = obj.el.getBoundingClientRect();
    minTop = Math.min(minTop, rect.top - containerRect.top);
    maxBottom = Math.max(maxBottom, rect.bottom - containerRect.top);
  });

  // Nudge everything down if anything is clipped at the very top
  if (minTop < 10) {
    const delta = 10 - minTop;
    allLabels.forEach((obj) => {
      const current = parseFloat(obj.el.style.top) || 0;
      obj.el.style.top = `${current + delta}` + "px";
    });
    maxBottom += delta;
  }

  const contentHeight = Math.max(maxBottom + 20, spineY + additiveOffset + 70);
  svg.setAttribute("height", contentHeight);
  labelLayer.style.height = `${contentHeight}px`;
  track.style.height = `${contentHeight}px`;
  container.style.minHeight = `${contentHeight + 16}px`;

  syncTimelineScrollbar(container, width);
}

function resolveLabelCollisions(labels, direction = 1, gap = 6) {
  const placed = [];
  const sorted = labels.slice().sort((a, b) => {
    const ra = a.el.getBoundingClientRect();
    const rb = b.el.getBoundingClientRect();
    return ra.left - rb.left;
  });

  sorted.forEach((obj) => {
    let top = (obj.baseTop ?? parseFloat(obj.el.style.top) ?? 0);
    obj.el.style.top = `${top}px`;
    let guard = 0;
    while (guard < 80) {
      const rect = obj.el.getBoundingClientRect();
      const overlap = placed.some((p) => {
        const r = p.el.getBoundingClientRect();
        return rect.left < r.right && rect.right > r.left && rect.top < r.bottom && rect.bottom > r.top;
      });
      if (!overlap) break;
      top += direction * (rect.height + gap);
      if (obj.maxTop !== undefined && direction < 0) {
        top = Math.min(top, obj.maxTop);
      }
      obj.el.style.top = `${top}px`;
      guard += 1;
    }
    if (obj.maxTop !== undefined && direction < 0) {
      top = Math.min(top, obj.maxTop);
      obj.el.style.top = `${top}px`;
    }
    placed.push(obj);
  });

  return placed;
}

function clampRemovalLabels(labels, gapAboveTip = 8) {
  labels
    .filter((obj) => obj.tipY !== undefined)
    .forEach((obj) => {
      const rect = obj.el.getBoundingClientRect();
      const height = rect.height || obj.el.offsetHeight || 0;
      const allowedBottom = obj.tipY - gapAboveTip;
      const currentTop = parseFloat(obj.el.style.top) || 0;
      const newTop = Math.min(currentTop, allowedBottom - height);
      obj.el.style.top = `${newTop}px`;
      obj.baseTop = newTop;
      // Also enforce the maxTop clamp if present
      if (obj.maxTop !== undefined) {
        const clampedTop = Math.min(newTop, obj.maxTop);
        obj.el.style.top = `${clampedTop}px`;
        obj.baseTop = clampedTop;
      }
    });
}

function rectanglesOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function separateRemovalOverlaps(removalLabels, allLabels, gap = 10, containerRect = { top: 0 }) {
  removalLabels
    .filter((o) => o.tipY !== undefined)
    .forEach((obj) => {
      let attempts = 0;
      while (attempts < 120) {
        const rect = obj.el.getBoundingClientRect();
        let lift = 0;

        // Keep above triangle tip
        const allowedBottom = obj.tipY - gap;
        const bottom = rect.bottom - containerRect.top;
        if (bottom > allowedBottom) {
          lift = Math.max(lift, bottom - allowedBottom);
        }

        // Resolve overlaps with any other label
        allLabels.forEach((other) => {
          if (other === obj) return;
          const r2 = other.el.getBoundingClientRect();
          if (rectanglesOverlap(rect, r2)) {
            lift = Math.max(lift, (rect.bottom - r2.top) + gap);
          }
        });

        if (lift <= 0.5) break;
        const currentTop = parseFloat(obj.el.style.top) || 0;
        obj.el.style.top = `${currentTop - lift}px`;
        attempts += 1;
      }
    });
}

// Custom timeline scrollbar to keep bar visible even when native scrollbar auto-hides
function syncTimelineScrollbar(container, contentWidth) {
  if (!mediaForm?.timelineScroll || !mediaForm?.timelineThumb) return;
  const scroll = mediaForm.timelineScroll;
  const thumb = mediaForm.timelineThumb;
  const currentContentWidth = Math.max(0, Number(contentWidth) || container.scrollWidth || 0);
  scroll.dataset.contentWidth = `${currentContentWidth}`;

  const viewport = container.clientWidth;
  if (currentContentWidth <= viewport + 2) {
    scroll.classList.remove("is-visible");
    return;
  }
  scroll.classList.add("is-visible");

  const trackWidth = scroll.clientWidth || viewport;
  const thumbWidth = Math.max(32, (viewport / currentContentWidth) * trackWidth);
  const maxThumbLeft = Math.max(0, trackWidth - thumbWidth);
  const ratio = container.scrollLeft / Math.max(1, currentContentWidth - viewport);
  thumb.style.width = `${thumbWidth}px`;
  thumb.style.left = `${ratio * maxThumbLeft}px`;

  // Wire once
  if (!scroll.dataset.wired) {
    scroll.dataset.wired = "1";
    thumb.addEventListener("pointerdown", (e) => {
      thumb.setPointerCapture(e.pointerId);
      const startX = e.clientX;
      const startScroll = container.scrollLeft;
      const contentWidthNow = Math.max(0, Number(scroll.dataset.contentWidth) || container.scrollWidth || 0);
      const viewportNow = container.clientWidth;
      const track = scroll.clientWidth || viewportNow;
      const contentSpan = Math.max(0, contentWidthNow - viewportNow);
      const thumbSpan = Math.max(1, track - (thumb.clientWidth || thumbWidth));
      const onMove = (ev) => {
        const dx = ev.clientX - startX;
        const ratioMove = dx / thumbSpan;
        container.scrollLeft = Math.max(0, Math.min(contentSpan, startScroll + ratioMove * contentSpan));
      };
      const onUp = () => {
        thumb.releasePointerCapture(e.pointerId);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });

    container.addEventListener("scroll", () => {
      const liveContentWidth = Math.max(0, Number(scroll.dataset.contentWidth) || container.scrollWidth || 0);
      syncTimelineScrollbar(container, liveContentWidth);
    });

    scroll.addEventListener("click", (e) => {
      if (e.target === thumb) return;
      const contentWidthNow = Math.max(0, Number(scroll.dataset.contentWidth) || container.scrollWidth || 0);
      const viewportNow = container.clientWidth;
      const trackRect = scroll.getBoundingClientRect();
      const clickX = e.clientX - trackRect.left;
      const track = trackRect.width || scroll.clientWidth || viewportNow;
      const thumbWidthLive = thumb.clientWidth || thumbWidth;
      const maxThumbLeftLive = Math.max(0, track - thumbWidthLive);
      const ratioClick = clickX / Math.max(1, maxThumbLeftLive);
      container.scrollLeft = ratioClick * Math.max(0, contentWidthNow - viewportNow);
    });
  }
}

// Right-hand log panel ------------------------------------------------------
function initLogPanel() {
  workspaceEl = document.querySelector(".workspace");
  if (!workspaceEl) return;
  const relayoutTimeline = () => {
    requestAnimationFrame(() => updateTimelineLayout());
  };
  logPanel = document.createElement("div");
  logPanel.className = "log-panel";
  logPanel.innerHTML = `
    <div class="log-header">
      <div class="log-header__title">Activity Log</div>
    </div>
    <div class="log-body"></div>
  `;
  logPanelBody = logPanel.querySelector(".log-body");
  if (logPanelToggle) {
    logPanelToggle.remove();
    logPanelToggle = null;
  }
  logPanelToggle = document.createElement("button");
  logPanelToggle.type = "button";
  logPanelToggle.className = "log-edge-toggle";
  logPanelToggle.innerHTML = `<span class="log-edge-toggle__icon" aria-hidden="true">\u203a</span>`;
  // filter dropdown
  const filterWrap = document.createElement("div");
  filterWrap.className = "log-filter";
  const label = document.createElement("span");
  label.className = "log-filter__label";
  label.textContent = "Filter";
  logFilterSelect = document.createElement("select");
  logFilterSelect.className = "log-filter__select";
  filterWrap.appendChild(label);
  filterWrap.appendChild(logFilterSelect);
  logPanelBody.parentElement?.insertBefore(filterWrap, logPanelBody);
  const animalFilterWrap = document.createElement("div");
  animalFilterWrap.className = "animal-filter-toolbar";
  logAnimalFilterBtn = document.createElement("button");
  logAnimalFilterBtn.type = "button";
  logAnimalFilterBtn.className = "animal-filter-toolbar__btn";
  logAnimalFilterBtn.textContent = "Active Filter";
  logAnimalFilterBtn.addEventListener("click", () => openAnimalFilterModal());
  logAnimalFilterStatus = document.createElement("span");
  logAnimalFilterStatus.className = "animal-filter-toolbar__status";
  animalFilterWrap.append(logAnimalFilterBtn, logAnimalFilterStatus);
  logPanelBody.parentElement?.insertBefore(animalFilterWrap, logPanelBody);
  const syncLogPanelState = () => {
    const collapsed = logPanel.classList.contains("is-collapsed");
    const buttonLabel = collapsed ? "Show activity sidebar" : "Hide activity sidebar";
    if (logPanelToggle) {
      const icon = logPanelToggle.querySelector(".log-edge-toggle__icon");
      if (icon) icon.textContent = collapsed ? "\u2039" : "\u203a";
      logPanelToggle.classList.toggle("is-collapsed", collapsed);
      logPanelToggle.setAttribute("aria-label", buttonLabel);
      logPanelToggle.setAttribute("title", buttonLabel);
      logPanelToggle.setAttribute("aria-expanded", String(!collapsed));
    }
    if (workspaceEl) {
      workspaceEl.classList.toggle("has-log-open", !collapsed);
    }
    relayoutTimeline();
  };
  const toggle = () => {
    logPanel.classList.toggle("is-collapsed");
    syncLogPanelState();
  };
  logPanelToggle.addEventListener("click", toggle);
  logFilterSelect.addEventListener("change", updateLogPanel);
  workspaceEl.appendChild(logPanel);
  document.body.appendChild(logPanelToggle);
  syncLogPanelState();
  populateLogFilter();
}

function updateLogPanel() {
  if (!logPanelBody) return;
  logPanelBody.innerHTML = "";
  if (logAnimalFilterBtn?.parentElement) {
    const showAnimalFilter = activeWorkspaceId === "animal-work";
    logAnimalFilterBtn.parentElement.style.display = showAnimalFilter ? "flex" : "none";
  }
  const assignedEntries = [];
  const activityEntries = [];
  const aliquotEntries = [];
  canvas.querySelectorAll(".drop").forEach((node) => {
    if (!isNodeInActiveWorkspace(node)) return;
    const name = node.querySelector(".node-label")?.value || "Unnamed";
    let meta = {};
    let completed = {};
    try {
      meta = node.dataset.taskMeta ? JSON.parse(node.dataset.taskMeta) : {};
      completed = node.dataset.taskCompletedAt ? JSON.parse(node.dataset.taskCompletedAt) : {};
    } catch {
      meta = {};
      completed = {};
    }
    // map tasks to labels
    const taskMap = {};
    try {
      const tasks = buildTasks(
        node.dataset.mediaPlan ? JSON.parse(node.dataset.mediaPlan) : [],
        node.dataset.additivesPlan ? JSON.parse(node.dataset.additivesPlan) : [],
        node.dataset.removalsPlan ? JSON.parse(node.dataset.removalsPlan) : [],
        readNodeRecurringTasks(node)
      );
      tasks.forEach((t) => {
        taskMap[t.key] = t;
      });
    } catch {}

    Object.keys(taskMap).forEach((key) => {
      const t = taskMap[key];
      const m = meta[key] || {};
      const assignee = m.assignee;
      if (assignee) {
        assignedEntries.push({
          nodeName: name,
          taskKey: key,
          nodeId: node.dataset.nodeId,
          label: t.label || t.baseLabel || key,
          assignee,
          completed: !!completed[key],
        });
      }
      const completedMs = completed[key];
      if (completedMs) {
        activityEntries.push({
          nodeName: name,
          taskKey: key,
          nodeId: node.dataset.nodeId,
          label: t.label || t.baseLabel || key,
          assignee,
          user: m.user || "Unknown",
          time: new Date(completedMs),
          timeMs: completedMs,
        });
      }
    });
  });
  connections.forEach((connection) => {
    const connectionWorkspace = String(connection.workspaceId || DEFAULT_WORKSPACE_ID);
    if (connectionWorkspace !== activeWorkspaceId) return;
    if (!connection?.protocol) return;
    syncConnectionProtocolTaskState(connection);
    const tasks = getProtocolTaskSteps(connection.protocol);
    const routeName = getConnectionDisplayName(connection);
    tasks.forEach((step) => {
      const state = connection.protocol.taskState?.[step.id] || {};
      const label = `[Protocol] ${step.title || protocolStepLibraryByType(step.type)?.label || "Step"}`;
      if (state.assignee) {
        assignedEntries.push({
          nodeName: routeName,
          taskKey: step.id,
          nodeId: "",
          connectionId: connection.id,
          protocolStepId: step.id,
          label,
          assignee: state.assignee,
          completed: !!state.completed
        });
      }
      if (state.completedAt) {
        activityEntries.push({
          nodeName: routeName,
          taskKey: step.id,
          nodeId: "",
          connectionId: connection.id,
          protocolStepId: step.id,
          label,
          assignee: state.assignee || "",
          user: state.completedBy || state.assignee || "Unknown",
          time: new Date(state.completedAt),
          timeMs: Number(state.completedAt)
        });
      }
    });
  });
  // aliquot entries from inventory
  loadInventory();
  inventoryItems.forEach((it) => {
    if (!Array.isArray(it.aliquots)) return;
    it.aliquots.forEach((a) => {
      aliquotEntries.push({
        name: it.name,
        lot: a.lot,
        units: a.unitsUsed,
        count: a.count,
        vol: a.vol,
        storage: a.storage,
        user: a.user || "System",
        time: new Date(a.ts),
        timeMs: a.ts,
      });
    });
  });
  const filterVal = logFilterSelect?.value || "";
  const matchUser = (assignee) => {
    if (!filterVal) return true;
    if (filterVal === "__current" && currentUser) return assignee === currentUser;
    return assignee === filterVal;
  };

  const assignedList = assignedEntries.filter((e) => matchUser(e.assignee));
  const activityList = activityEntries.filter((e) => matchUser(e.user)).sort((a, b) => b.timeMs - a.timeMs);

  // Assigned section
  const assignedTitle = document.createElement("div");
  assignedTitle.className = "log-section-title";
  assignedTitle.textContent = "Assigned";
  logPanelBody.appendChild(assignedTitle);
  if (!assignedList.length) {
    const empty = document.createElement("div");
    empty.className = "log-row";
    empty.textContent = "No assigned tasks.";
    logPanelBody.appendChild(empty);
  } else {
    assignedList.slice(0, 200).forEach((e) => {
      const row = document.createElement("div");
      row.className = "log-row";
      if (e.completed) row.classList.add("is-done");
      row.innerHTML = `<strong>${e.nodeName}</strong><br>${e.label} · Assigned to ${e.assignee}`;
      row.dataset.nodeId = e.nodeId || "";
      row.dataset.taskKey = e.taskKey || "";
      row.dataset.connectionId = e.connectionId || "";
      row.dataset.protocolStepId = e.protocolStepId || "";
      row.addEventListener("click", onLogRowClick);
      logPanelBody.appendChild(row);
    });
  }

  // Activity / Completed section
  const activityTitle = document.createElement("div");
  activityTitle.className = "log-section-title";
  activityTitle.textContent = "Completed";
  logPanelBody.appendChild(activityTitle);

  const list = activityList.length ? activityList : activityEntries.sort((a, b) => b.timeMs - a.timeMs);

  list.slice(0, 200).forEach((e) => {
    const row = document.createElement("div");
    row.className = "log-row";
    const iso = e.time.toISOString();
    const dateStr = iso.slice(0, 10);
    const timeStr = iso.slice(11, 16);
    const assigneeText = e.assignee ? ` · Assigned to ${e.assignee}` : "";
    row.innerHTML = `<strong>${e.nodeName}</strong><br>${e.label || e.taskKey}${assigneeText} — ${e.user} @ ${dateStr} ${timeStr}`;
    row.dataset.nodeId = e.nodeId || "";
    row.dataset.taskKey = e.taskKey || "";
    row.dataset.connectionId = e.connectionId || "";
    row.dataset.protocolStepId = e.protocolStepId || "";
    row.addEventListener("click", onLogRowClick);
    logPanelBody.appendChild(row);
  });

  if (activeWorkspaceId === "animal-work") {
    const procedureTitle = document.createElement("div");
    procedureTitle.className = "log-section-title";
    procedureTitle.textContent = "Scheduled Procedures";
    logPanelBody.appendChild(procedureTitle);
    const procedureNodes = Array.from(canvas.querySelectorAll(".drop")).filter((node) => {
      if (!isNodeInActiveWorkspace(node)) return false;
      return String(node.dataset.nodeType || "") === "animal-procedure";
    });
    if (!procedureNodes.length) {
      const empty = document.createElement("div");
      empty.className = "log-row";
      empty.textContent = "No scheduled procedures.";
      logPanelBody.appendChild(empty);
    } else {
      procedureNodes.forEach((node) => {
        let ids = [];
        try {
          ids = node.dataset.procedureAnimalIds ? JSON.parse(node.dataset.procedureAnimalIds) : [];
        } catch {
          ids = [];
        }
        const names = (Array.isArray(ids) ? ids : [])
          .map((idValue) => findAnimalHousingAnimalById(idValue))
          .filter(Boolean)
          .map((animal) => animal.animalId || animal.name);
        const row = document.createElement("div");
        row.className = "log-row";
        row.innerHTML = `<strong>${getNodeLabelText(node)}</strong><br>${names.length ? names.join(", ") : "No animals assigned"}`;
        row.dataset.nodeId = String(node.dataset.nodeId || "");
        row.dataset.taskKey = "";
        row.addEventListener("click", onLogRowClick);
        logPanelBody.appendChild(row);
      });
    }

    const transferTitle = document.createElement("div");
    transferTitle.className = "log-section-title";
    transferTitle.textContent = "Animal Transfers";
    logPanelBody.appendChild(transferTitle);
    const transferEntries = animalTransferLog
      .filter((entry) => String(entry.workspaceId || "") === activeWorkspaceId)
      .slice()
      .sort((a, b) => b.timeMs - a.timeMs);
    if (!transferEntries.length) {
      const empty = document.createElement("div");
      empty.className = "log-row";
      empty.textContent = "No transfers yet.";
      logPanelBody.appendChild(empty);
    } else {
      transferEntries.slice(0, 200).forEach((entry) => {
        const row = document.createElement("div");
        row.className = "log-row";
        const when = new Date(entry.timeMs || Date.now());
        const iso = when.toISOString();
        const dateStr = iso.slice(0, 10);
        const timeStr = iso.slice(11, 16);
        row.innerHTML = `<strong>${entry.animalName}</strong><br>${entry.fromCageName || "Unassigned"} → ${entry.toCageName || "Unassigned"} @ ${dateStr} ${timeStr}`;
        logPanelBody.appendChild(row);
      });
    }
  }

  if (activeWorkspaceId === "cell-culture") {
    // Aliquots section (not user-filtered)
    const aliTitle = document.createElement("div");
    aliTitle.className = "log-section-title";
    aliTitle.textContent = "Aliquots";
    logPanelBody.appendChild(aliTitle);
    if (!aliquotEntries.length) {
      const empty = document.createElement("div");
      empty.className = "log-row";
      empty.textContent = "No aliquots.";
      logPanelBody.appendChild(empty);
    } else {
      aliquotEntries
        .sort((a, b) => b.timeMs - a.timeMs)
        .slice(0, 200)
        .forEach((a) => {
          const row = document.createElement("div");
          row.className = "log-row";
          const iso = a.time.toISOString();
          const dateStr = iso.slice(0, 10);
          const timeStr = iso.slice(11, 16);
          row.innerHTML = `<strong>${a.name}</strong><br>${a.count} aliquots of ${a.vol} (used ${a.units} units, lot ${a.lot}) @ ${a.storage || "-"} — ${a.user} @ ${dateStr} ${timeStr}`;
          logPanelBody.appendChild(row);
        });
    }
  }

  applySelectedRowHighlight();
  applyAnimalFilterHighlights();
}

function sanitizeProjectId(value) {
  const raw = String(value || "").trim().toLowerCase();
  const safe = raw.replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-");
  return safe || "default-project";
}

function downloadTextFile(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

function collectProjectExportPayload() {
  const workspaceRows = {};
  WORKSPACES.forEach((workspace) => {
    const nodes = Array.from(canvas.querySelectorAll(".drop"))
      .filter((node) => getNodeWorkspace(node) === workspace.id)
      .map((node) => ({
        nodeId: String(node.dataset.nodeId || ""),
        name: getNodeLabelText(node),
        iconId: String(node.dataset.iconId || ""),
        nodeType: String(node.dataset.nodeType || ""),
        startDay: Number(node.dataset.startDay || node.dataset.dayIndex || 0) || 0,
        spanDays: Number(node.dataset.spanDays || 1) || 1,
        absDay: Number(node.dataset.absDay || 0) || 0,
        cageId: String(node.dataset.cageId || ""),
        animalBirthIso: String(node.dataset.animalBirthIso || ""),
        style: {
          left: String(node.style.left || ""),
          top: String(node.style.top || ""),
          width: String(node.style.width || ""),
          height: String(node.style.height || "")
        },
        data: { ...node.dataset }
      }));
    const links = connections
      .filter((connection) => String(connection.workspaceId || DEFAULT_WORKSPACE_ID) === workspace.id)
      .map((connection) => ({
        id: connection.id,
        fromId: connection.fromId,
        toId: connection.toId,
        fromDir: connection.fromDir,
        toDir: connection.toDir,
        fromGroupId: connection.fromGroupId || "",
        toGroupId: connection.toGroupId || "",
        protocol: connection.protocol || null
      }));
    workspaceRows[workspace.id] = { nodes, links };
  });

  const timeline = {
    startDateIso: startDate ? new Date(startDate).toISOString() : "",
    dayCount
  };
  const milestones = globalMilestones.map((entry) => ({ ...entry }));
  const transfers = animalTransferLog.map((entry) => ({ ...entry }));
  const analytics = WORKSPACES.map((workspace) => {
    const data = workspaceRows[workspace.id];
    return {
      workspaceId: workspace.id,
      nodeCount: data.nodes.length,
      linkCount: data.links.length,
      protocolCount: data.links.filter((link) => !!link.protocol).length
    };
  });
  return {
    projectId: sanitizeProjectId(activeProjectId),
    exportedAt: new Date().toISOString(),
    timeline,
    milestones,
    animalHousing: normalizeAnimalHousingState(animalHousingState),
    animalTransfers: transfers,
    analytics,
    workspaces: workspaceRows
  };
}

function serializeCanvasState() {
  const base = collectProjectExportPayload();
  base.inventory = inventoryItems.map((item) => ({ ...item }));
  base.storage = storageItems.map((item) => ({ ...item }));
  base.storageBoxes = storageBoxes.map((box) => ({ ...box }));
  base.mediaFormulations = mediaFormulations.map((mf) => ({ ...mf }));
  base.mediaTemplates = mediaTemplates.map((tmpl) => ({ ...tmpl }));
  base.protocolTemplates = protocolTemplates.map((pt) => ({ ...pt }));
  base.users = users.map((u) => ({ ...u }));
  base.nodeIdCounter = nodeIdCounter;
  base.connectionIdCounter = connectionIdCounter;
  delete base.analytics;
  delete base.exportedAt;
  return base;
}

function deserializeCanvasState(data) {
  if (!data || typeof data !== "object") return;

  // 1. Clear existing canvas nodes
  const existingDrops = canvas.querySelectorAll(".drop");
  existingDrops.forEach((node) => node.remove());

  // 2. Reset in-memory state
  connections.length = 0;
  globalMilestones.length = 0;
  animalTransferLog.length = 0;
  planningPanelCollapsedRoots.clear();
  pendingLink = null;
  selection = null;

  // 3. Restore counters
  if (typeof data.nodeIdCounter === "number" && data.nodeIdCounter > 0) {
    nodeIdCounter = data.nodeIdCounter;
  }
  if (typeof data.connectionIdCounter === "number" && data.connectionIdCounter > 0) {
    connectionIdCounter = data.connectionIdCounter;
  }

  // 4. Restore timeline
  if (data.timeline) {
    if (data.timeline.startDateIso) {
      startDate = new Date(data.timeline.startDateIso);
    }
    if (typeof data.timeline.dayCount === "number" && data.timeline.dayCount > 0) {
      dayCount = data.timeline.dayCount;
    }
  }

  // 5. Restore milestones
  if (Array.isArray(data.milestones)) {
    data.milestones.forEach((ms) => globalMilestones.push({ ...ms }));
  }

  // 6. Restore animal housing (always reset — empty data means fresh project)
  if (data.animalHousing && typeof data.animalHousing === "object") {
    animalHousingState.cages = Array.isArray(data.animalHousing.cages) ? data.animalHousing.cages.map((c) => ({ ...c })) : [];
    animalHousingState.animals = Array.isArray(data.animalHousing.animals) ? data.animalHousing.animals.map((a) => ({ ...a })) : [];
  } else {
    animalHousingState.cages = [];
    animalHousingState.animals = [];
  }

  // 7. Restore animal transfers
  if (Array.isArray(data.animalTransfers)) {
    data.animalTransfers.forEach((t) => animalTransferLog.push({ ...t }));
  }

  // 8. Restore data arrays
  if (Array.isArray(data.inventory)) {
    inventoryItems.length = 0;
    data.inventory.forEach((item) => inventoryItems.push({ ...item }));
  }
  if (Array.isArray(data.storage)) {
    storageItems.length = 0;
    data.storage.forEach((item) => storageItems.push({ ...item }));
  }
  if (Array.isArray(data.storageBoxes)) {
    storageBoxes.length = 0;
    data.storageBoxes.forEach((box) => storageBoxes.push({ ...box }));
  }
  if (Array.isArray(data.mediaFormulations)) {
    mediaFormulations.length = 0;
    data.mediaFormulations.forEach((mf) => mediaFormulations.push({ ...mf }));
  }
  if (Array.isArray(data.mediaTemplates)) {
    mediaTemplates.length = 0;
    data.mediaTemplates.forEach((tmpl) => mediaTemplates.push({ ...tmpl }));
  }
  if (Array.isArray(data.protocolTemplates)) {
    protocolTemplates.length = 0;
    data.protocolTemplates.forEach((pt) => protocolTemplates.push({ ...pt }));
  }
  if (Array.isArray(data.users)) {
    users.length = 0;
    data.users.forEach((u) => users.push({ ...u }));
  }

  // 9. Rebuild DOM nodes per workspace
  const workspaces = data.workspaces || {};
  Object.keys(workspaces).forEach((wsId) => {
    const wsData = workspaces[wsId];
    if (!wsData || !Array.isArray(wsData.nodes)) return;
    wsData.nodes.forEach((nodeData) => {
      const drop = document.createElement("div");
      drop.className = "drop";
      // Restore all dataset attributes
      const ds = nodeData.data || {};
      Object.keys(ds).forEach((key) => { drop.dataset[key] = String(ds[key]); });
      // Ensure critical dataset fields
      if (nodeData.nodeId) drop.dataset.nodeId = nodeData.nodeId;
      if (!drop.dataset.workspace) drop.dataset.workspace = wsId;
      if (nodeData.iconId) drop.dataset.iconId = nodeData.iconId;
      if (nodeData.nodeType) drop.dataset.nodeType = nodeData.nodeType;
      if (typeof nodeData.startDay === "number") {
        drop.dataset.startDay = String(nodeData.startDay);
        drop.dataset.dayIndex = String(nodeData.startDay);
      }
      if (typeof nodeData.spanDays === "number") drop.dataset.spanDays = String(nodeData.spanDays);
      if (typeof nodeData.absDay === "number") drop.dataset.absDay = String(nodeData.absDay);
      if (nodeData.cageId) drop.dataset.cageId = nodeData.cageId;

      // Style positioning
      if (nodeData.style) {
        if (nodeData.style.left) drop.style.left = nodeData.style.left;
        if (nodeData.style.top) drop.style.top = nodeData.style.top;
        if (nodeData.style.width) drop.style.width = nodeData.style.width;
        if (nodeData.style.height) drop.style.height = nodeData.style.height;
      }

      // Icon element
      const iconDef = getIconDefinition(nodeData.iconId, nodeData.name);
      const dropIcon = document.createElement("span");
      dropIcon.className = "drop__icon";
      dropIcon.setAttribute("aria-hidden", "true");
      if (iconDef) {
        dropIcon.innerHTML = getIconSvg(iconDef, "node");
      } else {
        dropIcon.textContent = "\u2B1C";
      }

      // Label textarea
      const nameInput = document.createElement("textarea");
      nameInput.className = "node-label";
      nameInput.value = nodeData.name || "";
      nameInput.placeholder = "Name...";
      nameInput.addEventListener("click", (event) => event.stopPropagation());

      // CSS class modifiers
      const nodeType = String(nodeData.nodeType || drop.dataset.nodeType || "");
      if (nodeType === "planning-task") drop.classList.add("drop--planning-task");
      if (nodeType === "animal-procedure") drop.classList.add("drop--animal-procedure");
      if (nodeType === "cage") drop.classList.add("drop--cage");
      if (nodeType === "animal") drop.classList.add("drop--animal");
      if (isMultiWellPlateIconId(nodeData.iconId)) drop.classList.add("drop--plate");

      drop.tabIndex = 0;
      drop.setAttribute("role", "img");
      drop.setAttribute("aria-label", nodeData.name || "Placed icon");

      drop.appendChild(dropIcon);
      drop.appendChild(nameInput);
      canvas.appendChild(drop);

      // Wire up drag, resize, context menu interactions
      wireDropNode(drop);
    });

    // Restore links/connections
    if (Array.isArray(wsData.links)) {
      wsData.links.forEach((link) => {
        const cId = link.id || `c-${connectionIdCounter++}`;
        const fromGroupId = link.fromGroupId || "";
        const toGroupId = link.toGroupId || "";

        const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
        line.dataset.connectionId = cId;
        line.dataset.workspaceId = wsId;
        line.dataset.fromId = link.fromId;
        line.dataset.toId = link.toId;
        line.dataset.fromGroupId = fromGroupId;
        line.dataset.toGroupId = toGroupId;
        line.addEventListener("click", (event) => {
          event.stopPropagation();
          selectConnection(cId, line);
        });
        connectionsLayer.appendChild(line);

        let topEl = null;
        if (connectionsTopLayer) {
          topEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
          topEl.classList.add("link-end-overlay");
          topEl.setAttribute("marker-end", "url(#arrowhead-top)");
          connectionsTopLayer.appendChild(topEl);
        }

        connections.push({
          id: cId,
          fromId: link.fromId,
          toId: link.toId,
          fromDir: link.fromDir || "right",
          toDir: link.toDir || "left",
          fromGroupId,
          toGroupId,
          el: line,
          topEl,
          cachedPoints: null,
          protocol: link.protocol || null,
          protocolIconEl: null,
          protocolTaskEl: null,
          protocolTasksCollapsed: false,
          workspaceId: wsId
        });
      });
    }
  });

  // 9b. Cell-culture lineage integrity + nodeId counter (P0):
  // - bump nodeIdCounter past every existing id so a freshly placed vessel can
  //   never reuse an id that a lineage pointer still references (M3).
  // - drop dangling cultureParentNodeId pointers whose parent node is gone (M2).
  try {
    const CL = window.WLPCultureLogic;
    if (CL) {
      const allIds = [];
      canvas.querySelectorAll(".drop[data-node-id]").forEach((n) => allIds.push(n.dataset.nodeId || ""));
      nodeIdCounter = CL.nextNodeIdCounter(allIds, nodeIdCounter);
      const records = [];
      const byId = {};
      canvas.querySelectorAll('.drop[data-workspace="cell-culture"]').forEach((n) => {
        const rec = { nodeId: n.dataset.nodeId || "", parentNodeId: n.dataset.cultureParentNodeId || "" };
        records.push(rec);
        byId[rec.nodeId] = n;
      });
      CL.danglingChildIds(records).forEach((cid) => {
        const n = byId[cid];
        if (n) delete n.dataset.cultureParentNodeId;
      });
    }
  } catch { /* */ }

  // 10. Update all visual state
  try { updateTimelineLayout(); } catch { /* */ }
  try { updateAllConnections(); } catch { /* */ }
  try { applyWorkspaceVisibility(); } catch { /* */ }
  try { renderAnimalHousingPanel(); } catch { /* */ }
  try { updateLogPanel(); } catch { /* */ }
  try { renderGlobalMilestones(); } catch { /* */ }
  try { updateTaskAlerts(); } catch { /* */ }
  try { updateWorkspaceSidebarPanels(); } catch { /* */ }
}

function exportProjectData() {
  const payload = collectProjectExportPayload();
  const projectId = sanitizeProjectId(payload.projectId);
  downloadTextFile(`${projectId}-workspace-export.json`, JSON.stringify(payload, null, 2), "application/json");

  const csvHeader = ["workspace_id", "node_count", "link_count", "protocol_count"];
  const csvRows = payload.analytics.map((row) =>
    [row.workspaceId, row.nodeCount, row.linkCount, row.protocolCount].join(",")
  );
  downloadTextFile(`${projectId}-workspace-analytics.csv`, [csvHeader.join(","), ...csvRows].join("\n"), "text/csv");
  showTaskToast(`Exported project ${projectId} data (JSON + CSV).`);
}

function onLogRowClick(e) {
  const row = e.currentTarget;
  const connectionId = row.dataset.connectionId;
  if (connectionId) {
    openProtocolBuilder(connectionId);
    return;
  }
  const nodeId = row.dataset.nodeId;
  const taskKey = row.dataset.taskKey;
  if (!nodeId) return;
  // toggle selection if same row clicked
  if (selectedFocus && selectedFocus.nodeId === nodeId && selectedFocus.taskKey === taskKey) {
    clearSelectedPulse();
    return;
  }
  focusNodeById(nodeId, taskKey);
}

function applySelectedRowHighlight() {
  const rows = logPanelBody?.querySelectorAll(".log-row") || [];
  rows.forEach((r) => {
    const nodeId = r.dataset.nodeId;
    const taskKey = r.dataset.taskKey;
    const match =
      selectedFocus && selectedFocus.nodeId === nodeId && selectedFocus.taskKey === taskKey;
    r.classList.toggle("log-row--pulse", !!match);
  });
  // also pulse canvas chips continuously
  if (selectedFocus) {
    const node = canvas.querySelector(`.drop[data-node-id="${selectedFocus.nodeId}"]`);
    if (node) {
      node.classList.add("drop--pulse-selected");
      if (selectedFocus.taskKey) {
        const chip = node.querySelector(`.task-chip[data-task-key="${selectedFocus.taskKey}"]`);
        chip?.classList.add("task-chip--pulse-selected");
      }
    }
  }
  const planningRows = planningTaskList?.querySelectorAll("li[data-node-id]") || [];
  planningRows.forEach((row) => {
    const nodeId = String(row.dataset.nodeId || "");
    const match = !!selectedFocus && selectedFocus.nodeId === nodeId && selectedFocus.taskKey === "";
    row.classList.toggle("is-focused", match);
  });
}

function populateLogFilter() {
  if (!logFilterSelect) return;
  loadUsers();
  const currentVal = logFilterSelect.value;
  logFilterSelect.innerHTML = "";
  const opts = [];
  const allOpt = document.createElement("option");
  allOpt.value = "";
  allOpt.textContent = "All";
  opts.push(allOpt);
  users.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.name;
    opt.textContent = u.name;
    opts.push(opt);
  });
  opts.forEach((o) => logFilterSelect.appendChild(o));
  if (opts.some((o) => o.value === currentVal)) {
    logFilterSelect.value = currentVal;
  } else {
    logFilterSelect.value = "";
  }
}

function computePlanTotalHours(mediaPlan = [], additives = [], removals = [], recurringTasks = [], options = {}) {
  const minHoursRaw = Number(options?.minHours);
  const minHours = Number.isFinite(minHoursRaw) ? Math.max(0, minHoursRaw) : 24;
  let mediaHours = mediaPlan.reduce((sum, s) => {
    return sum + getStepDurationHours(s, 24);
  }, 0);
  if (mediaHours < 1 && mediaPlan.length) {
    mediaHours = mediaPlan.length * 24;
  }
  const maxAdd = additives.reduce((m, a) => Math.max(m, Number(a.hour) || 0), 0);
  const maxRem = removals.reduce((m, r) => Math.max(m, Number(r.hour) || 0), 0);
  const maxRecurringEnd = sanitizeRecurringTasks(recurringTasks).reduce((m, item) => {
    const hour = Number(item?.hour) || 0;
    const interval = Math.max(1, Number(item?.recurrenceConfig?.intervalHours) || 24);
    return Math.max(m, hour + interval);
  }, 0);
  return Math.max(mediaHours, maxAdd, maxRem, maxRecurringEnd, minHours);
}

const mediaKey = (idx) => `m-${idx}`;
const addKey = (idx) => `a-${idx}`;
const remKey = (idx) => `r-${idx}`;

function renderNodeTasks(node) {
  if (!node) return;
  const isPlateNode = isMultiWellPlateNode(node);
  if (!isPlateNode && node.dataset.taskBaseAbsDay) {
    delete node.dataset.taskBaseAbsDay;
  }
  const existing = node.querySelector(".task-strip");
  if (existing) existing.remove();
  const oldProgress = node.querySelector(".node-progress-overlay");
  if (oldProgress) oldProgress.remove();
  if (isPlateNode) {
    node.classList.remove("drop--overdue-alert");
    syncPlateTaskProxyFromSelectedGroup(node);
    const focusGroupId = String(node.dataset.plateTaskFocusGroupId || "").trim();
    const selectedGroupId = String(node.dataset.plateSelectedGroupId || "").trim();
    if (!focusGroupId || !selectedGroupId || focusGroupId !== selectedGroupId) {
      clearPlateRowProgress(node);
      return;
    }
  }
  const { plan, adds, rems, recurringTasks } = readNodeTaskPlans(node);
  const metaMap = loadTaskMeta(node);

  const statusMap = (() => {
    try {
      return node.dataset.taskStatus ? JSON.parse(node.dataset.taskStatus) : {};
    } catch {
      return {};
    }
  })();
  const completionMap = (() => {
    try {
      return node.dataset.taskCompletedAt ? JSON.parse(node.dataset.taskCompletedAt) : {};
    } catch {
      return {};
    }
  })();

  const tasks = buildTasks(plan, adds, rems, recurringTasks);
  setVesselDishOverdueState(node, tasks, statusMap);

  if (!tasks.length) {
    if (isPlateNode) clearPlateRowProgress(node);
    delete node.dataset.nodeTaskCollapsed;
    return;
  }
  if (isPlateNode && node.dataset.plateTaskCollapsed === "1") {
    renderProgressBar(node, plan, statusMap, adds, rems, recurringTasks);
    updateLogPanel();
    return;
  }
  if (!isPlateNode && node.dataset.nodeTaskCollapsed === "1") {
    renderProgressBar(node, plan, statusMap, adds, rems, recurringTasks);
    updateLogPanel();
    refreshAssignButtons(node);
    return;
  }

  const strip = document.createElement("div");
  strip.className = "task-strip";

  tasks.forEach((task) => {
    const chip = document.createElement("label");
    chip.className = "task-chip";
    chip.dataset.taskKey = task.key;
    chip.dataset.taskData = JSON.stringify(task);
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!statusMap[task.key];
    if (cb.checked) chip.classList.add("is-done");
    const overdue = !cb.checked && isTaskOverdue(node, task);
    if (overdue) chip.classList.add("task-chip--alert");
    cb.addEventListener("click", (e) => e.stopPropagation());
    cb.addEventListener("change", () => {
      if (completionSkipToggle) return;
      const metaMapLocal = loadTaskMeta(node);
      const assignee = metaMapLocal[task.key]?.assignee || null;
      if (cb.checked && assignee && (!currentUser || assignee !== currentUser)) {
        // Not allowed to complete someone else's task; revert and prompt reassignment
        cb.checked = false;
        statusMap[task.key] = false;
        node.dataset.taskStatus = JSON.stringify(statusMap);
        chip.classList.remove("is-done");
        showTaskToast(`Assigned to ${assignee}. Reassign before completing.`);
        showAssignModal(node, task.key);
        return;
      }
      statusMap[task.key] = cb.checked;
      if (cb.checked) {
        completionMap[task.key] = Date.now();
        // open completion modal for user/time
        showCompletionModal(node, task.key, { fromToggle: true });
      } else {
        delete completionMap[task.key];
        delete metaMapLocal[task.key];
      }
      node.dataset.taskStatus = JSON.stringify(statusMap);
      node.dataset.taskCompletedAt = JSON.stringify(completionMap);
      node.dataset.taskMeta = JSON.stringify(metaMapLocal);
      if (isMultiWellPlateNode(node)) {
        persistPlateTaskProxyToSelectedGroup(node);
      }
      chip.classList.toggle("is-done", cb.checked);
      renderProgressBar(node, plan, statusMap, adds, rems, recurringTasks);
      const delta = describeDelta(node, task, completionMap[task.key]);
      updateLabel(cb.checked, delta);
      chip.classList.remove("task-chip--alert");
      editBtn.classList.toggle("is-hidden", !cb.checked);
      assignBtn.classList.toggle("is-hidden", cb.checked);
      const metaNow = loadTaskMeta(node);
      assignBtn.textContent = metaNow[task.key]?.assignee ? "Reassign" : "Assign";
      if (!cb.checked) updateLogPanel();
      refreshAssignButtons(node);
    });
    const span = document.createElement("span");
    const labelSpan = document.createElement("span");
    labelSpan.className = "task-label";
   const deltaSpan = document.createElement("span");
   deltaSpan.className = "task-delta";
   const updateLabel = (checked, deltaText) => {
     if (checked) {
       labelSpan.textContent = task.baseLabel;
       deltaSpan.textContent = deltaText || describeDelta(node, task, completionMap[task.key]);
       deltaSpan.style.display = deltaSpan.textContent ? "inline" : "none";
     } else {
       labelSpan.textContent = task.label;
       deltaSpan.textContent = "";
       deltaSpan.style.display = "none";
     }
   };
   updateLabel(cb.checked);
   span.appendChild(labelSpan);
   span.appendChild(deltaSpan);
   chip.appendChild(cb);
   chip.appendChild(span);
    const assignBtn = document.createElement("button");
    assignBtn.type = "button";
    const assignee = metaMap[task.key]?.assignee;
    assignBtn.textContent = assignee ? "Reassign" : "Assign";
    assignBtn.dataset.assignee = assignee || "";
    assignBtn.className = "task-assign";
    assignBtn.style.marginLeft = "6px";
    assignBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showAssignModal(node, task.key);
    });
    assignBtn.classList.toggle("is-hidden", cb.checked);
    chip.appendChild(assignBtn);
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.className = "task-edit";
    editBtn.style.marginLeft = "6px";
    editBtn.classList.toggle("is-hidden", !cb.checked);
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showCompletionModal(node, task.key, { fromToggle: false });
    });
    chip.appendChild(editBtn);
    chip.addEventListener("mouseenter", () => setTaskProgressHover(node, task.key, true));
    chip.addEventListener("mouseleave", () => setTaskProgressHover(node, task.key, false));
    chip.addEventListener("focusin", () => setTaskProgressHover(node, task.key, true));
    chip.addEventListener("focusout", (e) => {
      if (!chip.contains(e.relatedTarget)) {
        setTaskProgressHover(node, task.key, false);
      }
    });
    chip.addEventListener("click", (e) => e.stopPropagation());
    strip.appendChild(chip);
  });

  node.appendChild(strip);
  renderProgressBar(node, plan, statusMap, adds, rems, recurringTasks);
  updateLogPanel();
  refreshAssignButtons(node);
}

function isTaskOverdue(node, task) {
  const due = getTaskDueDate(node, task);
  if (!due) return false;
  return Date.now() > due.getTime();
}

function getTaskDueDate(node, task) {
  if (!node || typeof task.hour !== "number") return null;
  const baseMs = getNodeTaskBaseMs(node);
  if (!Number.isFinite(baseMs)) return null;
  return new Date(baseMs + task.hour * 3600000);
}

function describeDelta(node, task, completionMs = Date.now()) {
  const due = getTaskDueDate(node, task);
  if (!due) return "";
  const diffMs = completionMs - due.getTime();
  const late = diffMs > 0;
  const absMs = Math.abs(diffMs);
  const totalMinutes = Math.round(absMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0 && minutes === 0) return "(on time)";
  const hPart = hours ? `${hours}h` : "";
  const mPart = minutes ? `${minutes}m` : "";
  const gap = [hPart, mPart].filter(Boolean).join(" ");
  return late ? `(+${gap} late)` : `(${gap} early)`;
}

function renderProgressBar(node, plan, statusMap, adds = [], rems = [], recurringTasks = []) {
  const old = node.querySelector(".node-progress-overlay");
  if (old) old.remove();
  if (isMultiWellPlateNode(node)) {
    renderPlateRowProgress(node, plan, statusMap, adds, rems, recurringTasks);
    refreshAssignButtons(node);
    return;
  }
  if (!plan || !plan.length) return;

  const recurringList = sanitizeRecurringTasks(recurringTasks);
  const baseDurations = plan.map((step) => {
    return getStepDurationHours(step, 24);
  });
  const mediaHours = baseDurations.reduce((sum, dur) => sum + dur, 0);
  const rawSpanDays = parseFloat(node?.dataset?.spanDays ?? "NaN");
  const spanHours = Number.isFinite(rawSpanDays) && rawSpanDays > 0 ? rawSpanDays * 24 : mediaHours;
  const useManualSpanVisual =
    node?.dataset?.spanManual === "1" &&
    Number.isFinite(spanHours) &&
    spanHours > 0 &&
    mediaHours > 0;
  const visualDurations = [...baseDurations];
  if (visualDurations.length && useManualSpanVisual) {
    if (visualDurations.length === 1) {
      visualDurations[0] = Math.max(1, spanHours);
    } else {
      const prefixHours = visualDurations.slice(0, -1).reduce((sum, dur) => sum + dur, 0);
      const finalHours = Math.max(1, spanHours - prefixHours);
      visualDurations[visualDurations.length - 1] = finalHours;
    }
  }
  const visualMediaHours = visualDurations.reduce((sum, dur) => sum + dur, 0);
  const maxMarkerHour = Math.max(
    adds.reduce((m, a) => Math.max(m, Number(a.hour) || 0), 0),
    rems.reduce((m, r) => Math.max(m, Number(r.hour) || 0), 0)
  );
  const maxRecurringEnd = recurringList.reduce((m, task) => {
    const hour = Number(task?.hour) || 0;
    const interval = Math.max(1, Number(task?.recurrenceConfig?.intervalHours) || 24);
    return Math.max(m, hour + interval);
  }, 0);
  const totalHours = Math.max(visualMediaHours, maxMarkerHour, maxRecurringEnd, 1);

  const overlay = document.createElement("div");
  overlay.className = "node-progress-overlay";

  let cursor = 0;
  plan.forEach((step, idx) => {
    const durTotal = Number(visualDurations[idx]) || 0;
    if (durTotal <= 0) return;
    const isRecurStep = isRecurUntilStep(step);
    const intervalDur = isRecurStep ? Math.max(1, getStepIntervalHours(step, 24)) : durTotal;
    const mainDur = Math.max(0, Math.min(durTotal, intervalDur));
    const gapDur = Math.max(0, durTotal - mainDur);
    const key = mediaKey(idx);
    const done = !!statusMap[key];

    const seg = document.createElement("div");
    seg.className = "progress-seg progress-task-link";
    seg.dataset.taskKey = key;
    if (done) seg.classList.add("is-done");
    seg.style.width = `${Math.max(0, (mainDur / totalHours) * 100)}%`;
    seg.title = step.type || "Media step";
    overlay.appendChild(seg);

    if (gapDur > 0.001) {
      const gap = document.createElement("div");
      gap.className = "progress-gap";
      gap.style.width = `${Math.max(0, (gapDur / totalHours) * 100)}%`;
      overlay.appendChild(gap);
    }
    cursor += durTotal;
  });

  // markers for additives/removals
  const addRemContainer = document.createElement("div");
  addRemContainer.className = "progress-markers";
  const recurringLayer = document.createElement("div");
  recurringLayer.className = "progress-recur-segments";
  adds.forEach((add, idx) => {
    const hour = Number(add.hour) || 0;
    const pct = Math.min(100, (hour / totalHours) * 100);
    const marker = document.createElement("div");
    marker.className = "progress-marker progress-marker--add";
    marker.classList.add("progress-task-link");
    marker.dataset.taskKey = addKey(idx);
    marker.style.left = `${pct}%`;
    marker.classList.toggle("is-done", !!statusMap[addKey(idx)]);
    marker.title = add.drug || "Additive";
    addRemContainer.appendChild(marker);
  });
  rems.forEach((rem, idx) => {
    const hour = Number(rem.hour) || 0;
    const pct = Math.min(100, (hour / totalHours) * 100);
    const marker = document.createElement("div");
    marker.className = "progress-marker progress-marker--rem";
    marker.classList.add("progress-task-link");
    marker.dataset.taskKey = remKey(idx);
    marker.style.left = `${pct}%`;
    marker.classList.toggle("is-done", !!statusMap[remKey(idx)]);
    marker.title = rem.type || "Removal";
    addRemContainer.appendChild(marker);
  });
  if (recurringList.length) {
    recurringList.forEach((task, idx) => {
      const taskKey = String(task?.key || "");
      const done = !!statusMap[taskKey];
      const hour = Number(task?.hour) || 0;
      const intervalHours = Math.max(1, Number(task?.recurrenceConfig?.intervalHours) || 24);
      const startPct = Math.min(100, (hour / totalHours) * 100);
      const maxWidthPct = Math.max(0, 100 - startPct);
      const rawWidthPct = (intervalHours / totalHours) * 100;
      const widthPct = Math.max(0, Math.min(maxWidthPct, rawWidthPct));
      const seg = document.createElement("div");
      seg.className = "progress-seg progress-seg--recur progress-task-link";
      seg.dataset.taskKey = taskKey;
      if (done) seg.classList.add("is-done");
      seg.style.left = `${startPct}%`;
      seg.style.width = `${widthPct}%`;
      seg.title = task?.baseLabel || task?.label || `Recurring step ${idx + 1}`;
      recurringLayer.appendChild(seg);
    });
    overlay.appendChild(recurringLayer);
  }

  recurringList.forEach((task, idx) => {
    const taskKey = String(task?.key || "");
    const done = !!statusMap[taskKey];
    const hour = Number(task?.hour) || 0;
    const pct = Math.min(100, (hour / totalHours) * 100);
    const marker = document.createElement("div");
    marker.className = "progress-marker progress-marker--recur";
    marker.classList.add("progress-task-link");
    marker.dataset.taskKey = taskKey;
    marker.style.left = `${pct}%`;
    marker.classList.toggle("is-done", done);
    marker.title = task?.baseLabel || task?.label || `Recurring step ${idx + 1}`;
    addRemContainer.appendChild(marker);
  });
  overlay.appendChild(addRemContainer);

  node.appendChild(overlay);
  refreshAssignButtons(node);
}

function clearPlateRowProgress(node) {
  if (!node) return;
  node.querySelectorAll(".plate-row-progress").forEach((el) => el.remove());
}

function renderPlateRowProgress(node, plan = [], statusMap = {}, adds = [], rems = [], recurringTasks = []) {
  clearPlateRowProgress(node);
  if (!isMultiWellPlateNode(node)) return;
  const focusGroupId = String(node.dataset.plateTaskFocusGroupId || "").trim();
  if (!focusGroupId || !Array.isArray(plan) || !plan.length) return;
  const row = Array.from(node.querySelectorAll(".plate-well-row[data-group-id]"))
    .find((item) => String(item.dataset.groupId || "").trim() === focusGroupId);
  const bar = row?.querySelector(".plate-well-row__bar");
  if (!bar) return;
  const recurringList = sanitizeRecurringTasks(recurringTasks);
  const mediaHours = plan.reduce((sum, step) => {
    return sum + getStepDurationHours(step, 24);
  }, 0);
  const maxMarkerHour = Math.max(
    (Array.isArray(adds) ? adds : []).reduce((m, a) => Math.max(m, Number(a?.hour) || 0), 0),
    (Array.isArray(rems) ? rems : []).reduce((m, r) => Math.max(m, Number(r?.hour) || 0), 0)
  );
  const maxRecurringEnd = recurringList.reduce((m, task) => {
    const hour = Number(task?.hour) || 0;
    const interval = Math.max(1, Number(task?.recurrenceConfig?.intervalHours) || 24);
    return Math.max(m, hour + interval);
  }, 0);
  const totalHours = Math.max(mediaHours, maxMarkerHour, maxRecurringEnd, 1);
  const progress = document.createElement("span");
  progress.className = "plate-row-progress";
  plan.forEach((step, idx) => {
    const durTotal = getStepDurationHours(step, 24);
    if (durTotal <= 0) return;
    const isRecurStep = isRecurUntilStep(step);
    const intervalDur = isRecurStep ? Math.max(1, getStepIntervalHours(step, 24)) : durTotal;
    const mainDur = Math.max(0, Math.min(durTotal, intervalDur));
    const gapDur = Math.max(0, durTotal - mainDur);
    const key = mediaKey(idx);

    const seg = document.createElement("span");
    seg.className = "plate-row-progress__seg progress-task-link";
    seg.dataset.taskKey = key;
    if (statusMap?.[key]) seg.classList.add("is-done");
    seg.style.width = `${Math.max(0, (mainDur / totalHours) * 100)}%`;
    progress.appendChild(seg);

    if (gapDur > 0.001) {
      const gap = document.createElement("span");
      gap.className = "plate-row-progress__gap";
      gap.style.width = `${Math.max(0, (gapDur / totalHours) * 100)}%`;
      progress.appendChild(gap);
    }
  });
  if (recurringList.length) {
    const recurLayer = document.createElement("span");
    recurLayer.className = "plate-row-progress__recur-layer";
    recurringList.forEach((task, idx) => {
      const taskKey = String(task?.key || "");
      const done = !!statusMap[taskKey];
      const hour = Number(task?.hour) || 0;
      const intervalHours = Math.max(1, Number(task?.recurrenceConfig?.intervalHours) || 24);
      const startPct = Math.min(100, (hour / totalHours) * 100);
      const maxWidthPct = Math.max(0, 100 - startPct);
      const rawWidthPct = (intervalHours / totalHours) * 100;
      const widthPct = Math.max(0, Math.min(maxWidthPct, rawWidthPct));
      const seg = document.createElement("span");
      seg.className = "plate-row-progress__seg plate-row-progress__seg--recur progress-task-link";
      seg.dataset.taskKey = taskKey;
      if (done) seg.classList.add("is-done");
      seg.style.left = `${startPct}%`;
      seg.style.width = `${widthPct}%`;
      seg.title = task?.baseLabel || task?.label || `Recurring step ${idx + 1}`;
      recurLayer.appendChild(seg);
    });
    progress.appendChild(recurLayer);
  }
  if (recurringList.length) {
    const markerLayer = document.createElement("span");
    markerLayer.className = "plate-row-progress__markers";
    recurringList.forEach((task, idx) => {
      const taskKey = String(task?.key || "");
      const done = !!statusMap[taskKey];
      const hour = Number(task?.hour) || 0;
      const pct = Math.min(100, (hour / totalHours) * 100);
      const marker = document.createElement("span");
      marker.className = "plate-row-progress__marker plate-row-progress__marker--recur";
      marker.classList.add("progress-task-link");
      marker.dataset.taskKey = taskKey;
      marker.style.left = `${pct}%`;
      marker.classList.toggle("is-done", done);
      marker.title = task?.baseLabel || task?.label || `Recurring step ${idx + 1}`;
      markerLayer.appendChild(marker);
    });
    progress.appendChild(markerLayer);
  }
  if (!progress.childElementCount) return;
  bar.appendChild(progress);
}

function updateTaskAlerts() {
  const nodes = canvas.querySelectorAll(".drop");
  nodes.forEach((node) => {
    if (!isNodeInActiveWorkspace(node)) return;
    if (isMultiWellPlateNode(node)) {
      node.classList.remove("drop--overdue-alert");
      try {
        syncPlateNodeFromGroups(node);
        renderNodeTasks(node);
      } catch (err) {
        console.warn("Failed to sync plate node during task refresh", err);
        renderPlateNodeOverlay(node);
      }
      return;
    }
    const { plan, adds, rems, recurringTasks } = readNodeTaskPlans(node);
    let statusMap = {};
    let completionMap = {};
    try {
      statusMap = node.dataset.taskStatus ? JSON.parse(node.dataset.taskStatus) : {};
      completionMap = node.dataset.taskCompletedAt ? JSON.parse(node.dataset.taskCompletedAt) : {};
    } catch {
      statusMap = {};
      completionMap = {};
    }
    const tasks = buildTasks(plan, adds, rems, recurringTasks);
    setVesselDishOverdueState(node, tasks, statusMap);
    const chipMap = new Map();
    node.querySelectorAll(".task-chip").forEach((chip) => {
      const key = chip.dataset.taskKey;
      if (key) chipMap.set(key, chip);
    });
    tasks.forEach((task) => {
      const chip = chipMap.get(task.key);
      if (!chip) return;
      const cb = chip.querySelector('input[type="checkbox"]');
      if (!cb) return;
      const overdue = !cb.checked && isTaskOverdue(node, task);
      chip.classList.toggle("task-chip--alert", overdue);
      if (cb.checked) {
        const labelSpan = chip.querySelector(".task-label");
        const deltaSpan = chip.querySelector(".task-delta");
        if (labelSpan) labelSpan.textContent = task.baseLabel;
        if (deltaSpan) {
          deltaSpan.textContent = describeDelta(node, task, completionMap[task.key]);
          deltaSpan.style.display = deltaSpan.textContent ? "inline" : "none";
        }
      }
    });
    renderProgressBar(node, plan, statusMap, adds, rems, recurringTasks);
  });
}

const ROW_HEIGHT = 32;
function snapY(y, node = null, heightOverride = null) {
  const minY = TIMELINE_HEIGHT + 12;
  const derivedHeight = Number.isFinite(heightOverride) && heightOverride > 0
    ? heightOverride
    : getNodeVisualHeight(node, MIN_NODE_WIDTH);
  const maxY = getCanvasMaxTopForHeight(derivedHeight);
  const clamped = clamp(y, minY, maxY);
  const offset = clamped - minY;
  const row = Math.round(offset / ROW_HEIGHT);
  return { y: minY + row * ROW_HEIGHT };
}

function buildOrthogonalPoints(from, to) {
  const start = { x: roundCoord(from.x), y: roundCoord(from.y) };
  const end = { x: roundCoord(to.x), y: roundCoord(to.y) };

  const sideToSideLink = isHorizontalDirection(from.dir) && isHorizontalDirection(to.dir);
  if (sideToSideLink && Math.abs(start.y - end.y) <= HORIZONTAL_LINK_Y_TOLERANCE) {
    const alignedY = roundCoord((start.y + end.y) / 2);
    start.y = alignedY;
    end.y = alignedY;
    if (!isSegmentBlockedByObstacles(start, end, from.node, to.node)) {
      return mergeCollinear([start, end]);
    }
  }

  // If aligned horizontally, draw straight line.
  if (Math.abs(start.y - end.y) < 0.5) {
    if (!isSegmentBlockedByObstacles(start, end, from.node, to.node)) {
      return mergeCollinear([start, end]);
    }
  }

  const startOffset = resolveEndpointOffset(start, from.dir, from.node, to.node);
  const endOffset = resolveEndpointOffset(end, to.dir, from.node, to.node);

  const obstacleAwarePath = findObstacleAwarePath(startOffset, endOffset, from.node, to.node);
  const pts = [start];
  if (obstacleAwarePath.length >= 2) {
    pts.push(...obstacleAwarePath);
  } else {
    pts.push(startOffset);
    const via = chooseMidPoints(startOffset, endOffset, from.dir, to.dir);
    pts.push(...via);
    pts.push(endOffset);
  }
  pts.push(end);

  return mergeCollinear(pts);
}

function isHorizontalDirection(dir) {
  return dir === "left" || dir === "right";
}

function stepFromDir(point, dir, distance) {
  const delta = Math.abs(distance);
  switch (dir) {
    case "top":
      return { x: point.x, y: point.y - delta };
    case "bottom":
      return { x: point.x, y: point.y + delta };
    case "left":
      return { x: point.x - delta, y: point.y };
    case "right":
      return { x: point.x + delta, y: point.y };
    default:
      return { ...point };
  }
}

function resolveEndpointOffset(anchor, dir, sourceNode = null, targetNode = null) {
  const minDistance = 8;
  const maxDistance = CONNECT_OFFSET;
  for (let dist = minDistance; dist <= maxDistance; dist += 2) {
    const candidate = stepFromDir(anchor, dir, dist);
    if (!isSegmentBlockedByObstacles(anchor, candidate, sourceNode, targetNode)) {
      return candidate;
    }
  }
  return { ...anchor };
}

function chooseMidPoints(a, b, fromDir = "", toDir = "") {
  const points = [];
  // If already aligned horizontally or vertically, single straight segment.
  if (a.x === b.x || a.y === b.y) {
    points.push({ x: b.x, y: b.y });
    return points;
  }

  const fromHorizontal = isHorizontalDirection(fromDir);
  const toHorizontal = isHorizontalDirection(toDir);
  if (fromHorizontal && toHorizontal) {
    const midX = roundCoord((a.x + b.x) / 2);
    points.push({ x: midX, y: a.y }, { x: midX, y: b.y });
    return points;
  }
  if (!fromHorizontal && !toHorizontal) {
    const midY = roundCoord((a.y + b.y) / 2);
    points.push({ x: a.x, y: midY }, { x: b.x, y: midY });
    return points;
  }

  // Mixed orientation: make a single elbow from the source orientation.
  if (fromHorizontal) points.push({ x: b.x, y: a.y });
  else points.push({ x: a.x, y: b.y });
  return points;
}

function findObstacleAwarePath(startPoint, endPoint, sourceNode = null, targetNode = null) {
  const bounds = getRoutingBounds();
  const start = clampPointToBounds(startPoint, bounds);
  const end = clampPointToBounds(endPoint, bounds);
  const obstacles = collectRoutingObstacles(sourceNode, targetNode, bounds, {
    includeSource: true,
    includeTarget: true,
    endpointPadding: ROUTE_ENDPOINT_PADDING
  });
  const gridRoute = findObstacleAwareGridRoute(start, end, obstacles, bounds);
  if (!Array.isArray(gridRoute) || gridRoute.length < 2) {
    return [start, end];
  }

  const routed = [];
  const pushUnique = (point) => {
    const x = roundCoord(point.x);
    const y = roundCoord(point.y);
    const prev = routed[routed.length - 1];
    if (prev && Math.abs(prev.x - x) < 0.1 && Math.abs(prev.y - y) < 0.1) return;
    routed.push({ x, y });
  };

  pushUnique(start);
  for (let i = 1; i < gridRoute.length - 1; i += 1) {
    const p = gridRoute[i];
    const prev = routed[routed.length - 1];
    if (!prev) {
      pushUnique(p);
      continue;
    }
    if (Math.abs(prev.x - p.x) > 0.1 && Math.abs(prev.y - p.y) > 0.1) {
      pushUnique({ x: p.x, y: prev.y });
    }
    pushUnique(p);
  }
  const beforeEnd = routed[routed.length - 1];
  if (beforeEnd && Math.abs(beforeEnd.x - end.x) > 0.1 && Math.abs(beforeEnd.y - end.y) > 0.1) {
    pushUnique({ x: beforeEnd.x, y: end.y });
  }
  pushUnique(end);
  return reduceUnnecessaryTurns(
    simplifyOrthogonalPath(mergeCollinear(routed), sourceNode, targetNode),
    sourceNode, targetNode
  );
}

function simplifyOrthogonalPath(points, sourceNode, targetNode) {
  if (points.length <= 2) return points;
  const result = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1];
    const next = points[i + 1];
    // Check if we can skip the current waypoint via a direct orthogonal segment
    const sameX = Math.abs(prev.x - next.x) < 0.1;
    const sameY = Math.abs(prev.y - next.y) < 0.1;
    if ((sameX || sameY) && !isSegmentBlockedByObstacles(prev, next, sourceNode, targetNode)) {
      continue; // Skip this point — direct path is clear
    }
    result.push(points[i]);
  }
  result.push(points[points.length - 1]);
  return result;
}

function reduceUnnecessaryTurns(points, sourceNode, targetNode) {
  if (points.length <= 3) return points;
  const result = [points[0]];
  let i = 1;
  while (i < points.length - 1) {
    let skipped = false;
    if (i + 2 < points.length) {
      const from = result[result.length - 1];
      const skipTo = points[i + 2];
      for (const bend of [{ x: from.x, y: skipTo.y }, { x: skipTo.x, y: from.y }]) {
        if (!isSegmentBlockedByObstacles(from, bend, sourceNode, targetNode) &&
            !isSegmentBlockedByObstacles(bend, skipTo, sourceNode, targetNode)) {
          result.push(bend);
          i += 2;
          skipped = true;
          break;
        }
      }
    }
    if (!skipped) { result.push(points[i]); i++; }
  }
  result.push(points[points.length - 1]);
  return mergeCollinear(result);
}

function polylinePointsToRoundedPath(points, cornerRadius) {
  if (!points || points.length < 2) return "";
  if (points.length === 2) {
    return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;
  }
  const r = cornerRadius || ROUTE_CORNER_RADIUS;
  let d = `M${points[0].x},${points[0].y}`;
  for (let j = 1; j < points.length - 1; j++) {
    const prev = points[j - 1];
    const curr = points[j];
    const next = points[j + 1];
    const dx1 = curr.x - prev.x, dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x, dy2 = next.y - curr.y;
    const len1 = Math.hypot(dx1, dy1);
    const len2 = Math.hypot(dx2, dy2);
    const actualR = Math.min(r, len1 / 2, len2 / 2);
    if (actualR < 1 || len1 < 1 || len2 < 1) {
      d += ` L${curr.x},${curr.y}`;
      continue;
    }
    const bx = curr.x - (dx1 / len1) * actualR;
    const by = curr.y - (dy1 / len1) * actualR;
    const ax = curr.x + (dx2 / len2) * actualR;
    const ay = curr.y + (dy2 / len2) * actualR;
    const cross = dx1 * dy2 - dy1 * dx2;
    const sweep = cross > 0 ? 1 : 0;
    d += ` L${bx},${by} A${actualR},${actualR} 0 0 ${sweep} ${ax},${ay}`;
  }
  d += ` L${points[points.length - 1].x},${points[points.length - 1].y}`;
  return d;
}

function isSegmentBlockedByObstacles(start, end, sourceNode = null, targetNode = null) {
  const bounds = getRoutingBounds();
  const a = clampPointToBounds(start, bounds);
  const b = clampPointToBounds(end, bounds);
  const obstacles = collectRoutingObstacles(sourceNode, targetNode, bounds, {
    includeSource: true,
    includeTarget: true,
    endpointPadding: ROUTE_ENDPOINT_PADDING
  });
  const vertical = Math.abs(a.x - b.x) < 0.1;
  const horizontal = Math.abs(a.y - b.y) < 0.1;
  if (!vertical && !horizontal) return true;
  return obstacles.some((rect) => {
    if (vertical) {
      const x = a.x;
      if (x < rect.left || x > rect.right) return false;
      const segMin = Math.min(a.y, b.y);
      const segMax = Math.max(a.y, b.y);
      return segMax >= rect.top && segMin <= rect.bottom;
    }
    const y = a.y;
    if (y < rect.top || y > rect.bottom) return false;
    const segMin = Math.min(a.x, b.x);
    const segMax = Math.max(a.x, b.x);
    return segMax >= rect.left && segMin <= rect.right;
  });
}

function getRoutingBounds() {
  const minX = 6;
  const minY = TIMELINE_HEIGHT + 6;
  const maxX = Math.max(minX + 1, canvas.clientWidth - 6);
  const maxY = Math.max(minY + 1, canvas.clientHeight - 6);
  return { minX, minY, maxX, maxY };
}

function clampPointToBounds(point, bounds) {
  return {
    x: clamp(roundCoord(point.x), bounds.minX, bounds.maxX),
    y: clamp(roundCoord(point.y), bounds.minY, bounds.maxY)
  };
}

function collectRoutingObstacles(sourceNode, targetNode, bounds, options = {}) {
  const out = [];
  const srcId = String(sourceNode?.dataset?.nodeId || "");
  const dstId = String(targetNode?.dataset?.nodeId || "");
  const includeSource = !!options?.includeSource;
  const includeTarget = !!options?.includeTarget;
  const endpointPaddingRaw = Number(options?.endpointPadding);
  const endpointPadding = Number.isFinite(endpointPaddingRaw) && endpointPaddingRaw >= 0
    ? endpointPaddingRaw
    : ROUTE_ENDPOINT_PADDING;
  canvas.querySelectorAll(".drop").forEach((node) => {
    if (!node) return;
    if (!isNodeInActiveWorkspace(node)) return;
    const id = String(node.dataset.nodeId || "");
    if (!id) return;
    if (id === srcId && !includeSource) return;
    if (id === dstId && !includeTarget) return;
    const width = node.offsetWidth;
    const height = node.offsetHeight;
    const left = node.offsetLeft;
    const top = node.offsetTop;
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
    const isEndpointNode = id === srcId || id === dstId;
    const padding = isEndpointNode ? endpointPadding : ROUTE_NODE_PADDING;
    const padded = {
      left: left - padding,
      right: left + width + padding,
      top: top - padding,
      bottom: top + height + padding
    };
    if (padded.right < bounds.minX || padded.left > bounds.maxX) return;
    if (padded.bottom < bounds.minY || padded.top > bounds.maxY) return;
    out.push(padded);
  });
  return out;
}

function findObstacleAwareGridRoute(start, end, obstacles, bounds) {
  const cols = Math.max(1, Math.round((bounds.maxX - bounds.minX) / ROUTE_GRID_SIZE));
  const rows = Math.max(1, Math.round((bounds.maxY - bounds.minY) / ROUTE_GRID_SIZE));
  const toGrid = (point) => ({
    gx: clamp(Math.round((point.x - bounds.minX) / ROUTE_GRID_SIZE), 0, cols),
    gy: clamp(Math.round((point.y - bounds.minY) / ROUTE_GRID_SIZE), 0, rows)
  });
  const fromGrid = (cell) => ({
    x: clamp(bounds.minX + cell.gx * ROUTE_GRID_SIZE, bounds.minX, bounds.maxX),
    y: clamp(bounds.minY + cell.gy * ROUTE_GRID_SIZE, bounds.minY, bounds.maxY)
  });

  const blocked = new Set();
  const markBlocked = (gx, gy) => {
    blocked.add(`${gx}:${gy}`);
  };

  obstacles.forEach((rect) => {
    const minGX = clamp(Math.floor((rect.left - bounds.minX) / ROUTE_GRID_SIZE), 0, cols);
    const maxGX = clamp(Math.ceil((rect.right - bounds.minX) / ROUTE_GRID_SIZE), 0, cols);
    const minGY = clamp(Math.floor((rect.top - bounds.minY) / ROUTE_GRID_SIZE), 0, rows);
    const maxGY = clamp(Math.ceil((rect.bottom - bounds.minY) / ROUTE_GRID_SIZE), 0, rows);
    for (let gx = minGX; gx <= maxGX; gx += 1) {
      for (let gy = minGY; gy <= maxGY; gy += 1) {
        markBlocked(gx, gy);
      }
    }
  });

  const startCell = toGrid(start);
  const endCell = toGrid(end);
  blocked.delete(`${startCell.gx}:${startCell.gy}`);
  blocked.delete(`${endCell.gx}:${endCell.gy}`);

  const dirs = [
    { dx: 1, dy: 0, id: "R" },
    { dx: -1, dy: 0, id: "L" },
    { dx: 0, dy: 1, id: "D" },
    { dx: 0, dy: -1, id: "U" }
  ];
  const heuristic = (gx, gy) => Math.abs(gx - endCell.gx) + Math.abs(gy - endCell.gy);
  const stateKey = (gx, gy, dir) => `${gx}:${gy}:${dir}`;

  const open = [];
  const gScore = new Map();
  const fScore = new Map();
  const cameFrom = new Map();
  const stateMeta = new Map();

  const startKey = stateKey(startCell.gx, startCell.gy, "S");
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(startCell.gx, startCell.gy));
  stateMeta.set(startKey, { gx: startCell.gx, gy: startCell.gy, dir: "S" });
  open.push(startKey);

  let visited = 0;
  while (open.length && visited < ROUTE_MAX_VISITED) {
    visited += 1;
    let bestIdx = 0;
    let bestF = Number.POSITIVE_INFINITY;
    for (let i = 0; i < open.length; i += 1) {
      const key = open[i];
      const score = fScore.get(key) ?? Number.POSITIVE_INFINITY;
      if (score < bestF) {
        bestF = score;
        bestIdx = i;
      }
    }
    const currentKey = open.splice(bestIdx, 1)[0];
    const current = stateMeta.get(currentKey);
    if (!current) continue;
    if (current.gx === endCell.gx && current.gy === endCell.gy) {
      const cells = [];
      let traceKey = currentKey;
      while (traceKey) {
        const trace = stateMeta.get(traceKey);
        if (trace) {
          cells.push({ gx: trace.gx, gy: trace.gy });
        }
        traceKey = cameFrom.get(traceKey) || "";
      }
      cells.reverse();
      const points = cells.map(fromGrid);
      if (points.length) {
        points[0] = { x: start.x, y: start.y };
        points[points.length - 1] = { x: end.x, y: end.y };
      }
      return points;
    }

    for (const nextDir of dirs) {
      const ngx = current.gx + nextDir.dx;
      const ngy = current.gy + nextDir.dy;
      if (ngx < 0 || ngx > cols || ngy < 0 || ngy > rows) continue;
      const blockedKey = `${ngx}:${ngy}`;
      if (blocked.has(blockedKey)) continue;
      const turnPenalty = current.dir === "S" || current.dir === nextDir.id ? 0 : ROUTE_TURN_PENALTY;
      const tentativeG = (gScore.get(currentKey) ?? Number.POSITIVE_INFINITY) + 1 + turnPenalty;
      const neighborKey = stateKey(ngx, ngy, nextDir.id);
      if (tentativeG >= (gScore.get(neighborKey) ?? Number.POSITIVE_INFINITY)) continue;

      cameFrom.set(neighborKey, currentKey);
      gScore.set(neighborKey, tentativeG);
      fScore.set(neighborKey, tentativeG + heuristic(ngx, ngy));
      stateMeta.set(neighborKey, { gx: ngx, gy: ngy, dir: nextDir.id });
      if (!open.includes(neighborKey)) open.push(neighborKey);
    }
  }

  return null;
}

function mergeCollinear(points) {
  if (points.length <= 2) return points;
  const result = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const next = points[i + 1];

    const isCollinear =
      (prev.x === curr.x && curr.x === next.x) ||
      (prev.y === curr.y && curr.y === next.y);

    if (isCollinear) {
      continue; // skip middle collinear point
    }
    result.push(curr);
  }
  result.push(points[points.length - 1]);
  return result;
}

function offsetPolyline(points, laneIndex, laneCount, axis = "x") {
  if (laneCount <= 1 || points.length < 2) return points;
  const offsetAmount = (laneIndex - (laneCount - 1) / 2) * LANE_OFFSET;
  const result = points.map((p) => ({ ...p }));
  if (axis === "y") {
    result.forEach((p) => (p.y += offsetAmount));
  } else {
    result.forEach((p) => (p.x += offsetAmount));
  }
  return result;
}

function roundCoord(n) {
  return Math.round(n * 10) / 10;
}

function rangeKey(a, b) {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return `${roundCoord(min)}-${roundCoord(max)}`;
}
  mediaForm.removalForm.querySelector("[data-add-removal]").addEventListener("click", () => {
    const type = mediaForm.removalForm.querySelector("#removalTypeInput").value;
    const hourVal = parseInt(mediaForm.removalForm.querySelector("#removalHourInput").value, 10);
    const washBefore = mediaForm.removalForm.querySelector("#washBeforeInput").value.trim();
    const washAfter = mediaForm.removalForm.querySelector("#washAfterInput").value.trim();
    if (Number.isNaN(hourVal) || hourVal < 0) return;
    removalsWorking.push({ type, hour: hourVal, washBefore, washAfter });
    renderRemovalsList();
    renderMediaTimeline();
    mediaForm.removalForm.querySelector("#removalHourInput").value = "";
    mediaForm.removalForm.querySelector("#washBeforeInput").value = "";
    mediaForm.removalForm.querySelector("#washAfterInput").value = "";
  });
