import { AssetPrice } from '@/features/market/domain/entities/AssetPrice';

export type PriceStreamStatus =
  'connecting' | 'connected' | 'reconnecting' | 'closed';

export interface PriceStream {
  subscribe(
    symbol: string,
    source: string,
    onPrice: (price: AssetPrice) => void,
    onStatus?: (status: PriceStreamStatus) => void,
  ): () => void;
}
