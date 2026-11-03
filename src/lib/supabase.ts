import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// The primary schema uses properties. Extra columns remain unknown until the live schema is available.
type Database = {
 public: {
  Tables: {
   properties: {
    Row: Record<string, unknown> & { id: string | number };
    Insert: Record<string, unknown>;
    Update: Record<string, unknown>;
    Relationships: [];
   };
  };
  Views: Record<never, never>;
  Functions: Record<never, never>;
  Enums: Record<never, never>;
  CompositeTypes: Record<never, never>;
 };
};
if (!supabaseUrl || !supabasePublishableKey) {
 throw new Error('Configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (or the existing publishable key) in .env.');
}
export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);