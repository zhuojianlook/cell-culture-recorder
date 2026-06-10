-- Cell Culture Planning backend schema (PostgreSQL)
-- Intended for direct SQL provisioning and PostgREST-compatible layouts.

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

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_nonempty_idx ON users (LOWER(email)) WHERE email <> '';
CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub_nonempty_idx ON users (google_sub) WHERE google_sub <> '';

CREATE TABLE IF NOT EXISTS canvases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lab TEXT NOT NULL DEFAULT '',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS canvases_owner_user_idx ON canvases (owner_user_id);
CREATE INDEX IF NOT EXISTS canvases_lab_idx ON canvases (lab) WHERE lab <> '';

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'local',
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS shares (
  id TEXT PRIMARY KEY,
  canvas_id TEXT NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE (canvas_id, user_id)
);

CREATE INDEX IF NOT EXISTS shares_canvas_idx ON shares (canvas_id);
CREATE INDEX IF NOT EXISTS shares_user_idx ON shares (user_id);

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

CREATE INDEX IF NOT EXISTS tasks_canvas_idx ON tasks (canvas_id);
CREATE INDEX IF NOT EXISTS tasks_assignee_idx ON tasks (assigned_to_user_id);
CREATE INDEX IF NOT EXISTS tasks_due_at_idx ON tasks (due_at);

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

CREATE INDEX IF NOT EXISTS sync_jobs_canvas_idx ON sync_jobs (canvas_id);
CREATE INDEX IF NOT EXISTS sync_jobs_task_idx ON sync_jobs (task_id);

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

CREATE INDEX IF NOT EXISTS project_states_user_idx ON project_states (user_id);
CREATE INDEX IF NOT EXISTS project_states_project_idx ON project_states (project_id);

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

CREATE UNIQUE INDEX IF NOT EXISTS billing_accounts_customer_nonempty_idx ON billing_accounts (stripe_customer_id) WHERE stripe_customer_id <> '';
CREATE INDEX IF NOT EXISTS billing_accounts_status_idx ON billing_accounts (subscription_status);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_events_created_idx ON audit_events (created_at DESC);
