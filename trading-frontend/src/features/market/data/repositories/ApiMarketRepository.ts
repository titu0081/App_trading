import {
  HistoricalPriceDto,
  mapHistoricalPriceDtos,
} from '@/features/charts/data/mappers/chartMapper';
import { MarketInterval } from '@/features/charts/domain/models/MarketInterval';
import {
  AssetDto,
  mapAssetDto,
} from '@/features/market/data/mappers/assetMapper';
import { AssetType } from '@/features/market/domain/entities/Asset';
import { AssetPrice } from '@/features/market/domain/entities/AssetPrice';
import { MarketRepository } from '@/features/market/domain/repositories/MarketRepository';
import { ApiClient } from '@/infrastructure/api/ApiClient';
import { strings } from '@/shared/constants/strings';
import { ApplicationError } from '@/shared/errors/ApplicationError';

export class ApiMarketRepository implements MarketRepository {
  constructor(private readonly client: ApiClient) {}

  async getAssets(assetType?: AssetType) {
    const values = await this.client.get<AssetDto[]>('/market/assets', {
      params: assetType ? { asset_type: assetType } : undefined,
    });
    return values.map(mapAssetDto);
  }

  async getAssetBySymbol(symbol: string) {
    const asset = (await this.getAssets()).find(
      (item) => item.symbol === symbol.toUpperCase(),
    );
    if (!asset)
      throw new ApplicationError('NOT_FOUND', strings.market.assetNotFound);
    return asset;
  }

  getPrice(symbol: string) {
    return this.client.get<AssetPrice>(
      `/market/price/${encodeURIComponent(symbol)}`,
    );
  }

  async getHistoricalPrices(symbol: string, interval: MarketInterval) {
    const values = await this.client.get<HistoricalPriceDto[]>(
      `/market/history/${encodeURIComponent(symbol)}`,
      { params: { interval } },
    );
    return mapHistoricalPriceDtos(values);
  }
}
