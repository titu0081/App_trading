import { AxiosError, AxiosHeaders } from 'axios';

import { mapApiError } from '@/infrastructure/api/ApiErrorMapper';

describe('mapApiError', () => {
  it.each([
    [401, 'AUTHENTICATION'],
    [403, 'AUTHORIZATION'],
    [404, 'NOT_FOUND'],
    [422, 'VALIDATION'],
    [500, 'SERVER'],
  ] as const)('maps status %s to %s', (status, code) => {
    const error = new AxiosError('Request failed', undefined, undefined, undefined, {
      status,
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: { detail: 'Backend detail' },
    });

    expect(mapApiError(error)).toMatchObject({ code, message: 'Backend detail' });
  });

  it('maps requests without a response to NETWORK', () => {
    expect(mapApiError(new AxiosError('Network Error'))).toMatchObject({ code: 'NETWORK' });
  });
});