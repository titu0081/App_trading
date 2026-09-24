import { act, renderHook } from '@testing-library/react-native';

import { PriceStream } from '@/features/market/domain/services/PriceStream';
import { usePriceStream } from '@/features/market/presentation/hooks/usePriceStream';
import { getPriceStream } from '@/infrastructure/composition';

jest.mock('@/infrastructure/composition', () => ({
  getPriceStream: jest.fn(),
}));

const mockGetPriceStream = jest.mocked(getPriceStream);

interface HookProps {
  symbol: string;
  source: string;
}

describe('usePriceStream', () => {
  it('subscribes, receives messages and unsubscribes when parameters change or unmounts', async () => {
    const firstUnsubscribe = jest.fn();
    const secondUnsubscribe = jest.fn();
    let onPrice: Parameters<PriceStream['subscribe']>[2] = jest.fn();
    let onStatus: NonNullable<Parameters<PriceStream['subscribe']>[3]> =
      jest.fn();
    const subscribe = jest
      .fn()
      .mockImplementationOnce(
        (
          _symbol: string,
          _source: string,
          priceHandler: typeof onPrice,
          statusHandler: typeof onStatus,
        ) => {
          onPrice = priceHandler;
          onStatus = statusHandler;
          return firstUnsubscribe;
        },
      )
      .mockReturnValueOnce(secondUnsubscribe);
    mockGetPriceStream.mockReturnValue({ subscribe } as unknown as NonNullable<
      ReturnType<typeof getPriceStream>
    >);

    const hook = await renderHook<ReturnType<typeof usePriceStream>, HookProps>(
      ({ symbol, source }) => usePriceStream(symbol, source),
      { initialProps: { symbol: 'AAPL', source: 'finnhub' } },
    );

    await act(async () => {
      onStatus('connected');
      onPrice({ symbol: 'AAPL', price: 190 });
    });
    expect(hook.result.current).toEqual({
      latestPrice: { symbol: 'AAPL', price: 190 },
      status: 'connected',
    });

    await hook.rerender({ symbol: 'BTC', source: 'coingecko' });
    expect(firstUnsubscribe).toHaveBeenCalledTimes(1);
    expect(subscribe).toHaveBeenLastCalledWith(
      'BTC',
      'coingecko',
      expect.any(Function),
      expect.any(Function),
    );

    await hook.unmount();
    expect(secondUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('does not subscribe without a symbol', async () => {
    const subscribe = jest.fn();
    mockGetPriceStream.mockReturnValue({ subscribe } as unknown as NonNullable<
      ReturnType<typeof getPriceStream>
    >);

    const hook = await renderHook(() => usePriceStream('', 'finnhub'));

    expect(subscribe).not.toHaveBeenCalled();
    expect(hook.result.current.status).toBe('closed');
    await hook.unmount();
  });
});
