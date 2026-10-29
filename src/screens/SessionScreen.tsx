import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, TextInput, Alert, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { useStore } from '../store';
import { Icon, Btn, font } from '../ui';
import { BY_ID } from '../data/exercises';
import { bestTopKg, fmtClock, fmtVol } from '../helpers';

export default function SessionScreen() {
  const theme = useTheme();
  const nav = useNavigation<any>();
  const session = useStore((s) => s.session);
  const history = useStore((s) => s.db.history);
  const toggleDone = useStore((s) => s.toggleDone);
  const setPip = useStore((s) => s.setPip);
  const setTopKg = useStore((s) => s.setTopKg);
  const finishSession = useStore((s) => s.finishSession);
  const discardSession = useStore((s) => s.discardSession);

  const [open, setOpen] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const [restEnd, setRestEnd] = useState(0);

  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 1000); return () => clearInterval(id); }, []);
  const prevRest = useRef(0);
  useEffect(() => {
    if (restEnd && Date.now() >= restEnd && prevRest.current) { Vibration.vibrate(300); prevRest.current = 0; setRestEnd(0); }
    prevRest.current = restEnd;
  }, [tick, restEnd]);

  useEffect(() => { if (!session) nav.navigate('Tabs'); }, [session]);
  if (!session) return <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} />;

  const doneCount = session.exercises.filter((e) => e.finished).length;
  const total = session.exercises.length;
  const elapsed = fmtClock((Date.now() - session.startedAt) / 1000);
  const restLeft = restEnd ? Math.max(0, (restEnd - Date.now()) / 1000) : 0;

  const onPip = (i: number, k: number) => {
    const before = session.exercises[i].done;
    setPip(i, k);
    const after = k + 1 === before ? k : k + 1;
    const rest = session.exercises[i].rest;
    if (after > before && rest > 0) setRestEnd(Date.now() + rest * 1000);
  };
  const onDone = (i: number) => {
    const wasFinished = session.exercises[i].finished;
    toggleDone(i);
    if (!wasFinished && session.exercises[i].rest > 0) setRestEnd(Date.now() + session.exercises[i].rest * 1000);
  };

  const finish = () =>
    Alert.alert('Baigti treniruotę?', undefined, [
      { text: 'Baigti ir išsaugoti', onPress: () => { finishSession(); nav.navigate('Tabs', { screen: 'History' }); } },
      { text: 'Atmesti (nesaugoti)', style: 'destructive', onPress: () => { discardSession(); nav.navigate('Tabs'); } },
      { text: 'Atšaukti', style: 'cancel' },
    ]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, height: 52 }}>
        <Pressable onPress={() => nav.navigate('Tabs')} hitSlop={10} style={{ padding: 6 }}><Icon name="back" size={26} color={theme.ink} /></Pressable>
        <Text numberOfLines={1} style={{ flex: 1, color: theme.ink, fontFamily: font(800), fontSize: 20 }}>{session.routineName}</Text>
        <Pressable onPress={finish} hitSlop={10} style={{ paddingHorizontal: 10 }}><Text style={{ color: theme.accent, fontFamily: font(700), fontSize: 15 }}>Baigti</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <View style={{ flex: 1, height: 10, borderRadius: 6, backgroundColor: theme.surface2, overflow: 'hidden' }}>
            <View style={{ width: `${total ? Math.round((doneCount / total) * 100) : 0}%`, height: '100%', backgroundColor: theme.accent, borderRadius: 6 }} />
          </View>
          <Text style={{ color: theme.ink, fontFamily: font(800), fontSize: 18 }}>{doneCount}/{total}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <Icon name="clock" size={15} color={theme.muted} />
          <Text style={{ color: theme.muted, fontFamily: font(600), fontSize: 14 }}>{elapsed} praėjo</Text>
        </View>

        {session.exercises.map((x, i) => {
          const e = BY_ID[x.exId];
          const best = bestTopKg(history, x.exId);
          const isOpen = open === i;
          return (
            <View key={i} style={{ backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderRadius: 16, marginBottom: 11, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 }}>
                {e?.thumb ? <Image source={{ uri: e.thumb }} style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#fff' }} /> : <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: theme.surface2 }} />}
                <Pressable style={{ flex: 1 }} onPress={() => setOpen(isOpen ? null : i)}>
                  <Text style={{ color: x.finished ? theme.muted : theme.ink, fontFamily: font(700), fontSize: 16 }}>{e?.name ?? 'Unknown'}</Text>
                  <Text style={{ color: theme.muted, fontFamily: font(500), fontSize: 13, marginTop: 1 }}>{x.done}/{x.target} serijos{x.topKg ? ` · ${x.topKg} kg` : ''}</Text>
                  {best != null && !x.topKg ? <Text style={{ color: theme.accent, fontFamily: font(700), fontSize: 12.5, marginTop: 2 }}>Geriausias: {fmtVol(best)} kg</Text> : null}
                </Pressable>
                <Pressable onPress={() => onDone(i)} style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: x.finished ? theme.good : theme.lineStrong, backgroundColor: x.finished ? theme.good : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {x.finished ? <Icon name="check" size={22} color="#fff" /> : null}
                </Pressable>
              </View>
              {isOpen && (
                <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: theme.line }}>
                  <Text style={{ color: theme.muted, fontFamily: font(700), fontSize: 11, textTransform: 'uppercase', marginTop: 12, marginBottom: 8 }}>Serijos</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {Array.from({ length: x.target }).map((_, k) => (
                      <Pressable key={k} onPress={() => onPip(i, k)}
                        style={{ minWidth: 40, height: 40, paddingHorizontal: 6, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
                          borderColor: k < x.done ? theme.accent : theme.lineStrong, backgroundColor: k < x.done ? theme.accent : theme.surface2 }}>
                        <Text style={{ color: k < x.done ? theme.accentInk : theme.muted, fontFamily: font(700) }}>{k + 1}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={{ color: theme.muted, fontFamily: font(700), fontSize: 11, textTransform: 'uppercase', marginTop: 14, marginBottom: 8 }}>Top svoris · nebūtina</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TextInput value={x.topKg} onChangeText={(v) => setTopKg(i, v)} keyboardType="decimal-pad"
                      placeholder={best ? `beat ${fmtVol(best)}` : 'pvz. 60'} placeholderTextColor={theme.muted}
                      style={{ flex: 1, backgroundColor: theme.surface, borderColor: theme.lineStrong, borderWidth: 1, borderRadius: 11, padding: 11, color: theme.ink, fontFamily: font(500), fontSize: 16 }} />
                    <Text style={{ color: theme.muted, fontFamily: font(700) }}>kg</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {restLeft > 0 && (
        <View style={{ position: 'absolute', bottom: 92, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.ink, borderRadius: 16, paddingVertical: 10, paddingLeft: 18, paddingRight: 12 }}>
          <View><Text style={{ color: theme.bg, opacity: 0.7, fontFamily: font(700), fontSize: 11, textTransform: 'uppercase' }}>Poilsis</Text>
            <Text style={{ color: theme.bg, fontFamily: font(800), fontSize: 22 }}>{fmtClock(restLeft)}</Text></View>
          <Pressable onPress={() => setRestEnd(0)} style={{ padding: 6 }}><Text style={{ color: theme.bg, fontFamily: font(700) }}>Praleisti</Text></Pressable>
        </View>
      )}

      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, borderTopWidth: 1, borderTopColor: theme.line }}>
        <Btn label="Baigti treniruotę" icon="flag" onPress={finish} theme={theme} />
      </View>
    </SafeAreaView>
  );
}
