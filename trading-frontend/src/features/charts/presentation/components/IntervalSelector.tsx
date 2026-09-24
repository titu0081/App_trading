import { Pressable, StyleSheet, Text, View } from 'react-native';

import { marketIntervals } from '@/features/charts/domain/models/MarketInterval';
import { useAppTheme } from '@/providers/AppThemeProvider';
import { strings } from '@/shared/constants/strings';
import { useMarketFiltersStore } from '@/store/marketFiltersStore';

export function IntervalSelector() {
  const { colors } = useAppTheme();
  const interval = useMarketFiltersStore((state) => state.interval);
  const setInterval = useMarketFiltersStore((state) => state.setInterval);

  return (
    <View accessibilityRole="tablist" style={[styles.container, { borderColor: colors.border }]}>
      {marketIntervals.map((value) => {
        const selected = value === interval;
        return (
          <Pressable
            accessibilityLabel={selected ? strings.charts.selectedInterval(value) : value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={value}
            onPress={() => setInterval(value)}
            style={[styles.option, selected && { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.label, { color: selected ? colors.onPrimary : colors.text }]}>
              {value}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  option: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  label: { fontSize: 14, fontWeight: '700' },
});