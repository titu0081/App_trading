import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { UserSession } from '@/features/auth/domain/entities/UserSession';
import {
  loginUseCase,
  registerUseCase,
  sessionManager,
} from '@/infrastructure/auth/authServices';

interface AuthContextValue {
  session: UserSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    sessionManager
      .restoreSession()
      .then((value) => active && setSession(value))
      .catch(() => active && setSession(null))
      .finally(() => active && setIsLoading(false));
    const unsubscribe = sessionManager.subscribe(setSession);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        login: async (email, password) =>
          setSession(await loginUseCase.execute(email, password)),
        register: async (email, password) =>
          setSession(await registerUseCase.execute(email, password)),
        logout: async () => {
          await sessionManager.logout();
          setSession(null);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
