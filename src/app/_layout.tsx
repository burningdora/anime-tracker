import { PressStart2P_400Regular, useFonts } from '@expo-google-fonts/press-start-2p';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BootSplash } from '../components/BootSplash';
import { FavoritesProvider } from '../context/FavoritesContext';
import { initDatabase } from '../db/initDatabase';
import { colors } from '../theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {
  // На web нативного splash нет — ошибка не критична.
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ PressStart2P_400Regular });
  const [introDone, setIntroDone] = useState(false);
  const handleIntroFinish = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Держим нативный splash, пока не готов пиксельный шрифт.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SQLiteProvider databaseName="anime-tracker.db" onInit={initDatabase}>
      <FavoritesProvider>
        <StatusBar style="light" />
        <View style={styles.root}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.text,
              headerTitleStyle: { fontWeight: '700' },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.bg },
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="anime/[id]" options={{ title: 'Аниме' }} />
            <Stack.Screen name="entry" options={{ title: 'Моя запись', presentation: 'modal' }} />
          </Stack>

          {introDone ? null : <BootSplash onFinish={handleIntroFinish} />}
        </View>
      </FavoritesProvider>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000004' },
});
