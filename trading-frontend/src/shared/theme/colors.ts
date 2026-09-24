export const palette = {
  white: '#FFFFFF',
  secondary: '#8F9CAE',
  surfaceDark: '#1E2733',
  textSecondary: '#5F6E80',
  success: '#00E676',
  accent: '#00F3FF',
  error: '#E5484D',
  warning: '#F5A524',
} as const;

export const lightColors = {
  background: palette.white,
  surface: '#F4F7FA',
  surfaceRaised: palette.white,
  text: palette.surfaceDark,
  textSecondary: palette.textSecondary,
  border: '#D7DEE7',
  primary: palette.surfaceDark,
  onPrimary: palette.white,
  accent: '#007A82',
  accentBright: palette.accent,
  success: '#08783F',
  error: palette.error,
  warning: '#8A5200',
  overlay: 'rgba(30, 39, 51, 0.52)',
} as const;

export const darkColors = {
  background: '#111821',
  surface: palette.surfaceDark,
  surfaceRaised: '#293543',
  text: palette.white,
  textSecondary: '#B8C2CE',
  border: '#3C4A5B',
  primary: palette.accent,
  onPrimary: palette.surfaceDark,
  accent: palette.accent,
  accentBright: palette.accent,
  success: palette.success,
  error: '#FF7478',
  warning: '#FFC46B',
  overlay: 'rgba(0, 0, 0, 0.68)',
} as const;

export type ThemeColors = { [Key in keyof typeof lightColors]: string };
export type ColorToken = keyof ThemeColors;