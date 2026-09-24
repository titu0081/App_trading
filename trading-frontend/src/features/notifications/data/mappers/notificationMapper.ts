import { Notification } from '@/features/notifications/domain/entities/Notification';

export interface NotificationDto {
  id: string;
  alert_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function mapNotificationDto(value: NotificationDto): Notification {
  return {
    id: value.id,
    alertId: value.alert_id,
    message: value.message,
    isRead: value.is_read,
    createdAt: value.created_at,
  };
}
