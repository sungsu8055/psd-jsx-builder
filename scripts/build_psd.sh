#!/usr/bin/env bash
# Build a PSD by sending a .jsx file's text to Photoshop via osascript `do javascript`.
#
# Why inline text instead of a file alias: Photoshop's `do javascript file ... as alias`
# is broken in some versions, and the File > Scripts > Browse dialog has grayed-out /
# stale-mtime bugs. Passing the script text inline avoids all of that — no dialog, ever.
# Reads the file as UTF-8 so non-ASCII paths/content (e.g. Korean) work.
#
# Usage:  ./build_psd.sh /absolute/path/to/script.jsx ["Adobe Photoshop 2026"]
#
# Arg 2 (optional) is the Photoshop application name. If omitted, the newest installed
# "Adobe Photoshop*" under /Applications is auto-detected (falling back to 2026).

set -euo pipefail

JSX="${1:?usage: build_psd.sh /abs/path/to/script.jsx [\"Adobe Photoshop 2026\"]}"

if [[ ! -f "$JSX" ]]; then
  echo "error: jsx not found: $JSX" >&2
  exit 1
fi

# ---- resolve the Photoshop app name ----
if [[ $# -ge 2 && -n "${2:-}" ]]; then
  PS_APP="$2"                                   # explicit override
else
  PS_APP="Adobe Photoshop 2026"                 # fallback if nothing is found
  shopt -s nullglob
  candidates=(/Applications/Adobe\ Photoshop*/Adobe\ Photoshop*.app)
  shopt -u nullglob
  if (( ${#candidates[@]} )); then              # pick the highest release YEAR (so CC 2019 < 2026)
    best_year=-1; best=""
    for c in "${candidates[@]}"; do
      yr="$(basename "$c" .app | grep -oE '[0-9]{4}' | tail -1)"; [[ -z "$yr" ]] && yr=0
      if (( yr > best_year )); then best_year=$yr; best="$c"; fi
    done
    [[ -n "$best" ]] && PS_APP="$(basename "$best" .app)"
  fi
fi

trap 'st=$?; if [[ $st -ne 0 ]]; then echo "build failed (exit $st). If this is an app-name error, pass the exact Photoshop name as arg 2, e.g. \"Adobe Photoshop 2025\". Installed: $(ls -d /Applications/Adobe\ Photoshop* 2>/dev/null | tr "\n" " ")" >&2; fi' EXIT

echo "building: $JSX"
echo "   using: $PS_APP"

# Bake the resolved app name in as a LITERAL (unquoted heredoc expands ${PS_APP}).
# AppleScript must load Photoshop's scripting dictionary at COMPILE time to know the
# `do javascript` command; with a variable app name it can't, and the script dies with a
# -2741 syntax error ("expected end of line but found identifier"). The jsx itself is still
# read from the file path via argv, so its quotes/newlines/non-ASCII never touch this script.
osascript - "$JSX" <<OSA
on run argv
  set jsxPath to item 1 of argv
  set fh to open for access (POSIX file jsxPath)
  set jsxText to read fh as «class utf8»
  close access fh
  tell application "${PS_APP}" to do javascript jsxText
end run
OSA

echo "done. verify with: python scripts/verify_psd.py <output>.psd"
