import {
  filterAlertHistory,
  mapAlertHistoryDto,
} from '@/features/alerts/data/mappers/alertHistoryMapper';

describe('alert history', () => {
  const entries = [
    mapAlertHistoryDto({
      id: 'history-1',
      alert_id: 'alert-1',
      asset_id: 'asset-1',
      condition: 'above',
      triggered_price: 150,
      message: 'Triggered',
      created_at: '2026-09-16T10:00:00Z',
    }),
    mapAlertHistoryDto({
      id: 'history-2',
      alert_id: 'alert-2',
      asset_id: 'asset-2',
      condition: 'below',
      triggered_price: 80,
      message: 'Triggered earlier',
      created_at: '2026-09-01T10:00:00Z',
    }),
  ];

  it('maps the backend contract', () => {
    expect(entries[0]).toEqual({
      id: 'history-1',
      alertId: 'alert-1',
      assetId: 'asset-1',
      condition: 'above',
      isActive: null,
      triggeredPrice: 150,
      message: 'Triggered',
      createdAt: '2026-09-16T10:00:00Z',
    });
  });

  it('filters by asset and inclusive date range', () => {
    expect(
      filterAlertHistory(entries, {
        assetId: 'asset-1',
        dateFrom: '2026-09-10',
        dateTo: '2026-09-16',
      }),
    ).toEqual([entries[0]]);
  });
});
