import { memo, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/src/components/ui';
import type { Plot } from '@/src/features/map/types';
import { colors, radius, spacing } from '@/src/theme';
import { formatINR, formatPlotArea, formatRatePerSqft } from '../utils/formatters';

const PropertyListCard = memo(function PropertyListCard({ plot, onPress }: { plot: Plot; onPress: (id: string) => void }) {
  const price = plot.finalAmount ?? plot.areaSqft * plot.ratePerSqft;
  return <Pressable accessibilityRole="button" accessibilityLabel="View plot details" onPress={() => onPress(plot.id)} style={styles.card}><View style={styles.row}><AppText style={styles.badge}>{plot.naType || 'Plot'}</AppText><AppText style={styles.price}>{formatINR(price)}</AppText></View><AppText variant="title" numberOfLines={1}>Plot</AppText><AppText muted numberOfLines={1}>{plot.locality || plot.address || 'Locality not provided'}</AppText><AppText variant="caption" muted>{formatPlotArea(plot.areaSqft)} · {formatRatePerSqft(plot.ratePerSqft)}</AppText><AppText variant="caption" muted>{plot.primaryFacing ? `${plot.primaryFacing} facing` : 'Facing not provided'} · {plot.roadWidths?.length ? `${plot.roadWidths[0]} road` : 'Road width not provided'}</AppText></Pressable>;
});

export function PropertyList({ plots, onPressPlot, headerHeight }: { plots: readonly Plot[]; onPressPlot: (id: string) => void; headerHeight: number }) {
  const renderItem = useCallback(({ item }: { item: Plot }) => <PropertyListCard plot={item} onPress={onPressPlot} />, [onPressPlot]);
  return <FlatList data={plots} renderItem={renderItem} keyExtractor={(plot) => plot.id} contentContainerStyle={[styles.list, { paddingTop: headerHeight + spacing.xxl }]} ListHeaderComponent={<View style={styles.heading}><AppText variant="title">Available Plots</AppText><AppText muted>{plots.length} {plots.length === 1 ? 'plot' : 'plots'}</AppText></View>} ListEmptyComponent={<AppText muted>No plots available in this city.</AppText>} />;
}

const styles = StyleSheet.create({ list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl * 3, gap: spacing.md }, heading: { gap: spacing.xs, marginBottom: spacing.sm }, card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.xs }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }, badge: { color: colors.primary, fontSize: 12, fontWeight: '700', flexShrink: 1 }, price: { color: colors.primary, fontWeight: '800' } });
