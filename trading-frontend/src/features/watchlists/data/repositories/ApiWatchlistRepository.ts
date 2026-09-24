import {
  mapWatchlistDto,
  WatchlistDto,
} from '@/features/watchlists/data/mappers/watchlistMapper';
import { WatchlistRepository } from '@/features/watchlists/domain/repositories/WatchlistRepository';
import { ApiClient } from '@/infrastructure/api/ApiClient';
import { strings } from '@/shared/constants/strings';
import { ApplicationError } from '@/shared/errors/ApplicationError';

export class ApiWatchlistRepository implements WatchlistRepository {
  constructor(private readonly client: ApiClient) {}
  async getAll() {
    return (await this.client.get<WatchlistDto[]>('/watchlists')).map(
      mapWatchlistDto,
    );
  }
  async getById(id: string) {
    const value = (await this.getAll()).find((item) => item.id === id);
    if (!value)
      throw new ApplicationError('NOT_FOUND', strings.watchlists.notFound);
    return value;
  }
  async create(name: string) {
    return mapWatchlistDto(
      await this.client.post<WatchlistDto, { name: string }>('/watchlists', {
        name,
      }),
    );
  }
  delete(id: string) {
    return this.client.delete<void>(`/watchlists/${id}`);
  }
  addAsset(watchlistId: string, assetId: string) {
    return this.client.post<void, { asset_id: string }>(
      `/watchlists/${watchlistId}/assets`,
      { asset_id: assetId },
    );
  }
  removeAsset(watchlistId: string, assetId: string) {
    return this.client.delete<void>(
      `/watchlists/${watchlistId}/assets/${assetId}`,
    );
  }
}
