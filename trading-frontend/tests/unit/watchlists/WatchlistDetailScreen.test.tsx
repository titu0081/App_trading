import { fireEvent, render } from '@testing-library/react-native';

import * as marketHooks from '@/features/market/presentation/hooks/useMarket';
import { WatchlistDetailScreen } from '@/features/watchlists/presentation/screens/WatchlistDetailScreen';
import * as watchlistHooks from '@/features/watchlists/presentation/hooks/useWatchlists';
import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { strings } from '@/shared/constants/strings';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'watchlist-1' }),
}));
jest.mock('@/features/market/presentation/hooks/useMarket', () => ({
  useAssets: jest.fn(),
}));
jest.mock('@/features/watchlists/presentation/hooks/useWatchlists', () => ({
  useAddAssetToWatchlist: jest.fn(),
  useRemoveAssetFromWatchlist: jest.fn(),
  useWatchlist: jest.fn(),
}));

describe('WatchlistDetailScreen', () => {
  it('adds and removes assets from the visible controls', async () => {
    const mutateAdd = jest.fn();
    const mutateRemove = jest.fn();
    jest.mocked(watchlistHooks.useWatchlist).mockReturnValue({
      data: { id: 'watchlist-1', name: 'Tecnología', assetIds: ['asset-1'] },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof watchlistHooks.useWatchlist>);
    jest.mocked(marketHooks.useAssets).mockReturnValue({
      data: [
        {
          id: 'asset-1',
          symbol: 'AAPL',
          name: 'Apple',
          type: 'stock',
          sourceApi: 'twelvedata',
        },
        {
          id: 'asset-2',
          symbol: 'MSFT',
          name: 'Microsoft',
          type: 'stock',
          sourceApi: 'twelvedata',
        },
      ],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof marketHooks.useAssets>);
    jest.mocked(watchlistHooks.useAddAssetToWatchlist).mockReturnValue({
      mutate: mutateAdd,
      error: null,
    } as unknown as ReturnType<typeof watchlistHooks.useAddAssetToWatchlist>);
    jest.mocked(watchlistHooks.useRemoveAssetFromWatchlist).mockReturnValue({
      mutate: mutateRemove,
      error: null,
    } as unknown as ReturnType<
      typeof watchlistHooks.useRemoveAssetFromWatchlist
    >);

    const screen = await render(<WatchlistDetailScreen />, {
      wrapper: AppThemeProvider,
    });
    await fireEvent.press(
      screen.getByRole('button', { name: strings.watchlists.removeAsset }),
    );
    await fireEvent.press(
      screen.getByRole('button', { name: strings.watchlists.addAsset }),
    );

    expect(mutateRemove).toHaveBeenCalledWith('asset-1');
    expect(mutateAdd).toHaveBeenCalledWith('asset-2');
  });

  it('shows asset-query errors', async () => {
    jest.mocked(watchlistHooks.useWatchlist).mockReturnValue({
      data: { id: 'watchlist-1', name: 'Tecnología', assetIds: [] },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof watchlistHooks.useWatchlist>);
    jest.mocked(marketHooks.useAssets).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('No se pudieron cargar los activos.'),
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof marketHooks.useAssets>);
    jest.mocked(watchlistHooks.useAddAssetToWatchlist).mockReturnValue({
      mutate: jest.fn(),
      error: null,
    } as unknown as ReturnType<typeof watchlistHooks.useAddAssetToWatchlist>);
    jest.mocked(watchlistHooks.useRemoveAssetFromWatchlist).mockReturnValue({
      mutate: jest.fn(),
      error: null,
    } as unknown as ReturnType<
      typeof watchlistHooks.useRemoveAssetFromWatchlist
    >);

    const screen = await render(<WatchlistDetailScreen />, {
      wrapper: AppThemeProvider,
    });

    expect(screen.getByText('No se pudieron cargar los activos.')).toBeTruthy();
  });

  it('shows add and remove mutation errors', async () => {
    jest.mocked(watchlistHooks.useWatchlist).mockReturnValue({
      data: { id: 'watchlist-1', name: 'Tecnología', assetIds: [] },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof watchlistHooks.useWatchlist>);
    jest.mocked(marketHooks.useAssets).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof marketHooks.useAssets>);
    jest.mocked(watchlistHooks.useAddAssetToWatchlist).mockReturnValue({
      mutate: jest.fn(),
      error: new Error('No se pudo añadir el activo.'),
    } as unknown as ReturnType<typeof watchlistHooks.useAddAssetToWatchlist>);
    jest.mocked(watchlistHooks.useRemoveAssetFromWatchlist).mockReturnValue({
      mutate: jest.fn(),
      error: new Error('No se pudo quitar el activo.'),
    } as unknown as ReturnType<
      typeof watchlistHooks.useRemoveAssetFromWatchlist
    >);

    const screen = await render(<WatchlistDetailScreen />, {
      wrapper: AppThemeProvider,
    });

    expect(screen.getByText('No se pudo añadir el activo.')).toBeTruthy();
    expect(screen.getByText('No se pudo quitar el activo.')).toBeTruthy();
  });
});
