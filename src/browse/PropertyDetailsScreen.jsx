import { useCallback, useState } from 'react';
import { ScrollView, Pressable, Image, View, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getPropertyDetails, deleteProperty } from '../services/propertyService';
import { supabase } from '../lib/supabase';
import { AppText } from './components/ui';
import { colors, spacing } from './theme';

export default function PropertyDetailsScreen({ route, navigation }) {
  const [canManage, setCanManage] = useState(false);
  const [record, setRecord] = useState(null);
  const [mode, setMode] = useState(null);
  const [message, setMessage] = useState('Loading property…');
  useFocusEffect(useCallback(() => {
    let active = true, generation = 0, timer;
    const load = async () => {
      const request = ++generation;
      setCanManage(false); setRecord(null); setMessage('Loading property…');
      try {
        const result = await getPropertyDetails(route.params.propertyId);
        if (active && request === generation) { setRecord(result.property); setMode(result.mode); setCanManage(result.canManage); setMessage(result.property ? '' : 'Property is not available in this workspace.'); }
      } catch (reason) { if (active && request === generation) setMessage(reason instanceof Error ? reason.message : 'Unable to load property.'); }
    };
    void load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
      generation++; setRecord(null); setCanManage(false); setMode(null); setMessage('Loading property…');
      clearTimeout(timer); timer = setTimeout(() => { if (active) void load(); }, 0);
    });
    return () => { active = false; generation++; clearTimeout(timer); subscription.unsubscribe(); };
  }, [route.params.propertyId]));
  const remove = async () => {
    try { await deleteProperty(route.params.propertyId); navigation.goBack(); }
    catch (error) {
      if (Platform.OS === 'web') window.alert(error.message);
      else Alert.alert('Unable to delete', error.message);
    }
  };
  const confirmDelete = () => {
    if (!canManage) return;
    const text = mode === 'guest' ? 'Remove this guest test property from this device?' : 'This permanently removes this property.';
    if (Platform.OS === 'web') { if (window.confirm(text)) void remove(); }
    else Alert.alert('Delete property?', text, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: remove }]);
  };
  const fields = { 'Property type': record?.property_type ?? record?.type, Address: record?.address, City: record?.city, Area: record?.total_area, Length: record?.length, Width: record?.width, 'Rate per sqft': record?.rate_per_sqft, 'Total amount': record?.total_amount, Facing: record?.facing, Status: record?.status, Agent: record?.agent_full_name, Contact: record?.agent_contact_number, Latitude: record?.latitude, Longitude: record?.longitude };
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
    <Pressable onPress={() => navigation.goBack()} style={{ paddingVertical: 12 }}><AppText>‹ Back</AppText></Pressable><AppText variant="title">Property details</AppText>
    {mode === 'guest' && record && <AppText muted>Guest test property · this device only · not uploaded</AppText>}
    {!!message && <AppText>{message}</AppText>}
    {record && Object.entries(fields).map(([label, value]) => <View key={label}><AppText muted>{label}</AppText><AppText>{Array.isArray(value) ? value.join(', ') : value == null ? 'Not provided' : String(value)}</AppText></View>)}
    {Array.isArray(record?.images) && record.images.filter(uri => typeof uri === 'string').map(uri => <Image key={uri} source={{ uri }} style={{ height: 220, width: '100%', borderRadius: 16 }} />)}
    {record && canManage && <Pressable onPress={confirmDelete} style={{ padding: 16, backgroundColor: colors.surface }}><AppText style={{ color: colors.error }}>Delete property</AppText></Pressable>}
  </ScrollView></SafeAreaView>;
}
