import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFrameWidth } from '@/components/useFrameWidth';
import { BackButton, BagButton, Button, Divider, HeartButton, TopBar, Txt } from '@/components/ui';
import { lookById, productById } from '@/data/catalog';
import { newSpaceId, useStore } from '@/state/store';
import { C, R, S, money } from '@/theme';
import { art } from '@/theme/assets';

export default function LookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const look = lookById(id);
  const { dispatch } = useStore();
  const insets = useSafeAreaInsets();
  const W = useFrameWidth();
  const items = look.productIds.map(productById);
  const total = items.reduce((s, p) => s + p.price, 0);

  const tryIt = () => {
    const sid = newSpaceId();
    const placements: Record<string, [number, number, number]> = {
      rug: [0.5, 0.86, 0.68], sofa: [0.5, 0.7, 0.62], bed: [0.5, 0.71, 0.72], dresser: [0.5, 0.66, 0.46],
      armchair: [0.32, 0.73, 0.36], floorlamp: [0.83, 0.55, 0.42], coffeetable: [0.5, 0.85, 0.34], plant: [0.15, 0.7, 0.3],
      artprint: [0.5, 0.36, 0.22], pendant: [0.5, 0.17, 0.24], sidetable: [0.6, 0.79, 0.17], tablelamp: [0.4, 0.47, 0.16],
      mirror: [0.82, 0.6, 0.36], bookshelf: [0.16, 0.54, 0.4], chair: [0.8, 0.75, 0.28],
    };
    dispatch({
      t: 'space/add',
      space: {
        id: sid,
        name: `${look.title}, my way`,
        kind: 'photo',
        subtitle: 'Your photo',
        image: 'room_studio',
        edited: 'Just now',
        stickers: items.map((p, i) => {
          const [x, y, size] = placements[p.id] ?? [0.5, 0.6, 0.3];
          return { uid: `${sid}-${i}`, productId: p.id, x, y, size };
        }),
      },
    });
    router.push(`/room/${sid}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar left={<BackButton />} right={<><Feather name="share" size={20} color={C.text} style={{ padding: 10 }} /><BagButton /></>} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <Image source={art[look.image]} style={{ width: W, height: W * 1.25 }} contentFit="cover" />
        <View style={{ padding: S.gutter }}>
          <Txt v="eyebrow">{look.room}</Txt>
          <Txt v="title" style={{ marginTop: 6 }}>{look.title}</Txt>
          <Txt v="small" style={{ marginTop: 6 }}>Styled by {look.author} · {items.length} pieces · {money(total)}</Txt>
        </View>
        <Divider style={{ marginHorizontal: S.gutter }} />
        {items.map((p) => (
          <Pressable key={p.id} onPress={() => router.push(`/product/${p.id}`)} style={styles.row}>
            <View style={styles.thumb}>
              <Image source={art[p.photo]} style={{ width: 54, height: 54 }} contentFit="contain" />
            </View>
            <View style={{ flex: 1 }}>
              <Txt v="eyebrow" style={{ fontSize: 10 }}>{p.retailer}</Txt>
              <Txt v="body" style={{ fontSize: 14 }} numberOfLines={1}>{p.name}</Txt>
              <Txt v="price" style={{ marginTop: 2 }}>{money(p.price)}</Txt>
            </View>
            <HeartButton id={p.id} />
          </Pressable>
        ))}
      </ScrollView>
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Button kind="secondary" label="Try in my room" icon="image" onPress={tryIt} style={{ flex: 1, paddingHorizontal: 12 }} />
        <Button
          label="Add all to bag"
          style={{ flex: 1, paddingHorizontal: 12 }}
          onPress={() => {
            items.forEach((p) => dispatch({ t: 'bag/add', id: p.id }));
            router.push('/bag');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: S.gutter, paddingVertical: 12 },
  thumb: { width: 64, height: 64, borderRadius: R.md, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
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
});
