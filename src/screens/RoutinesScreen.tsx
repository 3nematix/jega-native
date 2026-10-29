import React from 'react';
import { View, Text, Pressable, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { useStore } from '../store';
import { Icon, Btn, font } from '../ui';
import { routineSub } from '../helpers';
import { Routine } from '../types';

export default function RoutinesScreen() {
  const theme = useTheme();
  const nav = useNavigation<any>();
  const db = useStore((s) => s.db);
  const addRoutine = useStore((s) => s.addRoutine);
  const addFolder = useStore((s) => s.addFolder);
  const toggleFolder = useStore((s) => s.toggleFolder);
  const loadProgram = useStore((s) => s.loadProgram);
  const renameRoutine = useStore((s) => s.renameRoutine);
  const duplicateRoutine = useStore((s) => s.duplicateRoutine);
  const deleteRoutine = useStore((s) => s.deleteRoutine);
  const startSession = useStore((s) => s.startSession);

  const prompt = (title: string, cb: (v: string) => void, def = '') => {
    if (Platform.OS === 'ios') Alert.prompt(title, undefined, (v) => v && cb(v), 'plain-text', def);
    else cb(def || 'Nauja');
  };

  const topMenu = () =>
    Alert.alert('Meniu', undefined, [
      { text: 'Naujas aplankas', onPress: () => prompt('Aplanko pavadinimas', addFolder) },
      { text: 'Įkelti 5 dienų programą', onPress: () => { const n = loadProgram(); Alert.alert('', n ? `Atstatyta ${n}` : 'Programa jau pilna'); } },
      { text: 'Atšaukti', style: 'cancel' },
    ]);

  const routineMenu = (r: Routine) =>
    Alert.alert(r.name, undefined, [
      { text: 'Pradėti', onPress: () => { startSession(r.id); nav.navigate('Session'); } },
      { text: 'Pervadinti', onPress: () => prompt('Pervadinti', (v) => renameRoutine(r.id, v), r.name) },
      { text: 'Dubliuoti', onPress: () => duplicateRoutine(r.id) },
      { text: 'Trinti', style: 'destructive', onPress: () => deleteRoutine(r.id) },
      { text: 'Atšaukti', style: 'cancel' },
    ]);

  const Card = ({ r }: { r: Routine }) => (
    <View style={{ backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <Pressable style={{ flex: 1 }} onPress={() => nav.navigate('Routine', { id: r.id })}>
          <Text style={{ color: theme.ink, fontFamily: font(700), fontSize: 20 }}>{r.name}</Text>
          <Text numberOfLines={2} style={{ color: theme.muted, fontFamily: font(500), fontSize: 14, marginTop: 6, lineHeight: 20 }}>
            {routineSub(r)}
          </Text>
        </Pressable>
        <Pressable onPress={() => routineMenu(r)} hitSlop={10} style={{ padding: 2, marginLeft: 6 }}>
          <Icon name="more" size={22} color={theme.muted} />
        </Pressable>
      </View>
      {r.exercises.length > 0 ? (
        <Btn label="Pradėti" icon="play" onPress={() => { startSession(r.id); nav.navigate('Session'); }} theme={theme} style={{ marginTop: 14, borderRadius: 12 }} />
      ) : (
        <Btn label="Redaguoti" icon="edit" kind="surface" onPress={() => nav.navigate('Routine', { id: r.id })} theme={theme} style={{ marginTop: 14, borderRadius: 12 }} />
      )}
    </View>
  );

  const ungrouped = db.routines.filter((r) => !r.folderId || !db.folders.some((f) => f.id === r.folderId));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52 }}>
        <Text style={{ flex: 1, color: theme.ink, fontFamily: font(800), fontSize: 26 }}>Treniruotės</Text>
        <Pressable onPress={topMenu} hitSlop={10} style={{ padding: 6 }}><Icon name="more" size={24} color={theme.ink} /></Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => prompt('Naujos treniruotės pavadinimas', (v) => { const r = addRoutine(v); nav.navigate('Routine', { id: r.id }); })}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderRadius: 16, padding: 15, marginBottom: 18 }}>
          <View style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: theme.accentWeak, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={20} color={theme.accent} />
          </View>
          <Text style={{ color: theme.ink, fontFamily: font(700), fontSize: 16 }}>Nauja treniruotė</Text>
        </Pressable>

        {db.folders.map((f) => {
          const rs = db.routines.filter((r) => r.folderId === f.id);
          return (
            <View key={f.id}>
              <Pressable onPress={() => toggleFolder(f.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 4 }}>
                <Icon name={f.collapsed ? 'chev' : 'chevdown'} size={16} color={theme.muted} />
                <Text style={{ flex: 1, color: theme.muted, fontFamily: font(700), fontSize: 13, letterSpacing: 0.4, textTransform: 'uppercase' }}>{f.name}</Text>
                <Text style={{ color: theme.muted, fontFamily: font(600), fontSize: 13 }}>{rs.length}</Text>
              </Pressable>
              {!f.collapsed && rs.map((r) => <Card key={r.id} r={r} />)}
            </View>
          );
        })}

        <Text style={{ color: theme.muted, fontFamily: font(700), fontSize: 13, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 10, marginBottom: 10 }}>My Routines</Text>
        {ungrouped.length === 0 ? (
          <Text style={{ color: theme.muted, textAlign: 'center', padding: 20, fontFamily: font(500) }}>Nieko čia.</Text>
        ) : ungrouped.map((r) => <Card key={r.id} r={r} />)}
      </ScrollView>
    </SafeAreaView>
  );
}
