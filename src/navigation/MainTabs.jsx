import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Map, Tag, UserRound } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PropertyScreen from '../browse/PropertyScreen';
import OffersScreen from '../browse/OffersScreen';
import PropertyWorkspace from './PropertyWorkspace';
import { colors } from '../browse/theme';
const Tab = createBottomTabNavigator();
export default function MainTabs() {
 const insets = useSafeAreaInsets();
 return <Tab.Navigator screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted,
 tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: 62 + insets.bottom, paddingTop: 8, paddingBottom: insets.bottom }, tabBarLabelStyle: { fontWeight: '700' } }}>
 <Tab.Screen name="Property" component={PropertyScreen} options={{ tabBarIcon: ({ color }) => <Map size={22} color={color} /> }} />
 <Tab.Screen name="Offers" component={OffersScreen} options={{ tabBarIcon: ({ color }) => <Tag size={22} color={color} /> }} />
 <Tab.Screen name="Profile" component={PropertyWorkspace} options={{ tabBarIcon: ({ color }) => <UserRound size={22} color={color} /> }} />
 </Tab.Navigator>;
}
