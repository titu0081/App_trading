import { Watchlist } from '@/features/watchlists/domain/entities/Watchlist';

export interface WatchlistRepository {
  getAll(): Promise<Watchlist[]>;
  getById(id: string): Promise<Watchlist>;
  create(name: string): Promise<Watchlist>;
  delete(id: string): Promise<void>;
  addAsset(watchlistId: string, assetId: string): Promise<void>;
  removeAsset(watchlistId: string, assetId: string): Promise<void>;
}
