import { AuthRepository } from '@/features/auth/domain/repositories/AuthRepository';

export class Logout {
  constructor(private readonly repository: AuthRepository) {}

  execute() {
    return this.repository.logout();
  }
}