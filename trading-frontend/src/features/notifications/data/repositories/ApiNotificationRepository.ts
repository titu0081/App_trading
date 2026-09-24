import {
  mapNotificationDto,
  NotificationDto,
} from '@/features/notifications/data/mappers/notificationMapper';
import { NotificationRepository } from '@/features/notifications/domain/repositories/NotificationRepository';
import { ApiClient } from '@/infrastructure/api/ApiClient';

export class ApiNotificationRepository implements NotificationRepository {
  constructor(private readonly client: ApiClient) {}
  async getAll(unreadOnly = false) {
    const values = await this.client.get<NotificationDto[]>('/notifications', {
      params: { unread_only: unreadOnly },
    });
    return values.map(mapNotificationDto);
  }
  async markAsRead(id: string) {
    return mapNotificationDto(
      await this.client.patch<NotificationDto, Record<string, never>>(
        `/notifications/${id}/read`,
        {},
      ),
    );
  }
}
