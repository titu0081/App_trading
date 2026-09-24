import { Watchlist } from '@/features/watchlists/domain/entities/Watchlist';

export interface WatchlistDto {
  id: string;
  user_id: string;
  name: string;
  asset_ids: string[];
}

export function mapWatchlistDto(value: WatchlistDto): Watchlist {
  return {
    id: value.id,
    name: value.name,
    assetIds: value.asset_ids,
  };
}
