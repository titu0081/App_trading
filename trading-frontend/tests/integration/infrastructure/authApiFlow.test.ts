import axios, {
  AxiosAdapter,
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import { AuthRepository } from '@/features/auth/domain/repositories/AuthRepository';
import { AxiosApiClient } from '@/infrastructure/api/ApiClient';
import { SessionManager } from '@/infrastructure/auth/SessionManager';

function createRepository(): jest.Mocked<AuthRepository> {
  return {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn().mockResolvedValue(undefined),
    getCurrentSession: jest.fn(),
    refreshSession: jest.fn(),
    subscribe: jest.fn(),
  };
}

function session(accessToken: string) {
  return { userId: 'user-1', email: 'user@test.dev', accessToken };
}

function okResponse(config: InternalAxiosRequestConfig): AxiosResponse {
  return {
    config,
    data: { ok: true },
    headers: {},
    status: 200,
    statusText: 'OK',
  };
}

function unauthorized(config: InternalAxiosRequestConfig) {
  return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
    config,
    data: { detail: 'Unauthorized' },
    headers: {},
    status: 401,
    statusText: 'Unauthorized',
  });
}

describe('auth to API integration', () => {
  it('attaches the JWT of the restored session to business requests', async () => {
    const repository = createRepository();
    repository.getCurrentSession.mockResolvedValue(session('jwt-initial'));
    const adapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (config) => okResponse(config),
    );
    const api = new AxiosApiClient(
      new SessionManager(repository),
      axios.create({ adapter }),
    );

    await api.get('/market/assets');

    const headers = AxiosHeaders.from(adapter.mock.calls[0][0].headers);
    expect(headers.get('Authorization')).toBe('Bearer jwt-initial');
  });

  it('refreshes an expired JWT once and retries the request', async () => {
    const repository = createRepository();
    repository.getCurrentSession.mockResolvedValue(session('jwt-expired'));
    repository.refreshSession.mockResolvedValue(session('jwt-fresh'));
    const adapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (config) => {
        if (adapter.mock.calls.length === 1) throw unauthorized(config);
        return okResponse(config);
      },
    );
    const api = new AxiosApiClient(
      new SessionManager(repository),
      axios.create({ adapter }),
    );

    await expect(api.get('/watchlists')).resolves.toEqual({ ok: true });
    expect(repository.refreshSession).toHaveBeenCalledTimes(1);
    const retryHeaders = AxiosHeaders.from(adapter.mock.calls[1][0].headers);
    expect(retryHeaders.get('Authorization')).toBe('Bearer jwt-fresh');
  });

  it('logs out when the session cannot be refreshed', async () => {
    const repository = createRepository();
    repository.getCurrentSession.mockResolvedValue(session('jwt-expired'));
    repository.refreshSession.mockResolvedValue(null);
    const adapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (config) => {
        throw unauthorized(config);
      },
    );
    const api = new AxiosApiClient(
      new SessionManager(repository),
      axios.create({ adapter }),
    );

    await expect(api.get('/alerts')).rejects.toMatchObject({
      code: 'AUTHENTICATION',
    });
    expect(repository.logout).toHaveBeenCalledTimes(1);
  });

  it('sends no Authorization header when there is no session', async () => {
    const repository = createRepository();
    repository.getCurrentSession.mockResolvedValue(null);
    const adapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (config) => okResponse(config),
    );
    const api = new AxiosApiClient(
      new SessionManager(repository),
      axios.create({ adapter }),
    );

    await api.get('/market/assets');

    const headers = AxiosHeaders.from(adapter.mock.calls[0][0].headers);
    expect(headers.get('Authorization')).toBeUndefined();
  });
});
