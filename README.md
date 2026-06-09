# psd-jsx-builder

Make Photoshop `.psd` files by **chatting with Claude in Cowork**. You say what you want, Claude
writes a small Photoshop script, runs it, and renders the result so you can see it — no manual
clicking.

> **Status: early prototype (R&D).** This is not a finished product. Right now it does one thing:
> build PSDs in Photoshop through Claude Cowork via chat. It'll grow from here.

## What works today

You ask for something in chat (e.g. *"a 16:9 title slide that says Hello"*). Behind the scenes:

1. Claude writes a `.jsx` (Photoshop ExtendScript) describing the document.
2. It runs through Photoshop from the terminal via `osascript … do javascript` — no dialogs.
3. Photoshop saves a layered `.psd`.
4. It renders a PNG so you (and Claude) can check the result, then tweak and rebuild.

Screen output (slides, social posts) is the solid path. Print (CMYK / PDF/X) is experimental.

## Requirements

- macOS + Adobe Photoshop (tested on 2026)
- Python 3 with `psd-tools` and `Pillow` — `pip install psd-tools pillow`
- For the chat workflow: Claude Cowork

## Usage

**In Claude Cowork (the main way)** — install this as a skill, then just ask, e.g.
*"build a 1080×1080 Instagram post that says 20% OFF this weekend."* Claude handles the script,
the build, and the preview, and you refine it in conversation.

**Standalone (the scripts underneath)** — they're plain bash/Python, no Claude needed:

```bash
pip install psd-tools pillow
./scripts/build_psd.sh examples/hello_slide.jsx          # builds a sample slide to your Desktop
python scripts/verify_psd.py ~/Desktop/hello_slide.psd   # render + layer bounds
```

- `references/` — the template, a beginner setup guide, and the ExtendScript helper/footgun notes
- `scripts/` — build, verify, and export tools
- `examples/` — runnable `.jsx` samples

## License

MIT © 2026 Kim Sungsu. Adobe and Photoshop are trademarks of Adobe Inc.; this is an independent
prototype, not affiliated with Adobe or Anthropic.
