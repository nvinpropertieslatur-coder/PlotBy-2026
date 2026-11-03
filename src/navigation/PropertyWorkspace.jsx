import { Alert } from 'react-native';
import MyPropertiesScreen from '../screens/property/MyPropertiesScreen';
import { supabase } from '../lib/supabase';

/** The sole My Properties screen is the Profile tab, retaining its original menu. */
export default function PropertyWorkspace({ navigation }) {
  return <MyPropertiesScreen navigation={navigation} profileImage={undefined}
    onBack={() => navigation.navigate('Property')}
    onProfilePress={() => navigation.navigate('Profile')}
    onEditProfile={() => navigation.navigate('EditProfile')}
    onSubscription={() => navigation.navigate('Subscription')}
    onAddProperty={() => navigation.navigate('AddProperty')}
    onPropertyPress={property => navigation.navigate('PropertyDetails', { propertyId: String(property.id) })}
    onEditProperty={property => navigation.navigate('AddProperty', { property, propertyType: property.type || 'plot' })}
    onSignIn={() => navigation.navigate('SignIn', { returnTo: 'MyProperties' })}
    onAgentLogin={() => navigation.navigate('SignIn')}
    onBuilderLogin={() => navigation.navigate('SignIn')}
    onSavedProperties={() => Alert.alert('Saved Properties', 'Saved properties are not implemented in the supplied application.')}
    onHelp={() => Alert.alert('Help & Support', 'Contact your Plotby administrator for assistance.')}
    onLogout={async () => {
      const { error } = await supabase.auth.signOut();
      if (error) Alert.alert('Sign out failed', error.message);
      // Stay in the workspace. An auth event clears private rows and loads guest data.
    }} />;
}
