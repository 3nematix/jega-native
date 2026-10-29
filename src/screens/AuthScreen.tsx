import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../theme';
import { useStore } from '../store';
import { Icon, Btn, font } from '../ui';

export default function AuthScreen() {
  const theme = useTheme();
  const signIn = useStore((s) => s.signIn);
  const signUp = useStore((s) => s.signUp);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || pass.length < 6) { Alert.alert('', 'Įvesk el. paštą ir slaptažodį (min 6)'); return; }
    setBusy(true);
    const err = mode === 'signup' ? await signUp(email, pass) : await signIn(email, pass);
    setBusy(false);
    if (err) Alert.alert('', err);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 74, height: 74, borderRadius: 20, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="dumbbell" size={38} color={theme.accentInk} />
          </View>
          <Text style={{ color: theme.ink, fontFamily: font(800), fontSize: 34, marginTop: 18 }}>Jėga</Text>
          <Text style={{ color: theme.muted, fontFamily: font(500), fontSize: 15, marginTop: 6, marginBottom: 26 }}>
            {mode === 'signup' ? 'Sukurk paskyrą ir sek progresą' : 'Prisijunk prie savo paskyros'}
          </Text>
        </View>
        <TextInput value={email} onChangeText={setEmail} placeholder="El. paštas" placeholderTextColor={theme.muted}
          autoCapitalize="none" autoCorrect={false} keyboardType="email-address" style={inp(theme)} />
        <TextInput value={pass} onChangeText={setPass} placeholder="Slaptažodis (min 6)" placeholderTextColor={theme.muted}
          secureTextEntry style={inp(theme)} />
        <Btn label={busy ? '…' : mode === 'signup' ? 'Sukurti paskyrą' : 'Prisijungti'} onPress={submit} theme={theme} style={{ marginTop: 6 }} />
        <Pressable onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')} style={{ marginTop: 14, alignItems: 'center' }}>
          <Text style={{ color: theme.accent, fontFamily: font(700) }}>
            {mode === 'signup' ? 'Jau turi paskyrą? Prisijunk' : 'Neturi paskyros? Sukurk'}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const inp = (t: Theme) => ({
  backgroundColor: t.surface, borderColor: t.lineStrong, borderWidth: 1, borderRadius: 12,
  padding: 14, color: t.ink, fontSize: 16, fontFamily: font(500), marginBottom: 12,
});
