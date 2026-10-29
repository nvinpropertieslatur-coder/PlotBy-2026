import { AppBadge } from '@/src/components/ui';
export function PlotStatusBadge({ discountAmount }: { discountAmount?: number }) { return discountAmount && discountAmount > 0 ? <AppBadge label="Special offer" tone="yellow" /> : null; }
