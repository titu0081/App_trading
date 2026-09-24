import { Href, router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import {
  useCreateWatchlist,
  useDeleteWatchlist,
  useWatchlists,
} from '@/features/watchlists/presentation/hooks/useWatchlists';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { AppText } from '@/shared/components/AppText';
import { Screen } from '@/shared/components/Screen';
import { StateView } from '@/shared/components/StateView';
import { Surface } from '@/shared/components/Surface';
import { strings } from '@/shared/constants/strings';

export function WatchlistsScreen() {
  const [name, setName] = useState('');
  const query = useWatchlists();
  const create = useCreateWatchlist();
  const remove = useDeleteWatchlist();

  const submit = () => create.mutate(name, { onSuccess: () => setName('') });

  return (
    <Screen scroll={false}>
      <AppText variant="title">{strings.watchlists.title}</AppText>
      <View style={styles.createRow}>
        <View style={styles.input}>
          <AppInput
            label={strings.watchlists.create}
            placeholder={strings.watchlists.namePlaceholder}
            value={name}
            onChangeText={setName}
          />
        </View>
        <AppButton
          label={strings.common.create}
          onPress={submit}
          loading={create.isPending}
        />
      </View>
      {create.error ? (
        <AppText secondary>{create.error.message}</AppText>
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
          ListEmptyComponent={<StateView message={strings.watchlists.empty} />}
          renderItem={({ item }) => (
            <Surface>
              <AppText variant="heading">{item.name}</AppText>
              <AppText secondary>
                {strings.watchlists.assetCount(item.assetIds.length)}
              </AppText>
              <View style={styles.actions}>
                <AppButton
                  label={strings.common.edit}
                  onPress={() => router.push(`/watchlists/${item.id}` as Href)}
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
  createRow: { gap: 10 },
  input: { flex: 1 },
  list: { gap: 10, paddingBottom: 24 },
  actions: { flexDirection: 'row', gap: 8 },
});
