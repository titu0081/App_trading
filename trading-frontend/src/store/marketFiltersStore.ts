import { create } from 'zustand';

import { MarketInterval } from '@/features/charts/domain/models/MarketInterval';

export type AssetTypeFilter = 'all' | 'stock' | 'crypto' | 'forex' | 'index';
export type { MarketInterval } from '@/features/charts/domain/models/MarketInterval';

interface MarketFiltersState {
  assetType: AssetTypeFilter;
  interval: MarketInterval;
  search: string;
  setAssetType: (assetType: AssetTypeFilter) => void;
  setInterval: (interval: MarketInterval) => void;
  setSearch: (search: string) => void;
}

export const useMarketFiltersStore = create<MarketFiltersState>((set) => ({
  assetType: 'all',
  interval: '1D',
  search: '',
  setAssetType: (assetType) => set({ assetType }),
  setInterval: (interval) => set({ interval }),
  setSearch: (search) => set({ search }),
}));
