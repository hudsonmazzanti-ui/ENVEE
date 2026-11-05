import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LookThumb } from '@/components/SpaceThumb';
import { useFrameWidth } from '@/components/useFrameWidth';
import { BackButton, Button, Divider, HeartButton, TopBar, Txt } from '@/components/ui';
import { lookById, lookProducts } from '@/data/catalog';
import { newSpaceId, useStore } from '@/state/store';
import { C, R, S, money } from '@/theme';
import { art } from '@/theme/assets';

export default function LookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const look = lookById(id);
  const { dispatch } = useStore();
  const insets = useSafeAreaInsets();
  const W = useFrameWidth();
  const items = lookProducts(look);

  // Starts a space on the look's furnished room. Pasted pieces go on top.
  const tryIt = () => {
    const sid = newSpaceId();
    dispatch({
      t: 'space/add',
      space: {
        id: sid,
        name: `${look.title}, my way`,
        kind: 'photo',
        subtitle: 'Your photo',
        image: look.backdrop,
        edited: 'Just now',
        stickers: [],
      },
    });
    router.push(`/room/${sid}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar left={<BackButton />} right={<><Feather name="share" size={20} color={C.text} style={{ padding: 10 }} /></>} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <LookThumb look={look} width={W} height={W * 1.25} />
        <View style={{ padding: S.gutter }}>
          <Txt v="title">{look.title}</Txt>
          <Txt v="small" style={{ marginTop: 6 }}>{look.author}</Txt>
        </View>
        <Divider style={{ marginHorizontal: S.gutter }} />
        {items.map((p) => (
          <Pressable key={p.id} onPress={() => router.push(`/product/${p.id}`)} style={styles.row}>
            <View style={styles.thumb}>
              <Image source={art[p.photo]} style={{ width: 54, height: 54 }} contentFit="contain" />
            </View>
            <View style={{ flex: 1 }}>
              <Txt v="body" style={{ fontSize: 14 }} numberOfLines={1}>{p.name}</Txt>
              <Txt v="price" style={{ marginTop: 2 }}>{money(p.price)}</Txt>
            </View>
            <HeartButton id={p.id} />
          </Pressable>
        ))}
      </ScrollView>
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Button label="Try it in a room" icon="image" onPress={tryIt} style={{ flex: 1, paddingHorizontal: 12 }} />
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
