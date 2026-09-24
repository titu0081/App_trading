import { AssetType } from '@/features/market/domain/entities/Asset';
import { MarketRepository } from '@/features/market/domain/repositories/MarketRepository';

export class GetAssets {
  constructor(private readonly repository: MarketRepository) {}

  execute(assetType?: AssetType) {
    return this.repository.getAssets(assetType);
  }
}
