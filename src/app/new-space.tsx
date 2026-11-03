import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, IconName, TopBar, Txt } from '@/components/ui';
import { newSpaceId, useStore } from '@/state/store';
import { C, R, S } from '@/theme';
import { art } from '@/theme/assets';

// Fake "start a space" flow. No camera or uploads: each option creates a sample room.
export default function NewSpace() {
  const { dispatch } = useStore();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState<string | null>(null);

  const create = (key: string, kind: 'photo' | 'listing', name: string, subtitle: string) => {
    setBusy(key);
    setTimeout(() => {
      const id = newSpaceId();
      dispatch({
        t: 'space/add',
        space: { id, name, kind, subtitle, image: kind === 'listing' ? 'room_listing' : 'room_studio', edited: 'Just now', stickers: [] },
      });
      router.replace(`/room/${id}`);
    }, 900);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar left={<BackButton icon="x" />} title="New space" />
      <ScrollView contentContainerStyle={{ padding: S.gutter, paddingBottom: insets.bottom + 32 }}>
        <Txt v="title">Where are we decorating?</Txt>
        <Txt v="body" style={{ color: C.text2, marginTop: 8 }}>Start from a photo of a room you live in, or a place you're thinking of renting.</Txt>

        <Option
          icon="camera"
          title="Photo of my room"
          body="Take a photo or choose one from your library. Straight-on works best."
          image="room_studio"
          busy={busy === 'photo'}
          onPress={() => create('photo', 'photo', 'Studio corner', 'Your photo')}
        />
        <Option
          icon="link"
          title="A rental listing"
          body="Paste a listing link and pick a photo. See it furnished before you sign."
          image="room_listing"
          busy={busy === 'listing'}
          onPress={() => create('listing', 'listing', '88 Grand St, 5R', 'Rental listing · Studio')}
        />

        <View style={styles.note}>
          <Feather name="lock" size={14} color={C.text2} />
          <Txt v="small" style={{ flex: 1 }}>Your photos stay private unless you choose to share a space.</Txt>
        </View>
      </ScrollView>
    </View>
  );
}

function Option({ icon, title, body, image, onPress, busy }: { icon: IconName; title: string; body: string; image: 'room_studio' | 'room_listing'; onPress: () => void; busy: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.option, pressed && { backgroundColor: C.canvas }]}>
      <Image source={art[image]} style={styles.optionImg} contentFit="cover" />
      <View style={{ flex: 1, padding: S.lg, justifyContent: 'center' }}>
        <View style={styles.iconCircle}>
          <Feather name={icon} size={16} color={C.accent} />
        </View>
        <Txt v="heading" style={{ marginTop: 10, fontSize: 20 }}>{title}</Txt>
        <Txt v="small" style={{ marginTop: 4 }}>{body}</Txt>
      </View>
      {busy ? (
        <View style={styles.busy}>
          <ActivityIndicator color={C.accent} />
          <Txt v="small" style={{ marginTop: 8, color: C.text }}>Preparing your space…</Txt>
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
    minHeight: 168,
  },
  optionImg: { width: 116 },
  iconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  busy: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  note: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: S.xxl, justifyContent: 'center' },
});
