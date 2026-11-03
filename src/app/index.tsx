import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Txt, Wordmark } from '@/components/ui';
import { C, S } from '@/theme';
import { art } from '@/theme/assets';

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const heroH = Math.min(height * 0.58, 560);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ height: heroH }}>
        <Image source={art.look_emerald} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="bottom" />
        <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0)', C.bg]} style={StyleSheet.absoluteFill} />
        <View style={[styles.wordmarkWrap, { top: insets.top + 18 }]}>
          <Wordmark size={18} />
        </View>
      </View>

      <View style={[styles.body, { paddingBottom: insets.bottom + 20 }]}>
        <Txt v="display">
          Picture it.{'\n'}
          <Txt v="display" style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', color: C.accent }}>Then make it home.</Txt>
        </Txt>
        <View style={{ flex: 1 }} />
        <Button label="Get started" onPress={() => router.replace('/home')} />
        <Pressable onPress={() => router.replace('/home')} style={{ alignSelf: 'center', marginTop: 16 }} hitSlop={10}>
          <Txt v="small" style={{ color: C.text }}>Sign in</Txt>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wordmarkWrap: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  body: { flex: 1, paddingHorizontal: S.gutter + 4, marginTop: -24 },
});
