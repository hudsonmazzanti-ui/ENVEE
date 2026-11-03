"""Builds the Discover "look" images: an illustrated room with furniture placed on it.
Real Paula Deen Home pieces come from assets/catalog, illustrated decor from assets/art (s-*.png).
   python3 scripts/compose-looks.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ART, CAT = ROOT / 'assets/art', ROOT / 'assets/catalog'

def piece(name):
    p = CAT / f'pd-{name}.webp'
    return Image.open(p if p.exists() else ART / f's-{name}.png').convert('RGBA')

# look: (room, [(piece, centre x, centre y, size) in the 900 x 1200 room])
LOOKS = {
    'look-emerald': ('room-living', [('rug', 450, 1010, 640), ('mallory-sofa', 450, 840, 620), ('floorlamp', 760, 640, 420),
                                     ('coffeetable', 450, 1010, 300), ('plant', 140, 800, 300), ('artprint', 450, 470, 200)]),
    'look-warm': ('room-bedroom', [('bed', 450, 840, 640), ('pendant', 450, 220, 230), ('sidetable', 110, 900, 170),
                                   ('tablelamp', 110, 760, 170), ('plant', 800, 860, 260)]),
    'look-gallery': ('room-studio', [('rug', 450, 1020, 600), ('hazel-chair', 310, 880, 330), ('sidetable', 540, 950, 150),
                                     ('mirror', 730, 700, 330), ('bookshelf', 150, 640, 380), ('pendant', 480, 210, 200)]),
    'look-first': ('room-listing', [('dresser', 450, 780, 420), ('artprint', 450, 430, 200), ('tablelamp', 360, 560, 140),
                                    ('bridget-swivel-chair', 740, 910, 300), ('plant', 150, 860, 280)]),
    'look-savannah': ('room-listing', [('rug', 450, 1020, 640), ('blair-sofa', 450, 845, 640), ('lowell-ottoman-green', 450, 1035, 340),
                                       ('della-chair-rosella', 790, 905, 300), ('floorlamp', 120, 700, 380), ('artprint', 450, 470, 200)]),
}

for name, (room, items) in LOOKS.items():
    base = Image.open(ART / f'{room}.jpg').convert('RGBA')
    for n, cx, cy, size in items:
        im = piece(n).resize((size, size), Image.LANCZOS)
        base.alpha_composite(im, (cx - size // 2, cy - size // 2))
    base.convert('RGB').save(ART / f'{name}.jpg', quality=84)
    print(name)
