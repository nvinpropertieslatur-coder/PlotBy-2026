import { useCallback, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Layers, List, Map, RefreshCw, SlidersHorizontal } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CitySelector } from '@/src/browse/features/location/components/CitySelector';
import type { MaharashtraCity } from '@/src/browse/features/location/types';
import { PropertyMap } from '@/src/browse/features/map/components';
import { isValidPlot, type Plot } from '@/src/browse/features/map/types';
import { mapStyles, type MapStyleId } from '@/src/browse/features/map/tileProvider';
import { AppBottomSheet, AppText } from '@/src/browse/components/ui';
import { NetworkErrorModal } from '@/src/components/modals';
import { isNetworkError } from '@/src/utils/networkUtils';
import { PlotCarousel } from '@/src/browse/features/plots/components/PlotCarousel';
import { PropertyList } from '@/src/browse/features/plots/components/PropertyList';
import { useCityPlots } from '@/src/browse/features/plots/hooks';
import { resetSelectionForPlots } from '@/src/browse/features/plots/selection';
import { colors, spacing } from '@/src/browse/theme';
import PropertyPagination from '@/src/components/PropertyPagination';
import { AgricultureEmptyState } from './features/agriculture/AgricultureEmptyState';
import { AgricultureFilterScreen } from './features/agriculture/AgricultureFilterScreen';
import { emptyAgricultureFilters, matchesAgriculture, selectedAgricultureFilters } from './features/agriculture/filters';
import { propertyToPlot, type PropertyRecord } from './features/plots/propertyAdapter';

type PropertyViewMode = 'map' | 'list';
type PropertyFilters = { sort: string; minPrice: string; maxPrice: string; minArea: string; maxArea: string; city: string; locality: string; facing: string[]; verification: 'all' | 'verified' | 'unverified'; rera: boolean };
const EMPTY_FILTERS: PropertyFilters = { sort: 'recommended', minPrice: '', maxPrice: '', minArea: '', maxArea: '', city: '', locality: '', facing: [], verification: 'all', rera: false };
const PAGE_SIZE = 10;
const DEFAULT_CITY: MaharashtraCity = { id: 'latur', name: 'Latur', district: 'Latur', state: 'Maharashtra', latitude: 18.41041667, longitude: 76.53328611 };
const numericFilter = (value: string) => value.trim() ? Number(value) : undefined;
function matchesFilters(plot: any, filters: PropertyFilters) {
  const price = plot.finalAmount ?? plot.areaSqft * plot.ratePerSqft;
  const haystack = `${plot.town || ''} ${plot.locality || ''} ${plot.address || ''}`.toLowerCase();
  const minPrice = numericFilter(filters.minPrice), maxPrice = numericFilter(filters.maxPrice), minArea = numericFilter(filters.minArea), maxArea = numericFilter(filters.maxArea);
  return (minPrice == null || price >= minPrice) && (maxPrice == null || price <= maxPrice) &&
    (minArea == null || plot.areaSqft >= minArea) && (maxArea == null || plot.areaSqft <= maxArea) &&
    (!filters.city.trim() || String(plot.town || '').toLowerCase().includes(filters.city.trim().toLowerCase())) &&
    (!filters.locality.trim() || haystack.includes(filters.locality.trim().toLowerCase())) &&
    (!filters.facing.length || filters.facing.some(value => (plot.facing || []).some((entry: string) => entry.toLowerCase().startsWith(value.toLowerCase())))) &&
    (filters.verification === 'all' || (filters.verification === 'verified' ? plot.verified === true : plot.verified !== true)) &&
    (!filters.rera || plot.reraRegistered === true);
}
function sortPlots(plots: readonly any[], sort: string) { const next = [...plots]; if (sort === 'price-asc') return next.sort((a, b) => (a.finalAmount ?? a.areaSqft * a.ratePerSqft) - (b.finalAmount ?? b.areaSqft * b.ratePerSqft)); if (sort === 'price-desc') return next.sort((a, b) => (b.finalAmount ?? b.areaSqft * b.ratePerSqft) - (a.finalAmount ?? a.areaSqft * a.ratePerSqft)); if (sort === 'area-asc') return next.sort((a, b) => a.areaSqft - b.areaSqft); if (sort === 'area-desc') return next.sort((a, b) => b.areaSqft - a.areaSqft); return next; }
function countActiveFilters(filters: PropertyFilters) { return (filters.sort === 'recommended' ? 0 : 1) + (filters.minPrice || filters.maxPrice ? 1 : 0) + (filters.minArea || filters.maxArea ? 1 : 0) + (filters.city || filters.locality ? 1 : 0) + (filters.facing.length ? 1 : 0) + (filters.verification === 'all' ? 0 : 1) + (filters.rera ? 1 : 0); }

export default function PropertyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const [city, setCity] = useState<MaharashtraCity>();
  const [category, setCategory] = useState<'plots' | 'agriculture'>('plots');
  const [agricultureFilters, setAgricultureFilters] = useState(emptyAgricultureFilters);
  const [showAgricultureFilters, setShowAgricultureFilters] = useState(false);
  const [agricultureCameraPlot, setAgricultureCameraPlot] = useState<Plot | null>(null);
  const agricultureSelected = category === 'agriculture';
  const [selectedPlotId, setSelectedPlotId] = useState<string>();
  const [headerHeight, setHeaderHeight] = useState(0), [carouselHeight, setCarouselHeight] = useState(0);
  const [mapStyle, setMapStyle] = useState<MapStyleId>('satellite'), [showMapStyles, setShowMapStyles] = useState(false);
  const [viewMode, setViewMode] = useState<PropertyViewMode>('map');
  const [currentPage, setCurrentPage] = useState(1);
  const [mapVisibleCount, setMapVisibleCount] = useState(PAGE_SIZE);
  const [loadingMoreMarkers, setLoadingMoreMarkers] = useState(false);
  const handleCityChange = useCallback((nextCity: MaharashtraCity) => { setCity(nextCity); setSelectedPlotId(undefined); setAgricultureCameraPlot(null); }, []);
  const activeCity = city ?? DEFAULT_CITY;
  const { plots: allPlots, agriculture, loading, error, refresh } = useCityPlots(activeCity.id);
  const agricultureRecords: readonly PropertyRecord[] = agriculture;
  const appliedPlotFilters = (route.params as { filters?: Partial<PropertyFilters> } | undefined)?.filters;
  const filters = useMemo(() => ({ ...EMPTY_FILTERS, ...appliedPlotFilters }), [appliedPlotFilters]);
  const matchingPlots = useMemo(() => {
    if (!agricultureSelected) return sortPlots(allPlots.filter(plot => matchesFilters(plot, filters)), filters.sort);
    return agricultureRecords.filter(record => matchesAgriculture(record, agricultureFilters))
      .map(record => propertyToPlot(record, { allowMissingCoordinates: true })).filter((plot): plot is Plot => plot !== null);
  }, [agricultureSelected, agricultureRecords, agricultureFilters, allPlots, filters]);
  const totalPages = Math.max(1, Math.ceil(matchingPlots.length / PAGE_SIZE));
  const filterKey = JSON.stringify([activeCity.id, category, agricultureSelected ? agricultureFilters : filters]);
  const [previousFilterKey, setPreviousFilterKey] = useState(filterKey);
  if (previousFilterKey !== filterKey) {
    setPreviousFilterKey(filterKey);
    setCurrentPage(1);
    setMapVisibleCount(PAGE_SIZE);
    setSelectedPlotId(undefined);
  } else if (currentPage > totalPages && !loading) {
    setCurrentPage(totalPages);
    setSelectedPlotId(undefined);
  }
  const listPlots = useMemo(() => matchingPlots.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [currentPage, matchingPlots]);
  const validMapPlots = useMemo(() => matchingPlots.filter(isValidPlot), [matchingPlots]);
  const mapPlots = useMemo(() => validMapPlots.slice(0, mapVisibleCount), [mapVisibleCount, validMapPlots]);
  const bottomPadding = agricultureSelected && !mapPlots.length ? 0 : carouselHeight;
  const mapPadding = useMemo(() => ({ top: headerHeight + spacing.lg, bottom: bottomPadding + spacing.xs, left: 0, right: 0 }),
    [headerHeight, bottomPadding]);
  const visiblePlots = viewMode === 'map' ? mapPlots : listPlots;
  const activeFilterCount = agricultureSelected ? selectedAgricultureFilters(agricultureFilters).length : countActiveFilters(filters);
  const openPlot = useCallback((plotId: string) => {
    const plot = matchingPlots.find(item => item.id === plotId);
    navigation.navigate('PropertyDetails', { propertyId: plotId, plot, source: 'home' });
  }, [matchingPlots, navigation]);
  const resolvedSelection = resetSelectionForPlots(visiblePlots, selectedPlotId);
  const selectPlot = (id: string) => {
    setSelectedPlotId(id);
    if (agricultureSelected) {
      const plot = mapPlots.find(item => item.id === id);
      if (plot) setAgricultureCameraPlot(plot);
    }
  };
  const openFilters = () => {
    if (agricultureSelected) setShowAgricultureFilters(true);
    else navigation.navigate('PropertyFilters', { filters, candidates: allPlots });
  };
  const selectedStyle = mapStyles.find(style => style.id === mapStyle);
  const clearFilters = () => {
    if (agricultureSelected) setAgricultureFilters(emptyAgricultureFilters);
    else navigation.setParams({ filters: EMPTY_FILTERS } as never);
  };
  const changePage = (page: number) => { setCurrentPage(page); setSelectedPlotId(undefined); };
  const pagination = <PropertyPagination currentPage={currentPage} totalPages={totalPages} totalItems={matchingPlots.length} pageSize={PAGE_SIZE} onPageChange={changePage} />;
  const loadMoreMarkers = () => { if (loadingMoreMarkers || mapVisibleCount >= validMapPlots.length) return; setLoadingMoreMarkers(true); requestAnimationFrame(() => { setMapVisibleCount(count => Math.min(count + PAGE_SIZE, validMapPlots.length)); setLoadingMoreMarkers(false); }); };

  return <SafeAreaView style={styles.container} edges={['top']}><View style={styles.map}>
    <View pointerEvents={viewMode === 'map' ? 'auto' : 'none'} style={[StyleSheet.absoluteFill, viewMode === 'list' && styles.hiddenMap]}><PropertyMap mapPadding={mapPadding} city={activeCity} plots={mapPlots} selectedPlotId={resolvedSelection} cameraPlot={agricultureSelected ? agricultureCameraPlot : undefined} hideEmptyState={agricultureSelected} onSelectPlot={selectPlot} tileUrl={selectedStyle?.urlTemplate} attribution={selectedStyle?.attribution} /></View>
    {viewMode === 'list' && <View style={styles.listOverlay}><PropertyList plots={listPlots} onPressPlot={openPlot} headerHeight={headerHeight} footer={pagination} /></View>}
    <View pointerEvents="box-none" style={styles.headerContainer} onLayout={event => setHeaderHeight(event.nativeEvent.layout.height)}><View style={styles.header}><CitySelector value={city ?? activeCity} onChange={handleCityChange} /><View style={styles.spacer} /><Pressable accessibilityRole="button" accessibilityLabel="Refresh properties" onPress={refresh} style={styles.filter}><RefreshCw size={19} color={colors.primary} /></Pressable><Pressable accessibilityLabel={`Filters${activeFilterCount ? `, ${activeFilterCount} active` : ''}`} onPress={openFilters} style={[styles.filter, activeFilterCount > 0 && styles.activeFilter]}><SlidersHorizontal size={22} color={colors.primary} />{activeFilterCount > 0 && <View style={styles.count}><AppText style={styles.countText}>{activeFilterCount}</AppText></View>}</Pressable></View>
    <View style={styles.categories}>
      {(['plots', 'agriculture'] as const).map(item => <Pressable key={item} accessibilityRole="tab"
        accessibilityState={{ selected: category === item }} onPress={() => setCategory(item)}
        style={[styles.category, category === item && styles.activeFilter]}>
        <AppText variant="caption" style={category === item ? styles.selectedStyle : undefined}>
          {item === 'plots' ? 'Plots' : 'Agriculture (Sheti)'}
        </AppText>
      </Pressable>)}
    </View></View>
    {viewMode === 'map' && <Pressable onPress={() => setShowMapStyles(true)} style={[styles.layers, { top: headerHeight + 25 }]}><Layers size={22} color={colors.primary} /></Pressable>}
    {(!agricultureSelected || mapPlots.length > 0) && <View pointerEvents={viewMode === 'map' ? 'auto' : 'none'} style={[styles.carousel, viewMode === 'list' && styles.hiddenMap]} onLayout={event => setCarouselHeight(event.nativeEvent.layout.height)}><PlotCarousel plots={mapPlots} selectedPlotId={resolvedSelection} onSelectPlot={selectPlot} onPressPlot={openPlot} hasMore={mapVisibleCount < validMapPlots.length} loadingMore={loadingMoreMarkers} onLoadMore={loadMoreMarkers} /></View>}
    <Pressable onPress={() => setViewMode(current => current === 'map' ? 'list' : 'map')} style={[styles.viewToggle, { bottom: viewMode === 'map' && (!agricultureSelected || mapPlots.length > 0) ? carouselHeight + spacing.md : spacing.xl }]}>{viewMode === 'map' ? <List size={18} color={colors.primary} /> : <Map size={18} color={colors.primary} />}<AppText>{viewMode === 'map' ? 'List view' : 'Map view'}</AppText></Pressable>
    {agricultureSelected && !loading && !error && matchingPlots.length === 0 &&
      <View pointerEvents="box-none" style={styles.agricultureEmpty}>
        <AgricultureEmptyState hasListings={agricultureRecords.length > 0} onClear={clearFilters} />
      </View>}
    {!agricultureSelected && !loading && !error && matchingPlots.length === 0 && <View style={styles.empty}><AppText variant="title">No properties found</AppText><AppText muted>Try changing or resetting your filters.</AppText>{activeFilterCount > 0 && <Pressable onPress={clearFilters} style={styles.clearButton}><AppText style={styles.clearText}>Clear filters</AppText></Pressable>}</View>}
    <View pointerEvents="box-none" style={{ position: 'absolute', top: headerHeight + 28, left: 16, maxWidth: '70%' }}>{loading ? <ActivityIndicator accessibilityLabel="Loading properties" color={colors.primary} /> : error ?
      <Pressable onPress={refresh}><AppText>{error} · Tap to retry</AppText></Pressable> :
      agricultureSelected && viewMode === 'map' && matchingPlots.length > 0 && <View style={styles.results}><AppText variant="caption">{matchingPlots.length} matching {matchingPlots.length === 1 ? 'property' : 'properties'}</AppText></View>}</View>
    <AppBottomSheet visible={showMapStyles} onClose={() => setShowMapStyles(false)} title="Map style">{mapStyles.map(style => <Pressable key={style.id} disabled={!style.urlTemplate} onPress={() => { setMapStyle(style.id); setShowMapStyles(false); }} style={styles.styleOption}><AppText>{style.label}</AppText>{mapStyle === style.id && <AppText style={styles.selectedStyle}>✓</AppText>}</Pressable>)}</AppBottomSheet>
  </View>
  <Modal visible={showAgricultureFilters} animationType="slide" onRequestClose={() => setShowAgricultureFilters(false)}>
    {showAgricultureFilters && <AgricultureFilterScreen applied={agricultureFilters} records={agricultureRecords} loading={loading} error={error}
      onClose={() => setShowAgricultureFilters(false)} onApply={next => {
        setAgricultureFilters(next);
        setShowAgricultureFilters(false);
      }} />}
  </Modal>
  <NetworkErrorModal visible={!!error && isNetworkError(new Error(error))} loading={loading} onRetry={refresh} onCancel={() => {}} /></SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background }, map: { flex: 1, position: 'relative' }, hiddenMap: { opacity: 0 }, listOverlay: { ...StyleSheet.absoluteFill, backgroundColor: colors.background }, viewToggle: { position: 'absolute', right: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, minHeight: 44, borderRadius: 24, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }, headerContainer: { zIndex: 2, position: 'absolute', top: spacing.lg, left: spacing.lg, right: spacing.lg, gap: 6 },
agricultureEmpty: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' },
categories: { flexDirection: 'row', gap: 6 },
category: { paddingHorizontal: 12, minHeight: 44, justifyContent: 'center', backgroundColor: colors.background, borderRadius: 22, borderColor: colors.border, borderWidth: 1 },
results: { backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 },
header: { flexDirection: 'row', alignItems: 'center', borderRadius: 32, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }, spacer: { flex: 1 }, filter: { position: 'relative', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, marginRight: spacing.xs }, activeFilter: { borderColor: '#8CFF32' }, count: { position: 'absolute', top: 2, right: 7, zIndex: 2 }, countText: { color: '#8CFF32', fontSize: 11, lineHeight: 13, fontWeight: '900', textShadowColor: '#000000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }, layers: { position: 'absolute', right: spacing.lg, top: 90, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }, styleOption: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border }, selectedStyle: { color: colors.primary }, carousel: { position: 'absolute', left: 0, right: 0, bottom: spacing.xs }, empty: { position: 'absolute', alignSelf: 'center', top: '35%', width: '82%', padding: spacing.xl, gap: spacing.sm, alignItems: 'center', borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, clearButton: { marginTop: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 20, backgroundColor: colors.primary }, clearText: { color: colors.background, fontWeight: '800' } });
