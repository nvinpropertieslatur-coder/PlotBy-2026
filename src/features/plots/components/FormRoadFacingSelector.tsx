import { useController } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppInput, AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/theme';
import type { PlotFormValues, RoadDirection, RoadSide } from '../form';

export const ROAD_DIRECTIONS: readonly RoadDirection[] = ['north', 'south', 'east', 'west'];

export function toggleRoadDirection(sides: RoadSide[], direction: RoadDirection): RoadSide[] {
  return sides.some((side) => side.direction === direction)
    ? sides.filter((side) => side.direction !== direction)
    : [...sides, { direction, widthFt: '' }];
}

export function updateRoadWidth(sides: RoadSide[], direction: RoadDirection, widthFt: string): RoadSide[] {
  return sides.map((side) => side.direction === direction ? { ...side, widthFt } : side);
}

export function FormRoadFacingSelector() {
  const { field, fieldState } = useController<PlotFormValues, 'roadFacingSides'>({ name: 'roadFacingSides' });
  const sides = field.value ?? [];
  const roadErrors = fieldState.error as unknown as { widthFt?: { message?: string } }[] | undefined;
  return <View style={styles.container}>
    <AppText variant="label">Road-facing directions *</AppText>
    <AppText variant="caption" muted>Select every side that has road access.</AppText>
    {ROAD_DIRECTIONS.map((direction) => {
      const index = sides.findIndex((candidate) => candidate.direction === direction);
      const side = index >= 0 ? sides[index] : undefined;
      const selected = Boolean(side);
      return <View key={direction} style={styles.row}>
        <Pressable accessibilityRole="checkbox" accessibilityLabel={`${direction} road-facing side`} accessibilityState={{ checked: selected }} onPress={() => field.onChange(toggleRoadDirection(sides, direction))} style={[styles.choice, selected && styles.choiceSelected]}>
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>{selected ? <AppText style={styles.checkmark}>✓</AppText> : null}</View>
          <AppText style={selected ? styles.choiceTextSelected : undefined}>{direction[0].toUpperCase() + direction.slice(1)}</AppText>
        </Pressable>
        {side ? <View style={styles.width}><AppInput accessibilityLabel={`${direction} road width in feet`} value={side.widthFt} onChangeText={(value) => field.onChange(updateRoadWidth(sides, direction, value))} onBlur={field.onBlur} keyboardType="decimal-pad" variant="icon-unit" unit="ft" placeholder="Width" error={roadErrors?.[index]?.widthFt?.message} /></View> : null}
      </View>;
    })}
    {fieldState.error?.message ? <AppText variant="caption" style={styles.error}>{fieldState.error.message}</AppText> : null}
  </View>;
}

const styles = StyleSheet.create({ container: { gap: spacing.sm }, row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }, choice: { minHeight: 52, minWidth: 128, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface }, choiceSelected: { borderColor: colors.primary, backgroundColor: colors.elevated }, checkbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, checkboxSelected: { borderColor: colors.primary, backgroundColor: colors.primary }, checkmark: { color: colors.background, lineHeight: 18 }, choiceTextSelected: { color: colors.primary }, width: { flex: 1 }, error: { color: colors.error } });
