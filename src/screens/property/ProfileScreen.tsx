// @ts-nocheck
import { supabase } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';

import {
  Alert,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';

import colorsV1 from '../../theme/colors.v1';
import typographyV1 from '../../theme/typography.v1';

import GlassCardV1 from '../../components/GlassCardV1';
import ButtonV1 from '../../components/ButtonV1';
import ScreenHeaderV1 from '../../components/ScreenHeaderV1';



const ProfileScreen = ({
  onBack,
  onProfilePress,
}) => {

  /* =====================================================
     PERSONAL INFORMATION
     ===================================================== */

  const [name, setName] =
    useState('');

  const [dob, setDob] =
    useState('');

  const [country, setCountry] =
    useState('India');

  const [city, setCity] =
    useState('');
  const [cityDropdownOpen, setCityDropdownOpen] =
  useState(false);

const [showSuccess, setShowSuccess] = useState(false);

const [successScale] = useState(
  new Animated.Value(0.7)
);

const [successOpacity] = useState(
  new Animated.Value(0)
);

const [checkScale] = useState(
  new Animated.Value(0)
);

  /* =====================================================
     SAVE
     ===================================================== */

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active || !data.user) return;
      const metadata = data.user.user_metadata;
      setName(metadata.full_name || ''); setDob(metadata.dob || ''); setCountry(metadata.country || 'India'); setCity(metadata.city || '');
    });
    return () => { active = false; };
  }, []);
  const handleSave = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) { Alert.alert('Sign in required', 'Sign in before saving your profile.'); return; }
  const { error } = await supabase.auth.updateUser({ data: { full_name: name, dob, country, city } });
  if (error) { Alert.alert('Unable to save profile', error.message); return; }

  console.log('Profile saved');

  setShowSuccess(true);

  successScale.setValue(0.7);
  successOpacity.setValue(0);
  checkScale.setValue(0);

  Animated.parallel([
    Animated.spring(successScale, {
      toValue: 1,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }),

    Animated.timing(successOpacity, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
  ]).start(() => {
    Animated.spring(checkScale, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  });
};

const closeSuccess = () => {
  Animated.parallel([
    Animated.timing(successOpacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }),

    Animated.timing(successScale, {
      toValue: 0.8,
      duration: 180,
      useNativeDriver: true,
    }),
  ]).start(() => {
    setShowSuccess(false);
  });
};

  /* =====================================================
     BOTTOM NAV
     ===================================================== */




  return (
    <View style={styles.screen}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* =================================================
            HEADER
            ================================================= */}

        <ScreenHeaderV1
          title="Edit Profile"
          onBack={onBack}
        />

        {/* =================================================
            PROFILE HERO
            ================================================= */}

        <View style={styles.profileHero}>

          <View style={styles.profileGlow} />

          <View style={styles.avatarOuter}>

            <View style={styles.avatar}>

              <Text style={styles.avatarText}>
                -
              </Text>

            </View>

            <Pressable
              style={({ pressed }) => [
                styles.cameraButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.cameraIcon}>
                +
              </Text>
            </Pressable>

          </View>


          <Text style={styles.profileName}>
            {name}
          </Text>


          <Text style={styles.profileRole}>
            Real Estate Agent | PlotBy
          </Text>

        </View>


        {/* =================================================
            PERSONAL INFORMATION
            ================================================= */}

        <GlassCardV1
          style={styles.sectionCard}
        >

          <Text style={styles.sectionTitle}>
            PERSONAL INFORMATION
          </Text>


          <ProfileField
            label="Name"
            value={name}
            onChangeText={setName}
          />

          <ProfileField
            label="Date of Birth"
            value={dob}
            onChangeText={setDob}
          />

          <ProfileField
            label="Country / Region"
            value={country}
            onChangeText={setCountry}
            
          />

          <ProfileField
            label="City / Location"
            value={city}
            onChangeText={setCity}
          />

        </GlassCardV1>

        {/* =================================================
            SAVE
            ================================================= */}

        <ButtonV1
          title="Save Changes"
          onPress={handleSave}
          style={styles.saveButton}
        />


        <View style={styles.bottomSpace} />

      </ScrollView>
       {showSuccess && (
  <View style={styles.successOverlay}>

    <Animated.View
      style={[
        styles.successCard,
        {
          opacity: successOpacity,
          transform: [
            {
              scale: successScale,
            },
          ],
        },
      ]}
    >

      <Animated.View
        style={[
          styles.successCircle,
          {
            transform: [
              {
                scale: checkScale,
              },
            ],
          },
        ]}
      >
        <Text style={styles.checkMark}>
          ✓
        </Text>
      </Animated.View>

      <Text style={styles.successTitle}>
        Changes Saved!
      </Text>

      <Text style={styles.successMessage}>
        Your profile has been updated successfully.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.successButton,
          pressed && styles.successButtonPressed,
        ]}
        onPress={closeSuccess}
      >
        <Text style={styles.successButtonText}>
          Done
        </Text>
      </Pressable>

    </Animated.View>

  </View>
)}

      {/* ===================================================
          BOTTOM NAV
          =================================================== */}

      

    </View>
  );
};


/* =========================================================
   PROFILE FIELD
   ========================================================= */

const ProfileField = ({
  label,
  value,
  onChangeText,
  keyboardType,
  dropdown = false,
}) => {

  return (
    <View style={styles.fieldContainer}>

      <Text style={styles.label}>
        {label}
      </Text>


      <View style={styles.inputWrapper}>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          style={[
            styles.input,
            dropdown &&
              styles.dropdownInput,
          ]}
          placeholderTextColor={
            colorsV1.textMuted
          }
          selectionColor={
            colorsV1.primaryColor
          }
        />


        {dropdown && (
          <Text style={styles.dropdownIcon}>
            ⌄
          </Text>
        )}

      </View>

    </View>
  );
};


/* =========================================================
   STYLES
   ========================================================= */

const styles = StyleSheet.create({

  screen: {
    flex: 1,

    backgroundColor:
      colorsV1.backgroundColor,
  },

    successOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,

      backgroundColor: 'rgba(0, 0, 0, 0.72)',

      alignItems: 'center',
      justifyContent: 'center',

      paddingHorizontal: 30,

      zIndex: 999,
    },

    successCard: {
      width: '100%',
      maxWidth: 360,

      paddingHorizontal: 26,
      paddingVertical: 30,

      borderRadius: 26,

      backgroundColor: '#151515',

      borderWidth: 1,
      borderColor: 'rgba(124, 255, 61, 0.25)',

      alignItems: 'center',

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.45,
      shadowRadius: 25,

      elevation: 15,
    },

    successCircle: {
      width: 76,
      height: 76,

      borderRadius: 38,

      backgroundColor: 'rgba(124, 255, 61, 0.12)',

      borderWidth: 2,
      borderColor: colorsV1.primaryColor,

      alignItems: 'center',
      justifyContent: 'center',

      marginBottom: 20,
    },

    checkMark: {
      color: colorsV1.primaryColor,

      fontSize: 42,
      fontWeight: '800',

      marginTop: -3,
    },

    successTitle: {
      color: colorsV1.textPrimary,

      fontSize: 24,
      fontWeight: '800',

      marginBottom: 8,

      textAlign: 'center',
    },

    successMessage: {
      color: colorsV1.textSecondary,

      fontSize: 15,
      lineHeight: 22,

      textAlign: 'center',

      marginBottom: 24,

      paddingHorizontal: 10,
    },

    successButton: {
      width: '100%',
      height: 48,

      borderRadius: 24,

      backgroundColor: colorsV1.primaryColor,

      alignItems: 'center',
      justifyContent: 'center',
    },

    successButtonPressed: {
      opacity: 0.7,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    successButtonText: {
      color: colorsV1.black,

      fontSize: 16,
      fontWeight: '800',
    },

  scrollContent: {
    width: '100%',

    maxWidth: 900,

    alignSelf: 'center',

    paddingHorizontal: 20,

    paddingTop:
      Platform.OS === 'web'
        ? 24
        : 16,

    paddingBottom: 20,
  },


  /* =====================================================
     PROFILE HERO
     ===================================================== */

  profileHero: {
    alignItems: 'center',

    paddingTop: 12,

    paddingBottom: 22,

    position: 'relative',
  },

  profileGlow: {
    position: 'absolute',

    width: 220,
    height: 170,

    top: -20,

    borderRadius: 110,

    backgroundColor:
      'rgba(124,255,61,0.08)',
  },


  /* =====================================================
     AVATAR
     ===================================================== */

  avatarOuter: {
    position: 'relative',

    marginTop: 4,
  },

  avatar: {
    width: 92,
    height: 92,

    borderRadius: 46,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      colorsV1.backgroundSecondary,

    borderWidth: 2,

    borderColor:
      colorsV1.primaryColor,

    shadowColor:
      colorsV1.primaryColor,

    shadowOffset: {
      width: 0,
      height: 0,
    },

    shadowOpacity: 0.25,

    shadowRadius: 16,

    elevation: 5,
  },

  avatarText: {
    color: colorsV1.primaryColor,

    ...typographyV1.h1,

    fontSize: 28,

    fontWeight: '800',
  },


  /* =====================================================
     CAMERA
     ===================================================== */

  cameraButton: {
    position: 'absolute',

    right: -2,
    bottom: -2,

    width: 30,
    height: 30,

    borderRadius: 15,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      colorsV1.primaryColor,

    borderWidth: 3,

    borderColor:
      colorsV1.backgroundColor,
  },

  cameraIcon: {
    color: colorsV1.black,

    fontSize: 18,

    fontWeight: '700',
  },


  /* =====================================================
     PROFILE TEXT
     ===================================================== */

  profileName: {
    marginTop: 12,

    color: colorsV1.textPrimary,

    ...typographyV1.h2,

    fontWeight: '700',
  },

  profileRole: {
    marginTop: 4,

    color: colorsV1.textSecondary,

    ...typographyV1.body,
  },


  /* =====================================================
     CARDS
     ===================================================== */

  sectionCard: {
    marginTop: 14,

    padding: 18,

    borderRadius: 20,
  },

  sectionTitle: {
    marginBottom: 18,

    color: colorsV1.primaryColor,

    ...typographyV1.label,

    fontWeight: '700',

    letterSpacing: 1,
  },


  /* =====================================================
     FIELDS
     ===================================================== */

  fieldContainer: {
    marginBottom: 14,
  },

  label: {
    marginBottom: 6,

    color: colorsV1.textSecondary,

    ...typographyV1.label,
  },

  inputWrapper: {
    height: 46,

    position: 'relative',

    justifyContent: 'center',
  },

  input: {
    width: '100%',

    height: 46,

    paddingHorizontal: 14,

    paddingVertical: 0,

    borderRadius: 12,

    backgroundColor:
      colorsV1.cardBackgroundLight,

    borderWidth: 1,

    borderColor:
      colorsV1.borderColor,

    color: colorsV1.textPrimary,

    ...typographyV1.body,

  },

  dropdownInput: {
    paddingRight: 38,
  },

  dropdownIcon: {
    position: 'absolute',

    right: 14,

    color: colorsV1.textSecondary,

    fontSize: 18,

    pointerEvents: 'none',
  },


  /* =====================================================
     PASSWORD
     ===================================================== */

  passwordContainer: {
    height: 46,

    flexDirection: 'row',

    alignItems: 'center',

    borderRadius: 12,

    backgroundColor:
      colorsV1.cardBackgroundLight,

    borderWidth: 1,

    borderColor:
      colorsV1.borderColor,
  },

  passwordInput: {
    flex: 1,

    height: 46,

    paddingHorizontal: 14,

    color: colorsV1.textPrimary,

    ...typographyV1.body,
  },

  eyeButton: {
    width: 44,

    height: 44,

    alignItems: 'center',
    justifyContent: 'center',
  },

  eyeText: {
    color: colorsV1.textSecondary,

    fontSize: 17,
  },


  /* =====================================================
     SAVE
     ===================================================== */

  saveButton: {
    marginTop: 20,

    minHeight: 48,

    borderRadius: 24,
  },


  /* =====================================================
     PRESS
     ===================================================== */

  pressed: {
    opacity: 0.7,
  },


  bottomSpace: {
    height: 20,
  },

});

export default ProfileScreen;