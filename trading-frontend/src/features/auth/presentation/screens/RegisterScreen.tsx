import { StyleSheet, View } from 'react-native';

import { AuthForm } from '@/features/auth/presentation/components/AuthForm';
import { AppText } from '@/shared/components/AppText';
import { Screen } from '@/shared/components/Screen';
import { strings } from '@/shared/constants/strings';

export function RegisterScreen() {
  return (
    <Screen contentContainerStyle={styles.screen}>
      <View style={styles.heading}>
        <AppText variant="title">{strings.auth.registerTitle}</AppText>
        <AppText secondary>{strings.auth.registerSubtitle}</AppText>
      </View>
      <AuthForm mode="register" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center', alignSelf: 'center', width: '100%', maxWidth: 480 },
  heading: { gap: 8 },
});