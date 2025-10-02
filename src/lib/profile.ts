import { supabase } from './supabase';

export type ProfileRole = 'user' | 'provider' | null;

export type Profile = {
  id: string;
  role: ProfileRole;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, display_name, avatar_url, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function upsertProfileRole(userId: string, role: Exclude<ProfileRole, null>) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, role }, { onConflict: 'id' })
    .select('id, role, display_name, avatar_url, created_at, updated_at')
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function clearProfileRole(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: null })
    .eq('id', userId)
    .select('id, role, display_name, avatar_url, created_at, updated_at')
    .single();
  if (error) throw error;
  return data as Profile;
}
