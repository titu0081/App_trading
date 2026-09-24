import { ChartPoint } from '@/features/charts/domain/models/ChartPoint';

const WIDTH = 100;
const HEIGHT = 100;
const PADDING = 6;

export function buildChartPath(points: ChartPoint[]) {
  if (points.length < 2) return '';

  const values = points.map((point) => point.value);
  const minimum = Math.min(...values);
  const range = Math.max(...values) - minimum || 1;
  const drawableSize = HEIGHT - PADDING * 2;

  return points
    .map((point, index) => {
      const x = PADDING + (index / (points.length - 1)) * drawableSize;
      const y =
        HEIGHT - PADDING - ((point.value - minimum) / range) * drawableSize;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export const chartViewBox = `0 0 ${WIDTH} ${HEIGHT}`;
