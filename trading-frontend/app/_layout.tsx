import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/providers/AppThemeProvider';
import { AppProviders } from '@/providers/AppProviders';
import { StateView } from '@/shared/components/StateView';

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

function RootNavigator() {
  const { session, isLoading } = useAuth();
  const { mode } = useAppTheme();

  if (isLoading) return <StateView loading />;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={Boolean(session)}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
