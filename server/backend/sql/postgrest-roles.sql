-- Minimal PostgREST role setup for this schema.
-- Apply after postgres-schema.sql.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'web_anon') THEN
    CREATE ROLE web_anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'web_user') THEN
    CREATE ROLE web_user NOLOGIN;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO web_anon, web_user;

GRANT SELECT ON users, canvases, shares, tasks, sync_jobs, project_states, billing_accounts TO web_anon, web_user;
GRANT INSERT, UPDATE, DELETE ON users, canvases, shares, tasks, sync_jobs, project_states, billing_accounts TO web_user;
