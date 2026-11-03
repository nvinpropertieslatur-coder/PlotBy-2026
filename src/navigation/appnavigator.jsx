import { Alert } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import ProfileScreen from '../screens/property/ProfileScreen';
import SubscriptionScreen from '../screens/property/SubscriptionScreen';
import AddPropertyScreen from '../screens/forms/AddPropertyScreen';
import SignInScreen from '../screens/OTP/SignInScreeen';
import OTPScreen from '../screens/OTP/OTPScreen';
import PropertyDetailsScreen from '../browse/PropertyDetailsScreen';
const Stack = createNativeStackNavigator();
export default function AppNavigator() {
 return <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
 <Stack.Screen name="MainTabs" component={MainTabs} />
 <Stack.Screen name="EditProfile">{({ navigation }) => <ProfileScreen onProfilePress={undefined} onBack={() => navigation.goBack()} />}</Stack.Screen>
 <Stack.Screen name="Subscription">{({ navigation }) => <SubscriptionScreen onProceedToPay={() => Alert.alert('Subscription', 'Payment processing was not included in the supplied application. Contact your Plotby administrator.')} onBack={() => navigation.goBack()} />}</Stack.Screen>
 <Stack.Screen name="AddProperty" component={AddPropertyScreen} /><Stack.Screen name="SignIn" component={SignInScreen} />
 <Stack.Screen name="OTP" component={OTPScreen} /><Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
 </Stack.Navigator>;
}
