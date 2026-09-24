import { SupabaseAuthRepository } from '@/features/auth/data/repositories/SupabaseAuthRepository';
import { UnavailableAuthRepository } from '@/features/auth/data/repositories/UnavailableAuthRepository';
import { AuthRepository } from '@/features/auth/domain/repositories/AuthRepository';
import { Login } from '@/features/auth/domain/use-cases/Login';
import { Register } from '@/features/auth/domain/use-cases/Register';
import { createSupabaseClient } from '@/infrastructure/auth/supabaseClient';

import { SessionManager } from './SessionManager';

function createRepository(): AuthRepository {
  try {
    return new SupabaseAuthRepository(createSupabaseClient());
  } catch {
    return new UnavailableAuthRepository();
  }
}

export const authRepository = createRepository();
export const sessionManager = new SessionManager(authRepository);
export const loginUseCase = new Login(authRepository);
export const registerUseCase = new Register(authRepository);