import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Pressable, StyleSheet, View } from 'react-native';
import { Layers, List, Map, SlidersHorizontal } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CitySelector } from '@/src/browse/features/location/components/CitySelector';
import type { MaharashtraCity } from '@/src/browse/features/location/types';
import { PropertyMap } from '@/src/browse/features/map/components';
import { mapStyles, type MapStyleId } from '@/src/browse/features/map/tileProvider';
import { AppBottomSheet, AppText } from '@/src/browse/components/ui';
import { PlotCarousel } from '@/src/browse/features/plots/components/PlotCarousel';
import { PropertyList } from '@/src/browse/features/plots/components/PropertyList';
import { useCityPlots } from '@/src/browse/features/plots/hooks';
import { resetSelectionForPlots } from '@/src/browse/features/plots/selection';
import { colors, spacing } from '@/src/browse/theme';

type PropertyViewMode = 'map' | 'list';

export default function PropertyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [city, setCity] = useState<MaharashtraCity>();
  const [selectedPlotId, setSelectedPlotId] = useState<string>();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [carouselHeight, setCarouselHeight] = useState(0);
  const [mapStyle, setMapStyle] = useState<MapStyleId>('satellite');
  const [showMapStyles, setShowMapStyles] = useState(false);
  const [viewMode, setViewMode] = useState<PropertyViewMode>('map');
  const mapPadding = useMemo(() => ({ top: headerHeight + spacing.lg, bottom: carouselHeight + spacing.xs, left: 0, right: 0 }), [headerHeight, carouselHeight]);
  const openPlot = useCallback((plotId: string) => navigation.navigate('PropertyDetails', { propertyId: plotId }), [navigation]);
  const handleCityChange = useCallback((nextCity: MaharashtraCity) => { setCity(nextCity); setSelectedPlotId(undefined); }, []);
  const activeCity = city ?? { id: 'latur', name: 'Latur', district: 'Latur', state: 'Maharashtra' as const, latitude: 18.41041667, longitude: 76.53328611 };
  const { plots, loading, error, refresh } = useCityPlots(activeCity.id);
  const resolvedSelection = resetSelectionForPlots(plots, selectedPlotId);
  const selectedStyle = mapStyles.find((style) => style.id === mapStyle);

  return <SafeAreaView style={styles.container} edges={['top']}><View style={styles.map}><View pointerEvents={viewMode === 'map' ? 'auto' : 'none'} accessibilityElementsHidden={viewMode === 'list'} importantForAccessibility={viewMode === 'list' ? 'no-hide-descendants' : 'auto'} style={[StyleSheet.absoluteFill, viewMode === 'list' && styles.hiddenMap]}><PropertyMap mapPadding={mapPadding} city={activeCity} plots={plots} selectedPlotId={resolvedSelection} onSelectPlot={setSelectedPlotId} tileUrl={selectedStyle?.urlTemplate} attribution={selectedStyle?.attribution} /></View>{viewMode === 'list' && <View style={styles.listOverlay}><PropertyList plots={plots} onPressPlot={openPlot} headerHeight={headerHeight} /></View>}<View style={styles.header} onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}><CitySelector value={city ?? activeCity} onChange={handleCityChange} /><View style={styles.spacer} /><Pressable accessibilityRole="button" accessibilityLabel="Refresh properties" onPress={refresh} style={styles.filter}><AppText>↻</AppText></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Map filters, unavailable" accessibilityState={{ disabled: true }} disabled style={styles.filter}><SlidersHorizontal size={24} color={colors.primary} /></Pressable></View>{viewMode === 'map' && <Pressable accessibilityRole="button" accessibilityLabel="Change map style" onPress={() => setShowMapStyles(true)} style={styles.layers}><Layers size={22} color={colors.primary} /></Pressable>}<View pointerEvents={viewMode === 'map' ? 'auto' : 'none'} accessibilityElementsHidden={viewMode === 'list'} importantForAccessibility={viewMode === 'list' ? 'no-hide-descendants' : 'auto'} style={[styles.carousel, viewMode === 'list' && styles.hiddenMap]} onLayout={(event) => setCarouselHeight(event.nativeEvent.layout.height)}><PlotCarousel  plots={plots} selectedPlotId={resolvedSelection} onSelectPlot={setSelectedPlotId} onPressPlot={openPlot} /></View><Pressable accessibilityRole="button" accessibilityLabel={viewMode === 'map' ? 'Switch to list view' : 'Switch to map view'} onPress={() => setViewMode((current) => current === 'map' ? 'list' : 'map')} style={[styles.viewToggle, { bottom: viewMode === 'map' ? carouselHeight + spacing.md : spacing.xl }]}>{viewMode === 'map' ? <List size={18} color={colors.primary} /> : <Map size={18} color={colors.primary} />}<AppText>{viewMode === 'map' ? 'List view' : 'Map view'}</AppText></Pressable><View pointerEvents="box-none" style={{ position: "absolute", top: headerHeight + 28, left: 16, maxWidth: "70%" }}>{loading ? <AppText>Loading properties…</AppText> : error ? <Pressable onPress={refresh}><AppText>{error} · Tap to retry</AppText></Pressable> : null}</View><AppBottomSheet visible={showMapStyles} onClose={() => setShowMapStyles(false)} title="Map style">{mapStyles.map((style) => <Pressable key={style.id} accessibilityRole="radio" accessibilityState={{ checked: mapStyle === style.id, disabled: !style.urlTemplate }} disabled={!style.urlTemplate} onPress={() => { setMapStyle(style.id); setShowMapStyles(false); }} style={styles.styleOption}><AppText>{style.label}</AppText>{mapStyle === style.id && <AppText style={styles.selectedStyle}>✓</AppText>}</Pressable>)}</AppBottomSheet></View></SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background }, map: { flex: 1, position: 'relative' }, hiddenMap: { opacity: 0 }, listOverlay: { ...StyleSheet.absoluteFill, backgroundColor: colors.background }, viewToggle: { position: 'absolute', right: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, minHeight: 44, borderRadius: 24, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }, header: { position: 'absolute', top: spacing.lg, left: spacing.lg, right: spacing.lg, flexDirection: 'row', alignItems: 'center', borderRadius: 32, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }, spacer: { flex: 1 }, filter: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, marginRight: spacing.xs }, layers: { position: 'absolute', right: spacing.lg, top: 90, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }, styleOption: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border }, selectedStyle: { color: colors.primary }, carousel: { position: 'absolute', left: 0, right: 0, bottom: spacing.xs } });
