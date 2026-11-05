// @ts-nocheck
import { supabase } from '../../lib/supabase';
import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { CalendarDays, UserRound } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Alert,
  ActivityIndicator,
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Image,
  KeyboardAvoidingView,
  Animated,
  Easing,
} from 'react-native';

import colorsV1 from '../../theme/colors.v1';
import typographyV1 from '../../theme/typography.v1';

import GlassCardV1 from '../../components/GlassCardV1';
import ButtonV1 from '../../components/ButtonV1';
import ScreenHeaderV1 from '../../components/ScreenHeaderV1';



// DOB is a calendar date. Use local calendar parts without converting to UTC.
function dateKey(date) {
  return [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function normalizeBirthDate(value) {
  if (typeof value !== 'string') return '';
  const text = value.trim();
  const legacy = /^(\d{2})[-/](\d{2})[-/](\d{4})$/.exec(text);
  const key = legacy ? [legacy[3], legacy[2], legacy[1]].join('-') : text;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return '';
  const date = pickerDate(key);
  return dateKey(date) === key ? key : '';
}

function pickerDate(key) {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setFullYear(year, month - 1, day);
  return date;
}

const ProfileScreen = ({
  onBack,
  onSignIn,
}) => {

  /* =====================================================
     PERSONAL INFORMATION
     ===================================================== */

  const [name, setName] =
    useState('');

  const [dob, setDob] =
    useState('');

  const [country, setCountry] =
    useState('');

  const [city, setCity] =
    useState('');
  const [userId, setUserId] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [draftDate, setDraftDate] = useState(null);
  const [requiresSignIn, setRequiresSignIn] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);
  const [loadError, setLoadError] = useState('');
  const busy = useRef(false);

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
    async function loadProfile() {
      try {
        setLoading(true);
        setLoadError('');
        setRequiresSignIn(false);
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!active) return;
        if (!user) {
          const signedOut = error?.name === 'AuthSessionMissingError' || !error;
          setRequiresSignIn(signedOut);
          setLoadError(signedOut ? 'Sign in to edit your profile.' : 'Unable to load your profile. ' + error.message);
          return;
        }
        if (error) throw error;
        const metadata = user.user_metadata;
        setUserId(user.id);
        setName(metadata.full_name || '');
        setDob(normalizeBirthDate(metadata.dob));
        setCountry(metadata.country || '');
        setCity(metadata.city || '');
        setPhoto(metadata.avatar_url || null);
        try {
          const localPhoto = await AsyncStorage.getItem('plotby:profile-photo:' + user.id);
          if (active && localPhoto) setPhoto(localPhoto);
        } catch {
          if (active) setLoadError('Unable to load the profile photo saved on this device.');
        }
      } catch (error) {
        if (active) setLoadError('Unable to load your profile. ' + error.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadProfile();
    return () => { active = false; };
  }, [loadAttempt]);

  const handlePhoto = async () => {
    if (!userId) { Alert.alert('Sign in required', 'Sign in to change your profile photo.'); return; }
    if (busy.current) return;
    busy.current = true;
    setPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
      if (result.canceled) return;
      const base64 = result.assets[0]?.base64;
      if (!base64 || base64.length > 1_500_000) {
        Alert.alert('Choose a smaller photo', 'This photo could not be saved. Try a smaller image.');
        return;
      }
      const uri = 'data:image/jpeg;base64,' + base64;
      await AsyncStorage.setItem('plotby:profile-photo:' + userId, uri);
      setPhoto(uri);
    } catch (error) {
      Alert.alert('Unable to change photo', error.message);
    } finally {
      busy.current = false;
      setPicking(false);
    }
  };

  const DateFieldContainer = Platform.OS === 'web' ? View : Pressable;
  const today = new Date();
  const todayKey = dateKey(today);
  const dateValue = dob && dob <= todayKey ? pickerDate(dob) : today;

  function openDatePicker() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dateValue,
        mode: 'date',
        display: 'calendar',
        maximumDate: today,
        onValueChange: (_, date) => { if (date) setDob(dateKey(date)); },
      });
    } else if (Platform.OS === 'ios') {
      setDraftDate(dateValue);
    }
  }

  const handleSave = async () => {
    if (busy.current || !userId) return;
    const profile = { full_name: name.trim(), dob, country: country.trim(), city: city.trim() };
    if (!profile.full_name || !profile.country || !profile.city) {
      Alert.alert('Complete your profile', 'Enter your name, country or region, and city or location.');
      return;
    }
    if (!dob || normalizeBirthDate(dob) !== dob || dob > dateKey(new Date())) {
      Alert.alert('Check your date of birth', 'Select a valid date of birth that is today or earlier.');
      return;
    }
    busy.current = true;
    setSaving(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (user?.id !== userId) throw new Error('The active account changed. Reopen Edit Profile and try again.');
      const { data, error } = await supabase.auth.updateUser({ data: profile });
      if (error) throw error;
      if (data?.user?.id !== userId ||
          Object.keys(profile).some(field => data.user.user_metadata?.[field] !== profile[field])) {
        throw new Error('Supabase did not confirm all profile changes. Please try again.');
      }
      setName(profile.full_name);
      setCountry(profile.country);
      setCity(profile.city);
    } catch (error) {
      if (error?.name === 'AuthSessionMissingError') {
        setRequiresSignIn(true);
        setLoadError('Your session ended. Sign in to save your profile.');
      }
      Alert.alert('Unable to save profile', error.message);
      return;
    } finally {
      busy.current = false;
      setSaving(false);
    }

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
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.form} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
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

            <Pressable style={styles.avatar}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              disabled={loading || saving || picking || !userId}
              onPress={handlePhoto}
            >

              {photo
                ? <Image source={{ uri: photo }} style={styles.avatarImage} />
                : <UserRound size={42} color={colorsV1.primaryColor} />}

            </Pressable>

          </View>


          <Text style={styles.profileName}>
            {name}
          </Text>


          {loading && <Text style={styles.label}>Loading profile…</Text>}
          {!!loadError && <Text accessibilityRole="alert" style={styles.label}>{loadError}</Text>}

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
            editable={!!userId && !loading && !saving}
            value={name}
            onChangeText={setName}
          />

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <DateFieldContainer
              {...(Platform.OS === 'web' ? {} : {
                accessibilityRole: 'button',
                accessibilityLabel: 'Date of Birth',
                disabled: !userId || loading || saving,
                onPress: openDatePicker,
              })}
              style={[styles.input, styles.dateField]}
            >
              <Text style={[styles.dateText, !dob && styles.datePlaceholder]}>
                {dob ? dob.split('-').reverse().join('-') : 'DD-MM-YYYY'}
              </Text>
              <CalendarDays size={20} color={colorsV1.primaryColor} />
              {Platform.OS === 'web' && React.createElement('input', {
                type: 'date',
                'aria-label': 'Date of Birth',
                value: dob,
                max: todayKey,
                disabled: !userId || loading || saving,
                onClick: event => {
                  try { event.currentTarget.showPicker?.(); } catch { /* Browser handles the native input. */ }
                },
                onChange: event => {
                  const date = normalizeBirthDate(event.target.value);
                  if (date && date <= todayKey) setDob(date);
                },
                style: { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' },
              })}
            </DateFieldContainer>
          </View>

          <ProfileField
            label="Country / Region"
            editable={!!userId && !loading && !saving}
            value={country}
            onChangeText={setCountry}
            
          />

          <ProfileField
            label="City / Location"
            editable={!!userId && !loading && !saving}
            value={city}
            onChangeText={setCity}
          />

        </GlassCardV1>

        {/* =================================================
            SAVE
            ================================================= */}

        <ButtonV1
          title={requiresSignIn ? "Sign In" : !loading && !userId ? "Retry Loading Profile" : saving ? "Saving…" : "Save Changes"}
          icon={saving ? <ActivityIndicator color={colorsV1.backgroundColor} /> : null}
          disabled={loading || saving || picking}
          onPress={requiresSignIn ? onSignIn : !userId ? () => setLoadAttempt(value => value + 1) : handleSave}
          style={styles.saveButton}
        />


        <View style={styles.bottomSpace} />

      </ScrollView>
      </KeyboardAvoidingView>
      {draftDate && (
        <Modal transparent animationType="fade" onRequestClose={() => setDraftDate(null)}>
          <View style={styles.dateOverlay}>
            <View style={styles.dateDialog}>
              <Text style={styles.sectionTitle}>Date of Birth</Text>
              <DateTimePicker
                value={draftDate}
                mode="date"
                display="inline"
                maximumDate={today}
                themeVariant="dark"
                onValueChange={(_, date) => { if (date) setDraftDate(date); }}
              />
              <View style={styles.dateActions}>
                <ButtonV1 title="Cancel" variant="outline" onPress={() => setDraftDate(null)} />
                <ButtonV1 title="Done" onPress={() => { setDob(dateKey(draftDate)); setDraftDate(null); }} />
              </View>
            </View>
          </View>
        </Modal>
      )}
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

      

    </SafeAreaView>
  );
};


/* =========================================================
   PROFILE FIELD
   ========================================================= */

const ProfileField = ({
  label,
  value,
  onChangeText,
  placeholder,
  editable,
  autoCapitalize = "words",
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
          accessibilityLabel={label}
          editable={editable}
          autoCapitalize={autoCapitalize}
          placeholder={placeholder}
          style={styles.input}
          placeholderTextColor={colorsV1.textMuted}
          selectionColor={colorsV1.primaryColor}
        />
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

  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  form: { flex: 1 },


  /* =====================================================
     CAMERA
     ===================================================== */




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

  dateField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText: { color: colorsV1.textPrimary, ...typographyV1.body },
  datePlaceholder: { color: colorsV1.textMuted },
  dateOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.65)' },
  dateDialog: { width: '100%', maxWidth: 420, padding: 16, gap: 12, backgroundColor: colorsV1.backgroundSecondary, borderRadius: 20 },
  dateActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  inputWrapper: {
    height: 50,
    position: 'relative',

    justifyContent: 'center',
  },

  input: {
    width: '100%',

    height: 50,
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
    width: '100%',
    minHeight: 52,

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