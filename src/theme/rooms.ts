import { art } from '@/theme/assets';

/**
 * The line-art rooms a space or look uses until there is a real photo: the four empty rooms a new space starts on,
 * and furnished copies of them for the sample spaces and the looks, their furniture drawn in the room's own view.
 */
export type RoomKey =
  | 'room_living' | 'room_bedroom' | 'room_studio' | 'room_listing'
  | 'space_bedroom' | 'space_listing' | 'space_living'
  | 'look_emerald' | 'look_warm' | 'look_gallery' | 'look_first' | 'look_savannah';

/**
 * A line-art room. Its strokes scale with the image, so below SMALL points wide this returns the copy
 * drawn with heavier lines, which keeps thumbnails as crisp as the full-width editor.
 */
export const SMALL = 220;
export const roomArt = (key: RoomKey, width = Infinity) => (width < SMALL ? art[`${key}_sm`] : art[key]);
