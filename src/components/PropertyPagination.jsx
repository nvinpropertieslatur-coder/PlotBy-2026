import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../browse/components/ui';
import { colors, radius, spacing } from '../browse/theme';

function pageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const values = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...values].filter(value => value >= 1 && value <= total).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((value, index) => { if (index && value - sorted[index - 1] > 1) result.push(`gap-${value}`); result.push(value); });
  return result;
}

export default function PropertyPagination({ currentPage, totalPages, totalItems, pageSize = 10, onPageChange }) {
  if (!totalItems) return null;
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const move = page => { if (page >= 1 && page <= totalPages && page !== currentPage) onPageChange(page); };
  return <View style={styles.panel}>
    <View style={styles.summary}><AppText style={styles.pageText}>Page {currentPage} of {totalPages}</AppText><AppText muted variant="caption">Showing {start}–{end} of {totalItems} properties</AppText></View>
    <View style={styles.controls}><PageButton label="Previous" disabled={currentPage === 1} onPress={() => move(currentPage - 1)} />
      {pageItems(currentPage, totalPages).map(item => typeof item === 'number' ? <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: item === currentPage }} onPress={() => move(item)} style={[styles.number, item === currentPage && styles.activeNumber]}><AppText style={item === currentPage ? styles.activeText : undefined}>{item}</AppText></Pressable> : <AppText key={item} muted>…</AppText>)}
      <PageButton label="Next" disabled={currentPage === totalPages} onPress={() => move(currentPage + 1)} /></View>
  </View>;
}
function PageButton({ label, disabled, onPress }) { return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[styles.nav, disabled && styles.disabled]}><AppText variant="caption" style={disabled ? styles.disabledText : undefined}>{label}</AppText></Pressable>; }
const styles = StyleSheet.create({ panel: { gap: spacing.sm, padding: spacing.md, marginVertical: spacing.md, borderRadius: radius.lg, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }, summary: { alignItems: 'center', gap: 2 }, pageText: { color: colors.primary, fontWeight: '800' }, controls: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: spacing.xs }, nav: { minHeight: 38, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border }, disabled: { opacity: 0.35 }, disabledText: { color: colors.muted }, number: { minWidth: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: colors.surface }, activeNumber: { backgroundColor: colors.primary }, activeText: { color: colors.background, fontWeight: '800' } });
