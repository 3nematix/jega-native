import React from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { useStore } from '../store';
import { Icon, font } from '../ui';

export default function ProfileScreen() {
  const theme = useTheme();
  const nav = useNavigation<any>();
  const user = useStore((s) => s.user);
  const db = useStore((s) => s.db);
  const signOut = useStore((s) => s.signOut);

  const email = user?.email ?? '—';
  const initial = (email[0] ?? '?').toUpperCase();
  const created = (user as any)?.created_at ? new Date((user as any).created_at) : null;
  const since = created && !isNaN(+created) ? created.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : null;
  const now = Date.now();
  const thisWeek = db.history.filter((x) => x.date >= now - 7 * 864e5).length;

  const confirmSignOut = () =>
    Alert.alert('Atsijungti?', undefined, [
      { text: 'Atsijungti', style: 'destructive', onPress: () => signOut() },
      { text: 'Atšaukti', style: 'cancel' },
    ]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ paddingHorizontal: 16, height: 52, justifyContent: 'center' }}>
        <Text style={{ color: theme.ink, fontFamily: font(800), fontSize: 26 }}>Profilis</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: theme.accentInk, fontFamily: font(800), fontSize: 30 }}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.ink, fontFamily: font(700), fontSize: 19 }}>{email}</Text>
            {since ? <Text style={{ color: theme.muted, fontFamily: font(500), fontSize: 13.5, marginTop: 3 }}>Narys nuo {since}</Text> : null}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 22 }}>
          <Stat n={String(db.history.length)} l="Treniruotės" theme={theme} />
          <Stat n={String(db.routines.length)} l="Rutinos" theme={theme} />
          <Stat n={String(thisWeek)} l="Šią savaitę" theme={theme} />
        </View>

        <Text style={{ color: theme.muted, fontFamily: font(700), fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Daugiau</Text>
        <Row icon="hist" label="Istorija" onPress={() => nav.navigate('History')} theme={theme} />

        <Text style={{ color: theme.muted, fontFamily: font(700), fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 18, marginBottom: 10 }}>Nustatymai</Text>
        <Row icon="signout" label="Atsijungti" danger onPress={confirmSignOut} theme={theme} />
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
function Row({ icon, label, onPress, theme, danger }: { icon: string; label: string; onPress: () => void; theme: any; danger?: boolean }) {
  const c = danger ? theme.danger : theme.ink;
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderRadius: 14, padding: 15, marginBottom: 10 }}>
      <Icon name={icon} size={21} color={danger ? theme.danger : theme.muted} />
      <Text style={{ flex: 1, color: c, fontFamily: font(600), fontSize: 15.5 }}>{label}</Text>
      {!danger ? <Icon name="chev" size={18} color={theme.lineStrong} /> : null}
    </Pressable>
  );
}
