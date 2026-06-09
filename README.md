# psd-jsx-builder

Make Photoshop `.psd` files by **chatting with Claude in Cowork**. You say what you want, Claude
writes a small Photoshop script, runs it, and renders the result so you can see it — no manual
clicking.

> **Status: early prototype (R&D).** This is not a finished product. Right now it does one thing:
> build PSDs in Photoshop through Claude Cowork via chat. It'll grow from here.

## Getting started (no experience needed)

You don't need to code, use a terminal, or install anything technical. You just chat with Claude.

### 1. What you need first

- A **Mac**.
- **Adobe Photoshop** installed on that Mac (you need your own copy).
- The **Claude desktop app** with **Cowork** — download it from [claude.ai](https://claude.ai)
  and sign in.

That's all. (Claude takes care of the preview/export tools on its side — you don't install Python
or anything else.)

### 2. Install the skill — one time

The whole thing is **one file, `psd-jsx-builder.skill`**. It's a bundle that already contains
everything — the instructions, every reference doc, and the scripts — so that single file is all
you need. (You do *not* download the `.md` files separately.)

1. **Turn on code execution** (required for skills): open **Settings → Capabilities** and switch
   on **"Code execution and file creation."**
2. **Install the skill — pick whichever is easier:**
   - **Easiest, one click:** when `psd-jsx-builder.skill` shows up in a Claude chat, click the
     **Save skill** button on it.
   - **Or upload it yourself:** go to **Customize → Skills**, click **＋ → Create skill → Upload a
     skill**, and choose the `psd-jsx-builder.skill` file. *(If the file picker only accepts
     `.zip`, rename the file from `.skill` to `.zip` — it's the same archive.)*
3. Done — it appears in **Customize → Skills** with a toggle, and you never have to do this again.

To use it, just describe what you want in a chat (Claude picks the skill automatically), or type
`/` and choose it from the list.

### 3. Make your first image

1. Open a **new Cowork chat**.
2. **Pick a folder** for your files — when Claude asks (or from the chat), choose a folder on your
   Mac where the finished files should be saved.
3. **Type what you want, in plain words.** For example:
   - *"Make a 1080×1080 Instagram post that says GRAND OPENING in big letters, dark background."*
   - *"Build a 16:9 title slide — title 'Quarterly Review', subtitle 'Q2 2026'."*
   - *"I need a business card, 90×54 mm, name 'Alex Kim', role 'Designer', for printing."*
4. Claude writes the script, opens Photoshop, builds the file, and shows you a **preview image**.
5. **Want changes? Just say so:** *"make the title bigger,"* *"use a blue background,"* *"move the
   logo to the top-right."* Claude rebuilds and shows you again.
6. When it looks right, the layered **`.psd`** (plus a JPG/PNG/PDF) is waiting in your folder.

### Good to know

- **You can be vague.** Not sure about size or settings? Just describe the goal — Claude will ask
  what it's for (a slide? Instagram? something to print?) and pick the right size and quality.
- **For printing,** say it's for print and the size (e.g. *"A4 poster for printing"*). Claude sets
  it up properly (CMYK, 300 DPI, bleed).
- **Photoshop will open and move on its own** while it builds — that's normal, let it work.
- **First time only:** your Mac may pop up a box asking to let Claude control Photoshop — click
  **OK / Allow**.

<details>
<summary><b>For developers — run the scripts without Claude (optional)</b></summary>

The scripts are plain bash + Python. You'll need Python 3.

```bash
git clone https://github.com/sungsu8055/psd-jsx-builder.git
cd psd-jsx-builder
pip install psd-tools pillow

./scripts/build_psd.sh examples/hello_slide.jsx          # builds a sample slide to your Desktop
python scripts/verify_psd.py ~/Desktop/hello_slide.psd   # render a PNG + dump layer bounds
```

Copy `references/template.jsx`, paste a block from `references/presets.md`, add your content, and
build. The full step-by-step is in `references/workflow.md`.
</details>

## How it works

When you ask for something in chat, these steps run — in Cowork, Claude does them for you.

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

Ready-made document settings so you don't have to work out pixels, DPI, or bleed. (In chat you
don't touch these — Claude picks the right one. Copy-paste blocks live in `references/presets.md`.)

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

## License

MIT © 2026 Kim Sungsu. Adobe and Photoshop are trademarks of Adobe Inc.; this is an independent
prototype, not affiliated with Adobe or Anthropic.
