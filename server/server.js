"use strict";

const cors = require("cors");
const crypto = require("crypto");
const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const { Pool } = require("pg");
const pgq = require("./backend/pg-queries");

const app = express();

// The server runs as a bundled desktop sidecar — a single unhandled async
// rejection (e.g. a transient file-DB write error) must not take the whole
// backend down and leave the app dead. Log and keep serving instead.
process.on("unhandledRejection", (reason) => {
  console.error("[server] Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[server] Uncaught exception:", err);
});

const ROOT_DIR = __dirname;
const DATA_DIR = resolveDataDir();
const DB_FILE = resolveDbFilePath();

const NODE_ENV = String(process.env.NODE_ENV || "development").trim().toLowerCase() || "development";
const IS_PRODUCTION = NODE_ENV === "production";
const PORT = parseIntEnv(process.env.PORT, 8787, 1, 65535);
const SESSION_TTL_MS = parseIntEnv(process.env.SESSION_TTL_MS, 1000 * 60 * 60 * 24 * 30, 1000 * 60, 1000 * 60 * 60 * 24 * 365);
const AUTH_RATE_WINDOW_MS = parseIntEnv(process.env.AUTH_RATE_WINDOW_MS, 1000 * 60, 1000, 1000 * 60 * 60);
const AUTH_RATE_LIMIT_MAX = parseIntEnv(process.env.AUTH_RATE_LIMIT_MAX, 90, 1, 10000);
const API_RATE_WINDOW_MS = parseIntEnv(process.env.API_RATE_WINDOW_MS, 1000 * 60, 1000, 1000 * 60 * 60);
const API_RATE_LIMIT_MAX = parseIntEnv(process.env.API_RATE_LIMIT_MAX, 600, 1, 20000);
const API_JSON_LIMIT = String(process.env.API_JSON_LIMIT || "2mb").trim() || "2mb";
const MAX_CANVAS_DATA_BYTES = parseIntEnv(process.env.MAX_CANVAS_DATA_BYTES, 10 * 1024 * 1024, 1024, 50 * 1024 * 1024);
// PG_WRITE_LOCK_KEY removed — per-row pgq.* queries don't need advisory locks.
const STRIPE_SECRET_KEY = String(process.env.STRIPE_SECRET_KEY || "").trim();
const STRIPE_PUBLISHABLE_KEY = String(process.env.STRIPE_PUBLISHABLE_KEY || "").trim();
const STRIPE_WEBHOOK_SECRET = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
const STRIPE_PRICE_ID = String(process.env.STRIPE_PRICE_ID || "").trim();
const APP_BASE_URL = String(process.env.APP_BASE_URL || "").trim();
const STRIPE_SUCCESS_URL = String(process.env.STRIPE_SUCCESS_URL || "").trim();
const STRIPE_CANCEL_URL = String(process.env.STRIPE_CANCEL_URL || "").trim();
const TRUST_PROXY = parseTrustProxyEnv(process.env.TRUST_PROXY);
const CORS_ALLOWED_ORIGINS = parseCsvEnv(process.env.CORS_ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS || "");
const PASSWORD_HASH_PEPPER = String(process.env.PASSWORD_HASH_PEPPER || "").trim();
const CELLCULTURE_GOOGLE_CLIENT_ID = String(process.env.CELLCULTURE_GOOGLE_CLIENT_ID || "").trim();
const REQUIRE_AUTH = String(process.env.REQUIRE_AUTH || (IS_PRODUCTION ? "true" : "false")).trim().toLowerCase() === "true";
const SESSION_TOKEN_SECRET = String(process.env.SESSION_TOKEN_SECRET || "").trim();
const EFFECTIVE_SESSION_TOKEN_SECRET = SESSION_TOKEN_SECRET || (IS_PRODUCTION ? "" : "local-dev-session-secret");
const SESSION_HASH_PREFIX = "hmac-sha256:";
const PASSWORD_HASH_PREFIX = "scrypt$";
const PASSWORD_SCRYPT_KEYLEN = 64;
const PASSWORD_SCRYPT_OPTIONS = Object.freeze({ N: 16384, r: 8, p: 1 });

const DEFAULT_DB = Object.freeze({
  users: [],
  sessions: [],
  canvases: [],
  shares: [],
  tasks: [],
  syncJobs: [],
  projectStates: [],
  billingAccounts: []
});

const DB_MODE = resolveDbMode();
let pgPool = null;
let stripeClient = null;
let writeChain = Promise.resolve();
const authRateBuckets = new Map();
const apiRateBuckets = new Map();
if (TRUST_PROXY !== false) {
  app.set("trust proxy", TRUST_PROXY);
}
app.post("/api/billing/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const stripe = getStripeClient();
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    res.status(503).json({ error: "Stripe webhook not configured." });
    return;
  }
  const signature = String(req.headers["stripe-signature"] || "").trim();
  if (!signature) {
    res.status(400).json({ error: "Missing stripe-signature header." });
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).json({ error: `Invalid Stripe signature: ${err.message || "unknown error"}` });
    return;
  }

  try {
    if (DB_MODE === "postgres") {
      await applyStripeWebhookEventPostgres(getPgPool(), event);
    } else {
      await withDb((db) => {
        applyStripeWebhookEvent(db, event);
      });
    }
  } catch (err) {
    res.status(500).json({ error: `Webhook processing failed: ${err.message || "unknown error"}` });
    return;
  }

  res.json({ received: true });
});
app.use("/api", cors(buildCorsOptions));
app.use(express.json({ limit: API_JSON_LIMIT }));
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Content-Security-Policy", buildContentSecurityPolicy());
  if (String(req.headers["x-forwarded-proto"] || req.protocol || "").startsWith("https")) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

app.use("/api", rateLimitApi);
app.use("/api", verifyRequestOriginForStateChanges);
app.use(rateLimitAuth);

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function makeId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function makeSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function timingSafeEqualString(a, b) {
  const aa = String(a || "");
  const bb = String(b || "");
  const aBuf = Buffer.from(aa, "utf8");
  const bBuf = Buffer.from(bb, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function hashSessionToken(token) {
  return crypto.createHmac("sha256", EFFECTIVE_SESSION_TOKEN_SECRET).update(String(token || "")).digest("hex");
}

function encodeStoredSessionToken(token) {
  return `${SESSION_HASH_PREFIX}${hashSessionToken(token)}`;
}

async function verifyGoogleIdToken(idToken) {
  if (!CELLCULTURE_GOOGLE_CLIENT_ID) {
    return { ok: false, error: "Google sign-in is not configured on this server." };
  }
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  } catch (err) {
    return { ok: false, error: `Google token verification failed: ${err.message || "network error"}` };
  }
  if (!response.ok) {
    return { ok: false, error: "Invalid or expired Google token." };
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, error: "Failed to parse Google token response." };
  }
  if (payload.aud !== CELLCULTURE_GOOGLE_CLIENT_ID) {
    return { ok: false, error: "Token audience does not match configured client ID." };
  }
  const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
  if (!validIssuers.includes(payload.iss)) {
    return { ok: false, error: "Invalid token issuer." };
  }
  return {
    ok: true,
    email: String(payload.email || "").trim().toLowerCase(),
    emailVerified: payload.email_verified === "true" || payload.email_verified === true,
    name: String(payload.name || payload.given_name || "").trim(),
    googleSub: String(payload.sub || "").trim()
  };
}

function isStoredSessionTokenHash(tokenValue) {
  return String(tokenValue || "").startsWith(SESSION_HASH_PREFIX);
}

function sessionTokenMatches(storedToken, incomingToken) {
  const stored = String(storedToken || "");
  const incoming = String(incomingToken || "");
  if (!stored || !incoming) return false;
  if (isStoredSessionTokenHash(stored)) {
    return timingSafeEqualString(stored, encodeStoredSessionToken(incoming));
  }
  // Legacy plaintext token support for backward compatibility.
  return timingSafeEqualString(stored, incoming);
}

function makePasswordHash(password) {
  const salt = crypto.randomBytes(16).toString("base64");
  const secret = `${String(password || "")}${PASSWORD_HASH_PEPPER}`;
  const derived = crypto.scryptSync(secret, salt, PASSWORD_SCRYPT_KEYLEN, PASSWORD_SCRYPT_OPTIONS).toString("base64");
  return `${PASSWORD_HASH_PREFIX}${salt}$${derived}`;
}

function isPasswordHash(value) {
  return String(value || "").startsWith(PASSWORD_HASH_PREFIX);
}

function verifyPasswordHash(password, storedHash) {
  const stored = String(storedHash || "");
  if (!isPasswordHash(stored)) return false;
  const pieces = stored.split("$");
  if (pieces.length !== 3) return false;
  const salt = pieces[1];
  const hash = pieces[2];
  if (!salt || !hash) return false;
  const secret = `${String(password || "")}${PASSWORD_HASH_PEPPER}`;
  const derived = crypto.scryptSync(secret, salt, PASSWORD_SCRYPT_KEYLEN, PASSWORD_SCRYPT_OPTIONS).toString("base64");
  return timingSafeEqualString(hash, derived);
}

function resolveDbMode() {
  const forced = String(process.env.DB_PROVIDER || "").trim().toLowerCase();
  if (forced === "postgres" || forced === "postgresql" || forced === "pg") return "postgres";
  if (forced === "file" || forced === "json") return "file";
  return process.env.DATABASE_URL ? "postgres" : "file";
}

function resolveDataDir() {
  const explicit = String(process.env.DATA_DIR || "").trim();
  if (!explicit) return path.join(ROOT_DIR, "backend", "data");
  return path.isAbsolute(explicit) ? explicit : path.resolve(ROOT_DIR, explicit);
}

function resolveDbFilePath() {
  const explicit = String(process.env.DB_FILE_PATH || "").trim();
  if (explicit) {
    return path.isAbsolute(explicit) ? explicit : path.resolve(ROOT_DIR, explicit);
  }
  return path.join(DATA_DIR, "db.json");
}

function parseBooleanEnv(value, defaultValue = false) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return defaultValue;
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function parseIntEnv(value, defaultValue, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY) {
  const num = Number.parseInt(String(value ?? "").trim(), 10);
  if (!Number.isFinite(num)) return defaultValue;
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

function parseCsvEnv(value) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseTrustProxyEnv(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  const normalized = raw.toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on") return true;
  if (normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off") return false;
  const numeric = Number.parseInt(raw, 10);
  if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  return raw;
}

function normalizeOrigin(origin) {
  const candidate = String(origin || "").trim();
  if (!candidate) return "";
  try {
    return new URL(candidate).origin;
  } catch {
    return "";
  }
}

function originMatchesHost(origin, req) {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  if (!host) return false;
  const protocol = String(req.headers["x-forwarded-proto"] || req.protocol || "http")
    .split(",")[0]
    .trim()
    .toLowerCase();
  return normalized.toLowerCase() === `${protocol}://${host}`;
}

function isAllowedRequestOrigin(origin, req) {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  if (originMatchesHost(normalized, req)) return true;
  if (APP_BASE_URL && normalizeOrigin(APP_BASE_URL).toLowerCase() === normalized.toLowerCase()) return true;
  if (CORS_ALLOWED_ORIGINS.includes("*")) return true;
  return CORS_ALLOWED_ORIGINS.some((candidate) => normalizeOrigin(candidate).toLowerCase() === normalized.toLowerCase());
}

function buildCorsOptions(req, callback) {
  const origin = String(req.headers.origin || "").trim();
  const allowOrigin = !!origin && isAllowedRequestOrigin(origin, req);
  callback(null, {
    origin: allowOrigin,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    maxAge: 600
  });
}

function buildContentSecurityPolicy() {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://accounts.google.com",
    "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline'"
  ];
  if (IS_PRODUCTION) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

function isStateChangingMethod(method) {
  const value = String(method || "").toUpperCase();
  return value === "POST" || value === "PUT" || value === "PATCH" || value === "DELETE";
}

function verifyRequestOriginForStateChanges(req, res, next) {
  if (!isStateChangingMethod(req.method)) {
    next();
    return;
  }
  if (req.path === "/api/billing/webhook") {
    next();
    return;
  }
  const origin = String(req.headers.origin || "").trim();
  if (!origin) {
    next();
    return;
  }
  if (!isAllowedRequestOrigin(origin, req)) {
    res.status(403).json({ error: "Cross-origin state-changing request denied." });
    return;
  }
  next();
}

function touchRateBucket(buckets, key, windowMs, maxInWindow) {
  const now = Date.now();
  const existing = buckets.get(key) || { count: 0, windowStart: now };
  const inWindow = now - existing.windowStart <= windowMs;
  const bucket = inWindow ? existing : { count: 0, windowStart: now };
  bucket.count += 1;
  buckets.set(key, bucket);
  return bucket.count <= maxInWindow;
}

function pruneRateBuckets() {
  const now = Date.now();
  const authCutoff = now - AUTH_RATE_WINDOW_MS;
  const apiCutoff = now - API_RATE_WINDOW_MS;
  for (const [key, bucket] of authRateBuckets.entries()) {
    if (!bucket || bucket.windowStart < authCutoff) authRateBuckets.delete(key);
  }
  for (const [key, bucket] of apiRateBuckets.entries()) {
    if (!bucket || bucket.windowStart < apiCutoff) apiRateBuckets.delete(key);
  }
}

function rateLimitAuth(req, res, next) {
  const pathName = String(req.path || "");
  if (!pathName.startsWith("/api/auth/")) {
    next();
    return;
  }
  const key = `${req.ip || "unknown"}:${pathName}`;
  const ok = touchRateBucket(authRateBuckets, key, AUTH_RATE_WINDOW_MS, AUTH_RATE_LIMIT_MAX);
  if (!ok) {
    res.status(429).json({ error: "Too many authentication attempts. Please retry shortly." });
    return;
  }
  next();
}

function rateLimitApi(req, res, next) {
  const key = `${req.ip || "unknown"}:${req.method}:${req.path}`;
  const ok = touchRateBucket(apiRateBuckets, key, API_RATE_WINDOW_MS, API_RATE_LIMIT_MAX);
  if (!ok) {
    res.status(429).json({ error: "Too many API requests. Please retry shortly." });
    return;
  }
  next();
}

function getPgPool() {
  if (DB_MODE !== "postgres") return null;
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set when DB_PROVIDER is postgres.");
  }
  if (pgPool) return pgPool;
  const enableSsl = parseBooleanEnv(process.env.PGSSL, false);
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: enableSsl
      ? {
          rejectUnauthorized: parseBooleanEnv(process.env.PGSSL_REJECT_UNAUTHORIZED, false)
        }
      : undefined
  });
  return pgPool;
}

function getStripeClient() {
  if (!STRIPE_SECRET_KEY) return null;
  if (stripeClient) return stripeClient;
  // Lazy-load Stripe so local development without billing config does not require initialization.
  // eslint-disable-next-line global-require
  const Stripe = require("stripe");
  stripeClient = new Stripe(STRIPE_SECRET_KEY);
  return stripeClient;
}

function resolveAppBaseUrl(req = null) {
  if (APP_BASE_URL) return APP_BASE_URL.replace(/\/+$/, "");
  const proto = String(req?.headers["x-forwarded-proto"] || req?.protocol || "http").split(",")[0].trim();
  const host = String(req?.headers["x-forwarded-host"] || req?.headers.host || `localhost:${PORT}`)
    .split(",")[0]
    .trim();
  return `${proto}://${host}`.replace(/\/+$/, "");
}

function stripeConfiguredForCheckout() {
  return !!(STRIPE_SECRET_KEY && STRIPE_PRICE_ID);
}

function stripeConfiguredForPortal() {
  return !!STRIPE_SECRET_KEY;
}

function cleanRole(value) {
  if (value === "owner" || value === "editor" || value === "viewer") return value;
  return "viewer";
}

function roleRank(role) {
  if (role === "owner") return 3;
  if (role === "editor") return 2;
  return 1;
}

function hasAccess(actualRole, minimumRole) {
  return roleRank(actualRole) >= roleRank(minimumRole);
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email || "",
    authProvider: user.authProvider || "local",
    admin: !!user.admin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function sanitizeCanvas(canvas, role) {
  return {
    id: canvas.id,
    name: canvas.name,
    ownerUserId: canvas.ownerUserId,
    role,
    createdAt: canvas.createdAt,
    updatedAt: canvas.updatedAt
  };
}

function sanitizeShare(share, user) {
  return {
    id: share.id,
    canvasId: share.canvasId,
    role: share.role,
    user: user ? sanitizeUser(user) : null,
    createdAt: share.createdAt,
    updatedAt: share.updatedAt
  };
}

function sanitizeTask(task, assignee, creator) {
  return {
    id: task.id,
    canvasId: task.canvasId,
    title: task.title,
    dueAt: task.dueAt || null,
    status: task.status,
    metadata: task.metadata || {},
    assignee: assignee ? sanitizeUser(assignee) : null,
    createdBy: creator ? sanitizeUser(creator) : null,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
}

function toIsoOrNow(value) {
  const dt = new Date(value || nowIso());
  if (Number.isFinite(dt.getTime())) return dt.toISOString();
  return nowIso();
}

function toOptionalIso(value) {
  if (value === null || value === undefined || value === "") return null;
  const dt = new Date(value);
  if (Number.isFinite(dt.getTime())) return dt.toISOString();
  return null;
}

function parseObjectField(value, fallback = {}) {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function normalizeDbShape(parsed) {
  const source = parsed && typeof parsed === "object" ? parsed : {};
  return {
    users: Array.isArray(source.users) ? source.users : [],
    sessions: Array.isArray(source.sessions) ? source.sessions : [],
    canvases: Array.isArray(source.canvases) ? source.canvases : [],
    shares: Array.isArray(source.shares) ? source.shares : [],
    tasks: Array.isArray(source.tasks) ? source.tasks : [],
    syncJobs: Array.isArray(source.syncJobs) ? source.syncJobs : [],
    projectStates: Array.isArray(source.projectStates) ? source.projectStates : [],
    billingAccounts: Array.isArray(source.billingAccounts) ? source.billingAccounts : []
  };
}

function mapUserRow(row) {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || "",
    authProvider: row.auth_provider || "local",
    googleSub: row.google_sub || "",
    pass: row.pass || "",
    admin: !!row.admin,
    createdAt: toIsoOrNow(row.created_at),
    updatedAt: toIsoOrNow(row.updated_at)
  };
}

function mapSessionRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    token: row.token,
    provider: row.provider || "local",
    createdAt: toIsoOrNow(row.created_at),
    expiresAt: toIsoOrNow(row.expires_at)
  };
}

function mapCanvasRow(row) {
  return {
    id: row.id,
    name: row.name || "Untitled Canvas",
    ownerUserId: row.owner_user_id,
    data: parseObjectField(row.data, {}),
    version: parseInt(row.version, 10) || 1,
    createdAt: toIsoOrNow(row.created_at),
    updatedAt: toIsoOrNow(row.updated_at)
  };
}

function mapShareRow(row) {
  return {
    id: row.id,
    canvasId: row.canvas_id,
    userId: row.user_id,
    role: cleanRole(row.role),
    createdAt: toIsoOrNow(row.created_at),
    updatedAt: toIsoOrNow(row.updated_at)
  };
}

function mapTaskRow(row) {
  return {
    id: row.id,
    canvasId: row.canvas_id,
    title: row.title || "",
    dueAt: toOptionalIso(row.due_at),
    status: row.status || "open",
    metadata: parseObjectField(row.metadata, {}),
    assignedToUserId: row.assigned_to_user_id || null,
    createdByUserId: row.created_by_user_id || null,
    createdAt: toIsoOrNow(row.created_at),
    updatedAt: toIsoOrNow(row.updated_at)
  };
}

function mapSyncJobRow(row) {
  return {
    id: row.id,
    type: row.type || "unknown",
    status: row.status || "queued",
    canvasId: row.canvas_id || null,
    taskId: row.task_id || null,
    requestedByUserId: row.requested_by_user_id || null,
    payload: parseObjectField(row.payload, {}),
    note: row.note || "",
    createdAt: toIsoOrNow(row.created_at),
    updatedAt: toIsoOrNow(row.updated_at)
  };
}

function mapProjectStateRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: String(row.project_id || "default-project"),
    inventory: Array.isArray(parseObjectField(row.inventory, [])) ? parseObjectField(row.inventory, []) : [],
    storage: Array.isArray(parseObjectField(row.storage, [])) ? parseObjectField(row.storage, []) : [],
    storageBoxes: Array.isArray(parseObjectField(row.storage_boxes, [])) ? parseObjectField(row.storage_boxes, []) : [],
    mediaFormulations: Array.isArray(parseObjectField(row.media_formulations, [])) ? parseObjectField(row.media_formulations, []) : [],
    createdAt: toIsoOrNow(row.created_at),
    updatedAt: toIsoOrNow(row.updated_at)
  };
}

function mapBillingAccountRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    stripeCustomerId: row.stripe_customer_id || "",
    stripeSubscriptionId: row.stripe_subscription_id || "",
    stripePriceId: row.stripe_price_id || "",
    subscriptionStatus: row.subscription_status || "free",
    currentPeriodEnd: toOptionalIso(row.current_period_end),
    cancelAtPeriodEnd: !!row.cancel_at_period_end,
    latestCheckoutSessionId: row.latest_checkout_session_id || "",
    createdAt: toIsoOrNow(row.created_at),
    updatedAt: toIsoOrNow(row.updated_at)
  };
}

// Initialize pg-queries with mapper functions
pgq.init({
  mapUserRow, mapSessionRow, mapCanvasRow, mapShareRow,
  mapTaskRow, mapSyncJobRow, mapProjectStateRow, mapBillingAccountRow,
  toIsoOrNow, toOptionalIso, parseObjectField, cleanRole, nowIso, makeId, isPlainObject
});

function normalizeSubscriptionStatus(value) {
  const normalized = String(value || "free").trim().toLowerCase();
  const allowed = new Set([
    "free",
    "incomplete",
    "incomplete_expired",
    "trialing",
    "active",
    "past_due",
    "canceled",
    "unpaid",
    "paused"
  ]);
  return allowed.has(normalized) ? normalized : "free";
}

function normalizeCancelAtPeriodEnd(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function normalizeBillingAccountRecord(entry) {
  const src = entry && typeof entry === "object" ? entry : {};
  return {
    id: String(src.id || makeId("bil")),
    userId: String(src.userId || ""),
    stripeCustomerId: String(src.stripeCustomerId || ""),
    stripeSubscriptionId: String(src.stripeSubscriptionId || ""),
    stripePriceId: String(src.stripePriceId || ""),
    subscriptionStatus: normalizeSubscriptionStatus(src.subscriptionStatus),
    currentPeriodEnd: toOptionalIso(src.currentPeriodEnd),
    cancelAtPeriodEnd: normalizeCancelAtPeriodEnd(src.cancelAtPeriodEnd),
    latestCheckoutSessionId: String(src.latestCheckoutSessionId || ""),
    createdAt: toIsoOrNow(src.createdAt),
    updatedAt: toIsoOrNow(src.updatedAt)
  };
}

function billingStatusIsActive(status) {
  const value = normalizeSubscriptionStatus(status);
  return value === "active" || value === "trialing";
}

function normalizeProjectId(value) {
  const raw = String(value || "").trim().toLowerCase();
  const safe = raw.replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-");
  return safe || "default-project";
}

function ensureArrayClone(value) {
  if (!Array.isArray(value)) return [];
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return [];
  }
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeCanvasDataPayload(data) {
  if (data === undefined) return {};
  if (!isPlainObject(data)) {
    throw new Error("Canvas data must be an object.");
  }
  const serialized = JSON.stringify(data);
  const size = Buffer.byteLength(serialized, "utf8");
  if (size > MAX_CANVAS_DATA_BYTES) {
    throw new Error(`Canvas data exceeds max size (${MAX_CANVAS_DATA_BYTES} bytes).`);
  }
  return data;
}

function normalizeProjectStateRecord(entry) {
  const src = entry && typeof entry === "object" ? entry : {};
  return {
    id: String(src.id || makeId("pst")),
    userId: String(src.userId || ""),
    projectId: normalizeProjectId(src.projectId),
    inventory: ensureArrayClone(src.inventory),
    storage: ensureArrayClone(src.storage),
    storageBoxes: ensureArrayClone(src.storageBoxes),
    mediaFormulations: ensureArrayClone(src.mediaFormulations),
    createdAt: toIsoOrNow(src.createdAt),
    updatedAt: toIsoOrNow(src.updatedAt)
  };
}

async function ensureDbFile() {
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
  }
}

async function ensurePostgresSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      auth_provider TEXT NOT NULL DEFAULT 'local',
      google_sub TEXT NOT NULL DEFAULT '',
      pass TEXT NOT NULL DEFAULT '',
      admin BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_nonempty_idx ON users (LOWER(email)) WHERE email <> '';`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub_nonempty_idx ON users (google_sub) WHERE google_sub <> '';`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS canvases (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS canvases_owner_user_idx ON canvases (owner_user_id);`);
  await pool.query(`ALTER TABLE canvases ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;`);
  await pool.query(`ALTER TABLE canvases ADD COLUMN IF NOT EXISTS lab TEXT NOT NULL DEFAULT '';`);
  await pool.query(`CREATE INDEX IF NOT EXISTS canvases_lab_idx ON canvases (lab) WHERE lab <> '';`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      provider TEXT NOT NULL DEFAULT 'local',
      created_at TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY,
      canvas_id TEXT NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      UNIQUE (canvas_id, user_id)
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS shares_canvas_idx ON shares (canvas_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS shares_user_idx ON shares (user_id);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      canvas_id TEXT NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      due_at TIMESTAMPTZ NULL,
      status TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      assigned_to_user_id TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
      created_by_user_id TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS tasks_canvas_idx ON tasks (canvas_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS tasks_assignee_idx ON tasks (assigned_to_user_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS tasks_due_at_idx ON tasks (due_at);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sync_jobs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      canvas_id TEXT NULL REFERENCES canvases(id) ON DELETE CASCADE,
      task_id TEXT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      requested_by_user_id TEXT NULL REFERENCES users(id) ON DELETE SET NULL,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      note TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS sync_jobs_canvas_idx ON sync_jobs (canvas_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS sync_jobs_task_idx ON sync_jobs (task_id);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_states (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project_id TEXT NOT NULL,
      inventory JSONB NOT NULL DEFAULT '[]'::jsonb,
      storage JSONB NOT NULL DEFAULT '[]'::jsonb,
      storage_boxes JSONB NOT NULL DEFAULT '[]'::jsonb,
      media_formulations JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      UNIQUE (user_id, project_id)
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS project_states_user_idx ON project_states (user_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS project_states_project_idx ON project_states (project_id);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS billing_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      stripe_customer_id TEXT NOT NULL DEFAULT '',
      stripe_subscription_id TEXT NOT NULL DEFAULT '',
      stripe_price_id TEXT NOT NULL DEFAULT '',
      subscription_status TEXT NOT NULL DEFAULT 'free',
      current_period_end TIMESTAMPTZ NULL,
      cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
      latest_checkout_session_id TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS billing_accounts_customer_nonempty_idx ON billing_accounts (stripe_customer_id) WHERE stripe_customer_id <> '';`);
  await pool.query(`CREATE INDEX IF NOT EXISTS billing_accounts_status_idx ON billing_accounts (subscription_status);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      details JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS audit_events_created_idx ON audit_events (created_at DESC);`);
}

async function readDbFile() {
  await ensureDbFile();
  const raw = await fs.readFile(DB_FILE, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }
  return normalizeDbShape(parsed);
}

let fileWriteLock = Promise.resolve();
let fileWriteSeq = 0;
async function writeDbFile(db) {
  // Serialize writes and use a unique temp filename per write. A single shared
  // "<db>.tmp" path lets concurrent writers clobber each other's temp file,
  // so the second rename hits ENOENT and (unhandled) crashes the process.
  const run = async () => {
    await ensureDbFile();
    fileWriteSeq += 1;
    const tmpPath = `${DB_FILE}.${process.pid}.${fileWriteSeq}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(normalizeDbShape(db), null, 2), "utf8");
    await fs.rename(tmpPath, DB_FILE);
  };
  fileWriteLock = fileWriteLock.then(run, run);
  return fileWriteLock;
}

// readDbPostgres / writeDbPostgres removed — replaced by per-row pgq.* queries.

async function ensureStorage() {
  if (DB_MODE === "postgres") {
    await ensurePostgresSchema(getPgPool());
    return;
  }
  await ensureDbFile();
}

// readDb / writeDb / withDb are now file-mode-only.
// In postgres mode, all endpoints use pgq.* (per-row SQL) directly.

async function readDb() {
  return readDbFile();
}

async function writeDb(db) {
  await writeDbFile(db);
}

async function withDbFile(mutator) {
  const db = await readDbFile();
  const result = await mutator(db);
  await writeDbFile(db);
  return result;
}

function withDb(mutator) {
  writeChain = writeChain.then(() => withDbFile(mutator));
  return writeChain;
}

function cleanupExpiredSessions(db) {
  const before = db.sessions.length;
  const now = Date.now();
  db.sessions = db.sessions.filter((session) => {
    const expiresAtMs = new Date(session.expiresAt).getTime();
    return Number.isFinite(expiresAtMs) && expiresAtMs > now;
  });
  return db.sessions.length !== before;
}

function findCanvasRole(db, canvas, userId) {
  if (!canvas) return null;
  if (canvas.ownerUserId === userId) return "owner";
  const share = db.shares.find((entry) => entry.canvasId === canvas.id && entry.userId === userId);
  return share ? share.role : null;
}

function ensureUserForEmail(db, email, fallbackName = "") {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;
  let user = db.users.find((entry) => normalizeEmail(entry.email) === normalizedEmail);
  if (user) return user;

  const baseName =
    String(fallbackName || normalizedEmail.split("@")[0] || "user")
      .trim()
      .replace(/\s+/g, " ") || "user";
  let uniqueName = baseName;
  let suffix = 2;
  while (db.users.some((entry) => entry.name === uniqueName)) {
    uniqueName = `${baseName} (${suffix})`;
    suffix += 1;
  }

  const stamp = nowIso();
  user = {
    id: makeId("usr"),
    name: uniqueName,
    email: normalizedEmail,
    authProvider: "google",
    googleSub: "",
    pass: "",
    admin: false,
    createdAt: stamp,
    updatedAt: stamp
  };
  db.users.push(user);
  return user;
}

function getProjectStateByUserAndProject(db, userId, projectId) {
  const normalizedProjectId = normalizeProjectId(projectId);
  return (db.projectStates || []).find(
    (entry) => String(entry.userId || "") === String(userId || "")
      && normalizeProjectId(entry.projectId) === normalizedProjectId
  ) || null;
}

function createDefaultProjectState(userId, projectId) {
  const stamp = nowIso();
  return {
    id: makeId("pst"),
    userId: String(userId || ""),
    projectId: normalizeProjectId(projectId),
    inventory: [],
    storage: [],
    storageBoxes: [],
    mediaFormulations: [],
    createdAt: stamp,
    updatedAt: stamp
  };
}

function ensureProjectState(db, userId, projectId) {
  if (!Array.isArray(db.projectStates)) db.projectStates = [];
  const normalizedProjectId = normalizeProjectId(projectId);
  const idx = db.projectStates.findIndex(
    (entry) => String(entry.userId || "") === String(userId || "")
      && normalizeProjectId(entry.projectId) === normalizedProjectId
  );
  if (idx !== -1) {
    const normalized = normalizeProjectStateRecord(db.projectStates[idx]);
    db.projectStates[idx] = normalized;
    return normalized;
  }
  const created = createDefaultProjectState(userId, normalizedProjectId);
  db.projectStates.push(created);
  return created;
}

function sanitizeProjectState(state) {
  const normalized = normalizeProjectStateRecord(state);
  return {
    id: normalized.id,
    userId: normalized.userId,
    projectId: normalized.projectId,
    inventory: normalized.inventory,
    storage: normalized.storage,
    storageBoxes: normalized.storageBoxes,
    mediaFormulations: normalized.mediaFormulations,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt
  };
}

function updateProjectStateEntry(target, patch = {}) {
  const state = normalizeProjectStateRecord(target);
  if (Object.prototype.hasOwnProperty.call(patch, "inventory")) {
    state.inventory = ensureArrayClone(patch.inventory);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "storage")) {
    state.storage = ensureArrayClone(patch.storage);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "storageBoxes")) {
    state.storageBoxes = ensureArrayClone(patch.storageBoxes);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "mediaFormulations")) {
    state.mediaFormulations = ensureArrayClone(patch.mediaFormulations);
  }
  state.updatedAt = nowIso();
  return state;
}

function getBillingAccountByUserId(db, userId) {
  const needle = String(userId || "");
  return (db.billingAccounts || []).find((entry) => String(entry.userId || "") === needle) || null;
}

function getBillingAccountByCustomerId(db, customerId) {
  const needle = String(customerId || "").trim();
  if (!needle) return null;
  return (db.billingAccounts || []).find((entry) => String(entry.stripeCustomerId || "") === needle) || null;
}

function ensureBillingAccount(db, userId) {
  if (!Array.isArray(db.billingAccounts)) db.billingAccounts = [];
  const needle = String(userId || "");
  const idx = db.billingAccounts.findIndex((entry) => String(entry.userId || "") === needle);
  if (idx !== -1) {
    const normalized = normalizeBillingAccountRecord(db.billingAccounts[idx]);
    db.billingAccounts[idx] = normalized;
    return normalized;
  }
  const stamp = nowIso();
  const created = normalizeBillingAccountRecord({
    id: makeId("bil"),
    userId: needle,
    subscriptionStatus: "free",
    createdAt: stamp,
    updatedAt: stamp
  });
  db.billingAccounts.push(created);
  return created;
}

function patchBillingAccount(target, patch = {}) {
  const account = normalizeBillingAccountRecord(target);
  if (Object.prototype.hasOwnProperty.call(patch, "stripeCustomerId")) {
    account.stripeCustomerId = String(patch.stripeCustomerId || "");
  }
  if (Object.prototype.hasOwnProperty.call(patch, "stripeSubscriptionId")) {
    account.stripeSubscriptionId = String(patch.stripeSubscriptionId || "");
  }
  if (Object.prototype.hasOwnProperty.call(patch, "stripePriceId")) {
    account.stripePriceId = String(patch.stripePriceId || "");
  }
  if (Object.prototype.hasOwnProperty.call(patch, "subscriptionStatus")) {
    account.subscriptionStatus = normalizeSubscriptionStatus(patch.subscriptionStatus);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "currentPeriodEnd")) {
    account.currentPeriodEnd = toOptionalIso(patch.currentPeriodEnd);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "cancelAtPeriodEnd")) {
    account.cancelAtPeriodEnd = normalizeCancelAtPeriodEnd(patch.cancelAtPeriodEnd);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "latestCheckoutSessionId")) {
    account.latestCheckoutSessionId = String(patch.latestCheckoutSessionId || "");
  }
  account.updatedAt = nowIso();
  return account;
}

function upsertBillingAccountByCustomerId(db, customerId, patch = {}) {
  if (!Array.isArray(db.billingAccounts)) db.billingAccounts = [];
  const existing = getBillingAccountByCustomerId(db, customerId);
  if (!existing) return null;
  const next = patchBillingAccount(existing, patch);
  const idx = db.billingAccounts.findIndex((entry) => entry.id === existing.id);
  if (idx >= 0) db.billingAccounts[idx] = next;
  return next;
}

function sanitizeBillingAccount(account, options = {}) {
  const normalized = account ? normalizeBillingAccountRecord(account) : null;
  const status = normalizeSubscriptionStatus(normalized?.subscriptionStatus || "free");
  const active = billingStatusIsActive(status);
  return {
    configuredCheckout: stripeConfiguredForCheckout(),
    configuredPortal: stripeConfiguredForPortal(),
    publishableKeyConfigured: !!STRIPE_PUBLISHABLE_KEY,
    priceId: STRIPE_PRICE_ID || "",
    plan: active ? "pro" : "free",
    status,
    hasActiveSubscription: active,
    stripeCustomerId: options.includeCustomerId ? normalized?.stripeCustomerId || "" : "",
    stripeSubscriptionId: normalized?.stripeSubscriptionId || "",
    stripePriceId: normalized?.stripePriceId || "",
    currentPeriodEnd: normalized?.currentPeriodEnd || null,
    cancelAtPeriodEnd: !!normalized?.cancelAtPeriodEnd,
    updatedAt: normalized?.updatedAt || null
  };
}

function extractSubscriptionPriceId(subscription) {
  const item = subscription?.items?.data?.[0];
  return String(item?.price?.id || "");
}

function extractSubscriptionCurrentPeriodEnd(subscription) {
  const value = Number(subscription?.current_period_end || 0);
  if (!Number.isFinite(value) || value <= 0) return null;
  return new Date(value * 1000).toISOString();
}

function applyStripeWebhookEvent(db, event) {
  const type = String(event?.type || "");
  const object = event?.data?.object || {};
  if (!type) return;

  if (type === "checkout.session.completed") {
    const customerId = String(object.customer || "");
    const subscriptionId = String(object.subscription || "");
    const userId = String(object.metadata?.userId || object.client_reference_id || "").trim();
    if (userId) {
      const account = ensureBillingAccount(db, userId);
      const next = patchBillingAccount(account, {
        stripeCustomerId: customerId || account.stripeCustomerId,
        stripeSubscriptionId: subscriptionId || account.stripeSubscriptionId,
        latestCheckoutSessionId: String(object.id || account.latestCheckoutSessionId),
        subscriptionStatus: "active"
      });
      const idx = db.billingAccounts.findIndex((entry) => entry.id === account.id);
      if (idx >= 0) db.billingAccounts[idx] = next;
      return;
    }
    if (customerId) {
      upsertBillingAccountByCustomerId(db, customerId, {
        stripeSubscriptionId: subscriptionId,
        latestCheckoutSessionId: String(object.id || ""),
        subscriptionStatus: "active"
      });
    }
    return;
  }

  if (
    type === "customer.subscription.created"
    || type === "customer.subscription.updated"
    || type === "customer.subscription.deleted"
  ) {
    const customerId = String(object.customer || "");
    if (!customerId) return;
    upsertBillingAccountByCustomerId(db, customerId, {
      stripeSubscriptionId: String(object.id || ""),
      stripePriceId: extractSubscriptionPriceId(object),
      subscriptionStatus: normalizeSubscriptionStatus(object.status || (type === "customer.subscription.deleted" ? "canceled" : "free")),
      currentPeriodEnd: extractSubscriptionCurrentPeriodEnd(object),
      cancelAtPeriodEnd: !!object.cancel_at_period_end
    });
  }
}

async function applyStripeWebhookEventPostgres(pool, event) {
  const type = String(event?.type || "");
  const object = event?.data?.object || {};
  if (!type) return;

  if (type === "checkout.session.completed") {
    const customerId = String(object.customer || "");
    const subscriptionId = String(object.subscription || "");
    const userId = String(object.metadata?.userId || object.client_reference_id || "").trim();
    if (userId) {
      let account = await pgq.findBillingByUserId(pool, userId);
      if (!account) {
        account = await pgq.upsertBillingAccount(pool, {
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          latestCheckoutSessionId: String(object.id || ""),
          subscriptionStatus: "active"
        });
      } else {
        await pgq.updateBillingAccount(pool, account.id, {
          stripeCustomerId: customerId || account.stripeCustomerId,
          stripeSubscriptionId: subscriptionId || account.stripeSubscriptionId,
          latestCheckoutSessionId: String(object.id || account.latestCheckoutSessionId),
          subscriptionStatus: "active"
        });
      }
      return;
    }
    if (customerId) {
      const account = await pgq.findBillingByCustomerId(pool, customerId);
      if (account) {
        await pgq.updateBillingAccount(pool, account.id, {
          stripeSubscriptionId: subscriptionId,
          latestCheckoutSessionId: String(object.id || ""),
          subscriptionStatus: "active"
        });
      }
    }
    return;
  }

  if (
    type === "customer.subscription.created"
    || type === "customer.subscription.updated"
    || type === "customer.subscription.deleted"
  ) {
    const customerId = String(object.customer || "");
    if (!customerId) return;
    const account = await pgq.findBillingByCustomerId(pool, customerId);
    if (account) {
      await pgq.updateBillingAccount(pool, account.id, {
        stripeSubscriptionId: String(object.id || ""),
        stripePriceId: extractSubscriptionPriceId(object),
        subscriptionStatus: normalizeSubscriptionStatus(object.status || (type === "customer.subscription.deleted" ? "canceled" : "free")),
        currentPeriodEnd: extractSubscriptionCurrentPeriodEnd(object),
        cancelAtPeriodEnd: !!object.cancel_at_period_end
      });
    }
  }
}

function queueSyncJob(db, input) {
  const stamp = nowIso();
  const job = {
    id: makeId("job"),
    type: input.type,
    status: "queued",
    canvasId: input.canvasId || null,
    taskId: input.taskId || null,
    requestedByUserId: input.requestedByUserId || null,
    payload: input.payload || {},
    note: input.note || "Placeholder job queued. External provider sync not implemented yet.",
    createdAt: stamp,
    updatedAt: stamp
  };
  db.syncJobs.push(job);
  return job;
}

async function authRequired(req, res, next) {
  // Single-user local desktop mode (no login): attach a fixed default local user
  // (created once in the file DB) and skip token validation entirely.
  if (!REQUIRE_AUTH && DB_MODE !== "postgres") {
    // Read first (cheap); only when the local user doesn't exist yet do a
    // serialized create through withDb. On first boot the frontend fires
    // several requests concurrently — without serialization they'd all
    // read-modify-write the file DB at once and crash on the temp-file rename.
    const existing = await readDb();
    let user = existing.users.find(
      (u) => normalizeEmail(u.email) === normalizeEmail("local@wetlab.app")
    );
    if (!user) {
      user = await withDb((db) => ensureUserForEmail(db, "local@wetlab.app", "Local User"));
    }
    req.auth = { token: "local", userId: user.id, user, sessionId: "local" };
    return next();
  }

  const authHeader = String(req.headers.authorization || "");
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = match ? match[1].trim() : "";
  if (!token) {
    res.status(401).json({ error: "Missing bearer token." });
    return;
  }

  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    // Clean expired sessions periodically (fire-and-forget)
    pgq.deleteExpiredSessions(pool).catch(() => {});
    // Try hashed token lookup first (common case)
    const hashedToken = encodeStoredSessionToken(token);
    let session = await pgq.findSessionByToken(pool, hashedToken);
    if (!session) {
      // Legacy plaintext token fallback — look up by raw token value
      session = await pgq.findSessionByToken(pool, token);
      if (session) {
        // Upgrade to hashed token
        await pgq.updateSessionToken(pool, session.id, hashedToken);
      }
    }
    if (!session) {
      res.status(401).json({ error: "Invalid or expired session." });
      return;
    }
    const user = await pgq.findUserById(pool, session.userId);
    if (!user) {
      await pgq.deleteSession(pool, session.id);
      res.status(401).json({ error: "Session user no longer exists." });
      return;
    }
    req.auth = { token, userId: user.id, user, sessionId: session.id };
    return next();
  }

  // File-mode fallback
  const db = await readDb();
  const cleanedExpired = cleanupExpiredSessions(db);
  const session = db.sessions.find((entry) => sessionTokenMatches(entry.token, token));
  let upgradedLegacySessionToken = false;
  if (!session) {
    if (cleanedExpired) await writeDb(db);
    res.status(401).json({ error: "Invalid or expired session." });
    return;
  }

  if (!isStoredSessionTokenHash(session.token)) {
    session.token = encodeStoredSessionToken(token);
    upgradedLegacySessionToken = true;
  }

  const user = db.users.find((entry) => entry.id === session.userId);
  if (!user) {
    db.sessions = db.sessions.filter((entry) => entry.id !== session.id);
    await writeDb(db);
    res.status(401).json({ error: "Session user no longer exists." });
    return;
  }

  if (cleanedExpired || upgradedLegacySessionToken) await writeDb(db);
  req.auth = { token, userId: user.id, user, sessionId: session.id };
  next();
}

app.get("/api/health", async (_req, res) => {
  if (DB_MODE === "postgres") {
    const counts = await pgq.getTableCounts(getPgPool());
    return res.json({ ok: true, mode: DB_MODE, time: nowIso(), counts });
  }
  const db = await readDb();
  res.json({
    ok: true,
    mode: DB_MODE,
    time: nowIso(),
    counts: {
      users: db.users.length,
      canvases: db.canvases.length,
      shares: db.shares.length,
      tasks: db.tasks.length,
      syncJobs: db.syncJobs.length,
      projectStates: db.projectStates.length,
      billingAccounts: db.billingAccounts.length
    }
  });
});

app.post("/api/auth/google", async (req, res) => {
  const credential = String(req.body?.credential || "").trim();
  if (!credential) {
    res.status(400).json({ error: "credential is required." });
    return;
  }
  const verification = await verifyGoogleIdToken(credential);
  if (!verification.ok) {
    res.status(401).json({ error: verification.error || "Google token verification failed." });
    return;
  }
  const email = normalizeEmail(verification.email);
  if (!email) {
    res.status(400).json({ error: "Google account has no email address." });
    return;
  }
  if (!verification.emailVerified) {
    res.status(403).json({ error: "Google account email is not verified." });
    return;
  }
  const name = verification.name || email.split("@")[0] || "Google User";
  const googleSub = verification.googleSub;

  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    let user = googleSub ? await pgq.findUserByGoogleSub(pool, googleSub) : null;
    if (!user) user = await pgq.findUserByEmail(pool, email);
    if (!user) {
      user = await pgq.insertUser(pool, { name, email, authProvider: "google", googleSub });
    } else {
      user = await pgq.updateUser(pool, user.id, { name, email, authProvider: "google", googleSub });
    }
    pgq.deleteExpiredSessions(pool).catch(() => {});
    const rawToken = makeSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    await pgq.insertSession(pool, {
      userId: user.id,
      token: encodeStoredSessionToken(rawToken),
      provider: "google",
      expiresAt
    });
    return res.json({ token: rawToken, expiresAt, user: sanitizeUser(user) });
  }

  const result = await withDb((db) => {
    let user = null;
    if (googleSub) {
      user = db.users.find((entry) => String(entry.googleSub || "").trim() === googleSub) || null;
    }
    if (!user) {
      user = db.users.find((entry) => normalizeEmail(entry.email) === email) || null;
    }
    const stamp = nowIso();
    if (!user) {
      user = {
        id: makeId("usr"),
        name,
        email,
        authProvider: "google",
        googleSub,
        pass: "",
        admin: false,
        createdAt: stamp,
        updatedAt: stamp
      };
      db.users.push(user);
    } else {
      user.authProvider = "google";
      user.email = email;
      if (name) user.name = name;
      if (googleSub) user.googleSub = googleSub;
      user.updatedAt = stamp;
      if (typeof user.pass !== "string") user.pass = "";
    }
    cleanupExpiredSessions(db);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    const rawToken = makeSessionToken();
    const session = {
      id: makeId("sess"),
      userId: user.id,
      token: encodeStoredSessionToken(rawToken),
      provider: "google",
      createdAt: stamp,
      expiresAt
    };
    db.sessions.push(session);
    return { user, sessionToken: rawToken, expiresAt };
  });

  res.json({
    token: result.sessionToken || "",
    expiresAt: result.expiresAt,
    user: sanitizeUser(result.user)
  });
});

app.post("/api/auth/google-placeholder", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const name = String(req.body?.name || "").trim();
  const googleSub = String(req.body?.googleSub || "").trim();

  if (!email) {
    res.status(400).json({ error: "email is required." });
    return;
  }

  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    let user = googleSub ? await pgq.findUserByGoogleSub(pool, googleSub) : null;
    if (!user) user = await pgq.findUserByEmail(pool, email);
    if (!user) {
      user = await pgq.insertUser(pool, {
        name: name || email.split("@")[0] || "Google User",
        email, authProvider: "google", googleSub
      });
    } else {
      const updates = { authProvider: "google", email };
      if (name) updates.name = name;
      if (googleSub) updates.googleSub = googleSub;
      user = await pgq.updateUser(pool, user.id, updates);
    }
    pgq.deleteExpiredSessions(pool).catch(() => {});
    const rawToken = makeSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    await pgq.insertSession(pool, {
      userId: user.id,
      token: encodeStoredSessionToken(rawToken),
      provider: "google",
      expiresAt
    });
    return res.json({ token: rawToken, expiresAt, user: sanitizeUser(user) });
  }

  const result = await withDb((db) => {
    let user = null;
    if (googleSub) {
      user = db.users.find((entry) => String(entry.googleSub || "").trim() === googleSub) || null;
    }
    if (!user) {
      user = db.users.find((entry) => normalizeEmail(entry.email) === email) || null;
    }

    const stamp = nowIso();
    if (!user) {
      user = {
        id: makeId("usr"),
        name: name || email.split("@")[0] || "Google User",
        email,
        authProvider: "google",
        googleSub,
        pass: "",
        admin: false,
        createdAt: stamp,
        updatedAt: stamp
      };
      db.users.push(user);
    } else {
      user.authProvider = "google";
      user.email = email;
      if (name) user.name = name;
      if (googleSub) user.googleSub = googleSub;
      user.updatedAt = stamp;
      if (typeof user.pass !== "string") user.pass = "";
    }

    cleanupExpiredSessions(db);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    const rawToken = makeSessionToken();
    const session = {
      id: makeId("sess"),
      userId: user.id,
      token: encodeStoredSessionToken(rawToken),
      provider: "google",
      createdAt: stamp,
      expiresAt
    };
    db.sessions.push(session);

    return { user, sessionToken: rawToken, expiresAt };
  });

  res.json({
    token: result.sessionToken || "",
    expiresAt: result.expiresAt,
    user: sanitizeUser(result.user)
  });
});

app.post("/api/auth/register", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    const existing = await pgq.findUserByEmail(pool, email);
    if (existing) return res.status(409).json({ error: "An account with this email already exists." });
    const user = await pgq.insertUser(pool, {
      name,
      email,
      authProvider: "local",
      pass: makePasswordHash(password)
    });
    const rawToken = makeSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    await pgq.insertSession(pool, {
      userId: user.id,
      token: encodeStoredSessionToken(rawToken),
      provider: "local",
      expiresAt
    });
    return res.json({ token: rawToken, expiresAt, user: sanitizeUser(user) });
  }

  const result = await withDb((db) => {
    const existing = db.users.find((u) => normalizeEmail(u.email) === email);
    if (existing) return { conflict: true };
    const stamp = nowIso();
    const user = {
      id: makeId("usr"),
      name,
      email,
      authProvider: "local",
      pass: makePasswordHash(password),
      admin: false,
      createdAt: stamp,
      updatedAt: stamp
    };
    db.users.push(user);
    const rawToken = makeSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    const session = {
      id: makeId("sess"),
      userId: user.id,
      token: encodeStoredSessionToken(rawToken),
      provider: "local",
      createdAt: stamp,
      expiresAt
    };
    db.sessions.push(session);
    return { user, sessionToken: rawToken, expiresAt };
  });

  if (result.conflict) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  res.json({
    token: result.sessionToken || "",
    expiresAt: result.expiresAt,
    user: sanitizeUser(result.user)
  });
});

app.post("/api/auth/local", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required." });
    return;
  }

  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    const user = await pgq.findUserByEmail(pool, email);
    if (!user) { res.status(401).json({ error: "Invalid credentials." }); return; }
    const storedPass = String(user.pass || "");
    const passMatches = isPasswordHash(storedPass)
      ? verifyPasswordHash(password, storedPass)
      : timingSafeEqualString(storedPass, password);
    if (!passMatches) { res.status(401).json({ error: "Invalid credentials." }); return; }
    if (!isPasswordHash(storedPass) && storedPass) {
      await pgq.updateUser(pool, user.id, { pass: makePasswordHash(password) });
    }
    pgq.deleteExpiredSessions(pool).catch(() => {});
    const rawToken = makeSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    await pgq.insertSession(pool, {
      userId: user.id,
      token: encodeStoredSessionToken(rawToken),
      provider: "local",
      expiresAt
    });
    return res.json({ token: rawToken, expiresAt, user: sanitizeUser(user) });
  }

  const result = await withDb((db) => {
    const user = db.users.find((entry) => normalizeEmail(entry.email) === email);
    if (!user) return null;
    const storedPass = String(user.pass || "");
    const passMatches = isPasswordHash(storedPass)
      ? verifyPasswordHash(password, storedPass)
      : timingSafeEqualString(storedPass, password);
    if (!passMatches) return null;

    cleanupExpiredSessions(db);
    const stamp = nowIso();
    if (!isPasswordHash(storedPass) && storedPass) {
      user.pass = makePasswordHash(password);
      user.updatedAt = stamp;
    }
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    const rawToken = makeSessionToken();
    const session = {
      id: makeId("sess"),
      userId: user.id,
      token: encodeStoredSessionToken(rawToken),
      provider: "local",
      createdAt: stamp,
      expiresAt
    };
    db.sessions.push(session);
    return { user, sessionToken: rawToken, expiresAt };
  });

  if (!result) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  res.json({
    token: result.sessionToken || "",
    expiresAt: result.expiresAt,
    user: sanitizeUser(result.user)
  });
});

app.post("/api/auth/logout", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    await pgq.deleteSession(getPgPool(), req.auth.sessionId);
    return res.status(204).send();
  }
  await withDb((db) => {
    db.sessions = db.sessions.filter((entry) => {
      if (req.auth.sessionId && entry.id === req.auth.sessionId) return false;
      return !sessionTokenMatches(entry.token, req.auth.token);
    });
  });
  res.status(204).send();
});

app.get("/api/me", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const user = await pgq.findUserById(getPgPool(), req.auth.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json({ user: sanitizeUser(user) });
  }
  const db = await readDb();
  const user = db.users.find((entry) => entry.id === req.auth.userId);
  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }
  res.json({ user: sanitizeUser(user) });
});

app.get("/api/billing/status", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const account = await pgq.findBillingByUserId(getPgPool(), req.auth.userId);
    return res.json({ billing: sanitizeBillingAccount(account, { includeCustomerId: true }) });
  }
  const db = await readDb();
  const account = getBillingAccountByUserId(db, req.auth.userId);
  res.json({ billing: sanitizeBillingAccount(account, { includeCustomerId: true }) });
});

app.post("/api/billing/create-checkout-session", authRequired, async (req, res) => {
  if (!stripeConfiguredForCheckout()) {
    res.status(503).json({ error: "Stripe checkout is not configured on the server." });
    return;
  }
  const stripe = getStripeClient();
  if (!stripe) {
    res.status(503).json({ error: "Stripe client is not initialized." });
    return;
  }

  try {
    const user = req.auth.user;

    if (DB_MODE === "postgres") {
      const pool = getPgPool();
      let account = await pgq.findBillingByUserId(pool, user.id);
      if (!account) {
        account = await pgq.upsertBillingAccount(pool, {
          userId: user.id, stripePriceId: STRIPE_PRICE_ID || ""
        });
      } else if (!account.stripePriceId && STRIPE_PRICE_ID) {
        account = await pgq.updateBillingAccount(pool, account.id, { stripePriceId: STRIPE_PRICE_ID });
      }

      if (!account.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name: user.name || undefined,
          metadata: { userId: user.id }
        });
        account = await pgq.updateBillingAccount(pool, account.id, { stripeCustomerId: String(customer.id || "") });
      }

      const baseUrl = resolveAppBaseUrl(req);
      const successUrlBase = STRIPE_SUCCESS_URL || `${baseUrl}/?billing=success`;
      const cancelUrl = STRIPE_CANCEL_URL || `${baseUrl}/?billing=cancelled`;
      const successUrl = successUrlBase.includes("{CHECKOUT_SESSION_ID}")
        ? successUrlBase
        : `${successUrlBase}${successUrlBase.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`;

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: account.stripeCustomerId,
        line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        client_reference_id: user.id,
        metadata: {
          userId: user.id,
          projectId: normalizeProjectId(req.body?.projectId || "default-project")
        }
      });

      await pgq.updateBillingAccount(pool, account.id, {
        latestCheckoutSessionId: String(session.id || ""),
        stripePriceId: STRIPE_PRICE_ID
      });

      return res.json({
        checkoutUrl: session.url || "",
        sessionId: session.id || ""
      });
    }

    let account = await withDb((db) => {
      const current = ensureBillingAccount(db, user.id);
      if (!current.stripePriceId && STRIPE_PRICE_ID) {
        const next = patchBillingAccount(current, { stripePriceId: STRIPE_PRICE_ID });
        const idx = db.billingAccounts.findIndex((entry) => entry.id === current.id);
        if (idx >= 0) db.billingAccounts[idx] = next;
        return next;
      }
      return current;
    });

    if (!account.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: { userId: user.id }
      });
      account = await withDb((db) => {
        const current = ensureBillingAccount(db, user.id);
        const next = patchBillingAccount(current, { stripeCustomerId: String(customer.id || "") });
        const idx = db.billingAccounts.findIndex((entry) => entry.id === current.id);
        if (idx >= 0) db.billingAccounts[idx] = next;
        return next;
      });
    }

    const baseUrl = resolveAppBaseUrl(req);
    const successUrlBase = STRIPE_SUCCESS_URL || `${baseUrl}/?billing=success`;
    const cancelUrl = STRIPE_CANCEL_URL || `${baseUrl}/?billing=cancelled`;
    const successUrl = successUrlBase.includes("{CHECKOUT_SESSION_ID}")
      ? successUrlBase
      : `${successUrlBase}${successUrlBase.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: account.stripeCustomerId,
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        projectId: normalizeProjectId(req.body?.projectId || "default-project")
      }
    });

    await withDb((db) => {
      const current = ensureBillingAccount(db, user.id);
      const next = patchBillingAccount(current, {
        latestCheckoutSessionId: String(session.id || ""),
        stripePriceId: STRIPE_PRICE_ID
      });
      const idx = db.billingAccounts.findIndex((entry) => entry.id === current.id);
      if (idx >= 0) db.billingAccounts[idx] = next;
    });

    res.json({
      checkoutUrl: session.url || "",
      sessionId: session.id || ""
    });
  } catch (err) {
    res.status(500).json({ error: `Unable to create checkout session: ${err.message || "unknown error"}` });
  }
});

app.post("/api/billing/create-portal-session", authRequired, async (req, res) => {
  if (!stripeConfiguredForPortal()) {
    res.status(503).json({ error: "Stripe portal is not configured on the server." });
    return;
  }
  const stripe = getStripeClient();
  if (!stripe) {
    res.status(503).json({ error: "Stripe client is not initialized." });
    return;
  }
  try {
    if (DB_MODE === "postgres") {
      const account = await pgq.findBillingByUserId(getPgPool(), req.auth.userId);
      if (!account?.stripeCustomerId) {
        return res.status(409).json({ error: "No Stripe customer exists for this user yet." });
      }
      const portal = await stripe.billingPortal.sessions.create({
        customer: account.stripeCustomerId,
        return_url: resolveAppBaseUrl(req)
      });
      return res.json({ portalUrl: portal.url || "" });
    }

    const db = await readDb();
    const account = getBillingAccountByUserId(db, req.auth.userId);
    if (!account?.stripeCustomerId) {
      res.status(409).json({ error: "No Stripe customer exists for this user yet." });
      return;
    }
    const portal = await stripe.billingPortal.sessions.create({
      customer: account.stripeCustomerId,
      return_url: resolveAppBaseUrl(req)
    });
    res.json({ portalUrl: portal.url || "" });
  } catch (err) {
    res.status(500).json({ error: `Unable to create portal session: ${err.message || "unknown error"}` });
  }
});

app.get("/api/projects/:projectId/state", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const state = await pgq.findProjectState(getPgPool(), req.auth.userId, req.params.projectId);
    return res.json({ state: sanitizeProjectState(state || createDefaultProjectState(req.auth.userId, req.params.projectId)) });
  }

  const db = await readDb();
  const state = getProjectStateByUserAndProject(db, req.auth.userId, req.params.projectId)
    || createDefaultProjectState(req.auth.userId, req.params.projectId);
  res.json({ state: sanitizeProjectState(state) });
});

app.patch("/api/projects/:projectId/state", authRequired, async (req, res) => {
  const payload = req.body && typeof req.body === "object" ? req.body : {};
  const keys = ["inventory", "storage", "storageBoxes", "mediaFormulations"];
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(payload, key) && !Array.isArray(payload[key])) {
      res.status(400).json({ error: `${key} must be an array.` });
      return;
    }
  }

  if (DB_MODE === "postgres") {
    const upsertPayload = { userId: req.auth.userId, projectId: req.params.projectId };
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        upsertPayload[key] = payload[key];
      }
    }
    const state = await pgq.upsertProjectState(getPgPool(), upsertPayload);
    return res.json({ state: sanitizeProjectState(state) });
  }

  const result = await withDb((db) => {
    const state = ensureProjectState(db, req.auth.userId, req.params.projectId);
    const next = updateProjectStateEntry(state, payload);
    const idx = db.projectStates.findIndex((entry) => entry.id === state.id);
    if (idx === -1) db.projectStates.push(next);
    else db.projectStates[idx] = next;
    return sanitizeProjectState(next);
  });

  res.json({ state: result });
});

app.get("/api/projects/:projectId/inventory", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const state = await pgq.findProjectState(getPgPool(), req.auth.userId, req.params.projectId);
    return res.json({ inventory: ensureArrayClone(state?.inventory) });
  }
  const db = await readDb();
  const state = getProjectStateByUserAndProject(db, req.auth.userId, req.params.projectId);
  res.json({ inventory: ensureArrayClone(state?.inventory) });
});

app.put("/api/projects/:projectId/inventory", authRequired, async (req, res) => {
  if (!Array.isArray(req.body?.inventory)) {
    res.status(400).json({ error: "inventory must be an array." });
    return;
  }
  if (DB_MODE === "postgres") {
    const state = await pgq.upsertProjectState(getPgPool(), {
      userId: req.auth.userId, projectId: req.params.projectId, inventory: req.body.inventory
    });
    return res.json({ inventory: ensureArrayClone(state.inventory) });
  }
  const state = await withDb((db) => {
    const current = ensureProjectState(db, req.auth.userId, req.params.projectId);
    const next = updateProjectStateEntry(current, { inventory: req.body.inventory });
    const idx = db.projectStates.findIndex((entry) => entry.id === current.id);
    if (idx === -1) db.projectStates.push(next);
    else db.projectStates[idx] = next;
    return next;
  });
  res.json({ inventory: ensureArrayClone(state.inventory) });
});

app.get("/api/projects/:projectId/storage", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const state = await pgq.findProjectState(getPgPool(), req.auth.userId, req.params.projectId);
    return res.json({ storage: ensureArrayClone(state?.storage) });
  }
  const db = await readDb();
  const state = getProjectStateByUserAndProject(db, req.auth.userId, req.params.projectId);
  res.json({ storage: ensureArrayClone(state?.storage) });
});

app.put("/api/projects/:projectId/storage", authRequired, async (req, res) => {
  if (!Array.isArray(req.body?.storage)) {
    res.status(400).json({ error: "storage must be an array." });
    return;
  }
  if (DB_MODE === "postgres") {
    const state = await pgq.upsertProjectState(getPgPool(), {
      userId: req.auth.userId, projectId: req.params.projectId, storage: req.body.storage
    });
    return res.json({ storage: ensureArrayClone(state.storage) });
  }
  const state = await withDb((db) => {
    const current = ensureProjectState(db, req.auth.userId, req.params.projectId);
    const next = updateProjectStateEntry(current, { storage: req.body.storage });
    const idx = db.projectStates.findIndex((entry) => entry.id === current.id);
    if (idx === -1) db.projectStates.push(next);
    else db.projectStates[idx] = next;
    return next;
  });
  res.json({ storage: ensureArrayClone(state.storage) });
});

app.get("/api/projects/:projectId/storage-boxes", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const state = await pgq.findProjectState(getPgPool(), req.auth.userId, req.params.projectId);
    return res.json({ storageBoxes: ensureArrayClone(state?.storageBoxes) });
  }
  const db = await readDb();
  const state = getProjectStateByUserAndProject(db, req.auth.userId, req.params.projectId);
  res.json({ storageBoxes: ensureArrayClone(state?.storageBoxes) });
});

app.put("/api/projects/:projectId/storage-boxes", authRequired, async (req, res) => {
  if (!Array.isArray(req.body?.storageBoxes)) {
    res.status(400).json({ error: "storageBoxes must be an array." });
    return;
  }
  if (DB_MODE === "postgres") {
    const state = await pgq.upsertProjectState(getPgPool(), {
      userId: req.auth.userId, projectId: req.params.projectId, storageBoxes: req.body.storageBoxes
    });
    return res.json({ storageBoxes: ensureArrayClone(state.storageBoxes) });
  }
  const state = await withDb((db) => {
    const current = ensureProjectState(db, req.auth.userId, req.params.projectId);
    const next = updateProjectStateEntry(current, { storageBoxes: req.body.storageBoxes });
    const idx = db.projectStates.findIndex((entry) => entry.id === current.id);
    if (idx === -1) db.projectStates.push(next);
    else db.projectStates[idx] = next;
    return next;
  });
  res.json({ storageBoxes: ensureArrayClone(state.storageBoxes) });
});

app.get("/api/projects/:projectId/media-formulations", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const state = await pgq.findProjectState(getPgPool(), req.auth.userId, req.params.projectId);
    return res.json({ mediaFormulations: ensureArrayClone(state?.mediaFormulations) });
  }
  const db = await readDb();
  const state = getProjectStateByUserAndProject(db, req.auth.userId, req.params.projectId);
  res.json({ mediaFormulations: ensureArrayClone(state?.mediaFormulations) });
});

app.put("/api/projects/:projectId/media-formulations", authRequired, async (req, res) => {
  if (!Array.isArray(req.body?.mediaFormulations)) {
    res.status(400).json({ error: "mediaFormulations must be an array." });
    return;
  }
  if (DB_MODE === "postgres") {
    const state = await pgq.upsertProjectState(getPgPool(), {
      userId: req.auth.userId, projectId: req.params.projectId, mediaFormulations: req.body.mediaFormulations
    });
    return res.json({ mediaFormulations: ensureArrayClone(state.mediaFormulations) });
  }
  const state = await withDb((db) => {
    const current = ensureProjectState(db, req.auth.userId, req.params.projectId);
    const next = updateProjectStateEntry(current, { mediaFormulations: req.body.mediaFormulations });
    const idx = db.projectStates.findIndex((entry) => entry.id === current.id);
    if (idx === -1) db.projectStates.push(next);
    else db.projectStates[idx] = next;
    return next;
  });
  res.json({ mediaFormulations: ensureArrayClone(state.mediaFormulations) });
});

app.get("/api/canvases", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const items = await pgq.findCanvasesByUser(getPgPool(), req.auth.userId);
    return res.json({ canvases: items.map((c) => sanitizeCanvas(c, c.effectiveRole)) });
  }
  const db = await readDb();
  const userId = req.auth.userId;
  const items = db.canvases
    .map((canvas) => {
      const role = findCanvasRole(db, canvas, userId);
      if (!role) return null;
      return sanitizeCanvas(canvas, role);
    })
    .filter(Boolean);
  res.json({ canvases: items });
});

app.post("/api/canvases", authRequired, async (req, res) => {
  const name = String(req.body?.name || "Untitled Canvas").trim() || "Untitled Canvas";
  const lab = String(req.body?.lab || "").trim();
  let canvasData = {};
  try {
    canvasData = normalizeCanvasDataPayload(req.body?.data);
  } catch (err) {
    res.status(400).json({ error: err.message || "Invalid canvas payload." });
    return;
  }

  if (DB_MODE === "postgres") {
    const canvas = await pgq.insertCanvas(getPgPool(), { name, lab, ownerUserId: req.auth.userId, data: canvasData });
    return res.status(201).json({ canvas: sanitizeCanvas(canvas, "owner") });
  }

  const created = await withDb((db) => {
    const stamp = nowIso();
    const canvas = {
      id: makeId("cnv"),
      name,
      ownerUserId: req.auth.userId,
      data: canvasData,
      createdAt: stamp,
      updatedAt: stamp
    };
    db.canvases.push(canvas);
    return canvas;
  });

  res.status(201).json({ canvas: sanitizeCanvas(created, "owner") });
});

app.get("/api/canvases/:canvasId", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    const canvas = await pgq.findCanvasById(pool, req.params.canvasId);
    if (!canvas) return res.status(404).json({ error: "Canvas not found." });
    const role = await pgq.resolveCanvasRole(pool, canvas.id, req.auth.userId);
    if (!role) return res.status(403).json({ error: "Access denied." });
    return res.json({ canvas: { ...sanitizeCanvas(canvas, role), data: canvas.data } });
  }
  const db = await readDb();
  const canvas = db.canvases.find((entry) => entry.id === req.params.canvasId);
  if (!canvas) {
    res.status(404).json({ error: "Canvas not found." });
    return;
  }
  const role = findCanvasRole(db, canvas, req.auth.userId);
  if (!role) {
    res.status(403).json({ error: "Access denied." });
    return;
  }
  res.json({
    canvas: {
      ...sanitizeCanvas(canvas, role),
      data: canvas.data
    }
  });
});

app.get("/api/canvases/:canvasId/export", authRequired, async (req, res) => {
  let canvas, role;
  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    canvas = await pgq.findCanvasById(pool, req.params.canvasId);
    if (!canvas) return res.status(404).json({ error: "Canvas not found." });
    role = await pgq.resolveCanvasRole(pool, canvas.id, req.auth.userId);
    if (!role) return res.status(403).json({ error: "Access denied." });
  } else {
    const db = await readDb();
    canvas = db.canvases.find((entry) => entry.id === req.params.canvasId);
    if (!canvas) return res.status(404).json({ error: "Canvas not found." });
    role = findCanvasRole(db, canvas, req.auth.userId);
    if (!role) return res.status(403).json({ error: "Access denied." });
  }

  const data = canvas.data && typeof canvas.data === "object" ? canvas.data : {};
  const workspaces = data.workspaces && typeof data.workspaces === "object" ? data.workspaces : {};
  const workspaceAnalytics = Object.entries(workspaces).map(([workspaceId, workspaceData]) => {
    const nodes = Array.isArray(workspaceData?.nodes) ? workspaceData.nodes : [];
    const links = Array.isArray(workspaceData?.links) ? workspaceData.links : [];
    const protocols = links.filter((link) => !!link?.protocol).length;
    return {
      workspaceId,
      nodeCount: nodes.length,
      linkCount: links.length,
      protocolCount: protocols
    };
  });

  res.json({
    export: {
      canvasId: canvas.id,
      canvasName: canvas.name,
      role,
      exportedAt: nowIso(),
      ownerUserId: canvas.ownerUserId,
      data,
      analytics: {
        workspaceAnalytics,
        milestoneCount: Array.isArray(data?.milestones) ? data.milestones.length : 0,
        animalTransferCount: Array.isArray(data?.animalTransfers) ? data.animalTransfers.length : 0
      }
    }
  });
});

app.put("/api/canvases/:canvasId", authRequired, async (req, res) => {
  let nextCanvasData = null;
  if (req.body && Object.prototype.hasOwnProperty.call(req.body, "data")) {
    try {
      nextCanvasData = normalizeCanvasDataPayload(req.body.data);
    } catch (err) {
      res.status(400).json({ error: err.message || "Invalid canvas payload." });
      return;
    }
  }

  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    const role = await pgq.resolveCanvasRole(pool, req.params.canvasId, req.auth.userId);
    if (!role) return res.status(404).json({ error: "Canvas not found." });
    if (!hasAccess(role, "editor")) return res.status(403).json({ error: "Access denied." });
    const nameArg = typeof req.body?.name === "string" ? req.body.name.trim() || null : null;
    const labArg = Object.prototype.hasOwnProperty.call(req.body || {}, "lab") ? String(req.body.lab || "").trim() : undefined;
    const canvas = await pgq.updateCanvasData(pool, req.params.canvasId, nextCanvasData !== null ? nextCanvasData : undefined, nameArg, labArg);
    if (!canvas) return res.status(404).json({ error: "Canvas not found." });
    return res.json({ canvas: { ...sanitizeCanvas(canvas, role), data: canvas.data } });
  }

  const updated = await withDb((db) => {
    const canvas = db.canvases.find((entry) => entry.id === req.params.canvasId);
    if (!canvas) return { error: "not_found" };

    const role = findCanvasRole(db, canvas, req.auth.userId);
    if (!role || !hasAccess(role, "editor")) return { error: "forbidden" };

    if (typeof req.body?.name === "string") {
      const clean = req.body.name.trim();
      if (clean) canvas.name = clean;
    }
    if (nextCanvasData !== null) {
      canvas.data = nextCanvasData;
    }
    canvas.updatedAt = nowIso();
    return { canvas, role };
  });

  if (updated.error === "not_found") {
    res.status(404).json({ error: "Canvas not found." });
    return;
  }
  if (updated.error === "forbidden") {
    res.status(403).json({ error: "Access denied." });
    return;
  }
  res.json({
    canvas: {
      ...sanitizeCanvas(updated.canvas, updated.role),
      data: updated.canvas.data
    }
  });
});

app.delete("/api/canvases/:canvasId", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    const role = await pgq.resolveCanvasRole(pool, req.params.canvasId, req.auth.userId);
    if (!role) return res.status(404).json({ error: "Canvas not found." });
    if (role !== "owner") return res.status(403).json({ error: "Only the owner can delete this canvas." });
    await pgq.deleteCanvas(pool, req.params.canvasId);
    return res.status(204).send();
  }

  const status = await withDb((db) => {
    const idx = db.canvases.findIndex((entry) => entry.id === req.params.canvasId);
    if (idx < 0) return "not_found";
    const canvas = db.canvases[idx];
    const role = findCanvasRole(db, canvas, req.auth.userId);
    if (role !== "owner") return "forbidden";

    db.canvases.splice(idx, 1);
    db.shares = db.shares.filter((entry) => entry.canvasId !== canvas.id);
    db.tasks = db.tasks.filter((entry) => entry.canvasId !== canvas.id);
    db.syncJobs = db.syncJobs.filter((entry) => entry.canvasId !== canvas.id);
    return "ok";
  });

  if (status === "not_found") {
    res.status(404).json({ error: "Canvas not found." });
    return;
  }
  if (status === "forbidden") {
    res.status(403).json({ error: "Only the owner can delete this canvas." });
    return;
  }
  res.status(204).send();
});

app.get("/api/canvases/:canvasId/shares", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    const role = await pgq.resolveCanvasRole(pool, req.params.canvasId, req.auth.userId);
    if (!role) return res.status(404).json({ error: "Canvas not found." });
    if (role !== "owner") return res.status(403).json({ error: "Only the owner can view share settings." });
    const items = await pgq.findSharesByCanvas(pool, req.params.canvasId);
    return res.json({
      shares: items.map((s) => sanitizeShare(s, { id: s.userId, name: s.userName, email: s.userEmail }))
    });
  }

  const db = await readDb();
  const canvas = db.canvases.find((entry) => entry.id === req.params.canvasId);
  if (!canvas) {
    res.status(404).json({ error: "Canvas not found." });
    return;
  }
  const role = findCanvasRole(db, canvas, req.auth.userId);
  if (role !== "owner") {
    res.status(403).json({ error: "Only the owner can view share settings." });
    return;
  }
  const items = db.shares
    .filter((entry) => entry.canvasId === canvas.id)
    .map((entry) => sanitizeShare(entry, db.users.find((user) => user.id === entry.userId) || null));
  res.json({ shares: items });
});

app.post("/api/canvases/:canvasId/shares", authRequired, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const role = cleanRole(req.body?.role);
  if (!email) {
    res.status(400).json({ error: "email is required." });
    return;
  }
  if (role === "owner") {
    res.status(400).json({ error: "role must be editor or viewer." });
    return;
  }

  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    const canvasRole = await pgq.resolveCanvasRole(pool, req.params.canvasId, req.auth.userId);
    if (!canvasRole) return res.status(404).json({ error: "Canvas not found." });
    if (canvasRole !== "owner") return res.status(403).json({ error: "Only the owner can manage shares." });

    const canvas = await pgq.findCanvasById(pool, req.params.canvasId);
    if (!canvas) return res.status(404).json({ error: "Canvas not found." });

    let user = await pgq.findUserByEmail(pool, email);
    if (!user) {
      const baseName = String(req.body?.name || email.split("@")[0] || "user").trim().replace(/\s+/g, " ") || "user";
      user = await pgq.insertUser(pool, { name: baseName, email, authProvider: "google" });
    }
    if (!user) return res.status(400).json({ error: "Unable to resolve user email." });
    if (user.id === canvas.ownerUserId) return res.status(400).json({ error: "Owner already has full access." });

    const share = await pgq.insertShare(pool, { canvasId: req.params.canvasId, userId: user.id, role });
    return res.status(201).json({ share: sanitizeShare(share, user) });
  }

  const result = await withDb((db) => {
    const canvas = db.canvases.find((entry) => entry.id === req.params.canvasId);
    if (!canvas) return { error: "not_found" };
    const requesterRole = findCanvasRole(db, canvas, req.auth.userId);
    if (requesterRole !== "owner") return { error: "forbidden" };

    const user = ensureUserForEmail(db, email);
    if (!user) return { error: "invalid_email" };
    if (user.id === canvas.ownerUserId) return { error: "owner_share" };

    const stamp = nowIso();
    let share = db.shares.find((entry) => entry.canvasId === canvas.id && entry.userId === user.id);
    if (!share) {
      share = {
        id: makeId("shr"),
        canvasId: canvas.id,
        userId: user.id,
        role,
        createdAt: stamp,
        updatedAt: stamp
      };
      db.shares.push(share);
    } else {
      share.role = role;
      share.updatedAt = stamp;
    }
    canvas.updatedAt = stamp;
    return { share, user };
  });

  if (result.error === "not_found") {
    res.status(404).json({ error: "Canvas not found." });
    return;
  }
  if (result.error === "forbidden") {
    res.status(403).json({ error: "Only the owner can manage shares." });
    return;
  }
  if (result.error === "invalid_email") {
    res.status(400).json({ error: "Unable to resolve user email." });
    return;
  }
  if (result.error === "owner_share") {
    res.status(400).json({ error: "Owner already has full access." });
    return;
  }

  res.status(201).json({
    share: sanitizeShare(result.share, result.user)
  });
});

app.delete("/api/canvases/:canvasId/shares/:shareId", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    const role = await pgq.resolveCanvasRole(pool, req.params.canvasId, req.auth.userId);
    if (!role) return res.status(404).json({ error: "Canvas not found." });
    if (role !== "owner") return res.status(403).json({ error: "Only the owner can manage shares." });

    const share = await pgq.findShareById(pool, req.params.shareId);
    if (!share || share.canvasId !== req.params.canvasId) return res.status(404).json({ error: "Share not found." });

    await pgq.deleteShare(pool, req.params.shareId);
    return res.status(204).send();
  }

  const status = await withDb((db) => {
    const canvas = db.canvases.find((entry) => entry.id === req.params.canvasId);
    if (!canvas) return "not_found";
    const requesterRole = findCanvasRole(db, canvas, req.auth.userId);
    if (requesterRole !== "owner") return "forbidden";

    const before = db.shares.length;
    db.shares = db.shares.filter(
      (entry) => !(entry.id === req.params.shareId && entry.canvasId === canvas.id)
    );
    if (before === db.shares.length) return "share_not_found";
    canvas.updatedAt = nowIso();
    return "ok";
  });

  if (status === "not_found") {
    res.status(404).json({ error: "Canvas not found." });
    return;
  }
  if (status === "forbidden") {
    res.status(403).json({ error: "Only the owner can manage shares." });
    return;
  }
  if (status === "share_not_found") {
    res.status(404).json({ error: "Share not found." });
    return;
  }
  res.status(204).send();
});

app.get("/api/canvases/:canvasId/tasks", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    const role = await pgq.resolveCanvasRole(pool, req.params.canvasId, req.auth.userId);
    if (!role) return res.status(403).json({ error: "Access denied." });
    const tasks = await pgq.findTasksByCanvas(pool, req.params.canvasId);
    return res.json({
      tasks: tasks.map((t) => sanitizeTask(
        t,
        t.assignedToUserId ? { id: t.assignedToUserId, name: t.assigneeName, email: t.assigneeEmail } : null,
        t.createdByUserId ? { id: t.createdByUserId, name: t.creatorName, email: t.creatorEmail } : null
      ))
    });
  }

  const db = await readDb();
  const canvas = db.canvases.find((entry) => entry.id === req.params.canvasId);
  if (!canvas) {
    res.status(404).json({ error: "Canvas not found." });
    return;
  }
  const role = findCanvasRole(db, canvas, req.auth.userId);
  if (!role) {
    res.status(403).json({ error: "Access denied." });
    return;
  }

  const tasks = db.tasks
    .filter((entry) => entry.canvasId === canvas.id)
    .map((entry) =>
      sanitizeTask(
        entry,
        db.users.find((user) => user.id === entry.assignedToUserId) || null,
        db.users.find((user) => user.id === entry.createdByUserId) || null
      )
    );

  res.json({ tasks });
});

app.post("/api/canvases/:canvasId/tasks", authRequired, async (req, res) => {
  const title = String(req.body?.title || "").trim();
  if (!title) {
    res.status(400).json({ error: "title is required." });
    return;
  }

  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    const role = await pgq.resolveCanvasRole(pool, req.params.canvasId, req.auth.userId);
    if (!role) return res.status(404).json({ error: "Canvas not found." });
    if (!hasAccess(role, "editor")) return res.status(403).json({ error: "Editor access is required to create tasks." });

    let assignee = null;
    const assigneeEmail = normalizeEmail(req.body?.assigneeEmail);
    if (assigneeEmail) {
      assignee = await pgq.findUserByEmail(pool, assigneeEmail);
      if (!assignee) {
        const baseName = String(req.body?.assigneeName || assigneeEmail.split("@")[0] || "user").trim().replace(/\s+/g, " ") || "user";
        assignee = await pgq.insertUser(pool, { name: baseName, email: assigneeEmail, authProvider: "google" });
      }
    }

    const task = await pgq.insertTask(pool, {
      canvasId: req.params.canvasId,
      title,
      dueAt: req.body?.dueAt || null,
      status: "open",
      metadata: req.body?.metadata || {},
      assignedToUserId: assignee ? assignee.id : null,
      createdByUserId: req.auth.userId
    });

    let job = null;
    if (req.body?.syncCalendar) {
      job = await pgq.insertSyncJob(pool, {
        type: "calendar",
        canvasId: req.params.canvasId,
        taskId: task.id,
        requestedByUserId: req.auth.userId,
        payload: { reason: "Task created with syncCalendar=true", assigneeEmail },
        note: "Placeholder job queued. External provider sync not implemented yet."
      });
    }

    return res.status(201).json({
      task: sanitizeTask(task, assignee, req.auth.user),
      calendarSyncJob: job || null
    });
  }

  const result = await withDb((db) => {
    const canvas = db.canvases.find((entry) => entry.id === req.params.canvasId);
    if (!canvas) return { error: "not_found" };
    const role = findCanvasRole(db, canvas, req.auth.userId);
    if (!role || !hasAccess(role, "editor")) return { error: "forbidden" };

    const assigneeEmail = normalizeEmail(req.body?.assigneeEmail);
    const assigneeName = String(req.body?.assigneeName || "").trim();
    const assignee = assigneeEmail ? ensureUserForEmail(db, assigneeEmail, assigneeName) : null;

    const stamp = nowIso();
    const task = {
      id: makeId("tsk"),
      canvasId: canvas.id,
      title,
      dueAt: req.body?.dueAt || null,
      status: "open",
      metadata: req.body?.metadata || {},
      assignedToUserId: assignee ? assignee.id : null,
      createdByUserId: req.auth.userId,
      createdAt: stamp,
      updatedAt: stamp
    };
    db.tasks.push(task);
    canvas.updatedAt = stamp;

    let job = null;
    if (req.body?.syncCalendar) {
      job = queueSyncJob(db, {
        type: "calendar",
        canvasId: canvas.id,
        taskId: task.id,
        requestedByUserId: req.auth.userId,
        payload: {
          reason: "Task created with syncCalendar=true",
          assigneeEmail
        }
      });
    }

    return { task, assignee, creator: req.auth.user, job };
  });

  if (result.error === "not_found") {
    res.status(404).json({ error: "Canvas not found." });
    return;
  }
  if (result.error === "forbidden") {
    res.status(403).json({ error: "Editor access is required to create tasks." });
    return;
  }

  res.status(201).json({
    task: sanitizeTask(result.task, result.assignee, result.creator),
    calendarSyncJob: result.job || null
  });
});

app.patch("/api/tasks/:taskId", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    const task = await pgq.findTaskById(pool, req.params.taskId);
    if (!task) return res.status(404).json({ error: "Task not found." });

    const canvas = await pgq.findCanvasById(pool, task.canvasId);
    if (!canvas) return res.status(409).json({ error: "Task canvas no longer exists." });

    const role = await pgq.resolveCanvasRole(pool, task.canvasId, req.auth.userId);
    const isAssignee = task.assignedToUserId === req.auth.userId;
    if (!role || (!hasAccess(role, "editor") && !isAssignee)) {
      return res.status(403).json({ error: "You do not have permission to update this task." });
    }

    const updates = {};
    if (typeof req.body?.title === "string") {
      const cleanTitle = req.body.title.trim();
      if (cleanTitle) updates.title = cleanTitle;
    }
    if (typeof req.body?.status === "string") {
      const next = req.body.status.trim();
      if (next === "open" || next === "done" || next === "cancelled") updates.status = next;
    }
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "dueAt")) {
      updates.dueAt = req.body.dueAt || null;
    }
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "metadata")) {
      updates.metadata = req.body.metadata || {};
    }
    if (typeof req.body?.assigneeEmail === "string") {
      const targetEmail = normalizeEmail(req.body.assigneeEmail);
      if (targetEmail) {
        let target = await pgq.findUserByEmail(pool, targetEmail);
        if (!target) {
          const baseName = String(req.body?.assigneeName || targetEmail.split("@")[0] || "user").trim().replace(/\s+/g, " ") || "user";
          target = await pgq.insertUser(pool, { name: baseName, email: targetEmail, authProvider: "google" });
        }
        updates.assignedToUserId = target ? target.id : null;
      } else {
        updates.assignedToUserId = null;
      }
    }

    const updated = await pgq.updateTask(pool, req.params.taskId, updates);
    if (!updated) return res.status(404).json({ error: "Task not found." });

    const assignee = updated.assignedToUserId ? await pgq.findUserById(pool, updated.assignedToUserId) : null;
    const creator = updated.createdByUserId ? await pgq.findUserById(pool, updated.createdByUserId) : null;
    return res.json({ task: sanitizeTask(updated, assignee, creator) });
  }

  const result = await withDb((db) => {
    const task = db.tasks.find((entry) => entry.id === req.params.taskId);
    if (!task) return { error: "not_found" };
    const canvas = db.canvases.find((entry) => entry.id === task.canvasId);
    if (!canvas) return { error: "canvas_missing" };

    const role = findCanvasRole(db, canvas, req.auth.userId);
    const isAssignee = task.assignedToUserId === req.auth.userId;
    if (!role || (!hasAccess(role, "editor") && !isAssignee)) return { error: "forbidden" };

    if (typeof req.body?.title === "string") {
      const cleanTitle = req.body.title.trim();
      if (cleanTitle) task.title = cleanTitle;
    }
    if (typeof req.body?.status === "string") {
      const next = req.body.status.trim();
      if (next === "open" || next === "done" || next === "cancelled") {
        task.status = next;
      }
    }
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "dueAt")) {
      task.dueAt = req.body.dueAt || null;
    }
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "metadata")) {
      task.metadata = req.body.metadata || {};
    }
    if (typeof req.body?.assigneeEmail === "string") {
      const target = ensureUserForEmail(db, req.body.assigneeEmail, req.body?.assigneeName || "");
      task.assignedToUserId = target ? target.id : null;
    }
    task.updatedAt = nowIso();
    canvas.updatedAt = task.updatedAt;

    const assignee = db.users.find((user) => user.id === task.assignedToUserId) || null;
    const creator = db.users.find((user) => user.id === task.createdByUserId) || null;
    return { task, assignee, creator };
  });

  if (result.error === "not_found") {
    res.status(404).json({ error: "Task not found." });
    return;
  }
  if (result.error === "canvas_missing") {
    res.status(409).json({ error: "Task canvas no longer exists." });
    return;
  }
  if (result.error === "forbidden") {
    res.status(403).json({ error: "You do not have permission to update this task." });
    return;
  }

  res.json({
    task: sanitizeTask(result.task, result.assignee, result.creator)
  });
});

app.post("/api/tasks/:taskId/sync-calendar", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    const task = await pgq.findTaskById(pool, req.params.taskId);
    if (!task) return res.status(404).json({ error: "Task not found." });
    const canvas = await pgq.findCanvasById(pool, task.canvasId);
    if (!canvas) return res.status(409).json({ error: "Task canvas no longer exists." });
    const role = await pgq.resolveCanvasRole(pool, task.canvasId, req.auth.userId);
    if (!role || !hasAccess(role, "editor")) return res.status(403).json({ error: "Editor access is required." });

    const job = await pgq.insertSyncJob(pool, {
      type: "calendar",
      canvasId: task.canvasId,
      taskId: task.id,
      requestedByUserId: req.auth.userId,
      payload: { reason: "Manual calendar sync request", calendarId: req.body?.calendarId || "primary" },
      note: "Placeholder job queued. External provider sync not implemented yet."
    });
    return res.status(202).json({
      job,
      note: "Calendar sync is placeholder-only. No Google API call is executed yet."
    });
  }

  const result = await withDb((db) => {
    const task = db.tasks.find((entry) => entry.id === req.params.taskId);
    if (!task) return { error: "not_found" };
    const canvas = db.canvases.find((entry) => entry.id === task.canvasId);
    if (!canvas) return { error: "canvas_missing" };
    const role = findCanvasRole(db, canvas, req.auth.userId);
    if (!role || !hasAccess(role, "editor")) return { error: "forbidden" };

    const job = queueSyncJob(db, {
      type: "calendar",
      canvasId: canvas.id,
      taskId: task.id,
      requestedByUserId: req.auth.userId,
      payload: {
        reason: "Manual calendar sync request",
        calendarId: req.body?.calendarId || "primary"
      }
    });
    return { job };
  });

  if (result.error === "not_found") {
    res.status(404).json({ error: "Task not found." });
    return;
  }
  if (result.error === "canvas_missing") {
    res.status(409).json({ error: "Task canvas no longer exists." });
    return;
  }
  if (result.error === "forbidden") {
    res.status(403).json({ error: "Editor access is required." });
    return;
  }

  res.status(202).json({
    job: result.job,
    note: "Calendar sync is placeholder-only. No Google API call is executed yet."
  });
});

app.post("/api/canvases/:canvasId/sync-drive", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const pool = getPgPool();
    const role = await pgq.resolveCanvasRole(pool, req.params.canvasId, req.auth.userId);
    if (!role) return res.status(404).json({ error: "Canvas not found." });
    if (!hasAccess(role, "editor")) return res.status(403).json({ error: "Editor access is required." });

    const job = await pgq.insertSyncJob(pool, {
      type: "drive",
      canvasId: req.params.canvasId,
      taskId: null,
      requestedByUserId: req.auth.userId,
      payload: { reason: "Manual Drive sync request", folderId: req.body?.folderId || null },
      note: "Placeholder job queued. External provider sync not implemented yet."
    });
    return res.status(202).json({
      job,
      note: "Drive sync is placeholder-only. No Google Drive API call is executed yet."
    });
  }

  const result = await withDb((db) => {
    const canvas = db.canvases.find((entry) => entry.id === req.params.canvasId);
    if (!canvas) return { error: "not_found" };
    const role = findCanvasRole(db, canvas, req.auth.userId);
    if (!role || !hasAccess(role, "editor")) return { error: "forbidden" };

    const job = queueSyncJob(db, {
      type: "drive",
      canvasId: canvas.id,
      taskId: null,
      requestedByUserId: req.auth.userId,
      payload: {
        reason: "Manual Drive sync request",
        folderId: req.body?.folderId || null
      }
    });
    return { job };
  });

  if (result.error === "not_found") {
    res.status(404).json({ error: "Canvas not found." });
    return;
  }
  if (result.error === "forbidden") {
    res.status(403).json({ error: "Editor access is required." });
    return;
  }

  res.status(202).json({
    job: result.job,
    note: "Drive sync is placeholder-only. No Google Drive API call is executed yet."
  });
});

app.get("/api/sync-jobs", authRequired, async (req, res) => {
  if (DB_MODE === "postgres") {
    const jobs = await pgq.findSyncJobsByUser(getPgPool(), req.auth.userId);
    return res.json({ jobs });
  }

  const db = await readDb();
  const userId = req.auth.userId;
  const list = db.syncJobs.filter((job) => {
    if (job.requestedByUserId === userId) return true;
    if (!job.canvasId) return false;
    const canvas = db.canvases.find((entry) => entry.id === job.canvasId);
    if (!canvas) return false;
    return !!findCanvasRole(db, canvas, userId);
  });
  res.json({ jobs: list });
});

// ─── Lab endpoints ──────────────────────────────────────────────────────────

app.get("/api/labs", authRequired, async (req, res) => {
  if (DB_MODE !== "postgres") return res.json({ labs: [] });
  const labs = await pgq.findDistinctLabsByUser(getPgPool(), req.auth.userId);
  res.json({ labs });
});

app.get("/api/labs/:labName/storage-boxes", authRequired, async (req, res) => {
  if (DB_MODE !== "postgres") return res.json({ boxes: [] });
  const boxes = await pgq.findLabStorageBoxes(getPgPool(), req.params.labName, req.auth.userId);
  res.json({ boxes });
});

// ─── Admin endpoints ────────────────────────────────────────────────────────

function adminRequired(req, res, next) {
  if (!req.auth?.user?.admin) return res.status(403).json({ error: "Admin access required." });
  next();
}

app.get("/api/admin/stats", authRequired, adminRequired, async (req, res) => {
  if (DB_MODE !== "postgres") return res.json({});
  const stats = await pgq.getAdminStats(getPgPool());
  res.json(stats);
});

app.get("/api/admin/users", authRequired, adminRequired, async (req, res) => {
  if (DB_MODE !== "postgres") return res.json({ users: [] });
  const limit = Math.min(parseInt(req.query.limit || "100", 10), 500);
  const offset = parseInt(req.query.offset || "0", 10);
  const users = await pgq.findAllUsers(getPgPool(), { limit, offset });
  res.json({ users });
});

app.put("/api/admin/users/:id", authRequired, adminRequired, async (req, res) => {
  if (DB_MODE !== "postgres") return res.status(501).json({ error: "Not supported." });
  const pool = getPgPool();
  const user = await pgq.findUserById(pool, req.params.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  const updates = {};
  if (typeof req.body?.name === "string") updates.name = req.body.name.trim();
  if (typeof req.body?.email === "string") updates.email = req.body.email.trim();
  if (typeof req.body?.admin === "boolean") updates.admin = req.body.admin;
  if (typeof req.body?.password === "string" && req.body.password.length >= 8) {
    const bcrypt = require("bcrypt");
    updates.pass = await bcrypt.hash(req.body.password, 12);
  }
  const updated = await pgq.updateUser(pool, req.params.id, updates);
  await pgq.insertAuditEvent(pool, {
    userId: req.auth.userId,
    action: "update_user",
    resourceType: "user",
    resourceId: req.params.id,
    details: { fields: Object.keys(updates) }
  });
  res.json({ user: updated });
});

app.delete("/api/admin/users/:id", authRequired, adminRequired, async (req, res) => {
  if (DB_MODE !== "postgres") return res.status(501).json({ error: "Not supported." });
  if (req.params.id === req.auth.userId) return res.status(400).json({ error: "Cannot delete yourself." });
  const pool = getPgPool();
  const deleted = await pgq.deleteUser(pool, req.params.id);
  if (!deleted) return res.status(404).json({ error: "User not found." });
  await pgq.insertAuditEvent(pool, {
    userId: req.auth.userId,
    action: "delete_user",
    resourceType: "user",
    resourceId: req.params.id,
    details: {}
  });
  res.json({ ok: true });
});

app.get("/api/admin/labs", authRequired, adminRequired, async (req, res) => {
  if (DB_MODE !== "postgres") return res.json({ labs: [] });
  const labs = await pgq.findDistinctLabs(getPgPool());
  res.json({ labs });
});

app.put("/api/admin/labs/:name", authRequired, adminRequired, async (req, res) => {
  if (DB_MODE !== "postgres") return res.status(501).json({ error: "Not supported." });
  const newName = String(req.body?.newName || "").trim();
  if (!newName) return res.status(400).json({ error: "newName is required." });
  const count = await pgq.renameLab(getPgPool(), req.params.name, newName);
  await pgq.insertAuditEvent(getPgPool(), {
    userId: req.auth.userId,
    action: "rename_lab",
    resourceType: "lab",
    resourceId: req.params.name,
    details: { newName, affectedProjects: count }
  });
  res.json({ ok: true, affectedProjects: count });
});

app.delete("/api/admin/labs/:name", authRequired, adminRequired, async (req, res) => {
  if (DB_MODE !== "postgres") return res.status(501).json({ error: "Not supported." });
  const count = await pgq.removeLab(getPgPool(), req.params.name);
  await pgq.insertAuditEvent(getPgPool(), {
    userId: req.auth.userId,
    action: "remove_lab",
    resourceType: "lab",
    resourceId: req.params.name,
    details: { affectedProjects: count }
  });
  res.json({ ok: true, affectedProjects: count });
});

app.get("/api/admin/projects", authRequired, adminRequired, async (req, res) => {
  if (DB_MODE !== "postgres") return res.json({ projects: [] });
  const limit = Math.min(parseInt(req.query.limit || "100", 10), 500);
  const offset = parseInt(req.query.offset || "0", 10);
  const projects = await pgq.findAllCanvasesAdmin(getPgPool(), { limit, offset });
  res.json({ projects });
});

app.get("/api/admin/audit", authRequired, adminRequired, async (req, res) => {
  if (DB_MODE !== "postgres") return res.json({ events: [] });
  const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
  const events = await pgq.findRecentAuditEvents(getPgPool(), { limit });
  res.json({ events });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API route not found." });
});

app.use(express.static(ROOT_DIR, {
  extensions: ["html"],
  dotfiles: "ignore",
  etag: true,
  maxAge: IS_PRODUCTION ? "1h" : 0,
  index: false
}));

let cachedIndexHtml = null;

async function serveIndexHtml(_req, res) {
  try {
    let html;
    if (IS_PRODUCTION && cachedIndexHtml) {
      html = cachedIndexHtml;
    } else {
      html = await fs.readFile(path.join(ROOT_DIR, "index.html"), "utf8");
      if (CELLCULTURE_GOOGLE_CLIENT_ID) {
        const safeId = CELLCULTURE_GOOGLE_CLIENT_ID.replace(/[<>"'&\\]/g, "");
        html = html.replace(
          'window.CELLCULTURE_GOOGLE_CLIENT_ID = window.CELLCULTURE_GOOGLE_CLIENT_ID || ""',
          `window.CELLCULTURE_GOOGLE_CLIENT_ID = window.CELLCULTURE_GOOGLE_CLIENT_ID || "${safeId}"`
        );
        html = html.replace(
          '<meta name="google-signin-client_id" content="">',
          `<meta name="google-signin-client_id" content="${safeId}">`
        );
      }
      if (REQUIRE_AUTH) {
        html = html.replace("window.__REQUIRE_AUTH = false", "window.__REQUIRE_AUTH = true");
      }
      if (IS_PRODUCTION) cachedIndexHtml = html;
    }
    res.type("html").send(html);
  } catch {
    res.status(500).send("Failed to load application.");
  }
}

app.get("/", serveIndexHtml);
app.get("/index.html", serveIndexHtml);

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ error: "API route not found." });
    return;
  }
  serveIndexHtml(req, res);
});

const ratePruneInterval = setInterval(pruneRateBuckets, Math.max(API_RATE_WINDOW_MS, AUTH_RATE_WINDOW_MS));
if (typeof ratePruneInterval.unref === "function") ratePruneInterval.unref();

if (IS_PRODUCTION && !SESSION_TOKEN_SECRET) {
  // eslint-disable-next-line no-console
  console.error("[server] SESSION_TOKEN_SECRET must be set in production.");
  process.exit(1);
}

if (IS_PRODUCTION && !APP_BASE_URL && CORS_ALLOWED_ORIGINS.length === 0) {
  // eslint-disable-next-line no-console
  console.warn("[server] APP_BASE_URL and CORS_ALLOWED_ORIGINS are unset; cross-origin requests will be denied.");
}

if (IS_PRODUCTION && !CELLCULTURE_GOOGLE_CLIENT_ID) {
  // eslint-disable-next-line no-console
  console.warn("[server] CELLCULTURE_GOOGLE_CLIENT_ID is not set; Google sign-in will be unavailable.");
}

ensureStorage()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] Running at http://localhost:${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`[server] API ready at http://localhost:${PORT}/api/health (db=${DB_MODE})`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[server] Failed to start", err);
    process.exit(1);
  });
