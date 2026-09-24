import { AuthRepository } from '@/features/auth/domain/repositories/AuthRepository';

import { normalizeCredentials } from './credentials';

export class Register {
  constructor(private readonly repository: AuthRepository) {}

  async execute(email: string, password: string) {
    const credentials = normalizeCredentials(email, password);
    return this.repository.register(credentials.email, credentials.password);
  }
}