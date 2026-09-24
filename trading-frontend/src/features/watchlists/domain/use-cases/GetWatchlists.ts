import { WatchlistRepository } from '@/features/watchlists/domain/repositories/WatchlistRepository';

export class GetWatchlists {
  constructor(private readonly repository: WatchlistRepository) {}

  execute() {
    return this.repository.getAll();
  }
}
