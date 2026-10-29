import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { useStore } from '../store';
import { Icon, font } from '../ui';
import { agoLabel, fmtClock } from '../helpers';

export default function HistoryScreen() {
  const theme = useTheme();
  const history = useStore((s) => s.db.history);
  const now = Date.now();
  const week = history.filter((x) => x.date >= now - 7 * 864e5).length;
  const month = history.filter((x) => x.date >= now - 30 * 864e5).length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ paddingHorizontal: 16, height: 52, justifyContent: 'center' }}>
        <Text style={{ color: theme.ink, fontFamily: font(800), fontSize: 26 }}>Istorija</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {history.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Icon name="hist" size={40} color={theme.muted} />
            <Text style={{ color: theme.muted, textAlign: 'center', marginTop: 10, fontFamily: font(500) }}>Dar nėra treniruočių.{'\n'}Atidaryk treniruotę ir paspausk Pradėti.</Text>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <Stat n={String(history.length)} l="Iš viso" theme={theme} />
              <Stat n={String(week)} l="Ši savaitė" theme={theme} />
              <Stat n={String(month)} l="Šis mėnuo" theme={theme} />
            </View>
            {history.map((e) => (
              <View key={e.id} style={{ backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Text numberOfLines={1} style={{ flex: 1, color: theme.ink, fontFamily: font(700), fontSize: 19 }}>{e.routineName}</Text>
                  <Text style={{ color: theme.muted, fontFamily: font(600), fontSize: 12.5 }}>{agoLabel(e.date)}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                  <Meta a={`${e.exercisesDone}/${e.exercisesTotal}`} b="pratimai" theme={theme} />
                  <Meta a={fmtClock(e.durationSec)} b="laikas" theme={theme} />
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
function Stat({ n, l, theme }: { n: string; l: string; theme: any }) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.surface2, borderRadius: 12, paddingVertical: 11, alignItems: 'center' }}>
      <Text style={{ color: theme.ink, fontFamily: font(800), fontSize: 24 }}>{n}</Text>
      <Text style={{ color: theme.muted, fontFamily: font(700), fontSize: 11, textTransform: 'uppercase', marginTop: 4 }}>{l}</Text>
    </View>
  );
}
function Meta({ a, b, theme }: { a: string; b: string; theme: any }) {
  return <Text style={{ color: theme.muted, fontFamily: font(500), fontSize: 13.5 }}><Text style={{ color: theme.ink, fontFamily: font(700) }}>{a}</Text> {b}</Text>;
}
