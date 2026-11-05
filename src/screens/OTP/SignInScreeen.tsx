// @ts-nocheck
import React, { useRef, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { supabase } from '../../lib/supabase';
import { sendWhatsAppOtp } from '../../services/whatsappAuthService';

const { width, height } = Dimensions.get('window');


// =====================================================
// WHATSAPP LOGO
// =====================================================

function WhatsAppLogo({ size = 20, color = "#071006" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fill={color}
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2Z"
      />
      <Path
        fill="#24e412"
        d="M17.52 14.33C17.22 14.18 15.75 13.45 15.47 13.35C15.2 13.25 15 13.2 14.81 13.5C14.61 13.8 14.04 14.47 13.87 14.67C13.7 14.87 13.52 14.89 13.22 14.74C12.92 14.59 11.96 14.28 10.83 13.27C9.94 12.48 9.35 11.51 9.17 11.21C9 10.91 9.15 10.75 9.3 10.6C9.43 10.47 9.6 10.25 9.75 10.08C9.9 9.9 9.95 9.77 10.05 9.57C10.15 9.37 10.1 9.2 10.02 9.05C9.95 8.9 9.37 7.48 9.13 6.9C8.9 6.34 8.67 6.41 8.5 6.41C8.33 6.4 8.14 6.4 7.94 6.4C7.74 6.4 7.42 6.47 7.15 6.77C6.88 7.07 6.11 7.79 6.11 9.26C6.11 10.73 7.18 12.15 7.33 12.35C7.48 12.55 9.43 15.55 12.41 16.84C13.12 17.15 13.68 17.33 14.11 17.47C14.82 17.7 15.47 17.67 15.98 17.59C16.55 17.5 17.74 16.87 17.99 16.17C18.24 15.47 18.24 14.87 18.16 14.74C18.09 14.62 17.82 14.48 17.52 14.33Z"
      />
    </Svg>
  );
}


// =====================================================
// COUNTRIES
// =====================================================

const countries = [
  {
    name: 'India',
    flag: '🇮🇳',
    code: '+91',
    digits: 10,
  },
  {
    name: 'United States',
    flag: '🇺🇸',
    code: '+1',
    digits: 10,
  },
  {
    name: 'United Kingdom',
    flag: '🇬🇧',
    code: '+44',
    digits: 10,
  },
  {
    name: 'Canada',
    flag: '🇨🇦',
    code: '+1',
    digits: 10,
  },
  {
    name: 'Australia',
    flag: '🇦🇺',
    code: '+61',
    digits: 9,
  },
  {
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    code: '+971',
    digits: 9,
  },
  {
    name: 'Singapore',
    flag: '🇸🇬',
    code: '+65',
    digits: 8,
  },
  {
    name: 'Germany',
    flag: '🇩🇪',
    code: '+49',
    digits: 10,
  },
  {
    name: 'France',
    flag: '🇫🇷',
    code: '+33',
    digits: 9,
  },
];

// =====================================================
// CAROUSEL DATA
// =====================================================

const slides = [
  {
    id: '1',
    image: {
      uri: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200',
    },
  },
  {
    id: '2',
    image: {
      uri: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200',
    },
  },
  {
    id: '3',
    image: {
      uri: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200',
    },
  },
];

// =====================================================
// SIGN IN SCREEN
// =====================================================

export default function SignInScreen({ navigation, route }) {
  const [mobile, setMobile] = useState('');

  const [remember, setRemember] = useState(true);

  const [selectedCountry, setSelectedCountry] =
    useState(countries[0]);

  const [countryModal, setCountryModal] =
    useState(false);

  const [activeSlide, setActiveSlide] =
    useState(0);

  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('whatsapp');
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);

  const carouselRef = useRef(null);

  // ===================================================
  // MOBILE NUMBER
  // ===================================================

  const handleMobileChange = (value) => {
    const numbersOnly = value.replace(
      /[^0-9]/g,
      ''
    );

    const limitedNumber =
      numbersOnly.slice(
        0,
        selectedCountry.digits
      );

    setMobile(limitedNumber);
  };

  // ===================================================
  // COUNTRY SELECT
  // ===================================================

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);

    setMobile('');

    setCountryModal(false);
  };

  // ===================================================
  // SIGN IN + SEND OTP
  // ===================================================

  const handleSignIn = async () => {
    if (
      mobile.length !==
      selectedCountry.digits
    ) {
      alert(
        `Please enter a valid ${selectedCountry.digits}-digit mobile number.`
      );

      return;
    }

    const fullNumber =
      selectedCountry.code + mobile;

    try {
      setLoading(true);

      console.log(
        'Sending OTP to:',
        fullNumber
      );

      const { error } =
        await supabase.auth.signInWithOtp({
          phone: fullNumber,
        });

      if (error) {
        console.log(
          'Send OTP Error:',
          error.message
        );

        alert(
          `Unable to send OTP:\n${error.message}`
        );

        return;
      }

      console.log(
        'OTP sent successfully'
      );

      // Navigate to OTP screen
      navigation.navigate('OTP', {
        mobileNumber: fullNumber,
        channel: 'sms',
        returnTo: route?.params?.returnTo,
      });

    } catch (error) {
      console.log(
        'Unexpected OTP error:',
        error
      );

      alert(
        'Something went wrong while sending OTP. Please try again.'
      );

    } finally {
      setLoading(false);
    }
  };


  // ===================================================
  // WHATSAPP SIGN IN + SEND OTP
  // ===================================================

  const handleWhatsAppSignIn = async () => {
    if (mobile.length !== selectedCountry.digits) {
      Alert.alert(
        'Invalid Mobile Number',
        `Please enter a valid ${selectedCountry.digits}-digit mobile number.`
      );
      return;
    }

    const fullNumber = selectedCountry.code + mobile;

    try {
      setWhatsAppLoading(true);
      console.log('Sending WhatsApp OTP to:', fullNumber);

      const res = await sendWhatsAppOtp(fullNumber);

      if (!res.success) {
        Alert.alert('Unable to Send OTP', res.error || 'Failed to send WhatsApp OTP.');
        return;
      }

      console.log('WhatsApp OTP sent successfully');

      // Navigate to OTP screen with channel: 'whatsapp'
      navigation.navigate('OTP', {
        mobileNumber: fullNumber,
        channel: 'whatsapp',
        returnTo: route?.params?.returnTo,
      });

    } catch (err) {
      console.error('Unexpected WhatsApp OTP error:', err);
      Alert.alert('Error', 'Something went wrong while sending WhatsApp OTP. Please try again.');
    } finally {
      setWhatsAppLoading(false);
    }
  };

  

  // ===================================================
  // CAROUSEL SCROLL
  // ===================================================

  const handleCarouselScroll = (event) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x /
        width
    );

    setActiveSlide(slideIndex);
  };

  // ===================================================
  // DOT CLICK
  // ===================================================

  const goToSlide = (index) => {
    carouselRef.current?.scrollToIndex({
      index: index,
      animated: true,
    });

    setActiveSlide(index);
  };

  // ===================================================
  // CAROUSEL ITEM
  // ===================================================

  const renderSlide = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image
          source={item.image}
          style={styles.fullImage}
          resizeMode="cover"
        />
      </View>
    );
  };

  // ===================================================
  // MAIN SCREEN
  // ===================================================

  return (
    <View style={styles.container}>

      <StatusBar
        barStyle="light-content"
        backgroundColor="#07111F"
      />

      {/* =================================================
          TOP HALF - FULL IMAGE CAROUSEL
      ================================================= */}

      <View style={styles.topSection}>

        <FlatList
          ref={carouselRef}

          data={slides}

          renderItem={renderSlide}

          keyExtractor={(item) =>
            item.id
          }

          horizontal={true}

          pagingEnabled={true}

          showsHorizontalScrollIndicator={
            false
          }

          onScroll={
            handleCarouselScroll
          }

          scrollEventThrottle={16}
        />

        {/* CAROUSEL DOTS */}

        <View style={styles.dotsContainer}>

          {slides.map((slide, index) => (

            <TouchableOpacity
              key={slide.id}
              onPress={() =>
                goToSlide(index)
              }
              activeOpacity={0.8}
            >

              <View
                style={[
                  styles.dot,

                  activeSlide === index &&
                    styles.activeDot,
                ]}
              />

            </TouchableOpacity>

          ))}

        </View>

      </View>

      {/* =================================================
          BOTTOM HALF - SIGN IN
      ================================================= */}

      <View style={styles.bottomSection}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.bottomScrollContent}
          keyboardShouldPersistTaps="handled"
        >


        {/* LOGIN METHOD SELECTOR */}
        <View style={styles.methodTabs}>
          <TouchableOpacity
            style={[styles.methodTab, loginMethod === 'whatsapp' && styles.methodTabActive]}
            onPress={() => setLoginMethod('whatsapp')}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityLabel="WhatsApp Login"
          >
            <WhatsAppLogo size={16} />
            <Text style={[styles.methodTabText, loginMethod === 'whatsapp' && styles.methodTabTextActive]}>
              WhatsApp
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodTab, loginMethod === 'sms' && styles.methodTabActive]}
            onPress={() => setLoginMethod('sms')}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityLabel="Mobile SMS Login"
          >
            <Text style={[styles.smsTabIcon, loginMethod === 'sms' && styles.smsTabIconActive]}>💬</Text>
            <Text style={[styles.methodTabText, loginMethod === 'sms' && styles.methodTabTextActive]}>
              Mobile SMS
            </Text>
          </TouchableOpacity>
        </View>

        {/* TITLE */}

        <Text style={styles.loginTitle}>
          Find your perfect plot
        </Text>

        <Text style={styles.loginSubtitle}>
          Sign in to discover plots from anywhere
        </Text>

        {/* =================================================
            MOBILE NUMBER
        ================================================= */}

        <View style={styles.mobileBox}>

          {/* COUNTRY SELECT */}

          <TouchableOpacity
            style={styles.countryButton}
            onPress={() =>
              setCountryModal(true)
            }
            activeOpacity={0.7}
          >

            <Text style={styles.flag}>
              {selectedCountry.flag}
            </Text>

            <Text style={styles.arrow}>
              ▼
            </Text>

          </TouchableOpacity>

          {/* DIVIDER */}

          <View style={styles.divider} />

          {/* COUNTRY CODE */}

          <Text style={styles.countryCode}>
            {selectedCountry.code}
          </Text>

          {/* MOBILE INPUT */}

          <TextInput
            style={styles.mobileInput}

            placeholder="Enter your mobile number"

            placeholderTextColor="#7C8FA5"

            keyboardType="number-pad"

            value={mobile}

            onChangeText={
              handleMobileChange
            }

            maxLength={
              selectedCountry.digits
            }

            returnKeyType="done"
          />

        </View>

        {/* NUMBER COUNT */}

        <View style={styles.numberInfo}>

          <Text style={styles.counter}>
            {mobile.length}/
            {selectedCountry.digits}
          </Text>

          {mobile.length ===
            selectedCountry.digits && (

            <Text style={styles.validText}>
              ✓ Valid number
            </Text>

          )}

        </View>

        {/* =================================================
            REMEMBER CHECKBOX
        ================================================= */}

        <TouchableOpacity
          style={styles.rememberRow}
          onPress={() =>
            setRemember(!remember)
          }
          activeOpacity={0.8}
        >

          <View
            style={[
              styles.checkbox,

              remember &&
                styles.checkboxChecked,
            ]}
          >

            {remember && (
              <Text style={styles.checkMark}>
                ✓
              </Text>
            )}

          </View>

          <Text style={styles.rememberText}>
            Remember my number for faster sign-in
          </Text>

        </TouchableOpacity>

        {/* =================================================
            PRIMARY ACTION BUTTON (WHATSAPP OR SMS)
        ================================================= */}

        {loginMethod === 'whatsapp' ? (
          <TouchableOpacity
            style={[
              styles.whatsAppButton,
              mobile.length === selectedCountry.digits
                ? styles.whatsAppActive
                : styles.whatsAppDisabled,
            ]}
            onPress={handleWhatsAppSignIn}
            activeOpacity={0.8}
            disabled={whatsAppLoading}
            accessibilityRole="button"
            accessibilityLabel="Continue with WhatsApp"
          >
            {whatsAppLoading ? (
              <ActivityIndicator color="#071006" size="small" />
            ) : (
              <>
                <WhatsAppLogo size={20} />
                <Text style={styles.whatsAppText}>
                  Continue with WhatsApp
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.signInButton,
              mobile.length === selectedCountry.digits
                ? styles.signInActive
                : styles.signInDisabled,
            ]}
            onPress={handleSignIn}
            activeOpacity={0.8}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Sign in with SMS"
          >
            <Text style={styles.signInText}>
              {loading ? 'Sending OTP...' : 'Sign In with SMS'}
            </Text>
            {!loading && <Text style={styles.arrowRight}>→</Text>}
          </TouchableOpacity>
        )}



        
        {/* =================================================
            TERMS
        ================================================= */}

        <Text style={styles.termsText}>
          By continuing, you agree to our
        </Text>

        <View style={styles.policyRow}>

          <Text style={styles.policyText}>
            Terms of Service
          </Text>

          <Text style={styles.policyText}>
            Privacy Policy
          </Text>

          <Text style={styles.policyText}>
            Content Policy
          </Text>

        </View>

        </ScrollView>
      </View>

      {/* =================================================
          COUNTRY MODAL
      ================================================= */}

      <Modal
        visible={countryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() =>
          setCountryModal(false)
        }
      >

        <View style={styles.modalBackground}>

          <View style={styles.countryModal}>

            {/* MODAL HEADER */}

            <View style={styles.modalHeader}>

              <Text style={styles.modalTitle}>
                Select Country
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setCountryModal(false)
                }
              >

                <Text style={styles.closeButton}>
                  ✕
                </Text>

              </TouchableOpacity>

            </View>

            {/* COUNTRY LIST */}

            <FlatList
              data={countries}

              keyExtractor={(item) =>
                item.name
              }

              showsVerticalScrollIndicator={
                false
              }

              renderItem={({
                item,
              }) => (

                <TouchableOpacity
                  style={styles.countryRow}
                  onPress={() =>
                    handleCountrySelect(
                      item
                    )
                  }
                  activeOpacity={0.7}
                >

                  <Text
                    style={
                      styles.countryFlag
                    }
                  >
                    {item.flag}
                  </Text>

                  <Text
                    style={
                      styles.countryName
                    }
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.countryCodeModal
                    }
                  >
                    {item.code}
                  </Text>

                </TouchableOpacity>

              )}
            />

          </View>

        </View>

      </Modal>

    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  // ===================================================
  // MAIN
  // ===================================================

  container: {
    flex: 1,
    backgroundColor: '#07111F',
  },

  // ===================================================
  // TOP IMAGE
  // ===================================================

  topSection: {
    height: height * 0.50,
    position: 'relative',
  },

  slide: {
    width: width,
    height: height * 0.50,
    backgroundColor: '#07111F',
  },

  fullImage: {
    width: '100%',
    height: '100%',
  },

  // ===================================================
  // DOTS
  // ===================================================

  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,

    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',
  },

  dot: {
    width: 8,
    height: 8,

    borderRadius: 10,

    backgroundColor: '#B8C5D3',

    marginHorizontal: 5,
  },

  activeDot: {
    width: 10,
    height: 10,

    backgroundColor: '#24e412',
  },

  // ===================================================
  // BOTTOM SECTION
  // ===================================================

  bottomSection: {
    flex: 1,

    backgroundColor: '#141515',

    borderTopLeftRadius: 28,

    borderTopRightRadius: 28,

    paddingHorizontal: 20,

    paddingTop: 14,
  },
  bottomScrollContent: {
    paddingBottom: 20,
  },

  methodTabs: {
    flexDirection: 'row',
    backgroundColor: '#0C100E',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },

  methodTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  methodTabText: {
    color: '#8E9AA8',
    fontSize: 12,
    fontWeight: '600',
  },

  methodTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  smsTabIcon: {
    fontSize: 12,
    opacity: 0.6,
  },

  smsTabIconActive: {
    opacity: 1,
  },

  whatsAppButton: {
    height: 48,
    borderRadius: 14,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 2,
    shadowColor: '#24e412',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  whatsAppActive: {
    backgroundColor: '#24e412',
  },

  whatsAppDisabled: {
    backgroundColor: '#24e412',
    opacity: 0.5,
  },

  whatsAppText: {
    color: '#071006',
    fontSize: 16,
    fontWeight: '700',
  },

  loginTitle: {
    color: '#FFFFFF',

    fontSize: 20,

    fontWeight: '700',
  },

  loginSubtitle: {
    color: '#dce5ef',

    fontSize: 11,

    marginTop: 3,

    marginBottom: 10,
  },

  // ===================================================
  // MOBILE BOX
  // ===================================================

  mobileBox: {
    height: 53,

    borderWidth: 1,

    borderColor: '#dee8dd',

    borderRadius: 14,

    backgroundColor: '#0f0f0f',

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 10,
  },

  countryButton: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    minWidth: 48,
  },

  flag: {
    fontSize: 21,
  },

  arrow: {
    color: '#e0e7ef',

    fontSize: 9,

    marginLeft: 5,
  },

  divider: {
    width: 1,

    height: 27,

    backgroundColor: '#ebf0f6',

    marginHorizontal: 8,
  },

  countryCode: {
    color: '#FFFFFF',

    fontSize: 15,

    fontWeight: '600',
  },

  mobileInput: {
    flex: 1,

    color: '#FFFFFF',

    fontSize: 14,

    marginLeft: 8,

    paddingVertical: 0,
  },

  // ===================================================
  // NUMBER INFO
  // ===================================================

  numberInfo: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    paddingHorizontal: 4,

    marginTop: 3,

    height: 13,
  },

  counter: {
    color: '#e7eaed',

    fontSize: 9,
  },

  validText: {
    color: '#e2e6eb',

    fontSize: 9,

    fontWeight: '600',
  },

  // ===================================================
  // REMEMBER
  // ===================================================

  rememberRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 10,
  },

  checkbox: {
    width: 21,

    height: 21,

    borderRadius: 6,

    borderWidth: 1,

    borderColor: '#24e412',

    justifyContent: 'center',

    alignItems: 'center',
  },

  checkboxChecked: {
    backgroundColor: '#24e412',
  },

  checkMark: {
    color: '#FFFFFF',

    fontSize: 13,

    fontWeight: '900',
  },

  rememberText: {
    color: '#C3D0DE',

    fontSize: 11,

    marginLeft: 8,

    flex: 1,
  },

  // ===================================================
  // SIGN IN
  // ===================================================

  signInButton: {
    height: 48,

    borderRadius: 14,

    marginTop: 20,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  signInActive: {
    backgroundColor: '#24e412',
  },

  signInDisabled: {
    backgroundColor: '#24e412',
  },

  signInText: {
    color: '#FFFFFF',

    fontSize: 16,

    fontWeight: '700',
  },

  arrowRight: {
    color: '#FFFFFF',

    fontSize: 23,

    marginLeft: 12,

    marginTop: -2,
  },

  // ===================================================
  // TERMS
  // ===================================================

  termsText: {
    color: '#74879B',

    fontSize: 9,

    textAlign: 'center',

    marginTop: 10,
  },

  policyRow: {
    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    marginTop: 5,
  },

  policyText: {
    color: '#AFC0D1',

    fontSize: 8,

    textDecorationLine: 'underline',

    marginHorizontal: 5,
  },

  // ===================================================
  // MODAL
  // ===================================================

  modalBackground: {
    flex: 1,

    backgroundColor:
      'rgba(0, 0, 0, 0.70)',

    justifyContent: 'flex-end',
  },

  countryModal: {
    backgroundColor: '#0d0e0e',

    maxHeight: '72%',

    borderTopLeftRadius: 28,

    borderTopRightRadius: 28,

    paddingBottom: 20,
  },

  modalHeader: {
    height: 60,

    paddingHorizontal: 20,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    borderBottomWidth: 1,

    borderBottomColor: '#24e412',
  },

  modalTitle: {
    color: '#FFFFFF',

    fontSize: 19,

    fontWeight: '700',
  },

  closeButton: {
    color: '#FFFFFF',

    fontSize: 20,
  },

  // ===================================================
  // COUNTRY ROW
  // ===================================================

  countryRow: {
    height: 55,

    paddingHorizontal: 20,

    flexDirection: 'row',

    alignItems: 'center',

    borderBottomWidth: 1,
  },

  countryFlag: {
    fontSize: 23,

    width: 45,
  },

  countryName: {
    flex: 1,

    color: '#FFFFFF',

    fontSize: 14,
  },

  countryCodeModal: {
    color: '#24e412',

    fontSize: 14,

    fontWeight: '600',
  },

});