#!/bin/bash
# Build the WetlabPlanner Express server into a single self-contained sidecar
# binary for Tauri's externalBin (binaries/api-server-<target-triple>).
#
# Approach (no native compile, CI-friendly):
#   1. esbuild bundles server.js (+ backend) into one CJS file. Native/strippable
#      deps (bcrypt, stripe, pg-native) are externalized — their code paths only
#      run in postgres/billing/admin mode, which the desktop app never uses.
#   2. Node SEA (Single Executable Application) embeds that bundle into a copy of
#      the node binary via postject → one self-contained executable.
#
# Usage: ./scripts/build-sidecar.sh [target-triple]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$PROJECT_DIR/server"
BIN_DIR="$PROJECT_DIR/src-tauri/binaries"

if [ -n "${1:-}" ]; then
  TRIPLE="$1"
else
  TRIPLE="$(rustc -vV 2>/dev/null | grep 'host:' | awk '{print $2}')"
  TRIPLE="${TRIPLE:-aarch64-apple-darwin}"
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
echo "Building sidecar for $TRIPLE (work: $WORK)"

# 0. Ensure server deps are installed (esbuild resolves node_modules relative to
#    the entry file's dir). CI runs this too.
if [ ! -d "$SERVER_DIR/node_modules" ]; then
  echo "Installing server deps in $SERVER_DIR …"
  ( cd "$SERVER_DIR" && npm install --no-audit --no-fund --omit=dev )
fi

# 1. Bundle the server into a single CJS file.
npx -y esbuild@latest "$SERVER_DIR/server.js" \
  --bundle --platform=node --target=node20 \
  --outfile="$WORK/server.bundle.cjs" \
  --external:bcrypt --external:stripe --external:pg-native --external:pg-cloudflare

# 2. SEA blob from the bundle.
cat > "$WORK/sea-config.json" <<JSON
{ "main": "server.bundle.cjs", "output": "sea-prep.blob", "disableExperimentalSEAWarning": true }
JSON
( cd "$WORK" && node --experimental-sea-config sea-config.json )

# 3. Copy the node runtime and inject the blob.
cp "$(command -v node)" "$WORK/api-server"
codesign --remove-signature "$WORK/api-server" 2>/dev/null || true
( cd "$WORK" && npx -y postject api-server NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA )
codesign --sign - "$WORK/api-server" 2>/dev/null || true

# 4. Place it where Tauri externalBin expects.
mkdir -p "$BIN_DIR"
cp "$WORK/api-server" "$BIN_DIR/api-server-${TRIPLE}"
chmod +x "$BIN_DIR/api-server-${TRIPLE}"
echo "✅ Sidecar built: $BIN_DIR/api-server-${TRIPLE}"
ls -lh "$BIN_DIR/api-server-${TRIPLE}"
