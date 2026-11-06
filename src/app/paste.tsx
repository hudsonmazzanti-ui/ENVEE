import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Button, TopBar, Txt } from '@/components/ui';
import { productById, sampleLinks } from '@/data/catalog';
import { useStore } from '@/state/store';
import { C, F, R, S, money } from '@/theme';

type Phase = 'idle' | 'reading' | 'ready';

// Fake "paste a shopping link" flow: pretends to read the page and cut the product out.
export default function Paste() {
  const { space: spaceId } = useLocalSearchParams<{ space?: string }>();
  const { state, dispatch } = useStore();
  const insets = useSafeAreaInsets();
  const space = state.spaces.find((s) => s.id === spaceId) ?? state.spaces[0];
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [productId, setProductId] = useState(sampleLinks[0].productId);
  const fade = useRef(new Animated.Value(0)).current;

  const read = (link: (typeof sampleLinks)[number]) => {
    setUrl(link.url);
    setProductId(link.productId);
    setPhase('reading');
  };

  useEffect(() => {
    if (phase !== 'reading') return;
    const t = setTimeout(() => {
      setPhase('ready');
      fade.setValue(0);
      Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }, 1400);
    return () => clearTimeout(t);
  }, [phase, fade]);

  const product = productById(productId);

  const submitTyped = () => {
    const match = sampleLinks.find((l) => url && l.url.includes(url.trim())) ?? sampleLinks[Math.floor(Math.random() * sampleLinks.length)];
    read({ url: url || match.url, productId: match.productId });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar left={<BackButton icon="x" />} title="Add a piece" />
      <ScrollView contentContainerStyle={{ padding: S.gutter, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
        <Txt v="title">Paste a link.</Txt>

        <View style={styles.inputRow}>
          <Feather name="link-2" size={18} color={C.text3} />
          <TextInput
            value={url}
            onChangeText={(t) => { setUrl(t); if (phase !== 'idle') setPhase('idle'); }}
            placeholder="https://"
            placeholderTextColor={C.text3}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={submitTyped}
            style={styles.input}
          />
          {url ? (
            <Pressable onPress={() => { setUrl(''); setPhase('idle'); }} hitSlop={8}>
              <Feather name="x-circle" size={18} color={C.text3} />
            </Pressable>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Button small kind="secondary" icon="clipboard" label="Paste" onPress={() => read(sampleLinks[0])} style={{ flex: 1 }} />
          <Button small kind="dark" label="Find" onPress={submitTyped} />
        </View>

        {phase === 'reading' ? (
          <View style={styles.reading}>
            <ActivityIndicator color={C.accent} />
            <Txt v="bodyMedium" style={{ fontSize: 14, flex: 1 }}>Finding it…</Txt>
          </View>
        ) : null}

        {phase === 'ready' ? (
          <Animated.View style={[styles.result, { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
            <View style={styles.cutout}>
              <View style={styles.checker} />
              <Image source={product.sticker} style={{ width: '78%', height: '78%' }} contentFit="contain" />
              <View style={styles.cutTag}>
                <Feather name="scissors" size={11} color={C.accent} />
                <Txt v="small" style={{ fontSize: 11, color: C.accent, fontFamily: F.medium }}>Cut out</Txt>
              </View>
            </View>
            <View style={{ padding: S.lg }}>
              <Txt v="eyebrow">{product.retailer}</Txt>
              <Txt v="heading" style={{ marginTop: 6 }}>{product.name}</Txt>
              <Txt v="price" style={{ marginTop: 4 }}>{money(product.price)}</Txt>
              <Button label="Add to room" icon="plus" style={{ marginTop: S.lg }} onPress={() => {
                dispatch({ t: 'sticker/add', spaceId: space.id, productId: product.id });
                // Opened straight from a link (e.g. on web) there is no screen to go back to, so open the room.
                if (router.canGoBack()) router.back();
                else router.replace(`/room/${space.id}`);
              }} />
            </View>
          </Animated.View>
        ) : null}

        {phase === 'idle' ? (
          <View style={{ marginTop: S.xxl }}>
            <Txt v="eyebrow" style={{ marginBottom: 10 }}>Try one</Txt>
            {sampleLinks.map((l) => {
              const p = productById(l.productId);
              return (
                <Pressable key={l.url} onPress={() => read(l)} style={styles.sample}>
                  <View style={styles.sampleThumb}>
                    <Image source={p.photo} style={{ width: 36, height: 36 }} contentFit="contain" />
                  </View>
                  <Txt v="body" style={{ fontSize: 14, flex: 1 }} numberOfLines={1}>{p.name}</Txt>
                  <Feather name="arrow-up-left" size={16} color={C.text3} />
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    marginTop: S.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 54,
    paddingHorizontal: 16,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.canvas,
  },
  input: { flex: 1, fontFamily: F.body, fontSize: 15, color: C.text, height: '100%', outlineStyle: 'none' } as object,
  reading: {
    marginTop: S.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: S.lg,
    borderRadius: R.md,
    backgroundColor: C.accentSoft,
  },
  result: { marginTop: S.xl, borderRadius: R.lg, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  cutout: { height: 260, alignItems: 'center', justifyContent: 'center', backgroundColor: C.canvas },
  checker: {
    ...StyleSheet.absoluteFill,
    opacity: 0.5,
    backgroundColor: C.canvas,
  },
  cutTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.bg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  sample: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  sampleThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
});
