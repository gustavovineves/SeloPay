import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/contexts/AuthContext';
import { AdminAuthProvider } from '../src/contexts/AdminAuthContext';
import { NotificationsProvider } from '../src/contexts/NotificationsContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <NotificationsProvider>
          <StatusBar style="light" backgroundColor="#0A4F5E" />
          <Stack screenOptions={{ headerShown: false }} />
        </NotificationsProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}
