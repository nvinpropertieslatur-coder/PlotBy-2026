import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '../../components/ui';
import { numberField, type Range } from './filters';

export const green = '#7CFF3D';
export const background = '#0F1211';
export const border = '#FFFFFF25';

export function Choice({ label, selected = false, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}
    style={({ pressed }) => [styles.choice, selected && styles.selected, pressed && styles.pressed]}>
    <AppText style={selected ? styles.selectedText : undefined}>{label}</AppText>
  </Pressable>;
}

export function FilterInput({ label, value, onChange, numeric = false }: {
  label: string; value: string; onChange: (value: string) => void; numeric?: boolean;
}) {
  return <TextInput accessibilityLabel={label} placeholder={label} placeholderTextColor="#A5AEA7"
    keyboardType={numeric ? 'decimal-pad' : 'default'} value={value} onChangeText={onChange} style={styles.input} />;
}

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

function PriceSlider({ label, value, limit, onChange }: {
  label: string; value: number; limit: number; onChange: (value: number) => void;
}) {
  const [width, setWidth] = useState(0);
  const dragStart = useRef({ pageX: 0, localX: 0 });
  const bounded = Math.max(0, Math.min(limit, value));
  const move = (x: number) => {
    if (width > 0) onChange(Math.round(Math.max(0, Math.min(1, x / width)) * limit));
  };
  return <View>
    <AppText variant="caption" muted>{label} · {money(bounded)}</AppText>
    <View accessible accessibilityRole="adjustable" accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: limit, now: bounded, text: money(bounded) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={({ nativeEvent }) => onChange(Math.max(0, Math.min(limit,
        bounded + (nativeEvent.actionName === 'increment' ? 1 : -1) * Math.max(1, Math.round(limit / 100)))))}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onResponderGrant={({ nativeEvent }) => {
        dragStart.current = { pageX: nativeEvent.pageX, localX: nativeEvent.locationX };
        move(nativeEvent.locationX);
      }}
      onResponderMove={({ nativeEvent }) => move(dragStart.current.localX + nativeEvent.pageX - dragStart.current.pageX)}
      onResponderTerminationRequest={() => false} style={styles.slider}>
      <View pointerEvents="none" style={styles.track}>
        <View style={[styles.fill, { width: `${bounded / limit * 100}%` }]} />
        <View style={[styles.thumb, { left: `${bounded / limit * 100}%` }]} />
      </View>
    </View>
  </View>;
}

export function RangeFields({ label, value, onChange, limit = 0, price = false }: {
  label: string; value: Range; onChange: (value: Range) => void; limit?: number; price?: boolean;
}) {
  const min = numberField(value.min) ?? 0, max = numberField(value.max) ?? limit;
  return <View style={styles.range}>
    <AppText variant="title">{label}</AppText>
    {limit > 0 && <>
      <PriceSlider label="Minimum" value={min} limit={limit}
        onChange={next => onChange({ ...value, min: String(value.max ? Math.min(max, next) : next) })} />
      <PriceSlider label="Maximum" value={max} limit={limit}
        onChange={next => onChange({ ...value, max: String(Math.max(min, next)) })} />
    </>}
    <View style={styles.rangeInputs}>
      <View style={styles.flex}><FilterInput label={price ? 'Min ₹' : 'Minimum'} value={value.min} numeric
        onChange={min => onChange({ ...value, min })} /></View>
      <View style={styles.flex}><FilterInput label={price ? 'Max ₹' : 'Maximum'} value={value.max} numeric
        onChange={max => onChange({ ...value, max })} /></View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  choice: { minHeight: 44, justifyContent: 'center', backgroundColor: '#FFFFFF10', borderColor: border,
    borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7 },
  selected: { borderColor: green, backgroundColor: '#7CFF3D20' },
  selectedText: { color: '#A8FF60', fontWeight: '700' },
  pressed: { opacity: 0.7 },
  input: { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: border, backgroundColor: '#FFFFFF10',
    paddingHorizontal: 10, color: '#FFFFFF', fontSize: 14 },
  slider: { height: 40, justifyContent: 'center', marginHorizontal: 9 },
  track: { height: 4, borderRadius: 4, backgroundColor: '#FFFFFF30' },
  fill: { height: 4, backgroundColor: green, borderRadius: 4 },
  thumb: { position: 'absolute', width: 18, height: 18, marginLeft: -9, top: -7, borderRadius: 9,
    backgroundColor: green, shadowColor: green, shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
  range: { gap: 8, padding: 10, borderWidth: 1, borderColor: border, borderRadius: 16, backgroundColor: '#FFFFFF08' },
  rangeInputs: { flexDirection: 'row', gap: 6 },
  flex: { flex: 1 },
});
