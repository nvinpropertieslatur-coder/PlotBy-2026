import type { NavigatorScreenParams } from '@react-navigation/native';
export type MainTabParamList = { Property: { filters?: Record<string, unknown> } | undefined; Offers: undefined; Profile: undefined };
export type PropertyReturnTarget = 'AddProperty' | 'MyProperties';
export type RootStackParamList = {
 MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
 EditProfile: undefined;
 AddProperty: { propertyType?: string; property?: Record<string, unknown> } | undefined;
 Subscription: undefined;
 SignIn: { returnTo?: PropertyReturnTarget } | undefined;
 OTP: { mobileNumber: string; returnTo?: PropertyReturnTarget };
 PropertyDetails: { propertyId: string; source?: 'home' | 'profile'; plot?: any; property?: any };
 PropertyFilters: { filters?: Record<string, unknown>; candidates?: readonly any[] } | undefined;
};
