import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { productById, type ImageSrc } from '@/data/catalog';
import { assetFor, pieceBox, project, unitsPerInch } from '@/lib/roomSpace';
import type { Placed } from '@/state/store';
import type { RoomGeometry } from '@/theme/roomGeometry';

/** A product with no line drawing yet stands as its old cut-out, this many inches wide. */
const FALLBACK_INCHES = 32;

export type PieceLayout = { left: number; top: number; width: number; height: number; anchor: [number, number]; source: ImageSrc; mirror: boolean };

/** Where a placed piece draws in a room shown `width` px wide: its line drawing, anchored on its floor point. */
export function pieceLayout(g: RoomGeometry, width: number, p: Placed): PieceLayout {
  const a = assetFor(p.productId);
  if (a) return { ...pieceBox(g, width, a, p.fx, p.fy, p.mirror), source: a.svg as ImageSrc, mirror: p.mirror };
  const px = width / g.view[0], [sx, sy] = project(g, p.fx, p.fy), size = FALLBACK_INCHES * unitsPerInch(g) * px;
  return { left: sx * px - size / 2, top: sy * px - size, width: size, height: size, anchor: [sx * px, sy * px], source: productById(p.productId).sticker, mirror: p.mirror };
}

/** The drawing itself, filling its box; mirrored, it is flipped in place (the box already keeps the anchor still). */
export function PieceImage({ source, mirror }: { source: ImageSrc; mirror: boolean }) {
  return <Image source={source} style={[StyleSheet.absoluteFill, mirror && { transform: [{ scaleX: -1 }] }]} contentFit="fill" />;
}
