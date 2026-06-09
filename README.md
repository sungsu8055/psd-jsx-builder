# psd-jsx-builder

Make layered Photoshop **`.psd`** files by **chatting with Claude** — you describe what you
want, Claude writes a small Photoshop script, runs it, and shows you a preview. No clicking
around in Photoshop.

> **Status: early prototype (R&D).** Right now it does one thing: build PSDs in Photoshop
> through Claude's **Cowork** mode via chat. It'll grow from here.

## Install — one time

**1. Download the skill:**
[`psd-jsx-builder.zip`](https://github.com/sungsu8055/psd-jsx-builder/raw/main/psd-jsx-builder.zip)
— that single file *is* the whole skill (the instructions, every reference doc, and the scripts,
bundled together).

> ⚠️ Don't use the green **Code → Download ZIP** button at the top of this repo — that grabs the
> whole repository, which won't install as a skill. Use the download link above.

**2. Turn on code execution:** in Claude, go to **Settings → Capabilities** and switch on
**Code execution and file creation** (skills need this to run).

**3. Upload it:** go to **Customize → Skills**, click **＋ → Create skill → Upload a skill**, and
choose the `psd-jsx-builder.zip` you just downloaded.

**4. Toggle it on** in the skills list. Done — you won't need to do this again.

**What you need:** a **Mac**, **Adobe Photoshop** installed, and the **Claude desktop app** signed in.

## Make your first image

**Always start with the `/psd-jsx-builder` command.** If you just describe an image in plain words,
Claude may build it with a different tool. Typing the command pins the request to this skill.

1. Open a **new chat** and **pick a folder** where your files should be saved.
2. **Type `/psd-jsx-builder`, then your request in plain words.** For example:
   - `/psd-jsx-builder` 1080×1080 Instagram post, "GRAND OPENING" in big letters, dark background
   - `/psd-jsx-builder` 16:9 title slide, title "Quarterly Review", subtitle "Q2 2026"
   - `/psd-jsx-builder` business card 90×54 mm, name "Alex Kim", role "Designer", for print
3. Claude writes the script, drives Photoshop, and shows you a **preview**.
4. **Want changes? Just say so** — *"make the title bigger,"* *"use a blue background,"* *"move
   the logo to the top-right."* Claude rebuilds and shows you again.
5. When it looks right, the layered **`.psd`** (plus a JPG/PNG/PDF) is waiting in your folder.

### Good to know

- **You can be vague.** Not sure about size or settings? Just describe the goal — Claude asks what
  it's for (a slide? Instagram? something to print?) and picks the right size and quality.
- **For print,** say it's for print and the size (e.g. *"A4 poster for printing"*); Claude sets it
  up properly (CMYK, 300 DPI, bleed).
- **Photoshop will open and move on its own** while it builds — that's normal, let it work.
- **First time only:** your Mac may pop up a box asking to let Claude control Photoshop — click
  **OK / Allow**.

## What you can make

You don't work out pixels, DPI, or bleed — Claude picks the right settings for your use case.

| What | Size | Output |
|------|------|--------|
| Presentation slide (16:9) | 1920×1080 px | PNG · PDF deck |
| Instagram — square / portrait | 1080×1080 / 1080×1350 px | JPG |
| Story / Reels / TikTok (9:16) | 1080×1920 px | JPG |
| YouTube thumbnail | 1280×720 px | JPG |
| Web hero / banner | your size (built 2×) | PNG · JPG |
| A4 / A3 poster | mm @ 300 DPI + bleed | print PDF (PDF/X) |
| Business card | 90×54 mm | print PDF |
| US Letter flyer | 8.5 × 11 in | print PDF |

Screen output (slides, social) is the solid path. **Print (CMYK / PDF·X) is experimental.**

## How it works

You ask in plain language → Claude sets the canvas for your use case, writes a small ExtendScript
(`.jsx`), and runs it through Photoshop with `osascript` to produce a layered `.psd`. It then
renders a PNG to check the result, tweaks, and rebuilds until it's right — so every file is
reproducible. Editing an existing PSD (change text or swap an image without losing your manual
edits) is supported too.

---

<sub><b>Maintainers:</b> the installable is <code>psd-jsx-builder.zip</code> — a zip whose
top-level <code>psd-jsx-builder/</code> folder holds <code>SKILL.md</code> + <code>references/</code>
+ <code>scripts/</code> + <code>examples/</code> (no README or <code>.git</code> inside). After
editing those, rebuild that zip and commit it.</sub>

## License

MIT © 2026 Kim Sungsu. Adobe and Photoshop are trademarks of Adobe Inc.; this is an independent
prototype, not affiliated with Adobe or Anthropic.
