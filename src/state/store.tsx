import React, { createContext, useContext, useMemo, useReducer } from 'react';
import type { ImageSource } from 'expo-image';

import { pick, productById } from '@/data/catalog';
import { clampToFloor, geometryFor, startPointFor } from '@/lib/roomSpace';
import { roomArt, type RoomKey } from '@/theme/rooms';

// In-memory fake state so the mockup feels clickable. Nothing persists.
/**
 * A piece placed in a room: where it stands on the floor, in inches (fx across, fy out from the back wall), and
 * whether it is mirrored to face the other wall. Its size comes from its real dimensions (src/lib/roomSpace.ts).
 * `front`, when set, lifts it over pieces it would otherwise sort behind.
 */
export type Placed = { uid: string; productId: string; fx: number; fy: number; mirror: boolean; front?: number };
export type Space = {
  id: string;
  name: string;
  kind: 'photo' | 'listing';
  subtitle: string;
  /** The line-art room shown until there is a photo. The samples start furnished in line art, with no pieces placed. */
  image: RoomKey;
  /** A photo the user picked or took. Overrides `image` when set. */
  photoUri?: string;
  edited: string;
  stickers: Placed[];
};

type State = {
  saved: string[];
  spaces: Space[];
};

let n = 100;
const uid = () => `u${n++}`;

const initial: State = {
  saved: [pick.sofa, pick.chair, 'mirror', pick.lamp, 'pendant'],
  spaces: [
    {
      id: 'bedroom',
      name: 'My bedroom',
      kind: 'photo',
      subtitle: 'Your photo',
      image: 'space_bedroom',
      edited: 'Edited 2h ago',
      stickers: [],
    },
    {
      id: 'atlantic',
      name: '412 Atlantic Ave, 3F',
      kind: 'listing',
      subtitle: 'Rental listing · 2 bed',
      image: 'space_listing',
      edited: 'Edited yesterday',
      stickers: [],
    },
    {
      id: 'living',
      name: 'Living room',
      kind: 'photo',
      subtitle: 'Your photo',
      image: 'space_living',
      edited: 'Edited Sunday',
      stickers: [],
    },
  ],
};

type Action =
  | { t: 'save/toggle'; id: string }
  | { t: 'space/add'; space: Space }
  | { t: 'space/photo'; spaceId: string; uri: string }
  | { t: 'sticker/add'; spaceId: string; productId: string }
  | { t: 'sticker/move'; spaceId: string; uid: string; fx: number; fy: number }
  | { t: 'sticker/flip'; spaceId: string; uid: string }
  | { t: 'sticker/front'; spaceId: string; uid: string }
  | { t: 'sticker/remove'; spaceId: string; uid: string };

function mapSpace(s: State, id: string, fn: (sp: Space) => Space): State {
  return { ...s, spaces: s.spaces.map((sp) => (sp.id === id ? { ...fn(sp), edited: 'Edited just now' } : sp)) };
}

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'save/toggle':
      return {
        ...s,
        saved: s.saved.includes(a.id) ? s.saved.filter((x) => x !== a.id) : [a.id, ...s.saved],
      };
    case 'space/add':
      return { ...s, spaces: [a.space, ...s.spaces] };
    case 'space/photo':
      return mapSpace(s, a.spaceId, (sp) => ({ ...sp, photoUri: a.uri }));
    case 'sticker/add':
      return mapSpace(s, a.spaceId, (sp) => {
        const [fx, fy] = startPointFor(geometryFor(sp.image), a.productId, productById(a.productId).kind, sp.stickers);
        return { ...sp, stickers: [...sp.stickers, { uid: uid(), productId: a.productId, fx, fy, mirror: false }] };
      });
    case 'sticker/move':
      return mapSpace(s, a.spaceId, (sp) => {
        const [fx, fy] = clampToFloor(geometryFor(sp.image), a.fx, a.fy);
        return { ...sp, stickers: sp.stickers.map((x) => (x.uid === a.uid ? { ...x, fx, fy } : x)) };
      });
    case 'sticker/flip':
      return mapSpace(s, a.spaceId, (sp) => ({ ...sp, stickers: sp.stickers.map((x) => (x.uid === a.uid ? { ...x, mirror: !x.mirror } : x)) }));
    case 'sticker/front':
      return mapSpace(s, a.spaceId, (sp) => {
        const top = Math.max(0, ...sp.stickers.map((x) => x.front ?? 0)) + 1;
        return { ...sp, stickers: sp.stickers.map((x) => (x.uid === a.uid ? { ...x, front: top } : x)) };
      });
    case 'sticker/remove':
      return mapSpace(s, a.spaceId, (sp) => ({ ...sp, stickers: sp.stickers.filter((x) => x.uid !== a.uid) }));
  }
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('StoreProvider missing');
  return v;
}

/** The space's photo, or its line-art room. Pass the display width so small thumbnails get the heavier-line copy. */
export const spaceSource = (sp: Space, width?: number): ImageSource | number => (sp.photoUri ? { uri: sp.photoUri } : roomArt(sp.image, width));

export const spaceTotal = (sp: Space) => sp.stickers.reduce((sum, x) => sum + productById(x.productId).price, 0);


export const newSpaceId = () => `space${n++}`;
