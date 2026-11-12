import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { colors } from '../../theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Каталог',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size - 2 }}>▦</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Избранное',
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ color, fontSize: size - 2 }}>{focused ? '♥' : '♡'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: 'Моё',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size - 2 }}>☰</Text>,
        }}
      />
    </Tabs>
  );
}
