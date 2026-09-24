import {
  appendLivePrice,
  mapHistoricalPriceDtos,
} from '@/features/charts/data/mappers/chartMapper';

describe('mapHistoricalPriceDtos', () => {
  it('maps, sorts and removes invalid historical points', () => {
    expect(
      mapHistoricalPriceDtos([
        { timestamp: 30, price: 103, volume: 4 },
        { timestamp: 10, price: 101, volume: null },
        { timestamp: 20, price: Number.NaN, volume: 2 },
      ]),
    ).toEqual([
      { timestamp: 10_000, value: 101 },
      { timestamp: 30_000, value: 103 },
    ]);
  });

  it('appends a live price without mutating historical data', () => {
    const history = [{ timestamp: 1_000, value: 100 }];

    expect(appendLivePrice(history, 105, 2_000)).toEqual([
      ...history,
      { timestamp: 2_000, value: 105 },
    ]);
    expect(history).toHaveLength(1);
  });
});
