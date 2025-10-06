export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string | null
          experience_id: string | null
          id: string
          participants: number | null
          slot_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          experience_id?: string | null
          id?: string
          participants?: number | null
          slot_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          experience_id?: string | null
          id?: string
          participants?: number | null
          slot_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      children_profiles: {
        Row: {
          allergies: string | null
          birthdate: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          allergies?: string | null
          birthdate?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          allergies?: string | null
          birthdate?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      experiences: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          genre: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          location: string | null
          max_age: number | null
          method: string | null
          min_age: number | null
          price: number | null
          provider_id: string | null
          school_icon: string | null
          school_name: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          genre?: string | null
          id: string
          image_url?: string | null
          is_published?: boolean | null
          location?: string | null
          max_age?: number | null
          method?: string | null
          min_age?: number | null
          price?: number | null
          provider_id?: string | null
          school_icon?: string | null
          school_name?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          location?: string | null
          max_age?: number | null
          method?: string | null
          min_age?: number | null
          price?: number | null
          provider_id?: string | null
          school_icon?: string | null
          school_name?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      feedbacks: {
        Row: {
          booking_id: string | null
          child_id: string | null
          comment: string | null
          created_at: string | null
          experience_id: string | null
          id: string
          provider_id: string | null
          scores: Json | null
          strengths: string[] | null
          tips: string[] | null
        }
        Insert: {
          booking_id?: string | null
          child_id?: string | null
          comment?: string | null
          created_at?: string | null
          experience_id?: string | null
          id?: string
          provider_id?: string | null
          scores?: Json | null
          strengths?: string[] | null
          tips?: string[] | null
        }
        Update: {
          booking_id?: string | null
          child_id?: string | null
          comment?: string | null
          created_at?: string | null
          experience_id?: string | null
          id?: string
          provider_id?: string | null
          scores?: Json | null
          strengths?: string[] | null
          tips?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      slots: {
        Row: {
          capacity: number | null
          created_at: string | null
          date: string
          end_time: string | null
          experience_id: string | null
          id: string
          remaining: number | null
          start_time: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          date: string
          end_time?: string | null
          experience_id?: string | null
          id: string
          remaining?: number | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          date?: string
          end_time?: string | null
          experience_id?: string | null
          id?: string
          remaining?: number | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slots_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_feedback: {
        Args: {
          p_booking: string
          p_child: string
          p_comment?: string
          p_experience: string
          p_provider: string
          p_scores: Json
          p_strengths?: string[]
          p_tips?: string[]
        }
        Returns: string
      }
      delete_slot: {
        Args: { p_slot: string }
        Returns: boolean
      }
      provider_bookings: {
        Args: { p_from?: string; p_provider: string }
        Returns: {
          booking_created_at: string
          booking_id: string
          booking_status: string
          experience_id: string
          experience_title: string
          participants: number
          slot_date: string
          slot_end_time: string
          slot_id: string
          slot_start_time: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      reserve_seat: {
        Args: { p_count: number; p_slot: string }
        Returns: boolean
      }
      upsert_slot: {
        Args: {
          p_date: string
          p_experience: string
          p_remaining: number
          p_status?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
