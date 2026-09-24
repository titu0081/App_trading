import { strings } from '@/shared/constants/strings';
import { ApplicationError } from '@/shared/errors/ApplicationError';

export function validateAlertTarget(targetValue: number | null | undefined) {
  if (
    targetValue !== null &&
    targetValue !== undefined &&
    (!Number.isFinite(targetValue) || targetValue < 0)
  ) {
    throw new ApplicationError('VALIDATION', strings.alerts.invalidTarget);
  }
}
