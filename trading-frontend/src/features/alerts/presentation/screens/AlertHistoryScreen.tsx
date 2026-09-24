import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { useAlertHistory } from '@/features/alerts/presentation/hooks/useAlerts';
import { useAppTheme } from '@/providers/AppThemeProvider';
import { AppInput } from '@/shared/components/AppInput';
import { AppText } from '@/shared/components/AppText';
import { Screen } from '@/shared/components/Screen';
import { StateView } from '@/shared/components/StateView';
import { Surface } from '@/shared/components/Surface';
import { strings } from '@/shared/constants/strings';

export function AlertHistoryScreen() {
  const { colors } = useAppTheme();
  const [assetId, setAssetId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>();
  const query = useAlertHistory({
    assetId: assetId || undefined,
    isActive,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const statusFilters = [
    { label: strings.alerts.allStatuses, value: undefined },
    { label: strings.alerts.active, value: true },
    { label: strings.alerts.inactive, value: false },
  ] as const;

  return (
    <Screen scroll={false} contentContainerStyle={styles.screen}>
      <AppText variant="title">{strings.alerts.history}</AppText>
      <AppInput
        label={strings.alerts.assetFilter}
        value={assetId}
        onChangeText={setAssetId}
      />
      <View style={styles.dateFields}>
        <AppInput
          label={strings.alerts.dateFrom}
          value={dateFrom}
          onChangeText={setDateFrom}
        />
        <AppInput
          label={strings.alerts.dateTo}
          value={dateTo}
          onChangeText={setDateTo}
        />
      </View>
      <View style={styles.filters}>
        {statusFilters.map((filter) => (
          <Pressable
            accessibilityRole="button"
            key={filter.label}
            onPress={() => setIsActive(filter.value)}
            style={[
              styles.filter,
              {
                backgroundColor:
                  isActive === filter.value ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <AppText
              style={{
                color:
                  isActive === filter.value ? colors.onPrimary : colors.text,
              }}
            >
              {filter.label}
            </AppText>
          </Pressable>
        ))}
      </View>
      {query.isLoading ? (
        <StateView loading />
      ) : query.isError ? (
        <StateView
          message={query.error.message}
          onRetry={() => query.refetch()}
        />
      ) : (
        <FlatList
          data={query.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <StateView message={strings.alerts.historyEmpty} />
          }
          renderItem={({ item }) => (
            <Surface style={styles.entry}>
              <AppText>{item.message}</AppText>
              <AppText secondary>
                {strings.alerts.triggeredPrice}:{' '}
                {item.triggeredPrice ?? strings.common.notAvailable}
              </AppText>
              <AppText secondary>
                {strings.alerts.condition}:{' '}
                {item.condition
                  ? (strings.alerts.conditionLabels[
                      item.condition as keyof typeof strings.alerts.conditionLabels
                    ] ?? item.condition)
                  : strings.common.notAvailable}
              </AppText>
              <AppText variant="caption" secondary>
                {new Date(item.createdAt).toLocaleString()}
              </AppText>
            </Surface>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  dateFields: { gap: 8 },
  filters: { flexDirection: 'row', gap: 8 },
  filter: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  list: { gap: 10, paddingBottom: 24 },
  entry: { gap: 5 },
});
