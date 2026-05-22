export type CultureStatus = "active" | "frozen" | "discarded" | "contaminated";

export type Eye = "OD" | "OS" | "OU" | "unknown";

export type SourceRecordType = "culture_vessel" | "primary_tissue_dissociation" | "mixed_source_note";

export type GroundTruthDateField = "seed_date" | "dissociation_date" | "pretreatment_date" | "unresolved";

export type EventType =
  | "feeding"
  | "passage"
  | "observation"
  | "media_change"
  | "thaw"
  | "freeze"
  | "contamination"
  | "discard";

export interface CellLine {
  id: number;
  name: string;
  species: string;
  tissue: string | null;
  source: string | null;
  identifiers: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface CultureBatch {
  id: number;
  cell_line_id: number;
  label: string;
  passage_number: number;
  vessel: string;
  medium: string | null;
  seeding_density: string | null;
  incubator_location: string | null;
  status: CultureStatus;
  started_at: string;
  last_event_at: string | null;
  notes: string | null;
  donor_identifier: string | null;
  eye: Eye | null;
  parent_batch_id: number | null;
  split_date: string | null;
  media_change_1_date: string | null;
  media_change_2_date: string | null;
  source_record_type: SourceRecordType;
  raw_source_identifier: string | null;
  pretreatment_date: string | null;
  dissociation_date: string | null;
  ground_truth_date_field: GroundTruthDateField;
  ground_truth_date: string | null;
  conflict_resolution: string | null;
  raw_intake_json: string;
  growth_notes: string | null;
  source_documentation: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface CultureBatchView extends CultureBatch {
  cell_line_name: string;
  species: string;
  parent_label: string | null;
  child_count: number;
}

export interface CultureEvent {
  id: number;
  batch_id: number;
  event_type: EventType;
  event_at: string;
  confluence_percent: number | null;
  viability_percent: number | null;
  split_ratio: string | null;
  medium: string | null;
  reagent_lot: string | null;
  operator: string | null;
  notes: string;
  created_at: string;
}

export interface AuditEntry {
  id: number;
  entity_type: string;
  entity_id: number | null;
  operation: string;
  payload_json: string;
  created_at: string;
}

export interface BackupSnapshot {
  id: number;
  label: string;
  checksum: string;
  exported_json: string;
  created_at: string;
}

export interface CreateVesselInput {
  culture_name: string;
  donor_identifier: string | null;
  eye: Eye;
  label: string;
  passage_number: number;
  vessel: string;
  parent_batch_id: number | null;
  started_at: string;
  split_date: string | null;
  media_change_1_date: string | null;
  media_change_2_date: string | null;
  source_record_type: SourceRecordType;
  raw_source_identifier: string | null;
  pretreatment_date: string | null;
  dissociation_date: string | null;
  ground_truth_date_field: GroundTruthDateField;
  ground_truth_date: string | null;
  conflict_resolution: string | null;
  raw_intake_json: string;
  medium: string | null;
  seeding_density: string | null;
  incubator_location: string | null;
  status: CultureStatus;
  growth_notes: string | null;
  source_documentation: string | null;
}

export interface CreateEventInput {
  batch_id: number;
  event_type: EventType;
  event_at: string;
  confluence_percent: number | null;
  viability_percent: number | null;
  split_ratio: string | null;
  medium: string | null;
  reagent_lot: string | null;
  operator: string | null;
  notes: string;
  next_status: CultureStatus | null;
  next_passage_number: number | null;
}

export interface BackupPackage {
  app: "cell-culture-recorder";
  version: 1 | 2 | 3;
  exportedAt: string;
  checksum: string;
  data: {
    cellLines: CellLine[];
    cultureBatches: CultureBatch[];
    cultureEvents: CultureEvent[];
    auditLog: AuditEntry[];
  };
}

export interface CultureStore {
  readonly mode: "tauri-sql" | "browser-preview";
  initialize(): Promise<void>;
  listCellLines(): Promise<CellLine[]>;
  listBatches(): Promise<CultureBatchView[]>;
  listEvents(batchId?: number): Promise<CultureEvent[]>;
  listAuditEntries(limit?: number): Promise<AuditEntry[]>;
  listBackups(limit?: number): Promise<BackupSnapshot[]>;
  createVessel(input: CreateVesselInput): Promise<number>;
  recordEvent(input: CreateEventInput): Promise<void>;
  exportBackup(label: string): Promise<BackupPackage>;
  restoreBackup(pkg: BackupPackage): Promise<void>;
}
