import { AuthRepository } from '@/features/auth/domain/repositories/AuthRepository';

import { normalizeCredentials } from './credentials';

export class Login {
  constructor(private readonly repository: AuthRepository) {}

  async execute(email: string, password: string) {
    const credentials = normalizeCredentials(email, password);
    return this.repository.login(credentials.email, credentials.password);
  }
}