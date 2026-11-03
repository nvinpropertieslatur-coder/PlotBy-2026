import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Session } from '@supabase/supabase-js';
import type { PropertyReturnTarget, RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { checkPropertyOwnership } from '../services/propertyService';
import { colors, spacing } from '../browse/theme';

export function RequirePropertyAccess({ returnTo, children }: { returnTo: PropertyReturnTarget; children: ReactNode }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [approvedUserId, setApprovedUserId] = useState<string>();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  const requestId = useRef(0);
  const userId = session?.user.id;

  useEffect(() => {
    let active = true;
    let revision = 0;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      revision++;
      if (active) { setSession(next); setInitialized(true); }
    });
    const initialRevision = revision;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (active && revision === initialRevision) { setSession(data.session); setInitialized(true); if (error) setMessage(error.message); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const check = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setChecking(true); setMessage('');
    try { await checkPropertyOwnership(); if (currentRequest === requestId.current) setApprovedUserId(userId); }
    catch (reason) { if (currentRequest === requestId.current) { setApprovedUserId(undefined); setMessage(reason instanceof Error ? reason.message : 'Unable to check property access. Try again.'); } }
    finally { if (currentRequest === requestId.current) setChecking(false); }
  }, [userId]);
  useFocusEffect(useCallback(() => {
    if (userId) void check();
    return () => { requestId.current++; };
  }, [userId, check]));

  if (initialized && userId && approvedUserId === userId) return children;
  const busy = !initialized || (!!userId && checking);
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.lg }}>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>{returnTo === 'AddProperty' ? 'Add Property' : 'My Properties'}</Text>
      {busy ? <ActivityIndicator color={colors.primary} /> : <>
        <Text style={{ color: colors.muted }}>{session ? message : 'Sign in to add and manage your own properties.'}</Text>
        <Pressable accessibilityRole="button" onPress={() => session ? void check() : navigation.navigate('SignIn', { returnTo })} style={{ padding: 16, borderRadius: 16, backgroundColor: colors.primary }}>
          <Text style={{ color: colors.background, fontWeight: '700' }}>{session ? 'Try again' : 'Sign In'}</Text>
        </Pressable>
      </>}
      <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={{ padding: 12 }}><Text style={{ color: colors.primary }}>Back</Text></Pressable>
    </View>
  </SafeAreaView>;
}
