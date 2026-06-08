export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      cached_events: {
        Row: {
          date_time: string | null
          id: string
          image_url: string | null
          link: string | null
          location: string | null
          scraped_at: string
          title: string
        }
        Insert: {
          date_time?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          location?: string | null
          scraped_at?: string
          title: string
        }
        Update: {
          date_time?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          location?: string | null
          scraped_at?: string
          title?: string
        }
        Relationships: []
      }
      place_reviews: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          place_slug: string
          price_range: string | null
          updated_at: string
          user_id: string
          would_recommend: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          place_slug: string
          price_range?: string | null
          updated_at?: string
          user_id: string
          would_recommend?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          place_slug?: string
          price_range?: string | null
          updated_at?: string
          user_id?: string
          would_recommend?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          care_type: string | null
          child_age: string | null
          companions: string[] | null
          created_at: string
          display_name: string | null
          id: string
          interests: string[] | null
          needs: string[] | null
          referral_code: string | null
          relationship: string | null
          staying_at: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          care_type?: string | null
          child_age?: string | null
          companions?: string[] | null
          created_at?: string
          display_name?: string | null
          id?: string
          interests?: string[] | null
          needs?: string[] | null
          referral_code?: string | null
          relationship?: string | null
          staying_at?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          care_type?: string | null
          child_age?: string | null
          companions?: string[] | null
          created_at?: string
          display_name?: string | null
          id?: string
          interests?: string[] | null
          needs?: string[] | null
          referral_code?: string | null
          relationship?: string | null
          staying_at?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          max_uses: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          used_count?: number
        }
        Relationships: []
      }
      saved_places: {
        Row: {
          created_at: string
          id: string
          place_slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          place_slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          place_slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          status: string
          title: string
          updated_at: string
          urgency: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
          urgency?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
          urgency?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_place_reviews: {
        Row: {
          created_at: string | null
          id: string | null
          notes: string | null
          place_slug: string | null
          price_range: string | null
          updated_at: string | null
          would_recommend: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          notes?: string | null
          place_slug?: string | null
          price_range?: string | null
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          notes?: string | null
          place_slug?: string | null
          price_range?: string | null
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
