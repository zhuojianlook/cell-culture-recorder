"use strict";

/**
 * Migration: project_states → canvases.data
 *
 * Before Phase 1, inventory/storage/storageBoxes/mediaFormulations lived in the
 * project_states table, one row per user×project. After Phase 1 those fields
 * live inside canvases.data JSONB.
 *
 * This script:
 * 1. Reads all project_states rows.
 * 2. For each user, finds (or creates) a canvas owned by that user.
 * 3. Merges the project_state arrays into canvas.data.
 * 4. Deletes the migrated project_states rows.
 *
 * Safe to run multiple times — skips users that already have a canvas with data.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... node backend/scripts/migrate-project-states-to-canvases.js
 */

const { Pool } = require("pg");

function ensureArray(val) {
  return Array.isArray(val) ? val : [];
}

async function run() {
  const databaseUrl = String(process.env.DATABASE_URL || "").trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Fetch all project_states
    const { rows: states } = await client.query(
      "SELECT id, user_id, project_id, inventory, storage, storage_boxes, media_formulations FROM project_states"
    );

    if (states.length === 0) {
      console.log("[migrate] No project_states found — nothing to migrate.");
      await client.query("COMMIT");
      return;
    }

    console.log(`[migrate] Found ${states.length} project_state(s) to migrate.`);

    // Group states by user_id (take latest per user if multiple)
    const byUser = new Map();
    for (const st of states) {
      const prev = byUser.get(st.user_id);
      if (!prev) {
        byUser.set(st.user_id, st);
      } else {
        // Merge arrays from multiple project states for same user
        prev.inventory = ensureArray(prev.inventory).concat(ensureArray(st.inventory));
        prev.storage = ensureArray(prev.storage).concat(ensureArray(st.storage));
        prev.storage_boxes = ensureArray(prev.storage_boxes).concat(ensureArray(st.storage_boxes));
        prev.media_formulations = ensureArray(prev.media_formulations).concat(ensureArray(st.media_formulations));
      }
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const [userId, state] of byUser) {
      // 2. Find existing canvas owned by this user
      const { rows: canvases } = await client.query(
        "SELECT id, data FROM canvases WHERE owner_user_id = $1 ORDER BY created_at ASC LIMIT 1",
        [userId]
      );

      const inventory = ensureArray(state.inventory);
      const storage = ensureArray(state.storage);
      const storageBoxes = ensureArray(state.storage_boxes);
      const mediaFormulations = ensureArray(state.media_formulations);

      // Nothing to merge
      if (inventory.length === 0 && storage.length === 0 && storageBoxes.length === 0 && mediaFormulations.length === 0) {
        skipped++;
        continue;
      }

      if (canvases.length > 0) {
        // 3a. Merge into existing canvas.data
        const canvas = canvases[0];
        const data = canvas.data && typeof canvas.data === "object" ? canvas.data : {};

        // Only merge if canvas doesn't already have this data populated
        if (!Array.isArray(data.inventory) || data.inventory.length === 0) {
          data.inventory = inventory;
        }
        if (!Array.isArray(data.storage) || data.storage.length === 0) {
          data.storage = storage;
        }
        if (!Array.isArray(data.storageBoxes) || data.storageBoxes.length === 0) {
          data.storageBoxes = storageBoxes;
        }
        if (!Array.isArray(data.mediaFormulations) || data.mediaFormulations.length === 0) {
          data.mediaFormulations = mediaFormulations;
        }

        await client.query(
          "UPDATE canvases SET data = $1::jsonb, updated_at = NOW() WHERE id = $2",
          [JSON.stringify(data), canvas.id]
        );
        updated++;
        console.log(`[migrate] Updated canvas ${canvas.id} for user ${userId}`);
      } else {
        // 3b. Create new canvas for this user
        const canvasId = "cvs_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        const data = { inventory, storage, storageBoxes, mediaFormulations };

        await client.query(
          `INSERT INTO canvases (id, name, owner_user_id, data, created_at, updated_at)
           VALUES ($1, $2, $3, $4::jsonb, NOW(), NOW())`,
          [canvasId, "My Project", userId, JSON.stringify(data)]
        );
        created++;
        console.log(`[migrate] Created canvas ${canvasId} for user ${userId}`);
      }
    }

    // 4. Delete migrated project_states
    const { rowCount } = await client.query("DELETE FROM project_states");
    console.log(`[migrate] Deleted ${rowCount} project_states row(s).`);

    await client.query("COMMIT");
    console.log(`[migrate] Done. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error("[migrate] Failed:", err.message || err);
  process.exit(1);
});
