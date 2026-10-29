import { StyleSheet, View } from 'react-native'; import { AppEmptyState, AppHeader } from '@/src/components/ui'; import { colors, spacing } from '@/src/theme';
export default function OffersScreen() { return <View style={styles.container}><AppHeader title="Offers" subtitle="Value picks with special pricing" /><AppEmptyState title="Offers are coming soon" message="Discounted plots will be available in a later phase." /></View>; }
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, gap: spacing.xl } });
