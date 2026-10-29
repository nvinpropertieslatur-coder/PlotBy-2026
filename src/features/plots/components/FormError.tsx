import { AppText } from '@/src/components/ui'; import { colors } from '@/src/theme';
export function FormError({ message }: { message?: string }) { return message ? <AppText accessibilityLiveRegion="polite" variant="caption" style={{ color: colors.error }}>{message}</AppText> : null; }
