import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { useAdminAuth } from '../../src/contexts/AdminAuthContext';

export default function AdminLayout() {
  const { admin, isAdminLoading } = useAdminAuth();

  useEffect(() => {
    if (!isAdminLoading && !admin) {
      router.replace('/(auth)/welcome');
    }
  }, [admin, isAdminLoading]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
