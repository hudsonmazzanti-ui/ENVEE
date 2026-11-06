import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LookThumb } from '@/components/SpaceThumb';
import { useFrameWidth } from '@/components/useFrameWidth';
import { BackButton, Button, Divider, HeartButton, IconName, TopBar, Txt } from '@/components/ui';
import { looks, productById } from '@/data/catalog';
import { spaceSource, useStore } from '@/state/store';
import { C, R, S, money } from '@/theme';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = productById(id);
  const { state, dispatch } = useStore();
  const insets = useSafeAreaInsets();
  const W = useFrameWidth();
  const [color, setColor] = useState(0);
  const [placing, setPlacing] = useState(false);
  const seenIn = looks.filter((l) => l.productIds.includes(p.id));
  // Products with a shop link are bought on the retailer's site; this opens it (a new tab on web).
  const shop = () => {
    if (p.shopUrl) Linking.openURL(p.shopUrl);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar left={<BackButton />} right={<HeartButton id={p.id} />} />
      <ScrollView contentContainerStyle={{ paddingBottom: 130 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { height: W * 0.95 }]}>
          <Image source={p.photo} style={{ width: '78%', height: '78%' }} contentFit="contain" />
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
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: S.xl }}>
            {p.colors.map((c, i) => (
              <Pressable key={c} onPress={() => setColor(i)} style={[styles.swatchRing, color === i && { borderColor: C.text }]}>
                <View style={[styles.swatch, { backgroundColor: c }]} />
              </Pressable>
            ))}
          </View>

          <Divider style={{ marginTop: S.xl }} />
          {p.dims ? (
            <>
              <Row icon="maximize-2" label="Size" value={p.dims} />
              <Divider />
            </>
          ) : null}
          <Pressable style={styles.extLink} onPress={p.shopUrl ? shop : undefined} disabled={!p.shopUrl}>
            <Txt v="small" style={{ color: C.text }}>View on {p.domain}</Txt>
            <Feather name="arrow-up-right" size={14} color={C.text} />
          </Pressable>
        </View>

        {seenIn.length ? (
          <View style={{ marginTop: S.md }}>
            <Txt v="eyebrow" style={{ paddingHorizontal: S.gutter, marginBottom: 12 }}>Seen in</Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: S.gutter, gap: S.md }}>
              {seenIn.map((l) => (
                <Pressable key={l.id} onPress={() => router.push(`/look/${l.id}`)} style={{ width: 150 }}>
                  <LookThumb look={l} width={150} height={190} style={{ borderRadius: R.md }} />
                  <Txt v="bodyMedium" style={{ fontSize: 13, marginTop: 8 }}>{l.title}</Txt>
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
              <Image source={spaceSource(sp)} style={{ width: 44, height: 56, borderRadius: 6 }} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Txt v="body" style={{ fontSize: 14 }}>{sp.name}</Txt>
              </View>
              <Feather name="chevron-right" size={18} color={C.text3} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {!placing ? (
        <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Button kind={p.shopUrl ? 'secondary' : 'primary'} label="Try it" icon="image" onPress={() => setPlacing(true)} style={{ flex: 1, paddingHorizontal: 12 }} />
          {p.shopUrl ? <Button label="Shop" icon="arrow-up-right" style={{ flex: 1, paddingHorizontal: 12 }} onPress={shop} /> : null}
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
