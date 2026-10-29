import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { DB, Folder, Routine, RoutineEx, Session, Workout } from './types';
import { buildProgram, seedDB, uid, PROGRAM_FOLDER } from './program';
import { BY_ID } from './data/exercises';

const K_DB = 'jega.db.v1';
const K_SESSION = 'jega.session.v1';
const K_UPDATED = 'jega.updatedAt';
const K_UID = 'jega.uid';

const emptyDB: DB = { folders: [], routines: [], history: [] };

type State = {
  db: DB;
  session: Session | null;
  user: User | null;
  authReady: boolean;
  updatedAt: number;

  bootstrap: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<string | null>;
  signUp: (email: string, pass: string) => Promise<string | null>;
  signOut: () => Promise<void>;

  getRoutine: (id: string) => Routine | undefined;
  addRoutine: (name: string) => Routine;
  renameRoutine: (id: string, name: string) => void;
  deleteRoutine: (id: string) => void;
  duplicateRoutine: (id: string) => void;
  moveRoutine: (id: string, folderId: string | null) => void;
  saveRoutine: (id: string, name: string, exercises: RoutineEx[]) => void;

  addFolder: (name: string) => void;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  toggleFolder: (id: string) => void;
  loadProgram: () => number;

  startSession: (routineId: string) => void;
  resumeOrStart: (routineId: string) => void;
  toggleDone: (i: number) => void;
  setPip: (i: number, k: number) => void;
  setTopKg: (i: number, kg: string) => void;
  finishSession: () => void;
  discardSession: () => void;

  editorDraft: { id: string; name: string; exercises: RoutineEx[] } | null;
  startEdit: (routineId: string) => void;
  clearDraft: () => void;
  draftName: (name: string) => void;
  draftAddExercise: (exId: string) => void;
  draftRemoveExercise: (i: number) => void;
  draftMove: (i: number, dir: number) => void;
  draftAddSet: (i: number) => void;
  draftRemoveSet: (i: number, si: number) => void;
  draftSetField: (i: number, si: number, field: 'kg' | 'reps', v: string) => void;
  draftNote: (i: number, v: string) => void;
  draftRest: (i: number, v: number) => void;
  saveDraft: () => void;
};

let pushTimer: ReturnType<typeof setTimeout> | null = null;

function persist(db: DB, updatedAt: number, session: Session | null) {
  AsyncStorage.setItem(K_DB, JSON.stringify(db)).catch(() => {});
  AsyncStorage.setItem(K_UPDATED, String(updatedAt)).catch(() => {});
  if (session) AsyncStorage.setItem(K_SESSION, JSON.stringify(session)).catch(() => {});
  else AsyncStorage.removeItem(K_SESSION).catch(() => {});
}

export const useStore = create<State>((set, get) => {
  const commit = (db: DB) => {
    const updatedAt = Date.now();
    set({ db, updatedAt });
    persist(db, updatedAt, get().session);
    schedulePush();
  };
  const commitSession = (session: Session | null) => {
    set({ session });
    const s = get();
    persist(s.db, s.updatedAt, session);
  };
  const schedulePush = () => {
    const { user } = get();
    if (!user) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => cloudPush(), 1200);
  };
  const cloudPush = async () => {
    const { user, db, updatedAt } = get();
    if (!user) return;
    try {
      await supabase.from('user_data').upsert({
        user_id: user.id,
        data: { db, updatedAt: updatedAt || Date.now() },
        updated_at: new Date().toISOString(),
      });
    } catch {}
  };
  const cloudFetch = async (userId: string) => {
    try {
      const r = await supabase.from('user_data').select('data').eq('user_id', userId).maybeSingle();
      if (r.error) return null;
      return (r.data?.data ?? null) as { db: DB; updatedAt: number } | null;
    } catch {
      return null;
    }
  };
  const adopt = (remote: { db: DB; updatedAt: number }) => {
    const db = { ...emptyDB, ...remote.db, history: remote.db.history || [] };
    set({ db, updatedAt: remote.updatedAt || Date.now() });
    persist(db, remote.updatedAt || Date.now(), get().session);
  };

  const onAuth = async (user: User | null) => {
    set({ user, authReady: true });
    if (!user) {
      await AsyncStorage.removeItem(K_UID);
      return;
    }
    const lastUid = await AsyncStorage.getItem(K_UID);
    if (lastUid === user.id) {
      // same account: merge newer
      const remote = await cloudFetch(user.id);
      if (remote && remote.db && (remote.updatedAt || 0) > get().updatedAt) adopt(remote);
      else cloudPush();
    } else if (lastUid == null) {
      // first sign-in on this device: keep local, migrate if cloud empty
      await AsyncStorage.setItem(K_UID, user.id);
      const remote = await cloudFetch(user.id);
      if (remote && remote.db && (remote.updatedAt || 0) >= get().updatedAt) adopt(remote);
      else {
        if (!get().db.routines.length) {
          const seeded = seedDB();
          set({ db: seeded, updatedAt: Date.now() });
          persist(seeded, Date.now(), get().session);
        }
        cloudPush();
      }
    } else {
      // different account: wipe + adopt/seed
      await AsyncStorage.multiRemove([K_DB, K_UPDATED, K_SESSION]);
      await AsyncStorage.setItem(K_UID, user.id);
      set({ db: emptyDB, session: null, updatedAt: 0 });
      const remote = await cloudFetch(user.id);
      if (remote && remote.db) adopt(remote);
      else {
        const seeded = seedDB();
        set({ db: seeded, updatedAt: Date.now() });
        persist(seeded, Date.now(), null);
        cloudPush();
      }
    }
  };

  return {
    db: emptyDB,
    session: null,
    user: null,
    authReady: false,
    updatedAt: 0,

    bootstrap: async () => {
      try {
        const [rawDb, rawSession, rawUpdated] = await Promise.all([
          AsyncStorage.getItem(K_DB),
          AsyncStorage.getItem(K_SESSION),
          AsyncStorage.getItem(K_UPDATED),
        ]);
        set({
          db: rawDb ? JSON.parse(rawDb) : emptyDB,
          session: rawSession ? JSON.parse(rawSession) : null,
          updatedAt: rawUpdated ? +rawUpdated : 0,
        });
      } catch {}
      supabase.auth.onAuthStateChange((_event, sess) => { onAuth(sess?.user ?? null); });
    },

    signIn: async (email, pass) => {
      const r = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
      return r.error ? r.error.message : null;
    },
    signUp: async (email, pass) => {
      const r = await supabase.auth.signUp({ email: email.trim(), password: pass });
      if (r.error) return r.error.message;
      if (!r.data.session) return 'Patvirtink el. paštą ir prisijunk';
      return null;
    },
    signOut: async () => {
      await supabase.auth.signOut();
      await AsyncStorage.multiRemove([K_DB, K_UPDATED, K_SESSION, K_UID]);
      set({ db: emptyDB, session: null, user: null, updatedAt: 0 });
    },

    getRoutine: (id) => get().db.routines.find((r) => r.id === id),
    addRoutine: (name) => {
      const r: Routine = { id: uid(), name: name || 'Nauja treniruotė', folderId: null, exercises: [] };
      commit({ ...get().db, routines: [...get().db.routines, r] });
      return r;
    },
    renameRoutine: (id, name) => {
      commit({ ...get().db, routines: get().db.routines.map((r) => (r.id === id ? { ...r, name } : r)) });
    },
    deleteRoutine: (id) => {
      commit({ ...get().db, routines: get().db.routines.filter((r) => r.id !== id) });
    },
    duplicateRoutine: (id) => {
      const db = get().db;
      const r = db.routines.find((x) => x.id === id);
      if (!r) return;
      const copy: Routine = JSON.parse(JSON.stringify(r));
      copy.id = uid();
      copy.name = r.name + ' (kopija)';
      const idx = db.routines.indexOf(r);
      const routines = [...db.routines];
      routines.splice(idx + 1, 0, copy);
      commit({ ...db, routines });
    },
    moveRoutine: (id, folderId) => {
      commit({ ...get().db, routines: get().db.routines.map((r) => (r.id === id ? { ...r, folderId } : r)) });
    },
    saveRoutine: (id, name, exercises) => {
      commit({ ...get().db, routines: get().db.routines.map((r) => (r.id === id ? { ...r, name, exercises } : r)) });
    },

    addFolder: (name) => commit({ ...get().db, folders: [...get().db.folders, { id: uid(), name, collapsed: false }] }),
    renameFolder: (id, name) => commit({ ...get().db, folders: get().db.folders.map((f) => (f.id === id ? { ...f, name } : f)) }),
    deleteFolder: (id) => {
      const db = get().db;
      commit({
        ...db,
        folders: db.folders.filter((f) => f.id !== id),
        routines: db.routines.map((r) => (r.folderId === id ? { ...r, folderId: null } : r)),
      });
    },
    toggleFolder: (id) =>
      commit({ ...get().db, folders: get().db.folders.map((f) => (f.id === id ? { ...f, collapsed: !f.collapsed } : f)) }),
    loadProgram: () => {
      const db = get().db;
      const p = buildProgram();
      let folder = db.folders.find((f) => f.name === PROGRAM_FOLDER);
      const folders = [...db.folders];
      if (!folder) { folder = p.folder; folders.push(folder); }
      const routines = [...db.routines];
      let added = 0;
      for (const r of p.routines) {
        if (!routines.some((x) => x.name === r.name)) {
          routines.push({ ...r, folderId: folder.id });
          added++;
        }
      }
      commit({ ...db, folders, routines });
      return added;
    },

    startSession: (routineId) => {
      const r = get().getRoutine(routineId);
      if (!r) return;
      const session: Session = {
        routineId, routineName: r.name, startedAt: Date.now(),
        exercises: r.exercises.map((x) => ({
          exId: x.exId, target: x.sets.length || 1, done: 0, topKg: '', finished: false, rest: x.rest || 0,
        })),
      };
      commitSession(session);
    },
    resumeOrStart: (routineId) => {
      const s = get().session;
      if (s && s.routineId === routineId) return;
      get().startSession(routineId);
    },
    toggleDone: (i) => {
      const s = get().session;
      if (!s) return;
      const ex = { ...s.exercises[i] };
      if (ex.finished) { ex.finished = false; ex.done = 0; }
      else { ex.finished = true; ex.done = ex.target; }
      const exercises = s.exercises.map((e, idx) => (idx === i ? ex : e));
      commitSession({ ...s, exercises });
    },
    setPip: (i, k) => {
      const s = get().session;
      if (!s) return;
      const ex = { ...s.exercises[i] };
      ex.done = k + 1 === ex.done ? k : k + 1;
      ex.finished = ex.done >= ex.target;
      commitSession({ ...s, exercises: s.exercises.map((e, idx) => (idx === i ? ex : e)) });
    },
    setTopKg: (i, kg) => {
      const s = get().session;
      if (!s) return;
      commitSession({ ...s, exercises: s.exercises.map((e, idx) => (idx === i ? { ...e, topKg: kg } : e)) });
    },
    finishSession: () => {
      const s = get().session;
      if (!s) return;
      const doneCount = s.exercises.filter((e) => e.finished).length;
      const w: Workout = {
        id: uid(), routineId: s.routineId, routineName: s.routineName, date: Date.now(),
        durationSec: Math.round((Date.now() - s.startedAt) / 1000),
        exercisesDone: doneCount, exercisesTotal: s.exercises.length,
        entries: s.exercises.map((x) => ({
          exId: x.exId, name: BY_ID[x.exId]?.name || '', setsDone: x.done, target: x.target,
          topKg: x.topKg, finished: x.finished,
        })),
      };
      const db = { ...get().db, history: [w, ...get().db.history] };
      set({ session: null });
      AsyncStorage.removeItem(K_SESSION).catch(() => {});
      commit(db);
    },
    discardSession: () => commitSession(null),

    editorDraft: null,
    startEdit: (routineId) => {
      const r = get().db.routines.find((x) => x.id === routineId);
      if (r) set({ editorDraft: JSON.parse(JSON.stringify(r)) });
    },
    clearDraft: () => set({ editorDraft: null }),
    draftName: (name) => { const d = get().editorDraft; if (d) set({ editorDraft: { ...d, name } }); },
    draftAddExercise: (exId) => {
      const d = get().editorDraft; if (!d) return;
      const ex: RoutineEx = { exId, note: '', rest: 90, sets: [{ reps: '', kg: '' }, { reps: '', kg: '' }, { reps: '', kg: '' }] };
      set({ editorDraft: { ...d, exercises: [...d.exercises, ex] } });
    },
    draftRemoveExercise: (i) => {
      const d = get().editorDraft; if (!d) return;
      set({ editorDraft: { ...d, exercises: d.exercises.filter((_, idx) => idx !== i) } });
    },
    draftMove: (i, dir) => {
      const d = get().editorDraft; if (!d) return;
      const j = i + dir; if (j < 0 || j >= d.exercises.length) return;
      const ex = [...d.exercises]; const t = ex[i]; ex[i] = ex[j]; ex[j] = t;
      set({ editorDraft: { ...d, exercises: ex } });
    },
    draftAddSet: (i) => {
      const d = get().editorDraft; if (!d) return;
      const ex = d.exercises.map((x, idx) => {
        if (idx !== i) return x;
        const last = x.sets[x.sets.length - 1] || { reps: '', kg: '' };
        return { ...x, sets: [...x.sets, { reps: last.reps, kg: '' }] };
      });
      set({ editorDraft: { ...d, exercises: ex } });
    },
    draftRemoveSet: (i, si) => {
      const d = get().editorDraft; if (!d) return;
      const ex = d.exercises.map((x, idx) => (idx === i ? { ...x, sets: x.sets.filter((_, k) => k !== si) } : x));
      set({ editorDraft: { ...d, exercises: ex } });
    },
    draftSetField: (i, si, field, v) => {
      const d = get().editorDraft; if (!d) return;
      const ex = d.exercises.map((x, idx) =>
        idx === i ? { ...x, sets: x.sets.map((s, k) => (k === si ? { ...s, [field]: v } : s)) } : x
      );
      set({ editorDraft: { ...d, exercises: ex } });
    },
    draftNote: (i, v) => {
      const d = get().editorDraft; if (!d) return;
      set({ editorDraft: { ...d, exercises: d.exercises.map((x, idx) => (idx === i ? { ...x, note: v } : x)) } });
    },
    draftRest: (i, v) => {
      const d = get().editorDraft; if (!d) return;
      set({ editorDraft: { ...d, exercises: d.exercises.map((x, idx) => (idx === i ? { ...x, rest: v } : x)) } });
    },
    saveDraft: () => {
      const d = get().editorDraft; if (!d) return;
      get().saveRoutine(d.id, d.name || 'Untitled', d.exercises);
      set({ editorDraft: null });
    },
  };
});
