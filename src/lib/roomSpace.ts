import { ITEM_PX_PER_INCH, itemForProduct, type ItemAsset } from '@/data/itemManifest';
import { roomGeometry, type RoomGeometry } from '@/theme/roomGeometry';

/**
 * Floor space: where a placed piece stands, in inches on the room's floor, and where that lands on screen.
 * Every line-art room and every furniture asset share one camera (docs/hairline-assets.md), so a piece only needs
 * its floor point and its real size. A photo of the user's own room has no camera of its own yet; it borrows the
 * living room's, so pieces still stand in true proportion to each other.
 */
const FALLBACK = 'room_living';

/** The camera of the room a space shows. */
export const geometryFor = (image?: string): RoomGeometry => roomGeometry[image ?? ''] ?? roomGeometry[FALLBACK];

const trig = (g: RoomGeometry) => {
  const a = (g.az * Math.PI) / 180;
  return { c: Math.cos(a), s: Math.sin(a), zf: Math.sqrt(1 - g.k * g.k) };
};

/** A floor point (inches) to the room image's own units. */
export function project(g: RoomGeometry, fx: number, fy: number): [number, number] {
  const { c, s } = trig(g), x = fx / g.unit, y = fy / g.unit;
  return [g.ox + g.S * (x * c - y * s), g.oy + g.S * (x * s + y * c) * g.k];
}

/** A point in the room image's units back to the floor (inches). */
export function unproject(g: RoomGeometry, sx: number, sy: number): [number, number] {
  const { c, s } = trig(g), X = (sx - g.ox) / g.S, Y = (sy - g.oy) / g.S / g.k;
  return [(X * c + Y * s) * g.unit, (-X * s + Y * c) * g.unit];
}

/** The free floor, in inches: [x0, y0, x1, y1]. */
export const floorInches = (g: RoomGeometry) => g.floor.map((v) => v * g.unit) as [number, number, number, number];

/** Keeps a floor point on the floor. */
export function clampToFloor(g: RoomGeometry, fx: number, fy: number): [number, number] {
  const [x0, y0, x1, y1] = floorInches(g);
  return [Math.min(x1, Math.max(x0, fx)), Math.min(y1, Math.max(y0, fy))];
}

/** The middle of the floor, a little toward the viewer. */
export function startPoint(g: RoomGeometry): [number, number] {
  const [x0, y0, x1, y1] = floorInches(g);
  return [(x0 + x1) / 2, y0 + (y1 - y0) * 0.55];
}

/**
 * Where a new piece goes, by its kind: a sofa with its back to the wall, a lamp in the back corner, a rug and a table
 * in the middle, a chair to the side. If another piece already stands within a foot of that spot, it steps along
 * until it finds room.
 */
export function startPointFor(g: RoomGeometry, productId: string, kind: string | undefined, taken: { fx: number; fy: number }[]): [number, number] {
  const [x0, y0, x1, y1] = floorInches(g), a = assetFor(productId);
  const w = a?.footprint.w ?? 30, d = a?.footprint.d ?? 30, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  let p: [number, number] = startPoint(g);
  if (kind === 'sofa') p = [cx, y0 + (a?.dims.d ?? d) / 2 + 2];
  else if (kind === 'lamp') p = [x0 + w / 2 + 6, y0 + d / 2 + 6];
  else if (kind === 'rug') p = [cx, cy + 6];
  else if (kind === 'table') p = [cx, cy + 14];
  else if (kind === 'chair') p = [x1 - w / 2 - 8, cy + 10];
  for (let i = 0; i < 8 && taken.some((t) => Math.hypot(t.fx - p[0], t.fy - p[1]) < 12); i++) p = [p[0] + (i % 2 ? -1 : 1) * 18 * (i + 1), p[1] + 6];
  return clampToFloor(g, p[0], p[1]);
}

/** Room-image units per inch of floor. */
export const unitsPerInch = (g: RoomGeometry) => g.S / g.unit;

/**
 * The box a piece's drawing fills, in screen px, for a room shown `width` px wide: the anchor lands on the floor
 * point, and the drawing is scaled from the shared asset scale to the room's. Mirrored, the drawing is flipped
 * about its anchor, so the box shifts to keep the anchor in place.
 */
export function pieceBox(g: RoomGeometry, width: number, a: ItemAsset, fx: number, fy: number, mirror: boolean) {
  const px = width / g.view[0], [sx, sy] = project(g, fx, fy);
  const k = (unitsPerInch(g) * px) / ITEM_PX_PER_INCH;
  const w = a.view.w * k, h = a.view.h * k, ax = mirror ? a.view.w - a.anchor.x : a.anchor.x;
  return { left: sx * px - ax * k, top: sy * px - a.anchor.y * k, width: w, height: h, anchor: [sx * px, sy * px] as [number, number] };
}

/** A product's drawing, if it has one. */
export const assetFor = (productId: string) => itemForProduct(productId);

/** Back-to-front order: flat pieces (rugs) first, then by how near the floor point is; "Front" lifts a piece over the rest. */
export function paintOrder<T extends { productId: string; fx: number; fy: number; front?: number }>(pieces: T[]): T[] {
  const flat = (p: T) => ((assetFor(p.productId)?.dims.h ?? 99) < 2 ? 0 : 1);
  return [...pieces].sort((a, b) => flat(a) - flat(b) || (a.front ?? 0) - (b.front ?? 0) || a.fx + a.fy - (b.fx + b.fy));
}
