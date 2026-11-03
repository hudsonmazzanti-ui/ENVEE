import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, IconName, TopBar, Txt } from '@/components/ui';
import { pickRoomPhoto } from '@/lib/pickPhoto';
import { newSpaceId, Space, useStore } from '@/state/store';
import { C, R, S } from '@/theme';
import { art } from '@/theme/assets';

// Start a space from the phone's camera roll or camera. The rental-listing option is still a sample.
export default function NewSpace() {
  const { state, dispatch } = useStore();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState<string | null>(null);

  const add = (space: Omit<Space, 'id' | 'edited' | 'stickers'>) => {
    const id = newSpaceId();
    dispatch({ t: 'space/add', space: { ...space, id, edited: 'Just now', stickers: [] } });
    router.replace(`/room/${id}`);
  };

  const fromPhone = async (from: 'library' | 'camera') => {
    const uri = await pickRoomPhoto(from);
    if (!uri) return;
    const n = state.spaces.filter((s) => s.kind === 'photo').length + 1;
    add({ name: `Room ${n}`, kind: 'photo', subtitle: 'Your photo', image: 'room_studio', photoUri: uri });
  };

  const sampleListing = () => {
    setBusy('listing');
    setTimeout(() => add({ name: '88 Grand St, 5R', kind: 'listing', subtitle: 'Rental listing', image: 'room_listing' }), 900);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar left={<BackButton icon="x" />} />
      <ScrollView contentContainerStyle={{ padding: S.gutter, paddingBottom: insets.bottom + 32 }}>
        <Txt v="title">New space</Txt>

        <Option icon="image" title="Camera roll" image="room_bedroom" busy={false} onPress={() => fromPhone('library')} />
        <Option icon="camera" title="Take photo" image="room_studio" busy={false} onPress={() => fromPhone('camera')} />
        <Option icon="link" title="Rental listing" image="room_listing" busy={busy === 'listing'} onPress={sampleListing} />
      </ScrollView>
    </View>
  );
}

function Option({ icon, title, image, onPress, busy }: { icon: IconName; title: string; image: 'room_studio' | 'room_listing' | 'room_bedroom'; onPress: () => void; busy: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.option, pressed && { backgroundColor: C.canvas }]}>
      <Image source={art[image]} style={styles.optionImg} contentFit="cover" />
      <View style={{ flex: 1, padding: S.lg, justifyContent: 'center' }}>
        <View style={styles.iconCircle}>
          <Feather name={icon} size={16} color={C.accent} />
        </View>
        <Txt v="heading" style={{ marginTop: 10, fontSize: 20 }}>{title}</Txt>
      </View>
      {busy ? (
        <View style={styles.busy}>
          <ActivityIndicator color={C.accent} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    marginTop: S.xl,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.line,
    overflow: 'hidden',
    minHeight: 128,
  },
  optionImg: { width: 96 },
  iconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  busy: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  note: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: S.xxl, justifyContent: 'center' },
});
