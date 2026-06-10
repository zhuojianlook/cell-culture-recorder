"use strict";

const fs = require("fs/promises");
const path = require("path");
const { Pool } = require("pg");

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

function toIsoOrNow(value) {
  const date = new Date(value || new Date());
  if (Number.isFinite(date.getTime())) return date.toISOString();
  return new Date().toISOString();
}

function toOptionalIso(value) {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(value);
  if (Number.isFinite(date.getTime())) return date.toISOString();
  return null;
}

function ensureArrayClone(value) {
  if (!Array.isArray(value)) return [];
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return [];
  }
}

async function run() {
  const databaseUrl = String(process.env.DATABASE_URL || "").trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const fileDbPath = path.join(__dirname, "..", "data", "db.json");
  const schemaPath = path.join(__dirname, "..", "sql", "postgres-schema.sql");

  const [dbRaw, schemaSql] = await Promise.all([
    fs.readFile(fileDbPath, "utf8"),
    fs.readFile(schemaPath, "utf8")
  ]);
  const parsed = normalizeDbShape(JSON.parse(dbRaw));

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(schemaSql);
    await client.query("TRUNCATE TABLE billing_accounts, project_states, sync_jobs, tasks, shares, sessions, canvases, users RESTART IDENTITY CASCADE");

    for (const user of parsed.users) {
      await client.query(
        `INSERT INTO users (id, name, email, auth_provider, google_sub, pass, admin, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          String(user.id || ""),
          String(user.name || ""),
          String(user.email || ""),
          String(user.authProvider || "local"),
          String(user.googleSub || ""),
          String(user.pass || ""),
          !!user.admin,
          toIsoOrNow(user.createdAt),
          toIsoOrNow(user.updatedAt)
        ]
      );
    }

    for (const canvas of parsed.canvases) {
      await client.query(
        `INSERT INTO canvases (id, name, owner_user_id, data, created_at, updated_at)
         VALUES ($1,$2,$3,$4::jsonb,$5,$6)`,
        [
          String(canvas.id || ""),
          String(canvas.name || "Untitled Canvas"),
          String(canvas.ownerUserId || ""),
          JSON.stringify(canvas.data && typeof canvas.data === "object" ? canvas.data : {}),
          toIsoOrNow(canvas.createdAt),
          toIsoOrNow(canvas.updatedAt)
        ]
      );
    }

    for (const session of parsed.sessions) {
      await client.query(
        `INSERT INTO sessions (id, user_id, token, provider, created_at, expires_at)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          String(session.id || ""),
          String(session.userId || ""),
          String(session.token || ""),
          String(session.provider || "local"),
          toIsoOrNow(session.createdAt),
          toIsoOrNow(session.expiresAt)
        ]
      );
    }

    for (const share of parsed.shares) {
      await client.query(
        `INSERT INTO shares (id, canvas_id, user_id, role, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          String(share.id || ""),
          String(share.canvasId || ""),
          String(share.userId || ""),
          String(share.role || "viewer"),
          toIsoOrNow(share.createdAt),
          toIsoOrNow(share.updatedAt)
        ]
      );
    }

    for (const task of parsed.tasks) {
      await client.query(
        `INSERT INTO tasks
         (id, canvas_id, title, due_at, status, metadata, assigned_to_user_id, created_by_user_id, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10)`,
        [
          String(task.id || ""),
          String(task.canvasId || ""),
          String(task.title || ""),
          toOptionalIso(task.dueAt),
          String(task.status || "open"),
          JSON.stringify(task.metadata && typeof task.metadata === "object" ? task.metadata : {}),
          task.assignedToUserId ? String(task.assignedToUserId) : null,
          task.createdByUserId ? String(task.createdByUserId) : null,
          toIsoOrNow(task.createdAt),
          toIsoOrNow(task.updatedAt)
        ]
      );
    }

    for (const job of parsed.syncJobs) {
      await client.query(
        `INSERT INTO sync_jobs
         (id, type, status, canvas_id, task_id, requested_by_user_id, payload, note, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10)`,
        [
          String(job.id || ""),
          String(job.type || "unknown"),
          String(job.status || "queued"),
          job.canvasId ? String(job.canvasId) : null,
          job.taskId ? String(job.taskId) : null,
          job.requestedByUserId ? String(job.requestedByUserId) : null,
          JSON.stringify(job.payload && typeof job.payload === "object" ? job.payload : {}),
          String(job.note || ""),
          toIsoOrNow(job.createdAt),
          toIsoOrNow(job.updatedAt)
        ]
      );
    }

    for (const state of parsed.projectStates) {
      const userId = String(state?.userId || "");
      const projectId = String(state?.projectId || "").trim().toLowerCase() || "default-project";
      if (!userId) continue;
      await client.query(
        `INSERT INTO project_states
         (id, user_id, project_id, inventory, storage, storage_boxes, media_formulations, created_at, updated_at)
         VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb,$7::jsonb,$8,$9)`,
        [
          String(state?.id || `pst_${Math.random().toString(36).slice(2, 10)}`),
          userId,
          projectId,
          JSON.stringify(ensureArrayClone(state?.inventory)),
          JSON.stringify(ensureArrayClone(state?.storage)),
          JSON.stringify(ensureArrayClone(state?.storageBoxes)),
          JSON.stringify(ensureArrayClone(state?.mediaFormulations)),
          toIsoOrNow(state?.createdAt),
          toIsoOrNow(state?.updatedAt)
        ]
      );
    }

    for (const account of parsed.billingAccounts) {
      const userId = String(account?.userId || "");
      if (!userId) continue;
      await client.query(
        `INSERT INTO billing_accounts
         (id, user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, subscription_status, current_period_end, cancel_at_period_end, latest_checkout_session_id, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          String(account?.id || `bil_${Math.random().toString(36).slice(2, 10)}`),
          userId,
          String(account?.stripeCustomerId || ""),
          String(account?.stripeSubscriptionId || ""),
          String(account?.stripePriceId || ""),
          String(account?.subscriptionStatus || "free"),
          toOptionalIso(account?.currentPeriodEnd),
          !!account?.cancelAtPeriodEnd,
          String(account?.latestCheckoutSessionId || ""),
          toIsoOrNow(account?.createdAt),
          toIsoOrNow(account?.updatedAt)
        ]
      );
    }

    await client.query("COMMIT");
    // eslint-disable-next-line no-console
    console.log("[db:migrate] File DB migrated into PostgreSQL successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[db:migrate] Failed:", err.message || err);
  process.exit(1);
});
