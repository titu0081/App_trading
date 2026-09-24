import { act, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AppThemeProvider, useAppTheme } from '@/providers/AppThemeProvider';
import { darkColors, lightColors } from '@/shared/theme';
import { usePreferencesStore } from '@/store/preferencesStore';

function ThemeProbe() {
  const { colors, mode } = useAppTheme();
  return <Text>{`${mode}:${colors.background}`}</Text>;
}

describe('AppThemeProvider', () => {
  afterEach(async () => {
    await act(async () => {
      usePreferencesStore.setState({ theme: 'system' });
    });
  });

  it('updates every consumer when the global theme preference changes', async () => {
    usePreferencesStore.setState({ theme: 'light' });
    await render(
      <AppThemeProvider>
        <ThemeProbe />
      </AppThemeProvider>,
    );

    expect(
      screen.getByText(`light:${lightColors.background}`),
    ).toBeOnTheScreen();

    await act(async () => {
      usePreferencesStore.getState().setTheme('dark');
    });

    expect(screen.getByText(`dark:${darkColors.background}`)).toBeOnTheScreen();
  });
});
