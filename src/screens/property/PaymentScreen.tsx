import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TextStyle } from 'react-native';
import { Building2, CreditCard, LockKeyhole, Smartphone } from 'lucide-react-native';
import ButtonV1 from '../../components/ButtonV1';
import { CheckoutFrame, CheckoutPlanCard, CheckoutPriceCard, MissingCheckoutPlan } from '../../components/SubscriptionCheckout';
import type { RootStackParamList } from '../../navigation/types';
import { formatPlanAmount, getSubscriptionOrder } from '../../services/subscriptionPlans';
import colors from '../../theme/colors.v1';
import typography from '../../theme/typography.v1';

const methods = [
  { id: 'upi', label: 'UPI', description: 'Pay with a UPI app', Icon: Smartphone },
  { id: 'card', label: 'Credit / Debit Card', description: 'Pay with a bank card', Icon: CreditCard },
  { id: 'net-banking', label: 'Net Banking', description: 'Pay through online banking', Icon: Building2 },
] as const;

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

export default function PaymentScreen({ navigation, route }: Props) {
  const order = getSubscriptionOrder(route.params?.planId);
  const [method, setMethod] = useState<(typeof methods)[number]['id']>('upi');
  const choosePlan = () => navigation.popTo('Subscription');

  return (
    <CheckoutFrame title="Payment" subtitle="Complete your subscription" onBack={() => navigation.goBack()}>
      {order ? (
        <>
          <CheckoutPlanCard order={order} onChange={choosePlan} />
          <View style={styles.methods} accessibilityRole="radiogroup">
            <Text style={styles.heading}>Select Payment Method</Text>
            {methods.map(({ id, label, description, Icon }) => {
              const selected = method === id;
              return (
                <Pressable
                  key={id}
                  style={[styles.method, selected && styles.selected]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => setMethod(id)}
                >
                  <Icon size={22} color={selected ? colors.primaryColor : colors.textSecondary} />
                  <View style={styles.methodText}>
                    <Text style={styles.label}>{label}</Text>
                    <Text style={styles.body}>{description}</Text>
                  </View>
                  <View style={[styles.radio, selected && styles.selected]}>
                    {selected && <View style={styles.dot} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
          <CheckoutPriceCard order={order} />
          <ButtonV1 style={undefined} textStyle={undefined} title={`Pay ${formatPlanAmount(order.total)} →`} onPress={undefined} disabled />
          <View style={styles.notice}>
            <LockKeyhole size={17} color={colors.textSecondary} />
            <Text style={[styles.body, styles.methodText]} accessibilityRole="alert">
              Online payments are unavailable because no payment gateway is configured. No payment details are collected.
            </Text>
          </View>
        </>
      ) : <MissingCheckoutPlan onChange={choosePlan} />}
    </CheckoutFrame>
  );
}

const styles = StyleSheet.create({
  heading: { color: colors.textPrimary, ...(typography.h3 as TextStyle) },
  methods: { gap: 10 },
  method: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 64,
    backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 16,
  },
  methodText: { flex: 1 },
  label: { color: colors.textPrimary, ...(typography.labelLarge as TextStyle) },
  body: { color: colors.textSecondary, ...(typography.caption as TextStyle) },
  selected: { borderColor: colors.primaryColor },
  radio: {
    width: 19, height: 19, borderRadius: 10, borderWidth: 1, borderColor: colors.borderColor,
    alignItems: 'center', justifyContent: 'center',
  },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primaryColor },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
