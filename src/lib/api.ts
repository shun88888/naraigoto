import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dummyExperiences, dummySlots } from './dummyData';

type ListParams = { page?: number; pageSize?: number; filters?: { q?: string; sort?: string; [k: string]: any } };

export async function listExperiences({ page = 1, pageSize = 10, filters = {} }: ListParams) {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    let query = supabase.from('experiences').select('*').range(from, to);
    // simple filters
    if (filters.q) {
      // naive ilike on title/description
      query = query.ilike('title', `%${filters.q}%`);
    }
    // sorting
    if (filters.sort === 'new') query = query.order('created_at', { ascending: false } as any);
    else query = query.order('id');
    const { data, error } = await query;
    if (error) throw error;

    const list = Array.isArray(data) ? data : [];
    const normalized = list.length > 0 ? list : dummyExperiences;

    await AsyncStorage.setItem('cache:experiences', JSON.stringify(normalized));
    return normalized;
  } catch (e) {
    const cached = await AsyncStorage.getItem('cache:experiences');
    if (cached) return JSON.parse(cached);
    // fallback to dummy
    return dummyExperiences;
  }
}

export async function getExperience(id: string) {
  try {
    const { data, error } = await supabase.from('experiences').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  } catch (e) {
    return dummyExperiences.find((d) => d.id === id);
  }
}

export async function listSlots(experienceId: string, fromDate: string) {
  try {
    const { data, error } = await supabase
      .from('slots')
      .select('*')
      .eq('experience_id', experienceId)
      .gte('date', fromDate)
      .order('date');
    if (error) throw error;
    await AsyncStorage.setItem(`cache:slots:${experienceId}`, JSON.stringify(data));
    return data;
  } catch (e) {
    const cached = await AsyncStorage.getItem(`cache:slots:${experienceId}`);
    if (cached) return JSON.parse(cached);
    return dummySlots.filter((s) => s.experience_id === experienceId);
  }
}

// Provider helpers
export async function providerBookings(providerId: string, fromDate?: string) {
  try {
    const { data, error } = await supabase.rpc('provider_bookings', { p_provider: providerId, p_from: fromDate });
    if (error) throw error;
    return data as any[];
  } catch (e) {
    const cached = await AsyncStorage.getItem('cache:provider_bookings');
    if (cached) return JSON.parse(cached);
    return [];
  }
}

export async function upsertSlot(experienceId: string, date: string, remaining: number, status: 'open'|'closed'|'canceled'='open') {
  const { data, error } = await supabase.rpc('upsert_slot', { p_experience: experienceId, p_date: date, p_remaining: remaining, p_status: status });
  if (error) throw error;
  return data as string; // slot id
}

export async function deleteSlot(slotId: string) {
  const { error } = await supabase.rpc('delete_slot', { p_slot: slotId });
  if (error) throw error;
  return true;
}

export async function createFeedback(params: { bookingId: string; providerId: string; childId?: string; experienceId: string; scores: any; comment?: string; strengths?: string[]; tips?: string[]; }) {
  const { data, error } = await supabase.rpc('create_feedback', {
    p_booking: params.bookingId,
    p_provider: params.providerId,
    p_child: params.childId || null,
    p_experience: params.experienceId,
    p_scores: params.scores,
    p_comment: params.comment || null,
    p_strengths: params.strengths || [],
    p_tips: params.tips || []
  });
  if (error) throw error;
  return data as string; // feedback id
}

export async function reserve({ slotId, participants }: { slotId: string; participants: number }) {
  // Try RPC decrement
  const { data: ok, error: rpcErr } = await supabase.rpc('reserve_seat', {
    p_slot: slotId,
    p_count: participants
  });
  if (rpcErr || ok !== true) {
    return { success: false, message: '予約に失敗しました。残数を確認して再試行してください。' };
  }
  // Insert booking (MVP: public insert)
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({ slot_id: slotId })
    .select('*')
    .single();
  if (error) return { success: false, message: '予約作成に失敗しました。' };
  return { success: true, booking };
}

export async function listBookings(userId?: string) {
  try {
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    await AsyncStorage.setItem('cache:bookings', JSON.stringify(data));
    return data;
  } catch (e) {
    const cached = await AsyncStorage.getItem('cache:bookings');
    if (cached) return JSON.parse(cached);
    return [];
  }
}

export async function getBooking(id: string) {
  try {
    const { data, error } = await supabase.from('bookings').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  } catch (e) {
    const cached = await AsyncStorage.getItem('cache:bookings');
    if (cached) {
      const arr = JSON.parse(cached);
      return arr.find((b: any) => b.id === id);
    }
    return null;
  }
}

// Children profiles
export async function listChildren() {
  try {
    const { data, error } = await supabase.from('children_profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as any[];
  } catch (e) {
    return [];
  }
}

export async function upsertChild(payload: { id?: string; name: string; birthdate?: string; allergies?: string; notes?: string }) {
  const { data, error } = await supabase.from('children_profiles').upsert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function getChild(id: string) {
  const { data, error } = await supabase.from('children_profiles').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

// Feedbacks
export async function listFeedbacksByBooking(bookingId: string) {
  const { data, error } = await supabase.from('feedbacks').select('*').eq('booking_id', bookingId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as any[];
}

export async function getFeedback(id: string) {
  const { data, error } = await supabase.from('feedbacks').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

