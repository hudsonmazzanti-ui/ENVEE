import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Product } from '@/data/catalog';
import { bagCount, useStore } from '@/state/store';
import { C, F, R, S, money } from '@/theme';
import { art } from '@/theme/assets';

export type IconName = React.ComponentProps<typeof Feather>['name'];

export function Wordmark({ size = 20, color = C.text, style }: { size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  return (
    <Text
      accessibilityRole="header"
      style={[{ fontFamily: F.wordmark, fontSize: size, letterSpacing: size * 0.42, color, paddingLeft: size * 0.42 }, style]}>
      ENVEE
    </Text>
  );
}

type TxtVariant = 'display' | 'title' | 'heading' | 'body' | 'bodyMedium' | 'small' | 'eyebrow' | 'price';

const variants: Record<TxtVariant, TextStyle> = {
  display: { fontFamily: F.display, fontSize: 30, lineHeight: 36 },
  title: { fontFamily: F.display, fontSize: 24, lineHeight: 30 },
  heading: { fontFamily: F.display, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: F.body, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: F.medium, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: F.body, fontSize: 13, lineHeight: 18, color: C.text2 },
  eyebrow: { fontFamily: F.medium, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: C.text3 },
  price: { fontFamily: F.medium, fontSize: 14, letterSpacing: 0.2 },
};

export function Txt({ v = 'body', style, ...rest }: TextProps & { v?: TxtVariant }) {
  return <Text {...rest} style={[{ color: C.text }, variants[v], style]} />;
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  icon,
  style,
  small,
}: {
  label: string;
  onPress?: () => void;
  kind?: 'primary' | 'secondary' | 'ghost' | 'dark';
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const fg = kind === 'primary' || kind === 'dark' ? C.white : C.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        small && { height: 40, paddingHorizontal: 16 },
        kind === 'primary' && { backgroundColor: pressed ? C.accentPressed : C.accent },
        kind === 'dark' && { backgroundColor: pressed ? '#000' : C.text },
        kind === 'secondary' && { backgroundColor: pressed ? C.surface : C.bg, borderWidth: 1, borderColor: C.line },
        kind === 'ghost' && { backgroundColor: pressed ? C.surface : 'transparent' },
        style,
      ]}>
      {icon ? <Feather name={icon} size={small ? 15 : 17} color={fg} /> : null}
      <Text style={{ color: fg, fontFamily: F.medium, fontSize: small ? 13 : 15, letterSpacing: 0.3 }}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({
  name,
  onPress,
  badge,
  color = C.text,
  bg,
  size = 22,
  label,
}: {
  name: IconName;
  onPress?: () => void;
  badge?: number;
  color?: string;
  bg?: string;
  size?: number;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? name}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.iconBtn, bg ? { backgroundColor: bg } : null, pressed && { opacity: 0.6 }]}>
      <Feather name={name} size={size} color={color} />
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function BagButton() {
  const { state } = useStore();
  return <IconButton name="shopping-bag" label="Bag" badge={bagCount(state)} onPress={() => router.push('/bag')} />;
}

export function TopBar({
  title,
  left,
  right,
  transparent,
}: {
  title?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  transparent?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.topBar, { paddingTop: insets.top + 6 }, !transparent && { backgroundColor: C.bg }]}>
      {/* With no centre title, the left side (e.g. a screen name) gets the full width so it never wraps. */}
      <View style={title ? styles.topSide : styles.topLeftWide}>{left ?? <View />}</View>
      {title ? (
        <View style={styles.topCenter}>{typeof title === 'string' ? <Txt v="bodyMedium" numberOfLines={1}>{title}</Txt> : title}</View>
      ) : null}
      <View style={[title ? styles.topSide : styles.topRightAuto, { alignItems: 'flex-end', justifyContent: 'flex-end' }]}>{right ?? <View />}</View>
    </View>
  );
}

export function BackButton({ icon = 'chevron-left' }: { icon?: IconName }) {
  return (
    <IconButton
      name={icon}
      label="Back"
      size={icon === 'x' ? 22 : 26}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
    />
  );
}

export function SectionHeader({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.section}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Txt v="eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</Txt> : null}
        <Txt v="heading">{title}</Txt>
      </View>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Txt v="small" style={{ color: C.text, textDecorationLine: 'underline' }}>{action}</Txt>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && { backgroundColor: C.text, borderColor: C.text }]}>
      {icon ? <Feather name={icon} size={13} color={active ? C.white : C.text} /> : null}
      <Text style={{ fontFamily: F.medium, fontSize: 13, color: active ? C.white : C.text }}>{label}</Text>
    </Pressable>
  );
}

export function HeartButton({ id, light }: { id: string; light?: boolean }) {
  const { state, dispatch } = useStore();
  const on = state.saved.includes(id);
  return (
    <Pressable
      accessibilityLabel={on ? 'Remove from saved' : 'Save'}
      hitSlop={10}
      onPress={() => dispatch({ t: 'save/toggle', id })}
      style={[styles.heart, light && { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
      <Ionicons name={on ? 'heart' : 'heart-outline'} size={17} color={on ? C.accent : C.text} />
    </Pressable>
  );
}

export function ProductCard({ product, width, onPress }: { product: Product; width: number; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress ?? (() => router.push(`/product/${product.id}`))} style={{ width }}>
      <View style={[styles.productImg, { width, height: width * 1.15 }]}>
        <Image source={art[product.photo]} style={{ width: '86%', height: '86%' }} contentFit="contain" />
        <View style={{ position: 'absolute', top: 8, right: 8 }}>
          <HeartButton id={product.id} light />
        </View>
      </View>
      <Txt v="body" style={{ fontSize: 14, marginTop: 10 }} numberOfLines={1}>{product.name}</Txt>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
        <Txt v="price">{money(product.price)}</Txt>
        {product.was ? <Txt v="price" style={{ color: C.text3, textDecorationLine: 'line-through' }}>{money(product.was)}</Txt> : null}
      </View>
    </Pressable>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: C.line }, style]} />;
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: R.pill,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 3,
    right: 1,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: C.bg,
  },
  badgeText: { color: C.white, fontFamily: F.semibold, fontSize: 9 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.md, paddingBottom: 6, zIndex: 10 },
  topSide: { width: 96, flexDirection: 'row', gap: 2 },
  topLeftWide: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  topRightAuto: { flexDirection: 'row', gap: 2 },
  topCenter: { flex: 1, alignItems: 'center' },
  section: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: S.gutter, marginBottom: S.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.bg,
  },
  heart: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  productImg: { backgroundColor: C.surface, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
