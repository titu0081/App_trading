import { AlertRepository } from '@/features/alerts/domain/repositories/AlertRepository';

export class GetAlerts {
  constructor(private readonly repository: AlertRepository) {}

  execute() {
    return this.repository.getAll();
  }
}
