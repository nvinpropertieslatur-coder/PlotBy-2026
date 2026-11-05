import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProperties } from '../../../../services/propertyService';
import { supabase } from '../../../../lib/supabase';
import { propertyToPlot } from '../propertyAdapter';
import { isAgriculture } from '../../agriculture/filters';

export function useCityPlots(cityId) {
  const [results, setResults] = useState({ plots: [], agriculture: [] }), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const generation = useRef(0), focused = useRef(false);
  const load = useCallback(async () => {
    const request = ++generation.current;
    setResults(current => ({ ...current, plots: [] })); setLoading(true); setError('');
    try {
      const rows = await getProperties();
      const agriculture = rows.filter(isAgriculture);
      const plots = rows.filter(row => !isAgriculture(row)).map(row => propertyToPlot(row))
        .filter(plot => !!plot && plot.cityId === cityId.toLowerCase());
      if (request === generation.current) setResults({ plots, agriculture });
    } catch (reason) {
      if (request === generation.current) { setResults({ plots: [], agriculture: [] }); setError(reason instanceof Error ? reason.message : 'Unable to load properties'); }
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
      generation.current++; setResults({ plots: [], agriculture: [] }); setError('');
      clearTimeout(timer);
      if (focused.current) timer = setTimeout(() => { void load(); }, 0);
    });
    return () => { clearTimeout(timer); subscription.unsubscribe(); };
  }, [load]);
  return { ...results, loading, error, refresh: load };
}
