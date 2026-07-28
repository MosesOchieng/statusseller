import { Redirect } from 'expo-router';
import { useApp } from '@/context/AppContext';

export default function Index() {
  const { isLoggedIn } = useApp();
  return <Redirect href={isLoggedIn ? '/(tabs)' : '/(auth)/login'} />;
}
