import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Txt, Wordmark } from '@/components/ui';
import { useStore } from '@/state/store';
import { C, S } from '@/theme';
import { art } from '@/theme/assets';

export default function Confirmed() {
  const { dispatch } = useStore();
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    dispatch({ t: 'bag/clear' });
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  }, [dispatch, scale]);

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <StatusBar style="light" />
      <Wordmark size={15} color={C.canvas} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Image source={art.confirmed} style={styles.figure} contentFit="contain" />
        </Animated.View>
        <Txt v="title" style={{ textAlign: 'center', marginTop: S.md, color: C.canvas }}>On its way.</Txt>
      </View>
      <Button kind="secondary" label="Done" onPress={() => router.dismissTo('/home')} style={styles.done} />
    </View>
  );
}

const styles = StyleSheet.create({
  // A full-screen moment, so it is emerald, drawn like the welcome.
  wrap: { flex: 1, backgroundColor: C.accent, alignItems: 'center', paddingHorizontal: S.gutter },
  figure: { width: 300, height: 240 },
  done: { alignSelf: 'stretch', backgroundColor: C.canvas, borderColor: C.canvas },
});
