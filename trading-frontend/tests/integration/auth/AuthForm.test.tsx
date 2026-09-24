import { render, screen, userEvent } from '@testing-library/react-native';

import { AuthForm } from '@/features/auth/presentation/components/AuthForm';
import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { strings } from '@/shared/constants/strings';

const mockRegister = jest.fn();

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    session: null,
    isLoading: false,
    login: jest.fn(),
    register: mockRegister,
    logout: jest.fn(),
  }),
}));

describe('AuthForm', () => {
  beforeEach(() => {
    mockRegister.mockReset();
  });

  it('requires matching password confirmation when registering', async () => {
    const user = userEvent.setup();
    await render(
      <AppThemeProvider>
        <AuthForm mode="register" />
      </AppThemeProvider>,
    );

    await user.type(
      screen.getByLabelText(strings.auth.email),
      'user@example.com',
    );
    await user.type(screen.getByLabelText(strings.auth.password), 'secret12');
    await user.type(
      screen.getByLabelText(strings.auth.confirmPassword),
      'different12',
    );
    await user.press(
      screen.getByRole('button', { name: strings.auth.register }),
    );

    expect(
      await screen.findByText(strings.auth.passwordMismatch),
    ).toBeOnTheScreen();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('registers when password confirmation matches', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce(undefined);
    await render(
      <AppThemeProvider>
        <AuthForm mode="register" />
      </AppThemeProvider>,
    );

    await user.type(
      screen.getByLabelText(strings.auth.email),
      'user@example.com',
    );
    await user.type(screen.getByLabelText(strings.auth.password), 'secret12');
    await user.type(
      screen.getByLabelText(strings.auth.confirmPassword),
      'secret12',
    );
    await user.press(
      screen.getByRole('button', { name: strings.auth.register }),
    );

    expect(mockRegister).toHaveBeenCalledWith('user@example.com', 'secret12');
  });
});
