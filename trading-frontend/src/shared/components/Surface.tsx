import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useAppTheme } from '@/providers/AppThemeProvider';

export function Surface({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const { colors } = useAppTheme();

  return <View style={[styles.surface, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  surface: { borderRadius: 8, borderWidth: 1, padding: 16, gap: 10 },
});