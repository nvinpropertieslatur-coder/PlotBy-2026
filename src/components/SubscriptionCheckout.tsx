import type { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatPlanAmount, formatPlanDuration, type SubscriptionOrder } from '../services/subscriptionPlans';
import colors from '../theme/colors.v1';
import typography from '../theme/typography.v1';
import GlassCardV1 from './GlassCardV1';
import ButtonV1 from './ButtonV1';
import ScreenHeaderV1 from './ScreenHeaderV1';

type FrameProps = PropsWithChildren<{ title: string; subtitle: string; onBack: () => void }>;

export function CheckoutFrame({ title, subtitle, onBack, children }: FrameProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeaderV1 title={title} subtitle={subtitle} onBack={onBack} rightAction={undefined} rightIcon={undefined} rightElement={undefined} />
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function CheckoutPlanCard({ order, onChange }: { order: SubscriptionOrder; onChange: () => void }) {
  const { plan } = order;
  return (
    <GlassCardV1 style={[styles.card, styles.plan]}>
      <View style={styles.planText}>
        <Text style={styles.heading}>{plan.name} Plan</Text>
        <Text style={styles.amount}>{formatPlanAmount(plan.amount)}</Text>
        <Text style={styles.body}>{formatPlanDuration(plan.months)}</Text>
      </View>
      <Pressable style={styles.change} onPress={onChange} accessibilityRole="button" accessibilityLabel="Change plan">
        <Text style={styles.amount}>Change</Text>
      </Pressable>
    </GlassCardV1>
  );
}

export function CheckoutPriceCard({ order }: { order: SubscriptionOrder }) {
  return (
    <GlassCardV1 style={styles.card}>
      <View style={styles.line}>
        <Text style={styles.body}>Plan Amount</Text>
        <Text style={styles.value}>{formatPlanAmount(order.plan.amount)}</Text>
      </View>
      <View style={[styles.line, styles.total]}>
        <Text style={styles.value}>Total Amount</Text>
        <Text style={styles.heading}>{formatPlanAmount(order.total)}</Text>
      </View>
    </GlassCardV1>
  );
}

export function MissingCheckoutPlan({ onChange }: { onChange: () => void }) {
  return (
    <>
      <Text style={styles.body} accessibilityRole="alert">This plan is unavailable. Choose a plan to continue.</Text>
      <ButtonV1 style={undefined} textStyle={undefined} title="Choose a Plan" onPress={onChange} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundColor },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: 20, gap: 18 },
  card: { padding: 16, gap: 10 },
  plan: { flexDirection: 'row', alignItems: 'center', borderColor: colors.primaryColor },
  planText: { flex: 1, gap: 3 },
  heading: { color: colors.textPrimary, ...(typography.h3 as TextStyle) },
  body: { color: colors.textSecondary, ...(typography.body as TextStyle) },
  value: { color: colors.textPrimary, ...(typography.bodyMedium as TextStyle) },
  amount: { color: colors.primaryColor, ...(typography.labelLarge as TextStyle) },
  change: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 22, backgroundColor: colors.cardBackground },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  total: { borderTopWidth: 1, borderTopColor: colors.borderColor, paddingTop: 10 },
});
