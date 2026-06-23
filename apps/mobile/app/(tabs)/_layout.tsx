import { Tabs, router } from 'expo-router';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FloatingTabBar } from '../../src/components/FloatingTabBar';
import { useAuth } from '../../src/contexts/AuthContext';

export default function TabsLayout() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(auth)/welcome');
    }
  }, [user, isLoading]);

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Carteira',
          tabBarIcon: ({ color }) => <Ionicons name="wallet-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="agreements"
        options={{
          title: 'Acordos',
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
