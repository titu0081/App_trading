import { WatchlistRepository } from '@/features/watchlists/domain/repositories/WatchlistRepository';

export class AddAssetToWatchlist {
  constructor(private readonly repository: WatchlistRepository) {}

  execute(watchlistId: string, assetId: string) {
    return this.repository.addAsset(watchlistId, assetId);
  }
}
