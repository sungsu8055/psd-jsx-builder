# psd-jsx-builder

Make Photoshop `.psd` files by **chatting with Claude in Cowork**. You say what you want, Claude
writes a small Photoshop script, runs it, and renders the result so you can see it — no manual
clicking.

> **Status: early prototype (R&D).** This is not a finished product. Right now it does one thing:
> build PSDs in Photoshop through Claude Cowork via chat. It'll grow from here.

## How it works

You ask for something in chat (e.g. *"a 16:9 title slide that says Hello"*) and these steps run —
in Cowork, Claude does them for you; running the scripts yourself, this is the order.

| # | Step | Tool |
|---|------|------|
| 1 | **Set up** — decide what it's for, then pick a preset | `references/project_setup.md` · `presets.md` |
| 2 | **Write** — a small `.jsx` describes the document (from the template) | `references/template.jsx` |
| 3 | **Build** — run it through Photoshop via `osascript` → a layered `.psd` | `scripts/build_psd.sh` |
| 4 | **Verify** — render a PNG + dump layer bounds, and look at it | `scripts/verify_psd.py` |
| 5 | **Refine** — tweak the jsx and rebuild; the build is fully reproducible | — |
| 6 | **Export** — a JPG/PNG, a PDF deck, or a print-ready CMYK PDF | `scripts/export_psd.py` · `export_print_pdf.sh` |

Editing an existing PSD (change text / swap an image without losing manual edits) is handled
separately — see `references/repage_pattern.md`.

## Use-case presets

Ready-made document settings so you don't have to work out pixels, DPI, or bleed. Paste one block
(from `references/presets.md`) over the template's `DOCUMENT PRESET`, add your content, build.

| Use case | Size | Color | Export |
|----------|------|-------|--------|
| Presentation slide (16:9) | 1920×1080 px | RGB | PNG · PDF deck |
| Instagram — square | 1080×1080 px | RGB | JPG |
| Instagram — portrait (4:5) | 1080×1350 px | RGB | JPG |
| Story / Reels / TikTok (9:16) | 1080×1920 px | RGB | JPG |
| YouTube thumbnail | 1280×720 px | RGB | JPG |
| Web hero / banner | your px (built 2×) | RGB | PNG · JPG |
| A4 / A3 poster | mm @ 300 DPI + bleed | CMYK | print PDF (PDF/X) |
| Business card | 90×54 mm | CMYK | print PDF |
| US Letter flyer | 8.5 × 11 in | CMYK | print PDF |

Screen output (slides, social) is the solid path. **Print (CMYK / PDF·X) is experimental.**

## What's in here

| Area | Purpose |
|------|---------|
| `references/template.jsx` | Blank document + `DOCUMENT PRESET` block + drawing helpers |
| `references/project_setup.md` | Beginner intake: what is it / where used → settings |
| `references/presets.md` | Copy-paste preset blocks by use case |
| `references/workflow.md` | The whole loop, step by step |
| `references/jsx_helpers.md` | Helper docs + the ExtendScript footguns that bite |
| `references/repage_pattern.md` | Edit text / swap images without losing manual edits |
| `scripts/` | Build, verify, and export tools (bash + Python) |
| `examples/` | Runnable `.jsx` samples |

## Requirements

- macOS + Adobe Photoshop (tested on 2026)
- Python 3 with `psd-tools` and `Pillow` — `pip install psd-tools pillow`
- For the chat workflow: Claude Cowork

## Usage

**In Claude Cowork (the main way)** — install this as a skill, then just ask, e.g.
*"build a 1080×1080 Instagram post that says 20% OFF this weekend."* Claude handles the script,
the build, and the preview, and you refine it in conversation.

**Standalone (the scripts underneath)** — plain bash/Python, no Claude needed:

```bash
pip install psd-tools pillow
./scripts/build_psd.sh examples/hello_slide.jsx          # builds a sample slide to your Desktop
python scripts/verify_psd.py ~/Desktop/hello_slide.psd   # render + layer bounds
```

## License

MIT © 2026 Kim Sungsu. Adobe and Photoshop are trademarks of Adobe Inc.; this is an independent
prototype, not affiliated with Adobe or Anthropic.
