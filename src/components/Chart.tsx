import React from 'react';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Theme } from '../theme';
import { fmtVol } from '../helpers';

export default function Chart({ data, theme, width = 320 }: { data: { date: number; topKg: number }[]; theme: Theme; width?: number }) {
  const W = 320, H = 160, padL = 30, padB = 24, padT = 12, padR = 10;
  const vals = data.map((d) => d.topKg);
  let min = Math.min(...vals), max = Math.max(...vals);
  if (min === max) { min = Math.max(0, min - 5); max = max + 5; }
  const n = data.length;
  const X = (i: number) => (n === 1 ? W / 2 : padL + (i / (n - 1)) * (W - padL - padR));
  const Y = (v: number) => H - padB - ((v - min) / (max - min)) * (H - padB - padT);
  const pts = data.map((d, i) => [X(i), Y(d.topKg)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `M${pts[0][0].toFixed(1)} ${H - padB} ${pts.map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')} L${pts[n - 1][0].toFixed(1)} ${H - padB} Z`;
  const h = (width * H) / W;

  return (
    <Svg width={width} height={h} viewBox={`0 0 ${W} ${H}`}>
      <Line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke={theme.line} strokeWidth={1} />
      {n > 1 && <Path d={area} fill={theme.accent} opacity={0.1} />}
      {n > 1 && <Path d={line} fill="none" stroke={theme.accent} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
      {pts.map((p, i) => <Circle key={i} cx={p[0]} cy={p[1]} r={i === n - 1 ? 4 : 2.6} fill={theme.accent} />)}
      <SvgText x={2} y={Y(max) + 3.5} fill={theme.muted} fontSize={10}>{fmtVol(max)}</SvgText>
      <SvgText x={2} y={Y(min) + 3.5} fill={theme.muted} fontSize={10}>{fmtVol(min)}</SvgText>
    </Svg>
  );
}
