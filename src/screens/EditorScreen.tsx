import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme, RESTS, restLabel } from '../theme';
import { useStore } from '../store';
import { Icon, Btn, font } from '../ui';
import { BY_ID } from '../data/exercises';

export default function EditorScreen() {
  const theme = useTheme();
  const nav = useNavigation<any>();
  const { id } = useRoute<any>().params;
  const draft = useStore((s) => s.editorDraft);
  const startEdit = useStore((s) => s.startEdit);
  const draftName = useStore((s) => s.draftName);
  const removeEx = useStore((s) => s.draftRemoveExercise);
  const move = useStore((s) => s.draftMove);
  const addSet = useStore((s) => s.draftAddSet);
  const removeSet = useStore((s) => s.draftRemoveSet);
  const setField = useStore((s) => s.draftSetField);
  const setNote = useStore((s) => s.draftNote);
  const setRest = useStore((s) => s.draftRest);
  const saveDraft = useStore((s) => s.saveDraft);

  useEffect(() => { if (!draft || draft.id !== id) startEdit(id); }, [id]);

  if (!draft) return <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} />;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, height: 52 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ padding: 6 }}><Icon name="back" size={26} color={theme.ink} /></Pressable>
        <Text style={{ flex: 1, color: theme.ink, fontFamily: font(800), fontSize: 20 }}>Redaguoti</Text>
        <Pressable onPress={() => { saveDraft(); nav.goBack(); }} style={{ backgroundColor: theme.accent, borderRadius: 11, paddingVertical: 9, paddingHorizontal: 16 }}>
          <Text style={{ color: theme.accentInk, fontFamily: font(700), fontSize: 15 }}>Išsaugoti</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={label(theme)}>Pavadinimas</Text>
        <TextInput value={draft.name} onChangeText={draftName} placeholder="Treniruotės pavadinimas" placeholderTextColor={theme.muted} style={input(theme)} />

        {draft.exercises.map((x, i) => {
          const e = BY_ID[x.exId];
          return (
            <View key={i} style={{ backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderRadius: 16, padding: 13, marginTop: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                {e?.thumb ? <Image source={{ uri: e.thumb }} style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#fff' }} /> : <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: theme.surface2 }} />}
                <Text style={{ flex: 1, color: theme.ink, fontFamily: font(700), fontSize: 16 }} numberOfLines={1}>{e?.name ?? 'Unknown'}</Text>
                <Pressable onPress={() => move(i, -1)} disabled={i === 0} style={ord(theme, i === 0)}><Icon name="chevup" size={16} color={theme.muted} /></Pressable>
                <Pressable onPress={() => move(i, 1)} disabled={i === draft.exercises.length - 1} style={ord(theme, i === draft.exercises.length - 1)}><Icon name="chevdown" size={16} color={theme.muted} /></Pressable>
                <Pressable onPress={() => removeEx(i)} hitSlop={6} style={{ padding: 6 }}><Icon name="trash" size={19} color={theme.muted} /></Pressable>
              </View>

              <Text style={[label(theme), { marginTop: 12 }]}>Pastaba</Text>
              <TextInput value={x.note} onChangeText={(v) => setNote(i, v)} placeholder="pvz. paskutinė serija iki ribos" placeholderTextColor={theme.muted} style={input(theme)} />

              <Text style={[label(theme), { marginTop: 10 }]}>Poilsis</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 2 }}>
                {RESTS.map((r) => {
                  const on = x.rest === r[0];
                  return (
                    <Pressable key={r[0]} onPress={() => setRest(i, r[0])}
                      style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: on ? theme.accent : theme.lineStrong, backgroundColor: on ? theme.accent : theme.surface2 }}>
                      <Text style={{ color: on ? theme.accentInk : theme.muted, fontFamily: font(700), fontSize: 13 }}>{r[1]}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={{ flexDirection: 'row', marginTop: 12, marginBottom: 6 }}>
                <Text style={[cell(40), colLabel(theme)]}>Serija</Text>
                <Text style={[cellFlex(), colLabel(theme)]}>Kg</Text>
                <Text style={[cellFlex(), colLabel(theme)]}>Kart.</Text>
                <View style={{ width: 34 }} />
              </View>
              {x.sets.map((s, si) => (
                <View key={si} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 7, gap: 8 }}>
                  <Text style={{ width: 40, textAlign: 'center', color: theme.muted, fontFamily: font(700), backgroundColor: theme.surface2, borderRadius: 9, paddingVertical: 9 }}>{si + 1}</Text>
                  <TextInput value={s.kg} onChangeText={(v) => setField(i, si, 'kg', v)} keyboardType="decimal-pad" placeholder="–" placeholderTextColor={theme.muted} style={[setInput(theme), { flex: 1 }]} />
                  <TextInput value={s.reps} onChangeText={(v) => setField(i, si, 'reps', v)} placeholder="8-12" placeholderTextColor={theme.muted} style={[setInput(theme), { flex: 1 }]} />
                  <Pressable onPress={() => removeSet(i, si)} hitSlop={6} style={{ width: 34, alignItems: 'center' }}><Icon name="x" size={17} color={theme.muted} /></Pressable>
                </View>
              ))}
              <Pressable onPress={() => addSet(i)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: theme.lineStrong, borderStyle: 'dashed', borderRadius: 11, paddingVertical: 11, marginTop: 3 }}>
                <Icon name="plus" size={17} color={theme.muted} /><Text style={{ color: theme.muted, fontFamily: font(700) }}>Pridėti seriją</Text>
              </Pressable>
            </View>
          );
        })}

        <Btn label="Pridėti pratimą" icon="plus" kind="surface" onPress={() => nav.navigate('Library', { picker: true })} theme={theme} style={{ marginTop: 14 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const label = (t: any) => ({ color: t.muted, fontFamily: font(700), fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' as const, marginBottom: 6 });
const input = (t: any) => ({ backgroundColor: t.surface, borderColor: t.lineStrong, borderWidth: 1, borderRadius: 12, padding: 12, color: t.ink, fontFamily: font(500), fontSize: 16 });
const setInput = (t: any) => ({ textAlign: 'center' as const, backgroundColor: t.surface, borderColor: t.lineStrong, borderWidth: 1, borderRadius: 9, paddingVertical: 9, color: t.ink, fontFamily: font(600), fontSize: 15 });
const ord = (t: any, dis: boolean) => ({ width: 30, height: 30, borderRadius: 8, backgroundColor: t.surface2, alignItems: 'center' as const, justifyContent: 'center' as const, opacity: dis ? 0.35 : 1 });
const cell = (w: number) => ({ width: w, textAlign: 'center' as const });
const cellFlex = () => ({ flex: 1, textAlign: 'center' as const });
const colLabel = (t: any) => ({ color: t.muted, fontFamily: font(700), fontSize: 11, textTransform: 'uppercase' as const });
