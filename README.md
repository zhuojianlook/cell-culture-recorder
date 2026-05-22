# Cell Culture Recorder

A native Tauri desktop application for recording cell culture information in a local SQL database.

## Storage model

- Uses the official Tauri SQL plugin.
- Stores data in `sqlite:cell-culture-recorder.db`, relative to Tauri's application config directory.
- Registers the schema migration from Rust so the database is created consistently before use.
- Enables WAL journaling, foreign keys, and full synchronous writes when the app opens the database.
- Uses transactional writes for multi-step operations and records an audit log.

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
