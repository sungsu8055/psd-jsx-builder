#!/usr/bin/env python3
"""Export a PSD to a single deliverable image — PNG, JPG, or PDF.

Use after build/verify to produce the file you actually hand off. Pick the format from the
destination (see references/project_setup.md):
  - JPG  — photos / social posts (small file, no transparency)
  - PNG  — flat color, text, logos, or anything needing transparency
  - PDF  — a quick single-page RGB PDF

This path is screen-oriented: it renders with psd-tools/PIL and outputs RGB. For a true PRINT
file that keeps CMYK and the embedded profile, use scripts/export_print_pdf.sh instead.
For a multi-page deck, use psds_to_pdf.py.

Usage:
  python export_psd.py file.psd --format jpg [--out out.jpg] [--width 1080] [--quality 90] [--bg FFFFFF]
"""
import argparse
import os
import sys

try:
    from psd_tools import PSDImage
    from PIL import Image
except ImportError:
    sys.exit("pip install psd-tools pillow")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("psd")
    ap.add_argument("--format", choices=["png", "jpg", "jpeg", "pdf"], default="png")
    ap.add_argument("--out", default=None, help="output path (default: <psd>.<format>)")
    ap.add_argument("--width", type=int, default=0, help="resize to this width in px (0 = full size)")
    ap.add_argument("--quality", type=int, default=92, help="JPG quality 1-100")
    ap.add_argument("--bg", default="FFFFFF", help="hex bg to flatten transparency onto (jpg/pdf)")
    ap.add_argument("--dpi", type=float, default=0, help="DPI metadata to stamp (0 = read from PSD, else 72)")
    args = ap.parse_args()

    if not os.path.exists(args.psd):
        sys.exit(f"not found: {args.psd}")
    fmt = "jpg" if args.format == "jpeg" else args.format

    psd = PSDImage.open(args.psd)
    if str(getattr(psd, "color_mode", "")).upper().endswith("CMYK"):
        print("note: this PSD is CMYK — this script renders it to RGB (screen). For a print-ready "
              "PDF that keeps CMYK + profile, use scripts/export_print_pdf.sh.", file=sys.stderr)
    rendered = psd.composite()
    if rendered is None:
        sys.exit("composite() returned None — no renderable layers in this PSD")
    img = rendered
    if img.mode not in ("RGB", "RGBA", "L", "LA"):
        img = img.convert("RGBA")

    if args.width and args.width != img.size[0]:
        h = round(args.width * img.size[1] / img.size[0])
        img = img.resize((args.width, h), Image.LANCZOS)

    out = args.out or os.path.splitext(args.psd)[0] + "." + fmt
    parent = os.path.dirname(os.path.abspath(out))
    os.makedirs(parent, exist_ok=True)
    dpi = args.dpi or float(getattr(psd, "dpi", 72) or 72)

    if fmt == "png":
        img.save(out, "PNG", dpi=(dpi, dpi))
    else:
        # JPG and PDF can't carry alpha — flatten onto a solid background first.
        bg = tuple(int(args.bg[i:i + 2], 16) for i in (0, 2, 4))
        flat = Image.new("RGB", img.size, bg)
        mask = img.split()[-1] if img.mode in ("RGBA", "LA") else None
        flat.paste(img.convert("RGB") if mask is None else img, mask=mask)
        if fmt == "jpg":
            flat.save(out, "JPEG", quality=args.quality, dpi=(dpi, dpi))
        else:  # pdf
            flat.save(out, "PDF", resolution=dpi)

    size_kb = round(os.path.getsize(out) / 1024, 1)
    print(f"exported {fmt.upper()}: {out}  ({img.size[0]}x{img.size[1]}, {size_kb} KB, {dpi:g} dpi)")


if __name__ == "__main__":
    main()
