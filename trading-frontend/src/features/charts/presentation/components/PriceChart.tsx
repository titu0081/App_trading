import { StyleSheet, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { ChartPoint } from '@/features/charts/domain/models/ChartPoint';
import {
  buildChartPath,
  chartViewBox,
} from '@/features/charts/presentation/adapters/svgChartAdapter';
import { useAppTheme } from '@/providers/AppThemeProvider';
import { StateView } from '@/shared/components/StateView';
import { strings } from '@/shared/constants/strings';

interface PriceChartProps {
  data: ChartPoint[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export function PriceChart({ data, loading = false, error, onRetry }: PriceChartProps) {
  const { colors } = useAppTheme();

  if (loading) return <StateView loading />;
  if (error) return <StateView message={error} onRetry={onRetry} />;
  if (data.length < 2) return <StateView message={strings.charts.empty} />;

  return (
    <View
      accessibilityLabel={strings.charts.accessibilityLabel}
      style={[styles.chart, { borderColor: colors.border }]}
    >
      <Svg height="100%" width="100%" viewBox={chartViewBox}>
        <Line x1="6" y1="33" x2="94" y2="33" stroke={colors.border} strokeWidth="0.5" />
        <Line x1="6" y1="66" x2="94" y2="66" stroke={colors.border} strokeWidth="0.5" />
        <Path
          d={buildChartPath(data)}
          fill="none"
          stroke={colors.accent}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    height: 220,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 8,
  },
});
