import axios, {
  AxiosAdapter,
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import {
  AxiosApiClient,
  createHttpClient,
  HTTP_TIMEOUT_MS,
} from '@/infrastructure/api/ApiClient';
import { SessionManager } from '@/infrastructure/auth/SessionManager';

function createSessionManager() {
  return {
    getAccessToken: jest.fn().mockResolvedValue('initial-token'),
    refreshAccessToken: jest.fn().mockResolvedValue('refreshed-token'),
    logout: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<SessionManager>;
}

function response(
  config: InternalAxiosRequestConfig,
  data: unknown = { ok: true },
): AxiosResponse {
  return {
    config,
    data,
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

function createClient(adapter: jest.MockedFunction<AxiosAdapter>) {
  return axios.create({ adapter });
}

describe('AxiosApiClient', () => {
  it('uses centralized base URL and timeout configuration', () => {
    process.env.EXPO_PUBLIC_API_URL = 'https://api.example.com';

    const client = createHttpClient();

    expect(client.defaults.baseURL).toBe('https://api.example.com');
    expect(client.defaults.timeout).toBe(HTTP_TIMEOUT_MS);
  });

  it('adds the active access token to the Authorization header', async () => {
    const adapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (config) => response(config),
    );
    const sessions = createSessionManager();
    const api = new AxiosApiClient(sessions, createClient(adapter));

    await api.get('/assets');

    const headers = AxiosHeaders.from(adapter.mock.calls[0][0].headers);
    expect(headers.get('Authorization')).toBe('Bearer initial-token');
  });

  it('refreshes once after a 401 and retries with the new token', async () => {
    const adapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (config) => {
        if (adapter.mock.calls.length === 1) throw unauthorized(config);
        return response(config, { retried: true });
      },
    );
    const sessions = createSessionManager();
    const api = new AxiosApiClient(sessions, createClient(adapter));

    await expect(api.get('/private')).resolves.toEqual({ retried: true });
    expect(sessions.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(2);
    const retryHeaders = AxiosHeaders.from(adapter.mock.calls[1][0].headers);
    expect(retryHeaders.get('Authorization')).toBe('Bearer refreshed-token');
  });

  it('does not loop when the retried request also returns 401', async () => {
    const adapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (config) => {
        throw unauthorized(config);
      },
    );
    const sessions = createSessionManager();
    const api = new AxiosApiClient(sessions, createClient(adapter));

    await expect(api.get('/private')).rejects.toMatchObject({
      code: 'AUTHENTICATION',
    });
    expect(sessions.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it('logs out when a 401 cannot be recovered', async () => {
    const adapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (config) => {
        throw unauthorized(config);
      },
    );
    const sessions = createSessionManager();
    sessions.refreshAccessToken.mockResolvedValueOnce(null);
    const api = new AxiosApiClient(sessions, createClient(adapter));

    await expect(api.get('/private')).rejects.toMatchObject({
      code: 'AUTHENTICATION',
    });
    expect(sessions.logout).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it('maps request timeouts to an application timeout error', async () => {
    const adapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (config) => {
        throw new AxiosError('timeout', 'ECONNABORTED', config);
      },
    );
    const api = new AxiosApiClient(
      createSessionManager(),
      createClient(adapter),
    );

    await expect(api.get('/slow')).rejects.toMatchObject({ code: 'TIMEOUT' });
  });
});
