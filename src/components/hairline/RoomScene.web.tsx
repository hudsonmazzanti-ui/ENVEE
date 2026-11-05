import { useEffect, useRef } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { roomSceneHtml } from './roomSceneHtml';

type Props = {
  /** Called on a tap, or when a left-to-right drag gets 70% of the way across. */
  onOpen: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Web: the same page in a sandboxed iframe, talking back with postMessage. */
export function RoomScene({ onOpen, style }: Props) {
  const frame = useRef<HTMLIFrameElement>(null);
  const open = useRef(onOpen);
  open.current = onOpen;

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      const m = (e.data as { hairline?: string } | null)?.hairline;
      if (m === 'open' || m === 'tap') open.current();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <View style={style}>
      <iframe
        ref={frame}
        title="Your living room"
        srcDoc={roomSceneHtml}
        sandbox="allow-scripts"
        style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </View>
  );
}
