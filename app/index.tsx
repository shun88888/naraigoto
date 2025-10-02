import { Redirect } from 'expo-router';
import { useAppStore } from '../src/state/store';
import { useAuth } from '../src/state/auth-context';

export default function Index() {
  const onboardingDone = useAppStore((s) => s.onboardingCompleted);
  const storedRole = useAppStore((s) => s.role);
  const testLoginActive = useAppStore((s) => s.testLoginActive);
  const { session, profile, loading } = useAuth();

  if (loading) return null;

  if (!session && !testLoginActive) {
    return <Redirect href={storedRole ? '/(auth)/sign-in' : '/(auth)/role-select'} />;
  }

  const role = profile?.role ?? storedRole;
  if (!role) {
    return <Redirect href="/(auth)/role-select" />;
  }

  if (role === 'user' && !onboardingDone) {
    return <Redirect href="/(user)/onboarding/distance" />;
  }

  return <Redirect href={role === 'provider' ? '/(provider)/provider/(tabs)/reservations' : '/(user)/(tabs)/home'} />;
}
