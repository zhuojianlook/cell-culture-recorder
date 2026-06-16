# Salvaged design from the original Cell Culture Recorder

The standalone Cell Culture Recorder (the old Vite single-page app in `src/`) was
removed once the recorder became a per-project canvas-node feature inside WetLab
Planner (culture fields live on `node.dataset.culture*`, serialized with the
canvas state; see `web/culture.js` + `web/culture-logic.js`).

Pieces of the original design were captured here so the source could be deleted
without losing the design. The original implementation lives in git history at
the commit just before this file was added (`src/main.ts`, `src/types.ts`).

**Status (v0.2.19):** §1 (provenance schema) and §2 (provenance-dependent
validation) are now **ported** into the canvas-node model — see the notes inline
below. §3 (inline grid editing) is still outstanding.

---

## 1. Provenance / source-tracking schema (feeds richer validation) — ✅ PORTED

Ported as `node.dataset.culture*` keys (camelCase record fields): `sourceRecordType`,
`rawSourceIdentifier`, `groundTruthDateField`, `groundTruthDate` (computed + stored
on save), `conflictResolution`, `pretreatmentDate`, `dissociationDate`, plus
`splitDate`. Surfaced in a collapsible "Provenance & source tracking" section of
the culture record editor (`web/culture.js`) and populated by CSV import
(`importCsvToDrafts` + `window.wlpCreateCultureVessel`). Enums live in
`web/culture-logic.js` (`SOURCE_RECORD_TYPES`, `GROUND_TRUTH_DATE_FIELDS`).

**Not ported:** `raw_intake_json` (the immutable verbatim snapshot of the source
row at import / manual entry). Still wanted — capturing it on CSV import + manual
create is the natural next step for full provenance.

The original record carried provenance fields that disambiguate messy intake
(tissue source vs. flask record, conflicting dates) and unlock the conflict
warnings below. To add this to the canvas-node model, store each as a
`node.dataset.culture<Field>` key.

| Field | Type | Meaning |
|---|---|---|
| `source_record_type` | `'culture_vessel' \| 'primary_tissue_dissociation' \| 'mixed_source_note'` | Origin class of the record. Drives the "same raw source ID, different type → split into separate records" conflict. |
| `raw_source_identifier` | `string \| null` | External ID from the source (tissue sample ID, donor number on a flask label, notebook ref). Kept verbatim so provenance is never lost. Anchors the duplicate/conflict checks. |
| `ground_truth_date_field` | `'seed_date' \| 'dissociation_date' \| 'pretreatment_date' \| 'unresolved'` | Which date governs age/lineage sorting when several dates exist. Must point at a non-null date unless `'unresolved'`. |
| `ground_truth_date` | `string \| null` (ISO `YYYY-MM-DD`) | Computed authoritative date derived from `ground_truth_date_field`. Stored so lineage/exports use one consistent date per vessel. |
| `conflict_resolution` | `string \| null` | Free-text note on how a date ambiguity / duplicate raw-source ID was resolved. **Required** when `ground_truth_date_field === 'unresolved'`. |
| `raw_intake_json` | `string` (JSON) | Verbatim snapshot of the source row at import: original cell values, headers, file name, row index, column mapping, timestamp. For manual entry: `{captured_at, source:'manual', ...field values}`. Immutable. |
| `pretreatment_date` | `string \| null` (ISO) | Tissue pretreatment date (enzymatic/mechanical prep). Optional P0 ground-truth. Warn if set as ground truth but empty, or before seed date. |
| `dissociation_date` | `string \| null` (ISO) | Date tissue was dissociated into cells. For P0 often differs from the flask seed date → triggers the "choose ground truth" conflict. |
| `started_at` | `string` (ISO) | Flask **seed date** (day cells were seeded). Authoritative age when `ground_truth_date_field === 'seed_date'`. Drives passage/date monotonicity. |

## 2. Validation rules — ✅ PORTED into `web/culture-logic.js`

`culture-logic.js` already had: required fields, duplicate-label, parent
lineage (passage/date increase), and the CSV import mapping. The **provenance-
dependent** rules below are now ported into `cultureWarnings` (original:
`buildDraftWarnings` in `src/main.ts`, roughly lines 1167–1325; ground-truth
resolver ~1075–1086; source conflict / rename suggestion ~1264–1297 +
`suggestSourceConflictRename`). All are covered by `tests/culture-logic.test.cjs`.

- **Source conflict (by `rawSourceIdentifier`, falling back to donor, same eye):**
  (a) `sourceRecordType` differs across records with the same raw source → suggest
  renaming one as tissue source vs. flask; (b) `dissociationDate` differs → flag;
  (c) identical passage but differing seed dates → flag + suggest rename;
  (d) both P0 but `dissociationDate` vs the other's seed date differ → flag.
- **Ground-truth consistency:** `groundTruthDateField === 'dissociation_date'`
  but `dissociationDate` empty → error; same for `'pretreatment_date'`;
  `'unresolved'` requires `conflictResolution` (error if empty).
- **P0 special case:** `passage === 0` with both `seedDate` and `dissociationDate`
  present and differing → warn "choose one as ground truth, keep the other as raw
  provenance".
- **Source type vs vessel:** `sourceRecordType === 'primary_tissue_dissociation'`
  on a flask/dish icon → warn to consider saving the tissue source and P0 flask
  as separate vessels if dates differ.
- **Media-change chronology:** the new canvas-node model has no legacy
  `media_change_1_date` / `media_change_2_date` columns — media changes live in the
  events log (`node.dataset.cultureEvents`). Adapted: any `media_change`/`feed`
  event dated **before** the seed date is flagged.
- **Split date:** `splitDate` should be ≥ `seedDate` (warn otherwise).

## 3. Inline grid-editing UX (the original's signature spreadsheet)

For the planned inline-editing feature on the recorder grid (currently the grid
opens a per-record modal). Original: `src/main.ts` ~lines 2038–2412.

- **No edit-mode toggle** — every cell renders as a live `<input>/<select>/<textarea>`
  keyed by `data-row-id` + `data-field`. Input type per field (text, date, number,
  select for eye/status/source_record_type/ground_truth_date_field, textarea for notes).
- **Per-cell flagging:** on `input`/`change`/`focusout`, recompute warnings for the
  row (`cultureWarnings` → `{byField, messages}`); cells whose field is in `byField`
  get a `cell-flagged` CSS class + a `title` with the message; the row's lead column
  shows a warning count/tooltip.
- **Save model (no save button):**
  - *New manual rows* (negative temp id): auto-save on `focusout` once all required
    fields (label, passage, vessel, started_at) are present; otherwise stay flagged.
  - *Imported rows*: buffered — stay as drafts until a **"Commit import"** button
    validates + bulk-creates them.
  - *Committed rows*: patch on `focusout` if required fields are valid.
- **Row expansion:** a chevron toggles a hidden panel (`classList.toggle('open')`,
  no re-render) exposing the provenance/extra fields (culture_name,
  source_record_type, ground_truth_date_field, raw_source_identifier,
  pretreatment_date, dissociation_date, medium, seeding_density,
  incubator_location, conflict_resolution, growth_notes). Collapsing keeps values.
- **Navigation:** native Tab order; Enter does not submit (not a form); focusout is
  the save trigger. Add-row appends a new draft row immediately, flagged until valid.
