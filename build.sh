#!/bin/sh
# Arch2D — assemble the single-file deliverable (index.html) from dev.html + src/.
# Dev-only step; end users just open index.html. Requires only POSIX sh + awk.
set -eu
cd "$(dirname "$0")"

OUT="index.html"
TMP="$(mktemp "${TMPDIR:-/tmp}/arch2d.XXXXXX")"

# Guard: inlined JS must never contain a closing script tag.
if grep -l -i '</script' src/*.js >/dev/null 2>&1; then
  echo "error: a src/*.js file contains a closing script tag:" >&2
  grep -l -i '</script' src/*.js >&2
  exit 1
fi

awk '
function inline(path, opentag, closetag,    line) {
  print opentag
  print "/* === " path " === */"
  while ((getline line < path) > 0) print line
  close(path)
  print closetag
}
{
  if (match($0, /<link rel="stylesheet" href="src\/[^"]+">?/)) {
    s = substr($0, RSTART, RLENGTH); sub(/.*href="/, "", s); sub(/".*/, "", s)
    inline(s, "<style>", "</style>"); next
  }
  if (match($0, /<script src="src\/[^"]+"><\/script>/)) {
    s = substr($0, RSTART, RLENGTH); sub(/.*src="/, "", s); sub(/".*/, "", s)
    inline(s, "<script>", "</script>"); next
  }
  if ($0 ~ /Load order is part of the contract/) next
  print
}' dev.html > "$TMP"

mv "$TMP" "$OUT"
echo "built $OUT ($(wc -c < "$OUT" | tr -d " ") bytes)"
