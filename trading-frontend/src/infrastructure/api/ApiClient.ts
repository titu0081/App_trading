import {
  AxiosHeaders,
  AxiosInstance,
  InternalAxiosRequestConfig,
  create,
  isAxiosError,
} from 'axios';

import { SessionManager } from '@/infrastructure/auth/SessionManager';
import { environment } from '@/infrastructure/config/env';

import { mapApiError } from './ApiErrorMapper';

export const HTTP_TIMEOUT_MS = 10_000;

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  hasRetriedAfterUnauthorized?: boolean;
}

export function createHttpClient() {
  return create({
    baseURL: environment.apiUrl,
    timeout: HTTP_TIMEOUT_MS,
  });
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  signal?: AbortSignal;
}

export interface ApiClient {
  get<TResponse>(path: string, config?: RequestConfig): Promise<TResponse>;
  post<TResponse, TBody>(
    path: string,
    body: TBody,
    config?: RequestConfig,
  ): Promise<TResponse>;
  put<TResponse, TBody>(
    path: string,
    body: TBody,
    config?: RequestConfig,
  ): Promise<TResponse>;
  patch<TResponse, TBody>(
    path: string,
    body: TBody,
    config?: RequestConfig,
  ): Promise<TResponse>;
  delete<TResponse>(path: string, config?: RequestConfig): Promise<TResponse>;
}

export class AxiosApiClient implements ApiClient {
  private readonly client: AxiosInstance;

  constructor(
    private readonly sessions: SessionManager,
    client: AxiosInstance = createHttpClient(),
  ) {
    this.client = client;
    this.configureInterceptors();
  }

  get<TResponse>(path: string, config?: RequestConfig) {
    return this.request<TResponse>('GET', path, undefined, config);
  }
  post<TResponse, TBody>(path: string, body: TBody, config?: RequestConfig) {
    return this.request<TResponse>('POST', path, body, config);
  }
  put<TResponse, TBody>(path: string, body: TBody, config?: RequestConfig) {
    return this.request<TResponse>('PUT', path, body, config);
  }
  patch<TResponse, TBody>(path: string, body: TBody, config?: RequestConfig) {
    return this.request<TResponse>('PATCH', path, body, config);
  }
  delete<TResponse>(path: string, config?: RequestConfig) {
    return this.request<TResponse>('DELETE', path, undefined, config);
  }

  private configureInterceptors() {
    this.client.interceptors.request.use(async (config) => {
      const retriableConfig = config as RetriableRequestConfig;
      if (retriableConfig.hasRetriedAfterUnauthorized) return retriableConfig;

      const token = await this.sessions.getAccessToken();
      if (token) {
        retriableConfig.headers = AxiosHeaders.from(retriableConfig.headers);
        retriableConfig.headers.set('Authorization', `Bearer ${token}`);
      }

      return retriableConfig;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        if (!isAxiosError(error)) throw mapApiError(error);

        const config = error.config as RetriableRequestConfig | undefined;
        if (
          error.response?.status !== 401 ||
          !config ||
          config.hasRetriedAfterUnauthorized
        ) {
          throw mapApiError(error);
        }

        config.hasRetriedAfterUnauthorized = true;
        const token = await this.sessions.refreshAccessToken();
        if (!token) {
          await this.sessions.logout().catch(() => undefined);
          throw mapApiError(error);
        }

        config.headers = AxiosHeaders.from(config.headers);
        config.headers.set('Authorization', `Bearer ${token}`);

        try {
          return await this.client.request(config);
        } catch (retryError) {
          throw mapApiError(retryError);
        }
      },
    );
  }

  private async request<TResponse>(
    method: string,
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ) {
    const response = await this.client.request<TResponse>({
      method,
      url,
      data,
      params: config?.params,
      signal: config?.signal,
      headers: config?.headers,
    });
    return response.data;
  }
}
