#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$ROOT_DIR/src"
DIST_DIR="$ROOT_DIR/dist"
NAME="${1:-useragent-switcher}"
ZIP_PATH="$DIST_DIR/$NAME.zip"
XPI_PATH="$DIST_DIR/$NAME.xpi"

if ! command -v zip >/dev/null 2>&1; then
  echo "Error: 'zip' command is required but not installed." >&2
  exit 1
fi

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Error: source directory not found at $SRC_DIR" >&2
  exit 1
fi

mkdir -p "$DIST_DIR"
rm -f "$ZIP_PATH" "$XPI_PATH"

(
  cd "$SRC_DIR"
  zip -rq "$ZIP_PATH" . -x "*.DS_Store"
)

mv "$ZIP_PATH" "$XPI_PATH"
echo "Created: $XPI_PATH"
