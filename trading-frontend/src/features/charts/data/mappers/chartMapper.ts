import { ChartPoint } from '@/features/charts/domain/models/ChartPoint';

export interface HistoricalPriceDto {
  timestamp: number;
  price: number;
  volume: number | null;
}

export function mapHistoricalPriceDtos(
  values: HistoricalPriceDto[],
): ChartPoint[] {
  return values
    .filter(
      (value) =>
        Number.isFinite(value.timestamp) && Number.isFinite(value.price),
    )
    .map((value) => ({
      timestamp: value.timestamp * 1_000,
      value: value.price,
    }))
    .sort((left, right) => left.timestamp - right.timestamp);
}

export function appendLivePrice(
  points: ChartPoint[],
  value: number | undefined,
  timestamp = Date.now(),
): ChartPoint[] {
  if (value === undefined || !Number.isFinite(value)) return points;
  return [...points, { timestamp, value }];
}
