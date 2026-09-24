import { Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/providers/AppThemeProvider';
import { AppButton } from '@/shared/components/AppButton';
import { AppText } from '@/shared/components/AppText';
import { Screen } from '@/shared/components/Screen';
import { Surface } from '@/shared/components/Surface';
import { strings } from '@/shared/constants/strings';
import { ThemePreference, usePreferencesStore } from '@/store/preferencesStore';

const modes: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: strings.profile.system },
  { value: 'light', label: strings.profile.light },
  { value: 'dark', label: strings.profile.dark },
];

export function ProfileScreen() {
  const { colors } = useAppTheme();
  const { session, logout } = useAuth();
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);

  return (
    <Screen>
      <AppText variant="title">{strings.profile.title}</AppText>
      <Surface>
        <AppText variant="heading">{session?.email}</AppText>
        <AppText secondary>
          {strings.profile.userIdValue(session?.userId ?? '')}
        </AppText>
      </Surface>
      <View style={styles.section}>
        <AppText variant="heading">{strings.profile.appearance}</AppText>
        <View style={styles.modes}>
          {modes.map((item) => (
            <Pressable
              key={item.value}
              onPress={() => setTheme(item.value)}
              style={[
                styles.mode,
                {
                  backgroundColor:
                    theme === item.value
                      ? colors.primary
                      : colors.surfaceRaised,
                  borderColor: colors.border,
                },
              ]}
            >
              <AppText
                style={{
                  color: theme === item.value ? colors.onPrimary : colors.text,
                }}
              >
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>
      <AppButton
        label={strings.auth.logout}
        onPress={() => logout()}
        variant="danger"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  modes: { flexDirection: 'row', gap: 8 },
  mode: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
});
