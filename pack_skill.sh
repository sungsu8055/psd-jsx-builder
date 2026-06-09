#!/usr/bin/env bash
# Build psd-jsx-builder.skill — the installable bundle for Claude / Cowork.
#
# A ".skill" is just a zip that Claude can install via the "Save skill" button.
# Claude expects the archive to contain a single top-level folder named after the
# skill, with SKILL.md inside it (psd-jsx-builder/SKILL.md, psd-jsx-builder/scripts/…).
# This script stages exactly the skill payload under that folder and zips it, so the
# result installs cleanly no matter where the repo lives.
#
# Maintainers: run this after editing SKILL.md / references / scripts / examples,
# then commit the regenerated psd-jsx-builder.skill.
#
#   ./pack_skill.sh
#
# Pure bash + zip — works on macOS and Linux. No Python needed.

set -euo pipefail

SKILL_NAME="psd-jsx-builder"
ROOT="$(cd "$(dirname "$0")" && pwd)"   # repo root (this script lives here)
OUT="$ROOT/$SKILL_NAME.skill"

# The payload Claude actually loads. README.md, .gitignore, .git, pack_skill.sh,
# and the built .skill itself are deliberately left OUT of the bundle.
PAYLOAD=(SKILL.md references scripts examples LICENSE)

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

mkdir -p "$STAGE/$SKILL_NAME"
for item in "${PAYLOAD[@]}"; do
  if [[ -e "$ROOT/$item" ]]; then
    cp -R "$ROOT/$item" "$STAGE/$SKILL_NAME/"
  else
    echo "warning: skipping missing payload item: $item" >&2
  fi
done

# Strip build junk that may be sitting in the working tree.
find "$STAGE/$SKILL_NAME" -type d -name "__pycache__" -prune -exec rm -rf {} +
find "$STAGE/$SKILL_NAME" -type f \( -name "*.pyc" -o -name ".DS_Store" \) -delete

rm -f "$OUT"
( cd "$STAGE" && zip -r -X -q "$OUT" "$SKILL_NAME" )

echo "built: $OUT"
echo "contents:"
unzip -l "$OUT" | awk 'NR>3 && $4 != "" {print "  " $4}'
