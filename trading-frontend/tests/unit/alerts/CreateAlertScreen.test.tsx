import { render, screen, userEvent } from '@testing-library/react-native';

import * as alertHooks from '@/features/alerts/presentation/hooks/useAlerts';
import { CreateAlertScreen } from '@/features/alerts/presentation/screens/CreateAlertScreen';
import * as marketHooks from '@/features/market/presentation/hooks/useMarket';
import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { strings } from '@/shared/constants/strings';

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: () => ({}),
}));
jest.mock('@/features/alerts/presentation/hooks/useAlerts', () => ({
  useCreateAlert: jest.fn(),
}));
jest.mock('@/features/market/presentation/hooks/useMarket', () => ({
  useAssets: jest.fn(),
}));

describe('CreateAlertScreen', () => {
  it('creates a price alert with the selected asset, condition and target', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn();
    jest.mocked(marketHooks.useAssets).mockReturnValue({
      data: [
        {
          id: 'asset-1',
          symbol: 'AAPL',
          name: 'Apple',
          type: 'stock',
          sourceApi: 'finnhub',
        },
      ],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof marketHooks.useAssets>);
    jest.mocked(alertHooks.useCreateAlert).mockReturnValue({
      mutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof alertHooks.useCreateAlert>);

    await render(<CreateAlertScreen />, { wrapper: AppThemeProvider });
    await user.press(screen.getByRole('button', { name: 'AAPL' }));
    await user.press(
      screen.getByRole('button', { name: strings.alerts.below }),
    );
    await user.type(screen.getByLabelText(strings.alerts.target), '125');
    await user.press(
      screen.getByRole('button', { name: strings.common.create }),
    );

    expect(mutate).toHaveBeenCalledWith(
      {
        assetId: 'asset-1',
        type: 'price_target',
        condition: 'below',
        targetValue: 125,
      },
      expect.any(Object),
    );
  });

  it('shows an asset loading error with retry', async () => {
    const refetch = jest.fn();
    jest.mocked(marketHooks.useAssets).mockReturnValue({
      data: undefined,
      error: new Error('No se pudieron cargar los activos.'),
      isLoading: false,
      isError: true,
      refetch,
    } as unknown as ReturnType<typeof marketHooks.useAssets>);
    jest.mocked(alertHooks.useCreateAlert).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof alertHooks.useCreateAlert>);

    await render(<CreateAlertScreen />, { wrapper: AppThemeProvider });

    expect(
      screen.getByText('No se pudieron cargar los activos.'),
    ).toBeOnTheScreen();
  });
});
