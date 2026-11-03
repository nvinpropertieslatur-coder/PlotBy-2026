// @ts-nocheck
import React, { useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import colorsV1 from '../../theme/colors.v1';
import typographyV1 from '../../theme/typography.v1';

import GlassCardV1 from '../../components/GlassCardV1';
import ButtonV1 from '../../components/ButtonV1';
import ScreenHeaderV1 from '../../components/ScreenHeaderV1';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const featureSlides = [
  {
    id: 'location',
    label: 'PlotBy Premium',
    title: 'Unlimited Location Links',
    description:
      'Share property locations instantly and help buyers find the right place faster.',
    //image: require('../assets/location-feature.png'),
  },

  {
    id: 'chat',
    label: 'PlotBy Premium',
    title: 'Enhanced Chat',
    description:
      'Connect with property owners and agents through a smoother and faster chat experience.',
    //image: require('../assets/chat-feature.png'),
  },

  {
    id: 'property',
    label: 'PlotBy Premium',
    title: 'Find Your Perfect Property',
    description:
      'Discover properties that match your needs, location and budget with ease.',
    //image: require('../assets/property-feature.png'),
  },
];


/* =========================================================
   SUBSCRIPTION PLANS
   ========================================================= */

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    icon: '◎',
    price: '₹1,499',
    credits: '600',
    popular: true,
  },

  {
    id: 'professional',
    name: 'Professional',
    icon: '♕',
    price: '₹2,599',
    credits: '1,200',
    popular: false,
  },

  {
    id: 'premium',
    name: 'Premium',
    icon: '♛',
    price: '₹7,499',
    credits: '3,000',
    popular: false,
  },
];


/* =========================================================
   SCREEN
   ========================================================= */

const SubscriptionScreen = ({
  onBack,
  onProceedToPay,
}) => {

  const insets = useSafeAreaInsets();


  /* =======================================================
     SELECTED PLAN
     ======================================================= */

  const [selectedPlan, setSelectedPlan] =
    useState('starter');

  const [activeFeature, setActiveFeature] =
  useState(0);


  /* =======================================================
     PAYMENT
     ======================================================= */

  const handleProceedToPay = () => {

    const selectedPlanData =
      plans.find(
        (plan) =>
          plan.id === selectedPlan
      );

    onProceedToPay?.({
      plan: selectedPlanData,
    });
  };


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* =================================================
            HEADER
            ================================================= */}

        <ScreenHeaderV1
          title="Subscription"
          subtitle="Premium tools for better property discovery"
          onBack={onBack}
        />


        {/* =================================================
            HERO
            ================================================= */}

        <View style={styles.hero}>

          <Text style={styles.heroTitle}>
            Find Better{'\n'}
            Properties,{' '}
            <Text style={styles.greenText}>
              Faster
            </Text>
          </Text>


          <Text style={styles.heroDescription}>
            Unlock premium tools to discover, compare,
            {'\n'}
            and secure your ideal property.
          </Text>

        </View>


        {/* =================================================
            FEATURES
            ================================================= */}

{/* =================================================
    FEATURE PROMOTIONAL CAROUSEL
    ================================================= */}

<View style={styles.featureCarouselContainer}>

  <ScrollView
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    decelerationRate="fast"
    snapToInterval={SCREEN_WIDTH - 40}
    onMomentumScrollEnd={(event) => {

      const slideWidth =
        SCREEN_WIDTH - 40;

      const index =
        Math.round(
          event.nativeEvent.contentOffset.x /
          slideWidth
        );

      setActiveFeature(index);
    }}
  >

    {featureSlides.map((slide) => (

      <GlassCardV1
        key={slide.id}
        style={styles.featurePromoCard}
      >

        {/* IMAGE */}

        <View style={styles.featureImageContainer}>

          <Image
            source={slide.image}
            style={styles.featureImage}
            resizeMode="cover"
          />

        </View>


        {/* TEXT */}

        <View style={styles.featureTextContainer}>

          <Text style={styles.featureLabel}>
            {slide.label}
          </Text>

          <Text style={styles.featureTitle}>
            {slide.title}
          </Text>

          <Text style={styles.featureDescription}>
            {slide.description}
          </Text>

        </View>

      </GlassCardV1>

    ))}

  </ScrollView>


  {/* DOT INDICATORS */}

  <View style={styles.featureDots}>

    {featureSlides.map((slide, index) => (

      <View
        key={slide.id}
        style={[
          styles.featureDot,

          activeFeature === index &&
            styles.featureDotActive,
        ]}
      />

    ))}

  </View>

</View>


        {/* =================================================
            PLAN HEADING
            ================================================= */}

        <View style={styles.planHeading}>

          <Text style={styles.sectionTitle}>
            Choose a plan that fits your goals
          </Text>

          <Text style={styles.sectionSubtitle}>
            Flexible plans for every property seeker.
          </Text>

        </View>


        {/* =================================================
            PLAN CARDS
            ================================================= */}

        <View style={styles.plansContainer}>

          {plans.map((plan) => {

            const selected =
              selectedPlan === plan.id;


            return (
              <Pressable
                key={plan.id}
                onPress={() =>
                  setSelectedPlan(plan.id)
                }
                style={({ pressed }) => [
                  styles.planPressable,
                  pressed &&
                    styles.planPressed,
                ]}
              >

                <GlassCardV1
                  style={[
                    styles.planCard,

                    selected &&
                      styles.selectedPlanCard,
                  ]}
                >

                  {/* =======================================
                      POPULAR BADGE
                      ======================================= */}

                  {plan.popular && (
                    <View style={styles.popularBadge}>

                      <Text style={styles.popularText}>
                        MOST POPULAR
                      </Text>

                    </View>
                  )}


                  {/* =======================================
                      PLAN ICON
                      ======================================= */}

                  <View style={styles.planIconContainer}>

                    <Text
                      style={[
                        styles.planIcon,
                        selected &&
                          styles.selectedPlanIcon,
                      ]}
                    >
                      {plan.icon}
                    </Text>

                  </View>


                  {/* =======================================
                      PLAN NAME
                      ======================================= */}

                  <Text
                    style={[
                      styles.planName,
                      selected &&
                        styles.selectedPlanText,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                  >
                    {plan.name}
                  </Text>


                  {/* =======================================
                      PRICE
                      ======================================= */}

                  <Text
                    style={styles.planPrice}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.65}
                  >
                    {plan.price}
                  </Text>


                  <Text style={styles.perMonth}>
                    /month
                  </Text>


                  {/* =======================================
                      DIVIDER
                      ======================================= */}

                  <View style={styles.planDivider} />


                  {/* =======================================
                      CREDITS
                      ======================================= */}

                  <Text style={styles.creditAmount}>
                    {plan.credits}
                  </Text>

                  <Text style={styles.creditLabel}>
                    Credits
                  </Text>


                  {/* =======================================
                      SELECTED CHECK
                      ======================================= */}

                  {selected && (
                    <View style={styles.selectedIndicator}>

                      <Text style={styles.selectedCheck}>
                        ✓
                      </Text>

                    </View>
                  )}

                </GlassCardV1>

              </Pressable>
            );
          })}

        </View>


        {/* =================================================
            AVAILABLE BALANCE
            ================================================= */}

        <GlassCardV1
          style={styles.balanceCard}
        >

          <View style={styles.balanceContent}>

            <Text style={styles.smallLabel}>
              AVAILABLE BALANCE
            </Text>

            <Text style={styles.balanceValue}>
              100 Credits
            </Text>

            <Text style={styles.balanceDescription}>
              Credits available in your PlotBy account
            </Text>

          </View>


          <View style={styles.balanceIcon}>

            <Text style={styles.balanceIconText}>
              ◉
            </Text>

          </View>

        </GlassCardV1>


        {/* =================================================
            REFERRAL BONUS
            ================================================= */}

        <GlassCardV1
          style={styles.referralCard}
        >

          <View style={styles.referralIcon}>

            <Text style={styles.referralIconText}>
              ♧
            </Text>

          </View>


          <View style={styles.referralContent}>

            <Text style={styles.referralTitle}>
              Referral Bonus
            </Text>

            <Text style={styles.referralDescription}>
              +20 Credits for every successful referral
            </Text>

          </View>

        </GlassCardV1>


        {/* =================================================
            WARNING
            ================================================= */}

        <GlassCardV1
          style={styles.warningCard}
        >

          <Text style={styles.warningIcon}>
            !
          </Text>


          <Text style={styles.warningText}>
            Subscription credits are non-refundable once
            the plan has been activated.
          </Text>

        </GlassCardV1>


        {/* =================================================
            PAYMENT BUTTON
            ================================================= */}

        <ButtonV1
          title="Proceed to Pay"
          onPress={handleProceedToPay}
          style={styles.paymentButton}
        />


        <View style={styles.bottomSpace} />

      </ScrollView>

    </View>
  );
};


/* =========================================================
   STYLES
   ========================================================= */

const styles = StyleSheet.create({

  /* =====================================================
     SCREEN
     ===================================================== */

  screen: {
    flex: 1,

    backgroundColor:
      colorsV1.backgroundColor,
  },


  scrollContent: {
    paddingHorizontal: 20,

    paddingTop: 8,

    paddingBottom: 40,
  },


  /* =====================================================
     HERO
     ===================================================== */

  hero: {
    marginTop: 28,
  },


  heroTitle: {
    ...typographyV1.h1,

    color:
      colorsV1.textPrimary,

    fontSize: 32,

    lineHeight: 39,

    fontWeight: '700',
  },


  greenText: {
    color:
      colorsV1.primaryColor,
  },


  heroDescription: {
    ...typographyV1.body,

    marginTop: 10,

    color:
      colorsV1.textSecondary,
  },


  /* =====================================================
     FEATURES
     ===================================================== */

  /* =====================================================
   FEATURE PROMOTIONAL CAROUSEL
   ===================================================== */

featureCarouselContainer: {
  marginTop: 26,

  width: '100%',
},


featurePromoCard: {
  width: SCREEN_WIDTH - 40,

  minHeight: 350,

  borderRadius: 24,

  overflow: 'hidden',

  padding: 0,
},


/* =====================================================
   FEATURE IMAGE
   ===================================================== */

featureImageContainer: {
  width: '100%',

  height: 190,

  backgroundColor:
    colorsV1.backgroundSecondary,

  overflow: 'hidden',
},


featureImage: {
  width: '100%',

  height: '100%',
},


/* =====================================================
   FEATURE TEXT
   ===================================================== */

featureTextContainer: {
  paddingHorizontal: 22,

  paddingTop: 18,

  paddingBottom: 20,
},


featureLabel: {
  ...typographyV1.caption,

  color:
    colorsV1.primaryColor,

  fontWeight: '600',

  marginBottom: 7,
},


featureTitle: {
  ...typographyV1.h2,

  color:
    colorsV1.textPrimary,

  fontSize: 21,

  lineHeight: 27,
},


featureDescription: {
  ...typographyV1.body,

  color:
    colorsV1.textSecondary,

  marginTop: 8,

  lineHeight: 20,
},


/* =====================================================
   DOTS
   ===================================================== */

featureDots: {
  flexDirection: 'row',

  alignItems: 'center',

  justifyContent: 'center',

  marginTop: 12,

  gap: 6,
},


featureDot: {
  width: 7,

  height: 7,

  borderRadius: 4,

  backgroundColor:
    colorsV1.textMuted,
},


featureDotActive: {
  width: 22,

  backgroundColor:
    colorsV1.primaryColor,
},

  /* =====================================================
     PLAN HEADING
     ===================================================== */

  planHeading: {
    marginTop: 20,
  },


  sectionTitle: {
    ...typographyV1.h2,

    color:
      colorsV1.textPrimary,

    fontSize: 21,
  },


  sectionSubtitle: {
    ...typographyV1.body,

    marginTop: 5,

    color:
      colorsV1.textSecondary,
  },


  /* =====================================================
     PLAN CARDS
     ===================================================== */

  plansContainer: {
    width: '100%',

    flexDirection: 'row',

    gap: 10,

    marginTop: 20,
  },


  planPressable: {
    flex: 1,

    minWidth: 0,
  },


  planPressed: {
    opacity: 0.8,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },


  planCard: {
    minHeight: 275,

    paddingHorizontal: 12,

    paddingVertical: 16,

    borderRadius: 20,

    position: 'relative',

    overflow: 'visible',
  },


  selectedPlanCard: {
    borderWidth: 1.5,

    borderColor:
      colorsV1.primaryColor,

    backgroundColor:
      'rgba(124,255,61,0.08)',
  },


  /* =====================================================
     POPULAR BADGE
     ===================================================== */

  popularBadge: {
    position: 'absolute',

    top: -1,

    left: 0,

    right: 0,

    minHeight: 30,

    paddingHorizontal: 4,

    paddingVertical: 6,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor:
      colorsV1.primaryColor,

    borderTopLeftRadius: 19,

    borderTopRightRadius: 19,
  },


  popularText: {
    ...typographyV1.label,

    color:
      colorsV1.black,

    fontSize: 8,

    fontWeight: '800',

    textAlign: 'center',
  },


  /* =====================================================
     PLAN ICON
     ===================================================== */

  planIconContainer: {
    width: 36,

    height: 36,

    alignSelf: 'flex-end',

    alignItems: 'center',

    justifyContent: 'center',
  },


  planIcon: {
    color:
      colorsV1.textSecondary,

    fontSize: 22,
  },


  selectedPlanIcon: {
    color:
      colorsV1.primaryColor,
  },


  /* =====================================================
     PLAN NAME
     ===================================================== */

  planName: {
    marginTop: 16,

    color:
      colorsV1.textSecondary,

    ...typographyV1.h3,

    fontSize: 15,
  },


  selectedPlanText: {
    color:
      colorsV1.primaryColor,
  },


  /* =====================================================
     PRICE
     ===================================================== */

  planPrice: {
    marginTop: 12,

    color:
      colorsV1.textPrimary,

    ...typographyV1.price,

    fontSize: 22,

    lineHeight: 28,
  },


  perMonth: {
    marginTop: 2,

    color:
      colorsV1.textMuted,

    ...typographyV1.caption,
  },


  /* =====================================================
     DIVIDER
     ===================================================== */

  planDivider: {
    height: 1,

    marginVertical: 14,

    backgroundColor:
      colorsV1.borderColor,
  },


  /* =====================================================
     CREDITS
     ===================================================== */

  creditAmount: {
    color:
      colorsV1.textPrimary,

    ...typographyV1.h3,

    fontSize: 16,
  },


  creditLabel: {
    marginTop: 2,

    color:
      colorsV1.textMuted,

    ...typographyV1.caption,
  },


  /* =====================================================
     SELECTED INDICATOR
     ===================================================== */

  selectedIndicator: {
    position: 'absolute',

    right: 8,

    bottom: 8,

    width: 32,

    height: 32,

    borderRadius: 16,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor:
      colorsV1.primaryColor,
  },


  selectedCheck: {
    color:
      colorsV1.black,

    fontSize: 19,

    fontWeight: '900',
  },


  /* =====================================================
     BALANCE
     ===================================================== */

  balanceCard: {
    minHeight: 90,

    marginTop: 20,

    paddingHorizontal: 18,

    paddingVertical: 16,

    borderRadius: 18,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',
  },


  balanceContent: {
    flex: 1,
  },


  smallLabel: {
    color:
      colorsV1.textMuted,

    ...typographyV1.label,
  },


  balanceValue: {
    marginTop: 5,

    color:
      colorsV1.textPrimary,

    ...typographyV1.h2,

    fontSize: 20,
  },


  balanceDescription: {
    marginTop: 3,

    color:
      colorsV1.textMuted,

    ...typographyV1.caption,
  },


  balanceIcon: {
    width: 44,

    height: 44,

    borderRadius: 12,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor:
      'rgba(124,255,61,0.08)',
  },


  balanceIconText: {
    color:
      colorsV1.primaryColor,

    fontSize: 23,
  },


  /* =====================================================
     REFERRAL
     ===================================================== */

  referralCard: {
    minHeight: 72,

    marginTop: 14,

    paddingHorizontal: 18,

    flexDirection: 'row',

    alignItems: 'center',

    borderRadius: 18,
  },


  referralIcon: {
    width: 40,

    height: 40,

    borderRadius: 11,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor:
      'rgba(124,255,61,0.08)',
  },


  referralIconText: {
    color:
      colorsV1.primaryColor,

    fontSize: 23,
  },


  referralContent: {
    flex: 1,

    marginLeft: 13,
  },


  referralTitle: {
    color:
      colorsV1.textPrimary,

    ...typographyV1.h3,
  },


  referralDescription: {
    marginTop: 3,

    color:
      colorsV1.textSecondary,

    ...typographyV1.body,
  },


  /* =====================================================
     WARNING
     ===================================================== */

  warningCard: {
    minHeight: 65,

    marginTop: 14,

    paddingHorizontal: 16,

    paddingVertical: 12,

    flexDirection: 'row',

    alignItems: 'center',

    borderRadius: 16,

    backgroundColor:
      'rgba(255,92,92,0.06)',

    borderWidth: 1,

    borderColor:
      'rgba(255,92,92,0.18)',
  },


  warningIcon: {
    width: 24,

    height: 24,

    borderRadius: 12,

    alignItems: 'center',

    justifyContent: 'center',

    textAlign: 'center',

    lineHeight: 22,

    color:
      colorsV1.errorColor,

    borderWidth: 1,

    borderColor:
      colorsV1.errorColor,

    fontSize: 14,

    fontWeight: '800',
  },


  warningText: {
    flex: 1,

    marginLeft: 12,

    color:
      colorsV1.errorColor,

    ...typographyV1.caption,
  },


  /* =====================================================
     PAYMENT
     ===================================================== */

  paymentButton: {
    marginTop: 20,

    marginHorizontal: 10,

    height: 52,

    borderRadius: 26,
  },


  bottomSpace: {
    height: 30,
  },

});


export default SubscriptionScreen;