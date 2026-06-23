import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { useAdminAuth } from '../src/contexts/AdminAuthContext';
import { LoadingScreen } from '../src/components/ui/LoadingScreen';

export default function Index() {
  const { user, isLoading } = useAuth();
  const { admin, isAdminLoading } = useAdminAuth();

  if (isLoading || isAdminLoading) return <LoadingScreen message="Carregando SeloPay..." />;

  if (admin) return <Redirect href="/(admin)/disputes" />;
  if (user) return <Redirect href="/(tabs)/home" />;
  return <Redirect href="/(auth)/welcome" />;
}
