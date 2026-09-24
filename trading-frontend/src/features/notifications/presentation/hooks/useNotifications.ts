import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getNotifications,
  markNotificationAsRead,
} from '@/infrastructure/composition';

export function useNotifications(unreadOnly = false) {
  return useQuery({ queryKey: ['notifications', unreadOnly], queryFn: () => getNotifications.execute(unreadOnly) });
}

export function useMarkNotificationAsRead() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => markNotificationAsRead.execute(id), onSuccess: () => client.invalidateQueries({ queryKey: ['notifications'] }) });
}