import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';

import { useAppTheme } from '@/providers/AppThemeProvider';

type TextVariant = 'body' | 'caption' | 'title' | 'heading';

interface AppTextProps extends PropsWithChildren {
  variant?: TextVariant;
  secondary?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export function AppText({
  children,
  variant = 'body',
  secondary = false,
  style,
  numberOfLines,
}: AppTextProps) {
  const { colors } = useAppTheme();

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[styles[variant], { color: secondary ? colors.textSecondary : colors.text }, style]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 16, lineHeight: 23 },
  caption: { fontSize: 13, lineHeight: 18 },
  heading: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  title: { fontSize: 32, fontWeight: '800', lineHeight: 38 },
});