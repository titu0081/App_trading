import { Theme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { createContext, PropsWithChildren, useContext } from 'react';
import { useColorScheme } from 'react-native';

import { getThemeColors, resolveThemeMode, ThemeColors, ThemeMode } from '@/shared/theme';
import { usePreferencesStore } from '@/store/preferencesStore';

interface AppThemeContextValue {
  colors: ThemeColors;
  mode: ThemeMode;
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const preference = usePreferencesStore((state) => state.theme);
  const deviceMode = useColorScheme();
  const mode = resolveThemeMode(preference, deviceMode);
  const colors = getThemeColors(mode);
  const navigationTheme: Theme = {
    dark: mode === 'dark',
    colors: {
      primary: colors.accent,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.error,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '700' },
      heavy: { fontFamily: 'System', fontWeight: '800' },
    },
  };

  return (
    <AppThemeContext.Provider value={{ colors, mode }}>
      <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }

  return context;
}