import { AlertHistoryFilters } from '@/features/alerts/domain/entities/AlertHistoryEntry';
import { AlertRepository } from '@/features/alerts/domain/repositories/AlertRepository';

export class GetAlertHistory {
  constructor(private readonly repository: AlertRepository) {}

  execute(filters: AlertHistoryFilters = {}) {
    return this.repository.getHistory(filters);
  }
}
