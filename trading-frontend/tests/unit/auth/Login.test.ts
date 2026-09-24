import { AuthRepository } from '@/features/auth/domain/repositories/AuthRepository';
import { Login } from '@/features/auth/domain/use-cases/Login';

const session = {
  userId: 'user-1',
  email: 'user@example.com',
  accessToken: 'token',
};

function createRepository(): jest.Mocked<AuthRepository> {
  return {
    login: jest.fn().mockResolvedValue(session),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentSession: jest.fn(),
    refreshSession: jest.fn(),
    subscribe: jest.fn(),
  };
}

describe('Login', () => {
  it('normalizes the email before authentication', async () => {
    const repository = createRepository();
    const login = new Login(repository);

    await expect(login.execute('  USER@Example.COM ', 'secret12')).resolves.toEqual(session);
    expect(repository.login).toHaveBeenCalledWith('user@example.com', 'secret12');
  });

  it('rejects invalid credentials before calling the repository', async () => {
    const repository = createRepository();
    const login = new Login(repository);

    await expect(login.execute('invalid', '123')).rejects.toMatchObject({ code: 'VALIDATION' });
    expect(repository.login).not.toHaveBeenCalled();
  });
});