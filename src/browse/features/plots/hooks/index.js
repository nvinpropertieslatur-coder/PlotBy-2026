import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProperties } from '../../../../services/propertyService';
import { supabase } from '../../../../lib/supabase';
import { propertyToPlot } from '../propertyAdapter';

export function useCityPlots(cityId) {
  const [plots, setPlots] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const generation = useRef(0), focused = useRef(false);
  const load = useCallback(async () => {
    const request = ++generation.current;
    setPlots([]); setLoading(true); setError('');
    try {
      const rows = await getProperties();
      const next = rows.map(propertyToPlot).filter(plot => !!plot && plot.cityId === cityId.toLowerCase());
      if (request === generation.current) setPlots(next);
    } catch (reason) {
      if (request === generation.current) { setPlots([]); setError(reason instanceof Error ? reason.message : 'Unable to load properties'); }
    } finally { if (request === generation.current) setLoading(false); }
  }, [cityId]);
  useFocusEffect(useCallback(() => {
    focused.current = true; void load();
    const listener = AppState.addEventListener('change', state => { if (state === 'active') void load(); });
    return () => { focused.current = false; generation.current++; listener.remove(); };
  }, [load]));
  useEffect(() => {
    let timer;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
      generation.current++; setPlots([]); setError('');
      clearTimeout(timer);
      if (focused.current) timer = setTimeout(() => { void load(); }, 0);
    });
    return () => { clearTimeout(timer); subscription.unsubscribe(); };
  }, [load]);
  return { plots, loading, error, refresh: load };
}
