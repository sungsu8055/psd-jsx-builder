# Setting templates by use case

Ready-to-paste `DOCUMENT PRESET` blocks. Pick your use case, paste the block over the preset block
at the top of `template.jsx`, then add your content. The "why" behind these values (DPI, CMYK,
bleed, safe margin) is in `project_setup.md`.

Notes:
- **Print sizes are already converted to pixels at 300 DPI.** `CANVAS_W/H` is the *trim* size;
  `BLEED` is added around it automatically. Formula if you need another size:
  `px = round(mm / 25.4 × 300)`.
- `SCALE = 2` builds at 2× so screen text stays crisp; print blocks use `SCALE = 1` (already in
  real pixels).
- After building, export with the command shown under each block.

## Screen

### Presentation slide — 16:9
```jsx
var CANVAS_W = 1920, CANVAS_H = 1080;
var SCALE = 2, DPI = 72;
var COLOR_MODE = NewDocumentMode.RGB;
var BLEED = 0, SAFE = 0;
// export: python scripts/export_psd.py out.psd --format png --width 1920
//   a deck → python scripts/psds_to_pdf.py --list order.txt --out deck.pdf
```

### Instagram — square (1:1)
```jsx
var CANVAS_W = 1080, CANVAS_H = 1080;
var SCALE = 2, DPI = 72;
var COLOR_MODE = NewDocumentMode.RGB;
var BLEED = 0, SAFE = 0;
// export: python scripts/export_psd.py out.psd --format jpg --width 1080
```

### Instagram — portrait (4:5)
```jsx
var CANVAS_W = 1080, CANVAS_H = 1350;
var SCALE = 2, DPI = 72;
var COLOR_MODE = NewDocumentMode.RGB;
var BLEED = 0, SAFE = 0;
// export: python scripts/export_psd.py out.psd --format jpg --width 1080
```

### Story / Reels / TikTok (9:16)
```jsx
var CANVAS_W = 1080, CANVAS_H = 1920;
var SCALE = 2, DPI = 72;
var COLOR_MODE = NewDocumentMode.RGB;
var BLEED = 0, SAFE = 0;
// export: python scripts/export_psd.py out.psd --format jpg --width 1080
```

### YouTube thumbnail (16:9)
```jsx
var CANVAS_W = 1280, CANVAS_H = 720;
var SCALE = 2, DPI = 72;
var COLOR_MODE = NewDocumentMode.RGB;
var BLEED = 0, SAFE = 0;
// export: python scripts/export_psd.py out.psd --format jpg --width 1280
```

### Web hero / banner (set your own px)
```jsx
var CANVAS_W = 1600, CANVAS_H = 600;   // change to your slot size
var SCALE = 2, DPI = 72;               // 2× for retina screens
var COLOR_MODE = NewDocumentMode.RGB;
var BLEED = 0, SAFE = 0;
// export: python scripts/export_psd.py out.psd --format png --width 1600
```

## Print (CMYK · 300 DPI · 3 mm bleed)

Use `cmyk()` colors for exact ink, call `addGuides()` to see the trim/safe lines, and export with
`export_print_pdf.sh`. Proof the PDF before sending. See the print checklist in `project_setup.md`.

### A4 — portrait (210 × 297 mm)
```jsx
var CANVAS_W = 2480, CANVAS_H = 3508;
var SCALE = 1, DPI = 300;
var COLOR_MODE = NewDocumentMode.CMYK;
var BLEED = 35, SAFE = 90;
// export: ./scripts/export_print_pdf.sh out.psd out.pdf "[PDF/X-4:2008]"
```

### A3 — poster (297 × 420 mm)
```jsx
var CANVAS_W = 3508, CANVAS_H = 4961;
var SCALE = 1, DPI = 300;
var COLOR_MODE = NewDocumentMode.CMYK;
var BLEED = 35, SAFE = 90;
// export: ./scripts/export_print_pdf.sh out.psd out.pdf "[PDF/X-4:2008]"
```

### Business card (90 × 54 mm)
```jsx
var CANVAS_W = 1063, CANVAS_H = 638;
var SCALE = 1, DPI = 300;
var COLOR_MODE = NewDocumentMode.CMYK;
var BLEED = 35, SAFE = 60;
// export: ./scripts/export_print_pdf.sh out.psd out.pdf "[PDF/X-4:2008]"
```

### US Letter — flyer (8.5 × 11 in)
```jsx
var CANVAS_W = 2550, CANVAS_H = 3300;
var SCALE = 1, DPI = 300;
var COLOR_MODE = NewDocumentMode.CMYK;
var BLEED = 38, SAFE = 90;   // 0.125 in bleed
// export: ./scripts/export_print_pdf.sh out.psd out.pdf "[PDF/X-4:2008]"
```
