ALTER TABLE culture_batches ADD COLUMN donor_identifier TEXT;
ALTER TABLE culture_batches ADD COLUMN eye TEXT;
ALTER TABLE culture_batches ADD COLUMN parent_batch_id INTEGER REFERENCES culture_batches(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE culture_batches ADD COLUMN split_date TEXT;
ALTER TABLE culture_batches ADD COLUMN media_change_1_date TEXT;
ALTER TABLE culture_batches ADD COLUMN media_change_2_date TEXT;
ALTER TABLE culture_batches ADD COLUMN growth_notes TEXT;
ALTER TABLE culture_batches ADD COLUMN source_documentation TEXT;

CREATE INDEX IF NOT EXISTS idx_culture_batches_donor_eye ON culture_batches(donor_identifier, eye);
CREATE INDEX IF NOT EXISTS idx_culture_batches_parent ON culture_batches(parent_batch_id);
CREATE INDEX IF NOT EXISTS idx_culture_batches_passage ON culture_batches(passage_number);
