import { UpdateAlertInput } from '@/features/alerts/domain/entities/Alert';
import { AlertRepository } from '@/features/alerts/domain/repositories/AlertRepository';
import { validateAlertTarget } from '@/features/alerts/domain/services/validateAlertTarget';

export class UpdateAlert {
  constructor(private readonly repository: AlertRepository) {}

  execute(id: string, input: UpdateAlertInput) {
    validateAlertTarget(input.targetValue);
    return this.repository.update(id, input);
  }
}
