import React, { createContext, useContext, useMemo, useReducer } from 'react';
import type { ImageSource } from 'expo-image';

import { productById } from '@/data/catalog';
import { art, type ArtKey } from '@/theme/assets';
import type { Light } from '@/theme/lighting';

// In-memory fake state so the mockup feels clickable. Nothing persists.
export type Placed = { uid: string; productId: string; x: number; y: number; size: number };
export type Space = {
  id: string;
  name: string;
  kind: 'photo' | 'listing';
  subtitle: string;
  image: ArtKey;
  /** A photo the user picked or took. Overrides `image` when set. */
  photoUri?: string;
  /** Lighting preset applied to the furniture so it sits better in the photo. */
  light: Light;
  edited: string;
  stickers: Placed[];
};

type State = {
  bag: Record<string, number>;
  saved: string[];
  spaces: Space[];
};

let n = 100;
const uid = () => `u${n++}`;
const st = (productId: string, x: number, y: number, size: number): Placed => ({ uid: uid(), productId, x, y, size });

const initial: State = {
  bag: { artprint: 1, pendant: 2 },
  saved: ['sofa', 'mirror', 'floorlamp', 'rug', 'armchair', 'bed'],
  spaces: [
    {
      id: 'bedroom',
      name: 'My bedroom',
      kind: 'photo',
      subtitle: 'Your photo',
      image: 'room_bedroom',
      light: 'warm',
      edited: 'Edited 2h ago',
      stickers: [
        st('bed', 0.5, 0.71, 0.72),
        st('pendant', 0.5, 0.17, 0.26),
        st('sidetable', 0.12, 0.77, 0.2),
        st('tablelamp', 0.12, 0.64, 0.2),
        st('plant', 0.88, 0.72, 0.3),
      ],
    },
    {
      id: 'atlantic',
      name: '412 Atlantic Ave, 3F',
      kind: 'listing',
      subtitle: 'Rental listing · 2 bed',
      image: 'room_listing',
      light: 'day',
      edited: 'Edited yesterday',
      stickers: [
        st('rug', 0.5, 0.85, 0.72),
        st('sofa', 0.5, 0.7, 0.62),
        st('floorlamp', 0.83, 0.55, 0.42),
        st('artprint', 0.5, 0.38, 0.24),
      ],
    },
    {
      id: 'living',
      name: 'Living room',
      kind: 'photo',
      subtitle: 'Your photo',
      image: 'room_living',
      light: 'warm',
      edited: 'Edited Sunday',
      stickers: [st('armchair', 0.3, 0.73, 0.36), st('plant', 0.82, 0.72, 0.3)],
    },
  ],
};

type Action =
  | { t: 'bag/add'; id: string; qty?: number }
  | { t: 'bag/set'; id: string; qty: number }
  | { t: 'bag/clear' }
  | { t: 'save/toggle'; id: string }
  | { t: 'space/add'; space: Space }
  | { t: 'space/photo'; spaceId: string; uri: string }
  | { t: 'space/light'; spaceId: string; light: Light }
  | { t: 'sticker/add'; spaceId: string; productId: string }
  | { t: 'sticker/move'; spaceId: string; uid: string; x: number; y: number }
  | { t: 'sticker/resize'; spaceId: string; uid: string; factor: number }
  | { t: 'sticker/front'; spaceId: string; uid: string }
  | { t: 'sticker/remove'; spaceId: string; uid: string };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function mapSpace(s: State, id: string, fn: (sp: Space) => Space): State {
  return { ...s, spaces: s.spaces.map((sp) => (sp.id === id ? { ...fn(sp), edited: 'Edited just now' } : sp)) };
}

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'bag/add':
      return { ...s, bag: { ...s.bag, [a.id]: (s.bag[a.id] ?? 0) + (a.qty ?? 1) } };
    case 'bag/set': {
      const bag = { ...s.bag };
      if (a.qty <= 0) delete bag[a.id];
      else bag[a.id] = a.qty;
      return { ...s, bag };
    }
    case 'bag/clear':
      return { ...s, bag: {} };
    case 'save/toggle':
      return {
        ...s,
        saved: s.saved.includes(a.id) ? s.saved.filter((x) => x !== a.id) : [a.id, ...s.saved],
      };
    case 'space/add':
      return { ...s, spaces: [a.space, ...s.spaces] };
    case 'space/light':
      return mapSpace(s, a.spaceId, (sp) => ({ ...sp, light: a.light }));
    case 'space/photo':
      return mapSpace(s, a.spaceId, (sp) => ({ ...sp, photoUri: a.uri }));
    case 'sticker/add':
      return mapSpace(s, a.spaceId, (sp) => ({
        ...sp,
        stickers: [...sp.stickers, st(a.productId, 0.5, 0.62, a.productId === 'rug' ? 0.6 : 0.4)],
      }));
    case 'sticker/move':
      return mapSpace(s, a.spaceId, (sp) => ({
        ...sp,
        stickers: sp.stickers.map((x) => (x.uid === a.uid ? { ...x, x: clamp(a.x, 0, 1), y: clamp(a.y, 0, 1) } : x)),
      }));
    case 'sticker/resize':
      return mapSpace(s, a.spaceId, (sp) => ({
        ...sp,
        stickers: sp.stickers.map((x) => (x.uid === a.uid ? { ...x, size: clamp(x.size * a.factor, 0.1, 1) } : x)),
      }));
    case 'sticker/front':
      return mapSpace(s, a.spaceId, (sp) => {
        const item = sp.stickers.find((x) => x.uid === a.uid);
        return item ? { ...sp, stickers: [...sp.stickers.filter((x) => x.uid !== a.uid), item] } : sp;
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

export const spaceSource = (sp: Space): ImageSource | number => (sp.photoUri ? { uri: sp.photoUri } : art[sp.image]);

export const spaceTotal = (sp: Space) => sp.stickers.reduce((sum, x) => sum + productById(x.productId).price, 0);

export const bagCount = (s: State) => Object.values(s.bag).reduce((a, b) => a + b, 0);

export const newSpaceId = () => `space${n++}`;
