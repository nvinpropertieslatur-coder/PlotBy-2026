import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaseModal from './BaseModal';

/**
 * Map Location Validation Modal
 * Recreates the alert/warning popup when map confirmation is required.
 */
export default function MapValidationModal({
  visible,
  onOpenMap,
  onClose,
  message = 'Please select and confirm your property location on the map before adding your property.',
}) {
  return (
    <BaseModal visible={visible} onClose={onClose} dismissible={true}>
      <View style={styles.card}>
        {/* Warning Icon Badge */}
        <View style={styles.iconCircle}>
          <Ionicons name="map" size={32} color="#8CFF32" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Map Location Required</Text>

        {/* Description */}
        <Text style={styles.message}>{message}</Text>

        {/* Actions */}
        <View style={styles.actionContainer}>
          {!!onOpenMap && (
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => {
                if (onClose) onClose();
                onOpenMap();
              }}
              accessibilityRole="button"
              accessibilityLabel="Select on Map"
            >
              <Text style={styles.primaryButtonText}>Select on Map</Text>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          >
            <Text style={styles.secondaryButtonText}>Dismiss</Text>
          </Pressable>
        </View>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#161916',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#293229',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1F291F',
    borderWidth: 1,
    borderColor: '#2D3F2D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 22,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 6,
  },
  actionContainer: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#8CFF32',
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#202520',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2B332B',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D1D5DB',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
});
