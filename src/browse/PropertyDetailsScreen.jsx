import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getPropertyDetails, deleteProperty } from '../services/propertyService';
import { supabase } from '../lib/supabase';
import { AppText } from './components/ui';
import { colors, radius, spacing } from './theme';
import { formatPriceInLakhsCrores, formatRatePerSqft } from '../utils/priceFormatter';
import { isNetworkError } from '../utils/networkUtils';
import { NetworkErrorModal, ActionConfirmModal } from '../components/modals';

const valueOr = (value, fallback = 'Not provided') => value == null || value === '' ? fallback : String(value);

export default function PropertyDetailsScreen({ route, navigation }) {
  const incomingPlot = route.params?.plot || route.params?.property;
  const isProfileSource = route.params?.source === 'profile';

  const [record, setRecord] = useState(() => {
    if (incomingPlot) {
      return {
        id: incomingPlot.id,
        title: incomingPlot.propertyType || incomingPlot.title || 'Property',
        property_type: incomingPlot.propertyType || incomingPlot.type || 'Property',
        total_amount: incomingPlot.finalAmount ?? incomingPlot.total_amount ?? (incomingPlot.areaSqft && incomingPlot.ratePerSqft ? incomingPlot.areaSqft * incomingPlot.ratePerSqft : undefined),
        rate_per_sqft: incomingPlot.ratePerSqft ?? incomingPlot.rate_per_sqft,
        total_area: incomingPlot.areaSqft ?? incomingPlot.total_area,
        length: incomingPlot.length,
        width: incomingPlot.width,
        address: incomingPlot.address || incomingPlot.locality,
        city: incomingPlot.town || incomingPlot.city,
        pincode: incomingPlot.pincode,
        latitude: incomingPlot.latitude,
        longitude: incomingPlot.longitude,
        facing: incomingPlot.facing || incomingPlot.primaryFacing,
        agent_full_name: incomingPlot.contactName || incomingPlot.agent_full_name,
        agent_contact_number: incomingPlot.contactNumber || incomingPlot.agent_contact_number,
        description: incomingPlot.description,
        status: incomingPlot.status || 'Available',
      };
    }
    return null;
  });

  const [mode, setMode] = useState(null);
  const [canManage, setCanManage] = useState(false);
  const [message, setMessage] = useState(incomingPlot ? '' : 'Loading property…');
  const [bookmarked, setBookmarked] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    if (!record && !incomingPlot) setMessage('Loading property…');
    setShowNetworkModal(false);
    try {
      const result = await getPropertyDetails(route.params.propertyId);
      if (result?.property) {
        setRecord(result.property);
        setMode(result.mode);
        setCanManage(result.canManage);
        setMessage('');
      } else if (!record && !incomingPlot) {
        setMessage('Property is not available in this workspace.');
      }
    } catch (error) {
      if (isNetworkError(error)) {
        setShowNetworkModal(true);
        if (!record && !incomingPlot) setMessage('');
      } else if (!record && !incomingPlot) {
        setMessage(error?.message || 'Unable to load property.');
      }
    } finally {
      setRetrying(false);
    }
  };

  useFocusEffect(useCallback(() => {
    let active = true;
    void load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (active) void load();
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [route.params.propertyId]));

  const title = record?.title || record?.property_title || record?.property_name || 'Property';
  const type = record?.property_type || record?.type || 'Property';
  const location = [record?.address, record?.city, record?.pincode].filter(Boolean).join(', ');
  const facing = Array.isArray(record?.facing) ? record.facing.join(', ') : record?.facing;

  const remove = async () => {
    try {
      setDeleting(true);
      await deleteProperty(route.params.propertyId);
      setShowDeleteModal(false);
      if (Platform.OS === 'web') {
        window.alert('Property deleted successfully.');
        navigation.goBack();
      } else {
        Alert.alert('Property deleted', 'The property was deleted successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      setShowDeleteModal(false);
      if (Platform.OS === 'web') window.alert(error.message);
      else Alert.alert('Unable to delete', error.message);
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    if (!isProfileSource || !canManage) return;
    setShowDeleteModal(true);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} accessibilityLabel="Back">
            <AppText style={styles.iconText}>‹</AppText>
          </Pressable>
          <View style={styles.status}>
            <AppText style={styles.statusText}>{record?.status || (record?.verified ? 'Verified' : 'Available')}</AppText>
          </View>
          <Pressable onPress={() => setBookmarked(value => !value)} style={styles.iconButton} accessibilityLabel="Bookmark property">
            <MaterialCommunityIcons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={colors.primary} />
          </Pressable>
        </View>

        {!!message && <AppText style={styles.message}>{message}</AppText>}

        {record && (
          <>
            <View style={styles.overview}>
              <AppText variant="title">{title}</AppText>
              <AppText style={styles.type}>{type}</AppText>
              <AppText muted>{location || 'Location not provided'}</AppText>
              <AppText style={styles.price}>{formatPriceInLakhsCrores(record.total_amount)}</AppText>
            </View>
            <Section title="Property specifications">
              <Detail label="Total area" value={record.total_area ? `${record.total_area} sq.ft.` : null} />
              <Detail label="Length" value={record.length} />
              <Detail label="Width" value={record.width} />
              <Detail label="Rate per sq.ft." value={formatRatePerSqft(record.rate_per_sqft)} />
              <Detail label="Facing" value={facing} />
            </Section>
            <Section title="Location details">
              <Detail label="Address" value={record.address} />
              <Detail label="City" value={record.city} />
              <Detail label="Pincode" value={record.pincode} />
              <Detail label="Latitude" value={record.latitude} />
              <Detail label="Longitude" value={record.longitude} />
            </Section>
            <Section title="Additional information">
              <Detail label="RERA registered" value={record.maha_rera_registered == null ? null : record.maha_rera_registered ? 'Yes' : 'No'} />
              <Detail label="Agent / owner" value={record.agent_full_name} />
              <Detail label="Contact" value={record.agent_contact_number} />
              {record.description && <AppText style={styles.description}>{record.description}</AppText>}
            </Section>
            {isProfileSource && canManage && (
              <Pressable onPress={confirmDelete} style={styles.delete}>
                <AppText style={{ color: colors.error }}>Delete Property</AppText>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>

      {/* Network Error Modal */}
      <NetworkErrorModal
        visible={showNetworkModal}
        loading={retrying}
        onRetry={() => {
          setRetrying(true);
          void load();
        }}
        onCancel={() => {
          setShowNetworkModal(false);
          navigation.goBack();
        }}
        cancelLabel="Go Back"
      />

      {/* Action / Delete Confirmation Modal */}
      <ActionConfirmModal
        visible={showDeleteModal}
        loading={deleting}
        title="Delete property?"
        message={mode === 'guest'
          ? 'Remove this property from this device?'
          : 'Are you sure you want to delete this property? This action cannot be undone.'}
        confirmLabel="Delete Property"
        cancelLabel="Keep Property"
        onConfirm={remove}
        onCancel={() => setShowDeleteModal(false)}
        danger={true}
      />
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <AppText variant="title" style={styles.sectionTitle}>{title}</AppText>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Detail({ label, value }) {
  return (
    <View style={styles.detail}>
      <AppText muted>{label}</AppText>
      <AppText style={styles.detailValue}>{valueOr(value)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  topBar: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.78)' },
  iconText: { fontSize: 34, lineHeight: 38, color: colors.primary },
  status: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, backgroundColor: colors.primary },
  statusText: { color: colors.background, fontWeight: '800', textTransform: 'capitalize' },
  message: { padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg },
  overview: { gap: spacing.xs },
  type: { color: colors.primary, fontWeight: '700', textTransform: 'capitalize' },
  price: { marginTop: spacing.sm, color: colors.primary, fontSize: 28, fontWeight: '800' },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 19 },
  card: { padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  detail: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm },
  detailValue: { flex: 1, textAlign: 'right' },
  description: { lineHeight: 22 },
  delete: { padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: 'center' }
});
