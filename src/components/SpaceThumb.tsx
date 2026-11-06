import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ROOM_RATIO } from '@/components/RoomCanvas';
import { StickerImage } from '@/components/StickerImage';
import { Look, productById } from '@/data/catalog';
import { Placed, Space, spaceSource } from '@/state/store';
import { art } from '@/theme/assets';
import { roomArt } from '@/theme/rooms';

type Box = { width: number; height: number; style?: StyleProp<ViewStyle> };

/**
 * A room (a photo, or its line-art stand-in) with furniture cut-outs at their placed positions,
 * cover-cropped to the box and kept toward the floor, where the furniture is.
 */
export function RoomThumb({ source, pieces, width, height, style }: Box & { source: ImageSource | number; pieces: Placed[] }) {
  const cw = Math.max(width, height / ROOM_RATIO);
  const ch = cw * ROOM_RATIO;
  const ox = (width - cw) / 2;
  const oy = (height - ch) * 0.8;
  return (
    <View style={[{ width, height, overflow: 'hidden' }, style]}>
      <View style={{ position: 'absolute', left: ox, top: oy, width: cw, height: ch }}>
        <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" />
        {pieces.map((s) => {
          const sz = s.size * cw;
          return (
            <View key={s.uid} style={{ position: 'absolute', width: sz, height: sz, left: s.x * cw - sz / 2, top: s.y * ch - sz / 2 }}>
              <StickerImage source={productById(s.productId).sticker} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** A space as the user left it. */
export function SpaceThumb({ space, ...box }: Box & { space: Space }) {
  return <RoomThumb source={spaceSource(space, Math.max(box.width, box.height / ROOM_RATIO))} pieces={space.stickers} {...box} />;
}

/** A look: its line-art room, furniture drawn in. */
export function LookThumb({ look, ...box }: Box & { look: Look }) {
  return <RoomThumb source={roomArt(look.backdrop, Math.max(box.width, box.height / ROOM_RATIO))} pieces={[]} {...box} />;
}
