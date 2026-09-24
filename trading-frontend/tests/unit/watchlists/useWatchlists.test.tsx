import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import {
  useAddAssetToWatchlist,
  useCreateWatchlist,
  useDeleteWatchlist,
  useRemoveAssetFromWatchlist,
} from '@/features/watchlists/presentation/hooks/useWatchlists';
import {
  addAssetToWatchlist,
  createWatchlist,
  deleteWatchlist,
  removeAssetFromWatchlist,
} from '@/infrastructure/composition';

jest.mock('@/infrastructure/composition', () => ({
  addAssetToWatchlist: { execute: jest.fn() },
  createWatchlist: { execute: jest.fn() },
  deleteWatchlist: { execute: jest.fn() },
  getWatchlist: { execute: jest.fn() },
  getWatchlists: { execute: jest.fn() },
  removeAssetFromWatchlist: { execute: jest.fn() },
}));

const mockAddAsset = jest.mocked(addAssetToWatchlist.execute);
const mockCreate = jest.mocked(createWatchlist.execute);
const mockDelete = jest.mocked(deleteWatchlist.execute);
const mockRemoveAsset = jest.mocked(removeAssetFromWatchlist.execute);

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('watchlist mutations', () => {
  let queryClient: QueryClient;
  let invalidateQueries: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    invalidateQueries = jest
      .spyOn(queryClient, 'invalidateQueries')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('creates and deletes through use cases, then invalidates the list', async () => {
    mockCreate.mockResolvedValue({
      id: 'watchlist-1',
      name: 'Tecnología',
      assetIds: [],
    });
    mockDelete.mockResolvedValue(undefined);
    const wrapper = createWrapper(queryClient);
    const hook = await renderHook(
      () => ({ create: useCreateWatchlist(), delete: useDeleteWatchlist() }),
      { wrapper },
    );

    await act(async () => hook.result.current.create.mutateAsync('Tecnología'));
    await act(async () =>
      hook.result.current.delete.mutateAsync('watchlist-1'),
    );

    expect(mockCreate).toHaveBeenCalledWith('Tecnología');
    expect(mockDelete).toHaveBeenCalledWith('watchlist-1');
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['watchlists'],
    });

    hook.unmount();
  });

  it('adds and removes through use cases, then invalidates detail and list caches', async () => {
    mockAddAsset.mockResolvedValue(undefined);
    mockRemoveAsset.mockResolvedValue(undefined);
    const wrapper = createWrapper(queryClient);
    const hook = await renderHook(
      () => ({
        add: useAddAssetToWatchlist('watchlist-1'),
        remove: useRemoveAssetFromWatchlist('watchlist-1'),
      }),
      { wrapper },
    );

    await act(async () => hook.result.current.add.mutateAsync('asset-1'));
    await act(async () => hook.result.current.remove.mutateAsync('asset-1'));

    expect(mockAddAsset).toHaveBeenCalledWith('watchlist-1', 'asset-1');
    expect(mockRemoveAsset).toHaveBeenCalledWith('watchlist-1', 'asset-1');
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['watchlist', 'watchlist-1'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['watchlists'],
    });

    hook.unmount();
  });
});
