import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ROOM_RATIO } from '@/components/RoomCanvas';
import { StickerImage } from '@/components/StickerImage';
import { productById } from '@/data/catalog';
import { Space, spaceSource } from '@/state/store';
import { art } from '@/theme/assets';

// Static thumbnail composite: room + stickers at their saved positions (cover-cropped).
export function SpaceThumb({ space, width, height }: { space: Space; width: number; height: number }) {
  const cw = Math.max(width, height / ROOM_RATIO);
  const ch = cw * ROOM_RATIO;
  const ox = (width - cw) / 2;
  const oy = (height - ch) * 0.8;
  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: ox, top: oy, width: cw, height: ch }}>
        <Image source={spaceSource(space)} style={StyleSheet.absoluteFill} contentFit="cover" />
        {space.stickers.map((s) => {
          const sz = s.size * cw;
          return (
            <View key={s.uid} style={{ position: 'absolute', width: sz, height: sz, left: s.x * cw - sz / 2, top: s.y * ch - sz / 2 }}>
              <StickerImage source={art[productById(s.productId).sticker]} light={space.light} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

