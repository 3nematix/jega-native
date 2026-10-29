import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Ellipse } from 'react-native-svg';
import { Theme } from '../theme';

type Shape = (string | number)[];

const FRONT: Shape[] = [
  ['', 'e', 50, 18, 11, 12], ['', 'r', 37, 116, 26, 22, 9], ['', 'e', 27, 112, 5, 6], ['', 'e', 73, 112, 5, 6],
  ['', 'r', 38, 176, 10, 40, 5], ['', 'r', 52, 176, 10, 40, 5], ['', 'r', 37, 214, 12, 9, 3], ['', 'r', 51, 214, 12, 9, 3],
  ['neck', 'r', 45, 27, 10, 11, 3],
  ['shoulders', 'e', 32, 44, 9, 8], ['shoulders', 'e', 68, 44, 9, 8],
  ['chest', 'r', 35, 40, 14, 22, 6], ['chest', 'r', 51, 40, 14, 22, 6],
  ['biceps', 'r', 24, 47, 10, 30, 5], ['biceps', 'r', 66, 47, 10, 30, 5],
  ['forearms', 'r', 22, 79, 10, 30, 5], ['forearms', 'r', 68, 79, 10, 30, 5],
  ['abdominals', 'r', 42, 62, 16, 52, 6],
  ['adductors', 'r', 46, 140, 3, 34, 1], ['adductors', 'r', 51, 140, 3, 34, 1],
  ['quadriceps', 'r', 37, 138, 12, 40, 6], ['quadriceps', 'r', 51, 138, 12, 40, 6],
];
const BACK: Shape[] = [
  ['', 'e', 50, 18, 11, 12], ['', 'e', 27, 112, 5, 6], ['', 'e', 73, 112, 5, 6],
  ['', 'r', 37, 214, 12, 9, 3], ['', 'r', 51, 214, 12, 9, 3],
  ['traps', 'r', 42, 30, 16, 20, 6],
  ['shoulders', 'e', 32, 44, 9, 8], ['shoulders', 'e', 68, 44, 9, 8],
  ['upper_back', 'r', 37, 48, 26, 16, 5],
  ['triceps', 'r', 24, 47, 10, 30, 5], ['triceps', 'r', 66, 47, 10, 30, 5],
  ['forearms', 'r', 22, 79, 10, 30, 5], ['forearms', 'r', 68, 79, 10, 30, 5],
  ['lats', 'r', 35, 62, 12, 24, 5], ['lats', 'r', 53, 62, 12, 24, 5],
  ['lower_back', 'r', 42, 86, 16, 26, 5],
  ['abductors', 'r', 33, 116, 5, 22, 2], ['abductors', 'r', 62, 116, 5, 22, 2],
  ['glutes', 'r', 37, 114, 13, 24, 7], ['glutes', 'r', 50, 114, 13, 24, 7],
  ['hamstrings', 'r', 37, 140, 12, 30, 5], ['hamstrings', 'r', 51, 140, 12, 30, 5],
  ['calves', 'r', 38, 172, 11, 42, 5], ['calves', 'r', 51, 172, 11, 42, 5],
];

export default function BodyMap({ vol, theme }: { vol: Record<string, number>; theme: Theme }) {
  const max = Math.max(1, ...Object.values(vol));
  const colorFor = (m: string) => {
    const v = vol[m] || 0;
    if (v > 0) return { fill: theme.accent, opacity: 0.3 + 0.7 * (v / max) };
    return { fill: theme.mapbase, opacity: 1 };
  };
  const render = (list: Shape[]) =>
    list.map((p, idx) => {
      const m = p[0] as string;
      const type = p[1] as string;
      const c = p.slice(2) as number[];
      const col = m ? colorFor(m) : { fill: theme.mapbase, opacity: 1 };
      if (type === 'r') return <Rect key={idx} x={c[0]} y={c[1]} width={c[2]} height={c[3]} rx={c[4] ?? 4} fill={col.fill} opacity={col.opacity} />;
      return <Ellipse key={idx} cx={c[0]} cy={c[1]} rx={c[2]} ry={c[3]} fill={col.fill} opacity={col.opacity} />;
    });

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
      <Svg width={116} height={200} viewBox="0 0 100 230">{render(FRONT)}</Svg>
      <Svg width={116} height={200} viewBox="0 0 100 230">{render(BACK)}</Svg>
    </View>
  );
}
