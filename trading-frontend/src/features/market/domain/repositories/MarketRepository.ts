import { ChartPoint } from '@/features/charts/domain/models/ChartPoint';
import { MarketInterval } from '@/features/charts/domain/models/MarketInterval';
import { Asset, AssetType } from '@/features/market/domain/entities/Asset';
import { AssetPrice } from '@/features/market/domain/entities/AssetPrice';

export interface MarketRepository {
  getAssets(assetType?: AssetType): Promise<Asset[]>;
  getAssetBySymbol(symbol: string): Promise<Asset>;
  getPrice(symbol: string): Promise<AssetPrice>;
  getHistoricalPrices(
    symbol: string,
    interval: MarketInterval,
  ): Promise<ChartPoint[]>;
}
