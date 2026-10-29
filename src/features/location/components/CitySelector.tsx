import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ChevronDown, MapPin } from 'lucide-react-native';
import { AppBottomSheet, AppButton, AppInput, AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/theme';
import { DEFAULT_CITY, MAHARASHTRA_CITIES, searchMaharashtraCities } from '../cities';
import { findCityFromCurrentLocation } from '../location';
import { loadSelectedCity, saveSelectedCity } from '../storage';
import type { MaharashtraCity } from '../types';

export function CitySelector({ value, onChange }: { value?: MaharashtraCity; onChange: (city: MaharashtraCity) => void }) {
  const [selected, setSelected] = useState(value ?? DEFAULT_CITY);
  const [open, setOpen] = useState(false); const [query, setQuery] = useState(''); const [loading, setLoading] = useState(false); const [message, setMessage] = useState<string | undefined>();
  useEffect(() => { let active = true; loadSelectedCity().then((city) => { if (active && city) { setSelected(city); onChange(city); } }); return () => { active = false; }; }, [onChange]);
  const cities = useMemo(() => searchMaharashtraCities(query, MAHARASHTRA_CITIES), [query]);
  const choose = async (city: MaharashtraCity) => { setSelected(city); onChange(city); await saveSelectedCity(city); setQuery(''); setMessage(undefined); setOpen(false); };
  const useLocation = async () => { setLoading(true); setMessage(undefined); try { const result = await findCityFromCurrentLocation(); if (result.city) await choose(result.city); else setMessage(result.reason === 'permission-denied' ? 'Location permission was denied. You can choose a city manually.' : 'We could not match your location to a supported Maharashtra city. Choose manually.'); } catch { setMessage('Location is unavailable right now. You can choose a city manually.'); } finally { setLoading(false); } };
  return <><Pressable accessibilityRole="button" accessibilityLabel={`Selected city ${selected.name}. Open city selector`} onPress={() => setOpen(true)} style={styles.trigger}><MapPin size={23} color={colors.primary} /><AppText variant="title" numberOfLines={1}>{selected.name}</AppText><ChevronDown size={18} color={colors.text} /></Pressable><AppBottomSheet visible={open} onClose={() => setOpen(false)} title="Choose a city"><AppInput label="Search Maharashtra cities" accessibilityLabel="Search Maharashtra cities" placeholder="Search by city name" value={query} onChangeText={setQuery} autoCapitalize="words" /><AppButton title={loading ? 'Finding your city…' : 'Use Current Location'} variant="outline" loading={loading} leftIcon={<MapPin size={18} />} onPress={useLocation} fullWidth />{message && <AppText accessibilityLiveRegion="polite" style={styles.message}>{message}</AppText>}<FlatList data={cities} keyExtractor={(item) => item.id} keyboardShouldPersistTaps="handled" ListEmptyComponent={<AppText muted>No Maharashtra city matches that search.</AppText>} renderItem={({ item }) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: item.id === selected.id }} accessibilityLabel={`${item.name}, ${item.district}, Maharashtra`} onPress={() => choose(item)} style={styles.city}><View><AppText>{item.name}</AppText><AppText variant="caption" muted>{item.district}, Maharashtra</AppText></View>{item.id === selected.id && <AppText style={styles.check}>✓</AppText>}</Pressable>} /></AppBottomSheet></>;
}
const styles = StyleSheet.create({ trigger: { minHeight: 54, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }, city: { minHeight: 60, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, check: { color: colors.primary, fontSize: 22 }, message: { color: colors.yellow, paddingVertical: spacing.sm } });
