'use client';

import { useQueryClient } from '@tanstack/react-query';
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, LoginInput, PublicUser, RegisterInput } from '@xperience/shared';
import { authApi } from '../api/auth';
import { refreshSession } from '../api/client';
import { onSessionExpired, tokenStore } from './token-store';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  status: AuthStatus;
  user: PublicUser | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const startSession = useCallback((session: AuthResponse) => {
    tokenStore.set(session.accessToken);
    setUser(session.user);
    setStatus('authenticated');
  }, []);

  const endSession = useCallback(() => {
    tokenStore.clear();
    // Cached data belongs to the previous user and must not leak to the next one
    queryClient.clear();
    setUser(null);
    setStatus('anonymous');
  }, [queryClient]);

  // On first load the token is gone (memory only); the refresh cookie restores the session
  useEffect(() => {
    let active = true;
    void refreshSession().then((session) => {
      if (!active) return;
      if (session) startSession(session);
      else setStatus('anonymous');
    });
    return () => {
      active = false;
    };
  }, [startSession]);

  useEffect(() => onSessionExpired(endSession), [endSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      login: async (input) => startSession(await authApi.login(input)),
      register: async (input) => startSession(await authApi.register(input)),
      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          endSession();
        }
      },
    }),
    [status, user, startSession, endSession],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
