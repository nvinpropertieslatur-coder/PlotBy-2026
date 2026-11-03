import { Alert, Platform } from 'react-native';

/** React Native's Alert buttons have no browser implementation. */
export function showSuccessMessage(title: string, message: string, onContinue: () => void) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    onContinue();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onContinue }]);
  }
}
