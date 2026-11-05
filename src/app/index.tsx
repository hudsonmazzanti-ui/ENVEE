import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RoomScene } from '@/components/hairline/RoomScene';
import { Button, Txt, Wordmark } from '@/components/ui';
import { C, S } from '@/theme';

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const enter = () => router.replace('/home');

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      {/* The Hairline room fills the screen. Swipe up like a reel: a quick flick or a long slow drag
          pulls the room apart and enters the app. */}
      <RoomScene onOpen={enter} style={StyleSheet.absoluteFill} />

      <View style={[styles.top, { paddingTop: insets.top + S.xl }]} pointerEvents="none">
        <Wordmark size={30} color={C.canvas} />
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 20 }]} pointerEvents="box-none">
        <View style={styles.hint} pointerEvents="none">
          <Feather name="chevron-up" size={18} color={C.canvas} />
          <Txt v="small" style={{ color: C.canvas }}>Swipe up to step inside</Txt>
        </View>
        <Button label="Get started" kind="secondary" onPress={enter} style={styles.cta} />
        <Pressable onPress={enter} style={{ alignSelf: 'center', marginTop: 16 }} hitSlop={10}>
          <Txt v="small" style={{ color: C.canvas }}>Sign in</Txt>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.accent },
  top: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: S.gutter + 4 },
  hint: { alignItems: 'center', gap: 2, marginBottom: S.xl, opacity: 0.85 },
  cta: { backgroundColor: C.canvas, borderColor: C.canvas },
});
