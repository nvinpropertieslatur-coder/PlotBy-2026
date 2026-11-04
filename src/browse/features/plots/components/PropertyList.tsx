import { memo, useCallback, type ReactElement } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/src/browse/components/ui';
import type { Plot } from '@/src/browse/features/map/types';
import { colors, radius, spacing } from '@/src/browse/theme';
import { formatINR, formatPlotArea, formatRatePerSqft } from '../utils/formatters';

const PropertyListCard = memo(function PropertyListCard({ plot, onPress }: { plot: Plot; onPress: (id: string) => void }) {
  const price = plot.finalAmount ?? plot.areaSqft * plot.ratePerSqft;
  return <View style={styles.card}><View style={styles.row}><AppText style={styles.badge}>{plot.propertyType || plot.naType || 'Property'}</AppText><AppText style={styles.price}>{formatINR(price)}</AppText></View><AppText variant="title" numberOfLines={1}>{plot.propertyType || 'Property'}</AppText><AppText muted numberOfLines={1}>{plot.locality || plot.address || 'Locality not provided'}</AppText><AppText variant="caption" muted>{formatPlotArea(plot.areaSqft)} · {formatRatePerSqft(plot.ratePerSqft)}</AppText><AppText variant="caption" muted>{plot.primaryFacing ? `${plot.primaryFacing} facing` : 'Facing not provided'} · {plot.roadWidths?.length ? `${plot.roadWidths[0]} road` : 'Road width not provided'}</AppText><Pressable accessibilityRole="button" accessibilityLabel="View Plot" onPress={() => onPress(plot.id)} style={styles.viewButton}><AppText style={styles.viewButtonText}>View Plot</AppText></Pressable></View>;
});

export function PropertyList({ plots, onPressPlot, headerHeight, footer }: { plots: readonly Plot[]; onPressPlot: (id: string) => void; headerHeight: number; footer?: ReactElement }) {
  const renderItem = useCallback(({ item }: { item: Plot }) => <PropertyListCard plot={item} onPress={onPressPlot} />, [onPressPlot]);
  return <FlatList data={plots} renderItem={renderItem} keyExtractor={(plot) => plot.id} contentContainerStyle={[styles.list, { paddingTop: headerHeight + spacing.xxl }]} ListHeaderComponent={<View style={styles.heading}><AppText variant="title">Available Properties</AppText><AppText muted>{plots.length} on this page</AppText></View>} ListFooterComponent={footer} ListEmptyComponent={<AppText muted>No properties found.</AppText>} />;
}

const styles = StyleSheet.create({ list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl * 3, gap: spacing.md }, heading: { gap: spacing.xs, marginBottom: spacing.sm }, card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.xs }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }, badge: { color: colors.primary, fontSize: 12, fontWeight: '700', flexShrink: 1 }, price: { color: colors.primary, fontWeight: '800' }, viewButton: { alignSelf: 'flex-start', marginTop: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 999, backgroundColor: colors.primary }, viewButtonText: { color: colors.background, fontWeight: '800' } });
