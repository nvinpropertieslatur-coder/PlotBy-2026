import { ActivityIndicator, View, StyleSheet } from 'react-native'; import { colors } from '@/src/theme';
export function AppLoader({ label = 'Loading' }: { label?: string }) { return <View accessibilityLabel={label} accessibilityRole="progressbar" style={styles.container}><ActivityIndicator color={colors.primary} size="large" /></View>; }
const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
