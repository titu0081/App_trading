export type AssetType = 'stock' | 'crypto' | 'forex' | 'index';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  sourceApi: string;
}
