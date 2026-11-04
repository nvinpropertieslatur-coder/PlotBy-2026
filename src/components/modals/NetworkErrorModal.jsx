import React from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import BaseModal from './BaseModal';

/**
 * Network Error / Connection Lost Popup
 * Matches Image 5 (item 40: Connection lost / Retry) from PlotBy popup reference designs.
 */
export default function NetworkErrorModal({
  visible,
  onRetry,
  onCancel,
  loading = false,
  title = 'Connection lost.',
  message = 'Check your connection and try again.',
  cancelLabel = 'Cancel',
  retryLabel = 'Retry',
}) {
  return (
    <BaseModal visible={visible} onClose={onCancel} dismissible={!loading}>
      <View style={styles.card}>
        {/* Amber vertical accent indicator on left border */}
        <View style={styles.leftAccent} />

        <View style={styles.content}>
          {/* Header Row: Title + "Offline" Badge */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.message}>{message}</Text>

          {/* Action Buttons Row */}
          <View style={styles.actionRow}>
            {!!onCancel && (
              <Pressable
                onPress={onCancel}
                disabled={loading}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={cancelLabel}
              >
                <Text style={styles.cancelText}>{cancelLabel}</Text>
              </Pressable>
            )}

            {!!onRetry && (
              <Pressable
                onPress={onRetry}
                disabled={loading}
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={retryLabel}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text style={styles.retryText}>{retryLabel}</Text>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#161816',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#292E29',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#F59E0B',
  },
  content: {
    paddingVertical: 20,
    paddingHorizontal: 22,
    paddingLeft: 26,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  offlineBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#2A1F10',
    borderWidth: 1,
    borderColor: '#854D0E',
  },
  offlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FBBF24',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D1D5DB',
  },
  retryButton: {
    backgroundColor: '#8CFF32',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
