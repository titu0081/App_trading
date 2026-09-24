import { NotificationRepository } from '@/features/notifications/domain/repositories/NotificationRepository';

export class GetNotifications {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(unreadOnly = false) {
    const notifications = await this.repository.getAll(unreadOnly);
    return notifications.toSorted(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
    );
  }
}
