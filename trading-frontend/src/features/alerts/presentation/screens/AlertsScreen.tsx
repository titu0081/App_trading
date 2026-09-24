import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import {
  useAlerts,
  useDeleteAlert,
  useUpdateAlert,
} from '@/features/alerts/presentation/hooks/useAlerts';
import { AppButton } from '@/shared/components/AppButton';
import { AppText } from '@/shared/components/AppText';
import { Screen } from '@/shared/components/Screen';
import { StateView } from '@/shared/components/StateView';
import { Surface } from '@/shared/components/Surface';
import { strings } from '@/shared/constants/strings';

export function AlertsScreen() {
  const query = useAlerts();
  const update = useUpdateAlert();
  const remove = useDeleteAlert();

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <AppText variant="title">{strings.alerts.title}</AppText>
        <AppButton
          label={strings.alerts.create}
          onPress={() => router.push('/alerts/create')}
        />
      </View>
      <AppButton
        label={strings.alerts.history}
        onPress={() => router.push('/alerts/history')}
        variant="secondary"
      />
      {update.error ? (
        <AppText secondary>{update.error.message}</AppText>
      ) : null}
      {remove.error ? (
        <AppText secondary>{remove.error.message}</AppText>
      ) : null}
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
          ListEmptyComponent={<StateView message={strings.alerts.empty} />}
          renderItem={({ item }) => (
            <Surface>
              <View style={styles.row}>
                <AppText variant="heading">
                  {strings.alerts.typeLabels[item.type]}
                </AppText>
                <AppText secondary>
                  {item.isActive
                    ? strings.alerts.active
                    : strings.alerts.inactive}
                </AppText>
              </View>
              <AppText secondary>
                {item.condition
                  ? strings.alerts.conditionLabels[item.condition]
                  : strings.common.notAvailable}{' '}
                {strings.common.detailSeparator}{' '}
                {item.targetValue ?? strings.common.notAvailable}
              </AppText>
              <View style={styles.actions}>
                <AppButton
                  label={
                    item.isActive ? strings.alerts.pause : strings.alerts.enable
                  }
                  onPress={() =>
                    update.mutate({
                      id: item.id,
                      input: { isActive: !item.isActive },
                    })
                  }
                  variant="secondary"
                />
                <AppButton
                  label={strings.common.delete}
                  onPress={() => remove.mutate(item.id)}
                  variant="danger"
                />
              </View>
            </Surface>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 12 },
  list: { gap: 10, paddingBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  actions: { flexDirection: 'row', gap: 8 },
});
