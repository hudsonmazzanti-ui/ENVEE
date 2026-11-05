import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Divider, IconName, TopBar, Txt } from '@/components/ui';
import { spaceTotal, useStore } from '@/state/store';
import { C, R, S, money } from '@/theme';

export default function Profile() {
  const { state } = useStore();
  const budget = 6500;
  const planned = state.spaces.reduce((s, sp) => s + spaceTotal(sp), 0);
  const pct = Math.min(1, planned / budget);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar left={<Txt v="heading" style={{ marginLeft: 8 }}>You</Txt>} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.head}>
          <View style={styles.avatar}>
            <Txt v="heading" style={{ color: C.accent }}>MC</Txt>
          </View>
          <View style={{ flex: 1 }}>
            <Txt v="heading">Maya Chen</Txt>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat n={String(state.spaces.length)} label="Spaces" />
          <View style={styles.vr} />
          <Stat n={String(state.saved.length)} label="Saved" />
          <View style={styles.vr} />
          <Stat n="Aug 15" label="Move-in" />
        </View>

        <View style={styles.budget}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Txt v="eyebrow">Budget</Txt>
              <Txt v="heading" style={{ marginTop: 6 }}>
                {money(planned)} <Txt v="small">/ {money(budget)}</Txt>
              </Txt>
            </View>
            <Txt v="small" style={{ color: C.text, textDecorationLine: 'underline' }}>Edit</Txt>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct * 100}%` }]} />
          </View>
        </View>

        <View style={{ paddingHorizontal: S.gutter, marginTop: S.lg }}>
          <Item icon="shopping-bag" label="Stores" />
          <Divider />
          <Item icon="calendar" label="Move-in" detail="Aug 15" />
          <Divider />
          <Item icon="bell" label="Alerts" />
          <Divider />
          <Item icon="users" label="Roommates" />
          <Divider />
          <Item icon="help-circle" label="Help" />
          <Divider />
          <Item icon="log-out" label="Sign out" onPress={() => router.replace('/')} />
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Txt v="heading">{n}</Txt>
      <Txt v="small" style={{ fontSize: 12 }}>{label}</Txt>
    </View>
  );
}

function Item({ icon, label, detail, onPress }: { icon: IconName; label: string; detail?: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.item, pressed && { opacity: 0.6 }]}>
      <Feather name={icon} size={18} color={C.text} />
      <Txt v="body" style={{ flex: 1 }}>{label}</Txt>
      {detail ? <Txt v="small">{detail}</Txt> : null}
      <Feather name="chevron-right" size={16} color={C.text3} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: S.lg, paddingHorizontal: S.gutter, paddingTop: S.md },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  stats: {
    flexDirection: 'row',
    marginHorizontal: S.gutter,
    marginTop: S.xl,
    paddingVertical: S.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
  },
  vr: { width: StyleSheet.hairlineWidth, backgroundColor: C.line },
  budget: { margin: S.gutter, marginTop: S.xl, padding: S.lg, borderRadius: R.lg, backgroundColor: C.canvas, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  track: { height: 6, borderRadius: 3, backgroundColor: C.line, marginTop: 14, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: C.accent },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
});

