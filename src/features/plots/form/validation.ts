import type { FieldErrors } from 'react-hook-form';
import { plotFormSchema } from './schema';
import { plotFormSteps } from './steps';
import type { PlotFormValues } from './types';

export function getFirstInvalidStep(errors: FieldErrors<PlotFormValues> | Record<string, unknown>): number | undefined {
  const errorMap = errors as Record<string, unknown>;
  const index = plotFormSteps.findIndex((step) => step.fields.some((field) => Boolean(errorMap[field as string])));
  return index >= 0 ? index : undefined;
}

export function validatePlotForm(values: PlotFormValues) {
  const result = plotFormSchema.safeParse(values);
  const firstInvalidStep = result.success ? undefined : getFirstInvalidStep(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue])));
  return { isPublishReady: result.success, firstInvalidStep, result };
}
