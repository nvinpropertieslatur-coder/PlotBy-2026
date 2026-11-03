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
} from 'react-native';

import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

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
            SIGN IN BUTTON
        ================================================= */}

        <TouchableOpacity
          style={[
            styles.signInButton,

            mobile.length ===
              selectedCountry.digits
              ? styles.signInActive
              : styles.signInDisabled,
          ]}
          onPress={handleSignIn}
          activeOpacity={0.8}
          disabled={loading}
        >

          <Text style={styles.signInText}>
            {loading
              ? 'Sending OTP...'
              : 'Sign In'}
          </Text>

          {!loading && (
            <Text style={styles.arrowRight}>
              →
            </Text>
          )}

        </TouchableOpacity>

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