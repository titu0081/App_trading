import { UserSession } from '@/features/auth/domain/entities/UserSession';

export interface AuthRepository {
  login(email: string, password: string): Promise<UserSession>;
  register(email: string, password: string): Promise<UserSession>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<UserSession | null>;
  refreshSession(): Promise<UserSession | null>;
  subscribe(listener: (session: UserSession | null) => void): () => void;
}