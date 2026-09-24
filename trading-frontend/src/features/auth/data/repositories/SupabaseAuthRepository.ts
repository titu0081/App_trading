import { Session, SupabaseClient } from '@supabase/supabase-js';

import { UserSession } from '@/features/auth/domain/entities/UserSession';
import { AuthRepository } from '@/features/auth/domain/repositories/AuthRepository';
import { strings } from '@/shared/constants/strings';
import { ApplicationError } from '@/shared/errors/ApplicationError';

function mapSession(session: Session | null): UserSession | null {
  return session
    ? {
        userId: session.user.id,
        email: session.user.email ?? '',
        accessToken: session.access_token,
      }
    : null;
}

function authError(message: string) {
  return new ApplicationError('AUTHENTICATION', message);
}

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly client: SupabaseClient) {}

  async login(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session)
      throw authError(error?.message ?? strings.auth.loginFailed);
    return mapSession(data.session)!;
  }

  async register(email: string, password: string) {
    const { data, error } = await this.client.auth.signUp({ email, password });
    if (error) throw authError(error.message);
    if (!data.session) throw authError(strings.auth.confirmEmail);
    return mapSession(data.session)!;
  }

  async logout() {
    const { error } = await this.client.auth.signOut();
    if (error) throw authError(error.message);
  }

  async getCurrentSession() {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw authError(error.message);
    return mapSession(data.session);
  }

  async refreshSession() {
    const { data, error } = await this.client.auth.refreshSession();
    if (error) throw authError(error.message);
    return mapSession(data.session);
  }

  subscribe(listener: (session: UserSession | null) => void) {
    const { data } = this.client.auth.onAuthStateChange((_event, session) =>
      listener(mapSession(session)),
    );
    return () => data.subscription.unsubscribe();
  }
}
