import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useFrameWidth } from '@/components/useFrameWidth';
import { BagButton, Button, ProductCard, TopBar, Txt } from '@/components/ui';
import { looks, productById } from '@/data/catalog';
import { useStore } from '@/state/store';
import { C, F, R, S, money } from '@/theme';
import { art } from '@/theme/assets';

export default function Saved() {
  const { state } = useStore();
  const W = useFrameWidth();
  const [tab, setTab] = useState<'pieces' | 'looks'>('pieces');
  const col = (W - S.gutter * 2 - S.md) / 2;
  const items = state.saved.map(productById);
  const total = items.reduce((s, p) => s + p.price, 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar left={<Txt v="heading" style={{ marginLeft: 8 }}>Saved</Txt>} right={<BagButton />} />
      <View style={styles.seg}>
        {(['pieces', 'looks'] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.segItem, tab === t && styles.segOn]}>
            <Txt v="small" style={{ color: tab === t ? C.text : C.text2, fontFamily: F.medium }}>
              {t === 'pieces' ? `Pieces · ${items.length}` : `Looks · ${looks.length - 1}`}
            </Txt>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {tab === 'pieces' ? (
          items.length ? (
            <>
              <View style={styles.summary}>
                <View style={{ flex: 1 }}>
                  <Txt v="small">Everything you've saved</Txt>
                  <Txt v="heading">{money(total)}</Txt>
                </View>
                <View style={styles.alert}>
                  <Feather name="bell" size={13} color={C.accent} />
                  <Txt v="small" style={{ color: C.accent, fontSize: 12, fontFamily: F.medium }}>2 price drops</Txt>
                </View>
              </View>
              <View style={styles.grid}>
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} width={col} />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.empty}>
              <Feather name="heart" size={28} color={C.text3} />
              <Txt v="heading" style={{ marginTop: 12 }}>Nothing saved yet</Txt>
              <Txt v="small" style={{ textAlign: 'center', marginTop: 6 }}>Tap the heart on any piece to keep it here.</Txt>
              <Button kind="secondary" label="Discover pieces" style={{ marginTop: 20 }} onPress={() => router.push('/discover')} />
            </View>
          )
        ) : (
          <View style={{ paddingHorizontal: S.gutter, gap: S.xl, paddingTop: S.sm }}>
            {looks.slice(1).map((l) => (
              <Pressable key={l.id} onPress={() => router.push(`/look/${l.id}`)} style={{ flexDirection: 'row', gap: S.lg, alignItems: 'center' }}>
                <Image source={art[l.image]} style={{ width: 110, height: 140, borderRadius: R.md }} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Txt v="eyebrow">{l.room}</Txt>
                  <Txt v="heading" style={{ marginTop: 4 }}>{l.title}</Txt>
                  <Txt v="small" style={{ marginTop: 4 }}>{l.author} · {l.productIds.length} pieces · {money(l.productIds.reduce((s, id) => s + productById(id).price, 0))}</Txt>
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
  empty: { alignItems: 'center', padding: S.xxl, marginTop: 40 },
});
