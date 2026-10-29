import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, FlatList, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme, MUSCLE, EQUIP } from '../theme';
import { useStore } from '../store';
import { Icon, font } from '../ui';
import { EXERCISES, POPULAR, BY_ID, Exercise } from '../data/exercises';

export default function LibraryScreen() {
  const theme = useTheme();
  const nav = useNavigation<any>();
  const picker: boolean = !!useRoute<any>().params?.picker;
  const draft = useStore((s) => s.editorDraft);
  const addEx = useStore((s) => s.draftAddExercise);

  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState('');

  const data = useMemo(() => {
    const qq = q.trim().toUpperCase();
    if (!qq && !muscle) return POPULAR.map((id) => BY_ID[id]).filter(Boolean) as Exercise[];
    return EXERCISES.filter((e) => {
      if (muscle && e.primary !== muscle && !e.secondary.includes(muscle)) return false;
      if (qq && !e.name.toUpperCase().includes(qq)) return false;
      return true;
    });
  }, [q, muscle]);

  const chips = ['', ...Object.keys(MUSCLE)];

  const Header = (
    <View>
      <View style={{ position: 'relative', marginBottom: 10 }}>
        <View style={{ position: 'absolute', left: 14, top: 13, zIndex: 1 }}><Icon name="search" size={19} color={theme.muted} /></View>
        <TextInput value={q} onChangeText={setQ} placeholder="Ieškoti pratimų" placeholderTextColor={theme.muted} autoCapitalize="none"
          style={{ backgroundColor: theme.surface2, borderColor: theme.line, borderWidth: 1, borderRadius: 13, paddingVertical: 12, paddingLeft: 42, paddingRight: 14, color: theme.ink, fontFamily: font(500), fontSize: 16 }} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingVertical: 2, paddingBottom: 10 }}>
        {chips.map((c) => {
          const on = muscle === c;
          return (
            <Pressable key={c || 'all'} onPress={() => setMuscle(c)}
              style={{ paddingVertical: 7, paddingHorizontal: 13, borderRadius: 999, borderWidth: 1, borderColor: on ? theme.accent : theme.line, backgroundColor: on ? theme.accent : theme.surface }}>
              <Text style={{ color: on ? theme.accentInk : theme.muted, fontFamily: font(700), fontSize: 13 }}>{c ? MUSCLE[c] : 'Visi'}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {!q && !muscle ? <Text style={{ color: theme.muted, fontFamily: font(700), fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Populiariausi</Text> : null}
    </View>
  );

  const renderItem = ({ item: e }: { item: Exercise }) => {
    const added = picker && !!draft?.exercises.some((x) => x.exId === e.id);
    return (
      <Pressable onPress={() => (picker ? addEx(e.id) : nav.navigate('Exercise', { exId: e.id }))}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: theme.line }}>
        {e.thumb ? <Image source={{ uri: e.thumb }} style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#fff' }} /> : <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: theme.surface2 }} />}
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.ink, fontFamily: font(600), fontSize: 15.5 }}>{e.name}</Text>
          <Text style={{ color: theme.muted, fontFamily: font(500), fontSize: 13, marginTop: 1 }}>{MUSCLE[e.primary] ?? e.primary} · {EQUIP[e.equipment] ?? e.equipment}</Text>
        </View>
        {picker ? (
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: added ? theme.good : theme.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={added ? 'check' : 'plus'} size={19} color="#fff" />
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, height: 52 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ padding: 6 }}><Icon name="back" size={26} color={theme.ink} /></Pressable>
        <Text style={{ flex: 1, color: theme.ink, fontFamily: font(800), fontSize: 21 }}>{picker ? 'Pridėti pratimą' : 'Pratimai'}</Text>
        {picker ? <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ paddingHorizontal: 10 }}><Text style={{ color: theme.accent, fontFamily: font(700), fontSize: 15 }}>Atlikta</Text></Pressable> : null}
      </View>
      <FlatList
        data={data}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={15}
        windowSize={10}
      />
    </SafeAreaView>
  );
}
