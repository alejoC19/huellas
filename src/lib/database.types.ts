// Tipos manuales que reflejan supabase/migrations/0001_init.sql.
// Si más adelante instalás la Supabase CLI localmente, podés regenerar
// este archivo automáticamente con:
//   npx supabase gen types typescript --project-id <tu-project-id> > src/lib/database.types.ts

export type PlaceCategory = 'plaza' | 'cafe' | 'veterinaria';
export type PointsReason = 'checkin' | 'review' | 'qr' | 'redeem';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          owner_name: string;
          pet_name: string;
          pet_breed: string;
          pet_age: number | null;
          neighborhood: string;
          avatar_url: string | null;
          points: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      places: {
        Row: {
          id: string;
          name: string;
          category: PlaceCategory;
          neighborhood: string;
          address: string;
          latitude: number;
          longitude: number;
          tags: string[];
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['places']['Row']>;
        Update: Partial<Database['public']['Tables']['places']['Row']>;
      };
      checkins: {
        Row: {
          id: string;
          user_id: string;
          place_id: string;
          photo_url: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          place_id: string;
          photo_url: string;
        };
        Update: Partial<Database['public']['Tables']['checkins']['Row']>;
      };
      points_events: {
        Row: {
          id: string;
          user_id: string;
          place_id: string | null;
          reason: PointsReason;
          points: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
      qr_codes: {
        Row: {
          id: string;
          code: string;
          place_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['qr_codes']['Row']>;
        Update: Partial<Database['public']['Tables']['qr_codes']['Row']>;
      };
      qr_redemptions: {
        Row: {
          id: string;
          user_id: string;
          qr_code_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          qr_code_id: string;
        };
        Update: never;
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          place_id: string | null;
          checkin_id: string | null;
          image_url: string | null;
          text: string;
          likes_count: number;
          comments_count: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          place_id?: string | null;
          checkin_id?: string | null;
          image_url?: string | null;
          text?: string;
        };
        Update: Partial<Database['public']['Tables']['posts']['Row']>;
      };
      post_likes: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
        };
        Update: never;
      };
      benefits: {
        Row: {
          id: string;
          title: string;
          place_name: string;
          neighborhood: string;
          points_cost: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['benefits']['Row']>;
        Update: Partial<Database['public']['Tables']['benefits']['Row']>;
      };
      redemptions: {
        Row: {
          id: string;
          user_id: string;
          benefit_id: string;
          points_spent: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
    };
    Functions: {
      redeem_benefit: {
        Args: { benefit_id_input: string };
        Returns: Database['public']['Tables']['redemptions']['Row'];
      };
    };
  };
};
