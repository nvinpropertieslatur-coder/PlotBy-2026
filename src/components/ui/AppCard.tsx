import { View, StyleSheet, type ViewProps } from 'react-native'; import { colors, radius, spacing } from '@/src/theme';
export function AppCard({ children, elevated = false, style, ...props }: ViewProps & { elevated?: boolean }) { return <View style={[styles.base, elevated && styles.elevated, style]} {...props}>{children}</View>; }
const styles = StyleSheet.create({ base: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg }, elevated: { backgroundColor: colors.elevated } });
