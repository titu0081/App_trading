import { fireEvent, render } from '@testing-library/react-native';

import { WatchlistsScreen } from '@/features/watchlists/presentation/screens/WatchlistsScreen';
import * as watchlistHooks from '@/features/watchlists/presentation/hooks/useWatchlists';
import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { strings } from '@/shared/constants/strings';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/features/watchlists/presentation/hooks/useWatchlists', () => ({
  useCreateWatchlist: jest.fn(),
  useDeleteWatchlist: jest.fn(),
  useWatchlists: jest.fn(),
}));

describe('WatchlistsScreen', () => {
  it('creates and deletes watchlists from the visible controls', async () => {
    const mutateCreate = jest.fn();
    const mutateDelete = jest.fn();
    jest.mocked(watchlistHooks.useWatchlists).mockReturnValue({
      data: [{ id: 'watchlist-1', name: 'Tecnología', assetIds: [] }],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof watchlistHooks.useWatchlists>);
    jest.mocked(watchlistHooks.useCreateWatchlist).mockReturnValue({
      mutate: mutateCreate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof watchlistHooks.useCreateWatchlist>);
    jest.mocked(watchlistHooks.useDeleteWatchlist).mockReturnValue({
      mutate: mutateDelete,
    } as unknown as ReturnType<typeof watchlistHooks.useDeleteWatchlist>);

    const screen = await render(<WatchlistsScreen />, {
      wrapper: AppThemeProvider,
    });
    await fireEvent.changeText(
      screen.getByPlaceholderText(strings.watchlists.namePlaceholder),
      'Dividendos',
    );
    await fireEvent.press(
      screen.getByRole('button', { name: strings.common.create }),
    );
    await fireEvent.press(
      screen.getByRole('button', { name: strings.common.delete }),
    );

    expect(mutateCreate).toHaveBeenCalledWith('Dividendos', expect.any(Object));
    expect(mutateDelete).toHaveBeenCalledWith('watchlist-1');
  });
});
