import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import { useHistoricalPrices } from '@/features/market/presentation/hooks/useMarket';
import { getHistoricalPrices } from '@/infrastructure/composition';
import { useMarketFiltersStore } from '@/store/marketFiltersStore';

jest.mock('@/infrastructure/composition', () => ({
  getAssetBySymbol: { execute: jest.fn() },
  getAssetPrice: { execute: jest.fn() },
  getAssets: { execute: jest.fn() },
  getHistoricalPrices: { execute: jest.fn() },
}));

const mockGetHistoricalPrices = jest.mocked(getHistoricalPrices.execute);

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useHistoricalPrices', () => {
  it('requests history again when the global interval changes', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    useMarketFiltersStore.setState({ interval: '1D' });
    mockGetHistoricalPrices.mockResolvedValue([]);
    const hook = await renderHook(() => useHistoricalPrices('AAPL'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetHistoricalPrices).toHaveBeenCalledWith('AAPL', '1D');
    });

    await act(async () => {
      useMarketFiltersStore.getState().setInterval('1M');
    });

    await waitFor(() => {
      expect(mockGetHistoricalPrices).toHaveBeenCalledWith('AAPL', '1M');
    });

    hook.unmount();
    queryClient.clear();
  });
});
