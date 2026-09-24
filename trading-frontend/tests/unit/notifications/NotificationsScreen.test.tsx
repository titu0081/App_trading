import { render, screen, userEvent } from '@testing-library/react-native';

import * as notificationHooks from '@/features/notifications/presentation/hooks/useNotifications';
import { NotificationsScreen } from '@/features/notifications/presentation/screens/NotificationsScreen';
import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { strings } from '@/shared/constants/strings';

jest.mock(
  '@/features/notifications/presentation/hooks/useNotifications',
  () => ({
    useNotifications: jest.fn(),
    useMarkNotificationAsRead: jest.fn(),
  }),
);

describe('NotificationsScreen', () => {
  beforeEach(() => {
    jest.mocked(notificationHooks.useNotifications).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof notificationHooks.useNotifications>);
    jest.mocked(notificationHooks.useMarkNotificationAsRead).mockReturnValue({
      mutate: jest.fn(),
      error: null,
    } as unknown as ReturnType<
      typeof notificationHooks.useMarkNotificationAsRead
    >);
  });

  it('changes from all notifications to unread notifications', async () => {
    const user = userEvent.setup();
    await render(<NotificationsScreen />, { wrapper: AppThemeProvider });

    expect(notificationHooks.useNotifications).toHaveBeenLastCalledWith(false);
    await user.press(
      screen.getByRole('button', { name: strings.notifications.onlyUnread }),
    );

    expect(notificationHooks.useNotifications).toHaveBeenLastCalledWith(true);
  });

  it('shows empty and mark-as-read error states', async () => {
    jest.mocked(notificationHooks.useMarkNotificationAsRead).mockReturnValue({
      mutate: jest.fn(),
      error: new Error('No se pudo marcar.'),
    } as unknown as ReturnType<
      typeof notificationHooks.useMarkNotificationAsRead
    >);

    await render(<NotificationsScreen />, { wrapper: AppThemeProvider });

    expect(screen.getByText(strings.notifications.empty)).toBeOnTheScreen();
    expect(screen.getByText('No se pudo marcar.')).toBeOnTheScreen();
  });
});
