# Project setup — do this BEFORE writing any jsx

The single most common way a scripted build goes wrong is starting from the wrong document.
A slide for a projector, an Instagram post, and a printed A3 poster need **different canvas
sizes, resolutions, color modes, and export files** — and if you guess, you get blurry exports,
shifted colors, or a file the printer rejects. None of that shows up until the end.

So the first job is not "write the jsx." It's a short conversation to pin down **what the piece
is** and **where it will end up**, and from that derive the document settings. The template
defaults to an on-screen 16:9 deck; treat that as a default to confirm or replace, never an
assumption.

This file is written for **Claude running this skill**: run the intake with the user, pick the
settings, then fill the template's `DOCUMENT PRESET` block. The user does not need to know any of
the jargon — that's the point.

## How to run the intake

If the user is clearly an expert and already gave you exact dimensions/DPI/mode, skip ahead and
just confirm. Otherwise, **don't ask for pixels or DPI** — ask about the goal in plain language,
two questions at a time, and translate for them. Then restate what you chose and why before
building.

Ask, roughly in this order:

1. **What are you making?** A presentation slide, a social post, a poster/flyer, a thumbnail, a
   certificate, a web banner, a one-pager… This sets a starting preset.
2. **Where will it be seen or used?** This is the decisive fork:
   - **On a screen only** (slides, a website, an app) → RGB, screen resolution, export PNG or PDF.
   - **Posted to social media** → which platform & format (feed / portrait / story)? Each has a
     fixed pixel size. RGB/sRGB, export JPG or PNG.
   - **Printed** → 300 ppi, CMYK, add bleed, export a print-ready PDF. Ask the **physical size**
     (A4, A3, business card, US Letter, or custom in mm/inches).
3. **Shape / size**, if not already implied — landscape or portrait, 16:9 / 1:1 / 4:5 / 9:16, or
   exact pixels/mm.
4. **One image, or many on the same layout?** A single graphic vs. a deck/batch. Many-of-the-same
   means set up a reusable grid once and drive it from a list (see `repage_pattern.md` and
   `psds_to_pdf.py`).
5. **Any non-Latin text (Korean, etc.), specific fonts, or brand colors?** Affects font choices
   (PostScript names — see `jsx_helpers.md` #8) and the CJK-in-diagrams caveat.

Then say something like: *"Got it — a square 1080×1080 RGB image for Instagram, exported as a
JPG. I'll build it at 2× for crisp text and downscale on export."* and proceed.

## Presets — intent + destination → settings

Pick the closest row, then adjust. "Author px" is the size you design in; **Build scale** ×
that is the real canvas (building at 2× keeps text crisp on hi-res/retina screens and in print).

| Use case | Author size | Build scale | DPI | Color | Bleed | Export |
|---|---|---|---|---|---|---|
| Presentation slide (16:9, on-screen) | 1920×1080 px | 2× → 3840×2160 | 72 | RGB | – | PDF (deck) / PNG per slide |
| Native 4K slide / video frame | 3840×2160 px | 1× | 72 | RGB | – | PNG / PDF |
| Instagram feed — square | 1080×1080 px | 2× | 72 | RGB | – | JPG / PNG |
| Instagram feed — portrait | 1080×1350 px (4:5) | 2× | 72 | RGB | – | JPG / PNG |
| Story / Reels / TikTok | 1080×1920 px (9:16) | 2× | 72 | RGB | – | JPG / PNG |
| YouTube thumbnail | 1280×720 px | 2× | 72 | RGB | – | JPG |
| Web hero / banner | exact px (e.g. 1600×600) | 2× (retina) | 72 | RGB | – | PNG / JPG |
| A4 print (portrait) | 210×297 mm | – | 300 | CMYK | 3 mm | PDF (print) |
| A3 poster | 297×420 mm | – | 300 | CMYK | 3 mm | PDF |
| Business card | 90×54 mm | – | 300 | CMYK | 3 mm | PDF |
| Certificate (A4 landscape, print) | 297×210 mm | – | 300 | CMYK | 3 mm | PDF |
| Flyer (US Letter) | 8.5×11 in | – | 300 | CMYK | 0.125 in | PDF |

**Print sizes are in mm/inches → convert to pixels** with `px = round(size_mm / 25.4 × DPI)`
(or `size_in × DPI`). Add bleed to *both* sides before converting. Worked examples at 300 DPI:
- A4 portrait 210×297 mm **+3 mm bleed each side** → (216×303 mm) → **2551×3579 px**.
- Business card 90×54 mm **+3 mm** → (96×60 mm) → **1134×709 px**.
- 3 mm of bleed at 300 DPI ≈ **35 px**; 0.125 in ≈ **38 px**.

## What each setting means (plain language)

- **Resolution (DPI/PPI)** — how many dots pack into an inch. Screens just show pixels, so DPI
  barely matters there (72 is conventional); what keeps screen text sharp is building at **2×**.
  Print is unforgiving: below **300 DPI** it looks fuzzy, so print canvases must be sized in real
  pixels at 300.
- **Color mode — RGB vs CMYK** — RGB is *light* (screens); CMYK is *ink* (print). Printers expect
  CMYK, and bright RGB colors can dull or shift when forced to ink. If it will be printed, set
  CMYK; for anything on a screen, RGB.
- **Bleed** — a few extra millimetres of artwork past where the paper gets cut, so a slightly
  off cut doesn't leave a white sliver at the edge. Print only, usually **3 mm**. Background and
  full-bleed images must extend into the bleed.
- **Safe margin** — keep text, logos, and anything important a margin in from the trim edge (and
  well clear of the bleed) so nothing gets cut off. A good default is the same ~85 px margin the
  template already uses, scaled to your canvas.
- **Aspect ratio** — width : height. Match the destination (16:9 slides, 1:1 / 4:5 Instagram,
  9:16 story) so the result isn't letterboxed or cropped when posted.
- **Build scale** — author in a comfortable grid (numbers like 85, not 170) and multiply up. 2×
  is the sweet spot for crisp screen/print output; 1× when the author size already equals the
  final pixels.

## Translate the choice into the build

Set the `DOCUMENT PRESET` block at the top of `template.jsx`:

```jsx
var CANVAS_W = 1080, CANVAS_H = 1080;    // author size in px (before scale)
var SCALE    = 2;                        // 1 = exact · 2 = build at 2x (crisp screen/print)
var DPI      = 72;                        // 72 screen/social · 300 print
var COLOR_MODE = NewDocumentMode.RGB;     // RGB screen/social · NewDocumentMode.CMYK for print
var BLEED    = 0;                          // px of bleed PER SIDE (print only; 3mm@300dpi ≈ 35)
```

- **Screen / social:** work in pixels straight from the table, `DPI = 72`, `COLOR_MODE = RGB`,
  `BLEED = 0`. Use `SCALE = 2`.
- **Print:** compute the pixel canvas from mm at 300 DPI (formula above), `DPI = 300`,
  `COLOR_MODE = NewDocumentMode.CMYK`, set `BLEED` to the px equivalent and a `SAFE` margin, and
  usually `SCALE = 1` (you already sized in real pixels). Use `cmyk()` colors for exact ink, call
  `addGuides()` to see the trim/safe lines, and keep text inside the safe box. Full **Print
  checklist** below.

## Choose the export, too

The build always produces a layered `.psd` (the editable source). The **deliverable** depends on
the destination:

- **Single screen/social image** → `scripts/export_psd.py out.psd --format jpg` (or `png`).
  JPG for photos/social (smaller), PNG when you need transparency or crisp flat color/text.
- **A deck / multi-page** → `scripts/psds_to_pdf.py` to combine slides into one PDF.
- **Print** → `scripts/export_print_pdf.sh out.psd out.pdf "[PDF/X-4:2008]"` — exports *through
  Photoshop*, keeping CMYK and the embedded profile. Don't use `export_psd.py` for print; it
  rasterizes to RGB.

## Print checklist

When the destination is print, walk this list — getting any one wrong usually means a reprint:

1. **Size in real pixels.** Convert the physical size (mm/in) to px at **300 DPI**, adding bleed
   to each side first: `px = round((size_mm + 2×bleed_mm) / 25.4 × 300)`.
2. **CMYK, not RGB.** `COLOR_MODE = NewDocumentMode.CMYK`. If the shop names a profile (e.g. *U.S.
   Web Coated (SWOP) v2*, or *Japan Color 2001 Coated*), use it; otherwise the working CMYK
   profile is fine for most jobs.
3. **Bleed ≈ 3 mm** (`BLEED` ≈ 35 px at 300 DPI). Background and full-bleed images must reach the
   document edge — they do if placed at `0,0,BASE_W,BASE_H`.
4. **Safe margin.** Set `SAFE` a few mm in from the trim; keep text and logos inside it.
   `addGuides()` draws the trim and safe lines so you can check.
5. **Exact ink.** Use `cmyk()` for key colors. Large black areas usually want a rich black like
   `cmyk(60,40,40,100)`, not flat `K100`.
6. **Placed-image resolution.** A photo should be ≥300 DPI at its placed size or it prints soft —
   an upscaled web image looks fine on screen and fuzzy in print.
7. **Export through Photoshop and proof.** `export_print_pdf.sh … "[PDF/X-4:2008]"` (or the shop's
   preset), then **open the PDF and check** colors, that text sits inside the safe area, and that
   the bleed reaches the edge — before you send it.

## Worked walkthrough (beginner)

> **User:** "I need to make an Instagram post announcing a 20% off weekend sale."
>
> **Claude (intake):** "Two quick things: is this for the normal square Instagram feed, or a
> full-screen story? And do you have brand colors/fonts, or should I pick something clean?"
>
> **User:** "Normal feed, and just make it look clean."
>
> **Claude:** "Great — a 1080×1080 square, RGB, exported as a JPG. I'll build it at 2× so the text
> stays crisp, then downscale on export."

Then: copy `template.jsx`, set `CANVAS_W = CANVAS_H = 1080`, `SCALE = 2`, `DPI = 72`,
`COLOR_MODE = NewDocumentMode.RGB`, `BLEED = 0`; add a background, a headline ("20% OFF"), a date
line, and an accent bar within a safe margin; `build_psd.sh` → `verify_psd.py` to eyeball it →
`export_psd.py … --format jpg` for the final post. Show the render, adjust, re-run.

The same loop covers a printed A3 poster — only the preset changes (mm→px at 300 DPI, CMYK,
3 mm bleed, export PDF). Get the setup right first and the rest is the normal build loop.
