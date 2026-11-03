import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native'; import { AppEmptyState, AppHeader } from '@/src/browse/components/ui'; import { colors, spacing } from '@/src/browse/theme';
export default function OffersScreen() { return <SafeAreaView edges={['top']} style={styles.container}><AppHeader title="Offers" subtitle="Value picks with special pricing" /><AppEmptyState title="Offers are coming soon" message="Discounted plots will be available in a later phase." /></SafeAreaView>; }
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, gap: spacing.xl } });
