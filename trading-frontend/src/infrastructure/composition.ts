import { ApiAlertRepository } from '@/features/alerts/data/repositories/ApiAlertRepository';
import { CreateAlert } from '@/features/alerts/domain/use-cases/CreateAlert';
import { DeleteAlert } from '@/features/alerts/domain/use-cases/DeleteAlert';
import { GetAlertHistory } from '@/features/alerts/domain/use-cases/GetAlertHistory';
import { GetAlerts } from '@/features/alerts/domain/use-cases/GetAlerts';
import { UpdateAlert } from '@/features/alerts/domain/use-cases/UpdateAlert';
import { ApiMarketRepository } from '@/features/market/data/repositories/ApiMarketRepository';
import { GetAssetBySymbol } from '@/features/market/domain/use-cases/GetAssetBySymbol';
import { GetAssetPrice } from '@/features/market/domain/use-cases/GetAssetPrice';
import { GetAssets } from '@/features/market/domain/use-cases/GetAssets';
import { GetHistoricalPrices } from '@/features/market/domain/use-cases/GetHistoricalPrices';
import { ApiNotificationRepository } from '@/features/notifications/data/repositories/ApiNotificationRepository';
import { GetNotifications } from '@/features/notifications/domain/use-cases/GetNotifications';
import { MarkNotificationAsRead } from '@/features/notifications/domain/use-cases/MarkNotificationAsRead';
import { ApiWatchlistRepository } from '@/features/watchlists/data/repositories/ApiWatchlistRepository';
import { AddAssetToWatchlist } from '@/features/watchlists/domain/use-cases/AddAssetToWatchlist';
import { CreateWatchlist } from '@/features/watchlists/domain/use-cases/CreateWatchlist';
import { DeleteWatchlist } from '@/features/watchlists/domain/use-cases/DeleteWatchlist';
import { GetWatchlist } from '@/features/watchlists/domain/use-cases/GetWatchlist';
import { GetWatchlists } from '@/features/watchlists/domain/use-cases/GetWatchlists';
import { RemoveAssetFromWatchlist } from '@/features/watchlists/domain/use-cases/RemoveAssetFromWatchlist';
import { AxiosApiClient } from '@/infrastructure/api/ApiClient';
import { sessionManager } from '@/infrastructure/auth/authServices';
import { environment } from '@/infrastructure/config/env';
import { FastApiPriceStream } from '@/infrastructure/websocket/FastApiPriceStream';

export const apiClient = new AxiosApiClient(sessionManager);
export const marketRepository = new ApiMarketRepository(apiClient);
export const getAssets = new GetAssets(marketRepository);
export const getAssetBySymbol = new GetAssetBySymbol(marketRepository);
export const getAssetPrice = new GetAssetPrice(marketRepository);
export const getHistoricalPrices = new GetHistoricalPrices(marketRepository);
export const watchlistRepository = new ApiWatchlistRepository(apiClient);
export const alertRepository = new ApiAlertRepository(apiClient);
export const getAlerts = new GetAlerts(alertRepository);
export const getAlertHistory = new GetAlertHistory(alertRepository);
export const createAlert = new CreateAlert(alertRepository);
export const updateAlert = new UpdateAlert(alertRepository);
export const deleteAlert = new DeleteAlert(alertRepository);
export const notificationRepository = new ApiNotificationRepository(apiClient);
export const getNotifications = new GetNotifications(notificationRepository);
export const markNotificationAsRead = new MarkNotificationAsRead(
  notificationRepository,
);
export const getWatchlists = new GetWatchlists(watchlistRepository);
export const getWatchlist = new GetWatchlist(watchlistRepository);
export const createWatchlist = new CreateWatchlist(watchlistRepository);
export const deleteWatchlist = new DeleteWatchlist(watchlistRepository);
export const addAssetToWatchlist = new AddAssetToWatchlist(watchlistRepository);
export const removeAssetFromWatchlist = new RemoveAssetFromWatchlist(
  watchlistRepository,
);

let priceStream: FastApiPriceStream | undefined;

export function getPriceStream() {
  try {
    priceStream ??= new FastApiPriceStream(environment.websocketUrl);
    return priceStream;
  } catch {
    return undefined;
  }
}
