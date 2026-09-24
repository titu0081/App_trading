import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/providers/AppThemeProvider';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { AppText } from '@/shared/components/AppText';
import { strings } from '@/shared/constants/strings';

function createSchema(mode: AuthFormProps['mode']) {
  return z
    .object({
      email: z.string().email(strings.auth.invalidEmail),
      password: z.string().min(6, strings.auth.shortPassword),
      confirmPassword: z.string(),
    })
    .refine(
      ({ password, confirmPassword }) =>
        mode === 'login' || password === confirmPassword,
      {
        message: strings.auth.passwordMismatch,
        path: ['confirmPassword'],
      },
    );
}

type FormValues = z.infer<ReturnType<typeof createSchema>>;

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const { colors } = useAppTheme();
  const auth = useAuth();
  const { control, handleSubmit, formState, setError } = useForm<FormValues>({
    resolver: zodResolver(createSchema(mode)),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await auth[mode](values.email, values.password);
    } catch (error) {
      setError('root', {
        message:
          error instanceof Error ? error.message : strings.common.unknownError,
      });
    }
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <AppInput
            autoCapitalize="none"
            autoComplete="email"
            error={fieldState.error?.message}
            keyboardType="email-address"
            label={strings.auth.email}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <AppInput
            autoCapitalize="none"
            error={fieldState.error?.message}
            label={strings.auth.password}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            secureTextEntry
            value={field.value}
          />
        )}
      />
      {mode === 'register' ? (
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <AppInput
              autoCapitalize="none"
              error={fieldState.error?.message}
              label={strings.auth.confirmPassword}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              secureTextEntry
              value={field.value}
            />
          )}
        />
      ) : null}
      {formState.errors.root?.message ? (
        <AppText variant="caption" style={{ color: colors.error }}>
          {formState.errors.root.message}
        </AppText>
      ) : null}
      <AppButton
        label={mode === 'login' ? strings.auth.login : strings.auth.register}
        loading={formState.isSubmitting}
        onPress={submit}
      />
      <Link
        href={mode === 'login' ? '/register' : '/login'}
        style={[styles.link, { color: colors.accent }]}
      >
        {mode === 'login' ? strings.auth.goToRegister : strings.auth.goToLogin}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16, width: '100%' },
  link: {
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 8,
    textAlign: 'center',
  },
});
