import { ApplicationError } from '@/shared/errors/ApplicationError';

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new ApplicationError(
      'VALIDATION',
      `Missing environment variable: ${name}`,
    );
  }

  return value;
}

export const environment = {
  get apiUrl() {
    return required('EXPO_PUBLIC_API_URL', process.env.EXPO_PUBLIC_API_URL);
  },
  get websocketUrl() {
    return required('EXPO_PUBLIC_WS_URL', process.env.EXPO_PUBLIC_WS_URL);
  },
  get supabaseUrl() {
    return required(
      'EXPO_PUBLIC_SUPABASE_URL',
      process.env.EXPO_PUBLIC_SUPABASE_URL,
    );
  },
  get supabasePublishableKey() {
    return required(
      'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
  },
};
