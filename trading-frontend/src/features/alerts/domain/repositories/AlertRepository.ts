import {
  Alert,
  CreateAlertInput,
  UpdateAlertInput,
} from '@/features/alerts/domain/entities/Alert';
import {
  AlertHistoryEntry,
  AlertHistoryFilters,
} from '@/features/alerts/domain/entities/AlertHistoryEntry';

export interface AlertRepository {
  getAll(): Promise<Alert[]>;
  getHistory(filters?: AlertHistoryFilters): Promise<AlertHistoryEntry[]>;
  create(input: CreateAlertInput): Promise<Alert>;
  update(id: string, input: UpdateAlertInput): Promise<Alert>;
  delete(id: string): Promise<void>;
}
