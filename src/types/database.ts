export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type PlotStatus = 'draft' | 'active' | 'sold' | 'inactive';
export type PlotDiscountType = 'flat' | 'percentage';

export type Database = {
  public: {
    Tables: {
      cities: {
        Row: { id: string; name: string; state: string; slug: string; latitude: number; longitude: number; is_active: boolean; created_at: string };
        Insert: { id?: string; name: string; state?: string; slug: string; latitude: number; longitude: number; is_active?: boolean; created_at?: string };
        Update: Partial<Database['public']['Tables']['cities']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: { id: string; full_name: string | null; phone: string | null; avatar_url: string | null; created_at: string; updated_at: string };
        Insert: { id: string; full_name?: string | null; phone?: string | null; avatar_url?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      plots: {
        Row: { id: string; owner_id: string; property_type: string; city_id: string; locality: string | null; address: string; town: string; taluka: string | null; district: string | null; state: string; pincode: string | null; google_maps_url: string | null; latitude: number | null; longitude: number | null; area_sqft: number; width: number | null; length: number | null; primary_facing: string | null; rate_per_sqft: number; original_rate_per_sqft: number | null; base_amount: number; discount_type: PlotDiscountType | null; discount_value: number | null; discount_amount: number; final_amount: number; is_negotiable: boolean; na_type: string | null; layout_sanctioned: boolean | null; ownership_type: string | null; description: string | null; search_keywords: string[]; status: PlotStatus; is_featured: boolean; published_at: string | null; contact_name: string | null; contact_phone: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['plots']['Row'], 'id' | 'created_at' | 'updated_at' | 'is_featured'> & { id?: string; created_at?: string; updated_at?: string; is_featured?: boolean };
        Update: Partial<Database['public']['Tables']['plots']['Insert']>;
        Relationships: [];
      };
      plot_road_sides: {
        Row: { id: string; plot_id: string; direction: 'north' | 'south' | 'east' | 'west'; width_ft: number; sort_order: number; created_at: string };
        Insert: { id?: string; plot_id: string; direction: 'north' | 'south' | 'east' | 'west'; width_ft: number; sort_order?: number; created_at?: string };
        Update: Partial<Database['public']['Tables']['plot_road_sides']['Insert']>;
        Relationships: [];
      };
      plot_images: {
        Row: { id: string; plot_id: string; storage_path: string; sort_order: number; is_cover: boolean; created_at: string };
        Insert: { id?: string; plot_id: string; storage_path: string; sort_order?: number; is_cover?: boolean; created_at?: string };
        Update: Partial<Database['public']['Tables']['plot_images']['Insert']>;
        Relationships: [];
      };
      favorites: {
        Row: { id: string; user_id: string; plot_id: string; created_at: string };
        Insert: { id?: string; user_id: string; plot_id: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      plot_offers: {
        Row: { id: string; plot_id: string; title: string; description: string | null; discount_type: PlotDiscountType; discount_value: number; starts_at: string; ends_at: string; is_active: boolean; created_at: string };
        Insert: Omit<Database['public']['Tables']['plot_offers']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['plot_offers']['Insert']>;
        Relationships: [];
      };
      plot_inquiries: {
        Row: { id: string; plot_id: string; user_id: string; message: string; created_at: string };
        Insert: { id?: string; plot_id: string; user_id: string; message: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      public_plots: {
        Row: Omit<Database['public']['Tables']['plots']['Row'], 'owner_id' | 'contact_name' | 'contact_phone'>;
        Relationships: [];
      };
    };
    Functions: {
      update_plot_with_relations: {
        Args: { target_plot_id: string; plot_values: Json; road_values: Json; image_values: Json };
        Returns: Database['public']['Tables']['plots']['Row'];
      };
    };
    Enums: { plot_status: PlotStatus; plot_discount_type: PlotDiscountType };
    CompositeTypes: Record<string, never>;
  };
};
