import { render, screen } from '@testing-library/react-native';

import * as marketHooks from '@/features/market/presentation/hooks/useMarket';
import { AssetDetailScreen } from '@/features/market/presentation/screens/AssetDetailScreen';
import * as priceStreamHooks from '@/features/market/presentation/hooks/usePriceStream';
import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { strings } from '@/shared/constants/strings';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ symbol: 'AAPL' }),
}));
jest.mock('@/features/market/presentation/hooks/useMarket', () => ({
  useAsset: jest.fn(),
  useAssetPrice: jest.fn(),
  useHistoricalPrices: jest.fn(),
}));
jest.mock('@/features/market/presentation/hooks/usePriceStream', () => ({
  usePriceStream: jest.fn(),
}));

describe('AssetDetailScreen charts', () => {
  it('requests history for the route symbol and renders its loading state', async () => {
    jest.mocked(marketHooks.useAsset).mockReturnValue({
      data: {
        id: 'asset-1',
        symbol: 'AAPL',
        name: 'Apple',
        type: 'stock',
        sourceApi: 'finnhub',
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof marketHooks.useAsset>);
    jest.mocked(marketHooks.useAssetPrice).mockReturnValue({
      data: { symbol: 'AAPL', price: 190 },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof marketHooks.useAssetPrice>);
    jest.mocked(marketHooks.useHistoricalPrices).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof marketHooks.useHistoricalPrices>);
    jest.mocked(priceStreamHooks.usePriceStream).mockReturnValue({
      latestPrice: undefined,
    } as ReturnType<typeof priceStreamHooks.usePriceStream>);

    await render(
      <AppThemeProvider>
        <AssetDetailScreen />
      </AppThemeProvider>,
    );

    expect(marketHooks.useHistoricalPrices).toHaveBeenCalledWith('AAPL');
    expect(screen.getByText(strings.common.loading)).toBeOnTheScreen();
    expect(screen.getByText('1D')).toBeOnTheScreen();
  });
});
