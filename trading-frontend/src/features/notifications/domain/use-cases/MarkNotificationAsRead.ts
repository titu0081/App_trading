import { NotificationRepository } from '@/features/notifications/domain/repositories/NotificationRepository';

export class MarkNotificationAsRead {
  constructor(private readonly repository: NotificationRepository) {}

  execute(id: string) {
    return this.repository.markAsRead(id);
  }
}
