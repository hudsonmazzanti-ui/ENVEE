import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, View } from 'react-native';

import { pieceLayout, PieceImage } from '@/components/PieceImage';
import { geometryFor, paintOrder, unproject } from '@/lib/roomSpace';
import { Placed, Space, spaceSource } from '@/state/store';
import { C } from '@/theme';
import type { RoomGeometry } from '@/theme/roomGeometry';

export const ROOM_RATIO = 4 / 3; // height / width of the room images

type Props = {
  space: Space;
  width: number;
  selected?: string | null;
  onSelect?: (uid: string | null) => void;
  /** A piece was dragged: its new floor point, in inches. */
  onMove?: (uid: string, fx: number, fy: number) => void;
  interactive?: boolean;
  onDragChange?: (dragging: boolean) => void;
};

/**
 * The room editor's canvas: the room, and every placed piece standing on its floor point at its real size, painted
 * back to front. Dragging moves a piece across the floor; it lands where the finger lets go.
 */
export function RoomCanvas({ space, width, selected, onSelect, onMove, interactive = true, onDragChange }: Props) {
  const height = width * ROOM_RATIO;
  const g = geometryFor(space.image);
  return (
    <View style={{ width, height, backgroundColor: C.surface, overflow: 'hidden' }}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => onSelect?.(null)} disabled={!interactive}>
        <Image source={spaceSource(space, width)} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      </Pressable>
      {paintOrder(space.stickers).map((s) => (
        <PieceView
          key={s.uid}
          s={s}
          g={g}
          W={width}
          selected={selected === s.uid}
          interactive={interactive}
          onSelect={() => onSelect?.(s.uid)}
          onMove={(fx, fy) => onMove?.(s.uid, fx, fy)}
          onDrag={(d) => onDragChange?.(d)}
        />
      ))}
    </View>
  );
}

function PieceView({
  s,
  g,
  W,
  selected,
  interactive,
  onSelect,
  onMove,
  onDrag,
}: {
  s: Placed;
  g: RoomGeometry;
  W: number;
  selected: boolean;
  interactive: boolean;
  onSelect: () => void;
  onMove: (fx: number, fy: number) => void;
  onDrag: (dragging: boolean) => void;
}) {
  const box = pieceLayout(g, W, s);
  const pan = useRef(new Animated.ValueXY()).current;
  // Keep latest values for the responder without recreating it.
  const latest = useRef({ box, g, W, onSelect, onMove, onDrag });
  latest.current = { box, g, W, onSelect, onMove, onDrag };

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
      onPanResponderRelease: (_, d) => {
        const { box: b, g: geo, W: w } = latest.current;
        latest.current.onDrag(false);
        // The anchor moved with the finger: read the floor point under its new place. The offset resets once the
        // new position renders (see the effect below).
        if (Math.abs(d.dx) > 2 || Math.abs(d.dy) > 2) {
          const px = w / geo.view[0];
          const [fx, fy] = unproject(geo, (b.anchor[0] + d.dx) / px, (b.anchor[1] + d.dy) / px);
          latest.current.onMove(fx, fy);
        } else pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderTerminate: () => {
        pan.setValue({ x: 0, y: 0 });
        latest.current.onDrag(false);
      },
    }),
  ).current;

  useEffect(() => {
    pan.setValue({ x: 0, y: 0 });
  }, [s.fx, s.fy, pan]);

  return (
    <Animated.View
      {...(interactive ? responder.panHandlers : {})}
      style={[
        styles.piece,
        { width: box.width, height: box.height, left: box.left, top: box.top, transform: pan.getTranslateTransform() },
      ]}>
      <PieceImage source={box.source} mirror={box.mirror} />
      {selected ? (
        <View pointerEvents="none" style={styles.selection}>
          <View style={[styles.anchor, { left: box.anchor[0] - box.left - 4, top: box.anchor[1] - box.top - 4 }]} />
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', cursor: 'grab' } as object,
  selection: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1.5,
    borderColor: C.accent,
    borderStyle: 'dashed',
    borderRadius: 6,
  },
  // Where the piece stands: its floor anchor.
  anchor: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accent,
  },
});
