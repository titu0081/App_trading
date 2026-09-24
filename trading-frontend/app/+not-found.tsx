import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/providers/AppThemeProvider';
import { AppText } from '@/shared/components/AppText';
import { Screen } from '@/shared/components/Screen';
import { strings } from '@/shared/constants/strings';

export default function NotFoundScreen() {
  const { colors } = useAppTheme();

  return (
    <Screen contentContainerStyle={styles.container}>
      <AppText variant="heading">{strings.common.notFoundTitle}</AppText>
      <Link href="/" style={{ color: colors.accent }}>
        {strings.common.backToHome}
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
