import { ApiAlertRepository } from '@/features/alerts/data/repositories/ApiAlertRepository';
import { ApiClient } from '@/infrastructure/api/ApiClient';

function createClient(): jest.Mocked<ApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
}

const dto = {
  id: 'alert-1',
  user_id: 'user-1',
  asset_id: 'asset-1',
  type: 'price_target' as const,
  condition: 'above' as const,
  target_value: 150,
  is_active: true,
};

describe('ApiAlertRepository', () => {
  it('maps list and create responses and sends the backend payload', async () => {
    const client = createClient();
    client.get.mockResolvedValue([dto]);
    client.post.mockResolvedValue(dto);
    const repository = new ApiAlertRepository(client);
    const input = {
      assetId: 'asset-1',
      type: 'price_target' as const,
      condition: 'above' as const,
      targetValue: 150,
    };

    await expect(repository.getAll()).resolves.toEqual([
      {
        id: 'alert-1',
        assetId: 'asset-1',
        type: 'price_target',
        condition: 'above',
        targetValue: 150,
        isActive: true,
      },
    ]);
    await repository.create(input);

    expect(client.get).toHaveBeenCalledWith('/alerts');
    expect(client.post).toHaveBeenCalledWith('/alerts', {
      asset_id: 'asset-1',
      type: 'price_target',
      condition: 'above',
      target_value: 150,
    });
  });

  it('calls update and delete endpoints', async () => {
    const client = createClient();
    client.patch.mockResolvedValue({ ...dto, is_active: false });
    const repository = new ApiAlertRepository(client);

    await repository.update('alert-1', { isActive: false });
    await repository.delete('alert-1');

    expect(client.patch).toHaveBeenCalledWith('/alerts/alert-1', {
      condition: undefined,
      target_value: undefined,
      is_active: false,
    });
    expect(client.delete).toHaveBeenCalledWith('/alerts/alert-1');
  });
});
