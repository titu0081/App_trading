import { ApplicationError } from '@/shared/errors/ApplicationError';
import { strings } from '@/shared/constants/strings';

export function normalizeCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    throw new ApplicationError('VALIDATION', strings.auth.invalidEmail);
  }

  if (password.length < 6) {
    throw new ApplicationError('VALIDATION', strings.auth.shortPassword);
  }

  return { email: normalizedEmail, password };
}