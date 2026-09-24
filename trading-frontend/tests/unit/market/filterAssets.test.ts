import { filterAssets } from '@/features/market/domain/services/filterAssets';

const assets = [
  {
    id: '1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    sourceApi: 'finnhub',
  },
  {
    id: '2',
    symbol: 'BTCUSD',
    name: 'Bitcoin',
    type: 'crypto',
    sourceApi: 'twelvedata',
  },
] as const;

describe('filterAssets', () => {
  it('matches symbols and names without case or surrounding whitespace', () => {
    expect(filterAssets(assets, '  apple ')).toEqual([assets[0]]);
    expect(filterAssets(assets, 'btcusd')).toEqual([assets[1]]);
  });

  it('returns every asset for an empty search', () => {
    expect(filterAssets(assets, '   ')).toEqual(assets);
  });
});
