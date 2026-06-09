#!/usr/bin/env bash
# Export a PSD to a PRINT-READY PDF using Photoshop itself.
#
# Why not export_psd.py for print: that path renders with psd-tools/PIL and writes an *RGB raster*
# PDF — fine for screen, wrong for a print shop. Photoshop's own PDF export keeps the document in
# CMYK, embeds the color profile, and can emit PDF/X. So print PDFs go through Photoshop.
#
# Usage:  ./export_print_pdf.sh /abs/in.psd [/abs/out.pdf] ["[High Quality Print]"]
#
# Arg 3 is a Photoshop PDF preset name. Common print-ready ones:
#   "[High Quality Print]"   "[Press Quality]"   "[PDF/X-4:2008]"   "[PDF/X-1a:2001]"
# Ask the print shop which they want; PDF/X-1a/X-4 are the usual "press-ready" answers.
# If the named preset isn't installed, the script falls back to high-quality print settings.

set -euo pipefail

PSD="${1:?usage: export_print_pdf.sh /abs/in.psd [/abs/out.pdf] [\"[High Quality Print]\"]}"
OUT="${2:-${PSD%.*}.pdf}"
PRESET="${3:-[High Quality Print]}"
HERE="$(cd "$(dirname "$0")" && pwd)"

[[ -f "$PSD" ]] || { echo "error: psd not found: $PSD" >&2; exit 1; }
# Paths get embedded into a jsx string literal below; a double quote would break it.
case "$PSD$OUT" in *\"*) echo "error: paths must not contain double quotes" >&2; exit 1;; esac

TMP="${TMPDIR:-/tmp}/export_print_$$.jsx"
trap 'rm -f "$TMP"' EXIT

# Generate a tiny jsx (paths baked in as literals) and run it through build_psd.sh, which already
# handles Photoshop auto-detection and the osascript `do javascript` invocation.
cat > "$TMP" <<JSX
#target photoshop
var doc = app.open(new File("$PSD"));
var o = new PDFSaveOptions();
var ok = false;
try { o.pDFPreset = "$PRESET"; ok = true; } catch (e) {}   // prefer an installed print preset
if (!ok) {                                                 // fallback: high quality, no downsampling
  o.embedColorProfile = true;
  o.encoding = PDFEncoding.JPEG; o.jpegQuality = 12;
  o.downSample = PDFResample.NONE;
  o.preserveEditing = false;                               // flatten -> clean print file
}
doc.saveAs(new File("$OUT"), o, true, Extension.LOWERCASE);
doc.close(SaveOptions.DONOTSAVECHANGES);
JSX

echo "exporting print PDF via Photoshop: $PSD"
echo "   preset: $PRESET  ->  $OUT"
"$HERE/build_psd.sh" "$TMP"
echo "print PDF: $OUT"
