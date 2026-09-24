import { WatchlistRepository } from '@/features/watchlists/domain/repositories/WatchlistRepository';
import { AddAssetToWatchlist } from '@/features/watchlists/domain/use-cases/AddAssetToWatchlist';
import { CreateWatchlist } from '@/features/watchlists/domain/use-cases/CreateWatchlist';
import { DeleteWatchlist } from '@/features/watchlists/domain/use-cases/DeleteWatchlist';
import { GetWatchlist } from '@/features/watchlists/domain/use-cases/GetWatchlist';
import { GetWatchlists } from '@/features/watchlists/domain/use-cases/GetWatchlists';
import { RemoveAssetFromWatchlist } from '@/features/watchlists/domain/use-cases/RemoveAssetFromWatchlist';
import { strings } from '@/shared/constants/strings';

const watchlist = { id: 'watchlist-1', name: 'Tecnología', assetIds: [] };

function createRepository(): jest.Mocked<WatchlistRepository> {
  return {
    getAll: jest.fn().mockResolvedValue([watchlist]),
    getById: jest.fn().mockResolvedValue(watchlist),
    create: jest.fn().mockResolvedValue(watchlist),
    delete: jest.fn().mockResolvedValue(undefined),
    addAsset: jest.fn().mockResolvedValue(undefined),
    removeAsset: jest.fn().mockResolvedValue(undefined),
  };
}

describe('watchlist use cases', () => {
  it('rejects an empty name before creating a watchlist', () => {
    const repository = createRepository();

    expect(() => new CreateWatchlist(repository).execute('   ')).toThrow(
      strings.watchlists.requiredName,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('normalizes the name and delegates creation', async () => {
    const repository = createRepository();

    await new CreateWatchlist(repository).execute('  Tecnología  ');

    expect(repository.create).toHaveBeenCalledWith('Tecnología');
  });

  it('delegates reads, deletion, adding, and removal', async () => {
    const repository = createRepository();

    await new GetWatchlists(repository).execute();
    await new GetWatchlist(repository).execute('watchlist-1');
    await new DeleteWatchlist(repository).execute('watchlist-1');
    await new AddAssetToWatchlist(repository).execute('watchlist-1', 'asset-1');
    await new RemoveAssetFromWatchlist(repository).execute(
      'watchlist-1',
      'asset-1',
    );

    expect(repository.getAll).toHaveBeenCalledTimes(1);
    expect(repository.getById).toHaveBeenCalledWith('watchlist-1');
    expect(repository.delete).toHaveBeenCalledWith('watchlist-1');
    expect(repository.addAsset).toHaveBeenCalledWith('watchlist-1', 'asset-1');
    expect(repository.removeAsset).toHaveBeenCalledWith(
      'watchlist-1',
      'asset-1',
    );
  });
});
