import { ColorSchemeName } from 'react-native';

import { ThemePreference } from '@/store/preferencesStore';

import { darkColors, lightColors } from './colors';

export type ThemeMode = 'light' | 'dark';

export function resolveThemeMode(
  preference: ThemePreference,
  deviceMode: ColorSchemeName,
): ThemeMode {
  if (preference !== 'system') {
    return preference;
  }

  return deviceMode === 'dark' ? 'dark' : 'light';
}

export function getThemeColors(mode: ThemeMode) {
  return mode === 'dark' ? darkColors : lightColors;
}

export { darkColors, lightColors, palette } from './colors';
export type { ThemeColors } from './colors';