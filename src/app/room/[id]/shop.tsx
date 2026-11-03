import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpaceThumb } from '@/components/SpaceThumb';
import { useFrameWidth } from '@/components/useFrameWidth';
import { BackButton, BagButton, Button, Divider, TopBar, Txt } from '@/components/ui';
import { productById } from '@/data/catalog';
import { useStore } from '@/state/store';
import { C, R, S, money } from '@/theme';
import { art } from '@/theme/assets';

export default function ShopRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useStore();
  const insets = useSafeAreaInsets();
  const W = useFrameWidth();
  const space = state.spaces.find((s) => s.id === id) ?? state.spaces[0];
  const ids = [...new Set(space.stickers.map((s) => s.productId))];
  const [picked, setPicked] = useState<string[]>(ids);
  const total = picked.reduce((sum, pid) => sum + productById(pid).price, 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar left={<BackButton />} title="Shop" right={<BagButton />} />
      <ScrollView contentContainerStyle={{ paddingBottom: 130 + insets.bottom }}>
        <View style={{ flexDirection: 'row', gap: S.lg, padding: S.gutter, alignItems: 'center' }}>
          <View style={{ borderRadius: R.md, overflow: 'hidden' }}>
            <SpaceThumb space={space} width={88} height={110} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt v="heading">{space.name}</Txt>
          </View>
        </View>
        <Divider style={{ marginHorizontal: S.gutter }} />

        {ids.length === 0 ? (
          <Txt v="body" style={{ padding: S.gutter, color: C.text2 }}>No pieces yet.</Txt>
        ) : null}

        {ids.map((pid) => {
          const p = productById(pid);
          const on = picked.includes(pid);
          return (
            <View key={pid}>
              <View style={styles.row}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  onPress={() => setPicked((x) => (on ? x.filter((y) => y !== pid) : [...x, pid]))}
                  style={[styles.check, on && { backgroundColor: C.accent, borderColor: C.accent }]}>
                  {on ? <Feather name="check" size={14} color={C.white} /> : null}
                </Pressable>
                <Pressable onPress={() => router.push(`/product/${pid}`)} style={styles.thumb}>
                  <Image source={art[p.photo]} style={{ width: 62, height: 62 }} contentFit="contain" />
                </Pressable>
                <Pressable onPress={() => router.push(`/product/${pid}`)} style={{ flex: 1 }}>
                  <Txt v="eyebrow" style={{ fontSize: 10 }}>{p.retailer}</Txt>
                  <Txt v="body" style={{ fontSize: 14, marginTop: 2 }} numberOfLines={2}>{p.name}</Txt>
                </Pressable>
                <View style={{ alignItems: 'flex-end' }}>
                  <Txt v="price">{money(p.price)}</Txt>
                  {p.was ? <Txt v="small" style={{ fontSize: 11, textDecorationLine: 'line-through' }}>{money(p.was)}</Txt> : null}
                </View>
              </View>
              <Divider style={{ marginLeft: S.gutter + 36 }} />
            </View>
          );
        })}

      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 14), width: W }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Txt v="small">{picked.length} selected</Txt>
          <Txt v="bodyMedium">{money(total)}</Txt>
        </View>
        <Button
          label={picked.length ? `Add ${picked.length} to bag` : 'Select pieces'}
          icon="shopping-bag"
          onPress={() => {
            if (!picked.length) return;
            picked.forEach((pid) => dispatch({ t: 'bag/add', id: pid }));
            router.push('/bag');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: S.gutter, paddingVertical: 14 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#CFC8BE', alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 72, height: 72, borderRadius: R.md, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  perk: { flexDirection: 'row', gap: 12, margin: S.gutter, padding: S.lg, borderRadius: R.md, backgroundColor: C.accentSoft },
  bottom: {
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: S.gutter,
    paddingTop: 12,
    backgroundColor: C.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.line,
  },
});
