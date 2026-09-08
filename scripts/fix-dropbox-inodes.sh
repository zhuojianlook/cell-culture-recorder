#!/bin/bash
# Re-create every build-input file as a fresh LOCAL inode.
#
# Why: this repo lives in Dropbox (~/Library/CloudStorage/Dropbox/...). Rust's
# std::fs::copy on macOS tries fclonefileat() first, and Dropbox's File Provider
# returns EPERM for files it materialised itself (a "pristine" synced inode).
# EPERM is not in Rust's fallback list, so it propagates and tauri-build dies with
# "Operation not permitted (os error 1)" — typically while copying the externalBin
# sidecar or the icons. Rewriting a file through a temp + rename gives it an
# ordinary local inode, which clones fine.
#
# Files git or you have written recently are already fine; this just normalises
# the ones Dropbox materialised. Safe to re-run (content and mode are preserved).
set -euo pipefail
cd "$(dirname "$0")/.."

fixed=0; checked=0
while IFS= read -r -d '' f; do
  checked=$((checked + 1))
  # cp -p preserves mode/ownership/timestamps; the temp+rename yields a new inode.
  if cp -p "$f" "$f.__inode_tmp" 2>/dev/null && mv -f "$f.__inode_tmp" "$f" 2>/dev/null; then
    fixed=$((fixed + 1))
  else
    rm -f "$f.__inode_tmp" 2>/dev/null || true
    echo "  ! could not normalise: $f" >&2
  fi
done < <(find . \
  -path ./.git -prune -o \
  -path ./node_modules -prune -o \
  -path ./src-tauri/target -prune -o \
  -type f -print0)

echo "normalised $fixed/$checked files"
echo "Tip: keep src-tauri/target, src-tauri/binaries and node_modules out of Dropbox sync:"
echo "  xattr -w com.dropbox.ignored 1 src-tauri/target src-tauri/binaries node_modules"
