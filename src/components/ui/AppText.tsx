import { Text, type TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@/src/theme';
type Variant = keyof typeof typography;
export function AppText({ variant = 'body', muted = false, style, ...props }: TextProps & { variant?: Variant; muted?: boolean }) { return <Text accessibilityRole="text" style={[styles.base, typography[variant], muted && styles.muted, style]} {...props} />; }
const styles = StyleSheet.create({ base: { color: colors.text }, muted: { color: colors.muted } });
