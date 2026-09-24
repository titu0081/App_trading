import { AlertRepository } from '@/features/alerts/domain/repositories/AlertRepository';

export class DeleteAlert {
  constructor(private readonly repository: AlertRepository) {}

  execute(id: string) {
    return this.repository.delete(id);
  }
}
