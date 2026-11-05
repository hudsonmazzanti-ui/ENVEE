import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpaceThumb } from '@/components/SpaceThumb';
import { useFrameWidth } from '@/components/useFrameWidth';
import { BackButton, Button, Divider, TopBar, Txt } from '@/components/ui';
import { productById } from '@/data/catalog';
import { useStore } from '@/state/store';
import { C, R, S, money } from '@/theme';
import { art } from '@/theme/assets';

export default function ShopRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useStore();
  const insets = useSafeAreaInsets();
  const W = useFrameWidth();
  const space = state.spaces.find((s) => s.id === id) ?? state.spaces[0];
  const ids = [...new Set(space.stickers.map((s) => s.productId))];
  const total = ids.reduce((sum, pid) => sum + productById(pid).price, 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar left={<BackButton />} title="Shop" />
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
          <View style={{ alignItems: 'center', padding: S.gutter }}>
            <Image source={art.empty_room} style={{ width: 260, height: 208 }} contentFit="contain" />
            <Txt v="heading">No pieces yet</Txt>
            <Button kind="secondary" label="Paste a link" icon="link-2" style={{ marginTop: 20 }} onPress={() => router.push(`/paste?space=${space.id}`)} />
          </View>
        ) : null}

        {ids.map((pid) => {
          const p = productById(pid);
          return (
            <View key={pid}>
              <View style={styles.row}>
                <Pressable onPress={() => router.push(`/product/${pid}`)} style={styles.thumb}>
                  <Image source={art[p.photo]} style={{ width: 62, height: 62 }} contentFit="contain" />
                </Pressable>
                <Pressable onPress={() => router.push(`/product/${pid}`)} style={{ flex: 1 }}>
                  <Txt v="eyebrow" style={{ fontSize: 10 }}>{p.retailer}</Txt>
                  <Txt v="body" style={{ fontSize: 14, marginTop: 2 }} numberOfLines={2}>{p.name}</Txt>
                </Pressable>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Txt v="price">{money(p.price)}</Txt>
                  {/* Pieces with an affiliate link are bought on the retailer's site. */}
                  {p.shopUrl ? <Button small label="Shop" icon="arrow-up-right" onPress={() => Linking.openURL(p.shopUrl!)} /> : null}
                </View>
              </View>
              <Divider style={{ marginLeft: S.gutter }} />
            </View>
          );
        })}

      </ScrollView>

      {ids.length ? (
        <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 14), width: W }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt v="small">{ids.length} {ids.length === 1 ? 'piece' : 'pieces'}</Txt>
            <Txt v="bodyMedium">{money(total)}</Txt>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: S.gutter, paddingVertical: 14 },
  thumb: { width: 72, height: 72, borderRadius: R.md, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
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
