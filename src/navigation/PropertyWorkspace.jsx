
import { Alert } from 'react-native';
import MyPropertiesScreen from '../screens/property/MyPropertiesScreen';
import { supabase } from '../lib/supabase';

/** The sole My Properties screen is the Profile tab, retaining its original menu. */
export default function PropertyWorkspace({ navigation }) {
  return (
    <MyPropertiesScreen
      profileImage={undefined}
      navigation={navigation}

      onBack={() => navigation.navigate('Property')}
      onProfilePress={() => navigation.navigate('Profile')}
      onEditProfile={() => navigation.navigate('EditProfile')}
      onSubscription={() => navigation.navigate('Subscription')}

      onAddProperty={(propertyType) =>
        navigation.navigate('AddProperty', { propertyType })
      }

      onPropertyPress={(property) =>
        navigation.navigate('PropertyDetails', {
          propertyId: String(property.id),
          source: 'profile',
        })
      }

      onEditProperty={(property) =>
        navigation.navigate('AddProperty', {
          property,
          propertyType:
            property.property_type || property.type || 'plot',
        })
      }

      onSignIn={() =>
        navigation.navigate('SignIn', { returnTo: 'MyProperties' })
      }
      onAgentLogin={() => navigation.navigate('SignIn')}
      onBuilderLogin={() => navigation.navigate('SignIn')}

      onSavedProperties={() => navigation.navigate('SavedPlots')}
      onHelp={() => navigation.navigate('Help')}

      onLogout={async () => {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          Alert.alert('Sign out failed', sessionError.message);
          return;
        }

        if (!session) {
          navigation.navigate('SignIn');
          return;
        }

        const { error } = await supabase.auth.signOut();

        if (error) {
          Alert.alert('Sign out failed', error.message);
        } else {
          navigation.navigate('SignIn');
        }
      }}
    />
  );
}
