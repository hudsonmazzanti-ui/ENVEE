import { Image, type ImageSource } from 'expo-image';
import { StyleSheet } from 'react-native';

/** A furniture sticker: the product's cut-out, contained in its box. */
export function StickerImage({ source }: { source: ImageSource | number }) {
  return <Image source={source} style={StyleSheet.absoluteFill} contentFit="contain" />;
}
