import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { environment } from '@/infrastructure/config/env';

export function createSupabaseClient() {
  return createClient(environment.supabaseUrl, environment.supabasePublishableKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}
