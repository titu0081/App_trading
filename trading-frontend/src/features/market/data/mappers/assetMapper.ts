import { Asset, AssetType } from '@/features/market/domain/entities/Asset';

export interface AssetDto {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  source_api: string;
}

export function mapAssetDto({ source_api, ...asset }: AssetDto): Asset {
  return { ...asset, sourceApi: source_api };
}
