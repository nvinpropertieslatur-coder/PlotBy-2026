import { View, StyleSheet } from 'react-native'; import { AppText } from './AppText'; import { colors, spacing } from '@/src/theme';
export function AppEmptyState({ title, message }: { title: string; message?: string }) { return <View style={styles.container}><AppText variant="title">{title}</AppText>{message && <AppText muted style={styles.message}>{message}</AppText>}</View>; }
const styles = StyleSheet.create({ container: { padding: spacing.xxxl, alignItems: 'center', gap: spacing.sm }, message: { color: colors.muted, textAlign: 'center' } });
