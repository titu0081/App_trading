import { ApiWatchlistRepository } from '@/features/watchlists/data/repositories/ApiWatchlistRepository';
import { ApiClient } from '@/infrastructure/api/ApiClient';
import { strings } from '@/shared/constants/strings';

function createClient(): jest.Mocked<ApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
}

describe('ApiWatchlistRepository', () => {
  it('maps list and create responses from the backend contract', async () => {
    const client = createClient();
    const dto = {
      id: 'watchlist-1',
      user_id: 'user-1',
      name: 'Tecnología',
      asset_ids: ['asset-1'],
    };
    client.get.mockResolvedValue([dto]);
    client.post.mockResolvedValue(dto);
    const repository = new ApiWatchlistRepository(client);

    await expect(repository.getAll()).resolves.toEqual([
      { id: 'watchlist-1', name: 'Tecnología', assetIds: ['asset-1'] },
    ]);
    await expect(repository.create('Tecnología')).resolves.toEqual({
      id: 'watchlist-1',
      name: 'Tecnología',
      assetIds: ['asset-1'],
    });
    expect(client.get).toHaveBeenCalledWith('/watchlists');
    expect(client.post).toHaveBeenCalledWith('/watchlists', {
      name: 'Tecnología',
    });
  });

  it('uses the list endpoint for detail and reports a missing watchlist', async () => {
    const client = createClient();
    client.get.mockResolvedValue([]);
    const repository = new ApiWatchlistRepository(client);

    await expect(repository.getById('missing')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: strings.watchlists.notFound,
    });
  });

  it('calls delete, add and remove endpoints with the expected payloads', async () => {
    const client = createClient();
    const repository = new ApiWatchlistRepository(client);

    await repository.delete('watchlist-1');
    await repository.addAsset('watchlist-1', 'asset-1');
    await repository.removeAsset('watchlist-1', 'asset-1');

    expect(client.delete).toHaveBeenCalledWith('/watchlists/watchlist-1');
    expect(client.post).toHaveBeenCalledWith('/watchlists/watchlist-1/assets', {
      asset_id: 'asset-1',
    });
    expect(client.delete).toHaveBeenCalledWith(
      '/watchlists/watchlist-1/assets/asset-1',
    );
  });
});
