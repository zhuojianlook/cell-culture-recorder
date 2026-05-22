CREATE TABLE IF NOT EXISTS cell_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  species TEXT NOT NULL,
  tissue TEXT,
  source TEXT,
  identifiers TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS culture_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cell_line_id INTEGER NOT NULL REFERENCES cell_lines(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  label TEXT NOT NULL,
  passage_number INTEGER NOT NULL CHECK (passage_number >= 0),
  vessel TEXT NOT NULL,
  medium TEXT,
  seeding_density TEXT,
  incubator_location TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'discarded', 'contaminated')),
  started_at TEXT NOT NULL,
  last_event_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS culture_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id INTEGER NOT NULL REFERENCES culture_batches(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  event_type TEXT NOT NULL CHECK (
    event_type IN ('feeding', 'passage', 'observation', 'media_change', 'thaw', 'freeze', 'contamination', 'discard')
  ),
  event_at TEXT NOT NULL,
  confluence_percent INTEGER CHECK (confluence_percent IS NULL OR confluence_percent BETWEEN 0 AND 100),
  viability_percent INTEGER CHECK (viability_percent IS NULL OR viability_percent BETWEEN 0 AND 100),
  split_ratio TEXT,
  medium TEXT,
  reagent_lot TEXT,
  operator TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  operation TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS backup_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  checksum TEXT NOT NULL,
  exported_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cell_lines_name ON cell_lines(name);
CREATE INDEX IF NOT EXISTS idx_culture_batches_status ON culture_batches(status);
CREATE INDEX IF NOT EXISTS idx_culture_batches_cell_line ON culture_batches(cell_line_id);
CREATE INDEX IF NOT EXISTS idx_culture_events_batch ON culture_events(batch_id);
CREATE INDEX IF NOT EXISTS idx_culture_events_event_at ON culture_events(event_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_backup_snapshots_created_at ON backup_snapshots(created_at);

CREATE TRIGGER IF NOT EXISTS trg_cell_lines_updated_at
AFTER UPDATE ON cell_lines
FOR EACH ROW
BEGIN
  UPDATE cell_lines SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_culture_batches_updated_at
AFTER UPDATE ON culture_batches
FOR EACH ROW
BEGIN
  UPDATE culture_batches SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
