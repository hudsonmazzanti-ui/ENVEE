import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useFrameWidth } from '@/components/useFrameWidth';
import { BagButton, Chip, ProductCard, SectionHeader, TopBar, Txt } from '@/components/ui';
import { looks, products } from '@/data/catalog';
import { C, R, S } from '@/theme';
import { art } from '@/theme/assets';

const FILTERS = ['All', 'Living', 'Bedroom', 'Lighting', 'Decor', 'Under $200'];

export default function Discover() {
  const W = useFrameWidth();
  const [filter, setFilter] = useState('All');
  const [hero, ...rest] = looks;
  const col = (W - S.gutter * 2 - S.md) / 2;
  const shown = products.filter((p) =>
    filter === 'All' ? true : filter === 'Under $200' ? p.price < 200 : p.category === filter,
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar left={<Txt v="heading" style={{ marginLeft: 8 }}>Discover</Txt>} right={<BagButton />} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false} stickyHeaderIndices={[3]}>
        <View style={{ paddingHorizontal: S.gutter, paddingTop: 4 }}>
          <View style={styles.search}>
            <Feather name="search" size={17} color={C.text3} />
            <Txt v="body" style={{ color: C.text3, flex: 1 }}>Search</Txt>
          </View>
        </View>

        <Pressable onPress={() => router.push(`/look/${hero.id}`)} style={{ marginHorizontal: S.gutter, marginTop: S.lg }}>
          <View style={[styles.heroImg, { height: (W - S.gutter * 2) * 1.12 }]}>
            <Image source={art[hero.image]} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']} style={[StyleSheet.absoluteFill, { top: '50%' }]} />
            <View style={styles.heroText}>
              <Txt v="title" style={{ color: C.white }}>{hero.title}</Txt>
            </View>
          </View>
        </Pressable>

        <View style={{ marginTop: S.xxl }}>
          <SectionHeader title="Rooms" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: S.gutter, gap: S.md }}>
            {rest.map((l) => (
              <Pressable key={l.id} onPress={() => router.push(`/look/${l.id}`)} style={{ width: 176 }}>
                <Image source={art[l.image]} style={{ width: 176, height: 226, borderRadius: R.md }} contentFit="cover" />
                <Txt v="bodyMedium" style={{ fontSize: 14, marginTop: 10 }}>{l.title}</Txt>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={{ backgroundColor: C.bg, paddingTop: S.xxl, paddingBottom: S.md }}>
          <Txt v="heading" style={{ paddingHorizontal: S.gutter, marginBottom: S.md }}>Pieces</Txt>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: S.gutter, gap: 8 }}>
            {FILTERS.map((f) => (
              <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.grid}>
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} width={col} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    height: 46,
    borderRadius: R.pill,
    backgroundColor: C.canvas,
    borderWidth: 1,
    borderColor: C.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  heroImg: { borderRadius: R.lg, overflow: 'hidden', backgroundColor: C.surface },
  heroText: { position: 'absolute', left: 20, right: 20, bottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md, rowGap: S.xl, paddingHorizontal: S.gutter, paddingTop: S.sm },
});
