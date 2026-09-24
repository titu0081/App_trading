import { WatchlistRepository } from '@/features/watchlists/domain/repositories/WatchlistRepository';
import { strings } from '@/shared/constants/strings';
import { ApplicationError } from '@/shared/errors/ApplicationError';

export class CreateWatchlist {
  constructor(private readonly repository: WatchlistRepository) {}

  execute(name: string) {
    const normalizedName = name.trim();
    if (!normalizedName)
      throw new ApplicationError('VALIDATION', strings.watchlists.requiredName);
    return this.repository.create(normalizedName);
  }
}
