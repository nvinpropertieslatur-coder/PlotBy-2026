import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/src/types/database';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const key = (process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)?.trim();

export const isSupabaseConfigured = Boolean(url && key);
export const supabase: SupabaseClient<Database> | null = url && key
  ? createClient<Database>(url, key, {
      auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    })
  : null;

export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) throw new Error('Supabase is not configured. Add the public project URL and publishable key.');
  return supabase;
}

