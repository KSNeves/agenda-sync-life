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
      calendar_events: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          end_time: number
          id: string
          is_recurring: boolean | null
          recurrence_end: number | null
          recurrence_interval: number | null
          recurrence_type: string | null
          start_time: number
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          end_time: number
          id: string
          is_recurring?: boolean | null
          recurrence_end?: number | null
          recurrence_interval?: number | null
          recurrence_type?: string | null
          start_time: number
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: number
          id?: string
          is_recurring?: boolean | null
          recurrence_end?: number | null
          recurrence_interval?: number | null
          recurrence_type?: string | null
          start_time?: number
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcard_decks: {
        Row: {
          card_count: number | null
          created_at: number
          description: string | null
          id: string
          learned_cards: number | null
          name: string
          new_cards: number | null
          review_cards: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_count?: number | null
          created_at: number
          description?: string | null
          id: string
          learned_cards?: number | null
          name: string
          new_cards?: number | null
          review_cards?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_count?: number | null
          created_at?: number
          description?: string | null
          id?: string
          learned_cards?: number | null
          name?: string
          new_cards?: number | null
          review_cards?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          back: string
          created_at: number
          deck_id: string
          ease_factor: number | null
          front: string
          id: string
          interval_days: number | null
          lapses: number | null
          last_reviewed: number | null
          learning_step: number | null
          next_review: number
          review_count: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          back: string
          created_at: number
          deck_id: string
          ease_factor?: number | null
          front: string
          id: string
          interval_days?: number | null
          lapses?: number | null
          last_reviewed?: number | null
          learning_step?: number | null
          next_review: number
          review_count?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          back?: string
          created_at?: number
          deck_id?: string
          ease_factor?: number | null
          front?: string
          id?: string
          interval_days?: number | null
          lapses?: number | null
          last_reviewed?: number | null
          learning_step?: number | null
          next_review?: number
          review_count?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      revision_items: {
        Row: {
          category: string
          completed_at: number | null
          created_at: number
          description: string | null
          id: string
          interval_days: number | null
          next_revision_date: number
          non_study_days: number[] | null
          revision_count: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          completed_at?: number | null
          created_at: number
          description?: string | null
          id: string
          interval_days?: number | null
          next_revision_date: number
          non_study_days?: number[] | null
          revision_count?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed_at?: number | null
          created_at?: number
          description?: string | null
          id?: string
          interval_days?: number | null
          next_revision_date?: number
          non_study_days?: number[] | null
          revision_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          plan_type: Database["public"]["Enums"]["plan_type"]
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          plan_type?: Database["public"]["Enums"]["plan_type"]
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          plan_type?: Database["public"]["Enums"]["plan_type"]
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string
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
      plan_type: "free_trial" | "free" | "premium"
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
    Enums: {
      plan_type: ["free_trial", "free", "premium"],
    },
  },
} as const
