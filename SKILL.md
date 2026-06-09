---
name: psd-jsx-builder
description: Programmatically build layered Photoshop PSD files from code (ExtendScript/jsx) and render-verify them without manual clicking. Use this skill whenever the user wants to generate, batch-produce, or script Photoshop documents — slide decks, portfolio pages, posters, certificates, repeated layouts, data-driven graphics — especially when they mention .psd files, Photoshop automation, jsx/ExtendScript, "build slides in Photoshop", 4K artboards, or want a reproducible image pipeline they can re-run after edits. Also use it when they need to edit text or swap images in an existing PSD without losing manual layer edits, or to verify a generated PSD by rendering it to PNG. macOS + Adobe Photoshop required.
---

# PSD jsx Builder

Build Photoshop PSD files from code instead of by hand. You write an ExtendScript (`.jsx`) that describes the document — background, placed images, text layers — then run it through Photoshop headlessly from the terminal, then render the result to a PNG to verify it. The whole loop is scriptable, so you can build → check → tweak → rebuild dozens of times without ever clicking in Photoshop.

This is the right approach when a layout repeats (a deck where every slide shares a grid), when content is data-driven, or when the user wants a pipeline they can re-run after changing an asset. For a one-off image with no structure, a normal design tool is faster.

## Why this exists / the core insight

Photoshop's UI is slow to drive and impossible to reproduce exactly. ExtendScript can build a document deterministically, but the official "run a script file" entry points are flaky across versions. The reliable path discovered through production use:

**Pass the jsx *text* to Photoshop inline via macOS `osascript … do javascript`** — not as a file alias. This sidesteps file-dialog issues, version incompatibilities (`do javascript file … as alias` is broken in some builds), and grayed-out script-browser bugs entirely. You never touch a dialog.

Then verify by rendering the saved `.psd` with **`psd-tools` → PIL** in a normal Python environment, so you can look at the result programmatically.

## Step 0 — set up the project first (especially for non-experts)

Before writing any jsx, decide what the document should *be*. Canvas size, resolution, color
mode, bleed, and the export format all depend on **what the piece is** and **where it will be
used** — an on-screen slide, an Instagram post, and a printed A3 poster need different settings,
and guessing produces blurry exports, shifted colors, or files a printer rejects. The template
defaults to an on-screen 16:9 deck; confirm or replace that — don't assume it.

If the user isn't a design expert, **don't ask for pixels or DPI.** Ask in plain language what
they're making and where it'll end up, then derive the settings and restate them in plain terms.
`references/project_setup.md` has the full intake script, an intent→settings preset table (slides,
social, print, …), beginner explanations of DPI / CMYK / bleed, and exactly how to fill the
template's `DOCUMENT PRESET` block. Read it and run the intake before building. Ready-to-paste
preset blocks for common use cases are in `references/presets.md`, and `references/workflow.md` is
the whole loop laid out step by step (setup → write → build → verify → export).

## The build loop

After setup (Step 0):

1. **Write the jsx** — copy `references/template.jsx` and fill its `DOCUMENT PRESET` block with the settings from Step 0 (canvas, scale, DPI, color mode, bleed). Then add your background, images, and text.
2. **Build** — run `scripts/build_psd.sh /abs/path/to/your.jsx`. It reads the file as UTF-8 and hands the text to Photoshop's `do javascript` (works with non-ASCII / Korean paths and content). It auto-detects the newest installed Photoshop; pass the exact app name as a 2nd arg to override.
3. **Verify** — run `python scripts/verify_psd.py /abs/path/to/output.psd` to render a PNG and print every layer's bounds. Look at the PNG; don't trust coordinates alone.
4. **Tweak and repeat** — edit the jsx, rebuild, re-verify. Because the jsx is the source of truth, the PSD is reproducible.
5. **Export the deliverable** — the build leaves a layered `.psd`; export the file you actually hand off: `scripts/export_psd.py out.psd --format jpg|png` for a single image, or `scripts/psds_to_pdf.py` to combine a deck into one PDF.

Keep one jsx per document. Don't make `_v2` copies — edit in place and let git track history. (See the matching memory/feedback if the user has one.)

## Writing the jsx

Read `references/jsx_helpers.md` before writing your first script — it has the standard helpers (`addText`, `placeImage`, `placeContain`, `fillRect`, `boxStroke`) and, more importantly, the **footguns** that will silently break your build if you don't know them. The big ones, summarized:

- **`name` and `path` are reserved globals in ExtendScript.** `var name = ...` does NOT shadow them (`app.name` is "Adobe Photoshop", `app.path` is the install dir). Use `fname`, `pnum`, etc. A script that opens "Adobe Photoshop.psd" instead of your file hit this.
- **DPI unit conversion.** At 300 dpi, `UnitValue(x, "px")` for type size misbehaves. Set `app.preferences.rulerUnits = Units.PIXELS; typeUnits = TypeUnits.PIXELS` at the top, and convert font size to points explicitly: `sizePt = sizeHDpx * SCALE * 72 / DPI`.
- **`app.open` changes the active document.** After opening an image to place it, the active doc is the image, not your slide. Duplicate into a global doc reference, then `app.activeDocument = SLIDE_DOC`.
- **`PLACEATBEGINNING` puts layers at the bottom.** Placed images added this way sit *under* earlier layers — fine for a background, wrong for an overlay. Order matters; an overlay panel placed before the image it should sit on will be hidden.
- **Close same-named tabs at the start** so re-running doesn't pile up duplicate documents.
- **`textItem.font` takes a PostScript name, and a wrong one fails silently.** Use "Inter-Light", not "Inter Light"; an unknown name renders in the *default* font with no error thrown. Suspect the font name first when type looks wrong, and confirm in the render.
- **The helpers are inconsistent about units.** `fillRect`/`boxStroke`/`addText` take document px (you wrap in `s()`); `placeImage`/`placeContain` take base-grid units (they apply `s()` for you). Mixing them double- or under-scales an element.

## Verifying — render, don't guess

`psd-tools`'s `.composite()` renders the document, but it **does not reflect a layer's translate/transform** — if a user moved a layer by hand in Photoshop, `composite()` shows it in the *original* position and bounds read as unmoved. To read a hand-moved layer's true position, query `layer.bounds` via ExtendScript (`do javascript`), not psd-tools. Keep this in mind whenever a rendered check disagrees with what you see in Photoshop.

For routine "did my layout land where I intended" checks, `verify_psd.py` is enough: it renders the composite to PNG and dumps layer bounds. Always actually look at the PNG — overlapping text, off-canvas elements, and contrast problems don't show up in coordinates.

## Preserving manual edits (text/image swap in an existing PSD)

If the user has hand-tuned a PSD and you only need to change text (e.g. renumber pages) or swap an asset, do **not** rebuild from scratch — that discards their edits. Instead open the existing PSD, walk the layers, and change only the target text-layer `contents` or replace only the target image layer, then save. `references/repage_pattern.md` shows the recursive text-only edit pattern (used to renumber a whole deck's footers while keeping every manual edit). Back up first.

## Exporting the deliverable

The build always leaves a layered `.psd` — the editable source. Export the actual hand-off file from it, matching the destination chosen in Step 0:

- **One image** (a social post, a web banner, a single page) → `scripts/export_psd.py out.psd --format jpg|png [--width 1080]`. JPG for photos/social, PNG for transparency or crisp flat color/text.
- **A deck / multi-page** → `scripts/psds_to_pdf.py` combines many PSDs into one PDF (render each with `psd-tools` composite → resize LANCZOS → multi-page PDF). Keep the page order explicit with an ordered list, because filename sort may not equal slide order.
- **Print** → `scripts/export_print_pdf.sh out.psd out.pdf "[PDF/X-4:2008]"` — exports through Photoshop so it keeps CMYK and the embedded profile (`export_psd.py` is RGB-only, not for print). See `references/project_setup.md` for the print checklist: CMYK + profile, bleed, safe area, `cmyk()` colors, and `addGuides()`.

## Quick reference

| Task | Tool |
|------|------|
| Set up the project (do FIRST) | `references/project_setup.md` |
| Ready presets by use case | `references/presets.md` |
| Step-by-step workflow | `references/workflow.md` |
| Blank template + `DOCUMENT PRESET` | `references/template.jsx` |
| Build PSD from jsx | `scripts/build_psd.sh file.jsx` |
| Render + bounds check | `scripts/verify_psd.py out.psd` |
| Export one image (PNG/JPG/PDF) | `scripts/export_psd.py out.psd --format jpg` |
| Export print-ready PDF (CMYK) | `scripts/export_print_pdf.sh out.psd out.pdf` |
| Combine a deck → PDF | `scripts/psds_to_pdf.py` |
| Helpers + footguns | `references/jsx_helpers.md` |
| Text-only / image-swap edit | `references/repage_pattern.md` |

## Requirements

- macOS with Adobe Photoshop installed (tested on Photoshop 2026). `build_psd.sh` auto-detects the newest installed version; pass the exact app name as a 2nd arg to override (list yours with `ls /Applications | grep -i Photoshop`).
- Python 3 with `psd-tools` and `Pillow` (`pip install psd-tools pillow`).
