import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFrameWidth } from '@/components/useFrameWidth';
import { BackButton, BagButton, Button, Divider, HeartButton, IconName, TopBar, Txt } from '@/components/ui';
import { looks, productById } from '@/data/catalog';
import { useStore } from '@/state/store';
import { C, F, R, S, money } from '@/theme';
import { art } from '@/theme/assets';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = productById(id);
  const { state, dispatch } = useStore();
  const insets = useSafeAreaInsets();
  const W = useFrameWidth();
  const [color, setColor] = useState(0);
  const [added, setAdded] = useState(false);
  const [placing, setPlacing] = useState(false);
  const seenIn = looks.filter((l) => l.productIds.includes(p.id));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar left={<BackButton />} right={<><HeartButton id={p.id} /><BagButton /></>} />
      <ScrollView contentContainerStyle={{ paddingBottom: 130 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { height: W * 0.95 }]}>
          <Image source={art[p.photo]} style={{ width: '78%', height: '78%' }} contentFit="contain" />
          <View style={styles.dots}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.dot, i === 0 && { backgroundColor: C.text, width: 16 }]} />
            ))}
          </View>
        </View>

        <View style={{ padding: S.gutter }}>
          <Txt v="eyebrow">{p.retailer}</Txt>
          <Txt v="title" style={{ marginTop: 6 }}>{p.name}</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <Txt v="bodyMedium" style={{ fontSize: 18 }}>{money(p.price)}</Txt>
            {p.was ? <Txt v="body" style={{ color: C.text3, textDecorationLine: 'line-through' }}>{money(p.was)}</Txt> : null}
            {p.was ? (
              <View style={styles.sale}>
                <Txt v="small" style={{ color: C.accent, fontSize: 11, fontFamily: F.medium }}>Price dropped</Txt>
              </View>
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Ionicons key={i} name={i < Math.round(p.rating) ? 'star' : 'star-outline'} size={12} color={C.text} />
            ))}
            <Txt v="small" style={{ marginLeft: 4 }}>{p.rating} · {p.reviews.toLocaleString()} reviews</Txt>
          </View>

          <Txt v="eyebrow" style={{ marginTop: S.xl }}>Colour</Txt>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
            {p.colors.map((c, i) => (
              <Pressable key={c} onPress={() => setColor(i)} style={[styles.swatchRing, color === i && { borderColor: C.text }]}>
                <View style={[styles.swatch, { backgroundColor: c }]} />
              </Pressable>
            ))}
          </View>

          <Txt v="body" style={{ color: C.text2, marginTop: S.xl }}>{p.blurb}</Txt>

          <Divider style={{ marginTop: S.xl }} />
          <Row icon="maximize-2" label="Dimensions" value={p.dims} />
          <Divider />
          <Row icon="truck" label="Delivery" value="Free · arrives Aug 9–12" />
          <Divider />
          <Row icon="rotate-ccw" label="Returns" value="30 days, free pickup" />
          <Divider />
          <Pressable style={styles.extLink}>
            <Txt v="small" style={{ color: C.text }}>View on {p.domain}</Txt>
            <Feather name="arrow-up-right" size={14} color={C.text} />
          </Pressable>
        </View>

        {seenIn.length ? (
          <View style={{ marginTop: S.md }}>
            <Txt v="eyebrow" style={{ paddingHorizontal: S.gutter, marginBottom: 12 }}>Seen in these rooms</Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: S.gutter, gap: S.md }}>
              {seenIn.map((l) => (
                <Pressable key={l.id} onPress={() => router.push(`/look/${l.id}`)} style={{ width: 150 }}>
                  <Image source={art[l.image]} style={{ width: 150, height: 190, borderRadius: R.md }} contentFit="cover" />
                  <Txt v="bodyMedium" style={{ fontSize: 13, marginTop: 8 }}>{l.title}</Txt>
                  <Txt v="small" style={{ fontSize: 12 }}>{l.author}</Txt>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      {placing ? (
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Txt v="heading" style={{ flex: 1 }}>Place in…</Txt>
            <Pressable onPress={() => setPlacing(false)} hitSlop={10}>
              <Feather name="x" size={20} color={C.text} />
            </Pressable>
          </View>
          {state.spaces.map((sp) => (
            <Pressable
              key={sp.id}
              style={styles.sheetRow}
              onPress={() => {
                dispatch({ t: 'sticker/add', spaceId: sp.id, productId: p.id });
                setPlacing(false);
                router.push(`/room/${sp.id}`);
              }}>
              <Image source={art[sp.image]} style={{ width: 44, height: 56, borderRadius: 6 }} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Txt v="body" style={{ fontSize: 14 }}>{sp.name}</Txt>
                <Txt v="small" style={{ fontSize: 12 }}>{sp.subtitle}</Txt>
              </View>
              <Feather name="chevron-right" size={18} color={C.text3} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {!placing ? (
        <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Button kind="secondary" label="Try in a room" icon="image" onPress={() => setPlacing(true)} style={{ flex: 1, paddingHorizontal: 12 }} />
          <Button
            label={added ? 'Added' : 'Add to bag'}
            icon={added ? 'check' : undefined}
            style={{ flex: 1, paddingHorizontal: 12 }}
            onPress={() => {
              dispatch({ t: 'bag/add', id: p.id });
              setAdded(true);
              setTimeout(() => setAdded(false), 1600);
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

function Row({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Feather name={icon} size={16} color={C.text2} />
      <Txt v="small" style={{ color: C.text, width: 90 }}>{label}</Txt>
      <Txt v="small" style={{ flex: 1, textAlign: 'right' }}>{value}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  dots: { position: 'absolute', bottom: 16, flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CFC8BE' },
  sale: { backgroundColor: C.accentSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  swatchRing: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 26, height: 26, borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.15)' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  extLink: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 16 },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: S.gutter,
    paddingTop: 12,
    backgroundColor: C.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.line,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.bg,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: S.gutter,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
    boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
  } as object,
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
});
