import { mapAlertDto } from '@/features/alerts/data/mappers/alertMapper';

describe('mapAlertDto', () => {
  it('maps the backend alert contract to the domain entity', () => {
    expect(
      mapAlertDto({
        id: 'alert-1',
        user_id: 'user-1',
        asset_id: 'asset-1',
        type: 'price_target',
        condition: 'above',
        target_value: 150,
        is_active: true,
      }),
    ).toEqual({
      id: 'alert-1',
      assetId: 'asset-1',
      type: 'price_target',
      condition: 'above',
      targetValue: 150,
      isActive: true,
    });
  });
});
