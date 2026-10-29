import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import { canEnterDevelopmentPreview, isValidIndianMobile, normalizeIndianMobile, toE164IndianMobile, type IdentityState } from './types';

const PREVIEW_KEY = '@plotby/development-preview-phone';
const previewEnabled = __DEV__ && process.env.EXPO_PUBLIC_ENABLE_AUTH_PREVIEW === 'true';

type AuthContextValue = {
  identity: IdentityState;
  initializing: boolean;
  previewEnabled: boolean;
  supabaseConfigured: boolean;
  enterPreview(phone: string): Promise<void>;
  exitPreview(): Promise<void>;
  requestOtp(phone: string): Promise<void>;
  verifyOtp(phone: string, token: string): Promise<void>;
  signOut(): Promise<void>;
  requireAuthenticated(): boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [previewPhone, setPreviewPhone] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([supabase?.auth.getSession(), previewEnabled ? AsyncStorage.getItem(PREVIEW_KEY) : Promise.resolve(null)])
      .then(([sessionResult, storedPreview]) => {
        if (!active) return;
        setSession(sessionResult?.data.session ?? null);
        setPreviewPhone(storedPreview);
      })
      .finally(() => { if (active) setInitializing(false); });
    const authSubscription = supabase?.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession)).data.subscription;
    const authClient = supabase;
    const appStateSubscription = Platform.OS === 'web' || !authClient ? undefined : AppState.addEventListener('change', (state) => {
      if (state === 'active') authClient.auth.startAutoRefresh();
      else authClient.auth.stopAutoRefresh();
    });
    return () => { active = false; authSubscription?.unsubscribe(); appStateSubscription?.remove(); };
  }, []);

  const enterPreview = useCallback(async (phone: string) => {
    if (!previewEnabled) throw new Error('Development preview login is disabled.');
    if (!canEnterDevelopmentPreview(Boolean(session))) throw new Error('Sign out of your authenticated account before entering development preview.');
    if (!isValidIndianMobile(phone)) throw new Error('Enter a valid 10-digit Indian mobile number.');
    const normalized = normalizeIndianMobile(phone);
    await AsyncStorage.setItem(PREVIEW_KEY, normalized);
    setPreviewPhone(normalized);
  }, [session]);
  const exitPreview = useCallback(async () => { await AsyncStorage.removeItem(PREVIEW_KEY); setPreviewPhone(null); }, []);
  const requestOtp = useCallback(async (phone: string) => {
    if (!isValidIndianMobile(phone)) throw new Error('Enter a valid 10-digit Indian mobile number.');
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithOtp({ phone: toE164IndianMobile(phone) });
    if (error) throw error;
  }, []);
  const verifyOtp = useCallback(async (phone: string, token: string) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.verifyOtp({ phone: toE164IndianMobile(phone), token, type: 'sms' });
    if (error) throw error;
    await exitPreview();
  }, [exitPreview]);
  const signOut = useCallback(async () => { if (supabase) await supabase.auth.signOut(); }, []);
  const identity = useMemo<IdentityState>(() => session ? { kind: 'authenticated', user: session.user, session } : previewPhone ? { kind: 'preview', phone: previewPhone } : { kind: 'guest' }, [previewPhone, session]);
  const value = useMemo<AuthContextValue>(() => ({ identity, initializing, previewEnabled, supabaseConfigured: isSupabaseConfigured, enterPreview, exitPreview, requestOtp, verifyOtp, signOut, requireAuthenticated: () => identity.kind === 'authenticated' }), [enterPreview, exitPreview, identity, initializing, requestOtp, signOut, verifyOtp]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
