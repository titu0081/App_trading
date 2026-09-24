import { WatchlistRepository } from '@/features/watchlists/domain/repositories/WatchlistRepository';

export class RemoveAssetFromWatchlist {
  constructor(private readonly repository: WatchlistRepository) {}

  execute(watchlistId: string, assetId: string) {
    return this.repository.removeAsset(watchlistId, assetId);
  }
}
