import { PropsWithChildren } from 'react';

import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AppThemeProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </AppThemeProvider>
  );
}
