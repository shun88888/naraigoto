import '../../polyfills';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wtmdugqriusycsapatbe.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0bWR1Z3FyaXVzeWNzYXBhdGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTAwODAsImV4cCI6MjA3NDMyNjA4MH0.A7FPsobquggJIKtv9uHqXRwkw1vbtQf4BJPp5IQE2JY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});





