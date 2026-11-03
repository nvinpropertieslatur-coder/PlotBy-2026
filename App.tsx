import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/appnavigator';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { supabase } from './src/lib/supabase';
export default function App() {
 useEffect(() => {
  if (Platform.OS === 'web') return;
  if (AppState.currentState === 'active') supabase.auth.startAutoRefresh();
  const subscription = AppState.addEventListener('change', state => {
   if (state === 'active') supabase.auth.startAutoRefresh();
   else supabase.auth.stopAutoRefresh();
  });
  return () => { subscription.remove(); supabase.auth.stopAutoRefresh(); };
 }, []);
 return <SafeAreaProvider><NavigationContainer><AppNavigator /></NavigationContainer></SafeAreaProvider>;
}
