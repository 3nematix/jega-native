import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme, MUSCLE, EQUIP } from '../theme';
import { useStore } from '../store';
import { Icon, font } from '../ui';
import { BY_ID } from '../data/exercises';
import { exerciseProgress, fmtVol, agoLabel } from '../helpers';
import Chart from '../components/Chart';

export default function ExerciseScreen() {
  const theme = useTheme();
  const nav = useNavigation<any>();
  const { exId } = useRoute<any>().params;
  const e = BY_ID[exId];
  const history = useStore((s) => s.db.history);
  const [tab, setTab] = useState<'howto' | 'progress'>('howto');

  const player = useVideoPlayer(e?.video || '', (p) => { p.loop = true; p.muted = true; if (e?.video) p.play(); });

  if (!e) return <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} />;
  const prog = exerciseProgress(history, exId);
  const best = prog.length ? Math.max(...prog.map((d) => d.topKg)) : null;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, height: 52 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ padding: 6 }}><Icon name="back" size={26} color={theme.ink} /></Pressable>
        <Text numberOfLines={1} style={{ flex: 1, color: theme.ink, fontFamily: font(800), fontSize: 20 }}>{e.name}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={{ aspectRatio: 16 / 10, borderRadius: 16, overflow: 'hidden', backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.line }}>
          {e.video ? <VideoView player={player} style={{ flex: 1 }} contentFit="contain" nativeControls={false} />
            : e.thumb ? <Image source={{ uri: e.thumb }} style={{ flex: 1 }} resizeMode="contain" /> : null}
        </View>

        <View style={{ marginTop: 16, gap: 7 }}>
          <Row k="Įranga" v={EQUIP[e.equipment] ?? e.equipment} theme={theme} />
          <Row k="Pagrindinis raumuo" v={MUSCLE[e.primary] ?? e.primary} theme={theme} />
          <Row k="Antriniai" v={e.secondary.length ? e.secondary.map((m) => MUSCLE[m] ?? m).join(', ') : '—'} theme={theme} />
        </View>

        <View style={{ flexDirection: 'row', gap: 4, borderBottomWidth: 1, borderBottomColor: theme.line, marginTop: 18 }}>
          {(['howto', 'progress'] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={{ paddingVertical: 11, paddingHorizontal: 10, borderBottomWidth: 2.5, borderBottomColor: tab === t ? theme.accent : 'transparent' }}>
              <Text style={{ color: tab === t ? theme.ink : theme.muted, fontFamily: font(700), fontSize: 15 }}>{t === 'howto' ? 'Kaip atlikti' : 'Progresas'}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'howto' ? (
          <View style={{ marginTop: 14, gap: 14 }}>
            {e.howto.length ? e.howto.map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 13 }}>
                <View style={{ width: 27, height: 27, borderRadius: 14, backgroundColor: theme.accentWeak, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: theme.accent, fontFamily: font(700), fontSize: 14 }}>{i + 1}</Text>
                </View>
                <Text style={{ flex: 1, color: theme.ink, fontFamily: font(500), fontSize: 15.5, lineHeight: 22 }}>{s}</Text>
              </View>
            )) : <Text style={{ color: theme.muted, textAlign: 'center', padding: 22, fontFamily: font(500) }}>Nėra instrukcijų.</Text>}
          </View>
        ) : (
          <View style={{ marginTop: 16 }}>
            {prog.length === 0 ? (
              <Text style={{ color: theme.muted, textAlign: 'center', padding: 30, fontFamily: font(500) }}>Dar nėra duomenų. Treniruotės metu įvesk „Top svorį".</Text>
            ) : (
              <>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <PStat n={fmtVol(best!)} l="Geriausias kg" theme={theme} />
                  <PStat n={fmtVol(prog[prog.length - 1].topKg)} l="Paskutinis kg" theme={theme} />
                  <PStat n={String(prog.length)} l="Kartų" theme={theme} />
                </View>
                <Text style={{ color: theme.muted, fontFamily: font(700), fontSize: 11, textTransform: 'uppercase', marginTop: 18, marginBottom: 8 }}>Svoris laike</Text>
                <View style={{ backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderRadius: 14, padding: 12, alignItems: 'center' }}>
                  <Chart data={prog} theme={theme} width={290} />
                </View>
                <View style={{ backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, marginTop: 16 }}>
                  {prog.slice().reverse().slice(0, 10).map((d, i) => (
                    <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: i < Math.min(prog.length, 10) - 1 ? 1 : 0, borderBottomColor: theme.line }}>
                      <Text style={{ color: theme.muted, fontFamily: font(500), fontSize: 14 }}>{agoLabel(d.date)}</Text>
                      <Text style={{ color: theme.ink, fontFamily: font(700), fontSize: 15 }}>{fmtVol(d.topKg)} kg</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ k, v, theme }: { k: string; v: string; theme: any }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Text style={{ color: theme.muted, fontFamily: font(500), fontSize: 15, width: 150 }}>{k}</Text>
      <Text style={{ flex: 1, color: theme.ink, fontFamily: font(600), fontSize: 15 }}>{v}</Text>
    </View>
  );
}
function PStat({ n, l, theme }: { n: string; l: string; theme: any }) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.surface2, borderRadius: 12, paddingVertical: 11, alignItems: 'center' }}>
      <Text style={{ color: theme.ink, fontFamily: font(800), fontSize: 22 }}>{n}</Text>
      <Text style={{ color: theme.muted, fontFamily: font(700), fontSize: 10.5, textTransform: 'uppercase', marginTop: 4 }}>{l}</Text>
    </View>
  );
}
