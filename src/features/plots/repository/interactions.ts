import { requireSupabase } from '@/src/lib/supabase';
import type { Plot } from '@/src/features/map/types';
import { getPlotById } from './plots';

async function authenticatedUserId(): Promise<string> {
  const { data, error } = await requireSupabase().auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('A verified Plotby account is required.');
  return data.user.id;
}

export async function saveFavorite(plotId: string): Promise<void> {
  const client = requireSupabase(); const userId = await authenticatedUserId();
  const { error } = await client.from('favorites').upsert({ user_id: userId, plot_id: plotId }, { onConflict: 'user_id,plot_id', ignoreDuplicates: true });
  if (error) throw error;
}

export async function removeFavorite(plotId: string): Promise<void> {
  const client = requireSupabase(); const userId = await authenticatedUserId();
  const { error } = await client.from('favorites').delete().eq('user_id', userId).eq('plot_id', plotId);
  if (error) throw error;
}

export async function submitInquiry(plotId: string, message: string): Promise<void> {
  const client = requireSupabase(); const userId = await authenticatedUserId();
  const cleanMessage = message.trim();
  if (!cleanMessage || cleanMessage.length > 2000) throw new Error('Enter an inquiry between 1 and 2,000 characters.');
  const { error } = await client.from('plot_inquiries').insert({ plot_id: plotId, user_id: userId, message: cleanMessage });
  if (error) throw error;
}

export async function getFavoritePlots(): Promise<Plot[]> {
  const client = requireSupabase(); const userId = await authenticatedUserId();
  const { data, error } = await client.from('favorites').select('plot_id').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  const plots = await Promise.all(data.map((favorite) => getPlotById(favorite.plot_id)));
  return plots.filter((plot): plot is Plot => Boolean(plot));
}
