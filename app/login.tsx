import { useState } from 'react';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppHeader, AppInput, AppText } from '@/src/components/ui';
import { isValidIndianMobile, normalizeIndianMobile, useAuth } from '@/src/features/auth';
import { colors, spacing } from '@/src/theme';

function OtpForm({ phone, onBack, onComplete }: { phone: string; onBack: () => void; onComplete: () => void }) {
  const { verifyOtp } = useAuth();
  const [token, setToken] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const verify = async () => { setLoading(true); setError(''); try { await verifyOtp(phone, token); onComplete(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to verify the code.'); } finally { setLoading(false); } };
  return <AppCard elevated><AppText variant="title">Enter test OTP</AppText><AppText muted>A code was requested for +91 {phone}. Use the test OTP configured in Supabase Auth.</AppText><AppInput label="OTP code" accessibilityLabel="OTP code" keyboardType="numeric" maxLength={6} value={token} onChangeText={(value) => setToken(value.replace(/\D/g, ''))} error={error || undefined} /><AppButton title="Verify and continue" loading={loading} disabled={token.length !== 6} onPress={verify} fullWidth /><AppButton title="Use another number" variant="ghost" onPress={onBack} fullWidth /></AppCard>;
}

export default function LoginScreen() {
  const router = useRouter(); const { enterPreview, previewEnabled, requestOtp, supabaseConfigured } = useAuth();
  const [phone, setPhone] = useState(''); const [otpRequested, setOtpRequested] = useState(false); const [loading, setLoading] = useState<'preview' | 'otp' | null>(null); const [error, setError] = useState('');
  const normalized = normalizeIndianMobile(phone); const valid = isValidIndianMobile(normalized); const complete = () => router.replace('/(tabs)');
  const preview = async () => { setLoading('preview'); setError(''); try { await enterPreview(normalized); complete(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to enter preview.'); } finally { setLoading(null); } };
  const otp = async () => { setLoading('otp'); setError(''); try { await requestOtp(normalized); setOtpRequested(true); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to request an OTP.'); } finally { setLoading(null); } };
  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.container}><AppHeader title="Mobile login" subtitle="Sign in to manage Plotby listings" />{otpRequested ? <OtpForm phone={normalized} onBack={() => setOtpRequested(false)} onComplete={complete} /> : <AppCard elevated><AppText variant="title">Your mobile number</AppText><View style={styles.phoneRow}><View style={styles.code}><AppText>+91</AppText></View><View style={styles.phoneInput}><AppInput label="Mobile number" accessibilityLabel="10-digit Indian mobile number" keyboardType="phone-pad" maxLength={10} value={normalized} onChangeText={setPhone} error={error || undefined} /></View></View><AppButton title="Continue with OTP" loading={loading === 'otp'} disabled={!valid || !supabaseConfigured} onPress={otp} fullWidth />{!supabaseConfigured && <AppText variant="caption" muted>Configure Supabase to use real test-phone authentication.</AppText>}{previewEnabled && <><AppText variant="caption" muted>Development preview is local and unverified. Protected actions remain locked.</AppText><AppButton title="Continue in development preview" variant="outline" loading={loading === 'preview'} disabled={!valid} onPress={preview} fullWidth /></>}</AppCard>}<AppButton title="Continue as guest" variant="ghost" onPress={complete} /></View></KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, flex: { flex: 1 }, container: { flex: 1, padding: spacing.xl, gap: spacing.xl, justifyContent: 'center' }, phoneRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }, code: { minHeight: 52, minWidth: 64, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 12 }, phoneInput: { flex: 1 } });
