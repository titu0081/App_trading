import { AssetType } from '@/features/market/domain/entities/Asset';
import { MarketRepository } from '@/features/market/domain/repositories/MarketRepository';
import { GetAssetBySymbol } from '@/features/market/domain/use-cases/GetAssetBySymbol';
import { GetAssetPrice } from '@/features/market/domain/use-cases/GetAssetPrice';
import { GetAssets } from '@/features/market/domain/use-cases/GetAssets';
import { GetHistoricalPrices } from '@/features/market/domain/use-cases/GetHistoricalPrices';

function createRepository(): jest.Mocked<MarketRepository> {
  return {
    getAssets: jest.fn(),
    getAssetBySymbol: jest.fn(),
    getPrice: jest.fn(),
    getHistoricalPrices: jest.fn(),
  };
}

describe('market use cases', () => {
  it('delegates asset listing with the selected type', async () => {
    const repository = createRepository();
    repository.getAssets.mockResolvedValue([]);

    await new GetAssets(repository).execute('crypto' satisfies AssetType);

    expect(repository.getAssets).toHaveBeenCalledWith('crypto');
  });

  it('normalizes symbols used for detail and price requests', async () => {
    const repository = createRepository();
    repository.getAssetBySymbol.mockResolvedValue({
      id: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'stock',
      sourceApi: 'finnhub',
    });
    repository.getPrice.mockResolvedValue({ symbol: 'AAPL', price: 100 });

    await new GetAssetBySymbol(repository).execute(' aapl ');
    await new GetAssetPrice(repository).execute(' aapl ');

    expect(repository.getAssetBySymbol).toHaveBeenCalledWith('AAPL');
    expect(repository.getPrice).toHaveBeenCalledWith('AAPL');
  });

  it('delegates historical prices with symbol and interval', async () => {
    const repository = createRepository();
    repository.getHistoricalPrices.mockResolvedValue([]);

    await new GetHistoricalPrices(repository).execute('AAPL', '1M');

    expect(repository.getHistoricalPrices).toHaveBeenCalledWith('AAPL', '1M');
  });
});
