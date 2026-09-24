import { useQueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { QueryProvider } from '@/providers/QueryProvider';

function QueryClientProbe() {
  const queryClient = useQueryClient();

  return (
    <Text>{queryClient ? 'query-client-ready' : 'query-client-missing'}</Text>
  );
}

describe('QueryProvider', () => {
  it('makes a QueryClient available to descendants', async () => {
    await render(
      <QueryProvider>
        <QueryClientProbe />
      </QueryProvider>,
    );

    expect(screen.getByText('query-client-ready')).toBeOnTheScreen();
  });
});
