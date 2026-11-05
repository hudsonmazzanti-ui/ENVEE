import { StyleProp, ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

import { roomSceneHtml } from './roomSceneHtml';

type Props = {
  /** Called on a tap, or when a drag runs all the way from left to right. */
  onOpen: () => void;
  style?: StyleProp<ViewStyle>;
};

/** The Hairline room: an isometric line drawing that pulls apart in layers under the finger. */
export function RoomScene({ onOpen, style }: Props) {
  const onMessage = (e: WebViewMessageEvent) => {
    if (e.nativeEvent.data === 'open' || e.nativeEvent.data === 'tap') onOpen();
  };
  return (
    <WebView
      source={{ html: roomSceneHtml }}
      originWhitelist={['*']}
      onMessage={onMessage}
      scrollEnabled={false}
      bounces={false}
      nestedScrollEnabled
      overScrollMode="never"
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      style={[{ backgroundColor: 'transparent' }, style]}
    />
  );
}
