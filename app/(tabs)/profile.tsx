import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { AppButton, AppCard, AppEmptyState, AppHeader, AppLoader, AppText } from '@/src/components/ui';
import { useAuth } from '@/src/features/auth';
import type { Plot } from '@/src/features/map/types';
import { getFavoritePlots, getMyPlots } from '@/src/features/plots/repository';
import { formatINR, formatPlotArea } from '@/src/features/plots/utils/formatters';
import { colors, spacing } from '@/src/theme';

function PlotLink({ plot, onPress }: { plot: Plot; onPress: () => void }) {
  return <AppButton title={`${plot.status === 'draft' ? 'Draft · ' : ''}${formatPlotArea(plot.areaSqft)} · ${formatINR(plot.finalAmount)}`} variant="secondary" onPress={onPress} fullWidth />;
}

export default function ProfileScreen() {
  const router = useRouter(); const { identity, initializing, exitPreview, signOut } = useAuth();
  const [plots, setPlots] = useState<Plot[]>([]); const [favorites, setFavorites] = useState<Plot[]>([]); const [loadingPlots, setLoadingPlots] = useState(false); const [plotError, setPlotError] = useState('');
  const loadPlots = useCallback(() => {
    if (identity.kind !== 'authenticated') { setPlots([]); setFavorites([]); return; }
    setLoadingPlots(true); setPlotError('');
    void Promise.all([getMyPlots(), getFavoritePlots()]).then(([myPlots, favoritePlots]) => { setPlots(myPlots); setFavorites(favoritePlots); }).catch((error: unknown) => setPlotError(error instanceof Error ? error.message : 'Unable to load profile listings.')).finally(() => setLoadingPlots(false));
  }, [identity.kind]);
  useFocusEffect(useCallback(() => { loadPlots(); }, [loadPlots]));
  const requireAccount = (action: () => void) => { if (identity.kind === 'authenticated') action(); else Alert.alert('Verified account required', 'Development preview and guest access cannot create or change protected records.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign in', onPress: () => router.push('/login') }]); };
  if (initializing) return <View style={styles.screen}><AppLoader label="Loading account" /></View>;
  const accountCopy = identity.kind === 'authenticated' ? identity.user.phone ?? 'Authenticated Supabase user' : identity.kind === 'preview' ? `+91 ${identity.phone} · unverified development preview` : 'Browse as a guest or sign in to manage listings.';
  return <ScrollView contentContainerStyle={styles.container}><AppHeader title="Profile" subtitle="Manage your account and listings" /><AppCard><AppText variant="title">Your account</AppText><AppText muted style={styles.copy}>{accountCopy}</AppText>{identity.kind === 'guest' && <AppButton title="Mobile login" onPress={() => router.push('/login')} fullWidth />}{identity.kind === 'preview' && <><AppButton title="Authenticate with OTP" onPress={() => router.push('/login')} fullWidth /><AppButton title="Exit Preview" variant="ghost" onPress={() => void exitPreview()} fullWidth /></>}{identity.kind === 'authenticated' && <AppButton title="Logout" variant="ghost" onPress={() => void signOut()} fullWidth />}</AppCard><AppCard><AppText variant="title">Add Property</AppText><AppText muted style={styles.copy}>Only plot listings are supported in this release.</AppText><AppButton title="Add Plot" onPress={() => requireAccount(() => router.push('/add-property'))} fullWidth /></AppCard><AppCard><View style={styles.headingRow}><AppText variant="title">My Properties</AppText>{identity.kind === 'authenticated' && <AppButton title="Refresh" size="sm" variant="ghost" onPress={loadPlots} />}</View>{identity.kind !== 'authenticated' ? <AppText muted>A verified account is required to view your properties.</AppText> : loadingPlots ? <AppLoader label="Loading your properties" /> : plotError ? <AppText style={styles.error}>{plotError}</AppText> : plots.length ? plots.map((plot) => <PlotLink key={plot.id} plot={plot} onPress={() => router.push(`/plot/${plot.id}`)} />) : <AppEmptyState title="No properties yet" message="Your saved plots will appear here." />}</AppCard><AppCard><AppText variant="title">Favorites</AppText>{identity.kind !== 'authenticated' ? <AppText muted>Sign in to save and view favorite plots.</AppText> : loadingPlots ? <AppLoader label="Loading favorites" /> : favorites.length ? favorites.map((plot) => <PlotLink key={plot.id} plot={plot} onPress={() => router.push(`/plot/${plot.id}`)} />) : <AppText muted>No favorite plots yet.</AppText>}</AppCard><AppCard><AppText variant="title">Account Settings</AppText><AppText muted>Profile settings will be available in a later phase.</AppText></AppCard></ScrollView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing.xl, gap: spacing.xl }, copy: { marginVertical: spacing.md }, headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }, error: { color: colors.error } });
