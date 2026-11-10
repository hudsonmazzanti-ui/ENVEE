import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { pieceLayout, PieceImage } from '@/components/PieceImage';
import { ROOM_RATIO } from '@/components/RoomCanvas';
import { Look } from '@/data/catalog';
import { geometryFor, paintOrder } from '@/lib/roomSpace';
import { Placed, Space, spaceSource } from '@/state/store';
import { roomArt } from '@/theme/rooms';

type Box = { width: number; height: number; style?: StyleProp<ViewStyle> };

/**
 * A room (a photo, or its line-art stand-in) with its pieces standing on their floor points,
 * cover-cropped to the box and kept toward the floor, where the furniture is.
 */
export function RoomThumb({ source, pieces, width, height, style, image }: Box & { source: ImageSource | number; pieces: Placed[]; image?: string }) {
  const g = geometryFor(image);
  const cw = Math.max(width, height / ROOM_RATIO);
  const ch = cw * ROOM_RATIO;
  const ox = (width - cw) / 2;
  const oy = (height - ch) * 0.8;
  return (
    <View style={[{ width, height, overflow: 'hidden' }, style]}>
      <View style={{ position: 'absolute', left: ox, top: oy, width: cw, height: ch }}>
        <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" />
        {paintOrder(pieces).map((s) => {
          const b = pieceLayout(g, cw, s);
          return (
            <View key={s.uid} style={{ position: 'absolute', width: b.width, height: b.height, left: b.left, top: b.top }}>
              <PieceImage source={b.source} mirror={b.mirror} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** A space as the user left it. */
export function SpaceThumb({ space, ...box }: Box & { space: Space }) {
  return <RoomThumb source={spaceSource(space, Math.max(box.width, box.height / ROOM_RATIO))} pieces={space.stickers} image={space.image} {...box} />;
}

/** A look: its line-art room, furniture drawn in. */
export function LookThumb({ look, ...box }: Box & { look: Look }) {
  return <RoomThumb source={roomArt(look.backdrop, Math.max(box.width, box.height / ROOM_RATIO))} pieces={[]} {...box} />;
}
