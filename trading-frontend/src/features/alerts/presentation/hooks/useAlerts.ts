import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { CreateAlertInput, UpdateAlertInput } from '@/features/alerts/domain/entities/Alert';
import { AlertHistoryFilters } from '@/features/alerts/domain/entities/AlertHistoryEntry';
import {
  createAlert,
  deleteAlert,
  getAlertHistory,
  getAlerts,
  updateAlert,
} from '@/infrastructure/composition';

const alertsKey = ['alerts'] as const;

export function useAlerts() {
  return useQuery({ queryKey: alertsKey, queryFn: () => getAlerts.execute() });
}

export function useCreateAlert() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (input: CreateAlertInput) => createAlert.execute(input), onSuccess: () => client.invalidateQueries({ queryKey: alertsKey }) });
}

export function useUpdateAlert() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, input }: { id: string; input: UpdateAlertInput }) => updateAlert.execute(id, input), onSuccess: () => client.invalidateQueries({ queryKey: alertsKey }) });
}

export function useDeleteAlert() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => deleteAlert.execute(id), onSuccess: () => client.invalidateQueries({ queryKey: alertsKey }) });
}

export function useAlertHistory(filters: AlertHistoryFilters) {
  return useQuery({
    queryKey: ['alerts', 'history', filters],
    queryFn: () => getAlertHistory.execute(filters),
  });
}