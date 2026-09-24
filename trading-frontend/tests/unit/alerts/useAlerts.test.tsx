import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import {
  useCreateAlert,
  useDeleteAlert,
  useUpdateAlert,
} from '@/features/alerts/presentation/hooks/useAlerts';
import {
  createAlert,
  deleteAlert,
  updateAlert,
} from '@/infrastructure/composition';

jest.mock('@/infrastructure/composition', () => ({
  createAlert: { execute: jest.fn() },
  deleteAlert: { execute: jest.fn() },
  getAlerts: { execute: jest.fn() },
  updateAlert: { execute: jest.fn() },
}));

const mockCreate = jest.mocked(createAlert.execute);
const mockDelete = jest.mocked(deleteAlert.execute);
const mockUpdate = jest.mocked(updateAlert.execute);

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('alert mutations', () => {
  it('uses alert use cases and invalidates the list after every mutation', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateQueries = jest
      .spyOn(queryClient, 'invalidateQueries')
      .mockResolvedValue(undefined);
    const input = {
      assetId: 'asset-1',
      type: 'price_target' as const,
      condition: 'above' as const,
      targetValue: 100,
    };
    mockCreate.mockResolvedValue({ id: 'alert-1', ...input, isActive: true });
    mockUpdate.mockResolvedValue({ id: 'alert-1', ...input, isActive: false });
    mockDelete.mockResolvedValue(undefined);
    const hook = await renderHook(
      () => ({
        create: useCreateAlert(),
        update: useUpdateAlert(),
        remove: useDeleteAlert(),
      }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => hook.result.current.create.mutateAsync(input));
    await act(async () =>
      hook.result.current.update.mutateAsync({
        id: 'alert-1',
        input: { isActive: false },
      }),
    );
    await act(async () => hook.result.current.remove.mutateAsync('alert-1'));

    expect(mockCreate).toHaveBeenCalledWith(input);
    expect(mockUpdate).toHaveBeenCalledWith('alert-1', { isActive: false });
    expect(mockDelete).toHaveBeenCalledWith('alert-1');
    expect(invalidateQueries).toHaveBeenCalledTimes(3);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['alerts'] });

    hook.unmount();
    queryClient.clear();
  });
});
