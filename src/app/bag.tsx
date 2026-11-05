import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Button, Divider, TopBar, Txt } from '@/components/ui';
import { Product, productById } from '@/data/catalog';
import { useStore } from '@/state/store';
import { C, F, R, S, money } from '@/theme';
import { art } from '@/theme/assets';

export default function Bag() {
  const { state, dispatch } = useStore();
  const insets = useSafeAreaInsets();
  const lines = Object.entries(state.bag).map(([id, qty]) => ({ p: productById(id), qty }));
  const byStore = lines.reduce<Record<string, { p: Product; qty: number }[]>>((acc, l) => {
    (acc[l.p.retailer] ??= []).push(l);
    return acc;
  }, {});
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const tax = Math.round(subtotal * 0.08875);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  const empty = lines.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: empty ? C.accent : C.bg }}>
      {/* An empty bag is a full-screen moment: emerald, drawn like the welcome. */}
      {empty ? <StatusBar style="light" /> : null}
      <TopBar transparent={empty} left={<BackButton color={empty ? C.canvas : undefined} />} title={empty ? undefined : `Bag${count ? ` · ${count}` : ''}`} />
      {empty ? (
        <View style={[styles.empty, { paddingBottom: insets.bottom + S.xxl * 2 }]}>
          <Image source={art.empty_bag} style={styles.figure} contentFit="contain" accessibilityIgnoresInvertColors />
          <Txt v="heading" style={{ color: C.canvas }}>Your bag is empty</Txt>
          <Button kind="secondary" label="Discover" style={styles.onEmerald} onPress={() => router.replace('/discover')} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingBottom: 170 + insets.bottom }}>
            {Object.entries(byStore).map(([store, ls]) => (
              <View key={store} style={{ marginTop: S.lg }}>
                <View style={styles.storeHead}>
                  <Txt v="eyebrow" style={{ color: C.text }}>{store}</Txt>
                </View>
                {ls.map(({ p, qty }) => (
                  <View key={p.id}>
                    <View style={styles.line}>
                      <Pressable onPress={() => router.push(`/product/${p.id}`)} style={styles.thumb}>
                        <Image source={art[p.photo]} style={{ width: 60, height: 60 }} contentFit="contain" />
                      </Pressable>
                      <View style={{ flex: 1 }}>
                        <Txt v="body" style={{ fontSize: 14 }} numberOfLines={2}>{p.name}</Txt>
                        <Txt v="price" style={{ marginTop: 4 }}>{money(p.price * qty)}</Txt>
                        <View style={styles.qty}>
                          <Pressable hitSlop={6} onPress={() => dispatch({ t: 'bag/set', id: p.id, qty: qty - 1 })} style={styles.qtyBtn}>
                            <Feather name={qty === 1 ? 'trash-2' : 'minus'} size={13} color={C.text} />
                          </Pressable>
                          <Txt v="small" style={{ color: C.text, fontFamily: F.medium, minWidth: 18, textAlign: 'center' }}>{qty}</Txt>
                          <Pressable hitSlop={6} onPress={() => dispatch({ t: 'bag/set', id: p.id, qty: qty + 1 })} style={styles.qtyBtn}>
                            <Feather name="plus" size={13} color={C.text} />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                    <Divider style={{ marginLeft: S.gutter }} />
                  </View>
                ))}
              </View>
            ))}

            <View style={{ padding: S.gutter, gap: 8, marginTop: S.md }}>
              <Line label="Subtotal" value={money(subtotal)} />
              <Line label="Estimated tax" value={money(tax)} />
            </View>
          </ScrollView>

          <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Txt v="bodyMedium">Total</Txt>
              <Txt v="bodyMedium">{money(subtotal + tax)}</Txt>
            </View>
            <Button label="Check out" icon="lock" onPress={() => router.push('/confirmed')} />
          </View>
        </>
      )}
    </View>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Txt v="small">{label}</Txt>
      <Txt v="small" style={{ color: C.text }}>{value}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S.xxl },
  figure: { width: 280, height: 224, marginBottom: S.md },
  onEmerald: { marginTop: 20, backgroundColor: C.canvas, borderColor: C.canvas },
  banner: { flexDirection: 'row', gap: 10, alignItems: 'center', marginHorizontal: S.gutter, marginTop: S.sm, padding: S.md, borderRadius: R.md, backgroundColor: C.accentSoft },
  storeHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: S.gutter, paddingBottom: 6 },
  line: { flexDirection: 'row', gap: 14, paddingHorizontal: S.gutter, paddingVertical: 12 },
  thumb: { width: 76, height: 76, borderRadius: R.md, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 3 },
  qtyBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: S.gutter,
    paddingTop: 12,
    backgroundColor: C.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.line,
  },
});
