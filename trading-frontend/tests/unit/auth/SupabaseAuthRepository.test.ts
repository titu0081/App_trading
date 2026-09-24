import { SupabaseClient } from '@supabase/supabase-js';

import { SupabaseAuthRepository } from '@/features/auth/data/repositories/SupabaseAuthRepository';

function createClient() {
  const auth = {
    signInWithPassword: jest.fn(),
  };

  return {
    auth,
    client: { auth } as unknown as SupabaseClient,
  };
}

describe('SupabaseAuthRepository', () => {
  it('maps a successful Supabase login to the domain session', async () => {
    const { auth, client } = createClient();
    auth.signInWithPassword.mockResolvedValue({
      data: {
        session: {
          access_token: 'access-token',
          user: { id: 'user-1', email: 'user@example.com' },
        },
      },
      error: null,
    });

    const repository = new SupabaseAuthRepository(client);

    await expect(
      repository.login('user@example.com', 'secret12'),
    ).resolves.toEqual({
      userId: 'user-1',
      email: 'user@example.com',
      accessToken: 'access-token',
    });
  });

  it('normalizes a Supabase login error', async () => {
    const { auth, client } = createClient();
    auth.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    });

    const repository = new SupabaseAuthRepository(client);

    await expect(
      repository.login('user@example.com', 'secret12'),
    ).rejects.toMatchObject({
      code: 'AUTHENTICATION',
      message: 'Invalid login credentials',
    });
  });
});
