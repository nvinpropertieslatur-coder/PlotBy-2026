export const subscriptionPlans = [
  { id: 'starter', name: 'Starter', icon: '◎', amount: 1499, credits: 600, months: 1, popular: true },
  { id: 'professional', name: 'Professional', icon: '♕', amount: 2599, credits: 1200, months: 3, popular: false },
  { id: 'premium', name: 'Premium', icon: '♛', amount: 7499, credits: 3000, months: 6, popular: false },
] as const;

export type SubscriptionPlanId = (typeof subscriptionPlans)[number]['id'];

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const number = new Intl.NumberFormat('en-IN');

export function formatPlanAmount(amount: number) {
  return rupees.format(amount);
}

export function formatPlanCredits(credits: number) {
  return number.format(credits);
}

export function formatPlanDuration(months: number) {
  return `${months} ${months === 1 ? 'Month' : 'Months'}`;
}

export function getSubscriptionOrder(planId: unknown) {
  const plan = subscriptionPlans.find(item => item.id === planId);
  if (!plan) return null;

  // Checkout currently has no tax or discount configuration.
  return { plan, total: plan.amount };
}

export type SubscriptionOrder = NonNullable<ReturnType<typeof getSubscriptionOrder>>;
