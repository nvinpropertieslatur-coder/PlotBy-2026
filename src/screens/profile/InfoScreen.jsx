import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../../browse/components/ui';
import { colors, spacing } from '../../browse/theme';
export default function InfoScreen({ navigation, route }) { const title = route.params?.title || 'PlotBy'; return <SafeAreaView style={styles.screen} edges={['top']}><ScrollView contentContainerStyle={styles.content}><Pressable onPress={() => navigation.goBack()}><AppText style={styles.back}>‹ Back</AppText></Pressable><AppText variant="title">{title}</AppText><AppText muted>{title === 'Contact Support' ? 'Tell us how we can help and our team will get back to you.' : 'This information is provided by PlotBy. Please review it before continuing to use the app.'}</AppText></ScrollView></SafeAreaView>; }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.xl, gap: spacing.lg }, back: { color: colors.primary, fontSize: 18 } });
