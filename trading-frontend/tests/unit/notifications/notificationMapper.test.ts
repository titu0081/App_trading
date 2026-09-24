import { mapNotificationDto } from '@/features/notifications/data/mappers/notificationMapper';

describe('mapNotificationDto', () => {
  it('maps the backend notification contract including its date', () => {
    expect(
      mapNotificationDto({
        id: 'notification-1',
        alert_id: 'alert-1',
        message: 'Price reached',
        is_read: false,
        created_at: '2026-09-16T10:00:00Z',
      }),
    ).toEqual({
      id: 'notification-1',
      alertId: 'alert-1',
      message: 'Price reached',
      isRead: false,
      createdAt: '2026-09-16T10:00:00Z',
    });
  });
});
