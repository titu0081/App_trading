import { ReconnectionPolicy } from '@/infrastructure/websocket/ReconnectionPolicy';

describe('ReconnectionPolicy', () => {
  it('uses bounded exponential backoff', () => {
    const policy = new ReconnectionPolicy(3, 1000, 4000);

    expect(policy.getDelay(0)).toBe(1000);
    expect(policy.getDelay(1)).toBe(2000);
    expect(policy.getDelay(4)).toBe(4000);
    expect(policy.canRetry(2)).toBe(true);
    expect(policy.canRetry(3)).toBe(false);
  });
});
