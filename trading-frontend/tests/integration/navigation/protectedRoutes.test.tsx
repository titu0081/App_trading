/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock factories require CommonJS require() */
import { renderRouter, screen } from 'expo-router/testing-library';

import { useAuth } from '@/providers/AuthProvider';
import { strings } from '@/shared/constants/strings';

jest.mock('react-native-reanimated', () => ({}));

jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ name }: { name: string }) =>
      React.createElement(Text, null, name),
  };
});

jest.mock('@/providers/AppProviders', () => ({
  AppProviders: ({ children }: { children: unknown }) => children,
}));

jest.mock('@/providers/AuthProvider', () => ({ useAuth: jest.fn() }));

jest.mock('@/providers/AppThemeProvider', () => {
  const { lightColors } = require('@/shared/theme/colors');
  return { useAppTheme: () => ({ colors: lightColors, mode: 'light' }) };
});

jest.mock('@/features/auth/presentation/screens/LoginScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { LoginScreen: () => React.createElement(Text, null, 'login-screen') };
});
jest.mock('@/features/auth/presentation/screens/RegisterScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    RegisterScreen: () => React.createElement(Text, null, 'register-screen'),
  };
});
jest.mock('@/features/market/presentation/screens/MarketScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    MarketScreen: () => React.createElement(Text, null, 'market-screen'),
  };
});
jest.mock('@/features/market/presentation/screens/AssetDetailScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    AssetDetailScreen: () => React.createElement(Text, null, 'asset-screen'),
  };
});
jest.mock('@/features/watchlists/presentation/screens/WatchlistsScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    WatchlistsScreen: () =>
      React.createElement(Text, null, 'watchlists-screen'),
  };
});
jest.mock(
  '@/features/watchlists/presentation/screens/WatchlistDetailScreen',
  () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
      WatchlistDetailScreen: () =>
        React.createElement(Text, null, 'watchlist-detail-screen'),
    };
  },
);
jest.mock('@/features/alerts/presentation/screens/AlertsScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    AlertsScreen: () => React.createElement(Text, null, 'alerts-screen'),
  };
});
jest.mock('@/features/alerts/presentation/screens/CreateAlertScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    CreateAlertScreen: () =>
      React.createElement(Text, null, 'create-alert-screen'),
  };
});
jest.mock('@/features/alerts/presentation/screens/AlertHistoryScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    AlertHistoryScreen: () =>
      React.createElement(Text, null, 'alert-history-screen'),
  };
});
jest.mock(
  '@/features/notifications/presentation/screens/NotificationsScreen',
  () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
      NotificationsScreen: () =>
        React.createElement(Text, null, 'notifications-screen'),
    };
  },
);
jest.mock('@/features/profile/presentation/screens/ProfileScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    ProfileScreen: () => React.createElement(Text, null, 'profile-screen'),
  };
});

const mockUseAuth = jest.mocked(useAuth);

function setAuthState(
  session: { userId: string; email: string; accessToken: string } | null,
  isLoading = false,
) {
  mockUseAuth.mockReturnValue({
    session,
    isLoading,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  });
}

describe('protected navigation', () => {
  it('shows loading while the session is being restored', async () => {
    setAuthState(null, true);

    await renderRouter('./app', { initialUrl: '/' });

    expect(screen.getByText(strings.common.loading)).toBeOnTheScreen();
    expect(screen.queryByText('login-screen')).toBeNull();
  });

  it('redirects unauthenticated users to login', async () => {
    setAuthState(null);

    await renderRouter('./app', { initialUrl: '/' });

    expect(await screen.findByText('login-screen')).toBeOnTheScreen();
    expect(screen.queryByText('market-screen')).toBeNull();
  });

  it('redirects authenticated users from / to the market tab', async () => {
    setAuthState({
      userId: 'user-1',
      email: 'user@test.dev',
      accessToken: 'token',
    });

    await renderRouter('./app', { initialUrl: '/' });

    expect(await screen.findByText('market-screen')).toBeOnTheScreen();
    for (const label of [
      strings.navigation.market,
      strings.navigation.watchlists,
      strings.navigation.alerts,
      strings.navigation.notifications,
      strings.navigation.profile,
    ]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.queryByText('alerts/create')).toBeNull();
    expect(screen.queryByText('market/[symbol]')).toBeNull();
  });

  it('navigates to nested routes inside the authenticated group', async () => {
    setAuthState({
      userId: 'user-1',
      email: 'user@test.dev',
      accessToken: 'token',
    });

    await renderRouter('./app', { initialUrl: '/alerts/history' });

    expect(await screen.findByText('alert-history-screen')).toBeOnTheScreen();
  });
});
