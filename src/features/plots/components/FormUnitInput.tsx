import type { FieldPath } from 'react-hook-form'; import { FormTextInput } from './FormTextInput'; import type { PlotFormValues } from '../form';
export function FormUnitInput({ name, label, unit }: { name: FieldPath<PlotFormValues>; label: string; unit: string }) { return <FormTextInput name={name} label={label} unit={unit} variant="icon-unit" keyboardType="decimal-pad" />; }
