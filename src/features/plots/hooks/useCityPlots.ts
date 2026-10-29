import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import type { Plot } from '@/src/features/map/types';
import { SAMPLE_PLOTS } from '@/src/features/map/samplePlots';
import { plotsForCity } from '../selection';
import { getPlotsByCity } from '../repository';

const useSampleFallback = __DEV__ && process.env.EXPO_PUBLIC_USE_SAMPLE_PLOTS === 'true';

export function useCityPlots(cityId: string) {
  const [plots, setPlots] = useState<Plot[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    if (useSampleFallback) { setPlots(plotsForCity(SAMPLE_PLOTS, cityId)); setLoading(false); return; }
    if (!isSupabaseConfigured) { setPlots([]); setError('Supabase is not configured and the development sample fallback is disabled.'); setLoading(false); return; }
    try { setPlots(await getPlotsByCity(cityId, { limit: 30 })); } catch (reason) { setPlots([]); setError(reason instanceof Error ? reason.message : 'Unable to load plots.'); } finally { setLoading(false); }
  }, [cityId]);
  useEffect(() => { const timer = setTimeout(() => { void load(); }, 0); return () => clearTimeout(timer); }, [load]);
  return { plots, loading, error, refresh: load, source: useSampleFallback ? 'sample' as const : 'supabase' as const };
}
