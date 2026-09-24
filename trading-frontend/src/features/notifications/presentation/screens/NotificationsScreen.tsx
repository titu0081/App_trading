import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import {
  useMarkNotificationAsRead,
  useNotifications,
} from '@/features/notifications/presentation/hooks/useNotifications';
import { useAppTheme } from '@/providers/AppThemeProvider';
import { AppButton } from '@/shared/components/AppButton';
import { AppText } from '@/shared/components/AppText';
import { Screen } from '@/shared/components/Screen';
import { StateView } from '@/shared/components/StateView';
import { Surface } from '@/shared/components/Surface';
import { strings } from '@/shared/constants/strings';

export function NotificationsScreen() {
  const { colors } = useAppTheme();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const query = useNotifications(unreadOnly);
  const markRead = useMarkNotificationAsRead();

  return (
    <Screen scroll={false}>
      <AppText variant="title">{strings.notifications.title}</AppText>
      <View style={styles.filters}>
        {[
          { label: strings.notifications.all, value: false },
          { label: strings.notifications.onlyUnread, value: true },
        ].map((filter) => (
          <Pressable
            accessibilityRole="button"
            key={filter.label}
            onPress={() => setUnreadOnly(filter.value)}
            style={[
              styles.filter,
              {
                backgroundColor:
                  unreadOnly === filter.value ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <AppText
              style={{
                color:
                  unreadOnly === filter.value ? colors.onPrimary : colors.text,
              }}
            >
              {filter.label}
            </AppText>
          </Pressable>
        ))}
      </View>
      {markRead.error ? (
        <AppText style={{ color: colors.error }}>
          {markRead.error.message}
        </AppText>
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
          ListEmptyComponent={
            <StateView message={strings.notifications.empty} />
          }
          renderItem={({ item }) => (
            <Surface>
              <View style={styles.row}>
                <AppText>{item.message}</AppText>
                <AppText secondary>
                  {item.isRead
                    ? strings.notifications.read
                    : strings.notifications.unread}
                </AppText>
                <AppText variant="caption" secondary>
                  {new Date(item.createdAt).toLocaleString()}
                </AppText>
              </View>
              {!item.isRead ? (
                <AppButton
                  label={strings.notifications.markRead}
                  onPress={() => markRead.mutate(item.id)}
                  variant="secondary"
                />
              ) : null}
            </Surface>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: 8 },
  filter: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  list: { gap: 10, paddingBottom: 24 },
  row: { gap: 6 },
});
