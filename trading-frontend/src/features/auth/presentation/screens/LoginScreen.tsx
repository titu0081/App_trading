import { StyleSheet, View } from 'react-native';

import { AuthForm } from '@/features/auth/presentation/components/AuthForm';
import { AppText } from '@/shared/components/AppText';
import { Screen } from '@/shared/components/Screen';
import { strings } from '@/shared/constants/strings';

export function LoginScreen() {
  return (
    <Screen contentContainerStyle={styles.screen}>
      <View style={styles.brand}>
        <AppText variant="title">{strings.common.appName}</AppText>
        <View style={styles.heading}>
          <AppText variant="heading">{strings.auth.loginTitle}</AppText>
          <AppText secondary>{strings.auth.loginSubtitle}</AppText>
        </View>
      </View>
      <AuthForm mode="login" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center', alignSelf: 'center', width: '100%', maxWidth: 480 },
  brand: { gap: 32 },
  heading: { gap: 8 },
});