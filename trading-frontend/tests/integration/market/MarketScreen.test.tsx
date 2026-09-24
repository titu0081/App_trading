import { render, screen, userEvent } from '@testing-library/react-native';

import { useAssets } from '@/features/market/presentation/hooks/useMarket';
import { MarketScreen } from '@/features/market/presentation/screens/MarketScreen';
import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { strings } from '@/shared/constants/strings';
import { useMarketFiltersStore } from '@/store/marketFiltersStore';

jest.mock('@/features/market/presentation/hooks/useMarket', () => ({
  useAssets: jest.fn(),
}));

const mockUseAssets = jest.mocked(useAssets);

describe('MarketScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useMarketFiltersStore.setState({
      assetType: 'all',
      interval: '1D',
      search: '',
    });
  });

  it('shows the centralized empty state when no assets match', async () => {
    mockUseAssets.mockReturnValue({
      data: [],
      error: null,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAssets>);

    await render(
      <AppThemeProvider>
        <MarketScreen />
      </AppThemeProvider>,
    );

    expect(screen.getByText(strings.common.empty)).toBeOnTheScreen();
  });

  it('shows the query error and retries on demand', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseAssets.mockReturnValue({
      data: undefined,
      error: new Error('Market unavailable'),
      isError: true,
      isLoading: false,
      refetch,
    } as unknown as ReturnType<typeof useAssets>);

    await render(
      <AppThemeProvider>
        <MarketScreen />
      </AppThemeProvider>,
    );

    expect(screen.getByText('Market unavailable')).toBeOnTheScreen();
    await user.press(
      screen.getByRole('button', { name: strings.common.retry }),
    );
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
