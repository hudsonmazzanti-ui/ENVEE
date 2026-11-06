"""Makes a furniture sticker (a transparent cut-out) for every product in the catalog cache.

Uses rembg (MIT) with the ISNet general-use model, all on this machine: no paid APIs, no Canopy requests.
Only each product's main photo is used. Rugs are skipped for now (see SKIP_CATEGORIES).
Stickers that failed review are listed in data/catalog/sticker-rejects.json and never remade (the app
shows those products' photos instead); --only remakes one anyway. Work already done is skipped:
  .cache/images/<asin>.jpg     the downloaded main photo (not committed)
  assets/stickers/<asin>.webp  the sticker (committed)

Run with `npm run stickers`, which also regenerates src/theme/assets.ts.
  --force      remake every sticker
  --only ASIN  make one sticker (repeatable)
  --per-category N  only the N best sellers of each category
"""
import io
import json
import sys
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
CATALOG = ROOT / "data/catalog/amazon-bestsellers.json"
IMAGES = ROOT / ".cache/images"
STICKERS = ROOT / "assets/stickers"
MAX_SIDE = 640  # px; stickers are shown at phone size, and they're committed, so keep them small.
REJECTS = ROOT / "data/catalog/sticker-rejects.json"
# Rugs are cut from the app for now: their main photos are room scenes, and the cut-outs grab the furniture, not the rug.
SKIP_CATEGORIES = {"rugs"}


def products(per_category=None):
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    for key, cat in catalog["categories"].items():
        if key not in SKIP_CATEGORIES:
            yield from cat["products"][:per_category]


def main_photo(p):
    path = IMAGES / f"{p['asin']}.jpg"
    if not path.exists():
        req = urllib.request.Request(p["imageUrl"], headers={"User-Agent": "Mozilla/5.0 (ENVEE sticker maker)"})
        with urllib.request.urlopen(req, timeout=30) as r:
            path.write_bytes(r.read())
    return Image.open(path).convert("RGB")


def drop_specks(cut):
    """Clear disconnected bits under 2% of the cut-out's area (stray fringe, dust from the old background)."""
    a = np.array(cut.getchannel("A"))
    labels, n = ndimage.label(a > 24)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(a), labels, range(1, n + 1))
        small = [i + 1 for i, s in enumerate(sizes) if s < 0.02 * sizes.sum()]
        a[np.isin(labels, small)] = 0
        cut.putalpha(Image.fromarray(a))
    return cut


_sessions = {}


def session(name):
    if name not in _sessions:
        _sessions[name] = new_session(name)
    return _sessions[name]


def cut_out(photo, category):
    return remove(photo, session=session("isnet-general-use"), post_process_mask=True)


def make_sticker(photo, category):
    cut = drop_specks(cut_out(photo, category))
    alpha = cut.getchannel("A")
    # Ignore near-transparent fringe when trimming, so the box hugs the piece.
    box = alpha.point(lambda a: 255 if a > 24 else 0).getbbox()
    if not box:
        return None
    cut = cut.crop(box)
    cut.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    return cut


def main():
    args = sys.argv[1:]
    force = "--force" in args
    only = {args[i + 1] for i, a in enumerate(args) if a == "--only" and i + 1 < len(args)}
    per_category = int(args[args.index("--per-category") + 1]) if "--per-category" in args else None
    rejects = json.loads(REJECTS.read_text(encoding="utf-8")) if REJECTS.exists() else {}
    IMAGES.mkdir(parents=True, exist_ok=True)
    STICKERS.mkdir(parents=True, exist_ok=True)

    todo, seen = [], set()
    for p in products(per_category):
        if p["asin"] in seen or (only and p["asin"] not in only) or (p["asin"] in rejects and not only):
            continue
        seen.add(p["asin"])
        if force or not (STICKERS / f"{p['asin']}.webp").exists():
            todo.append(p)
    print(f"{len(seen)} products, {len(todo)} stickers to make")
    if not todo:
        return

    failed = []
    for i, p in enumerate(todo, 1):
        try:
            sticker = make_sticker(main_photo(p), p["category"])
            if sticker is None:
                raise ValueError("nothing left after background removal")
            buf = io.BytesIO()
            sticker.save(buf, "WEBP", quality=86, method=6)
            (STICKERS / f"{p['asin']}.webp").write_bytes(buf.getvalue())
            print(f"  [{i}/{len(todo)}] {p['asin']} {sticker.size[0]}x{sticker.size[1]} {len(buf.getvalue()) // 1024} KB")
        except Exception as e:  # keep going; one bad photo shouldn't stop the batch
            failed.append(p["asin"])
            print(f"  [{i}/{len(todo)}] {p['asin']} FAILED: {e}")
    if failed:
        print(f"{len(failed)} failed: {' '.join(failed)}. These products fall back to their photo in the app.")


if __name__ == "__main__":
    main()
