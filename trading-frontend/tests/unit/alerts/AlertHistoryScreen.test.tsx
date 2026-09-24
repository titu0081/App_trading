import { fireEvent, render, screen } from '@testing-library/react-native';

import * as alertHooks from '@/features/alerts/presentation/hooks/useAlerts';
import { AlertHistoryScreen } from '@/features/alerts/presentation/screens/AlertHistoryScreen';
import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { strings } from '@/shared/constants/strings';

jest.mock('@/features/alerts/presentation/hooks/useAlerts', () => ({
  useAlertHistory: jest.fn(),
}));

describe('AlertHistoryScreen', () => {
  it('sends asset and date filters to the history query', async () => {
    jest.mocked(alertHooks.useAlertHistory).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof alertHooks.useAlertHistory>);

    await render(<AlertHistoryScreen />, { wrapper: AppThemeProvider });
    await fireEvent.changeText(
      screen.getByLabelText(strings.alerts.assetFilter),
      'asset-1',
    );
    await fireEvent.changeText(
      screen.getByLabelText(strings.alerts.dateFrom),
      '2026-09-01',
    );

    expect(alertHooks.useAlertHistory).toHaveBeenLastCalledWith({
      assetId: 'asset-1',
      isActive: undefined,
      dateFrom: '2026-09-01',
      dateTo: undefined,
    });
  });

  it('shows the empty state', async () => {
    jest.mocked(alertHooks.useAlertHistory).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof alertHooks.useAlertHistory>);

    await render(<AlertHistoryScreen />, { wrapper: AppThemeProvider });

    expect(screen.getByText(strings.alerts.historyEmpty)).toBeOnTheScreen();
  });
});
