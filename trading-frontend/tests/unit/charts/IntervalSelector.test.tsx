import { render, screen, userEvent } from '@testing-library/react-native';

import { IntervalSelector } from '@/features/charts/presentation/components/IntervalSelector';
import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { strings } from '@/shared/constants/strings';
import { useMarketFiltersStore } from '@/store/marketFiltersStore';

describe('IntervalSelector', () => {
  beforeEach(() => {
    useMarketFiltersStore.setState({ interval: '1D' });
  });

  it('renders every interval and updates the global selection', async () => {
    const user = userEvent.setup();

    await render(
      <AppThemeProvider>
        <IntervalSelector />
      </AppThemeProvider>,
    );

    for (const interval of ['1D', '1W', '1M', '1Y']) {
      expect(screen.getByText(interval)).toBeOnTheScreen();
    }

    await user.press(screen.getByRole('button', { name: '1M' }));

    expect(useMarketFiltersStore.getState().interval).toBe('1M');
    expect(
      screen.getByRole('button', {
        name: strings.charts.selectedInterval('1M'),
        selected: true,
      }),
    ).toBeOnTheScreen();
  });
});
