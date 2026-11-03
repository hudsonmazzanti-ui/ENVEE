import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RoomCanvas, ROOM_RATIO } from '@/components/RoomCanvas';
import { useFrameWidth } from '@/components/useFrameWidth';
import { BackButton, Button, IconButton, IconName, TopBar, Txt } from '@/components/ui';
import { productById } from '@/data/catalog';
import { spaceTotal, useStore } from '@/state/store';
import { C, F, R, S, money, shadow } from '@/theme';
import { art } from '@/theme/assets';

export default function RoomEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useStore();
  const insets = useSafeAreaInsets();
  const W = useFrameWidth();
  const space = state.spaces.find((s) => s.id === id) ?? state.spaces[0];
  const [selected, setSelected] = useState<string | null>(null);
  const [compare, setCompare] = useState(false);
  const [dragging, setDragging] = useState(false);

  const sel = space.stickers.find((s) => s.uid === selected);
  const selProduct = sel ? productById(sel.productId) : null;
  const canvasH = W * ROOM_RATIO;

  const act = (t: 'sticker/front' | 'sticker/remove') => {
    if (!sel) return;
    dispatch({ t, spaceId: space.id, uid: sel.uid });
    if (t === 'sticker/remove') setSelected(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar
        left={<BackButton />}
        title={
          <Txt v="bodyMedium" numberOfLines={1}>{space.name}</Txt>
        }
        right={
          <>
            <IconButton name={compare ? 'eye-off' : 'eye'} label="Compare with original" onPress={() => { setCompare((c) => !c); setSelected(null); }} />
            <IconButton name="share" label="Share" />
          </>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }} showsVerticalScrollIndicator={false} scrollEnabled={!dragging}>
        <View>
          <RoomCanvas
            space={compare ? { ...space, stickers: [] } : space}
            width={W}
            selected={selected}
            onSelect={setSelected}
            onMove={(uid, x, y) => dispatch({ t: 'sticker/move', spaceId: space.id, uid, x, y })}
            onDragChange={setDragging}
          />
          {compare ? (
            <View style={styles.compareTag}>
              <Txt v="eyebrow" style={{ color: C.text }}>Original</Txt>
            </View>
          ) : null}

          {sel && selProduct ? (
            <View style={[styles.selCard, shadow, { top: Math.min(canvasH - 150, 16) }]}>
              <Pressable style={styles.selInfo} onPress={() => router.push(`/product/${selProduct.id}`)}>
                <View style={styles.selThumb}>
                  <Image source={art[selProduct.photo]} style={{ width: 40, height: 40 }} contentFit="contain" />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt v="body" style={{ fontSize: 14 }} numberOfLines={1}>{selProduct.name}</Txt>
                  <Txt v="small" style={{ fontSize: 12 }}>{money(selProduct.price)}</Txt>
                </View>
                <Feather name="chevron-right" size={18} color={C.text3} />
              </Pressable>
              <View style={styles.tools}>
                <Tool icon="minus" label="Smaller" onPress={() => dispatch({ t: 'sticker/resize', spaceId: space.id, uid: sel.uid, factor: 0.88 })} />
                <Tool icon="plus" label="Larger" onPress={() => dispatch({ t: 'sticker/resize', spaceId: space.id, uid: sel.uid, factor: 1.12 })} />
                <Tool icon="layers" label="Front" onPress={() => act('sticker/front')} />
                <Tool icon="trash-2" label="Remove" onPress={() => act('sticker/remove')} />
              </View>
            </View>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: S.gutter, paddingTop: S.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: S.md }}>
            <Txt v="heading" style={{ flex: 1 }}>{space.stickers.length} pieces</Txt>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: S.gutter, gap: 10 }}>
          <Pressable onPress={() => router.push(`/paste?space=${space.id}`)} style={[styles.trayItem, styles.pasteTile]}>
            <Feather name="link-2" size={20} color={C.white} />
            <Txt v="small" style={{ color: C.white, fontFamily: F.medium, fontSize: 12, marginTop: 6 }}>Paste</Txt>
          </Pressable>
          {space.stickers.map((s) => {
            const p = productById(s.productId);
            const on = s.uid === selected;
            return (
              <Pressable key={s.uid} onPress={() => setSelected(on ? null : s.uid)} style={[styles.trayItem, on && { borderColor: C.accent, borderWidth: 1.5 }]}>
                <Image source={art[p.photo]} style={{ width: 54, height: 54 }} contentFit="contain" />
                <Txt v="small" style={{ fontSize: 11, color: C.text }}>{money(p.price)}</Txt>
              </Pressable>
            );
          })}
        </ScrollView>

      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={{ flex: 1 }}>
          <Txt v="heading" style={{ fontSize: 24 }}>{money(spaceTotal(space))}</Txt>
        </View>
        <Button label="Shop this room" onPress={() => router.push(`/room/${space.id}/shop`)} />
      </View>
    </View>
  );
}

function Tool({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tool, pressed && { backgroundColor: C.surface }]}>
      <Feather name={icon} size={16} color={label === 'Remove' ? C.danger : C.text} />
      <Txt v="small" style={{ fontSize: 11, color: label === 'Remove' ? C.danger : C.text }}>{label}</Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hint: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  compareTag: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  selCard: {
    position: 'absolute',
    left: 12,
    right: 12,
    backgroundColor: C.bg,
    borderRadius: R.md,
    padding: 10,
  },
  selInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  tools: { flexDirection: 'row', marginTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line, paddingTop: 6 },
  tool: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 6, borderRadius: 8 },
  trayItem: {
    width: 76,
    height: 86,
    borderRadius: R.md,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pasteTile: { backgroundColor: C.accent },
  browseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: S.gutter,
    marginTop: S.xl,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: S.gutter,
    paddingTop: 12,
    backgroundColor: C.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.line,
  },
});
