import { useState } from 'react';
import { Alert, LayoutAnimation, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ChevronDown, Headset, Mail, Phone } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../../browse/components/ui';
import { radius, spacing } from '../../browse/theme';
import colors from '../../theme/colors.v1';
import ScreenHeaderV1 from '../../components/ScreenHeaderV1';

const questions = [
  ['What is PlotBy?', 'PlotBy is a real-estate platform that helps users discover properties, explore property details, and manage their property listings in one place.'],
  ['How can I add a property?', 'Navigate to the Add Property section, select the appropriate property type, enter the required property details, and submit your listing.'],
  ['How can I view my added properties?', 'Open My Properties to view and manage your submitted property listings.'],
  ['What does Verified and Unverified mean?', "Verified properties are listings that have completed the platform's verification process. Unverified properties are listings that have not yet completed verification."],
  ['How can I edit my profile?', 'Open the hamburger menu, select Edit Profile, update your personal information, and tap Save Changes.'],
  ['How can I manage my subscription?', 'Open the hamburger menu and select Subscription to view available plans and subscription information.'],
  ['How can I save favourite properties?', 'Open a property listing and use the Favourite option to save it. You can access saved properties from the Favourite section.'],
  ['How can I contact support?', 'Use the Contact Support section to get assistance with account access, property listings, verification, subscriptions, or other PlotBy-related issues.'],
];

const email = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || '';
const phone = process.env.EXPO_PUBLIC_SUPPORT_PHONE?.trim().replace(/[\s().-]/g, '') || '';
const actions = [
  { title: 'Email Support', Icon: Mail, url: /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email) ? `mailto:${encodeURIComponent(email).replace('%40', '@')}` : null },
  { title: 'Call Support', Icon: Phone, url: /^\+?\d{7,15}$/.test(phone) ? `tel:${phone}` : null },
];

export default function HelpScreen({ navigation }) {
  const [open, setOpen] = useState(null);

  function toggleQuestion(index) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(current => current === index ? null : index);
  }

  async function openContact(url) {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open support', 'Check that an email or phone app is available on this device.');
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeaderV1 title="Help & Support" onBack={() => navigation.goBack()} />
        <View style={styles.intro}>
          <Headset color={colors.primaryColor} size={28} />
          <AppText style={styles.questionLabel} muted>We&apos;re here to help you with your PlotBy experience.</AppText>
        </View>

        <AppText style={styles.heading}>Frequently Asked Questions</AppText>
        {questions.map(([question, answer], index) => {
          const expanded = open === index;
          return (
            <View key={question} style={styles.card}>
              <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => toggleQuestion(index)} style={styles.question}>
                <AppText style={styles.questionLabel}>{question}</AppText>
                <ChevronDown size={20} color={colors.primaryColor} style={expanded && styles.expandedIcon} />
              </Pressable>
              {expanded && <AppText muted style={styles.answer}>{answer}</AppText>}
            </View>
          );
        })}

        <View style={[styles.card, styles.contact]}>
          <AppText style={styles.heading}>Contact Support</AppText>
          <AppText muted>Need help with PlotBy? Our support team is here to assist you.</AppText>
          {actions.map(({ title, Icon, url }) => (
            <Pressable key={title} disabled={!url} accessibilityRole="button" accessibilityState={{ disabled: !url }} style={styles.action} onPress={() => void openContact(url)}>
              <Icon size={20} color={url ? colors.primaryColor : colors.textMuted} />
              <AppText style={styles.questionLabel} muted={!url}>{title}</AppText>
              {!url && <AppText muted>Not configured</AppText>}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundColor },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: spacing.xl, gap: spacing.md },
  intro: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  heading: { color: colors.primaryColor, fontSize: 17, fontWeight: '700' },
  card: { backgroundColor: colors.cardBackground, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderColor },
  question: { minHeight: 52, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  questionLabel: { flex: 1 },
  expandedIcon: { transform: [{ rotate: '180deg' }] },
  answer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, lineHeight: 22 },
  contact: { marginTop: spacing.md, padding: spacing.lg, gap: spacing.md },
  action: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});

