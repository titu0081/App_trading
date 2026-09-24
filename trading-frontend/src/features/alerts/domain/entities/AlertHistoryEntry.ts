export interface AlertHistoryEntry {
  id: string;
  alertId: string | null;
  assetId: string | null;
  condition: string | null;
  isActive: boolean | null;
  triggeredPrice: number | null;
  message: string;
  createdAt: string;
}

export interface AlertHistoryFilters {
  assetId?: string;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
}
