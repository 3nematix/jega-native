import { BY_ID } from './data/exercises';
import { Routine, RoutineEx, Workout } from './types';
import { restLabel } from './theme';

export const fmtVol = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));

export function volume(routine: Routine): Record<string, number> {
  const v: Record<string, number> = {};
  for (const x of routine.exercises) {
    const e = BY_ID[x.exId];
    if (!e) continue;
    const n = x.sets.length;
    if (!n) continue;
    if (e.primary) v[e.primary] = (v[e.primary] || 0) + n;
    for (const m of e.secondary) v[m] = (v[m] || 0) + n * 0.5;
  }
  return v;
}
export const totalSets = (r: Routine) => r.exercises.reduce((a, x) => a + x.sets.length, 0);
export function estDuration(r: Routine) {
  let s = 0;
  for (const x of r.exercises) { const n = x.sets.length; s += n * 45 + n * x.rest; }
  return Math.max(1, Math.round(s / 60)) + 'm';
}
export function scheme(x: RoutineEx) {
  const sets = x.sets; const n = sets.length;
  if (!n) return 'No sets';
  const reps = sets[0].reps;
  const uniform = sets.every((s) => s.reps === reps);
  let base = uniform && reps ? `${n} × ${reps}` : `${n}${n === 1 ? ' set' : ' sets'}`;
  if (x.rest) base += ' · ' + restLabel(x.rest);
  return base;
}
export function routineSub(r: Routine) {
  const names = r.exercises.map((x) => BY_ID[x.exId]?.name).filter(Boolean);
  return names.length ? names.join(', ') : 'Tuščia treniruotė';
}
export function bestTopKg(history: Workout[], exId: string): number | null {
  let best: number | null = null;
  for (const h of history) for (const en of h.entries)
    if (en.exId === exId && en.topKg) {
      const v = parseFloat(String(en.topKg).replace(',', '.'));
      if (!isNaN(v) && (best === null || v > best)) best = v;
    }
  return best;
}
export function exerciseProgress(history: Workout[], exId: string) {
  const out: { date: number; topKg: number }[] = [];
  for (const h of history) for (const en of h.entries)
    if (en.exId === exId && en.topKg) {
      const v = parseFloat(String(en.topKg).replace(',', '.'));
      if (!isNaN(v)) out.push({ date: h.date, topKg: v });
    }
  out.sort((a, b) => a.date - b.date);
  return out;
}
export function lastDone(history: Workout[], routineId: string) {
  const h = history.find((x) => x.routineId === routineId);
  return h ? h.date : null;
}
export function agoLabel(ts: number) {
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d <= 0) return 'šiandien';
  if (d === 1) return 'vakar';
  if (d < 7) return `prieš ${d} d.`;
  if (d < 60) return `prieš ${Math.round(d / 7)} sav.`;
  return `prieš ${Math.round(d / 30)} mėn.`;
}
export function fmtClock(sec: number) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const mm = (m < 10 && h > 0 ? '0' : '') + m, ss = (s < 10 ? '0' : '') + s;
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}
