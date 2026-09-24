export type ApplicationErrorCode =
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'SERVER'
  | 'UNKNOWN';

export class ApplicationError extends Error {
  constructor(
    public readonly code: ApplicationErrorCode,
    message: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}
