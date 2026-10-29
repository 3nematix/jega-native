import React from 'react';
import { View, Text, Pressable, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme';
import { MUSCLE } from '../theme';
import { useStore } from '../store';
import { Icon, Btn, font } from '../ui';
import { BY_ID } from '../data/exercises';
import { scheme, volume, totalSets, estDuration, fmtVol } from '../helpers';

export default function RoutineScreen() {
  const theme = useTheme();
  const nav = useNavigation<any>();
  const { id } = useRoute<any>().params;
  const routine = useStore((s) => s.db.routines.find((r) => r.id === id));
  const startSession = useStore((s) => s.startSession);

  if (!routine) { return <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} />; }

  const vol = volume(routine);
  const muscles = Object.keys(vol).sort((a, b) => vol[b] - vol[a]);
  const maxv = muscles.length ? vol[muscles[0]] : 1;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, height: 52 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ padding: 6 }}><Icon name="back" size={26} color={theme.ink} /></Pressable>
        <Text numberOfLines={1} style={{ flex: 1, color: theme.ink, fontFamily: font(800), fontSize: 21 }}>{routine.name}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14 }}>
          {routine.exercises.map((x, i) => {
            const e = BY_ID[x.exId];
            return (
              <Pressable key={i} onPress={() => nav.navigate('Exercise', { exId: x.exId })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 12, borderBottomWidth: i < routine.exercises.length - 1 ? 1 : 0, borderBottomColor: theme.line }}>
                <Thumb uri={e?.thumb} theme={theme} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.ink, fontFamily: font(600), fontSize: 16 }}>{e?.name ?? 'Unknown'}</Text>
                  <Text style={{ color: theme.muted, fontFamily: font(500), fontSize: 13, marginTop: 1 }}>{MUSCLE[e?.primary ?? ''] ?? e?.primary}</Text>
                  <Text style={{ color: theme.accent, fontFamily: font(700), fontSize: 13.5, marginTop: 2 }}>{scheme(x)}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: theme.muted, fontFamily: font(700), fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 20, marginBottom: 10 }}>Santrauka</Text>
        <View style={{ backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderRadius: 16, padding: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Stat n={String(routine.exercises.length)} l="Pratimai" theme={theme} />
            <Stat n={String(totalSets(routine))} l="Serijos" theme={theme} />
            <Stat n={estDuration(routine)} l="Laikas" theme={theme} />
          </View>
          <View style={{ marginTop: 14, gap: 9 }}>
            {muscles.map((m) => (
              <View key={m} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ width: 92, color: theme.muted, fontFamily: font(600), fontSize: 13 }} numberOfLines={1}>{MUSCLE[m] ?? m}</Text>
                <View style={{ flex: 1, height: 9, borderRadius: 5, backgroundColor: theme.surface2, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.round((vol[m] / maxv) * 100)}%`, height: '100%', backgroundColor: theme.accent, borderRadius: 5 }} />
                </View>
                <Text style={{ width: 30, textAlign: 'right', color: theme.muted, fontFamily: font(600), fontSize: 13 }}>{fmtVol(vol[m])}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, borderTopWidth: 1, borderTopColor: theme.line }}>
        <Btn label="Pradėti treniruotę" icon="play" onPress={() => { startSession(routine.id); nav.navigate('Session'); }} theme={theme} style={{ flex: 1 }} />
        <Btn icon="edit" kind="surface" onPress={() => Alert.alert('', 'Redaktorius bus kitame etape')} theme={theme} style={{ width: 54 }} />
      </View>
    </SafeAreaView>
  );
}

function Thumb({ uri, theme }: { uri?: string; theme: any }) {
  if (!uri) return <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: theme.surface2 }} />;
  return <Image source={{ uri }} style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: '#fff' }} />;
}
function Stat({ n, l, theme }: { n: string; l: string; theme: any }) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.surface2, borderRadius: 12, paddingVertical: 11, alignItems: 'center' }}>
      <Text style={{ color: theme.ink, fontFamily: font(800), fontSize: 24 }}>{n}</Text>
      <Text style={{ color: theme.muted, fontFamily: font(700), fontSize: 11, textTransform: 'uppercase', marginTop: 4 }}>{l}</Text>
    </View>
  );
}
