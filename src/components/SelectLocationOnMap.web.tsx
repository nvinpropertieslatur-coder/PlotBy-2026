import { useMemo, useState } from 'react';
import { Modal, Pressable, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { LeafletMap } from './LeafletMap.web';
import { tileProvider, tileProviderSetupMessage } from '../browse/features/map/tileProvider';

type Coordinate = { latitude: number; longitude: number; address?: string; city?: string; pincode?: string };
type Props = { selectedLocation?: Coordinate | null; onConfirm: (location: Coordinate) => void; buttonStyle?: StyleProp<ViewStyle>; buttonTextStyle?: StyleProp<TextStyle>; showPreview?: boolean };
const defaultCenter = { latitude: 18.4088, longitude: 76.5604 };
export default function SelectLocationOnMap({ selectedLocation, onConfirm, buttonStyle, buttonTextStyle, showPreview = true }: Props) {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<Coordinate | null>(selectedLocation ?? null);
  const [message, setMessage] = useState('');
  const [center, setCenter] = useState<Coordinate>(selectedLocation ?? defaultCenter);
  const markers = useMemo(() => draft ? [{ id: 'location', ...draft, label: 'Selected location' }] : [], [draft]);
  const confirm = () => {
    if (!draft) { setMessage('Click the map to select a location.'); return; }
    onConfirm(draft); setVisible(false);
  };
  const locate = () => navigator.geolocation.getCurrentPosition(position => {
    const point = { latitude: position.coords.latitude, longitude: position.coords.longitude };
    setDraft(point); setCenter(point); setMessage('');
  }, () => setMessage('Current location is unavailable. Select a point manually.'));
  return <>
    <Pressable style={buttonStyle} onPress={() => { setDraft(selectedLocation ?? null); setCenter(selectedLocation ?? defaultCenter); setMessage(''); setVisible(true); }}><Text style={buttonTextStyle}>{selectedLocation ? 'Change Location' : 'Select location on map'}</Text></Pressable>
    {showPreview && <Text style={{ color: '#A7B0A5' }}>{selectedLocation ? `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}` : 'Choose a location to see a map preview'}</Text>}
    <Modal visible={visible} onRequestClose={() => setVisible(false)} animationType="slide">
      <View style={{ flex: 1, backgroundColor: '#101310' }}>
        <View style={{ padding: 16, flexDirection: 'row', gap: 20 }}><Pressable onPress={() => setVisible(false)}><Text style={{ color: '#C9FF32' }}>Back</Text></Pressable><Text style={{ color: '#F7F9F5' }}>Select property location</Text><Pressable onPress={locate}><Text style={{ color: '#C9FF32' }}>Use current location</Text></Pressable></View>
        <View style={{ flex: 1 }}>
          {tileProvider ? <LeafletMap {...center} zoom={15} markers={markers} selectedId="location" tileUrl={tileProvider.urlTemplate} attribution={tileProvider.attribution} onPick={(latitude, longitude) => { setDraft({ latitude, longitude }); setMessage(''); }} /> : <Text style={{ color: '#FF6666', padding: 20 }}>{tileProviderSetupMessage}</Text>}
        </View>
        <View style={{ padding: 20, gap: 12 }}><Text style={{ color: '#F7F9F5' }}>{message || (draft ? `${draft.latitude.toFixed(6)}, ${draft.longitude.toFixed(6)}` : 'Click the map to choose a location.')}</Text><Pressable onPress={confirm} style={{ padding: 16, backgroundColor: '#C9FF32', borderRadius: 12 }}><Text>Confirm location</Text></Pressable></View>
      </View>
    </Modal>
  </>;
}
