// Offline desktop build config (no Google sign-in, no web login). The Express
// server runs as a bundled sidecar in file-DB mode with REQUIRE_AUTH=false, so
// the app boots straight into the workspace.
//
// Externalized from an inline <script> in index.html so a strict
// Content-Security-Policy (script-src 'self') can be used — see tauri.conf.json.
window.CELLCULTURE_GOOGLE_CLIENT_ID = "";
window.__REQUIRE_AUTH = false;
