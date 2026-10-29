import React, { useEffect } from 'react';
import { View, StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts, Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold, Figtree_800ExtraBold,
} from '@expo-google-fonts/figtree';
import { useTheme, dark, light } from './src/theme';
import { useStore } from './src/store';
import { Icon, font } from './src/ui';
import AuthScreen from './src/screens/AuthScreen';
import RoutinesScreen from './src/screens/RoutinesScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RoutineScreen from './src/screens/RoutineScreen';
import SessionScreen from './src/screens/SessionScreen';
import ExerciseScreen from './src/screens/ExerciseScreen';
import EditorScreen from './src/screens/EditorScreen';
import LibraryScreen from './src/screens/LibraryScreen';

export type RootStackParamList = {
  Auth: undefined; Tabs: undefined; Routine: { id: string }; Session: undefined;
  Exercise: { exId: string }; Editor: { id: string }; Library: { picker?: boolean };
};
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function Tabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.bg, borderTopColor: theme.line, paddingTop: 4 },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: { fontFamily: font(700), fontSize: 11 },
        tabBarIcon: ({ color }) => (
          <Icon name={route.name === 'Routines' ? 'dumbbell' : route.name === 'History' ? 'chart' : 'user'} color={color} size={22} />
        ),
      })}
    >
      <Tab.Screen name="Routines" component={RoutinesScreen} options={{ title: 'Treniruotės' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Istorija' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profilis' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [loaded] = useFonts({
    Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold, Figtree_800ExtraBold,
  });
  const theme = useTheme();
  const scheme = useColorScheme();
  const bootstrap = useStore((s) => s.bootstrap);
  const user = useStore((s) => s.user);
  const authReady = useStore((s) => s.authReady);

  useEffect(() => { bootstrap(); }, []);

  if (!loaded || !authReady) return <View style={{ flex: 1, backgroundColor: theme.bg }} />;

  const base = scheme === 'light' ? { nav: DefaultTheme, t: light } : { nav: DarkTheme, t: dark };
  const navTheme = {
    ...base.nav,
    colors: { ...base.nav.colors, background: base.t.bg, card: base.t.bg, text: base.t.ink, border: base.t.line, primary: base.t.accent },
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={scheme === 'light' ? 'dark-content' : 'light-content'} />
      <NavigationContainer theme={navTheme as any}>
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
          {!user ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <>
              <Stack.Screen name="Tabs" component={Tabs} />
              <Stack.Screen name="Routine" component={RoutineScreen} />
              <Stack.Screen name="Session" component={SessionScreen} options={{ gestureEnabled: false }} />
              <Stack.Screen name="Exercise" component={ExerciseScreen} />
              <Stack.Screen name="Editor" component={EditorScreen} />
              <Stack.Screen name="Library" component={LibraryScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
