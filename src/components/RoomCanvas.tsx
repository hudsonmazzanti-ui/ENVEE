import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, View } from 'react-native';

import { productById } from '@/data/catalog';
import { Placed, Space } from '@/state/store';
import { C } from '@/theme';
import { art } from '@/theme/assets';

export const ROOM_RATIO = 4 / 3; // height / width of room photos

type Props = {
  space: Space;
  width: number;
  selected?: string | null;
  onSelect?: (uid: string | null) => void;
  onMove?: (uid: string, x: number, y: number) => void;
  interactive?: boolean;
  onDragChange?: (dragging: boolean) => void;
};

export function RoomCanvas({ space, width, selected, onSelect, onMove, interactive = true, onDragChange }: Props) {
  const height = width * ROOM_RATIO;
  return (
    <View style={{ width, height, backgroundColor: C.surface, overflow: 'hidden' }}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => onSelect?.(null)} disabled={!interactive}>
        <Image source={art[space.image]} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      </Pressable>
      {space.stickers.map((s) => (
        <StickerView
          key={s.uid}
          s={s}
          W={width}
          H={height}
          selected={selected === s.uid}
          interactive={interactive}
          onSelect={() => onSelect?.(s.uid)}
          onMove={(x, y) => onMove?.(s.uid, x, y)}
          onDrag={(d) => onDragChange?.(d)}
        />
      ))}
    </View>
  );
}

function StickerView({
  s,
  W,
  H,
  selected,
  interactive,
  onSelect,
  onMove,
  onDrag,
}: {
  s: Placed;
  W: number;
  H: number;
  selected: boolean;
  interactive: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onDrag: (dragging: boolean) => void;
}) {
  const size = s.size * W;
  const pan = useRef(new Animated.ValueXY()).current;
  // Keep latest values for the responder without recreating it.
  const latest = useRef({ s, W, H, onSelect, onMove, onDrag });
  latest.current = { s, W, H, onSelect, onMove, onDrag };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        latest.current.onSelect();
        latest.current.onDrag(true);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        const { s: cur, W: w, H: h } = latest.current;
        latest.current.onDrag(false);
        // Commit the move; the offset resets once the new position renders (see effect below).
        if (Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2) latest.current.onMove(cur.x + g.dx / w, cur.y + g.dy / h);
        else pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderTerminate: () => {
        pan.setValue({ x: 0, y: 0 });
        latest.current.onDrag(false);
      },
    }),
  ).current;

  useEffect(() => {
    pan.setValue({ x: 0, y: 0 });
  }, [s.x, s.y, pan]);

  const product = productById(s.productId);
  return (
    <Animated.View
      {...(interactive ? responder.panHandlers : {})}
      style={[
        styles.sticker,
        {
          width: size,
          height: size,
          left: s.x * W - size / 2,
          top: s.y * H - size / 2,
          transform: pan.getTranslateTransform(),
        },
      ]}>
      <Image source={art[product.sticker]} style={{ width: '100%', height: '100%' }} contentFit="contain" />
      {selected ? (
        <View pointerEvents="none" style={styles.selection}>
          <View style={[styles.handle, { top: -5, left: -5 }]} />
          <View style={[styles.handle, { top: -5, right: -5 }]} />
          <View style={[styles.handle, { bottom: -5, left: -5 }]} />
          <View style={[styles.handle, { bottom: -5, right: -5 }]} />
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sticker: { position: 'absolute', cursor: 'grab' } as object,
  selection: {
    ...StyleSheet.absoluteFill,
    margin: '8%',
    borderWidth: 1.5,
    borderColor: C.accent,
    borderStyle: 'dashed',
    borderRadius: 6,
  },
  handle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.accent,
  },
});
