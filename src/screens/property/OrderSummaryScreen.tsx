import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import type { TextStyle } from 'react-native';
import { CircleCheck } from 'lucide-react-native';
import ButtonV1 from '../../components/ButtonV1';
import { CheckoutFrame, CheckoutPlanCard, CheckoutPriceCard, MissingCheckoutPlan } from '../../components/SubscriptionCheckout';
import type { RootStackParamList } from '../../navigation/types';
import { formatPlanCredits, getSubscriptionOrder } from '../../services/subscriptionPlans';
import colors from '../../theme/colors.v1';
import typography from '../../theme/typography.v1';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderSummary'>;

export default function OrderSummaryScreen({ navigation, route }: Props) {
  const order = getSubscriptionOrder(route.params?.planId);
  const choosePlan = () => navigation.popTo('Subscription');

  return (
    <CheckoutFrame title="Order Summary" subtitle="Review your plan details" onBack={() => navigation.goBack()}>
      {order ? (
        <>
          <CheckoutPlanCard order={order} onChange={choosePlan} />
          <View style={styles.benefits}>
            <Text style={styles.heading}>What&apos;s Included</Text>
            <View style={styles.benefit}>
              <CircleCheck size={18} color={colors.primaryColor} />
              <Text style={styles.body}>{formatPlanCredits(order.plan.credits)} subscription credits</Text>
            </View>
          </View>
          <CheckoutPriceCard order={order} />
          <ButtonV1 style={undefined} textStyle={undefined} title="Proceed to Payment →" onPress={() => navigation.navigate('Payment', { planId: order.plan.id })} />
        </>
      ) : <MissingCheckoutPlan onChange={choosePlan} />}
    </CheckoutFrame>
  );
}

const styles = StyleSheet.create({
  benefits: { gap: 10 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heading: { color: colors.textPrimary, ...(typography.h3 as TextStyle) },
  body: { color: colors.textSecondary, ...(typography.body as TextStyle) },
});
