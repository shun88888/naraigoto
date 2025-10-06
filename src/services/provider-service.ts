import { supabase } from '../lib/supabase';

// Updated types for new schema
export type ProviderSlot = {
  id: string;
  experience_id: string;
  experience_title?: string;
  date: string;
  start_time: string;
  end_time: string;
  remaining: number;
  capacity: number;
  status: 'open' | 'closed' | 'canceled';
  created_at?: string;
  updated_at?: string;
};

export type ProviderBooking = {
  id: string;
  user_id: string;
  slot_id: string;
  experience_id: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  participants: number;
  user_name?: string;
  user_email?: string;
  slot_date?: string;
  slot_start_time?: string;
  slot_end_time?: string;
  experience_title?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProviderFeedback = {
  id: string;
  booking_id: string;
  provider_id: string;
  child_id?: string;
  experience_id: string;
  scores: {
    creativity?: number;
    problemSolving?: number;
    collaboration?: number;
    communication?: number;
    persistence?: number;
  };
  comment?: string;
  strengths?: string[];
  tips?: string[];
  created_at?: string;
};

export const providerService = {
  // Slots Management
  async fetchSlots(providerId: string): Promise<ProviderSlot[]> {
    const { data, error } = await supabase
      .from('slots')
      .select(`
        *,
        experiences!inner(id, title, provider_id)
      `)
      .eq('experiences.provider_id', providerId)
      .order('date', { ascending: true });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      experience_id: row.experience_id,
      experience_title: row.experiences?.title,
      date: row.date,
      start_time: row.start_time,
      end_time: row.end_time,
      remaining: row.remaining,
      capacity: row.capacity,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  },

  async upsertSlot(slot: Partial<ProviderSlot> & { id: string; experience_id: string }): Promise<void> {
    const { error } = await supabase
      .from('slots')
      .upsert({
        id: slot.id,
        experience_id: slot.experience_id,
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        remaining: slot.remaining ?? 0,
        capacity: slot.capacity ?? 0,
        status: slot.status ?? 'open',
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async deleteSlot(id: string): Promise<void> {
    // Use RPC function to ensure no active bookings
    const { data, error } = await supabase.rpc('delete_slot', { p_slot: id });

    if (error) throw error;
    if (!data) throw new Error('Cannot delete slot with active bookings');
  },

  // Bookings/Reservations Management
  async fetchBookings(providerId: string, fromDate?: string): Promise<ProviderBooking[]> {
    const { data, error } = await supabase.rpc('provider_bookings', {
      p_provider: providerId,
      p_from: fromDate || null
    });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.booking_id,
      user_id: row.user_id,
      slot_id: row.slot_id,
      experience_id: row.experience_id,
      status: row.booking_status,
      participants: row.participants,
      user_name: row.user_name,
      user_email: row.user_email,
      slot_date: row.slot_date,
      slot_start_time: row.slot_start_time,
      slot_end_time: row.slot_end_time,
      experience_title: row.experience_title,
      created_at: row.booking_created_at
    }));
  },

  async updateBookingStatus(bookingId: string, status: 'confirmed' | 'cancelled' | 'completed'): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (error) throw error;
  },

  // Feedback Management
  async createFeedback(feedback: {
    booking_id: string;
    provider_id: string;
    child_id?: string;
    experience_id: string;
    scores: Record<string, number>;
    comment?: string;
    strengths?: string[];
    tips?: string[];
  }): Promise<string> {
    const { data, error } = await supabase.rpc('create_feedback', {
      p_booking: feedback.booking_id,
      p_provider: feedback.provider_id,
      p_child: feedback.child_id || null,
      p_experience: feedback.experience_id,
      p_scores: feedback.scores,
      p_comment: feedback.comment || null,
      p_strengths: feedback.strengths || [],
      p_tips: feedback.tips || []
    });

    if (error) throw error;
    return data;
  },

  async fetchFeedbacksByBooking(bookingId: string): Promise<ProviderFeedback[]> {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
