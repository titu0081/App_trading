import { UserSession } from '@/features/auth/domain/entities/UserSession';
import { AuthRepository } from '@/features/auth/domain/repositories/AuthRepository';
import { strings } from '@/shared/constants/strings';
import { ApplicationError } from '@/shared/errors/ApplicationError';

export class UnavailableAuthRepository implements AuthRepository {
  private fail(): never {
    throw new ApplicationError('AUTHENTICATION', strings.auth.unavailable);
  }

  async login(): Promise<UserSession> { return this.fail(); }
  async register(): Promise<UserSession> { return this.fail(); }
  async logout() {}
  async getCurrentSession() { return null; }
  async refreshSession() { return null; }
  subscribe() { return () => undefined; }
}