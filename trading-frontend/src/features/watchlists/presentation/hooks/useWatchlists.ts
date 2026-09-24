import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addAssetToWatchlist,
  createWatchlist,
  deleteWatchlist,
  getWatchlist,
  getWatchlists,
  removeAssetFromWatchlist,
} from '@/infrastructure/composition';

const watchlistKeys = {
  all: ['watchlists'] as const,
  detail: (id: string) => ['watchlist', id] as const,
};

export function useWatchlists() {
  return useQuery({ queryKey: watchlistKeys.all, queryFn: () => getWatchlists.execute() });
}

export function useWatchlist(id: string) {
  return useQuery({
    queryKey: watchlistKeys.detail(id),
    queryFn: () => getWatchlist.execute(id),
    enabled: Boolean(id),
  });
}

export function useCreateWatchlist() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createWatchlist.execute(name),
    onSuccess: () => client.invalidateQueries({ queryKey: watchlistKeys.all }),
  });
}

export function useDeleteWatchlist() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWatchlist.execute(id),
    onSuccess: () => client.invalidateQueries({ queryKey: watchlistKeys.all }),
  });
}

export function useAddAssetToWatchlist(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) => addAssetToWatchlist.execute(id, assetId),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: watchlistKeys.detail(id) }),
        client.invalidateQueries({ queryKey: watchlistKeys.all }),
      ]);
    },
  });
}

export function useRemoveAssetFromWatchlist(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) => removeAssetFromWatchlist.execute(id, assetId),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: watchlistKeys.detail(id) }),
        client.invalidateQueries({ queryKey: watchlistKeys.all }),
      ]);
    },
  });
}