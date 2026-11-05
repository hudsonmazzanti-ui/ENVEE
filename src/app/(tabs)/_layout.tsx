import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconName } from '@/components/ui';
import { C, F } from '@/theme';

const TABS: Record<string, { label: string; icon: IconName }> = {
  home: { label: 'Spaces', icon: 'home' },
  discover: { label: 'Discover', icon: 'compass' },
  saved: { label: 'Saved', icon: 'heart' },
  profile: { label: 'You', icon: 'user' },
};

function TabBar({ state, navigateToTab, insets }: BottomTabBarProps) {
  const items = state.routes.map((r, i) => ({ r, i }));
  const render = ({ r, i }: (typeof items)[number]) => {
    const meta = TABS[r.name];
    if (!meta) return null;
    const focused = state.index === i;
    return (
      <Pressable key={r.key} accessibilityRole="tab" accessibilityState={{ selected: focused }} onPress={() => navigateToTab(r.key)} style={styles.item}>
        <Feather name={meta.icon} size={21} color={focused ? C.accent : C.text3} />
        <Text style={[styles.label, { color: focused ? C.accent : C.text3 }]}>{meta.label}</Text>
      </Pressable>
    );
  };
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {items.slice(0, 2).map(render)}
      <View style={styles.item}>
        <Pressable accessibilityLabel="New space" onPress={() => router.push('/new-space')} style={({ pressed }) => [styles.plus, pressed && { backgroundColor: C.accentPressed }]}>
          <Feather name="plus" size={24} color={C.white} />
        </Pressable>
      </View>
      {items.slice(2).map(render)}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.bg } }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="saved" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.line,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { fontFamily: F.medium, fontSize: 10.5, letterSpacing: 0.3 },
  plus: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
  },
});
