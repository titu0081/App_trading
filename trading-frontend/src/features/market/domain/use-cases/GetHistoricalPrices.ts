import { MarketInterval } from '@/features/charts/domain/models/MarketInterval';
import { MarketRepository } from '@/features/market/domain/repositories/MarketRepository';

export class GetHistoricalPrices {
  constructor(private readonly repository: MarketRepository) {}

  execute(symbol: string, interval: MarketInterval) {
    return this.repository.getHistoricalPrices(symbol, interval);
  }
}
