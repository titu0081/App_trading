import { ApiMarketRepository } from '@/features/market/data/repositories/ApiMarketRepository';
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

describe('ApiMarketRepository', () => {
  it('maps assets and sends the selected type as an API parameter', async () => {
    const client = createClient();
    client.get.mockResolvedValue([
      {
        id: 'asset-1',
        symbol: 'BTCUSD',
        name: 'Bitcoin',
        type: 'crypto',
        source_api: 'twelvedata',
      },
    ]);
    const repository = new ApiMarketRepository(client);

    await expect(repository.getAssets('crypto')).resolves.toEqual([
      {
        id: 'asset-1',
        symbol: 'BTCUSD',
        name: 'Bitcoin',
        type: 'crypto',
        sourceApi: 'twelvedata',
      },
    ]);
    expect(client.get).toHaveBeenCalledWith('/market/assets', {
      params: { asset_type: 'crypto' },
    });
  });

  it('uses the centralized not-found message', async () => {
    const client = createClient();
    client.get.mockResolvedValue([]);
    const repository = new ApiMarketRepository(client);

    await expect(repository.getAssetBySymbol('missing')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: strings.market.assetNotFound,
    });
  });

  it('requests and maps historical prices for the selected interval', async () => {
    const client = createClient();
    client.get.mockResolvedValue([
      { timestamp: 1_700_000_000, price: 189.5, volume: 10 },
    ]);
    const repository = new ApiMarketRepository(client);

    await expect(
      repository.getHistoricalPrices('AAPL/USD', '1W'),
    ).resolves.toEqual([{ timestamp: 1_700_000_000_000, value: 189.5 }]);
    expect(client.get).toHaveBeenCalledWith('/market/history/AAPL%2FUSD', {
      params: { interval: '1W' },
    });
  });
});
