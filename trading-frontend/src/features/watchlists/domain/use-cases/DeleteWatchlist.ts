import { WatchlistRepository } from '@/features/watchlists/domain/repositories/WatchlistRepository';

export class DeleteWatchlist {
  constructor(private readonly repository: WatchlistRepository) {}

  execute(id: string) {
    return this.repository.delete(id);
  }
}
