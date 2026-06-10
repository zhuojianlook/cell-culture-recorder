"use strict";

/**
 * Targeted per-row SQL query functions for PostgreSQL mode.
 *
 * Replaces the bulk readDbPostgres/writeDbPostgres pattern with efficient
 * single-row operations. Each function accepts a pool (or client) as the
 * first argument and returns mapped JS objects using the row-mapper helpers
 * exported from server.js.
 *
 * Row mappers are injected via init() so this module has no circular dependency
 * on server.js.
 */

let mappers = null;

/**
 * Call once at startup to inject row mapper functions from server.js.
 * @param {object} m - { mapUserRow, mapSessionRow, mapCanvasRow, mapShareRow,
 *   mapTaskRow, mapSyncJobRow, mapProjectStateRow, mapBillingAccountRow,
 *   toIsoOrNow, toOptionalIso, parseObjectField, cleanRole, nowIso, makeId,
 *   isPlainObject, normalizeCanvasDataPayload, MAX_CANVAS_DATA_BYTES }
 */
function init(m) {
  mappers = m;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function one(rows, mapper) {
  return rows.length > 0 ? mapper(rows[0]) : null;
}

function many(rows, mapper) {
  return rows.map(mapper);
}

// ─── users ──────────────────────────────────────────────────────────────────

async function findUserById(pool, id) {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return one(rows, mappers.mapUserRow);
}

async function findUserByEmail(pool, email) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND email <> ''",
    [String(email || "").trim()]
  );
  return one(rows, mappers.mapUserRow);
}

async function findUserByGoogleSub(pool, googleSub) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE google_sub = $1 AND google_sub <> ''",
    [String(googleSub || "")]
  );
  return one(rows, mappers.mapUserRow);
}

async function insertUser(pool, user) {
  const now = mappers.nowIso();
  const { rows } = await pool.query(
    `INSERT INTO users (id, name, email, auth_provider, google_sub, pass, admin, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [
      user.id || mappers.makeId("usr"),
      String(user.name || ""),
      String(user.email || ""),
      String(user.authProvider || "local"),
      String(user.googleSub || ""),
      String(user.pass || ""),
      !!user.admin,
      user.createdAt || now,
      user.updatedAt || now
    ]
  );
  return one(rows, mappers.mapUserRow);
}

async function updateUser(pool, id, fields) {
  const sets = [];
  const vals = [id];
  let idx = 2;
  if (fields.name !== undefined) { sets.push(`name = $${idx}`); vals.push(String(fields.name)); idx++; }
  if (fields.email !== undefined) { sets.push(`email = $${idx}`); vals.push(String(fields.email)); idx++; }
  if (fields.authProvider !== undefined) { sets.push(`auth_provider = $${idx}`); vals.push(String(fields.authProvider)); idx++; }
  if (fields.googleSub !== undefined) { sets.push(`google_sub = $${idx}`); vals.push(String(fields.googleSub)); idx++; }
  if (fields.pass !== undefined) { sets.push(`pass = $${idx}`); vals.push(String(fields.pass)); idx++; }
  if (fields.admin !== undefined) { sets.push(`admin = $${idx}`); vals.push(!!fields.admin); idx++; }
  if (sets.length === 0) return findUserById(pool, id);
  sets.push(`updated_at = $${idx}`); vals.push(mappers.nowIso()); idx++;
  const { rows } = await pool.query(
    `UPDATE users SET ${sets.join(", ")} WHERE id = $1 RETURNING *`,
    vals
  );
  return one(rows, mappers.mapUserRow);
}

// ─── sessions ───────────────────────────────────────────────────────────────

async function findSessionByToken(pool, hashedToken) {
  const { rows } = await pool.query(
    "SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()",
    [hashedToken]
  );
  return one(rows, mappers.mapSessionRow);
}

async function findSessionByTokenAny(pool, hashedToken) {
  // Includes expired — used for backward-compat plaintext token matching
  const { rows } = await pool.query(
    "SELECT * FROM sessions WHERE token = $1",
    [hashedToken]
  );
  return one(rows, mappers.mapSessionRow);
}

async function findAllActiveSessions(pool) {
  const { rows } = await pool.query(
    "SELECT * FROM sessions WHERE expires_at > NOW()"
  );
  return many(rows, mappers.mapSessionRow);
}

async function insertSession(pool, session) {
  const { rows } = await pool.query(
    `INSERT INTO sessions (id, user_id, token, provider, created_at, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [
      session.id || mappers.makeId("ses"),
      session.userId,
      session.token,
      session.provider || "local",
      session.createdAt || mappers.nowIso(),
      session.expiresAt
    ]
  );
  return one(rows, mappers.mapSessionRow);
}

async function deleteSession(pool, id) {
  await pool.query("DELETE FROM sessions WHERE id = $1", [id]);
}

async function deleteExpiredSessions(pool) {
  const { rowCount } = await pool.query("DELETE FROM sessions WHERE expires_at <= NOW()");
  return rowCount;
}

async function updateSessionToken(pool, id, newTokenHash) {
  await pool.query("UPDATE sessions SET token = $1 WHERE id = $2", [newTokenHash, id]);
}

// ─── canvases ───────────────────────────────────────────────────────────────

async function findCanvasById(pool, id) {
  const { rows } = await pool.query("SELECT * FROM canvases WHERE id = $1", [id]);
  return one(rows, mappers.mapCanvasRow);
}

async function findCanvasesByUser(pool, userId) {
  const { rows } = await pool.query(
    `SELECT c.*,
       CASE WHEN c.owner_user_id = $1 THEN 'owner' ELSE s.role END AS effective_role,
       (SELECT COUNT(*) FROM shares WHERE canvas_id = c.id) AS share_count
     FROM canvases c
     LEFT JOIN shares s ON s.canvas_id = c.id AND s.user_id = $1
     WHERE c.owner_user_id = $1 OR s.user_id = $1
     ORDER BY c.updated_at DESC`,
    [userId]
  );
  return rows.map((row) => {
    const canvas = mappers.mapCanvasRow(row);
    canvas.effectiveRole = mappers.cleanRole(row.effective_role);
    canvas.shareCount = parseInt(row.share_count, 10) || 0;
    canvas.lab = String(row.lab || "");
    return canvas;
  });
}

async function insertCanvas(pool, canvas) {
  const now = mappers.nowIso();
  const { rows } = await pool.query(
    `INSERT INTO canvases (id, name, owner_user_id, lab, data, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7) RETURNING *`,
    [
      canvas.id || mappers.makeId("cvs"),
      String(canvas.name || "Untitled Canvas"),
      canvas.ownerUserId,
      String(canvas.lab || ""),
      JSON.stringify(canvas.data && typeof canvas.data === "object" ? canvas.data : {}),
      canvas.createdAt || now,
      canvas.updatedAt || now
    ]
  );
  return one(rows, mappers.mapCanvasRow);
}

async function updateCanvasData(pool, id, data, name, lab) {
  const sets = ["updated_at = NOW()"];
  const vals = [id];
  let idx = 2;
  if (data !== undefined) {
    sets.push(`data = $${idx}::jsonb`);
    vals.push(JSON.stringify(data));
    idx++;
  }
  if (name !== undefined && name !== null && name !== "") {
    sets.push(`name = $${idx}`);
    vals.push(String(name));
    idx++;
  }
  if (lab !== undefined) {
    sets.push(`lab = $${idx}`);
    vals.push(String(lab || ""));
    idx++;
  }
  const { rows } = await pool.query(
    `UPDATE canvases SET ${sets.join(", ")} WHERE id = $1 RETURNING *`,
    vals
  );
  return one(rows, mappers.mapCanvasRow);
}

async function deleteCanvas(pool, id) {
  const { rowCount } = await pool.query("DELETE FROM canvases WHERE id = $1", [id]);
  return rowCount > 0;
}

// ─── shares ─────────────────────────────────────────────────────────────────

async function findSharesByCanvas(pool, canvasId) {
  const { rows } = await pool.query(
    `SELECT s.*, u.name AS user_name, u.email AS user_email
     FROM shares s
     JOIN users u ON u.id = s.user_id
     WHERE s.canvas_id = $1
     ORDER BY s.created_at ASC`,
    [canvasId]
  );
  return rows.map((row) => {
    const share = mappers.mapShareRow(row);
    share.userName = row.user_name || "";
    share.userEmail = row.user_email || "";
    return share;
  });
}

async function findShareById(pool, id) {
  const { rows } = await pool.query("SELECT * FROM shares WHERE id = $1", [id]);
  return one(rows, mappers.mapShareRow);
}

async function findShareByCanvasAndUser(pool, canvasId, userId) {
  const { rows } = await pool.query(
    "SELECT * FROM shares WHERE canvas_id = $1 AND user_id = $2",
    [canvasId, userId]
  );
  return one(rows, mappers.mapShareRow);
}

async function insertShare(pool, share) {
  const now = mappers.nowIso();
  const { rows } = await pool.query(
    `INSERT INTO shares (id, canvas_id, user_id, role, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (canvas_id, user_id) DO UPDATE SET role = EXCLUDED.role, updated_at = EXCLUDED.updated_at
     RETURNING *`,
    [
      share.id || mappers.makeId("shr"),
      share.canvasId,
      share.userId,
      mappers.cleanRole(share.role),
      share.createdAt || now,
      share.updatedAt || now
    ]
  );
  return one(rows, mappers.mapShareRow);
}

async function updateShareRole(pool, id, role) {
  const { rows } = await pool.query(
    "UPDATE shares SET role = $2, updated_at = NOW() WHERE id = $1 RETURNING *",
    [id, mappers.cleanRole(role)]
  );
  return one(rows, mappers.mapShareRow);
}

async function deleteShare(pool, id) {
  const { rowCount } = await pool.query("DELETE FROM shares WHERE id = $1", [id]);
  return rowCount > 0;
}

// ─── canvas role resolution ─────────────────────────────────────────────────

async function resolveCanvasRole(pool, canvasId, userId) {
  const { rows } = await pool.query(
    `SELECT
       CASE WHEN c.owner_user_id = $2 THEN 'owner' ELSE s.role END AS role
     FROM canvases c
     LEFT JOIN shares s ON s.canvas_id = c.id AND s.user_id = $2
     WHERE c.id = $1 AND (c.owner_user_id = $2 OR s.user_id = $2)`,
    [canvasId, userId]
  );
  if (rows.length === 0) return null;
  return mappers.cleanRole(rows[0].role);
}

// ─── tasks ──────────────────────────────────────────────────────────────────

async function findTasksByCanvas(pool, canvasId) {
  const { rows } = await pool.query(
    `SELECT t.*,
       au.name AS assignee_name, au.email AS assignee_email,
       cu.name AS creator_name, cu.email AS creator_email
     FROM tasks t
     LEFT JOIN users au ON au.id = t.assigned_to_user_id
     LEFT JOIN users cu ON cu.id = t.created_by_user_id
     WHERE t.canvas_id = $1
     ORDER BY t.created_at ASC`,
    [canvasId]
  );
  return rows.map((row) => {
    const task = mappers.mapTaskRow(row);
    task.assigneeName = row.assignee_name || "";
    task.assigneeEmail = row.assignee_email || "";
    task.creatorName = row.creator_name || "";
    task.creatorEmail = row.creator_email || "";
    return task;
  });
}

async function findTaskById(pool, id) {
  const { rows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
  return one(rows, mappers.mapTaskRow);
}

async function insertTask(pool, task) {
  const now = mappers.nowIso();
  const { rows } = await pool.query(
    `INSERT INTO tasks (id, canvas_id, title, due_at, status, metadata, assigned_to_user_id, created_by_user_id, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10) RETURNING *`,
    [
      task.id || mappers.makeId("tsk"),
      task.canvasId,
      String(task.title || ""),
      task.dueAt || null,
      String(task.status || "open"),
      JSON.stringify(task.metadata && typeof task.metadata === "object" ? task.metadata : {}),
      task.assignedToUserId || null,
      task.createdByUserId || null,
      task.createdAt || now,
      task.updatedAt || now
    ]
  );
  return one(rows, mappers.mapTaskRow);
}

async function updateTask(pool, id, fields) {
  const sets = [];
  const vals = [id];
  let idx = 2;
  if (fields.title !== undefined) { sets.push(`title = $${idx}`); vals.push(String(fields.title)); idx++; }
  if (fields.dueAt !== undefined) { sets.push(`due_at = $${idx}`); vals.push(fields.dueAt || null); idx++; }
  if (fields.status !== undefined) { sets.push(`status = $${idx}`); vals.push(String(fields.status)); idx++; }
  if (fields.metadata !== undefined) { sets.push(`metadata = $${idx}::jsonb`); vals.push(JSON.stringify(fields.metadata)); idx++; }
  if (fields.assignedToUserId !== undefined) { sets.push(`assigned_to_user_id = $${idx}`); vals.push(fields.assignedToUserId || null); idx++; }
  if (sets.length === 0) return findTaskById(pool, id);
  sets.push(`updated_at = $${idx}`); vals.push(mappers.nowIso()); idx++;
  const { rows } = await pool.query(
    `UPDATE tasks SET ${sets.join(", ")} WHERE id = $1 RETURNING *`,
    vals
  );
  return one(rows, mappers.mapTaskRow);
}

// ─── sync jobs ──────────────────────────────────────────────────────────────

async function insertSyncJob(pool, job) {
  const now = mappers.nowIso();
  const { rows } = await pool.query(
    `INSERT INTO sync_jobs (id, type, status, canvas_id, task_id, requested_by_user_id, payload, note, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10) RETURNING *`,
    [
      job.id || mappers.makeId("sjb"),
      String(job.type || "unknown"),
      String(job.status || "queued"),
      job.canvasId || null,
      job.taskId || null,
      job.requestedByUserId || null,
      JSON.stringify(job.payload && typeof job.payload === "object" ? job.payload : {}),
      String(job.note || ""),
      job.createdAt || now,
      job.updatedAt || now
    ]
  );
  return one(rows, mappers.mapSyncJobRow);
}

async function findSyncJobsByCanvas(pool, canvasId) {
  const { rows } = await pool.query(
    "SELECT * FROM sync_jobs WHERE canvas_id = $1 ORDER BY created_at DESC",
    [canvasId]
  );
  return many(rows, mappers.mapSyncJobRow);
}

async function findSyncJobsByUser(pool, userId) {
  const { rows } = await pool.query(
    `SELECT sj.* FROM sync_jobs sj
     LEFT JOIN canvases c ON c.id = sj.canvas_id
     LEFT JOIN shares s ON s.canvas_id = c.id AND s.user_id = $1
     WHERE sj.requested_by_user_id = $1
       OR c.owner_user_id = $1
       OR s.user_id = $1
     ORDER BY sj.created_at DESC`,
    [userId]
  );
  return many(rows, mappers.mapSyncJobRow);
}

async function updateSyncJob(pool, id, fields) {
  const sets = [];
  const vals = [id];
  let idx = 2;
  if (fields.status !== undefined) { sets.push(`status = $${idx}`); vals.push(String(fields.status)); idx++; }
  if (fields.note !== undefined) { sets.push(`note = $${idx}`); vals.push(String(fields.note)); idx++; }
  if (sets.length === 0) return null;
  sets.push(`updated_at = $${idx}`); vals.push(mappers.nowIso()); idx++;
  const { rows } = await pool.query(
    `UPDATE sync_jobs SET ${sets.join(", ")} WHERE id = $1 RETURNING *`,
    vals
  );
  return one(rows, mappers.mapSyncJobRow);
}

// ─── project states ─────────────────────────────────────────────────────────

async function findProjectState(pool, userId, projectId) {
  const { rows } = await pool.query(
    "SELECT * FROM project_states WHERE user_id = $1 AND LOWER(project_id) = LOWER($2)",
    [userId, String(projectId || "default-project")]
  );
  return one(rows, mappers.mapProjectStateRow);
}

async function upsertProjectState(pool, state) {
  const now = mappers.nowIso();
  const projectId = String(state.projectId || "default-project").trim().toLowerCase();
  const invJson = state.inventory !== undefined ? JSON.stringify(state.inventory) : "[]";
  const stoJson = state.storage !== undefined ? JSON.stringify(state.storage) : "[]";
  const boxJson = state.storageBoxes !== undefined ? JSON.stringify(state.storageBoxes) : "[]";
  const mfJson = state.mediaFormulations !== undefined ? JSON.stringify(state.mediaFormulations) : "[]";
  const { rows } = await pool.query(
    `INSERT INTO project_states (id, user_id, project_id, inventory, storage, storage_boxes, media_formulations, created_at, updated_at)
     VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb,$7::jsonb,$8,$9)
     ON CONFLICT (user_id, project_id)
     DO UPDATE SET
       inventory = CASE WHEN $10::boolean THEN $4::jsonb ELSE project_states.inventory END,
       storage = CASE WHEN $11::boolean THEN $5::jsonb ELSE project_states.storage END,
       storage_boxes = CASE WHEN $12::boolean THEN $6::jsonb ELSE project_states.storage_boxes END,
       media_formulations = CASE WHEN $13::boolean THEN $7::jsonb ELSE project_states.media_formulations END,
       updated_at = $9
     RETURNING *`,
    [
      state.id || mappers.makeId("pst"),
      state.userId,
      projectId,
      invJson,
      stoJson,
      boxJson,
      mfJson,
      state.createdAt || now,
      now,
      state.inventory !== undefined,
      state.storage !== undefined,
      state.storageBoxes !== undefined,
      state.mediaFormulations !== undefined
    ]
  );
  return one(rows, mappers.mapProjectStateRow);
}

// ─── billing ────────────────────────────────────────────────────────────────

async function findBillingByUserId(pool, userId) {
  const { rows } = await pool.query(
    "SELECT * FROM billing_accounts WHERE user_id = $1",
    [userId]
  );
  return one(rows, mappers.mapBillingAccountRow);
}

async function upsertBillingAccount(pool, account) {
  const now = mappers.nowIso();
  const { rows } = await pool.query(
    `INSERT INTO billing_accounts
       (id, user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id,
        subscription_status, current_period_end, cancel_at_period_end,
        latest_checkout_session_id, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (user_id) DO UPDATE SET
       stripe_customer_id = EXCLUDED.stripe_customer_id,
       stripe_subscription_id = EXCLUDED.stripe_subscription_id,
       stripe_price_id = EXCLUDED.stripe_price_id,
       subscription_status = EXCLUDED.subscription_status,
       current_period_end = EXCLUDED.current_period_end,
       cancel_at_period_end = EXCLUDED.cancel_at_period_end,
       latest_checkout_session_id = EXCLUDED.latest_checkout_session_id,
       updated_at = EXCLUDED.updated_at
     RETURNING *`,
    [
      account.id || mappers.makeId("bil"),
      account.userId,
      String(account.stripeCustomerId || ""),
      String(account.stripeSubscriptionId || ""),
      String(account.stripePriceId || ""),
      String(account.subscriptionStatus || "free"),
      account.currentPeriodEnd || null,
      !!account.cancelAtPeriodEnd,
      String(account.latestCheckoutSessionId || ""),
      account.createdAt || now,
      now
    ]
  );
  return one(rows, mappers.mapBillingAccountRow);
}

async function findBillingByCustomerId(pool, customerId) {
  const { rows } = await pool.query(
    "SELECT * FROM billing_accounts WHERE stripe_customer_id = $1",
    [String(customerId || "")]
  );
  return one(rows, mappers.mapBillingAccountRow);
}

async function updateBillingAccount(pool, id, fields) {
  const sets = [];
  const vals = [id];
  let idx = 2;
  if (fields.stripeCustomerId !== undefined) { sets.push(`stripe_customer_id = $${idx}`); vals.push(String(fields.stripeCustomerId)); idx++; }
  if (fields.stripeSubscriptionId !== undefined) { sets.push(`stripe_subscription_id = $${idx}`); vals.push(String(fields.stripeSubscriptionId)); idx++; }
  if (fields.stripePriceId !== undefined) { sets.push(`stripe_price_id = $${idx}`); vals.push(String(fields.stripePriceId)); idx++; }
  if (fields.subscriptionStatus !== undefined) { sets.push(`subscription_status = $${idx}`); vals.push(String(fields.subscriptionStatus)); idx++; }
  if (fields.currentPeriodEnd !== undefined) { sets.push(`current_period_end = $${idx}`); vals.push(fields.currentPeriodEnd || null); idx++; }
  if (fields.cancelAtPeriodEnd !== undefined) { sets.push(`cancel_at_period_end = $${idx}`); vals.push(!!fields.cancelAtPeriodEnd); idx++; }
  if (fields.latestCheckoutSessionId !== undefined) { sets.push(`latest_checkout_session_id = $${idx}`); vals.push(String(fields.latestCheckoutSessionId)); idx++; }
  if (sets.length === 0) return null;
  sets.push(`updated_at = $${idx}`); vals.push(mappers.nowIso()); idx++;
  const { rows } = await pool.query(
    `UPDATE billing_accounts SET ${sets.join(", ")} WHERE id = $1 RETURNING *`,
    vals
  );
  return one(rows, mappers.mapBillingAccountRow);
}

// ─── health / counts ────────────────────────────────────────────────────────

async function getTableCounts(pool) {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users)::int AS users,
      (SELECT COUNT(*) FROM canvases)::int AS canvases,
      (SELECT COUNT(*) FROM shares)::int AS shares,
      (SELECT COUNT(*) FROM tasks)::int AS tasks,
      (SELECT COUNT(*) FROM sync_jobs)::int AS sync_jobs,
      (SELECT COUNT(*) FROM project_states)::int AS project_states,
      (SELECT COUNT(*) FROM billing_accounts)::int AS billing_accounts
  `);
  const r = rows[0];
  return {
    users: r.users,
    canvases: r.canvases,
    shares: r.shares,
    tasks: r.tasks,
    syncJobs: r.sync_jobs,
    projectStates: r.project_states,
    billingAccounts: r.billing_accounts
  };
}

// ─── labs ────────────────────────────────────────────────────────────────────

async function findDistinctLabsByUser(pool, userId) {
  const { rows } = await pool.query(
    `SELECT DISTINCT c.lab FROM canvases c
     LEFT JOIN shares s ON s.canvas_id = c.id AND s.user_id = $1
     WHERE (c.owner_user_id = $1 OR s.user_id = $1) AND c.lab <> ''
     ORDER BY c.lab`,
    [userId]
  );
  return rows.map((r) => r.lab);
}

async function findLabStorageBoxes(pool, labName, userId) {
  const { rows } = await pool.query(
    `SELECT ps.storage_boxes, c.name AS canvas_name, c.id AS canvas_id
     FROM project_states ps
     JOIN canvases c ON c.id = ps.project_id
     LEFT JOIN shares s ON s.canvas_id = c.id AND s.user_id = $2
     WHERE c.lab = $1 AND (c.owner_user_id = $2 OR s.user_id = $2)`,
    [labName, userId]
  );
  const boxes = [];
  for (const row of rows) {
    const arr = Array.isArray(row.storage_boxes) ? row.storage_boxes : [];
    for (const box of arr) {
      if (box && box.shared_with_lab) {
        boxes.push({ ...box, sourceProject: row.canvas_name, sourceCanvasId: row.canvas_id });
      }
    }
  }
  return boxes;
}

// ─── admin queries ──────────────────────────────────────────────────────────

async function findAllUsers(pool, { limit = 100, offset = 0 } = {}) {
  const { rows } = await pool.query(
    `SELECT u.*,
       (SELECT COUNT(*) FROM canvases WHERE owner_user_id = u.id)::int AS canvas_count,
       (SELECT COUNT(*) FROM shares WHERE user_id = u.id)::int AS share_count
     FROM users u ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows.map((r) => {
    const u = mappers.mapUserRow(r);
    u.canvasCount = r.canvas_count || 0;
    u.shareCount = r.share_count || 0;
    return u;
  });
}

async function deleteUser(pool, id) {
  const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [id]);
  return rowCount > 0;
}

async function findAllCanvasesAdmin(pool, { limit = 100, offset = 0 } = {}) {
  const { rows } = await pool.query(
    `SELECT c.*,
       u.name AS owner_name, u.email AS owner_email,
       (SELECT COUNT(*) FROM shares WHERE canvas_id = c.id)::int AS share_count
     FROM canvases c
     LEFT JOIN users u ON u.id = c.owner_user_id
     ORDER BY c.updated_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows.map((r) => {
    const c = mappers.mapCanvasRow(r);
    c.ownerName = r.owner_name || "";
    c.ownerEmail = r.owner_email || "";
    c.shareCount = r.share_count || 0;
    c.lab = String(r.lab || "");
    return c;
  });
}

async function findDistinctLabs(pool) {
  const { rows } = await pool.query(
    `SELECT lab, COUNT(*)::int AS project_count FROM canvases WHERE lab <> '' GROUP BY lab ORDER BY lab`
  );
  return rows.map((r) => ({ name: r.lab, projectCount: r.project_count }));
}

async function renameLab(pool, oldName, newName) {
  const { rowCount } = await pool.query(
    "UPDATE canvases SET lab = $2, updated_at = NOW() WHERE lab = $1",
    [oldName, newName]
  );
  return rowCount;
}

async function removeLab(pool, name) {
  const { rowCount } = await pool.query(
    "UPDATE canvases SET lab = '', updated_at = NOW() WHERE lab = $1",
    [name]
  );
  return rowCount;
}

async function insertAuditEvent(pool, event) {
  const now = mappers.nowIso();
  await pool.query(
    `INSERT INTO audit_events (id, user_id, action, resource_type, resource_id, details, created_at)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)`,
    [
      event.id || mappers.makeId("aud"),
      event.userId || null,
      event.action,
      event.resourceType,
      event.resourceId || null,
      JSON.stringify(event.details || {}),
      event.createdAt || now
    ]
  );
}

async function findRecentAuditEvents(pool, { limit = 50 } = {}) {
  const { rows } = await pool.query(
    `SELECT ae.*, u.name AS user_name, u.email AS user_email
     FROM audit_events ae
     LEFT JOIN users u ON u.id = ae.user_id
     ORDER BY ae.created_at DESC LIMIT $1`,
    [limit]
  );
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    userName: r.user_name || "",
    userEmail: r.user_email || "",
    action: r.action,
    resourceType: r.resource_type,
    resourceId: r.resource_id,
    details: r.details || {},
    createdAt: r.created_at
  }));
}

async function getAdminStats(pool) {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users)::int AS total_users,
      (SELECT COUNT(*) FROM canvases)::int AS total_projects,
      (SELECT COUNT(*) FROM sessions WHERE expires_at > NOW())::int AS active_sessions,
      (SELECT COUNT(*) FROM shares)::int AS total_shares,
      (SELECT COUNT(*) FROM canvases WHERE created_at > NOW() - INTERVAL '7 days')::int AS projects_this_week,
      (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days')::int AS users_this_week
  `);
  return rows[0] || {};
}

// ─── exports ────────────────────────────────────────────────────────────────

module.exports = {
  init,
  // users
  findUserById,
  findUserByEmail,
  findUserByGoogleSub,
  insertUser,
  updateUser,
  // sessions
  findSessionByToken,
  findSessionByTokenAny,
  findAllActiveSessions,
  insertSession,
  deleteSession,
  deleteExpiredSessions,
  updateSessionToken,
  // canvases
  findCanvasById,
  findCanvasesByUser,
  insertCanvas,
  updateCanvasData,
  deleteCanvas,
  // shares
  findSharesByCanvas,
  findShareById,
  findShareByCanvasAndUser,
  insertShare,
  updateShareRole,
  deleteShare,
  // role resolution
  resolveCanvasRole,
  // tasks
  findTasksByCanvas,
  findTaskById,
  insertTask,
  updateTask,
  // sync jobs
  insertSyncJob,
  findSyncJobsByCanvas,
  findSyncJobsByUser,
  updateSyncJob,
  // project states
  findProjectState,
  upsertProjectState,
  // billing
  findBillingByUserId,
  findBillingByCustomerId,
  upsertBillingAccount,
  updateBillingAccount,
  // health
  getTableCounts,
  // labs
  findDistinctLabsByUser,
  findLabStorageBoxes,
  // admin
  findAllUsers,
  deleteUser,
  findAllCanvasesAdmin,
  findDistinctLabs,
  renameLab,
  removeLab,
  insertAuditEvent,
  findRecentAuditEvents,
  getAdminStats
};
