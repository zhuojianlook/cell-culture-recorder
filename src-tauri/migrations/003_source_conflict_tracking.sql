ALTER TABLE culture_batches ADD COLUMN source_record_type TEXT NOT NULL DEFAULT 'culture_vessel';
ALTER TABLE culture_batches ADD COLUMN raw_source_identifier TEXT;
ALTER TABLE culture_batches ADD COLUMN pretreatment_date TEXT;
ALTER TABLE culture_batches ADD COLUMN dissociation_date TEXT;
ALTER TABLE culture_batches ADD COLUMN ground_truth_date_field TEXT NOT NULL DEFAULT 'seed_date';
ALTER TABLE culture_batches ADD COLUMN ground_truth_date TEXT;
ALTER TABLE culture_batches ADD COLUMN conflict_resolution TEXT;
ALTER TABLE culture_batches ADD COLUMN raw_intake_json TEXT NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_culture_batches_raw_source ON culture_batches(raw_source_identifier, eye);
CREATE INDEX IF NOT EXISTS idx_culture_batches_source_type ON culture_batches(source_record_type);
