// Generado automáticamente desde el esquema real de Supabase con:
//   npx supabase gen types typescript --project-id qhdvewichgadzcujhnhq > src/lib/database.types.ts
// No editar a mano — si cambiás el esquema (nueva migración), regenerar este archivo.

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      benefits: {
        Row: {
          created_at: string
          id: string
          neighborhood: string
          place_name: string
          points_cost: number
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          neighborhood: string
          place_name: string
          points_cost: number
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          neighborhood?: string
          place_name?: string
          points_cost?: number
          title?: string
        }
        Relationships: []
      }
      checkins: {
        Row: {
          created_at: string
          id: string
          photo_url: string
          place_id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_url: string
          place_id: string
          rating?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_url?: string
          place_id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "place_stats"
            referencedColumns: ["place_id"]
          },
          {
            foreignKeyName: "checkins_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          place_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          place_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          place_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "place_stats"
            referencedColumns: ["place_id"]
          },
          {
            foreignKeyName: "favorites_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          address: string
          category: string
          created_at: string
          id: string
          latitude: number
          longitude: number
          name: string
          neighborhood: string
          tags: string[]
        }
        Insert: {
          address: string
          category: string
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          name: string
          neighborhood: string
          tags?: string[]
        }
        Update: {
          address?: string
          category?: string
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          neighborhood?: string
          tags?: string[]
        }
        Relationships: []
      }
      points_events: {
        Row: {
          created_at: string
          id: string
          place_id: string | null
          points: number
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          place_id?: string | null
          points: number
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          place_id?: string | null
          points?: number
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "place_stats"
            referencedColumns: ["place_id"]
          },
          {
            foreignKeyName: "points_events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          checkin_id: string | null
          comments_count: number
          created_at: string
          id: string
          image_url: string | null
          likes_count: number
          place_id: string | null
          text: string
          user_id: string
        }
        Insert: {
          checkin_id?: string | null
          comments_count?: number
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          place_id?: string | null
          text?: string
          user_id: string
        }
        Update: {
          checkin_id?: string | null
          comments_count?: number
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          place_id?: string | null
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "checkins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "place_stats"
            referencedColumns: ["place_id"]
          },
          {
            foreignKeyName: "posts_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          neighborhood: string
          owner_name: string
          pet_age: number | null
          pet_breed: string
          pet_name: string
          points: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          neighborhood?: string
          owner_name?: string
          pet_age?: number | null
          pet_breed?: string
          pet_name?: string
          points?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          neighborhood?: string
          owner_name?: string
          pet_age?: number | null
          pet_breed?: string
          pet_name?: string
          points?: number
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          place_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          place_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          place_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "place_stats"
            referencedColumns: ["place_id"]
          },
          {
            foreignKeyName: "qr_codes_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_redemptions: {
        Row: {
          created_at: string
          id: string
          qr_code_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          qr_code_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          qr_code_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_redemptions_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      redemptions: {
        Row: {
          benefit_id: string
          created_at: string
          id: string
          points_spent: number
          user_id: string
        }
        Insert: {
          benefit_id: string
          created_at?: string
          id?: string
          points_spent: number
          user_id: string
        }
        Update: {
          benefit_id?: string
          created_at?: string
          id?: string
          points_spent?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      place_stats: {
        Row: {
          avg_rating: number | null
          checkin_count: number | null
          place_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      redeem_benefit: {
        Args: { benefit_id_input: string }
        Returns: {
          benefit_id: string
          created_at: string
          id: string
          points_spent: number
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "redemptions"
          isOneToOne: true
          isSetofReturn: false
        }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
