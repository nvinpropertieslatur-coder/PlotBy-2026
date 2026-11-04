import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaseModal from './BaseModal';

/**
 * Action / Delete Confirmation Popup
 * Recreates the destructive confirmation modal matching Image 1 (item 46: Delete account).
 */
export default function ActionConfirmModal({
  visible,
  title = 'Delete property?',
  message = 'Are you sure you want to delete this property? This action cannot be undone.',
  badgeText = 'Permanent',
  confirmLabel = 'Delete Property',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  danger = true,
}) {
  return (
    <BaseModal visible={visible} onClose={onCancel} dismissible={!loading}>
      <View style={styles.card}>
        {/* Warning / Permanent Badge */}
        {!!badgeText && (
          <View style={styles.badge}>
            <Ionicons
              name="trash-outline"
              size={13}
              color={danger ? '#FF6B6B' : '#F59E0B'}
            />
            <Text
              style={[
                styles.badgeText,
                danger ? styles.dangerText : styles.warningText,
              ]}
            >
              {badgeText}
            </Text>
          </View>
        )}

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              danger ? styles.dangerButton : styles.confirmButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onConfirm}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.dangerButtonText}>{confirmLabel}</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onCancel}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
          >
            <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
          </Pressable>
        </View>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 370,
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dangerText: {
    color: '#FF6B6B',
  },
  warningText: {
    color: '#F59E0B',
  },
  title: {
    fontSize: 20,
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
  actions: {
    width: '100%',
    gap: 10,
  },
  dangerButton: {
    width: '100%',
    backgroundColor: '#FF4D4D',
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  confirmButton: {
    width: '100%',
    backgroundColor: '#8CFF32',
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    width: '100%',
    backgroundColor: '#202520',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2B332B',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D1D5DB',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
});
