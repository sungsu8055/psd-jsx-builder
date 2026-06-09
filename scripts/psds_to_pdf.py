#!/usr/bin/env python3
"""Combine multiple PSDs into one multi-page PDF (render order is explicit).

Render order matters and filename sort may not equal the intended order, so pass an
ordered list file (one PSD path per line) OR a directory (sorted by filename).

Usage:
  python psds_to_pdf.py --list order.txt --out deck.pdf [--width 2560] [--dpi 200]
  python psds_to_pdf.py --dir ./psd_folder --out deck.pdf
"""
import argparse
import os
import sys

try:
    from psd_tools import PSDImage
    from PIL import Image
except ImportError:
    sys.exit("pip install psd-tools pillow")


def collect(args):
    if args.list:
        with open(args.list, encoding="utf-8") as f:
            # strip first, THEN drop blanks and comments — so indented "# ..." lines are skipped too
            paths = []
            for ln in f:
                ln = ln.strip()
                if ln and not ln.startswith("#"):
                    paths.append(ln)
    else:
        paths = sorted(
            os.path.join(args.dir, n) for n in os.listdir(args.dir) if n.lower().endswith(".psd")
        )
    return paths


def main():
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--list", help="text file: one PSD path per line, in page order")
    g.add_argument("--dir", help="directory of PSDs (sorted by filename)")
    ap.add_argument("--out", required=True)
    ap.add_argument("--width", type=int, default=2560)
    ap.add_argument("--dpi", type=float, default=200.0)
    args = ap.parse_args()

    paths = collect(args)
    if not paths:
        sys.exit("no PSDs found")

    pages = []
    for i, p in enumerate(paths, 1):
        if not os.path.exists(p):
            print(f"  MISSING (skipped): {p}")
            continue
        psd = PSDImage.open(p)
        rendered = psd.composite()
        if rendered is None:
            print(f"  SKIP (no renderable layers): {p}")
            continue
        img = rendered.convert("RGB")
        if args.width and args.width != img.size[0]:
            h = round(args.width * img.size[1] / img.size[0])
            img = img.resize((args.width, h), Image.LANCZOS)
        pages.append(img)
        print(f"  {i:>3} {os.path.basename(p)} -> {img.size}")

    if not pages:
        sys.exit("no pages rendered")

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    pages[0].save(args.out, save_all=True, append_images=pages[1:], resolution=args.dpi)
    size_mb = round(os.path.getsize(args.out) / 1e6, 2)
    print(f"\nsaved {len(pages)}p PDF: {args.out}  ({size_mb} MB)")


if __name__ == "__main__":
    main()
