import { MarketRepository } from '@/features/market/domain/repositories/MarketRepository';

export class GetAssetPrice {
  constructor(private readonly repository: MarketRepository) {}

  execute(symbol: string) {
    return this.repository.getPrice(symbol.trim().toUpperCase());
  }
}
