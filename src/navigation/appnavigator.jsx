import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import ProfileScreen from '../screens/property/ProfileScreen';
import SubscriptionScreen from '../screens/property/SubscriptionScreen';
import OrderSummaryScreen from '../screens/property/OrderSummaryScreen';
import PaymentScreen from '../screens/property/PaymentScreen';
import AddPropertyScreen from '../screens/forms/AddPropertyScreen';
import SignInScreen from '../screens/OTP/SignInScreeen';
import OTPScreen from '../screens/OTP/OTPScreen';
import PropertyDetailsScreen from '../browse/PropertyDetailsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import HelpScreen from '../screens/profile/HelpScreen';
import SavedPlotsScreen from '../screens/profile/SavedPlotsScreen';
import InfoScreen from '../screens/profile/InfoScreen';
import PropertyFilterScreen from '../screens/property/PropertyFilterScreen';
const Stack = createNativeStackNavigator();
export default function AppNavigator() {
 return <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
 <Stack.Screen name="MainTabs" component={MainTabs} />
 <Stack.Screen name="EditProfile">{({ navigation }) => <ProfileScreen onSignIn={() => navigation.navigate('SignIn', { returnTo: 'EditProfile' })} onBack={() => navigation.goBack()} />}</Stack.Screen>
 <Stack.Screen name="Subscription" component={SubscriptionScreen} />
 <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
 <Stack.Screen name="Payment" component={PaymentScreen} />
 <Stack.Screen name="AddProperty" component={AddPropertyScreen} /><Stack.Screen name="SignIn" component={SignInScreen} />
 <Stack.Screen name="OTP" component={OTPScreen} /><Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
 <Stack.Screen name="Settings" component={SettingsScreen} /><Stack.Screen name="Help" component={HelpScreen} /><Stack.Screen name="SavedPlots" component={SavedPlotsScreen} />
 <Stack.Screen name="Privacy" component={InfoScreen} initialParams={{ title: 'Privacy Policy' }} /><Stack.Screen name="Terms" component={InfoScreen} initialParams={{ title: 'Terms & Conditions' }} /><Stack.Screen name="ContactSupport" component={InfoScreen} initialParams={{ title: 'Contact Support' }} />
 <Stack.Screen name="PropertyFilters" component={PropertyFilterScreen} />
 </Stack.Navigator>;
}
