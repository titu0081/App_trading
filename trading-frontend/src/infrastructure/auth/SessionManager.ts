import { AuthRepository } from '@/features/auth/domain/repositories/AuthRepository';

export class SessionManager {
  constructor(private readonly repository: AuthRepository) {}

  restoreSession() { return this.repository.getCurrentSession(); }
  async getAccessToken() { return (await this.repository.getCurrentSession())?.accessToken ?? null; }
  async refreshAccessToken() { return (await this.repository.refreshSession())?.accessToken ?? null; }
  subscribe(listener: Parameters<AuthRepository['subscribe']>[0]) { return this.repository.subscribe(listener); }
  logout() { return this.repository.logout(); }
}