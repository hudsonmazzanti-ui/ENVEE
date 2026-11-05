import { art } from '@/theme/assets';

/** The line-art rooms a space or look uses until there is a real photo. */
export type RoomKey = 'room_living' | 'room_bedroom' | 'room_studio' | 'room_listing';

/**
 * A line-art room. Its strokes scale with the image, so below SMALL points wide this returns the copy
 * drawn with heavier lines, which keeps thumbnails as crisp as the full-width editor.
 */
export const SMALL = 220;
export const roomArt = (key: RoomKey, width = Infinity) => (width < SMALL ? art[`${key}_sm`] : art[key]);
