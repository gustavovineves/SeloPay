import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { adminApi, registerAdminUnauthorizedHandler } from '../services/api';
import type { AdminUser } from '../types';

const ADMIN_TOKEN_KEY = 'selopay_admin_jwt_token';

interface AdminAuthContextData {
  admin: AdminUser | null;
  adminToken: string | null;
  isAdminLoading: boolean;
  adminSignIn: (token: string, admin: AdminUser) => Promise<void>;
  adminSignOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextData>({} as AdminAuthContextData);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(ADMIN_TOKEN_KEY);
        if (stored) {
          adminApi.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
          const { data } = await adminApi.get<AdminUser>('/admin/auth/me');
          setAdminToken(stored);
          setAdmin(data);
        }
      } catch {
        await SecureStore.deleteItemAsync(ADMIN_TOKEN_KEY).catch(() => {});
        delete adminApi.defaults.headers.common['Authorization'];
      } finally {
        setIsAdminLoading(false);
      }
    })();
  }, []);

  const adminSignOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(ADMIN_TOKEN_KEY).catch(() => {});
    delete adminApi.defaults.headers.common['Authorization'];
    setAdminToken(null);
    setAdmin(null);
    router.replace('/(auth)/welcome');
  }, []);

  useEffect(() => {
    registerAdminUnauthorizedHandler(() => { adminSignOut().catch(() => {}); });
  }, [adminSignOut]);

  const adminSignIn = useCallback(async (newToken: string, adminData: AdminUser) => {
    await SecureStore.setItemAsync(ADMIN_TOKEN_KEY, newToken);
    adminApi.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setAdminToken(newToken);
    setAdmin(adminData);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, adminToken, isAdminLoading, adminSignIn, adminSignOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
