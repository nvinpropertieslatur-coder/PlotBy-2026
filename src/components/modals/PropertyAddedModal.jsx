import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaseModal from './BaseModal';
import { formatPriceInLakhsCrores } from '../../utils/priceFormatter';

/**
 * Property Added Success Popup
 * Recreates the PlotBy confirmation/success design inspired by Image 4 (item 30).
 */
export default function PropertyAddedModal({
  visible,
  property = {},
  mode = 'authenticated',
  isEditing = false,
  onViewListing,
  onGoToProperties,
  onClose,
}) {
  const safeProp = property || {};
  const isGuest = mode === 'guest';
  const propertyType = safeProp.property_type || safeProp.type || 'Plot';
  const city = safeProp.city || 'Maharashtra';
  const title = safeProp.title || `${propertyType} in ${city}`;
  const price = formatPriceInLakhsCrores(safeProp.total_amount);
  const area = safeProp.total_area ? `${safeProp.total_area} sq.ft.` : null;

  return (
    <BaseModal visible={visible} onClose={onClose} dismissible={true}>
      <View style={styles.card}>
        {/* Close Button Top Right */}
        <Pressable
          style={styles.closeButton}
          onPress={onClose || onGoToProperties}
          accessibilityRole="button"
          accessibilityLabel="Close confirmation popup"
        >
          <Ionicons name="close" size={20} color="#9CA3AF" />
        </Pressable>

        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={34} color="#000000" />
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>
          {isEditing ? 'Property updated!' : 'Property added!'}
        </Text>
        <Text style={styles.subtitle}>
          {isGuest
            ? 'Your property was saved on this device.'
            : isEditing
            ? 'Your changes have been saved to your PlotBy listing.'
            : 'Your property is now live and listed on PlotBy.'}
        </Text>

        {/* Property Ticket / Details Box */}
        <View style={styles.ticketBox}>
          <View style={styles.ticketRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ticketLabel}>Listing</Text>
              <Text style={styles.ticketTitle} numberOfLines={1}>
                {title}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {isGuest ? 'Saved' : 'Active'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View>
              <Text style={styles.ticketLabel}>Total Price</Text>
              <Text style={styles.priceValue}>{price}</Text>
            </View>
            {!!area && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.ticketLabel}>Area</Text>
                <Text style={styles.areaValue}>{area}</Text>
              </View>
            )}
          </View>

          {safeProp.latitude != null && safeProp.longitude != null && (
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={14} color="#8CFF32" />
              <Text style={styles.coordsText} numberOfLines={1}>
                {Number(safeProp.latitude).toFixed(4)}, {Number(safeProp.longitude).toFixed(4)} · Confirmed
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {!!onViewListing && (
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onViewListing}
              accessibilityRole="button"
              accessibilityLabel="View listing"
            >
              <Text style={styles.primaryButtonText}>View listing</Text>
            </Pressable>
          )}

          {!!onGoToProperties && (
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onGoToProperties}
              accessibilityRole="button"
              accessibilityLabel="Go to My Properties"
            >
              <Text style={styles.secondaryButtonText}>Done</Text>
            </Pressable>
          )}
        </View>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#161916',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#293229',
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#202620',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#8CFF32',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#8CFF32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 18,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  ticketBox: {
    width: '100%',
    backgroundColor: '#1C211C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F382F',
    borderStyle: 'solid',
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  ticketLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E331E',
    borderWidth: 1,
    borderColor: '#2E552E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8CFF32',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8CFF32',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#283028',
    width: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8CFF32',
    marginTop: 2,
  },
  areaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5E7EB',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  coordsText: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
  actionsContainer: {
    width: '100%',
    marginTop: 22,
    gap: 10,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#8CFF32',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000000',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#232923',
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#303930',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
