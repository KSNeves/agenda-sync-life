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
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          is_premium: boolean | null
          last_name: string | null
          profile_image: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_premium?: boolean | null
          last_name?: string | null
          profile_image?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_premium?: boolean | null
          last_name?: string | null
          profile_image?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_events: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          is_all_day: boolean | null
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          is_all_day?: boolean | null
          start_time: string
          title: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          is_all_day?: boolean | null
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_flashcard_decks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_flashcards: {
        Row: {
          back: string
          created_at: string | null
          deck_id: string
          due_date: string | null
          ease_factor: number | null
          front: string
          id: string
          interval_days: number | null
          repetitions: number | null
          user_id: string
        }
        Insert: {
          back: string
          created_at?: string | null
          deck_id: string
          due_date?: string | null
          ease_factor?: number | null
          front: string
          id?: string
          interval_days?: number | null
          repetitions?: number | null
          user_id: string
        }
        Update: {
          back?: string
          created_at?: string | null
          deck_id?: string
          due_date?: string | null
          ease_factor?: number | null
          front?: string
          id?: string
          interval_days?: number | null
          repetitions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "user_flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_revisions: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          interval_days: number | null
          next_revision_date: string
          non_study_days: string[] | null
          revision_count: number | null
          subject: string | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          interval_days?: number | null
          next_revision_date: string
          non_study_days?: string[] | null
          revision_count?: number | null
          subject?: string | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          interval_days?: number | null
          next_revision_date?: string
          non_study_days?: string[] | null
          revision_count?: number | null
          subject?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_start_breaks: boolean | null
          created_at: string | null
          focus_time: number | null
          id: string
          language: string | null
          long_break: number | null
          long_break_interval: number | null
          short_break: number | null
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          auto_start_breaks?: boolean | null
          created_at?: string | null
          focus_time?: number | null
          id: string
          language?: string | null
          long_break?: number | null
          long_break_interval?: number | null
          short_break?: number | null
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_start_breaks?: boolean | null
          created_at?: string | null
          focus_time?: number | null
          id?: string
          language?: string | null
          long_break?: number | null
          long_break_interval?: number | null
          short_break?: number | null
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
