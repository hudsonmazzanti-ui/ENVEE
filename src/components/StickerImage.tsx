import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { LIGHTS, type Light } from '@/theme/lighting';

/** A furniture sticker, optionally tinted to match the room's lighting. */
export function StickerImage({ source, light = 'off' }: { source: ImageSource | number; light?: Light }) {
  const l = LIGHTS[light];
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image source={source} style={StyleSheet.absoluteFill} contentFit="contain" />
      {l.opacity > 0 ? (
        <Image source={source} style={[StyleSheet.absoluteFill, { opacity: l.opacity }]} contentFit="contain" tintColor={l.color} />
      ) : null}
    </View>
  );
}
