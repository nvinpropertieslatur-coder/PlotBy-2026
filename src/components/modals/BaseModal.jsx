import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  BackHandler,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BaseModal({
  visible,
  onClose,
  children,
  dismissible = true,
  position = 'center', // 'center' | 'bottom'
}) {
  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (dismissible && onClose) {
        onClose();
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [visible, dismissible, onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (dismissible && onClose) onClose();
      }}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={() => {
            if (dismissible && onClose) onClose();
          }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss modal backdrop"
        />
        <SafeAreaView
          style={[
            styles.container,
            position === 'bottom' ? styles.containerBottom : styles.containerCenter,
          ]}
          edges={['top', 'bottom', 'left', 'right']}
          pointerEvents="box-none"
        >
          {children}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  containerCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerBottom: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
