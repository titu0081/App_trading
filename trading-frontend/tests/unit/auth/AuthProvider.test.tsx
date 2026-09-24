import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Button, Text } from 'react-native';

import {
  loginUseCase,
  sessionManager,
} from '@/infrastructure/auth/authServices';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';

jest.mock('@/infrastructure/auth/authServices', () => ({
  loginUseCase: { execute: jest.fn() },
  registerUseCase: { execute: jest.fn() },
  sessionManager: {
    restoreSession: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
    logout: jest.fn(),
  },
}));

const mockSessionManager = sessionManager as jest.Mocked<typeof sessionManager>;
const mockLoginUseCase = loginUseCase as jest.Mocked<typeof loginUseCase>;

function SessionState() {
  const { isLoading, login, logout, session } = useAuth();
  return (
    <>
      <Text>
        {isLoading ? 'loading' : session ? 'authenticated' : 'anonymous'}
      </Text>
      <Button
        title="login"
        onPress={() => login('user@example.com', 'secret12')}
      />
      <Button title="logout" onPress={logout} />
    </>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('finishes loading as anonymous when session restoration fails', async () => {
    mockSessionManager.restoreSession.mockRejectedValueOnce(
      new Error('storage unavailable'),
    );

    await render(
      <AuthProvider>
        <SessionState />
      </AuthProvider>,
    );

    expect(await screen.findByText('anonymous')).toBeOnTheScreen();
    expect(mockSessionManager.subscribe).toHaveBeenCalledTimes(1);
  });

  it('restores the session and clears it after logout', async () => {
    mockSessionManager.restoreSession.mockResolvedValueOnce({
      userId: 'user-1',
      email: 'user@example.com',
      accessToken: 'token',
    });
    mockSessionManager.logout.mockResolvedValueOnce();

    await render(
      <AuthProvider>
        <SessionState />
      </AuthProvider>,
    );

    expect(await screen.findByText('authenticated')).toBeOnTheScreen();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'logout' }));
    });

    expect(await screen.findByText('anonymous')).toBeOnTheScreen();
    expect(mockSessionManager.logout).toHaveBeenCalledTimes(1);
  });

  it('publishes a successful login session', async () => {
    mockSessionManager.restoreSession.mockResolvedValueOnce(null);
    mockLoginUseCase.execute.mockResolvedValueOnce({
      userId: 'user-1',
      email: 'user@example.com',
      accessToken: 'token',
    });

    await render(
      <AuthProvider>
        <SessionState />
      </AuthProvider>,
    );

    expect(await screen.findByText('anonymous')).toBeOnTheScreen();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'login' }));
    });

    expect(await screen.findByText('authenticated')).toBeOnTheScreen();
    expect(mockLoginUseCase.execute).toHaveBeenCalledWith(
      'user@example.com',
      'secret12',
    );
  });
});
