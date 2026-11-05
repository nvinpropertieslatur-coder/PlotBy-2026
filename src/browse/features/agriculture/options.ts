export const agricultureOptions = {
  roadAccess: ['Samaiik Road', 'Kachha Road', 'Dambari Road', 'Highway Access'],
  landType: ['Kali', 'Malran'],
  waterSource: ['Bor', 'Vihir', 'Cannel'],
} as const;

export const agricultureOptionLabels = {
  roadAccess: 'Road Access',
  landType: 'Land Type',
  waterSource: 'Water Source',
} as const;

export type AgricultureOption = keyof typeof agricultureOptions;
export type AgricultureDetails = Record<AgricultureOption, string[]> & { state: string; town: string };
export const agricultureOptionKeys = Object.keys(agricultureOptions) as AgricultureOption[];

export function agricultureDetails(value: unknown): AgricultureDetails {
  const data = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const options = (key: AgricultureOption) => {
    const stored = data[key];
    return Array.isArray(stored) ? agricultureOptions[key].filter(option => stored.includes(option)) : [];
  };
  return {
    state: typeof data.state === 'string' ? data.state.trim() : '',
    town: typeof data.town === 'string' ? data.town.trim() : '',
    roadAccess: options('roadAccess'),
    landType: options('landType').slice(0, 1),
    waterSource: options('waterSource'),
  };
}

export function toggleAgricultureOption(key: AgricultureOption, selected: string[], option: string, single = false) {
  if (selected.includes(option)) return selected.filter(item => item !== option);
  return single && key === 'landType' ? [option] : [...selected, option];
}
