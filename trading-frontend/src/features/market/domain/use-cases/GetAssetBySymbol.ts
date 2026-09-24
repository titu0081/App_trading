import { MarketRepository } from '@/features/market/domain/repositories/MarketRepository';

export class GetAssetBySymbol {
  constructor(private readonly repository: MarketRepository) {}

  execute(symbol: string) {
    return this.repository.getAssetBySymbol(symbol.trim().toUpperCase());
  }
}
