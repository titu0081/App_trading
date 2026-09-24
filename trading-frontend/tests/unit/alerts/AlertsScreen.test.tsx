import { render, screen, userEvent } from '@testing-library/react-native';

import * as alertHooks from '@/features/alerts/presentation/hooks/useAlerts';
import { AlertsScreen } from '@/features/alerts/presentation/screens/AlertsScreen';
import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { strings } from '@/shared/constants/strings';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/features/alerts/presentation/hooks/useAlerts', () => ({
  useAlerts: jest.fn(),
  useDeleteAlert: jest.fn(),
  useUpdateAlert: jest.fn(),
}));

describe('AlertsScreen', () => {
  it('edits and deletes an alert from visible controls', async () => {
    const user = userEvent.setup();
    const mutateUpdate = jest.fn();
    const mutateDelete = jest.fn();
    jest.mocked(alertHooks.useAlerts).mockReturnValue({
      data: [
        {
          id: 'alert-1',
          assetId: 'asset-1',
          type: 'price_target',
          condition: 'above',
          targetValue: 150,
          isActive: true,
        },
      ],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof alertHooks.useAlerts>);
    jest.mocked(alertHooks.useUpdateAlert).mockReturnValue({
      mutate: mutateUpdate,
      error: null,
    } as unknown as ReturnType<typeof alertHooks.useUpdateAlert>);
    jest.mocked(alertHooks.useDeleteAlert).mockReturnValue({
      mutate: mutateDelete,
      error: null,
    } as unknown as ReturnType<typeof alertHooks.useDeleteAlert>);

    await render(<AlertsScreen />, { wrapper: AppThemeProvider });
    await user.press(
      screen.getByRole('button', { name: strings.alerts.pause }),
    );
    await user.press(
      screen.getByRole('button', { name: strings.common.delete }),
    );

    expect(mutateUpdate).toHaveBeenCalledWith({
      id: 'alert-1',
      input: { isActive: false },
    });
    expect(mutateDelete).toHaveBeenCalledWith('alert-1');
  });

  it('shows editing and deletion errors', async () => {
    jest.mocked(alertHooks.useAlerts).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof alertHooks.useAlerts>);
    jest.mocked(alertHooks.useUpdateAlert).mockReturnValue({
      mutate: jest.fn(),
      error: new Error('No se pudo editar.'),
    } as unknown as ReturnType<typeof alertHooks.useUpdateAlert>);
    jest.mocked(alertHooks.useDeleteAlert).mockReturnValue({
      mutate: jest.fn(),
      error: new Error('No se pudo eliminar.'),
    } as unknown as ReturnType<typeof alertHooks.useDeleteAlert>);

    await render(<AlertsScreen />, { wrapper: AppThemeProvider });

    expect(screen.getByText('No se pudo editar.')).toBeOnTheScreen();
    expect(screen.getByText('No se pudo eliminar.')).toBeOnTheScreen();
  });
});
