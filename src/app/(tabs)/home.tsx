import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SpaceThumb } from '@/components/SpaceThumb';
import { useFrameWidth } from '@/components/useFrameWidth';
import { BagButton, ProductCard, SectionHeader, TopBar, Txt, Wordmark } from '@/components/ui';
import { products } from '@/data/catalog';
import { Space, spaceTotal, useStore } from '@/state/store';
import { C, R, S, money, shadow } from '@/theme';

export default function Home() {
  const { state } = useStore();
  const W = useFrameWidth();
  const [first, ...rest] = state.spaces;
  const half = (W - S.gutter * 2 - S.md) / 2;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar
        left={<Wordmark size={15} style={{ marginLeft: 8 }} />}
        right={<BagButton />}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: S.gutter, paddingTop: S.lg, paddingBottom: S.xl }}>
          <Txt v="title">Good evening, Maya.</Txt>
        </View>

        {first ? <FeatureSpace space={first} width={W - S.gutter * 2} /> : null}

        <View style={[styles.row, { paddingHorizontal: S.gutter, marginTop: S.md }]}>
          {rest.slice(0, 1).map((sp) => (
            <SmallSpace key={sp.id} space={sp} width={half} />
          ))}
          <Pressable onPress={() => router.push('/new-space')} style={[styles.newCard, { width: half, height: half * 1.33 + 52 }]}>
            <View style={styles.newIcon}>
              <Feather name="plus" size={22} color={C.accent} />
            </View>
            <Txt v="bodyMedium" style={{ marginTop: 12 }}>New space</Txt>
          </Pressable>
        </View>
        {rest.length > 1 ? (
          <View style={[styles.row, { paddingHorizontal: S.gutter, marginTop: S.md, flexWrap: 'wrap' }]}>
            {rest.slice(1).map((sp) => (
              <SmallSpace key={sp.id} space={sp} width={half} />
            ))}
          </View>
        ) : null}


        <View style={{ marginTop: S.xxl }}>
          <SectionHeader title="For your bedroom" action="See all" onAction={() => router.push('/discover')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: S.gutter, gap: S.md }}>
            {products.filter((p) => ['bed', 'pendant', 'dresser', 'mirror', 'tablelamp', 'sidetable'].includes(p.id)).map((p) => (
              <ProductCard key={p.id} product={p} width={150} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureSpace({ space, width }: { space: Space; width: number }) {
  const h = width * 0.78;
  return (
    <Pressable onPress={() => router.push(`/room/${space.id}`)} style={{ marginHorizontal: S.gutter }}>
      <View style={[styles.featureImg, { height: h }, shadow]}>
        <SpaceThumb space={space} width={width} height={h} />
      </View>
      <View style={[styles.row, { marginTop: 12, alignItems: 'flex-end' }]}>
        <View style={{ flex: 1 }}>
          <Txt v="heading">{space.name}</Txt>
          <Txt v="small" style={{ marginTop: 2 }}>{money(spaceTotal(space))}</Txt>
        </View>
        <Feather name="arrow-right" size={18} color={C.text} style={{ paddingBottom: 4 }} />
      </View>
    </Pressable>
  );
}

function SmallSpace({ space, width }: { space: Space; width: number }) {
  const h = width * 1.33;
  return (
    <Pressable onPress={() => router.push(`/room/${space.id}`)} style={{ width }}>
      <View style={[styles.featureImg, { height: h }]}>
        <SpaceThumb space={space} width={width} height={h} />
      </View>
      <Txt v="bodyMedium" style={{ marginTop: 8, fontSize: 14 }} numberOfLines={1}>{space.name}</Txt>
      <Txt v="small" style={{ fontSize: 12 }}>{money(spaceTotal(space))}</Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: S.md },
  featureImg: { borderRadius: R.lg, overflow: 'hidden', backgroundColor: C.surface },
  pill: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  openBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 4 },
  newCard: {
    borderRadius: R.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CFC8BE',
    backgroundColor: C.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  tip: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: S.gutter,
    marginTop: S.xl,
    padding: S.lg,
    borderRadius: R.md,
    backgroundColor: C.canvas,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
  },
});
