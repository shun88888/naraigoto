import { supabase } from '../lib/supabase';
import type { Slot, Reservation, ReservationFeedback } from '../state/provider-store';

export const providerService = {
  // Slots
  async fetchSlots(): Promise<Slot[]> {
    const { data, error } = await supabase
      .from('provider_slots')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      experience: row.experience,
      date: row.date,
      start: row.start_time,
      end: row.end_time,
      venue: row.venue,
      capacity: row.capacity,
      remaining: row.remaining,
      ageRange: row.age_range,
      mentor: row.mentor,
      state: row.state,
      price: row.price,
      category: row.category,
      tags: row.tags,
      note: row.note,
      deadlineHours: row.deadline_hours,
      repeat: {
        type: row.repeat_type,
        until: row.repeat_until,
        count: row.repeat_count
      },
      createdBy: row.created_by,
      updatedAt: row.updated_at
    }));
  },

  async upsertSlot(slot: Slot): Promise<void> {
    const { error } = await supabase
      .from('provider_slots')
      .upsert({
        id: slot.id,
        experience: slot.experience,
        date: slot.date,
        start_time: slot.start,
        end_time: slot.end,
        venue: slot.venue,
        capacity: slot.capacity,
        remaining: slot.remaining,
        age_range: slot.ageRange,
        mentor: slot.mentor,
        state: slot.state,
        price: slot.price,
        category: slot.category,
        tags: slot.tags,
        note: slot.note,
        deadline_hours: slot.deadlineHours,
        repeat_type: slot.repeat?.type || 'none',
        repeat_until: slot.repeat?.until,
        repeat_count: slot.repeat?.count,
        created_by: slot.createdBy,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async deleteSlot(id: string): Promise<void> {
    const { error } = await supabase
      .from('provider_slots')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Reservations
  async fetchReservations(): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('provider_reservations')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;

    const reservations = await Promise.all(
      (data || []).map(async (row) => {
        // Fetch history
        const { data: historyData } = await supabase
          .from('reservation_history')
          .select('*')
          .eq('reservation_id', row.id)
          .order('created_at', { ascending: false });

        return {
          id: row.id,
          date: row.date,
          start: row.start_time,
          end: row.end_time,
          experience: row.experience,
          venue: row.venue,
          mentor: row.mentor,
          child: {
            name: row.child_name,
            kana: row.child_kana,
            age: row.child_age
          },
          guardian: {
            name: row.guardian_name,
            phone: row.guardian_phone,
            email: row.guardian_email
          },
          profile: {
            strengths: row.strengths || [],
            weakPoints: row.weak_points || [],
            recent: row.recent_activity || ''
          },
          history: (historyData || []).map((h) => ({
            date: h.date,
            experience: h.experience,
            memo: h.memo
          })),
          status: row.status,
          memo: row.memo,
          feedback: row.feedback_focus
            ? {
                focus: row.feedback_focus,
                collaboration: row.feedback_collaboration,
                challenge: row.feedback_challenge,
                creativity: row.feedback_creativity,
                stamina: row.feedback_stamina,
                note: row.feedback_note,
                childSummary: row.feedback_child_summary,
                shareWithGuardian: row.feedback_share_with_guardian,
                updatedAt: row.feedback_updated_at
              }
            : undefined,
          pendingSync: row.pending_sync
        };
      })
    );

    return reservations;
  },

  async updateReservationStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('provider_reservations')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async saveReservationMemo(id: string, memo?: string): Promise<void> {
    const { error } = await supabase
      .from('provider_reservations')
      .update({
        memo,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async saveReservationContact(
    id: string,
    contact: { phone?: string; email?: string }
  ): Promise<void> {
    const { error } = await supabase
      .from('provider_reservations')
      .update({
        guardian_phone: contact.phone,
        guardian_email: contact.email,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async saveFeedback(id: string, feedback: ReservationFeedback): Promise<void> {
    const { error } = await supabase
      .from('provider_reservations')
      .update({
        feedback_focus: feedback.focus,
        feedback_collaboration: feedback.collaboration,
        feedback_challenge: feedback.challenge,
        feedback_creativity: feedback.creativity,
        feedback_stamina: feedback.stamina,
        feedback_note: feedback.note,
        feedback_child_summary: feedback.childSummary,
        feedback_share_with_guardian: feedback.shareWithGuardian,
        feedback_updated_at: feedback.updatedAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    // Add to history
    const { data: reservation } = await supabase
      .from('provider_reservations')
      .select('experience')
      .eq('id', id)
      .single();

    if (reservation) {
      await supabase.from('reservation_history').insert({
        reservation_id: id,
        date: new Date().toISOString().slice(0, 10),
        experience: reservation.experience,
        memo: feedback.note || ''
      });
    }
  }
};
