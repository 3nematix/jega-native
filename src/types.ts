export type SetT = { reps: string; kg: string };
export type RoutineEx = { exId: string; note: string; rest: number; sets: SetT[] };
export type Routine = { id: string; name: string; folderId: string | null; exercises: RoutineEx[] };
export type Folder = { id: string; name: string; collapsed?: boolean };
export type HistEntry = { exId: string; name: string; setsDone: number; target: number; topKg: string; finished: boolean };
export type Workout = {
  id: string; routineId: string; routineName: string; date: number; durationSec: number;
  exercisesDone: number; exercisesTotal: number; entries: HistEntry[];
};
export type DB = { folders: Folder[]; routines: Routine[]; history: Workout[] };
export type SessionEx = { exId: string; target: number; done: number; topKg: string; finished: boolean; rest: number };
export type Session = { routineId: string; routineName: string; startedAt: number; exercises: SessionEx[] };
