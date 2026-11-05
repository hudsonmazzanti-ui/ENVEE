import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { LookThumb } from '@/components/SpaceThumb';
import { useFrameWidth } from '@/components/useFrameWidth';
import { BagButton, Button, ProductCard, TopBar, Txt } from '@/components/ui';
import { looks, productById } from '@/data/catalog';
import { useStore } from '@/state/store';
import { C, F, R, S } from '@/theme';
import { art } from '@/theme/assets';

export default function Saved() {
  const { state } = useStore();
  const W = useFrameWidth();
  const [tab, setTab] = useState<'pieces' | 'looks'>('pieces');
  const col = (W - S.gutter * 2 - S.md) / 2;
  const items = state.saved.map(productById);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar left={<Txt v="heading" style={{ marginLeft: 8 }}>Saved</Txt>} right={<BagButton />} />
      <View style={styles.seg}>
        {(['pieces', 'looks'] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.segItem, tab === t && styles.segOn]}>
            <Txt v="small" style={{ color: tab === t ? C.text : C.text2, fontFamily: F.medium }}>
              {t === 'pieces' ? 'Pieces' : 'Looks'}
            </Txt>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {tab === 'pieces' ? (
          items.length ? (
            <>
              <View style={styles.grid}>
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} width={col} />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.empty}>
              <Image source={art.empty_saved} style={{ width: 260, height: 208 }} contentFit="contain" />
              <Txt v="heading">Nothing saved</Txt>
              <Button kind="secondary" label="Discover" style={{ marginTop: 20 }} onPress={() => router.push('/discover')} />
            </View>
          )
        ) : (
          <View style={{ paddingHorizontal: S.gutter, gap: S.xl, paddingTop: S.sm }}>
            {looks.slice(1).map((l) => (
              <Pressable key={l.id} onPress={() => router.push(`/look/${l.id}`)} style={{ flexDirection: 'row', gap: S.lg, alignItems: 'center' }}>
                <LookThumb look={l} width={110} height={140} style={{ borderRadius: R.md }} />
                <View style={{ flex: 1 }}>
                  <Txt v="heading">{l.title}</Txt>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  seg: {
    flexDirection: 'row',
    marginHorizontal: S.gutter,
    marginTop: 4,
    marginBottom: S.lg,
    backgroundColor: C.surface,
    borderRadius: R.pill,
    padding: 4,
  },
  segItem: { flex: 1, height: 36, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: C.bg, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } as object,
  summary: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.gutter, marginBottom: S.lg },
  alert: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.accentSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md, rowGap: S.xl, paddingHorizontal: S.gutter },
  empty: { alignItems: 'center', padding: S.xxl, paddingTop: S.lg },
});
