import { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { useAppTheme } from '@/providers/AppThemeProvider';
import { AppText } from '@/shared/components/AppText';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
  { label, error, style, ...props },
  ref,
) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <AppText variant="caption">{label}</AppText>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          { backgroundColor: colors.surfaceRaised, borderColor: error ? colors.error : colors.border, color: colors.text },
          style,
        ]}
        {...props}
      />
      {error ? <AppText variant="caption" style={{ color: colors.error }}>{error}</AppText> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: 6 },
  input: { minHeight: 48, borderRadius: 8, borderWidth: 1, fontSize: 16, paddingHorizontal: 14 },
});