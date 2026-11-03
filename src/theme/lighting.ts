// Approximate "match the room's light" presets. Each one lays a tinted copy of the
// sticker over itself (only the furniture pixels are tinted, not the room).
export type Light = 'off' | 'warm' | 'day' | 'dusk';

export const LIGHTS: Record<Light, { label: string; color: string; opacity: number }> = {
  off: { label: 'Off', color: '#000000', opacity: 0 },
  warm: { label: 'Warm', color: '#E8A04A', opacity: 0.22 },
  day: { label: 'Daylight', color: '#BFD3EA', opacity: 0.2 },
  dusk: { label: 'Dusk', color: '#2B2433', opacity: 0.3 },
};

export const LIGHT_ORDER: Light[] = ['off', 'warm', 'day', 'dusk'];
