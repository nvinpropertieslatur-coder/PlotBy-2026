// @ts-nocheck
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { Ionicons } from '@expo/vector-icons';

import { getAuthReturnState } from '../../navigation/authReturn';
import { showSuccessMessage } from '../../utils/showSuccessMessage';
import { supabase } from '../../lib/supabase';

export default function OTPScreen({
  route,
  navigation,
}) {

  // =====================================================
  // GET MOBILE NUMBER FROM SIGN IN SCREEN
  // =====================================================

  const mobileNumber =
    route?.params?.mobileNumber || '';

  // =====================================================
  // OTP STATE - 6 DIGITS
  // =====================================================

  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  // =====================================================
  // TIMER
  // =====================================================

  const [timeLeft, setTimeLeft] =
    useState(24);

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // OTP INPUT REFERENCES
  // =====================================================

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // =====================================================
  // COUNTDOWN TIMER
  // =====================================================

  useEffect(() => {

    if (timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {

      setTimeLeft(
        (previousTime) => {

          if (previousTime <= 1) {
            return 0;
          }

          return previousTime - 1;

        }
      );

    }, 1000);

    return () => {
      clearInterval(timer);
    };

  }, [timeLeft]);

  // =====================================================
  // OTP INPUT
  // =====================================================

  const handleOTPChange = (
    value,
    index
  ) => {

    const number =
      value.replace(
        /[^0-9]/g,
        ''
      );

    const newOtp = [...otp];

    newOtp[index] = number;

    setOtp(newOtp);

    // Automatically move to next box
    if (
      number &&
      index < 5
    ) {

      inputRefs[index + 1]
        .current
        ?.focus();

    }
  };

  // =====================================================
  // BACKSPACE
  // =====================================================

  const handleKeyPress = (
    event,
    index
  ) => {

    if (
      event.nativeEvent.key ===
        'Backspace' &&
      otp[index] === '' &&
      index > 0
    ) {

      inputRefs[index - 1]
        .current
        ?.focus();

    }
  };

  // =====================================================
  // VERIFY OTP WITH SUPABASE
  // =====================================================

  const handleVerify = async () => {

    const enteredOTP =
      otp.join('');

    // Check OTP length

    if (
      enteredOTP.length !== 6
    ) {

      Alert.alert(
        'Invalid OTP',
        'Please enter the complete 6-digit OTP.'
      );

      return;
    }

    if (!mobileNumber) {

      Alert.alert(
        'Error',
        'Mobile number is missing. Please go back and try again.'
      );

      return;
    }

    try {

      setLoading(true);





      // =================================================
      // VERIFY OTP USING SUPABASE
      // =================================================

      const {
        data,
        error,
      } =
        await supabase.auth.verifyOtp({
          phone: mobileNumber,
          token: enteredOTP,
          type: 'sms',
        });

      // =================================================
      // OTP ERROR
      // =================================================

      if (error) {

        console.log(
          'OTP Verification Error:',
          error.message
        );

        Alert.alert(
          'Invalid OTP',
          error.message
        );

        return;
      }

      if (!data?.session || !data?.user) throw new Error('Verification did not create a sign-in session. Please try again.');

      // =================================================
      // SAVE USER IN USERS TABLE
      // =================================================

      if (data?.user) {

        const {
          error: userError,
        } =
          await supabase
            .from('users')
            .upsert(
              {
                id: data.user.id,

                phone: mobileNumber,
              },
              {
                onConflict: 'id',
              }
            );

        // =================================================
        // DATABASE ERROR
        // =================================================

        if (userError) {
          // Authentication has succeeded; profile-table sync is a separate operation.
          console.warn('Signed in, but user profile sync needs attention:', userError.message);
        }

        console.log(
          'User saved successfully'
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      showSuccessMessage(
        'Verification Successful',
        'You have successfully signed in!',
        () => navigation.reset(getAuthReturnState(route?.params?.returnTo, navigation.getState().routes))
      );

    } catch (error) {

      console.log(
        'Unexpected verification error:',
        error
      );

      Alert.alert(
        'Error',
        'Something went wrong. Please try again.'
      );

    } finally {

      setLoading(false);

    }
  };

  // =====================================================
  // RESEND OTP
  // =====================================================

  const handleResend = async () => {

    if (timeLeft > 0) {
      return;
    }

    if (!mobileNumber) {

      Alert.alert(
        'Error',
        'Mobile number is missing.'
      );

      return;
    }

    try {

      setLoading(true);

      // =================================================
      // REQUEST NEW OTP
      // =================================================

      const {
        error,
      } =
        await supabase.auth.signInWithOtp({
          phone: mobileNumber,
        });

      if (error) {

        console.log(
          'Resend OTP Error:',
          error.message
        );

        Alert.alert(
          'Error',
          error.message
        );

        return;
      }

      // =================================================
      // CLEAR OLD OTP
      // =================================================

      setOtp([
        '',
        '',
        '',
        '',
        '',
        '',
      ]);

      // =================================================
      // RESET TIMER
      // =================================================

      setTimeLeft(24);

      // =================================================
      // FOCUS FIRST BOX
      // =================================================

      setTimeout(() => {

        inputRefs[0]
          .current
          ?.focus();

      }, 100);

      Alert.alert(
        'OTP Sent',
        `A new OTP has been sent to ${mobileNumber}`
      );

    } catch (error) {

      console.log(
        'Resend error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to resend OTP.'
      );

    } finally {

      setLoading(false);

    }
  };

  // =====================================================
  // TIMER FORMAT
  // =====================================================

  const formattedTime =
    `00:${String(timeLeft).padStart(
      2,
      '0'
    )}`;

  // =====================================================
  // SCREEN
  // =====================================================

  return (

    <LinearGradient
      colors={[
        '#020604',
        '#061009',
        '#020604',
      ]}
      style={styles.container}
    >

      <View style={styles.content}>

        {/* ==========================================
            BACK BUTTON
        ========================================== */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
        >

          <Ionicons
            name="chevron-back"
            size={20}
            color="#FFFFFF"
          />

        </TouchableOpacity>

        {/* ==========================================
            VERIFICATION ICON
        ========================================== */}

        <View style={styles.iconOuter}>

          <View style={styles.iconInner}>

            <Ionicons
              name="shield-checkmark-outline"
              size={27}
              color="#7CFF36"
            />

          </View>

        </View>

        {/* ==========================================
            HEADING
        ========================================== */}

        <Text style={styles.secureText}>
          SECURE VERIFICATION
        </Text>

        <Text style={styles.title}>
          Enter your OTP
        </Text>

        {/* ==========================================
            MOBILE NUMBER
        ========================================== */}

        <Text style={styles.description}>

          A 6-digit code was sent to{' '}

          <Text style={styles.phoneNumber}>
            {mobileNumber}
          </Text>

          {'\n'}

          Enter it below to continue.

        </Text>

        {/* ==========================================
            OTP BOXES
        ========================================== */}

        <View style={styles.otpContainer}>

          {otp.map(
            (digit, index) => (

              <TextInput
                key={index}

                ref={
                  inputRefs[index]
                }

                style={[
                  styles.otpBox,

                  digit !== '' &&
                    styles.otpBoxFilled,
                ]}

                value={digit}

                onChangeText={(
                  value
                ) =>
                  handleOTPChange(
                    value,
                    index
                  )
                }

                onKeyPress={(
                  event
                ) =>
                  handleKeyPress(
                    event,
                    index
                  )
                }

                keyboardType="number-pad"

                maxLength={1}

                textAlign="center"

                selectionColor="#7CFF36"

                scrollEnabled={false}

                autoCorrect={false}

                autoCapitalize="none"

              />

            )
          )}

        </View>

        {/* ==========================================
            RESEND
        ========================================== */}

        <View style={styles.resendRow}>

          <Text style={styles.resendText}>
            Didnt receive the code?
          </Text>

          <TouchableOpacity
            onPress={handleResend}
            disabled={
              timeLeft > 0 ||
              loading
            }
            activeOpacity={0.7}
          >

            <Text
              style={[
                styles.resendButton,

                timeLeft > 0 &&
                  styles.resendDisabled,
              ]}
            >
              Resend
            </Text>

          </TouchableOpacity>

          <Text
            style={[
              styles.timer,

              timeLeft === 0 &&
                styles.timerFinished,
            ]}
          >
            {formattedTime}
          </Text>

        </View>

        {/* ==========================================
            VERIFY BUTTON
        ========================================== */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.buttonWrapper}
          onPress={handleVerify}
          disabled={loading}
        >

          <LinearGradient
            colors={[
              '#7CFF36',
              '#78FF35',
            ]}
            style={styles.verifyButton}
          >

            <Text style={styles.verifyText}>

              {loading
                ? 'Verifying...'
                : 'Verify and continue'}

            </Text>

            {!loading && (
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color="#071006"
              />
            )}

          </LinearGradient>

        </TouchableOpacity>

      </View>

    </LinearGradient>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  content: {
    flex: 1,

    paddingHorizontal: 26,

    paddingTop: 45,
  },

  // ===================================================
  // BACK BUTTON
  // ===================================================

  backButton: {
    width: 32,

    height: 32,

    borderRadius: 9,

    backgroundColor: '#101916',

    borderWidth: 1,

    borderColor: '#38453E',

    justifyContent: 'center',

    alignItems: 'center',

    marginBottom: 55,
  },

  // ===================================================
  // ICON
  // ===================================================

  iconOuter: {
    width: 52,

    height: 52,

    borderRadius: 17,

    backgroundColor: '#0C180E',

    borderWidth: 1,

    borderColor: '#263C27',

    justifyContent: 'center',

    alignItems: 'center',

    alignSelf: 'center',
  },

  iconInner: {
    width: 42,

    height: 42,

    borderRadius: 13,

    backgroundColor: '#101E12',

    justifyContent: 'center',

    alignItems: 'center',
  },

  // ===================================================
  // HEADINGS
  // ===================================================

  secureText: {
    color: '#7CFF36',

    fontSize: 7,

    fontWeight: '800',

    letterSpacing: 0.5,

    textAlign: 'center',

    marginTop: 17,
  },

  title: {
    color: '#FFFFFF',

    fontSize: 21,

    fontWeight: '500',

    textAlign: 'center',

    marginTop: 4,
  },

  description: {
    color: '#8C9790',

    fontSize: 9,

    lineHeight: 14,

    textAlign: 'center',

    marginTop: 7,

    paddingHorizontal: 20,
  },

  phoneNumber: {
    color: '#FFFFFF',

    fontWeight: '700',
  },

  // ===================================================
  // OTP
  // ===================================================

  otpContainer: {
    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    width: '100%',

    marginTop: 25,
  },

  otpBox: {
    width: 43,

    height: 43,

    borderRadius: 7,

    borderWidth: 1,

    borderColor: '#52605A',

    backgroundColor: '#0B1410',

    color: '#FFFFFF',

    fontSize: 18,

    fontWeight: '700',

    textAlign: 'center',

    marginHorizontal: 3,

    padding: 0,
  },

  otpBoxFilled: {
    borderColor: '#7CFF36',

    backgroundColor: '#101E12',
  },

  // ===================================================
  // RESEND
  // ===================================================

  resendRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 18,
  },

  resendText: {
    color: '#727E76',

    fontSize: 8,
  },

  resendButton: {
    color: '#7CFF36',

    fontSize: 8,

    marginLeft: 4,

    textDecorationLine: 'underline',
  },

  resendDisabled: {
    color: '#4A514D',

    textDecorationLine: 'none',
  },

  timer: {
    color: '#59635D',

    fontSize: 8,

    marginLeft: 'auto',
  },

  timerFinished: {
    color: '#7CFF36',
  },

  // ===================================================
  // VERIFY BUTTON
  // ===================================================

  buttonWrapper: {
    marginTop: 27,

    shadowColor: '#7CFF36',

    shadowOffset: {
      width: 0,
      height: 0,
    },

    shadowOpacity: 0.25,

    shadowRadius: 12,

    elevation: 6,
  },

  verifyButton: {
    height: 47,

    borderRadius: 14,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  verifyText: {
    color: '#071006',

    fontSize: 11,

    fontWeight: '800',

    marginRight: 8,
  },

});