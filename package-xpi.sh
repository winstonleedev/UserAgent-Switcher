#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$ROOT_DIR/src"
DIST_DIR="$ROOT_DIR/dist"
NAME="${1:-useragent-switcher}"
ZIP_PATH="$DIST_DIR/$NAME.zip"
XPI_PATH="$DIST_DIR/$NAME.xpi"

if command -v web-ext >/dev/null 2>&1; then
  WEB_EXT_CMD=(web-ext)
elif command -v npx >/dev/null 2>&1; then
  WEB_EXT_CMD=(npx --yes web-ext)
else
  echo "Error: neither 'web-ext' nor 'npx' is available." >&2
  exit 1
fi

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Error: source directory not found at $SRC_DIR" >&2
  exit 1
fi

mkdir -p "$DIST_DIR"
rm -f "$ZIP_PATH" "$XPI_PATH"

"${WEB_EXT_CMD[@]}" build \
  --source-dir "$SRC_DIR" \
  --artifacts-dir "$DIST_DIR" \
  --filename "$NAME.zip" \
  --overwrite-dest

mv "$ZIP_PATH" "$XPI_PATH"
echo "Created: $XPI_PATH"
