import { StyleSheet, View } from 'react-native';
import { AppText } from '../../components/ui';
import { Choice, FilterInput } from './FilterControls';
import { agricultureOptionKeys, agricultureOptionLabels, agricultureOptions, toggleAgricultureOption,
  type AgricultureDetails, type AgricultureOption } from './options';

export function AgricultureOptionGroup({ field, selected, onChange, single = false }: {
  field: AgricultureOption; selected: string[]; onChange: (values: string[]) => void; single?: boolean;
}) {
  return <View style={styles.chips}>{agricultureOptions[field].map(option =>
    <Choice key={option} label={option} selected={selected.includes(option)}
      onPress={() => onChange(toggleAgricultureOption(field, selected, option, single))} />)}</View>;
}

export function AgricultureListingFields({ value, onChange }: {
  value: AgricultureDetails; onChange: (value: AgricultureDetails) => void;
}) {
  return <View style={styles.fields}>
    <AppText variant="title">Agriculture details</AppText>
    <FilterInput label="State" value={value.state} onChange={state => onChange({ ...value, state })} />
    <FilterInput label="Town" value={value.town} onChange={town => onChange({ ...value, town })} />
    {agricultureOptionKeys.map(field => <View key={field} style={styles.fields}>
      <AppText>{agricultureOptionLabels[field]}</AppText>
      <AgricultureOptionGroup field={field} selected={value[field]} single={field === 'landType'}
        onChange={options => onChange({ ...value, [field]: options })} />
    </View>)}
  </View>;
}

const styles = StyleSheet.create({
  fields: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
