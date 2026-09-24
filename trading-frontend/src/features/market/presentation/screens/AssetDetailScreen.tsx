import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { appendLivePrice } from '@/features/charts/data/mappers/chartMapper';
import { PriceChart } from '@/features/charts/presentation/components/PriceChart';
import { IntervalSelector } from '@/features/charts/presentation/components/IntervalSelector';
import {
  useAsset,
  useAssetPrice,
  useHistoricalPrices,
} from '@/features/market/presentation/hooks/useMarket';
import { usePriceStream } from '@/features/market/presentation/hooks/usePriceStream';
import { AppText } from '@/shared/components/AppText';
import { Screen } from '@/shared/components/Screen';
import { StateView } from '@/shared/components/StateView';
import { Surface } from '@/shared/components/Surface';
import { strings } from '@/shared/constants/strings';

export function AssetDetailScreen() {
  const { symbol = '' } = useLocalSearchParams<{ symbol: string }>();
  const asset = useAsset(symbol);
  const price = useAssetPrice(symbol);
  const history = useHistoricalPrices(symbol);
  const livePrice = usePriceStream(symbol, asset.data?.sourceApi ?? 'finnhub');
  const chartData = appendLivePrice(
    history.data ?? [],
    livePrice.latestPrice?.price,
  );

  if (asset.isLoading) return <StateView loading />;
  if (asset.isError || !asset.data)
    return (
      <StateView
        message={asset.error?.message}
        onRetry={() => asset.refetch()}
      />
    );

  return (
    <Screen>
      <View style={styles.heading}>
        <AppText variant="title">{asset.data.symbol}</AppText>
        <AppText secondary>{asset.data.name}</AppText>
      </View>
      <Surface>
        <AppText secondary>{strings.market.livePrice}</AppText>
        {price.isLoading ? (
          <StateView loading />
        ) : price.isError ? (
          <StateView
            message={price.error.message}
            onRetry={() => price.refetch()}
          />
        ) : (
          <AppText variant="title">
            {strings.market.currencySymbol}
            {(
              livePrice.latestPrice?.price ?? price.data?.price
            )?.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </AppText>
        )}
      </Surface>
      <IntervalSelector />
      <PriceChart
        data={chartData}
        error={history.error?.message}
        loading={history.isLoading}
        onRetry={() => history.refetch()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ heading: { gap: 4 } });
