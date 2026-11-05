import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Txt, Wordmark } from '@/components/ui';
import { useStore } from '@/state/store';
import { C, S } from '@/theme';

export default function Confirmed() {
  const { dispatch } = useStore();
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    dispatch({ t: 'bag/clear' });
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  }, [dispatch, scale]);

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Wordmark size={15} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
          <Feather name="check" size={34} color={C.white} />
        </Animated.View>
        <Txt v="title" style={{ textAlign: 'center', marginTop: S.xl }}>On its way.</Txt>
      </View>
      <Button label="Done" onPress={() => router.dismissTo('/home')} style={{ alignSelf: 'stretch' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg, alignItems: 'center', paddingHorizontal: S.gutter },
  circle: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
});
