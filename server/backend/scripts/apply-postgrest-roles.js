"use strict";

const fs = require("fs/promises");
const path = require("path");
const { Pool } = require("pg");

async function run() {
  const databaseUrl = String(process.env.DATABASE_URL || "").trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const sqlPath = path.join(__dirname, "..", "sql", "postgrest-roles.sql");
  const sql = await fs.readFile(sqlPath, "utf8");

  const pool = new Pool({ connectionString: databaseUrl });
  try {
    await pool.query(sql);
    // eslint-disable-next-line no-console
    console.log("[db:postgrest] Roles/grants applied successfully.");
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[db:postgrest] Failed:", err.message || err);
  process.exit(1);
});
