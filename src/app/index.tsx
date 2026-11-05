import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RoomScene } from '@/components/hairline/RoomScene';
import { Button, Txt, Wordmark } from '@/components/ui';
import { C, S } from '@/theme';

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const heroH = Math.min(height * 0.58, 560);
  const enter = () => router.replace('/home');

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="light" />
      {/* The Hairline room: drag across to pull it apart; 70% of the way (or a tap) enters the app. */}
      <View style={[styles.hero, { height: heroH, paddingTop: insets.top }]}>
        <RoomScene onOpen={enter} style={{ flex: 1 }} />
        <View style={styles.hint} pointerEvents="none">
          <Txt v="small" style={{ color: C.canvas, opacity: 0.8 }}>Swipe the room to step inside</Txt>
          <Feather name="arrow-right" size={14} color={C.canvas} style={{ opacity: 0.8 }} />
        </View>
      </View>

      <View style={[styles.body, { paddingBottom: insets.bottom + 20 }]}>
        <Wordmark size={34} style={{ alignSelf: 'center' }} />
        <View style={{ flex: 1 }} />
        <Button label="Get started" onPress={enter} />
        <Pressable onPress={enter} style={{ alignSelf: 'center', marginTop: 16 }} hitSlop={10}>
          <Txt v="small" style={{ color: C.text }}>Sign in</Txt>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: C.accent, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 18 },
  body: { flex: 1, paddingHorizontal: S.gutter + 4, paddingTop: S.xl },
});
