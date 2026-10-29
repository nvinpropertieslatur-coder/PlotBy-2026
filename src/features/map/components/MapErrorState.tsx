import { AppEmptyState } from '@/src/components/ui';
export function MapErrorState({ message = 'The map could not be loaded.' }: { message?: string }) { return <AppEmptyState title="Map unavailable" message={message} />; }
