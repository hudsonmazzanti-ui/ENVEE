# Writes hairline/items/amazon-more.js from the spec table below: one line per cached Amazon product without a
# sticker, keyed by its index in the to-draw list (the cache, in order, minus the stickered ones). Shapes and
# proportions were read off each product's main photo; dims are in inches. N = from the title, E = estimate.
#   python3 scripts/items/gen-amazon-more.py
import json, os, sys
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
cache = json.load(open(os.path.join(root, 'data/catalog/amazon-bestsellers.json')))
done = {f[:-5] for f in os.listdir(os.path.join(root, 'assets/stickers'))}
todo = [p['asin'] for c in cache['categories'].values() for p in (c['products'] if isinstance(c, dict) else c) if p['asin'] not in done]

SKIP = {5: 'a cushion support board, not furniture'}

def sofa(w, d, h, **k):
    k = {'w': w, 'd': d, 'h': h, **k}
    return (w, d, h), f"B.sofa(add, {json.dumps(k)})"
def call(fn, dims, **k):
    return dims, f"B.{fn}(add, {json.dumps(k)})"
def futon(w, h=27, armW=9, bc=2, **k): return sofa(w, 34, h, armW=armW, armH=h - 5, seats=1, backCushions=bc, **k)
def L(w, d, side, cw=32, depth=36, h=28, **k): return sofa(w, d, h, depth=depth, chaise={'side': side, 'w': cw}, armW=k.pop('armW', 9), armH=h - 5, seats=k.pop('seats', 2), backCushions=k.pop('bc', 3), **k)
def chair(fn, w, d, h, **k): return call(fn, (w, d, h), w=w, d=d, h=h, **k)
def rec(w, d, h, **k): return chair('recliner', w, d, h, **k)
def tub(w, d, h, **k): return chair('tub', w, d, h, **k)
def lamp(fn, dims, **k): return call(fn, dims, **k)
def rug(wf, df, motif='border', unit='ft', **k):
    w, d = (wf * 12, df * 12) if unit == 'ft' else (wf, df)
    w, d = max(w, d), min(w, d)
    return call('rug', (w, d, 1.2 if k.get('shag') else 0.5), w=w, d=d, motif=motif, **k)
def case(w, d, h, **k): return call('caseTable', (w, d, h), w=w, d=d, h=h, **k)
def tier(w, d, h, **k): return call('twoTier', (w, d, h), w=w, d=d, h=h, **k)
def drumT(w, h, **k): return call('drumTable', (w, w, h), w=w, h=h, **k)

S = {
  # sofas: boneless futons, sectionals, loveseats, fold-out chairs and mattresses
  0: ('N', futon(78)), 1: ('N', futon(76, armW=10, bc=3)), 2: ('E', futon(56)), 3: ('N', L(108, 62, 'left', h=26, armW=8, bc=4)),
  4: ('E', sofa(66, 31, 30, legs=6, armW=5, armH=20, seats=2, backCushions=2, r=2)), 6: ('E', futon(74, armW=10)),
  7: ('N', futon(79, bc=3)), 8: ('E', futon(76, h=26, armW=10)), 9: ('N', futon(79, armW=7, bc=3)), 10: ('E', L(96, 62, 'left', cw=30)),
  11: ('E', chair('floorChair', 30, 30, 30, layers=3, layerH=6, backT=8)), 12: ('E', call('mattress', (60, 25, 18), w=60, d=25, layers=3, layerH=6)),
  13: ('N', L(95, 62, 'left', cw=30, h=27)), 14: ('N', L(111, 66, 'right', cw=34, depth=38, h=30, arms='left', legs=2)),
  15: ('N', futon(78, h=26, armW=8)), 16: ('E', futon(58, h=28, bc=1)), 17: ('N', sofa(130, 66, 28, depth=36, chaise={'side': 'both', 'w': 34}, armW=8, armH=23, seats=2, backCushions=4)),
  18: ('N', futon(77, bc=3)), 19: ('N', L(108, 64, 'right', h=27)), 20: ('N', futon(55, h=28)), 21: ('N', L(112, 64, 'right', arms='left', legs=2)),
  22: ('E', call('mattress', (39, 25, 18), w=39, d=25, layers=3, layerH=6)), 23: ('N', sofa(59, 36, 30, armW=11, armH=24, seats=1, backCushions=2)),
  24: ('N', L(94, 60, 'right', cw=30)), 25: ('N', L(110, 64, 'right', cw=34, depth=38)), 26: ('N', L(109, 66, 'left', cw=34, depth=38)),
  27: ('E', L(120, 70, 'right', cw=34, depth=40, h=30)), 28: ('E', call('mattress', (39, 25, 18), w=39, d=25, layers=3, layerH=6)),
  29: ('N', sofa(65, 32, 33, legs=6, armW=6, armH=23, seats=2, backCushions=2, r=3)),
  30: ('N', chair('floorChair', 54, 30, 26, layers=2, layerH=7, backT=8, bolster=True)), 31: ('N', sofa(55, 34, 32, armW=6, armH=24, seats=1, backCushions=2)),
  32: ('N', futon(79, bc=3)), 33: ('N', L(115, 66, 'right', cw=34, depth=38)), 34: ('E', chair('floorChair', 30, 32, 30, layers=2, layerH=8, backT=9)),
  35: ('N', futon(79, bc=3)), 36: ('E', futon(80, armW=10)), 37: ('N', L(108, 64, 'right')),
  38: ('N', sofa(108, 64, 28, depth=38, chaise={'side': 'both', 'w': 30}, armW=8, armH=23, seats=1, backCushions=3)), 39: ('E', futon(58, h=28, armW=10)),
  40: ('E', chair('floorChair', 30, 32, 28, layers=2, layerH=8, backT=9, bolster=True)),
  41: ('N', sofa(112, 62, 30, depth=36, chaise={'side': 'both', 'w': 30}, legs=3, armW=7, armH=24, seats=2, backCushions=4)),
  42: ('N', sofa(68, 34, 33, legs=5, armW=6, armH=24, seats=2, backCushions=2, r=3)), 43: ('E', L(100, 60, 'right', cw=30, depth=34, legs=3)),
  # accent chairs
  44: ('E', chair('floorSeat', 21, 34, 22)), 45: ('E', rec(34, 36, 41, base='swivel')), 46: ('E', rec(26, 32, 39, base='legs', armW=5, armH=24, tiers=2)),
  47: ('E', rec(30, 34, 40, base='swivel')), 48: ('E', rec(26, 32, 40, base='legs', armW=5, armH=24, tiers=2)),
  49: ('E', sofa(30, 31, 34, legs=5, armW=5, armH=25, seats=1, backCushions=1, r=3)), 50: ('E', rec(34, 37, 41, base='rocker')),
  51: ('E', (30, 50, 36), "B.lounge(add, {w: 30, d: 30, h: 36, seatZ: 16, lean: 0.4, armH: 24, armW: 6}); B.ottoman(add, 5, 34, 20, 16, 15, 'x')"),
  52: ('E', chair('woodArm', 26, 29, 31)), 53: ('E', tub(20, 20, 30, base='drum', armW=0, seatZ=18)),
  54: ('E', rec(26, 32, 40, base='legs', armW=5, armH=24, tiers=2)), 55: ('E', rec(31, 34, 40, base='swivel')),
  56: ('E', chair('saucer', 30, 28, 32)), 57: ('E', chair('woodArm', 26, 30, 32)), 58: ('E', sofa(30, 30, 33, legs=5, armW=5, armH=24, seats=1, backCushions=1, r=3)),
  59: ('E', rec(34, 38, 42)), 60: ('E', rec(33, 36, 40, base='swivel', tiers=2)), 61: ('E', rec(36, 39, 43)), 62: ('E', tub(28, 30, 33, armW=6)),
  63: ('E', (30, 48, 32), "B.saucer(add, {w: 30, d: 28, h: 32}); B.ottoman(add, 6, 32, 18, 16, 14, 'x')"), 64: ('E', rec(30, 34, 40, base='swivel', tiers=2)),
  65: ('E', rec(35, 38, 42)), 66: ('E', rec(36, 38, 40, armW=8, tiers=2)), 67: ('E', rec(34, 37, 41)), 68: ('E', rec(34, 38, 42)),
  69: ('E', rec(26, 32, 40, base='legs', armW=5, armH=24, tiers=2)), 70: ('E', chair('woodArm', 25, 29, 31)),
  71: ('E', tub(29, 28, 30, base='swivel', armW=6)), 72: ('N', tub(25.5, 25, 30, armW=5)), 73: ('E', tub(22, 21, 33, base='metal', armW=4, seatZ=19)),
  74: ('E', rec(33, 36, 41, base='swivel')), 75: ('E', tub(22, 21, 31, base='metal', armW=4, seatZ=18)), 76: ('E', rec(30, 34, 40, base='swivel')),
  77: ('E', chair('floorSeat', 20, 30, 20)), 78: ('E', tub(27, 26, 30, armW=6)), 79: ('E', chair('swivelChair', 21, 21, 32, seatZ=19, arms=False)),
  80: ('E', chair('saucer', 32, 30, 32)), 81: ('E', sofa(30, 31, 34, legs=5, armW=5, armH=25, seats=1, backCushions=1, r=3)),
  82: ('E', rec(26, 32, 40, base='legs', armW=5, armH=24, tiers=2)), 83: ('E', tub(25, 25, 29, armW=5)), 84: ('E', tub(25, 25, 29, armW=5)),
  # floor lamps (the footprint is the base)
  85: ('E', lamp('barLamp', (9, 9, 56), h=56, cx=4.5, cy=4.5)), 86: ('N', lamp('stickLamp', (11, 11, 64.6), h=64.6, baseR=5, shadeR=4, shadeH=14, square=True, cx=5.5, cy=5.5)),
  87: ('N', lamp('hookLamp', (27, 12, 60), h=60, reach=14, baseR=5, shadeR=6.5, shadeH=8, drop=10, cx=6, cy=6)),
  88: ('N', lamp('stickLamp', (10, 10, 64.4), h=64.4, baseR=5, shadeR=4, shadeH=13, cx=5, cy=5)),
  89: ('E', lamp('hookLamp', (22, 12, 62), h=62, reach=12, baseR=5, shadeR=4, shadeH=9, drop=9, cx=6, cy=6)),
  90: ('E', lamp('shelfLamp', (11, 11, 63), h=63)), 91: ('E', lamp('barLamp', (9, 9, 56), h=56, cx=4.5, cy=4.5)),
  92: ('N', lamp('stickLamp', (10, 10, 64), h=64, baseR=5, shadeR=4, shadeH=13, cx=5, cy=5)),
  93: ('E', lamp('torchiere', (20, 20, 70), h=70, baseR=5.5, bowlR=10, bowlH=2.5, cx=10, cy=10)), 94: ('E', lamp('shelfLamp', (11, 11, 63), h=63)),
  95: ('E', lamp('shelfLamp', (11, 11, 63), h=63)), 96: ('E', lamp('stickLamp', (11, 11, 60), h=60, baseR=5, shadeR=5, shadeH=12, cx=5.5, cy=5.5)),
  97: ('E', lamp('gooseLamp', (24, 11, 62), h=62, reach=8, head=12, disc=True)), 98: ('E', lamp('torchiere', (20, 20, 70), h=70, baseR=5.5, bowlR=10, bowlH=2.5, cx=10, cy=10)),
  99: ('N', lamp('stickLamp', (11, 11, 61), h=61, baseR=5.5, shadeR=5, shadeH=58, taper=0.6, cx=5.5, cy=5.5)),
  100: ('E', lamp('hookLamp', (24, 12, 63), h=63, reach=12, baseR=5.5, shadeR=6, shadeH=7, drop=9, cx=6, cy=6)),
  101: ('E', lamp('hookLamp', (24, 12, 63), h=63, reach=12, baseR=5.5, shadeR=6, shadeH=7, drop=9, cx=6, cy=6)),
  102: ('E', lamp('barLamp', (12, 12, 60), h=60, tripod=True, baseR=6, cx=6, cy=6)),
  103: ('E', lamp('stickLamp', (12, 12, 64), h=64, baseR=5.5, shadeR=6, shadeH=10, cx=6, cy=6)),
  104: ('E', lamp('hookLamp', (20, 12, 64), h=64, reach=9, baseR=5.5, shadeR=4, shadeH=9, drop=8, cx=6, cy=6)),
  105: ('E', lamp('gooseLamp', (26, 11, 60), h=60, reach=10, head=12)),
  106: ('N', lamp('hookLamp', (40, 14, 75), h=75, reach=26, baseR=7, shadeR=7, shadeH=9, drop=16, cx=7, cy=7)),
  107: ('E', lamp('gooseLamp', (26, 11, 62), h=62, reach=10, head=13)), 108: ('E', lamp('stickLamp', (12, 12, 62), h=62, baseR=5.5, shadeR=6, shadeH=11, cx=6, cy=6)),
  109: ('E', lamp('hookLamp', (26, 12, 64), h=64, reach=14, baseR=5.5, shadeR=6, shadeH=7, drop=9, cx=6, cy=6)),
  110: ('E', lamp('treeLamp', (20, 16, 64), h=64, cx=8, cy=8, shades=[[-5, 0, 44], [5, 0, 52], [-4, 0, 60]])),
  111: ('E', lamp('gooseLamp', (26, 11, 62), h=62, reach=10, head=12)), 112: ('E', lamp('stickLamp', (16, 16, 58), h=58, baseR=5, shadeR=8, shadeH=10, taper=1.5, cx=8, cy=8)),
  113: ('E', lamp('gooseLamp', (30, 11, 66), h=66, reach=14, head=14)), 114: ('E', lamp('barLamp', (9, 9, 56), h=56, cx=4.5, cy=4.5)),
  115: ('E', lamp('lampTable', (22, 14, 62), w=18, d=14, h=24, lampH=62)),
  116: ('E', lamp('hookLamp', (28, 14, 64), h=64, reach=15, baseR=6, shadeR=7, shadeH=8, drop=10, cx=7, cy=7)),
  117: ('N', lamp('torchiere', (14, 14, 72), h=72, baseR=5.5, bowlR=7, bowlH=4, cx=7, cy=7)),
  118: ('N', lamp('treeLamp', (18, 16, 70.9), h=70.9, cx=8, cy=8, shades=[[-4, 0, 54], [4, 0, 62], [0, -4, 70]], shelves=[14, 30])),
  119: ('N', lamp('stickLamp', (11, 11, 64.2), h=64.2, baseR=5, shadeR=4, shadeH=13, square=True, cx=5.5, cy=5.5)),
  120: ('E', lamp('stickLamp', (6, 6, 14), h=14, baseR=2.5, shadeR=2.2, shadeH=2.5, cx=3, cy=3)),
  121: ('E', lamp('barLamp', (8, 8, 58), h=58, baseR=3.5, bar=1.6, cx=4, cy=4)), 122: ('E', lamp('gooseLamp', (24, 11, 60), h=60, reach=9, head=12)),
  123: ('E', lamp('hookLamp', (28, 14, 64), h=64, reach=15, baseR=6, shadeR=7, shadeH=8, drop=10, cx=7, cy=7)),
  124: ('E', lamp('gooseLamp', (22, 11, 60), h=60, reach=8, head=5, disc=True)), 125: ('E', lamp('shelfLamp', (11, 11, 63), h=63)),
  126: ('N', lamp('torchiere', (14, 14, 69), h=69, baseR=5.5, bowlR=7, bowlH=2.5, cx=7, cy=7)),
  127: ('E', lamp('hookLamp', (18, 10, 62), h=62, reach=8, baseR=4.5, shadeR=2.8, shadeH=8, drop=7, cx=5, cy=5)),
  128: ('E', lamp('torchiere', (20, 20, 70), h=70, baseR=5.5, bowlR=10, bowlH=2.5, cx=10, cy=10)),
  129: ('E', lamp('torchiere', (14, 14, 58), h=58, baseR=5, bowlR=7, bowlH=4, cx=7, cy=7)),
  # rugs, long side along x
  130: ('N', rug(5, 7, 'medallion')), 131: ('N', rug(2, 6, 'medallion')), 132: ('N', rug(5, 7, 'plain')), 133: ('N', rug(5, 7, 'plain')),
  134: ('N', rug(8, 10)), 135: ('N', rug(4, 6, 'plain', shag=True)), 136: ('N', rug(5, 7, 'medallion')), 137: ('N', rug(2, 8)),
  138: ('N', rug(8, 10)), 139: ('N', rug(5, 7)), 140: ('N', rug(8, 10, 'plain')), 141: ('N', rug(5, 7, 'medallion')), 142: ('E', rug(2, 3)),
  143: ('N', rug(5, 7, 'plain')), 144: ('E', rug(5, 7)), 145: ('N', rug(3, 5, 'plaid')), 146: ('N', rug(5, 7, 'plain')), 147: ('N', rug(8, 10)),
  148: ('N', rug(2, 4, 'plain', shag=True)), 149: ('N', rug(2, 3)), 150: ('N', rug(2, 3, 'plain')), 151: ('N', rug(8, 10)),
  152: ('N', rug(4, 4, 'plain', shape='round', shag=True)), 153: ('N', rug(8, 10, 'plain')), 154: ('N', rug(2, 3)), 155: ('N', rug(5, 7, 'plain')),
  156: ('N', rug(2, 3, 'plain')), 157: ('N', rug(8, 10, 'medallion')), 158: ('N', rug(8, 10)), 159: ('N', rug(8, 10, 'plain')), 160: ('N', rug(5, 7)),
  161: ('N', rug(8, 10, 'plain')), 162: ('N', rug(28, 43, 'plaid', unit='in')), 163: ('E', rug(4, 6, 'plain', shag=True)), 164: ('N', rug(8, 10, 'plain')),
  165: ('N', rug(4, 6, 'plain', shag=True)), 166: ('N', rug(3, 5)), 167: ('N', rug(4, 6, 'plain', shag=True)), 168: ('N', rug(8, 10, 'plain', shag=True)),
  169: ('N', rug(5, 7, shape='scallop')), 170: ('N', rug(27.5, 43, 'plaid', unit='in')), 171: ('N', rug(8, 10, 'plain')), 172: ('N', rug(24, 35.5, 'plain', unit='in')),
  173: ('N', rug(5, 7, 'plain')), 174: ('N', rug(20, 31.5, 'plain', unit='in')), 175: ('N', rug(8, 10, 'plain')), 176: ('N', rug(4, 6)),
  177: ('N', rug(8, 10, 'plain', shag=True)), 178: ('N', rug(8, 10, 'plain', shag=True)), 179: ('N', rug(2, 6, shape='scallop')),
  # coffee tables (lift tops drawn closed)
  180: ('N', tier(23.6, 15.7, 15.7, shape='oval', shelf=False, inset=4)), 181: ('N', case(38.6, 19.3, 19, legs='none', shelf=True)),
  182: ('N', tier(43.3, 20, 18, shape='oval', legs='block', shelfZ=4, inset=5)), 183: ('N', drumT(31.5, 17.7, legH=0)),
  184: ('N', call('glassTable', (42.5, 28.5, 16.1), w=42.5, d=28.5, h=16.1)), 185: ('E', case(31.5, 31.5, 18, legs='none', door='barn')),
  186: ('N', tier(23.6, 23.6, 17.7, shape='round', legs='xbase', shelf=False)), 187: ('N', drumT(30, 18, legH=5)),
  188: ('N', drumT(31.5, 17.7, legH=2)), 189: ('E', tier(40, 20, 18, legs='frame', inset=4)), 190: ('N', tier(31.5, 31.5, 17.7, shape='round', legs='xbase', shelf=False)),
  191: ('E', case(39, 20, 18, legH=5, cubby='left')), 192: ('N', drumT(31.5, 17.7, legH=1.5)), 193: ('N', drumT(31.5, 17.7, legH=0)),
  194: ('E', tier(31.5, 31.5, 17.7, shape='round', legs='frame', shelfZ=2)), 195: ('E', tier(40, 20, 18, legs='block', inset=2.5)),
  196: ('N', tier(36, 36, 18, shape='round', legs='frame', shelfZ=3)), 197: ('E', tier(36, 24, 17, shape='oval', shelf=False)),
  198: ('E', case(40, 20, 19, legs='none', shelf=True)),
  199: ('E', (40, 31.5, 18), "B.drumTable(add, {w: 20, h: 15, legH: 0, ox: 20, oy: 0}); B.drumTable(add, {w: 31.5, h: 18, legH: 0, ox: 0, oy: 0})"),
  200: ('N', tier(40, 20, 18, legs='block', inset=2.5)), 201: ('E', drumT(31.5, 18, legH=5)), 202: ('N', case(39.4, 19.7, 19, legH=3, door='barn')),
  203: ('E', drumT(31.5, 16, pedestal=True)), 204: ('N', case(35.6, 35.6, 18, legs='none', door='barn')), 205: ('E', call('panelTable', (31.5, 19.7, 17.7), w=31.5, d=19.7, h=17.7, panel=2)),
  206: ('N', case(39.4, 19.7, 19, legs='none', shelf=True)), 207: ('E', case(40, 20, 19, legs='none', cubby='right')),
  208: ('E', tier(35.5, 19.5, 16, shape='oval', legs='block', inset=4)), 209: ('N', case(35.5, 35.5, 14, legs='none', top=2.5)),
  210: ('N', case(41.7, 20, 18, legs='none')), 211: ('E', tier(31.5, 31.5, 17.7, shape='round', shelfZ=3)), 212: ('N', drumT(31.5, 17.7, legH=0)),
  213: ('E', tier(35.4, 35.4, 18, shape='round', legs='xbase', shelfZ=5)), 214: ('N', tier(47, 23.6, 18, legs='frame', inset=3)),
  215: ('E', case(39, 20, 19, legH=6, cubby='left')), 216: ('E', tier(40, 20, 18, legs='frame', inset=2)),
  217: ('E', call('frameTable', (32, 32, 16), w=32, d=32, h=16)), 218: ('E', call('glassTable', (40, 26, 16), w=40, d=26, h=16)),
  219: ('N', case(31.5, 31.5, 18, legs='none', door='barn')),
}

missing = [i for i in range(len(todo)) if i not in S and i not in SKIP]
if missing: sys.exit(f'no spec for {missing}')
out = ["// AUTO-GENERATED by scripts/items/gen-amazon-more.py: the cached Amazon products without a sticker, drawn from their photos.",
       "// Do not edit by hand; change the spec table there and run it again.",
       "(() => {", "  const { B } = window.ENVEE_KIT;", "  const L = [];"]
for i, asin in enumerate(todo):
    if i in SKIP: out.append(f"  // {asin}: skipped, {SKIP[i]}"); continue
    # an entry is (source, (dims, body)) from a helper, or (source, dims, body) written out
    src, spec = S[i][0], S[i][1:]
    (w, d, h), body = spec if len(spec) == 2 else spec[0]
    foot = ''
    if 'Lamp' in body or 'torchiere' in body:
        # lamps stand on their base: a circle of the base radius round the base centre
        k = json.loads(body[body.index('{'):body.rindex('}') + 1]) if body.count('{') == 1 else {}
        cx, cy, r = k.get('cx', 7), k.get('cy', 7), k.get('baseR', 5)
        if 'shelfLamp' in body: cx = cy = r = 5.5
        if 'lampTable' in body: cx, cy, r = 9, 7, 7
        foot = f", foot: {{ x0: {cx - r}, y0: {cy - r}, x1: {cx + r}, y1: {cy + r}, shape: '{'rect' if ('shelfLamp' in body or 'lampTable' in body) else 'ellipse'}' }}"
    elif "shape\": \"round\"" in body or 'drumTable' in body and 'ox' not in body:
        foot = f", foot: {{ x0: 0, y0: 0, x1: {w}, y1: {d}, shape: 'ellipse' }}"
    out.append(f"  L.push({{ id: '{asin}', productId: '{asin}', dims: {{ w: {w}, d: {d}, h: {h} }}, dimsFrom: '{'name' if src == 'N' else 'estimate'}'{foot}, draw: (add) => {{ {body}; }} }});")
out += ["  window.ENVEE_ITEMS = (window.ENVEE_ITEMS || []).concat(L);", "})();", ""]
open(os.path.join(root, 'hairline/items/amazon-more.js'), 'w').write('\n'.join(out))
print(f'wrote {len(todo) - len(SKIP)} items, skipped {len(SKIP)}')
