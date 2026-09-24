import { useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { useAssets } from '@/features/market/presentation/hooks/useMarket';
import {
  useAddAssetToWatchlist,
  useRemoveAssetFromWatchlist,
  useWatchlist,
} from '@/features/watchlists/presentation/hooks/useWatchlists';
import { AppButton } from '@/shared/components/AppButton';
import { AppText } from '@/shared/components/AppText';
import { Screen } from '@/shared/components/Screen';
import { StateView } from '@/shared/components/StateView';
import { Surface } from '@/shared/components/Surface';
import { strings } from '@/shared/constants/strings';

export function WatchlistDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const watchlist = useWatchlist(id);
  const assets = useAssets();
  const add = useAddAssetToWatchlist(id);
  const remove = useRemoveAssetFromWatchlist(id);

  if (watchlist.isLoading || assets.isLoading) return <StateView loading />;
  if (watchlist.isError || !watchlist.data)
    return (
      <StateView
        message={watchlist.error?.message}
        onRetry={() => watchlist.refetch()}
      />
    );
  if (assets.isError)
    return (
      <StateView
        message={assets.error.message}
        onRetry={() => assets.refetch()}
      />
    );

  const included =
    assets.data?.filter((asset) =>
      watchlist.data.assetIds.includes(asset.id),
    ) ?? [];
  const available =
    assets.data?.filter(
      (asset) => !watchlist.data.assetIds.includes(asset.id),
    ) ?? [];

  return (
    <Screen>
      <AppText variant="title">{watchlist.data.name}</AppText>
      {add.error ? <AppText secondary>{add.error.message}</AppText> : null}
      {remove.error ? (
        <AppText secondary>{remove.error.message}</AppText>
      ) : null}
      <AppText variant="heading">{strings.watchlists.assets}</AppText>
      {included.length === 0 ? (
        <StateView message={strings.watchlists.emptyAssets} />
      ) : (
        included.map((asset) => (
          <Surface key={asset.id} style={styles.row}>
            <View style={styles.asset}>
              <AppText>{asset.symbol}</AppText>
              <AppText secondary>{asset.name}</AppText>
            </View>
            <AppButton
              label={strings.watchlists.removeAsset}
              onPress={() => remove.mutate(asset.id)}
              variant="danger"
            />
          </Surface>
        ))
      )}
      <AppText variant="heading">{strings.watchlists.availableAssets}</AppText>
      <FlatList
        data={available}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Surface style={styles.row}>
            <View style={styles.asset}>
              <AppText>{item.symbol}</AppText>
              <AppText secondary>{item.name}</AppText>
            </View>
            <AppButton
              label={strings.watchlists.addAsset}
              onPress={() => add.mutate(item.id)}
              variant="secondary"
            />
          </Surface>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  asset: { flex: 1, gap: 2 },
});
