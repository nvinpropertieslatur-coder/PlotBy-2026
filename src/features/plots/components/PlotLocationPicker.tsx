import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import MapView, { Marker, UrlTile, type LatLng } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppText } from '@/src/components/ui';
import { DEFAULT_CITY } from '@/src/features/location/cities';
import { tileProvider } from '@/src/features/map/tileProvider';
import { colors, spacing } from '@/src/theme';

type Props = { visible: boolean; initialLocation?: LatLng; onCancel: () => void; onConfirm: (location: LatLng) => void };

/** Changes remain temporary until the user explicitly confirms them. */
export function PlotLocationPicker({ visible, initialLocation, onCancel, onConfirm }: Props) {
  const [selected, setSelected] = useState<LatLng | undefined>(initialLocation);
  const initialRegion = { latitude: initialLocation?.latitude ?? DEFAULT_CITY.latitude, longitude: initialLocation?.longitude ?? DEFAULT_CITY.longitude, latitudeDelta: 0.08, longitudeDelta: 0.08 };
  const select = (event: { nativeEvent: { coordinate: LatLng } }) => setSelected(event.nativeEvent.coordinate);
  return <Modal visible={visible} animationType="slide" onRequestClose={onCancel}><SafeAreaView style={styles.screen}><View style={styles.header}><AppButton title="Back" variant="ghost" onPress={onCancel} /><AppText variant="title">Select location</AppText></View><AppText muted style={styles.notice}>Address search is unavailable. Tap the map or drag the pin to choose a location.</AppText>{tileProvider ? <View style={styles.map}><MapView style={StyleSheet.absoluteFill} initialRegion={initialRegion} mapType="none" onPress={select}><UrlTile urlTemplate={tileProvider.urlTemplate} maximumZ={19} tileSize={256} />{selected && <Marker coordinate={selected} draggable onDragEnd={select} />}</MapView><View style={styles.attribution}><AppText variant="caption">{tileProvider.attribution}</AppText></View></View> : <View style={styles.map}><AppText muted>Map tiles are not configured.</AppText></View>}<View style={styles.footer}><AppText>{selected ? `${selected.latitude.toFixed(6)}, ${selected.longitude.toFixed(6)}` : 'Tap the map to select a location'}</AppText><AppButton title="Confirm Location" disabled={!selected} onPress={() => { if (selected) onConfirm(selected); }} fullWidth /></View></SafeAreaView></Modal>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.md }, notice: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }, map: { flex: 1, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }, attribution: { position: 'absolute', right: spacing.sm, bottom: spacing.sm, backgroundColor: colors.background, padding: spacing.xs }, footer: { gap: spacing.md, padding: spacing.lg } });
