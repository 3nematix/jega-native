import { BY_NAME } from './data/exercises';
import { Routine, Folder, RoutineEx } from './types';

export const PROGRAM_FOLDER = '5 dienų programa';
export const uid = () => Math.random().toString(36).slice(2, 9);

type Row = [string, number, string, number, string]; // name, sets, reps, rest, note

function R(fid: string, name: string, rows: Row[]): Routine {
  const exercises = rows
    .map((a): RoutineEx | null => {
      const e = BY_NAME[a[0].toUpperCase()];
      if (!e) return null;
      const sets = Array.from({ length: a[1] }, () => ({ reps: a[2], kg: '' }));
      return { exId: e.id, note: a[4] || '', rest: a[3], sets };
    })
    .filter((x): x is RoutineEx => !!x);
  return { id: uid(), name, folderId: fid, exercises };
}

export function buildProgram(): { folder: Folder; routines: Routine[] } {
  const fid = uid();
  const folder: Folder = { id: fid, name: PROGRAM_FOLDER, collapsed: false };
  const routines = [
    R(fid, 'Viršus A / Upper A (jėga)', [
      ['Bench Press (Barbell)', 4, '5-8', 180, ''],
      ['Bent Over Row (Barbell)', 4, '6-10', 150, ''],
      ['Overhead Press (Barbell)', 3, '6-8', 150, ''],
      ['Pull Up', 3, '6-10', 120, 'arba Weighted Pull Up'],
      ['Lateral Raise (Dumbbell)', 3, '12-15', 90, ''],
      ['Triceps Rope Pushdown', 3, '10-12', 90, ''],
    ]),
    R(fid, 'Apačia A / Lower A (jėga)', [
      ['Squat (Barbell)', 4, '5-8', 180, ''],
      ['Romanian Deadlift (Barbell)', 3, '8-10', 150, ''],
      ['Leg Press (Machine)', 3, '10-12', 120, ''],
      ['Lying Leg Curl (Machine)', 3, '12-15', 90, ''],
      ['Standing Calf Raise (Machine)', 3, '15-20', 90, ''],
      ['Cable Crunch', 3, '12-15', 60, 'arba Hanging Leg Raise'],
    ]),
    R(fid, 'Viršus B / Upper B (masė)', [
      ['Incline Bench Press (Dumbbell)', 4, '8-10', 150, ''],
      ['Lat Pulldown (Cable)', 4, '10-12', 120, ''],
      ['Shoulder Press (Dumbbell)', 3, '10-12', 120, ''],
      ['Dumbbell Row', 3, '10-12', 120, ''],
      ['Face Pull', 3, '15', 90, ''],
      ['EZ Bar Biceps Curl', 3, '10-12', 90, ''],
    ]),
    R(fid, 'Apačia B / Lower B (masė)', [
      ['Deadlift (Barbell)', 3, '5', 240, ''],
      ['Bulgarian Split Squat (Barbell)', 3, '8-10', 120, 'Kiekvienai kojai'],
      ['Leg Extension (Machine)', 3, '12-15', 90, ''],
      ['Seated Leg Curl (Machine)', 3, '12-15', 90, ''],
      ['Seated Calf Raise', 3, '15-20', 90, ''],
      ['Plank', 3, '45-60s', 60, ''],
    ]),
    R(fid, '5 diena: Pečiai ir rankos (lengva)', [
      ['Lateral Raise (Cable)', 4, '12-15', 90, ''],
      ['Rear Delt Reverse Fly (Machine)', 3, '12-15', 90, ''],
      ['Bicep Curl (Dumbbell)', 3, '10-12', 90, ''],
      ['Triceps Extension (Dumbbell)', 3, '10-12', 90, ''],
      ['Hammer Curl (Dumbbell)', 3, '10-12', 90, ''],
      ['Shrug (Dumbbell)', 3, '12-15', 90, ''],
    ]),
  ];
  return { folder, routines };
}

export function seedDB() {
  const p = buildProgram();
  return { folders: [p.folder], routines: p.routines, history: [] };
}
