import { useEffect, useState } from 'react';

import { AssetPrice } from '@/features/market/domain/entities/AssetPrice';
import { PriceStreamStatus } from '@/features/market/domain/services/PriceStream';
import { getPriceStream } from '@/infrastructure/composition';

export function usePriceStream(symbol: string, source: string) {
  const [latestPrice, setLatestPrice] = useState<AssetPrice>();
  const [status, setStatus] = useState<PriceStreamStatus>('closed');

  useEffect(() => {
    setLatestPrice(undefined);
    if (!symbol) return;

    const stream = getPriceStream();
    if (!stream) return;

    return stream.subscribe(symbol, source, setLatestPrice, setStatus);
  }, [source, symbol]);

  return { latestPrice, status };
}
