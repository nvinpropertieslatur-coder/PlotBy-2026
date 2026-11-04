import React, { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { useNavigation, useRoute } from "@react-navigation/native";

import PropertyDetailsStep from "./propertyDetails";
import LocationDetailsStep from "./LocationDetails";
import ContactDetailsStep from "./contactDetails";

import propertyTypes from "./propertyTypes";

import { showSuccessMessage } from '../../utils/showSuccessMessage';
import {
  NetworkErrorModal,
  PropertyAddedModal,
  MapValidationModal,
} from '../../components/modals';
import { isNetworkError } from '../../utils/networkUtils';
import { saveProperty } from '../../services/propertyService';

import styles from "./addpropertyStyle";

export default function AddPropertyScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const insets = useSafeAreaInsets();

  // ============================================================
  // PROPERTY TYPE
  // ============================================================

  const propertyType =
    route.params?.propertyType || "plot";

  const propertyInfo =
    propertyTypes[propertyType] ||
    propertyTypes.plot;

  // ============================================================
  // STEP
  // ============================================================

  const editingProperty = route.params?.property;

  const [step, setStep] = useState(1);

  const [loading, setLoading] =
    useState(false);
  const [locationError, setLocationError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showMapValidationModal, setShowMapValidationModal] = useState(false);
  const [openMapTrigger, setOpenMapTrigger] = useState(0);
  const [savedResult, setSavedResult] = useState(null);

  // ============================================================
  // FORM DATA
  // ============================================================

  const [formData, setFormData] =
    useState(() => ({
      property: {
        length: "",
        width: "",
        totalArea: "",
        rate: "",

        discount: "no",
        discountRate: "",

        facing: [
          {
            direction: "East",
            selected: false,
            value: "",
          },
          {
            direction: "West",
            selected: false,
            value: "",
          },
          {
            direction: "North",
            selected: false,
            value: "",
          },
          {
            direction: "South",
            selected: false,
            value: "",
          },
        ],

        socialMediaLink: "",

        // For other property types
        bhk: "",
        simpleFacing: "",
      },

      location: {
        address: "",
        city: "Latur",
        pincode: "413512",

        latitude: null,
        longitude: null,

        selectedLocation: null,
        isConfirmed: false,
      },

      contact: {
        fullName: "",
        contact: "",

        hasQR: "no",
        qrNumber: "",
        qrImage: "",
      },
      ...(editingProperty ? {
        property: {
          length: String(editingProperty.length ?? ''), width: String(editingProperty.width ?? ''),
          totalArea: String(editingProperty.total_area ?? ''), rate: String(editingProperty.rate_per_sqft ?? ''),
          discount: editingProperty.discount ? 'yes' : 'no', discountRate: editingProperty.discount && Number(editingProperty.total_area) > 0 ? String(Math.max(0, Number(editingProperty.rate_per_sqft) - Number(editingProperty.total_amount) / Number(editingProperty.total_area))) : '', socialMediaLink: editingProperty.social_media_link || '', bhk: '', simpleFacing: '',
          facing: ['East', 'West', 'North', 'South'].map(direction => {
            const entry = (editingProperty.facing || []).find(value => typeof value === 'string' && value.startsWith(direction));
            return { direction, selected: !!entry, value: entry?.split(':').slice(1).join(':').trim() || '' };
          }),
        },
        location: {
          address: editingProperty.address || '',
          city: editingProperty.city || '',
          pincode: editingProperty.pincode || '',
          latitude: editingProperty.latitude,
          longitude: editingProperty.longitude,
          selectedLocation: editingProperty.latitude != null && editingProperty.longitude != null ? { latitude: editingProperty.latitude, longitude: editingProperty.longitude, isConfirmed: true } : null,
          isConfirmed: editingProperty.latitude != null && editingProperty.longitude != null,
        },
        contact: { fullName: editingProperty.agent_full_name || '', contact: editingProperty.agent_contact_number || '', hasQR: editingProperty.maha_rera_registered ? 'yes' : 'no', qrNumber: editingProperty.qr_code_number || '', qrImage: editingProperty.qr_code_image_url || '' },
      } : {}),
    }));

  // ============================================================
  // UPDATE FUNCTIONS
  // ============================================================

  const updateProperty = (data) => {
    setFormData((previous) => ({
      ...previous,
      property: data,
    }));
  };

  const updateLocation = (data) => {
    if (data?.isConfirmed && data?.latitude != null && data?.longitude != null) {
      setLocationError('');
    }
    setFormData((previous) => ({
      ...previous,
      location: data,
    }));
  };

  const updateContact = (data) => {
    setFormData((previous) => ({
      ...previous,
      contact: data,
    }));
  };

  // ============================================================
  // VALIDATE PROPERTY
  // ============================================================

  const validateProperty = () => {
    const property =
      formData.property;

    if (propertyType === "plot") {
      if (!property.length?.trim()) {
        Alert.alert(
          "Required Field",
          "Please enter the property length."
        );

        return false;
      }

      if (!property.width?.trim()) {
        Alert.alert(
          "Required Field",
          "Please enter the property width."
        );

        return false;
      }

      if (!property.totalArea?.trim()) {
        Alert.alert(
          "Required Field",
          "Please enter the total area."
        );

        return false;
      }

      if (!property.rate?.trim()) {
        Alert.alert(
          "Required Field",
          "Please enter the rate per sqft."
        );

        return false;
      }

      if (
        property.discount === "yes" &&
        !property.discountRate?.trim()
      ) {
        Alert.alert(
          "Required Field",
          "Please enter the discount rate."
        );

        return false;
      }

      if (
        property.discount === "yes" &&
        Number(property.discountRate) >
          Number(property.rate)
      ) {
        Alert.alert(
          "Invalid Discount",
          "Discount rate cannot be greater than the rate."
        );

        return false;
      }

      const selectedFacing =
        property.facing?.filter(
          (item) => item.selected
        ) || [];

      if (selectedFacing.length === 0) {
        Alert.alert(
          "Required Field",
          "Please select at least one facing."
        );

        return false;
      }
    }

    return true;
  };

  // ============================================================
  // VALIDATE LOCATION
  // ============================================================

  const validateLocation = () => {
    const location = formData.location;

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);
    const hasValidCoordinates =
      location.latitude !== null &&
      location.latitude !== undefined &&
      location.longitude !== null &&
      location.longitude !== undefined &&
      Number.isFinite(latitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      Number.isFinite(longitude) &&
      longitude >= -180 &&
      longitude <= 180;

    const isConfirmed = Boolean(location.isConfirmed && hasValidCoordinates);

    if (!isConfirmed) {
      const message = "Please select and confirm your property location on the map before adding your property.";
      setLocationError(message);
      setShowMapValidationModal(true);
      return false;
    }

    if (!location.address?.trim()) {
      Alert.alert(
        "Required Field",
        "Please enter the property address."
      );

      return false;
    }

    if (!location.city?.trim()) {
      Alert.alert(
        "Required Field",
        "Please select a city."
      );

      return false;
    }

    if (!location.pincode?.trim()) {
      Alert.alert(
        "Required Field",
        "Please enter the pincode."
      );

      return false;
    }

    if (
      location.pincode.trim().length !== 6
    ) {
      Alert.alert(
        "Invalid Pincode",
        "Please enter a valid 6-digit pincode."
      );

      return false;
    }

    return true;
  };

  // ============================================================
  // VALIDATE CONTACT
  // ============================================================

  const validateContact = () => {
    const contact =
      formData.contact;

    if (!contact.fullName?.trim()) {
      Alert.alert(
        "Required Field",
        "Please enter your full name."
      );

      return false;
    }

    if (!contact.contact?.trim()) {
      Alert.alert(
        "Required Field",
        "Please enter your contact number."
      );

      return false;
    }

    if (
      !/^[0-9]{10}$/.test(
        contact.contact.trim()
      )
    ) {
      Alert.alert(
        "Invalid Contact Number",
        "Please enter a valid 10-digit contact number."
      );

      return false;
    }

    return true;
  };

  // ============================================================
  // NEXT
  // ============================================================

  const handleNext = async () => {
    if (step === 1) {
      if (!validateProperty()) {
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      if (!validateLocation()) {
        return;
      }

      setStep(3);
      return;
    }

    if (step === 3) {
      if (!validateContact()) {
        return;
      }

      await handleSubmit();
    }
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    if (step === 1) {
      navigation.goBack();
      return;
    }

    setStep((previous) => previous - 1);
  };

  // ============================================================
// SUBMIT PROPERTY
// ============================================================

const handleSubmit = async () => {
    if (loading) return;

    if (!validateProperty()) {
      setStep(1);
      return;
    }

    if (!validateLocation()) {
      setStep(2);
      return;
    }

    if (!validateContact()) {
      setStep(3);
      return;
    }

    try {
      setLoading(true);

      const property = formData.property;
      const location = formData.location;
      const contact = formData.contact;

      const length = Number(property.length) || 0;
      const width = Number(property.width) || 0;
      const totalArea = Number(property.totalArea) || 0;
      const ratePerSqft = Number(property.rate) || 0;
      const discountRate =
        property.discount === "yes" ? Number(property.discountRate) || 0 : 0;
      const totalAmount = totalArea * (ratePerSqft - discountRate);

      const selectedFacing = (property.facing || [])
        .filter((item) => item.selected)
        .map((item) => {
          if (item.value?.trim()) {
            return `${item.direction}: ${item.value}`;
          }
          return item.direction;
        });

      const propertyData = {
        length: length,
        width: width,
        total_area: totalArea,
        rate_per_sqft: ratePerSqft,
        discount: property.discount === "yes",
        total_amount: totalAmount,
        facing: selectedFacing,
        social_media_link: property.socialMediaLink || null,
        address: location.address || null,
        city: location.city || null,
        pincode: location.pincode || null,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        agent_full_name: contact.fullName || null,
        agent_contact_number: contact.contact || null,
        maha_rera_registered: contact.hasQR === "yes",
        qr_code_number: contact.qrNumber || null,
        qr_code_image_url: contact.qrImage || null,
      };

      // 1. Submit the actual property data to Supabase (or isolated test store)
      // 2. Wait for successful database confirmation
      const result = await saveProperty(propertyData, {
        propertyId: editingProperty?.id,
        propertyType,
      });

      // 3. Database operation succeeded!
      setSavedResult(result);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('ADD PROPERTY ERROR:', error);
      if (isNetworkError(error)) {
        setShowNetworkModal(true);
      } else {
        const message = error?.message || 'Failed to add property.';
        if (Platform.OS === 'web') window.alert(message);
        else Alert.alert('Error', message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STEP INDICATOR
  // ============================================================

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepContainer}>

        {/* STEP 1 */}

        <View
          style={
            step === 1
              ? styles.stepActive
              : styles.stepCompleted
          }
        >
          {step === 1 ? (
            <Text
              style={styles.stepActiveText}
            >
              1
            </Text>
          ) : (
            <Ionicons
              name="checkmark"
              size={17}
              color="#000"
            />
          )}
        </View>

        {/* LINE */}

        <View
          style={
            step >= 2
              ? styles.activeLine
              : styles.stepLine
          }
        />

        {/* STEP 2 */}

        <View
          style={
            step === 2
              ? styles.stepActive
              : step === 3
              ? styles.stepCompleted
              : styles.step
          }
        >
          {step === 3 ? (
            <Ionicons
              name="checkmark"
              size={17}
              color="#000"
            />
          ) : (
            <Text
              style={
                step === 2
                  ? styles.stepActiveText
                  : styles.stepText
              }
            >
              2
            </Text>
          )}
        </View>

        {/* LINE */}

        <View
          style={
            step === 3
              ? styles.activeLine
              : styles.stepLine
          }
        />

        {/* STEP 3 */}

        <View
          style={
            step === 3
              ? styles.stepActive
              : styles.step
          }
        >
          <Text
            style={
              step === 3
                ? styles.stepActiveText
                : styles.stepText
            }
          >
            3
          </Text>
        </View>
      </View>
    );
  };

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000"
      />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color="#fff"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Add {propertyInfo.label}
        </Text>
      </View>

      {/* ======================================================
          STEP INDICATOR
      ====================================================== */}

      {renderStepIndicator()}

      {/* ======================================================
          FORM
      ====================================================== */}

      <View
        style={{
          flex: 1,
          minHeight: 0,
        }}
      >
        {step === 1 && (
          <PropertyDetailsStep
            propertyType={
              propertyType
            }
            data={
              formData.property
            }
            onChange={
              updateProperty
            }
          />
        )}

        {step === 2 && (
          <LocationDetailsStep
            data={
              formData.location
            }
            error={locationError}
            openMapTrigger={openMapTrigger}
            onChange={updateLocation}
          />
        )}

        {step === 3 && (
          <ContactDetailsStep
            data={
              formData.contact
            }
            onChange={
              updateContact
            }
          />
        )}
      </View>

      {/* ======================================================
          BOTTOM BUTTON
      ====================================================== */}

      <View
        style={[
          styles.bottomContainer,
          {
            paddingBottom:50
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleNext}
          disabled={loading}
          style={{
            height: 50,
            borderRadius: 12,
            backgroundColor:
              "#8CFF32",
            alignItems: "center",
            justifyContent:
              "center",
          }}
        >
          <Text
            style={{
              color: "#000",
              fontSize: 15,
              fontWeight: "700",
            }}
          >
            {step === 3
              ? loading
                ? "Adding Property..."
                : "+ Add Property"
              : "Save & Next"}
          </Text>
        </TouchableOpacity>
      </View>
    
      {/* Property Added Confirmation Popup (matching reference designs) */}
      <PropertyAddedModal
        visible={showSuccessModal}
        property={savedResult?.property || {
          total_amount: (Number(formData.property.totalArea) || 0) * (Number(formData.property.rate) || 0),
          total_area: formData.property.totalArea,
          property_type: propertyType,
          city: formData.location.city,
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
        }}
        mode={savedResult?.mode}
        isEditing={!!editingProperty}
        onViewListing={() => {
          setShowSuccessModal(false);
          const savedId = savedResult?.property?.id;
          if (savedId) {
            navigation.navigate('PropertyDetails', {
              propertyId: String(savedId),
              source: 'profile',
            });
          } else {
            navigation.navigate('MainTabs', { screen: 'Profile' });
          }
        }}
        onGoToProperties={() => {
          setShowSuccessModal(false);
          navigation.navigate('MainTabs', { screen: 'Profile' });
        }}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.navigate('MainTabs', { screen: 'Profile' });
        }}
      />

      {/* No Internet / Connection Lost Popup */}
      <NetworkErrorModal
        visible={showNetworkModal}
        loading={loading}
        onRetry={() => {
          setShowNetworkModal(false);
          void handleSubmit();
        }}
        onCancel={() => {
          setShowNetworkModal(false);
        }}
      />

      {/* Map Location Mandatory Validation Modal */}
      <MapValidationModal
        visible={showMapValidationModal}
        onOpenMap={() => {
          setShowMapValidationModal(false);
          setStep(2);
          setOpenMapTrigger((prev) => prev + 1);
        }}
        onClose={() => setShowMapValidationModal(false)}
      />
    </SafeAreaView>
  );
}
