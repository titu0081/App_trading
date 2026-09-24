import { RenderOptions, render } from '@testing-library/react-native';
import { ReactElement } from 'react';

import { AppProviders } from '@/providers/AppProviders';

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AppProviders, ...options });
}

export * from '@testing-library/react-native';
