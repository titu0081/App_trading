import { mapWatchlistDto } from '@/features/watchlists/data/mappers/watchlistMapper';

describe('mapWatchlistDto', () => {
  it('maps the backend watchlist contract to the domain entity', () => {
    expect(
      mapWatchlistDto({
        id: 'watchlist-1',
        user_id: 'user-1',
        name: 'Tecnología',
        asset_ids: ['asset-1', 'asset-2'],
      }),
    ).toEqual({
      id: 'watchlist-1',
      name: 'Tecnología',
      assetIds: ['asset-1', 'asset-2'],
    });
  });
});
