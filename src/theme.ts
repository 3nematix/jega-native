import { useColorScheme } from 'react-native';

export const dark = {
  bg: '#0a0d12', surface: '#161b22', surface2: '#1e242d', ink: '#f0f3f7', muted: '#8b96a5',
  line: '#232a33', lineStrong: '#323a45', accent: '#2f80ff', accentInk: '#ffffff',
  accentWeak: '#16243c', good: '#34c77b', danger: '#ff5c61', mapbase: '#2a313b',
};
export const light = {
  bg: '#f4f6f9', surface: '#ffffff', surface2: '#eef1f6', ink: '#141922', muted: '#636d7e',
  line: '#e3e7ee', lineStrong: '#d2d8e2', accent: '#2d7bf5', accentInk: '#ffffff',
  accentWeak: '#e3eefe', good: '#18a558', danger: '#e5484d', mapbase: '#dde3ec',
};
export type Theme = typeof dark;

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'light' ? light : dark; // default to dark
}

export const MUSCLE: Record<string, string> = {
  chest: 'Chest', upper_back: 'Upper Back', lats: 'Lats', lower_back: 'Lower Back',
  traps: 'Traps', neck: 'Neck', shoulders: 'Shoulders', biceps: 'Biceps', triceps: 'Triceps',
  forearms: 'Forearms', abdominals: 'Abs', quadriceps: 'Quads', hamstrings: 'Hamstrings',
  glutes: 'Glutes', calves: 'Calves', abductors: 'Abductors', adductors: 'Adductors',
  cardio: 'Cardio', full_body: 'Full Body', other: 'Other',
};
export const EQUIP: Record<string, string> = {
  barbell: 'Barbell', dumbbell: 'Dumbbell', machine: 'Machine', kettlebell: 'Kettlebell',
  plate: 'Weight Plate', resistance_band: 'Resistance Band', suspension: 'Suspension',
  none: 'Bodyweight', other: 'Other',
};
export const RESTS: [number, string][] = [
  [0, 'Off'], [30, '30s'], [45, '45s'], [60, '1min'], [90, '1.5min'], [120, '2min'],
  [150, '2.5min'], [180, '3min'], [240, '4min'], [300, '5min'],
];
export const restLabel = (s: number) => RESTS.find((r) => r[0] === s)?.[1] ?? `${s}s`;
