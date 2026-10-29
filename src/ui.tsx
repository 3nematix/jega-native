import React from 'react';
import { Text, Pressable, View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from './theme';

export const font = (w: number) =>
  w >= 800 ? 'Figtree_800ExtraBold' : w >= 700 ? 'Figtree_700Bold' : w >= 600 ? 'Figtree_600SemiBold' : w >= 500 ? 'Figtree_500Medium' : 'Figtree_400Regular';

const FEATHER: Record<string, any> = {
  play: 'play', plus: 'plus', more: 'more-vertical', back: 'chevron-left', chev: 'chevron-right',
  user: 'user', chart: 'bar-chart-2', check: 'check', trash: 'trash-2', edit: 'edit-2',
  folder: 'folder', clock: 'clock', download: 'download', signout: 'log-out', x: 'x',
  flag: 'flag', hist: 'clock', search: 'search', moon: 'moon', chevdown: 'chevron-down', chevup: 'chevron-up',
};

export function Icon({ name, size = 22, color }: { name: string; size?: number; color: string }) {
  if (name === 'dumbbell' || name === 'routines') return <MaterialCommunityIcons name="dumbbell" size={size} color={color} />;
  return <Feather name={FEATHER[name] || 'circle'} size={size} color={color} />;
}

export function Btn({
  label, onPress, kind = 'primary', icon, theme, style, textStyle,
}: {
  label?: string; onPress: () => void; kind?: 'primary' | 'ghost' | 'surface' | 'danger';
  icon?: string; theme: Theme; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle>;
}) {
  const bg = kind === 'primary' ? theme.accent : kind === 'surface' ? theme.surface2 : 'transparent';
  const fg = kind === 'primary' ? theme.accentInk : kind === 'danger' ? theme.danger : theme.ink;
  const border = kind === 'surface' ? theme.line : 'transparent';
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: '#ffffff22' }}
      style={({ pressed }) => [
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          backgroundColor: bg, borderColor: border, borderWidth: border === 'transparent' ? 0 : 1,
          borderRadius: 13, paddingVertical: 14, paddingHorizontal: 18, opacity: pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={18} color={fg} /> : null}
      {label ? <Text style={[{ color: fg, fontFamily: font(700), fontSize: 16 }, textStyle]}>{label}</Text> : null}
    </Pressable>
  );
}

export function mk(theme: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.bg },
    body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
    h1: { color: theme.ink, fontFamily: font(800), fontSize: 26, letterSpacing: -0.3 },
    eyebrow: { color: theme.muted, fontFamily: font(700), fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 20, marginBottom: 10, marginLeft: 2 },
    card: { backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderRadius: 16 },
    muted: { color: theme.muted, fontFamily: font(500) },
    tnum: { fontVariant: ['tabular-nums'] },
  });
}
