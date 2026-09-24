import {
  AlertHistoryEntry,
  AlertHistoryFilters,
} from '@/features/alerts/domain/entities/AlertHistoryEntry';

export interface AlertHistoryDto {
  id: string;
  alert_id: string | null;
  asset_id: string | null;
  condition: string | null;
  is_active?: boolean | null;
  triggered_price: number | null;
  message: string;
  created_at: string;
}

export function mapAlertHistoryDto(value: AlertHistoryDto): AlertHistoryEntry {
  return {
    id: value.id,
    alertId: value.alert_id,
    assetId: value.asset_id,
    condition: value.condition,
    isActive: value.is_active ?? null,
    triggeredPrice: value.triggered_price,
    message: value.message,
    createdAt: value.created_at,
  };
}

export function filterAlertHistory(
  entries: AlertHistoryEntry[],
  filters: AlertHistoryFilters,
) {
  const endOfDateTo = filters.dateTo
    ? Date.parse(`${filters.dateTo}T23:59:59.999`)
    : undefined;

  return entries.filter((entry) => {
    const createdAt = Date.parse(entry.createdAt);
    return (
      (!filters.assetId || entry.assetId === filters.assetId) &&
      (filters.isActive === undefined || entry.isActive === filters.isActive) &&
      (!filters.dateFrom || createdAt >= Date.parse(filters.dateFrom)) &&
      (endOfDateTo === undefined || createdAt <= endOfDateTo)
    );
  });
}
