import { Platform, useWindowDimensions } from 'react-native';

/** Width of the app column (the web build is capped to a phone-width column). */
export function useFrameWidth() {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' ? Math.min(width, 460) : width;
}
