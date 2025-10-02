import Constants from 'expo-constants';

type RoleKey = 'user' | 'provider';

type ExtraConfig = {
  testAccounts?: Partial<Record<RoleKey, { email?: string; password?: string }>>;
};

const extras: ExtraConfig = (Constants.expoConfig?.extra || Constants.expoGoConfig?.extra || {}) as ExtraConfig;

const DEFAULT_TEST_ACCOUNTS: Record<RoleKey, { email: string; password: string }> = {
  user: {
    email: 'test-user@naraigoto.local',
    password: 'TestUser123!'
  },
  provider: {
    email: 'test-provider@naraigoto.local',
    password: 'TestProvider123!'
  }
};

function readEnv(role: RoleKey) {
  if (role === 'provider') {
    const email = process.env.EXPO_PUBLIC_TEST_PROVIDER_EMAIL;
    const password = process.env.EXPO_PUBLIC_TEST_PROVIDER_PASSWORD;
    if (email && password) return { email, password };
  } else {
    const email = process.env.EXPO_PUBLIC_TEST_USER_EMAIL;
    const password = process.env.EXPO_PUBLIC_TEST_USER_PASSWORD;
    if (email && password) return { email, password };
  }
  return null;
}

export function getTestCredentials(role: RoleKey) {
  const fromEnv = readEnv(role);
  if (fromEnv) return fromEnv;

  const fallback = extras.testAccounts?.[role];
  if (fallback?.email && fallback?.password) {
    return { email: fallback.email, password: fallback.password };
  }
  return DEFAULT_TEST_ACCOUNTS[role];
}
