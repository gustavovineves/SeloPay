import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { api, registerUnauthorizedHandler } from '../services/api';
import type { User } from '../types';

const TOKEN_KEY = 'selopay_jwt_token';

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (stored) {
          api.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
          const { data } = await api.get<User>('/auth/me');
          setToken(stored);
          setUser(data);
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (newToken: string, userData: User) => {
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
  }, []);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    router.replace('/(auth)/welcome');
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => { signOut().catch(() => {}); });
  }, [signOut]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<User>('/auth/me');
      setUser(data);
    } catch {
      // 401 já é tratado pelo interceptor (chama _onUnauthorized → signOut).
      // Erros de rede (timeout, 500, etc.) não devem deslogar o usuário.
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
