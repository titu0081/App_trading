import { CreateAlertInput } from '@/features/alerts/domain/entities/Alert';
import { AlertRepository } from '@/features/alerts/domain/repositories/AlertRepository';
import { validateAlertTarget } from '@/features/alerts/domain/services/validateAlertTarget';
import { strings } from '@/shared/constants/strings';
import { ApplicationError } from '@/shared/errors/ApplicationError';

export class CreateAlert {
  constructor(private readonly repository: AlertRepository) {}

  execute(input: CreateAlertInput) {
    if (!input.assetId)
      throw new ApplicationError('VALIDATION', strings.alerts.assetRequired);
    if (input.type === 'price_target' && !input.condition) {
      throw new ApplicationError(
        'VALIDATION',
        strings.alerts.conditionRequired,
      );
    }
    validateAlertTarget(input.targetValue);
    return this.repository.create(input);
  }
}
