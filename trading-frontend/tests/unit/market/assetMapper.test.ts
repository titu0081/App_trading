import { mapAssetDto } from '@/features/market/data/mappers/assetMapper';

describe('mapAssetDto', () => {
  it('maps the backend asset contract to the domain entity', () => {
    expect(
      mapAssetDto({
        id: 'asset-1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'stock',
        source_api: 'finnhub',
      }),
    ).toEqual({
      id: 'asset-1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'stock',
      sourceApi: 'finnhub',
    });
  });
});
