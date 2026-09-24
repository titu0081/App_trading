import { WatchlistRepository } from '@/features/watchlists/domain/repositories/WatchlistRepository';

export class GetWatchlist {
  constructor(private readonly repository: WatchlistRepository) {}

  execute(id: string) {
    return this.repository.getById(id);
  }
}
