import { render } from '@testing-library/react-native';

import { PriceChart } from '@/features/charts/presentation/components/PriceChart';
import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { strings } from '@/shared/constants/strings';

function renderChart(props: React.ComponentProps<typeof PriceChart>) {
  return render(
    <AppThemeProvider>
      <PriceChart {...props} />
    </AppThemeProvider>,
  );
}

describe('PriceChart', () => {
  it('renders loading and empty states', async () => {
    const loading = await renderChart({ data: [], loading: true });
    expect(loading.getByText(strings.common.loading)).toBeOnTheScreen();
    await loading.unmount();

    const empty = await renderChart({ data: [] });
    expect(empty.getByText(strings.charts.empty)).toBeOnTheScreen();
  });

  it('renders the chart container for valid points', async () => {
    const chart = await renderChart({
      data: [
        { timestamp: 1_000, value: 100 },
        { timestamp: 2_000, value: 105 },
      ],
    });

    expect(
      chart.getByLabelText(strings.charts.accessibilityLabel),
    ).toBeOnTheScreen();
  });
});
