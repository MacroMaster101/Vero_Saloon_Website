// Database types for the Vero Salon schema (supabase/migrations/0001_init.sql).
//
// Hand-authored to match the migration exactly so the app is fully type-checked
// without a Docker-based `supabase gen types`. Regenerate from the live schema
// when a Supabase access token or local Docker is available:
//   supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
// Keep this file in sync with supabase/migrations/*.sql.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type ServiceCategory = 'hair' | 'beauty';
export type UserRole = 'user' | 'staff' | 'admin';

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          category: ServiceCategory;
          price_lkr: number;
          duration_min: number;
          icon: string;
          image_url: string | null;
          bookable: boolean;
          sort_order: number;
          is_active: boolean;
          is_featured: boolean;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string;
          category: ServiceCategory;
          price_lkr: number;
          duration_min: number;
          icon?: string;
          image_url?: string | null;
          bookable?: boolean;
          sort_order?: number;
          is_active?: boolean;
          is_featured?: boolean;
        };
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
        Relationships: [];
      };
      stylists: {
        Row: {
          id: string;
          slug: string;
          name: string;
          role: string;
          tags: string[];
          avatar_url: string | null;
          rating: number | null;
          rating_count: number;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          role?: string;
          tags?: string[];
          avatar_url?: string | null;
          rating?: number | null;
          rating_count?: number;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['stylists']['Insert']>;
        Relationships: [];
      };
      stylist_reviews: {
        Row: {
          id: string;
          stylist_id: string;
          customer_name: string;
          rating: number;
          comment: string;
          likes_count: number;
          reports_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          stylist_id: string;
          customer_name: string;
          rating: number;
          comment?: string;
          likes_count?: number;
          reports_count?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['stylist_reviews']['Insert']>;
        Relationships: [];
      };
      business_hours: {
        Row: {
          day_of_week: number;
          open_minute: number;
          close_minute: number;
          is_closed: boolean;
        };
        Insert: {
          day_of_week: number;
          open_minute: number;
          close_minute: number;
          is_closed?: boolean;
        };
        Update: Partial<Database['public']['Tables']['business_hours']['Insert']>;
        Relationships: [];
      };
      blocked_slots: {
        Row: {
          id: string;
          stylist_id: string | null;
          starts_at: string;
          ends_at: string;
          reason: string;
        };
        Insert: {
          id?: string;
          stylist_id?: string | null;
          starts_at: string;
          ends_at: string;
          reason?: string;
        };
        Update: Partial<Database['public']['Tables']['blocked_slots']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'blocked_slots_stylist_id_fkey';
            columns: ['stylist_id'];
            referencedRelation: 'stylists';
            referencedColumns: ['id'];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          reference: string;
          service_id: string;
          service_ids: string[] | null;
          stylist_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          notes: string;
          starts_at: string;
          ends_at: string;
          status: BookingStatus;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          reference: string;
          service_id: string;
          service_ids?: string[] | null;
          stylist_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          notes?: string;
          starts_at: string;
          ends_at: string;
          status?: BookingStatus;
          created_at?: string;
          user_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'bookings_service_id_fkey';
            columns: ['service_id'];
            referencedRelation: 'services';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_stylist_id_fkey';
            columns: ['stylist_id'];
            referencedRelation: 'stylists';
            referencedColumns: ['id'];
          },
        ];
      };
      gallery: {
        Row: {
          id: string;
          title: string;
          tag: string;
          category: string;
          image_url: string;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          tag?: string;
          category?: string;
          image_url: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['gallery']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: 'user' | 'staff' | 'admin';
          stylist_id: string | null;
          full_name: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: 'user' | 'staff' | 'admin';
          stylist_id?: string | null;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profiles_stylist_id_fkey';
            columns: ['stylist_id'];
            referencedRelation: 'stylists';
            referencedColumns: ['id'];
          },
        ];
      };
      site_content: {
        Row: { key: string; value: Record<string, unknown>; updated_at: string };
        Insert: { key: string; value?: Record<string, unknown>; updated_at?: string };
        Update: Partial<Database['public']['Tables']['site_content']['Insert']>;
        Relationships: [];
      };
      holidays: {
        Row: {
          date: string;
          name: string;
          source: 'google' | 'manual';
          is_closed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          date: string;
          name: string;
          source?: 'google' | 'manual';
          is_closed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['holidays']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      anonymize_user_bookings: { Args: { target: string }; Returns: undefined };
      purge_old_bookings: { Args: { older_than_months?: number }; Returns: number };
      toggle_review_like: { Args: { p_review_id: string; p_delta: number }; Returns: undefined };
      report_review: { Args: { p_review_id: string }; Returns: undefined };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

// Convenience row aliases used throughout the app.
export type Service = Database['public']['Tables']['services']['Row'];
export type SiteContentRow = Database['public']['Tables']['site_content']['Row'];
export type Stylist = Database['public']['Tables']['stylists']['Row'];
export type BusinessHour = Database['public']['Tables']['business_hours']['Row'];
export type BlockedSlot = Database['public']['Tables']['blocked_slots']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type GalleryItem = Database['public']['Tables']['gallery']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Holiday = Database['public']['Tables']['holidays']['Row'];
