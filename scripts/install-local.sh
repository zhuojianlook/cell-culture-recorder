#!/bin/bash
# Install the freshly-built .app to /Applications, OUT of Dropbox, and re-seal it.
#
# Why: the build output lives under src-tauri/target, which is inside the repo's
# Dropbox folder. Running the .app from there is fragile — Dropbox writes its own
# metadata into files inside the bundle, which invalidates the ad-hoc code
# signature ("a sealed resource is missing or invalid") and macOS then refuses to
# run it (symptom: the app launches but its api-server sidecar never starts, so
# every project shows "failed to load projects"). /Applications is not synced by
# Dropbox, so a copy there stays valid.
#
# Run this after `npx tauri build --bundles app`. Idempotent.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="src-tauri/target/release/bundle/macos/WetLab Planner.app"
DEST="/Applications/WetLab Planner.app"
[ -d "$SRC" ] || { echo "No built app at $SRC — run 'npx tauri build --bundles app' first." >&2; exit 1; }

echo "Quitting any running instance…"
osascript -e 'quit app "WetLab Planner"' 2>/dev/null || true
pkill -f "MacOS/api-server" 2>/dev/null || true
sleep 2

echo "Copying to $DEST …"
rm -rf "$DEST"
ditto "$SRC" "$DEST"

echo "Stripping stray xattrs and re-sealing the signature…"
xattr -cr "$DEST" 2>/dev/null || true
codesign --force --deep --sign - "$DEST"
codesign -v --deep --strict "$DEST" && echo "Signature valid."

echo "Launching /Applications copy…"
open "$DEST"
echo "Done. Run WetLab Planner from /Applications (NOT from the Dropbox build folder)."
