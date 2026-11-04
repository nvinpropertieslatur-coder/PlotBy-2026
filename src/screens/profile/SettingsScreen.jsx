import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../../browse/components/ui';
import { colors, radius, spacing } from '../../browse/theme';

export default function SettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  return <SafeAreaView style={styles.screen} edges={['top']}><ScrollView contentContainerStyle={styles.content}>
    <Pressable onPress={() => navigation.goBack()}><AppText style={styles.back}>‹ Back</AppText></Pressable>
    <AppText variant="title">Settings</AppText><AppText muted>Manage your PlotBy preferences.</AppText>
    <View style={styles.card}><View style={styles.row}><View><AppText>Notifications</AppText><AppText muted variant="caption">Property and account updates</AppText></View><Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.text} /></View>
      <Pressable style={styles.option} onPress={() => navigation.navigate('Help')}><AppText>Help & Support</AppText><AppText muted>›</AppText></Pressable>
      <Pressable style={styles.option} onPress={() => navigation.navigate('Privacy')}><AppText>Privacy Policy</AppText><AppText muted>›</AppText></Pressable>
      <Pressable style={styles.option} onPress={() => navigation.navigate('Terms')}><AppText>Terms & Conditions</AppText><AppText muted>›</AppText></Pressable>
    </View>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.xl, gap: spacing.lg }, back: { color: colors.primary, fontSize: 18 }, card: { padding: spacing.lg, gap: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, option: { minHeight: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border } });
