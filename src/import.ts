// Pure parsing + mapping logic for the row-by-row import wizard.
// No DOM-app coupling: takes file bytes / strings, returns plain data the UI then
// walks the user through line by line. The whole point is accuracy, so nothing is
// guessed silently — ambiguous values (e.g. d/m vs m/d dates) are left blank for the
// user to confirm against the raw source line.

import type { CultureStatus, Eye, GroundTruthDateField, SourceRecordType } from "./types";

export type ImportFieldKey =
  | "donor_identifier"
  | "eye"
  | "culture_name"
  | "label"
  | "passage_number"
  | "vessel"
  | "started_at"
  | "split_date"
  | "medium"
  | "seeding_density"
  | "incubator_location"
  | "status"
  | "source_record_type"
  | "raw_source_identifier"
  | "pretreatment_date"
  | "dissociation_date"
  | "ground_truth_date_field"
  | "conflict_resolution"
  | "growth_notes"
  | "source_documentation"
  | "parent_label";

export type ImportFieldKind = "text" | "number" | "date" | "eye" | "status" | "source_type" | "ground_truth";

export interface ImportFieldDef {
  key: ImportFieldKey;
  label: string;
  aliases: string[];
  required: boolean;
  kind: ImportFieldKind;
}

export type ColumnMapping = Record<ImportFieldKey, number | null>;

// Ordered so that more specific fields claim their column before generic ones
// (donor before label, raw-source before generic id, etc.).
export const IMPORT_FIELDS: ImportFieldDef[] = [
  { key: "donor_identifier", label: "Donor ID", required: false, kind: "text",
    aliases: ["donor", "donor id", "donor identifier", "donornumber", "patient", "subject"] },
  { key: "raw_source_identifier", label: "Raw source ID", required: false, kind: "text",
    aliases: ["raw source", "raw source id", "source id", "source identifier", "origin id"] },
  { key: "eye", label: "Eye", required: false, kind: "eye",
    aliases: ["eye", "laterality", "od os", "side"] },
  { key: "culture_name", label: "Culture type", required: false, kind: "text",
    aliases: ["culture", "culture type", "cell line", "cell type", "celltype"] },
  { key: "label", label: "Vessel label", required: true, kind: "text",
    aliases: ["label", "vessel label", "flask label", "sample", "sample id", "name", "id"] },
  { key: "passage_number", label: "Passage", required: true, kind: "number",
    aliases: ["passage", "passage number", "passage no", "pn", "p"] },
  { key: "vessel", label: "Flask type", required: true, kind: "text",
    aliases: ["vessel", "flask", "flask type", "container", "format"] },
  { key: "started_at", label: "Seed date", required: true, kind: "date",
    aliases: ["seed date", "seed", "seeded", "date seeded", "seeding date", "start date", "started", "p0 date"] },
  { key: "split_date", label: "Split date", required: false, kind: "date",
    aliases: ["split date", "split", "passage date", "subculture date"] },
  { key: "medium", label: "Media type", required: false, kind: "text",
    aliases: ["medium", "media", "media type", "growth media", "baseline media"] },
  { key: "seeding_density", label: "Seeding density", required: false, kind: "text",
    aliases: ["seeding density", "density", "split ratio", "cells"] },
  { key: "incubator_location", label: "Incubator location", required: false, kind: "text",
    aliases: ["incubator", "incubator location", "location", "shelf"] },
  { key: "status", label: "Status", required: false, kind: "status",
    aliases: ["status", "state", "outcome"] },
  { key: "source_record_type", label: "Source type", required: false, kind: "source_type",
    aliases: ["source type", "source record type", "record type", "entry type"] },
  { key: "pretreatment_date", label: "Pretreatment date", required: false, kind: "date",
    aliases: ["pretreatment", "pretreatment date", "pre treatment"] },
  { key: "dissociation_date", label: "Dissociation date", required: false, kind: "date",
    aliases: ["dissociation", "dissociation date", "digest date", "isolation date"] },
  { key: "ground_truth_date_field", label: "Ground-truth date", required: false, kind: "ground_truth",
    aliases: ["ground truth", "ground truth date", "authoritative date"] },
  { key: "conflict_resolution", label: "Conflict/resolution note", required: false, kind: "text",
    aliases: ["conflict", "resolution", "rename", "conflict resolution"] },
  { key: "growth_notes", label: "Growth notes", required: false, kind: "text",
    aliases: ["notes", "growth notes", "comment", "comments", "remarks", "observations"] },
  { key: "source_documentation", label: "Source documentation", required: false, kind: "text",
    aliases: ["source documentation", "source note", "provenance", "documentation"] },
  { key: "parent_label", label: "Parent vessel label", required: false, kind: "text",
    aliases: ["parent", "parent label", "parent vessel", "origin", "origin label", "derived from"] },
];

// The coerced, editable shape shown on the right side of each review row. Values are
// strings so they bind directly to form inputs; passage stays a string until confirm.
export interface ImportDraft {
  donor_identifier: string;
  eye: Eye;
  culture_name: string;
  label: string;
  passage_number: string;
  vessel: string;
  started_at: string;
  split_date: string;
  medium: string;
  seeding_density: string;
  incubator_location: string;
  status: CultureStatus;
  source_record_type: SourceRecordType;
  raw_source_identifier: string;
  pretreatment_date: string;
  dissociation_date: string;
  ground_truth_date_field: GroundTruthDateField;
  conflict_resolution: string;
  growth_notes: string;
  source_documentation: string;
  parent_label: string;
}

// ---------------------------------------------------------------------------
// CSV (RFC-4180-ish: quoted fields, embedded commas/newlines, "" escapes, CR/LF/CRLF)
// ---------------------------------------------------------------------------
export function parseCsv(input: string): string[][] {
  let text = input;
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1); // strip UTF-8 BOM
  }

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  const endField = (): void => {
    row.push(field);
    field = "";
  };
  const endRow = (): void => {
    endField();
    rows.push(row);
    row = [];
  };

  while (i < n) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i += 1;
    } else if (c === ",") {
      endField();
      i += 1;
    } else if (c === "\n") {
      endRow();
      i += 1;
    } else if (c === "\r") {
      if (text[i + 1] === "\n") {
        i += 1; // CRLF -> let the LF end the row
      } else {
        endRow(); // lone CR
        i += 1;
      }
    } else {
      field += c;
      i += 1;
    }
  }

  if (field.length > 0 || row.length > 0) {
    endRow();
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

// ---------------------------------------------------------------------------
// XLSX (minimal, dependency-free): read the zip central directory, inflate the
// shared strings + first worksheet, parse them with the platform DOMParser.
// ---------------------------------------------------------------------------
interface ZipEntry {
  name: string;
  method: number;
  compSize: number;
  localOffset: number;
}

function readZipEntries(view: DataView, bytes: Uint8Array): ZipEntry[] {
  const n = bytes.length;
  let eocd = -1;
  for (let i = n - 22; i >= 0; i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) {
    throw new Error("That .xlsx file could not be read (no zip directory). Try re-saving, or export to CSV.");
  }

  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  const entries: ZipEntry[] = [];
  const decoder = new TextDecoder();

  for (let e = 0; e < count; e += 1) {
    if (view.getUint32(p, true) !== 0x02014b50) {
      break;
    }
    const method = view.getUint16(p + 10, true);
    const compSize = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const localOffset = view.getUint32(p + 42, true);
    const name = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLen));
    entries.push({ name, method, compSize, localOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }

  return entries;
}

async function readEntryData(bytes: Uint8Array, view: DataView, entry: ZipEntry): Promise<Uint8Array> {
  const p = entry.localOffset;
  if (view.getUint32(p, true) !== 0x04034b50) {
    throw new Error("That .xlsx file is corrupt (bad local header). Try export to CSV.");
  }
  const nameLen = view.getUint16(p + 26, true);
  const extraLen = view.getUint16(p + 28, true);
  const dataStart = p + 30 + nameLen + extraLen;
  const compressed = bytes.subarray(dataStart, dataStart + entry.compSize);

  if (entry.method === 0) {
    return compressed; // stored
  }
  if (entry.method === 8) {
    return inflateRaw(compressed);
  }
  throw new Error("Unsupported compression in .xlsx. Please export the sheet to CSV and import that.");
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("This macOS version can't read .xlsx directly. Please export the sheet to CSV and import that.");
  }
  // Copy into a fresh ArrayBuffer so the Blob part is a plain ArrayBuffer (not a
  // view over the larger file buffer / a SharedArrayBuffer).
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  const stream = new Blob([copy.buffer]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
}

function parseSharedStrings(xml: string): string[] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  return Array.from(doc.getElementsByTagName("si")).map((si) =>
    Array.from(si.getElementsByTagName("t"))
      .map((t) => t.textContent ?? "")
      .join(""),
  );
}

function columnRefToIndex(ref: string): number {
  const letters = ref.replace(/[^A-Za-z]/g, "").toUpperCase();
  if (!letters) {
    return -1;
  }
  let index = 0;
  for (let i = 0; i < letters.length; i += 1) {
    index = index * 26 + (letters.charCodeAt(i) - 64);
  }
  return index - 1;
}

function parseSheet(xml: string, shared: string[]): string[][] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const grid: string[][] = [];

  for (const rowEl of Array.from(doc.getElementsByTagName("row"))) {
    const rowArr: string[] = [];
    for (const cell of Array.from(rowEl.getElementsByTagName("c"))) {
      const ref = cell.getAttribute("r") ?? "";
      let colIndex = ref ? columnRefToIndex(ref) : rowArr.length;
      if (colIndex < 0) {
        colIndex = rowArr.length;
      }
      const type = cell.getAttribute("t");
      let value = "";
      if (type === "inlineStr") {
        value = Array.from(cell.getElementsByTagName("t"))
          .map((t) => t.textContent ?? "")
          .join("");
      } else {
        const raw = cell.getElementsByTagName("v")[0]?.textContent ?? "";
        value = type === "s" ? shared[Number(raw)] ?? "" : raw;
      }
      rowArr[colIndex] = value;
    }
    for (let i = 0; i < rowArr.length; i += 1) {
      if (rowArr[i] === undefined) {
        rowArr[i] = "";
      }
    }
    grid.push(rowArr);
  }

  return grid.filter((r) => r.some((cell) => (cell ?? "").trim() !== ""));
}

export async function parseXlsx(buffer: ArrayBuffer): Promise<string[][]> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const entries = readZipEntries(view, bytes);

  const sheetEntry =
    entries.find((entry) => entry.name === "xl/worksheets/sheet1.xml") ??
    entries
      .filter((entry) => /^xl\/worksheets\/sheet\d+\.xml$/.test(entry.name))
      .sort((a, b) => a.name.localeCompare(b.name))[0];
  if (!sheetEntry) {
    throw new Error("No worksheet was found in that .xlsx file.");
  }

  const decoder = new TextDecoder();
  const sharedEntry = entries.find((entry) => entry.name === "xl/sharedStrings.xml");
  const shared = sharedEntry ? parseSharedStrings(decoder.decode(await readEntryData(bytes, view, sharedEntry))) : [];
  const sheetXml = decoder.decode(await readEntryData(bytes, view, sheetEntry));
  return parseSheet(sheetXml, shared);
}

// ---------------------------------------------------------------------------
// File dispatch
// ---------------------------------------------------------------------------
export async function parseTabularFile(file: File): Promise<string[][]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx")) {
    return parseXlsx(await file.arrayBuffer());
  }
  if (name.endsWith(".xls")) {
    throw new Error("Legacy .xls isn't supported. Please save as .xlsx or .csv.");
  }
  return parseCsv(await file.text());
}

// ---------------------------------------------------------------------------
// Column auto-mapping
// ---------------------------------------------------------------------------
function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[_\-/.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function autoMap(headers: string[]): ColumnMapping {
  const normalized = headers.map(normalizeHeader);
  const used = new Set<number>();
  const mapping = {} as ColumnMapping;

  for (const field of IMPORT_FIELDS) {
    const candidates = [normalizeHeader(field.label), field.key.replace(/_/g, " "), ...field.aliases];
    let found: number | null = null;

    // Pass 1: exact header match against label/key/aliases.
    for (let i = 0; i < normalized.length; i += 1) {
      if (used.has(i)) {
        continue;
      }
      if (candidates.includes(normalized[i])) {
        found = i;
        break;
      }
    }

    // Pass 2: substring match (header contains an alias, or vice-versa for 3+ char headers).
    if (found === null) {
      for (let i = 0; i < normalized.length; i += 1) {
        if (used.has(i)) {
          continue;
        }
        const header = normalized[i];
        if (field.aliases.some((alias) => header.includes(alias) || (header.length >= 3 && alias.includes(header)))) {
          found = i;
          break;
        }
      }
    }

    if (found !== null) {
      used.add(found);
    }
    mapping[field.key] = found;
  }

  return mapping;
}

// ---------------------------------------------------------------------------
// Value coercion (accuracy-first: never guess ambiguous values)
// ---------------------------------------------------------------------------
export function coerceEye(raw: string | null | undefined): Eye {
  const v = (raw ?? "").trim().toLowerCase();
  if (["od", "r", "right", "right eye", "oculus dexter", "dexter"].includes(v)) {
    return "OD";
  }
  if (["os", "l", "left", "left eye", "oculus sinister", "sinister"].includes(v)) {
    return "OS";
  }
  if (["ou", "both", "both eyes", "bilateral", "pooled"].includes(v)) {
    return "OU";
  }
  return "unknown";
}

export function coerceStatus(raw: string | null | undefined): CultureStatus {
  const v = (raw ?? "").trim().toLowerCase();
  if (["frozen", "freeze", "cryo", "banked", "cryopreserved"].includes(v)) {
    return "frozen";
  }
  if (["contaminated", "contamination", "contam", "infected"].includes(v)) {
    return "contaminated";
  }
  if (["discarded", "discard", "disposed", "dead", "trashed", "binned"].includes(v)) {
    return "discarded";
  }
  return "active";
}

export function coerceSourceType(raw: string | null | undefined): SourceRecordType {
  const v = (raw ?? "").trim().toLowerCase();
  if (v.includes("tissue") || v.includes("dissoc") || v.includes("primary")) {
    return "primary_tissue_dissociation";
  }
  if (v.includes("mixed") || v.includes("ambig")) {
    return "mixed_source_note";
  }
  return "culture_vessel";
}

export function coerceGroundTruth(raw: string | null | undefined): GroundTruthDateField {
  const v = (raw ?? "").trim().toLowerCase();
  if (v.includes("dissoc")) {
    return "dissociation_date";
  }
  if (v.includes("pretreat")) {
    return "pretreatment_date";
  }
  if (v.includes("unresolved") || v.includes("unknown")) {
    return "unresolved";
  }
  return "seed_date";
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
  january: 1, february: 2, march: 3, april: 4, june: 6, july: 7, august: 8, september: 9, october: 10,
  november: 11, december: 12,
};

function isValidYmd(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    return false;
  }
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function formatYmd(y: number, m: number, d: number): string | null {
  return isValidYmd(y, m, d) ? `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` : null;
}

function parseNamedDate(value: string): string | null {
  const cleaned = value.replace(/,/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  let m = cleaned.match(/^(\d{1,2})[ -]([a-z]+)[ -](\d{4})$/);
  if (m && MONTHS[m[2]]) {
    return formatYmd(Number(m[3]), MONTHS[m[2]], Number(m[1]));
  }
  m = cleaned.match(/^([a-z]+)[ -](\d{1,2})[ -](\d{4})$/);
  if (m && MONTHS[m[1]]) {
    return formatYmd(Number(m[3]), MONTHS[m[1]], Number(m[2]));
  }
  return null;
}

// Returns an ISO YYYY-MM-DD string, or null when the value is empty or ambiguous
// (e.g. bare "5/4/2026" — could be May or April — is deliberately NOT guessed).
export function coerceDate(raw: string | null | undefined): string | null {
  const v = (raw ?? "").trim();
  if (!v) {
    return null;
  }
  const iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    return formatYmd(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }
  const ymd = v.match(/^(\d{4})[/.](\d{1,2})[/.](\d{1,2})$/);
  if (ymd) {
    return formatYmd(Number(ymd[1]), Number(ymd[2]), Number(ymd[3]));
  }
  return parseNamedDate(v);
}

// ---------------------------------------------------------------------------
// Row -> draft + provenance
// ---------------------------------------------------------------------------
export function cellFor(row: string[], mapping: ColumnMapping, key: ImportFieldKey): string {
  const index = mapping[key];
  if (index === null || index === undefined) {
    return "";
  }
  return (row[index] ?? "").trim();
}

export function rowToDraft(row: string[], mapping: ColumnMapping): ImportDraft {
  const get = (key: ImportFieldKey): string => cellFor(row, mapping, key);
  const passageRaw = get("passage_number").replace(/^p\.?\s*/i, "").trim();
  const passageDigits = passageRaw.match(/-?\d+/)?.[0] ?? "";

  return {
    donor_identifier: get("donor_identifier"),
    eye: coerceEye(get("eye")),
    culture_name: get("culture_name"),
    label: get("label"),
    passage_number: passageDigits,
    vessel: get("vessel"),
    started_at: coerceDate(get("started_at")) ?? "",
    split_date: coerceDate(get("split_date")) ?? "",
    medium: get("medium"),
    seeding_density: get("seeding_density"),
    incubator_location: get("incubator_location"),
    status: coerceStatus(get("status")),
    source_record_type: coerceSourceType(get("source_record_type")),
    raw_source_identifier: get("raw_source_identifier"),
    pretreatment_date: coerceDate(get("pretreatment_date")) ?? "",
    dissociation_date: coerceDate(get("dissociation_date")) ?? "",
    ground_truth_date_field: coerceGroundTruth(get("ground_truth_date_field")),
    conflict_resolution: get("conflict_resolution"),
    growth_notes: get("growth_notes"),
    source_documentation: get("source_documentation"),
    parent_label: get("parent_label"),
  };
}

// Verbatim provenance of a single source row, retained on the saved record so the
// original (lossy) input is never thrown away.
export function buildImportRawIntake(
  fileName: string,
  headers: string[],
  cells: string[],
  mapping: ColumnMapping,
  rowIndex: number,
): string {
  const cellsByHeader: Record<string, string> = {};
  headers.forEach((header, i) => {
    cellsByHeader[header || `column_${i + 1}`] = cells[i] ?? "";
  });

  const mappedColumns: Record<string, string | null> = {};
  for (const field of IMPORT_FIELDS) {
    const index = mapping[field.key];
    mappedColumns[field.key] = index === null || index === undefined ? null : headers[index] ?? null;
  }

  return JSON.stringify(
    {
      captured_at: new Date().toISOString(),
      source: "import",
      file: fileName,
      source_row: rowIndex + 2, // +1 for header row, +1 for 1-based
      cells: cellsByHeader,
      mapped_columns: mappedColumns,
    },
    null,
    2,
  );
}
