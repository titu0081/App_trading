import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';

import { useAppTheme } from '@/providers/AppThemeProvider';
import { strings } from '@/shared/constants/strings';

export default function AppLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="market/index"
        options={{
          title: strings.navigation.market,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="show-chart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen name="market/[symbol]" options={{ href: null }} />
      <Tabs.Screen
        name="watchlists/index"
        options={{
          title: strings.navigation.watchlists,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="star-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen name="watchlists/[id]" options={{ href: null }} />
      <Tabs.Screen
        name="alerts/index"
        options={{
          title: strings.navigation.alerts,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="notifications-active"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen name="alerts/create" options={{ href: null }} />
      <Tabs.Screen name="alerts/history" options={{ href: null }} />
      <Tabs.Screen
        name="notifications/index"
        options={{
          title: strings.navigation.notifications,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="notifications-none"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: strings.navigation.profile,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
