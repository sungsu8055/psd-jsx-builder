# jsx helpers & footguns

Standard helpers live in `template.jsx`. This file explains them and, more importantly,
the non-obvious traps that will silently break a scripted PSD build. Read it before
writing your first script — most of these cost real debugging time to discover.

## Coordinate model

Author in a 1920×1080 base grid and multiply by `SCALE` (=2) to reach 4K (3840×2160 @ 300dpi).
The `s(v)` helper does `v * SCALE`. This keeps numbers readable (a margin is `85`, not `170`)
and lets you change the master resolution by editing one constant.

## Helpers

**Units — read this first (it bites).** The helpers are *not* consistent about units:

- `fillRect`, `boxStroke`, `addText` take **document px** for `x/y/w/h` — you wrap base
  values in `s()` yourself: `fillRect(name, s(85), s(200), s(120), s(4), GOLD)`.
- `placeImage`, `placeContain` take **base-grid units** — they call `s()` *for* you, so pass
  raw base numbers: `placeImage("hero.png", name, 0, 0, BASE_W, BASE_H)`.

Rule of thumb: rectangles & text → `s(...)`; placed images → no `s(...)`. `addText`'s
`sizeHDpx` is always base-grid regardless. (See footgun #9.)

- **`fillRect(name, x, y, w, h, color)`** — a filled rectangle layer. `x/y/w/h` in document px
  (wrap base values in `s()` yourself). Used for dividers, panels, bars.
- **`boxStroke(name, x, y, w, h, color, t)`** — a hollow rectangle (4 thin fillRects). For
  image borders / callout frames. `x/y/w/h` in document px; `t` defaults to 2px.
- **`addText(name, text, font, sizeHDpx, color, x, y, tracking)`** — a point-text layer.
  `x/y` in **document px** (wrap in `s()`); `sizeHDpx` is in the **base grid** and is converted
  to points internally. `font` must be a **PostScript name** (footgun #8). `tracking` is
  optional letter-spacing (milliEm).
- **`placeImage(file, name, x, y, boxW, boxH)`** — places an image scaled to **cover** the box
  (`Math.max`), cropping overflow. `x/y/boxW/boxH` in **base-grid units** (no `s()`). Use for
  photos / fullbleed art.
- **`placeContain(file, name, x, y, boxW, boxH)`** — places an image scaled to **contain**
  within the box (`Math.min`). Same base-grid units as `placeImage`. Use for transparent PNGs
  (diagrams, QR codes, logos) where nothing should spill outside the box.
- **`hex(h)`** / **`cmyk(c, m, y, k)`** — make a color. `hex` is an RGB hex string (screen);
  `cmyk` is exact ink, 0–100 each, for a CMYK print document. See **Print** below.
- **`addGuides()`** — drops non-printing trim + safe-area guides from the preset's `BLEED`/`SAFE`,
  so print layouts show where the paper is cut and how far to keep text from the edge.

## Footguns (the important part)

### 1. `name` and `path` are reserved globals
ExtendScript exposes `app.name` ("Adobe Photoshop") and `app.path` (install dir) as globals.
Declaring `var name = "..."` does **not** shadow them reliably — code that reads `name` later
may get "Adobe Photoshop". Symptom seen in production: a save routine tried to open
`Adobe Photoshop.psd` and threw NOTFOUND. **Use `fname`, `pnum`, `docName`, etc. Never `name`/`path`.**

### 2. DPI breaks naive px units for type
At 300 dpi, setting `textItem.size = UnitValue(x, "px")` does not give you x screen pixels.
Set units to pixels at the top of the script **and** convert font size to points explicitly:
```
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits  = TypeUnits.PIXELS;
ti.size = UnitValue(sizeHDpx * SCALE * 72 / DPI, "pt");
```

### 3. `app.open` steals the active document
Opening an image to place it makes that image the active document. If you then add layers,
they go into the image, not your slide. Always duplicate into a held reference
(`SLIDE_DOC`) and restore `app.activeDocument = SLIDE_DOC` right after.

### 4. `PLACEATBEGINNING` = bottom of the stack
Layers duplicated with `ElementPlacement.PLACEATBEGINNING` land at the **bottom**, under
everything added before them. Great for a background image. Wrong for an overlay — a dark
panel placed "on" a photo this way ends up hidden behind it. If you need something on top,
add it after, or move it. (A real bug: a QR callout panel placed over an in-game capture
rendered *under* the image. Fix: don't overlay; put the callout in empty space instead.)

### 5. Re-running piles up tabs
Each build adds a new document. Close same-named docs at the start (the template does this)
so the tenth rebuild doesn't leave ten open documents.

### 6. psd-tools can't see manual moves
`.composite()` ignores a layer's translate/transform done by hand in Photoshop. If a user
nudged a layer, the render and the bounds read by psd-tools show the **original** spot. To get
the true position, query `layer.bounds` via `do javascript`. So when verifying a PSD the user
has also been editing by hand, trust ExtendScript bounds over psd-tools for position.

### 7. Build dialog is unreliable — go inline
Don't drive File > Scripts > Browse. Pass the jsx text to `do javascript` via osascript
(`scripts/build_psd.sh`). No dialog, no grayed-out/stale-file bugs, works headlessly.

### 8. A wrong font name fails *silently*
`textItem.font` wants the **PostScript name** ("Inter-Light", "HelveticaNeue-Bold"), not the
display name ("Inter Light"). `addText` wraps the assignment in `try/catch`, so an unknown name
doesn't error — Photoshop just renders in whatever the default font is, and you only notice by
looking at the render. Find the real name: in Photoshop's JS console
`app.fonts.getByName("Inter Light").postScriptName`, or on macOS
`fc-list | grep -i inter`. When type looks wrong, suspect the font name first.

### 9. Helper units are inconsistent
`fillRect`/`boxStroke`/`addText` take **document px** for position/size (you wrap in `s()`);
`placeImage`/`placeContain` take **base-grid units** (they call `s()` internally). Mixing them
up double-scales or under-scales an element. Rule: rectangles & text → `s(...)`; placed images
→ raw base numbers. (Full table in the Helpers section above.)

## Diagrams with non-Latin labels
If you generate diagrams (e.g. via `cairosvg`), note many SVG renderers lack CJK fonts —
Korean labels come out as boxes. Keep diagram text in Latin/English and add any localized
labels as jsx text layers on top, where Photoshop's fonts apply.

## Aspect ratio
Never stretch images to fit (different x/y scale). Cropping, scaling uniformly, masking, and
repositioning are fine; non-uniform scaling looks cheap and is a common reject. `placeImage`
and `placeContain` both scale uniformly by design.

## Print (CMYK, bleed, guides)
For anything that gets printed, set the preset to print values (see `project_setup.md`): a CMYK
`COLOR_MODE`, `DPI = 300`, a `BLEED` (≈35 px for 3 mm) and a `SAFE` margin.

- **Color** — use `cmyk(c, m, y, k)` so the printer gets the exact ink you intend. `hex()` still
  works, but in a CMYK document Photoshop converts the RGB on fill, which is only approximate —
  fine for rough color, wrong for a brand's exact ink. (Rich black for large fills is usually
  `cmyk(60,40,40,100)`, not `cmyk(0,0,0,100)`.)
- **Bleed** — `BASE_*` already include the bleed, so a full-bleed background or photo placed at
  `0,0,BASE_W,BASE_H` runs into the cut zone as it should. The trim corner is at `s(BLEED)`; keep
  text inside the safe box `[s(BLEED+SAFE) .. s(BLEED+CANVAS−SAFE)]`.
- **Guides** — call `addGuides()` so you can see the trim and safe lines (guides never print).
- **Export** — do **not** use `export_psd.py` for the final print file; it rasterizes to RGB.
  Use `scripts/export_print_pdf.sh out.psd out.pdf "[PDF/X-4:2008]"` — it exports through
  Photoshop and keeps CMYK + the embedded profile. Open and proof the PDF before sending it.
