import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchProfile, Profile, ProfileRole } from '../lib/profile';
import { useAppStore } from './store';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  setStoredRoleHint: (role: ProfileRole) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const setRole = useAppStore((s) => s.setRole);
  const setTestLoginActive = useAppStore((s) => s.setTestLoginActive);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    try {
      const data = await fetchProfile(session.user.id);
      setProfile(data);
      setRole(data?.role ?? null);
      setTestLoginActive(false);
    } catch (error) {
      console.warn('[auth] fetchProfile failed', error);
      setProfile(null);
      setRole(null);
    } finally {
      setProfileLoading(false);
    }
  }, [session?.user, setRole, setTestLoginActive]);

  useEffect(() => {
    let isMounted = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session ?? null);
        setSessionLoaded(true);
      })
      .catch((error) => {
        console.warn('[auth] getSession failed', error);
        if (!isMounted) return;
        setSession(null);
        setSessionLoaded(true);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    refreshProfile();
  }, [session?.user?.id, refreshProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
    setTestLoginActive(false);
  }, [setRole, setTestLoginActive]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    profile,
    loading: !sessionLoaded || (session?.user ? profileLoading : false),
    profileLoading,
    refreshProfile,
    signOut,
    setStoredRoleHint: setRole
  }), [session, profile, sessionLoaded, profileLoading, refreshProfile, signOut, setRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
