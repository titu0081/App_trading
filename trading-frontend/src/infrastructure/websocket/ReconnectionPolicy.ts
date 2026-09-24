export class ReconnectionPolicy {
  constructor(
    private readonly maxRetries = 5,
    private readonly initialDelayMs = 1000,
    private readonly maxDelayMs = 30000,
  ) {}

  canRetry(attempt: number): boolean {
    return attempt < this.maxRetries;
  }

  getDelay(attempt: number): number {
    return Math.min(this.initialDelayMs * 2 ** attempt, this.maxDelayMs);
  }
}
