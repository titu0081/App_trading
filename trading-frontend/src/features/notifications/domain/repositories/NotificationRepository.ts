import { Notification } from '@/features/notifications/domain/entities/Notification';

export interface NotificationRepository {
  getAll(unreadOnly?: boolean): Promise<Notification[]>;
  markAsRead(id: string): Promise<Notification>;
}
