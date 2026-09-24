import { Platform } from 'react-native';

import { createSupabaseClient as createNativeSupabaseClient } from './supabaseCliente.native';
import { createSupabaseClient as createWebSupabaseClient } from './supabaseCliente.web';

export function createSupabaseClient() {
  if (Platform.OS === 'web') {
    return createWebSupabaseClient();
  }

  return createNativeSupabaseClient();
}