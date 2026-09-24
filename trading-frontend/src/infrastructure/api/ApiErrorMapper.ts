import { isAxiosError } from 'axios';

import { strings } from '@/shared/constants/strings';
import {
  ApplicationError,
  ApplicationErrorCode,
} from '@/shared/errors/ApplicationError';

const statusCodes: Record<number, ApplicationErrorCode> = {
  400: 'VALIDATION',
  401: 'AUTHENTICATION',
  403: 'AUTHORIZATION',
  404: 'NOT_FOUND',
  422: 'VALIDATION',
};

export function mapApiError(error: unknown) {
  if (error instanceof ApplicationError) return error;
  if (!isAxiosError(error))
    return new ApplicationError('UNKNOWN', strings.common.unknownError, error);
  if (error.code === 'ECONNABORTED')
    return new ApplicationError('TIMEOUT', strings.common.timeoutError, error);
  if (!error.response)
    return new ApplicationError('NETWORK', strings.common.networkError, error);

  const code = statusCodes[error.response.status] ?? 'SERVER';
  const fallback =
    code === 'AUTHORIZATION'
      ? strings.common.authorizationError
      : code === 'NOT_FOUND'
        ? strings.common.notFoundError
        : code === 'SERVER'
          ? strings.common.serverError
          : strings.common.unknownError;
  const detail =
    typeof error.response.data === 'object' && error.response.data
      ? (error.response.data as { detail?: unknown }).detail
      : undefined;

  return new ApplicationError(
    code,
    typeof detail === 'string' ? detail : fallback,
    error,
  );
}
