export const marketIntervals = ['1D', '1W', '1M', '1Y'] as const;

export type MarketInterval = (typeof marketIntervals)[number];
