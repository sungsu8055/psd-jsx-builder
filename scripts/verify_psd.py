#!/usr/bin/env python3
"""Render a PSD to PNG and print every layer's bounds, for verifying a scripted build.

Note: psd-tools `.composite()` does NOT reflect a layer's manual translate/transform.
If a human moved a layer in Photoshop, it renders here in its ORIGINAL position. To read
a hand-moved layer's true position, query layer.bounds via ExtendScript instead.

Usage:
  python verify_psd.py /abs/path/to/file.psd [--out out.png] [--width 2560]
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
    ap.add_argument("--out", default=None, help="PNG output path (default: <psd>_render.png)")
    ap.add_argument("--width", type=int, default=0, help="resize render to this width (0 = full)")
    args = ap.parse_args()

    if not os.path.exists(args.psd):
        sys.exit(f"not found: {args.psd}")

    psd = PSDImage.open(args.psd)
    print(f"document: {psd.size[0]}x{psd.size[1]}")
    layers = list(psd.descendants())
    print(f"layers ({len(layers)}) (name | bbox left,top,right,bottom):")
    for layer in layers:
        b = layer.bbox
        kind = getattr(layer, "kind", "")
        print(f"  [{kind:>5}] {layer.name}  |  {b}")

    rendered = psd.composite()
    if rendered is None:
        sys.exit("composite() returned None — no renderable layers in this PSD")
    img = rendered.convert("RGB")
    if args.width and args.width != img.size[0]:
        h = round(args.width * img.size[1] / img.size[0])
        img = img.resize((args.width, h), Image.LANCZOS)

    out = args.out or os.path.splitext(args.psd)[0] + "_render.png"
    img.save(out)
    print(f"\nrender saved: {out}  ({img.size[0]}x{img.size[1]})")


if __name__ == "__main__":
    main()
