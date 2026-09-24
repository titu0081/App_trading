import { Asset } from '@/features/market/domain/entities/Asset';

export function filterAssets<TAsset extends Asset>(
  assets: readonly TAsset[],
  search: string,
): TAsset[] {
  const normalizedSearch = search.trim().toLocaleLowerCase();
  if (!normalizedSearch) return [...assets];

  return assets.filter((asset) =>
    `${asset.symbol} ${asset.name}`
      .toLocaleLowerCase()
      .includes(normalizedSearch),
  );
}
