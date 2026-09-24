import { AlertRepository } from '@/features/alerts/domain/repositories/AlertRepository';
import { CreateAlert } from '@/features/alerts/domain/use-cases/CreateAlert';
import { DeleteAlert } from '@/features/alerts/domain/use-cases/DeleteAlert';
import { GetAlerts } from '@/features/alerts/domain/use-cases/GetAlerts';
import { UpdateAlert } from '@/features/alerts/domain/use-cases/UpdateAlert';
import { strings } from '@/shared/constants/strings';

function createRepository(): jest.Mocked<AlertRepository> {
  return {
    getAll: jest.fn(),
    getHistory: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

const validInput = {
  assetId: 'asset-1',
  type: 'price_target' as const,
  condition: 'above' as const,
  targetValue: 100,
};

describe('alert use cases', () => {
  it.each([Number.NaN, -1])('rejects invalid target %s', (targetValue) => {
    const repository = createRepository();

    expect(() =>
      new CreateAlert(repository).execute({ ...validInput, targetValue }),
    ).toThrow(strings.alerts.invalidTarget);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('requires a condition for price alerts', () => {
    const repository = createRepository();

    expect(() =>
      new CreateAlert(repository).execute({ ...validInput, condition: null }),
    ).toThrow(strings.alerts.conditionRequired);
  });

  it('rejects an invalid target when editing', () => {
    const repository = createRepository();

    expect(() =>
      new UpdateAlert(repository).execute('alert-1', {
        targetValue: Number.NaN,
      }),
    ).toThrow(strings.alerts.invalidTarget);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('delegates listing, creation, editing and deletion', async () => {
    const repository = createRepository();
    repository.getAll.mockResolvedValue([]);
    repository.create.mockResolvedValue({
      id: 'alert-1',
      ...validInput,
      isActive: true,
    });
    repository.update.mockResolvedValue({
      id: 'alert-1',
      ...validInput,
      isActive: false,
    });
    repository.delete.mockResolvedValue(undefined);

    await new GetAlerts(repository).execute();
    await new CreateAlert(repository).execute(validInput);
    await new UpdateAlert(repository).execute('alert-1', { isActive: false });
    await new DeleteAlert(repository).execute('alert-1');

    expect(repository.getAll).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(validInput);
    expect(repository.update).toHaveBeenCalledWith('alert-1', {
      isActive: false,
    });
    expect(repository.delete).toHaveBeenCalledWith('alert-1');
  });
});
