# Cell Culture Recorder

A native Tauri desktop application for recording donor-derived cell culture vessels in a local SQL database.

## Storage model

- Uses the official Tauri SQL plugin.
- Stores data in `sqlite:cell-culture-recorder.db`, relative to Tauri's application config directory.
- Registers schema migrations from Rust so the database is created consistently before use.
- Enables WAL journaling, foreign keys, and full synchronous writes when the app opens the database.
- Uses transactional writes for multi-step operations and records an audit log.
- Supports duplicate vessel labels while keeping every flask/vessel as a distinct database row.
- Tracks donor ID, eye, passage, flask type, seed/split/media-change dates, parent vessel, notes, and source documentation.
- Builds a donor/eye lineage tree from parent-vessel links and flags date/passaging logic warnings.

## Development

```bash
npm install
npm run tauri dev
```

For a web-only UI preview:

```bash
npm run dev
```

The web preview uses a local browser-backed store because the real SQL plugin is available only inside the Tauri runtime.
