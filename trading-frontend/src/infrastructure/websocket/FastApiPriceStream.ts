import {
  PriceStream,
  PriceStreamStatus,
} from '@/features/market/domain/services/PriceStream';
import { ReconnectionPolicy } from '@/infrastructure/websocket/ReconnectionPolicy';

type SocketFactory = (url: string) => WebSocket;

export class FastApiPriceStream implements PriceStream {
  constructor(
    private readonly baseUrl: string,
    private readonly reconnectionPolicy = new ReconnectionPolicy(),
    private readonly socketFactory: SocketFactory = (url) => new WebSocket(url),
  ) {}

  subscribe(
    symbol: string,
    source: string,
    onPrice: Parameters<PriceStream['subscribe']>[2],
    onStatus?: (status: PriceStreamStatus) => void,
  ): () => void {
    let socket: WebSocket | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryAttempt = 0;
    let disposed = false;

    const connect = () => {
      onStatus?.(retryAttempt === 0 ? 'connecting' : 'reconnecting');
      const query = `symbol=${encodeURIComponent(symbol)}&source=${encodeURIComponent(source)}`;
      socket = this.socketFactory(
        `${this.baseUrl.replace(/\/$/, '')}/ws/prices?${query}`,
      );

      socket.onopen = () => {
        retryAttempt = 0;
        onStatus?.('connected');
      };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as {
            symbol?: unknown;
            price?: unknown;
          };
          if (
            typeof message.symbol === 'string' &&
            typeof message.price === 'number'
          ) {
            onPrice({ symbol: message.symbol, price: message.price });
          }
        } catch {
          // Ignore malformed messages and keep the stream alive.
        }
      };
      socket.onclose = () => {
        if (disposed || !this.reconnectionPolicy.canRetry(retryAttempt)) {
          onStatus?.('closed');
          return;
        }

        retryTimer = setTimeout(
          connect,
          this.reconnectionPolicy.getDelay(retryAttempt),
        );
        retryAttempt += 1;
      };
    };

    connect();

    return () => {
      if (disposed) return;
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onclose = null;
        socket.close();
      }
      onStatus?.('closed');
    };
  }
}
