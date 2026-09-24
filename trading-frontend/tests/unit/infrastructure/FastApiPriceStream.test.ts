import { FastApiPriceStream } from '@/infrastructure/websocket/FastApiPriceStream';
import { ReconnectionPolicy } from '@/infrastructure/websocket/ReconnectionPolicy';

class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  close = jest.fn();

  open() {
    this.onopen?.();
  }

  message(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }

  disconnect() {
    this.onclose?.();
  }
}

describe('FastApiPriceStream', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('connects with encoded parameters and emits valid prices', () => {
    const sockets: MockWebSocket[] = [];
    const factory = jest.fn(() => {
      const socket = new MockWebSocket();
      sockets.push(socket);
      return socket as unknown as WebSocket;
    });
    const onPrice = jest.fn();
    const onStatus = jest.fn();
    const stream = new FastApiPriceStream(
      'ws://localhost:8000/',
      new ReconnectionPolicy(),
      factory,
    );

    stream.subscribe('BTC/USD', 'coin gecko', onPrice, onStatus);
    sockets[0].open();
    sockets[0].message({ symbol: 'BTC/USD', price: 61000 });
    sockets[0].message({ symbol: 'BTC/USD', price: 'invalid' });

    expect(factory).toHaveBeenCalledWith(
      'ws://localhost:8000/ws/prices?symbol=BTC%2FUSD&source=coin%20gecko',
    );
    expect(onStatus).toHaveBeenNthCalledWith(1, 'connecting');
    expect(onStatus).toHaveBeenNthCalledWith(2, 'connected');
    expect(onPrice).toHaveBeenCalledTimes(1);
    expect(onPrice).toHaveBeenCalledWith({ symbol: 'BTC/USD', price: 61000 });
  });

  it('retries with backoff after disconnect', () => {
    const sockets: MockWebSocket[] = [];
    const factory = jest.fn(() => {
      const socket = new MockWebSocket();
      sockets.push(socket);
      return socket as unknown as WebSocket;
    });
    const onStatus = jest.fn();
    const stream = new FastApiPriceStream(
      'ws://localhost:8000',
      new ReconnectionPolicy(2, 100, 200),
      factory,
    );

    stream.subscribe('AAPL', 'finnhub', jest.fn(), onStatus);
    sockets[0].disconnect();
    expect(factory).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(100);

    expect(factory).toHaveBeenCalledTimes(2);
    expect(onStatus).toHaveBeenLastCalledWith('reconnecting');
  });

  it('closes, cancels retry and ignores late events after unsubscribe', () => {
    const sockets: MockWebSocket[] = [];
    const factory = jest.fn(() => {
      const socket = new MockWebSocket();
      sockets.push(socket);
      return socket as unknown as WebSocket;
    });
    const onPrice = jest.fn();
    const onStatus = jest.fn();
    const stream = new FastApiPriceStream(
      'ws://localhost:8000',
      new ReconnectionPolicy(2, 100, 200),
      factory,
    );
    const unsubscribe = stream.subscribe('AAPL', 'finnhub', onPrice, onStatus);
    sockets[0].disconnect();

    unsubscribe();
    sockets[0].message({ symbol: 'AAPL', price: 200 });
    jest.runAllTimers();

    expect(sockets[0].close).toHaveBeenCalledTimes(1);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(onPrice).not.toHaveBeenCalled();
    expect(onStatus).toHaveBeenLastCalledWith('closed');
  });
});
