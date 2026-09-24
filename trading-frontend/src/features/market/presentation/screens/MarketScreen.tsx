import { Href, router } from 'expo-router';
import { useDeferredValue } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { filterAssets } from '@/features/market/domain/services/filterAssets';
import { useAssets } from '@/features/market/presentation/hooks/useMarket';
import { useAppTheme } from '@/providers/AppThemeProvider';
import { AppInput } from '@/shared/components/AppInput';
import { AppText } from '@/shared/components/AppText';
import { Screen } from '@/shared/components/Screen';
import { StateView } from '@/shared/components/StateView';
import { Surface } from '@/shared/components/Surface';
import { strings } from '@/shared/constants/strings';
import {
  AssetTypeFilter,
  useMarketFiltersStore,
} from '@/store/marketFiltersStore';

const filters: { value: AssetTypeFilter; label: string }[] = [
  { value: 'all', label: strings.market.all },
  { value: 'stock', label: strings.market.typeLabels.stock },
  { value: 'crypto', label: strings.market.typeLabels.crypto },
  { value: 'forex', label: strings.market.typeLabels.forex },
  { value: 'index', label: strings.market.typeLabels.index },
];

export function MarketScreen() {
  const { colors } = useAppTheme();
  const search = useMarketFiltersStore((state) => state.search);
  const setSearch = useMarketFiltersStore((state) => state.setSearch);
  const assetType = useMarketFiltersStore((state) => state.assetType);
  const setAssetType = useMarketFiltersStore((state) => state.setAssetType);
  const deferredSearch = useDeferredValue(search);
  const query = useAssets();
  const assets = filterAssets(query.data ?? [], deferredSearch);

  return (
    <Screen scroll={false}>
      <View style={styles.heading}>
        <AppText variant="title">{strings.market.title}</AppText>
        <AppText secondary>{strings.market.subtitle}</AppText>
      </View>
      <AppInput
        label={strings.common.search}
        placeholder={strings.market.searchPlaceholder}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filters}
        horizontal
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filters}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => setAssetType(item.value)}
            style={[
              styles.filter,
              {
                backgroundColor:
                  item.value === assetType ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <AppText
              style={{
                color:
                  item.value === assetType ? colors.onPrimary : colors.text,
              }}
            >
              {item.label}
            </AppText>
          </Pressable>
        )}
      />
      {query.isLoading ? (
        <StateView loading />
      ) : query.isError ? (
        <StateView
          message={query.error.message}
          onRetry={() => query.refetch()}
        />
      ) : (
        <FlatList
          data={assets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<StateView />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/market/${item.symbol}` as Href)}
            >
              <Surface style={styles.asset}>
                <View style={styles.symbolBlock}>
                  <AppText variant="heading">{item.symbol}</AppText>
                  <AppText secondary numberOfLines={1}>
                    {item.name}
                  </AppText>
                </View>
                <AppText secondary>
                  {strings.market.typeLabels[item.type]}
                </AppText>
              </Surface>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 4 },
  filters: { gap: 8 },
  filter: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  list: { gap: 10, paddingBottom: 24 },
  asset: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  symbolBlock: { flex: 1, gap: 2 },
});
