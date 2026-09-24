import { useQuery } from '@tanstack/react-query';

import {
  getAssetBySymbol,
  getAssetPrice,
  getAssets,
  getHistoricalPrices,
} from '@/infrastructure/composition';
import { useMarketFiltersStore } from '@/store/marketFiltersStore';

export function useAssets() {
  const assetType = useMarketFiltersStore((state) => state.assetType);
  return useQuery({
    queryKey: ['assets', assetType],
    queryFn: () =>
      getAssets.execute(assetType === 'all' ? undefined : assetType),
  });
}

export function useAsset(symbol: string) {
  return useQuery({
    queryKey: ['asset', symbol],
    queryFn: () => getAssetBySymbol.execute(symbol),
    enabled: Boolean(symbol),
  });
}

export function useAssetPrice(symbol: string) {
  return useQuery({
    queryKey: ['asset-price', symbol],
    queryFn: () => getAssetPrice.execute(symbol),
    enabled: Boolean(symbol),
    refetchInterval: 15_000,
  });
}

export function useHistoricalPrices(symbol: string) {
  const interval = useMarketFiltersStore((state) => state.interval);
  return useQuery({
    queryKey: ['asset-history', symbol, interval],
    queryFn: () => getHistoricalPrices.execute(symbol, interval),
    enabled: Boolean(symbol),
  });
}
