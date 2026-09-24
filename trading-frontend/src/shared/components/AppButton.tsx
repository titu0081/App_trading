import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/providers/AppThemeProvider';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function AppButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}: AppButtonProps) {
  const { colors } = useAppTheme();
  const backgroundColor =
    variant === 'danger' ? colors.error : variant === 'secondary' ? colors.surfaceRaised : colors.primary;
  const color = variant === 'secondary' ? colors.text : colors.onPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor: colors.border, opacity: disabled ? 0.45 : pressed ? 0.78 : 1 },
      ]}
    >
      {loading ? <ActivityIndicator color={color} /> : <Text style={[styles.label, { color }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 18,
  },
  label: { fontSize: 16, fontWeight: '700' },
});