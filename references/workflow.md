# How a build goes, step by step

This is the loop the skill follows, from a chat request to a finished file. In Cowork you just
describe what you want and Claude runs these steps for you; if you drive the scripts yourself,
this is the order to follow.

## 0. Decide what it's for — setup

Before writing anything, pin down **what the piece is** and **where it will be used**. That fixes
the canvas size, resolution, color mode, bleed, and export format — guessing them produces blurry
exports, shifted colors, or unusable files.

- Not sure about pixels/DPI/CMYK? You don't need to be. Answer the plain-language questions in
  `project_setup.md` and let the settings be derived for you.
- Already know the use case? Grab the ready block from `presets.md` and skip ahead.

## 1. Write the jsx

Copy `template.jsx`, paste the chosen `DOCUMENT PRESET` block at the top, set `DOC_NAME` /
`OUT_PSD`, and add your content with the helpers — `fillRect`, `addText`, `placeImage`,
`placeContain`, `boxStroke` (and `cmyk()` / `addGuides()` for print). Keep one jsx per document
and edit it in place; the jsx is the source of truth, not the PSD.

## 2. Build

```bash
./scripts/build_psd.sh /abs/path/to/your.jsx
```

It hands the script *text* to Photoshop via `osascript … do javascript` — no file dialogs, works
with non-ASCII paths — and Photoshop saves a layered `.psd`. The newest installed Photoshop is
auto-detected (pass an app name as a 2nd arg to override).

## 3. Verify — render, and actually look

```bash
python scripts/verify_psd.py /abs/path/to/out.psd --width 1280
```

It renders a PNG and prints every layer's bounds. **Look at the PNG.** Overlapping text,
off-canvas elements, a font that silently fell back, and contrast problems don't show up in
coordinates — only in the render.

## 4. Tweak and rebuild

Adjust the jsx, rebuild, re-verify. Because the build is fully scripted, the PSD is reproducible —
you can repeat this dozens of times. When something looks wrong, check the footguns in
`jsx_helpers.md` first: a wrong PostScript font name falls back silently (#8), the helpers differ
on units (#9), placed layers default to the bottom of the stack (#4), and so on.

## 5. Export the deliverable

The build leaves a layered `.psd` (the editable source). Export the actual hand-off file:

| Destination | Command |
|---|---|
| Screen / social (one image) | `python scripts/export_psd.py out.psd --format jpg|png --width 1080` |
| A deck (many slides) | `python scripts/psds_to_pdf.py --list order.txt --out deck.pdf` |
| Print (CMYK, keeps profile) | `./scripts/export_print_pdf.sh out.psd out.pdf "[PDF/X-4:2008]"` |

## Editing an existing PSD

If you only need to change some text or swap an image in a PSD that's already been hand-tuned,
**don't rebuild from scratch** — that throws away the manual edits. Open it and change only the
targets in place; see `repage_pattern.md`.
