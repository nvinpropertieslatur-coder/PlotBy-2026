import type { NavigatorScreenParams } from '@react-navigation/native';
export type MainTabParamList = { Property: undefined; Offers: undefined; Profile: undefined };
export type PropertyReturnTarget = 'AddProperty' | 'MyProperties';
export type RootStackParamList = {
 MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
 EditProfile: undefined;
 AddProperty: { propertyType?: string; property?: Record<string, unknown> } | undefined;
 Subscription: undefined;
 SignIn: { returnTo?: PropertyReturnTarget } | undefined;
 OTP: { mobileNumber: string; returnTo?: PropertyReturnTarget };
 PropertyDetails: { propertyId: string };
};
