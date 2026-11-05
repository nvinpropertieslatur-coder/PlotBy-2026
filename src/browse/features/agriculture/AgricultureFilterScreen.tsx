import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Droplets, LocateFixed, MapPin, Mountain, Percent, Ruler, Signpost, Wallet } from 'lucide-react-native';
import * as Location from 'expo-location';
import { AgricultureOptionGroup } from './AgricultureOptions';
import { agricultureOptionKeys, agricultureOptionLabels } from './options';
import { noAgricultureMatches, noAgricultureTitle } from './AgricultureEmptyState';
import { AppText } from '../../components/ui';
import type { PropertyRecord } from '../plots/propertyAdapter';
import { background, border, Choice, FilterInput, green, RangeFields } from './FilterControls';
import {
  coordinateCenter, discountOptions, emptyAgricultureFilters, matchesAgriculture, numberField,
  perAcreRate, radii, selectedAgricultureFilters, validRange, type AgricultureFilters,
} from './filters';

const categories = [
  { label: 'Location', icon: MapPin }, { label: 'Road Access', icon: Signpost },
  { label: 'Land Size', icon: Ruler }, { label: 'Price', icon: Wallet },
  { label: 'Discount', icon: Percent }, { label: 'Land Type', icon: Mountain },
  { label: 'Water Source', icon: Droplets },
] as const;
type Category = typeof categories[number]['label'];

type Props = {
  applied: AgricultureFilters;
  records: readonly PropertyRecord[];
  loading: boolean;
  error: string;
  onApply: (filters: AgricultureFilters) => void;
  onClose: () => void;
};

export function AgricultureFilterScreen({ applied, records, loading, error, onApply, onClose }: Props) {
  const [filters, setFilters] = useState(applied);
  const [category, setCategory] = useState<Category>('Location');
  const [citySearch, setCitySearch] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const locationRequest = useRef(0);
  const update = (patch: Partial<AgricultureFilters>) => setFilters(current => ({ ...current, ...patch }));
  const selected = selectedAgricultureFilters(filters);
  const hasCoordinates = !!(filters.latitude.trim() || filters.longitude.trim());
  const coordinatesValid = !hasCoordinates || !!coordinateCenter(filters);
  const valid = coordinatesValid && [filters.area, filters.guntha, filters.perAcre, filters.total].every(validRange);
  const count = useMemo(() => records.filter(record => matchesAgriculture(record, filters)).length, [records, filters]);
  const { cities, totalLimit, acreLimit } = useMemo(() => {
    const cities = new Map<string, string>();
    let totalLimit = 0, acreLimit = 0;
    for (const record of records) {
      if (typeof record.city === 'string' && record.city.trim()) cities.set(record.city.trim().toLowerCase(), record.city.trim());
      totalLimit = Math.max(totalLimit, numberField(record.total_amount) ?? 0);
      acreLimit = Math.max(acreLimit, perAcreRate(record) ?? 0);
    }
    return { cities: [...cities.values()].sort(), totalLimit: Math.ceil(totalLimit), acreLimit: Math.ceil(acreLimit) };
  }, [records]);
  const visibleCities = cities.filter(city => city.toLowerCase().includes(citySearch.trim().toLowerCase()));

  async function requestCurrentLocation() {
    const request = ++locationRequest.current;
    setLocating(true);
    setLocationError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (request !== locationRequest.current) return;
      if (!permission.granted) {
        setLocationError('Allow location access to search nearby land.');
        return;
      }
      const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (request === locationRequest.current) setFilters(current => ({
        ...current, latitude: '', longitude: '', nearby: { latitude, longitude, radiusKm: current.radiusKm },
      }));
    } catch {
      if (request === locationRequest.current) setLocationError('Current location is unavailable. Try again or search by city.');
    } finally {
      if (request === locationRequest.current) setLocating(false);
    }
  }

  function clearAll() {
    locationRequest.current++;
    setLocating(false);
    setLocationError('');
    setCitySearch('');
    setFilters(emptyAgricultureFilters);
  }

  return <SafeAreaView style={styles.screen}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onClose} style={styles.back}>
          <ArrowLeft size={22} color={green} />
        </Pressable>
        <View style={styles.flex}>
          <AppText variant="title">Agriculture filters</AppText>
          <AppText variant="caption" muted>Sheti · {selected.length} active</AppText>
        </View>
      </View>
      {!!selected.length && <View style={styles.summary}><ScrollView horizontal keyboardShouldPersistTaps="handled" contentContainerStyle={styles.summaryChips}>
        {selected.map(({ label, patch }) => <Choice key={Object.keys(patch)[0] + label} label={`${label} ×`} selected onPress={() => update(patch)} />)}
      </ScrollView></View>}
      <View style={styles.body}>
        <ScrollView style={styles.sidebar} contentContainerStyle={styles.categories}>
          {categories.map(({ label, icon: Icon }) => <Pressable key={label} onPress={() => setCategory(label)}
            accessibilityRole="tab" accessibilityState={{ selected: category === label }}
            style={[styles.category, category === label && styles.active]}>
            <Icon size={17} color={category === label ? green : '#A5AEA7'} />
            <AppText variant="caption" style={category === label ? styles.green : undefined}>{label}</AppText>
          </Pressable>)}
        </ScrollView>
        <ScrollView key={category} style={styles.flex} contentContainerStyle={styles.panel} keyboardShouldPersistTaps="handled">
          <AppText variant="title">{category}</AppText>
          {category === 'Location' && <>
            <FilterInput label="Address, city or PIN" value={filters.query} onChange={query => update({ query })} />
            <FilterInput label="State" value={filters.state} onChange={state => update({ state })} />
            <FilterInput label="Town" value={filters.town} onChange={town => update({ town })} />
            <FilterInput label="City" value={filters.city} onChange={city => update({ city })} />
            {!!cities.length && <FilterInput label="Find a listed city" value={citySearch} onChange={setCitySearch} />}
            <View style={styles.chips}>
              {visibleCities.slice(0, 30).map(city => <Choice key={city} label={city} selected={city === filters.city}
                onPress={() => update({ city: city === filters.city ? '' : city })} />)}
            </View>
            {!!cities.length && !visibleCities.length && <AppText muted>No matching cities.</AppText>}
            {visibleCities.length > 30 && <AppText muted>Search to narrow the city list.</AppText>}
            <AppText variant="caption" muted>Enter coordinates to search within a radius.</AppText>
            <FilterInput label="Latitude" value={filters.latitude}
              onChange={latitude => update({ latitude, nearby: null })} />
            <FilterInput label="Longitude" value={filters.longitude}
              onChange={longitude => update({ longitude, nearby: null })} />
            <Pressable accessibilityRole="button" accessibilityState={{ busy: locating }}
              disabled={locating} onPress={() => void requestCurrentLocation()} style={styles.locate}>
              {locating ? <ActivityIndicator color={green} /> : <LocateFixed size={17} color={green} />}
              <AppText style={styles.green}>{locating ? 'Finding location…' : 'Use Current Location'}</AppText>
            </Pressable>
            {!!locationError && <AppText muted>{locationError}</AppText>}
            {(filters.nearby || hasCoordinates) && <View style={styles.chips}>{radii.map(radiusKm => <Choice key={radiusKm} label={`${radiusKm} km`}
              selected={filters.radiusKm === radiusKm} onPress={() => {
                update({ radiusKm, nearby: filters.nearby ? { ...filters.nearby, radiusKm } : null });
              }} />)}</View>}
          </>}
          {category === 'Land Size' && <>
            <RangeFields label="Acreage" value={filters.area} onChange={area => update({ area })} />
            <RangeFields label="Guntha" value={filters.guntha} onChange={guntha => update({ guntha })} />
          </>}
          {category === 'Price' && <>
            <RangeFields label="Rate per acre" price value={filters.perAcre} limit={acreLimit} onChange={perAcre => update({ perAcre })} />
            <RangeFields label="Total price" price value={filters.total} limit={totalLimit} onChange={total => update({ total })} />
          </>}
          {category === 'Discount' && <>
            <Choice label="Discount available" selected={filters.discountAvailable} onPress={() => update({ discountAvailable: !filters.discountAvailable })} />
            <AppText variant="caption" muted>Discount percentage</AppText>
            {discountOptions.map(option =>
              <Choice key={option.id} label={option.label} selected={filters.discount.includes(option.id)} onPress={() =>
                update({ discount: filters.discount.includes(option.id) ? filters.discount.filter(id => id !== option.id) : [...filters.discount, option.id] })} />)}
          </>}
          {agricultureOptionKeys.filter(field => agricultureOptionLabels[field] === category).map(field =>
            <AgricultureOptionGroup key={field} field={field} selected={filters.options[field]}
              onChange={values => update({ options: { ...filters.options, [field]: values } })} />)}
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <View accessibilityLiveRegion="polite" style={styles.status}>
          {loading && <ActivityIndicator size="small" color={green} />}
          <AppText variant="caption" muted>{!coordinatesValid ? 'Enter a valid latitude and longitude.' : !valid ? 'Enter a valid range with minimum ≤ maximum.' : loading ? 'Loading listings…' :
            error ? 'Could not load listings.' : !records.length ? noAgricultureTitle : count === 0 ? noAgricultureMatches :
            `${count} matching ${count === 1 ? 'property' : 'properties'}`}</AppText>
        </View>
        <View style={styles.actions}>
          <Choice label="Clear All" onPress={clearAll} />
          <Pressable accessibilityRole="button" disabled={!valid} onPress={() => onApply(filters)}
            style={[styles.apply, !valid && styles.disabled]}><AppText style={styles.applyText}>Apply Filters</AppText></Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: background },
  flex: { flex: 1, minWidth: 0 },
  header: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomColor: border, borderBottomWidth: 1 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderColor: border, borderWidth: 1, borderRadius: 22 },
  summary: { paddingHorizontal: 12, paddingVertical: 8 },
  summaryChips: { flexDirection: 'row', gap: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  body: { flex: 1, flexDirection: 'row' },
  sidebar: { flexGrow: 0, width: '29%', minWidth: 88, maxWidth: 180, backgroundColor: '#FFFFFF08', borderRightWidth: 1, borderRightColor: border },
  categories: { paddingVertical: 6 },
  category: { minHeight: 62, borderLeftWidth: 3, borderLeftColor: 'transparent', paddingHorizontal: 8, paddingVertical: 8, gap: 4, justifyContent: 'center' },
  active: { borderLeftColor: green, backgroundColor: '#7CFF3D18' },
  green: { color: '#A8FF60' },
  panel: { gap: 12, padding: 12, paddingBottom: 28, width: '100%', maxWidth: 580 },
  locate: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 },
  footer: { gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: border, backgroundColor: '#FFFFFF08' },
  status: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  actions: { flexDirection: 'row', gap: 10 },
  apply: { flex: 1, minHeight: 46, justifyContent: 'center', alignItems: 'center', backgroundColor: green, borderRadius: 14 },
  applyText: { color: background, fontWeight: '800' },
  disabled: { opacity: 0.4 },
});
