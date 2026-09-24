import { NotificationRepository } from '@/features/notifications/domain/repositories/NotificationRepository';
import { GetNotifications } from '@/features/notifications/domain/use-cases/GetNotifications';
import { MarkNotificationAsRead } from '@/features/notifications/domain/use-cases/MarkNotificationAsRead';

function createRepository(): jest.Mocked<NotificationRepository> {
  return {
    getAll: jest.fn(),
    markAsRead: jest.fn(),
  };
}

describe('notification use cases', () => {
  it('orders notifications newest first after applying the unread filter', async () => {
    const repository = createRepository();
    repository.getAll.mockResolvedValue([
      {
        id: 'old',
        alertId: null,
        message: 'Old',
        isRead: false,
        createdAt: '2026-09-01T10:00:00Z',
      },
      {
        id: 'new',
        alertId: 'alert-1',
        message: 'New',
        isRead: false,
        createdAt: '2026-09-16T10:00:00Z',
      },
    ]);

    const result = await new GetNotifications(repository).execute(true);

    expect(repository.getAll).toHaveBeenCalledWith(true);
    expect(result.map((item) => item.id)).toEqual(['new', 'old']);
  });

  it('delegates marking a notification as read', async () => {
    const repository = createRepository();
    repository.markAsRead.mockResolvedValue({
      id: 'notification-1',
      alertId: null,
      message: 'Read',
      isRead: true,
      createdAt: '2026-09-16T10:00:00Z',
    });

    await new MarkNotificationAsRead(repository).execute('notification-1');

    expect(repository.markAsRead).toHaveBeenCalledWith('notification-1');
  });
});
