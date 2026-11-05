import { StyleSheet, View } from 'react-native';
import { Sprout } from 'lucide-react-native';
import { AppText } from '../../components/ui';
import { border, Choice, green } from './FilterControls';

export const noAgricultureTitle = 'No Agriculture Land Added Yet';
export const noAgricultureMatches = 'No matching agriculture lands found';

export function AgricultureEmptyState({ hasListings, onClear }: { hasListings: boolean; onClear: () => void }) {
  return <View style={styles.card}>
    <View style={styles.icon}><Sprout color={green} size={28} /></View>
    <AppText accessibilityRole="header" variant="title" style={styles.center}>{hasListings ? noAgricultureMatches : noAgricultureTitle}</AppText>
    {hasListings ? <Choice label="Clear Filters" onPress={onClear} /> :
      <AppText muted style={styles.center}>Agricultural properties will appear here once owners start adding their land listings.</AppText>}
  </View>;
}

const styles = StyleSheet.create({
  card: { width: '84%', maxWidth: 360, padding: 18, gap: 10, alignItems: 'center', borderRadius: 20,
    backgroundColor: '#0F1211F2', borderColor: border, borderWidth: 1 },
  icon: { padding: 10, backgroundColor: '#7CFF3D20', borderRadius: 24 },
  center: { textAlign: 'center' },
});
