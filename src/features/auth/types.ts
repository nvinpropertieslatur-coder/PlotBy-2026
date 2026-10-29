import type { Session, User } from '@supabase/supabase-js';

export type IdentityState =
  | { kind: 'guest' }
  | { kind: 'preview'; phone: string }
  | { kind: 'authenticated'; user: User; session: Session };

export const normalizeIndianMobile = (value: string) => value.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
export const isValidIndianMobile = (value: string) => /^[6-9]\d{9}$/.test(normalizeIndianMobile(value));
export const toE164IndianMobile = (value: string) => `+91${normalizeIndianMobile(value)}`;
export const canEnterDevelopmentPreview = (hasAuthenticatedSession: boolean) => !hasAuthenticatedSession;
