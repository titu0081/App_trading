import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/providers/AppThemeProvider';
import { AppButton } from '@/shared/components/AppButton';
import { AppText } from '@/shared/components/AppText';
import { strings } from '@/shared/constants/strings';

interface StateViewProps {
  message?: string;
  onRetry?: () => void;
  loading?: boolean;
}

export function StateView({ message, onRetry, loading = false }: StateViewProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator color={colors.accent} size="large" /> : null}
      <AppText secondary>{message ?? (loading ? strings.common.loading : strings.common.empty)}</AppText>
      {onRetry ? <AppButton label={strings.common.retry} onPress={onRetry} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
});