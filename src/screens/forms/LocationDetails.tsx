// @ts-nocheck
import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import SelectLocationOnMap from "../../components/SelectLocationOnMap";
import LocationMapPreview from "../../components/LocationMapPreview";

import styles from "./addpropertyStyle";

import maharashtraCities from "../../data/maharashtra_cities_pincodes.json";

export default function LocationDetailsStep({
  data,
  error,
  onChange,
  openMapTrigger,
}) {

  const [showCities, setShowCities] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  React.useEffect(() => {
    if (openMapTrigger) {
      setIsMapOpen(true);
    }
  }, [openMapTrigger]);

  // =========================================================
  // UPDATE LOCATION DATA
  // =========================================================

  const update = (key, value) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  const updateCoordinate = (key, value) => {
    const latitude = key === "latitude" ? value : data.latitude;
    const longitude = key === "longitude" ? value : data.longitude;
    const numericLatitude = Number(latitude);
    const numericLongitude = Number(longitude);
    const valid = latitude !== "" && longitude !== "" && Number.isFinite(numericLatitude) && numericLatitude >= -90 && numericLatitude <= 90 && Number.isFinite(numericLongitude) && numericLongitude >= -180 && numericLongitude <= 180;
    onChange({
      ...data,
      [key]: value,
      selectedLocation: valid ? { latitude: numericLatitude, longitude: numericLongitude, address: data.address, city: data.city, pincode: data.pincode, isConfirmed: true } : null,
      isConfirmed: valid,
    });
  };

  // =========================================================
  // CITY SELECTION
  // =========================================================

  const handleCitySelect = (city) => {
    onChange({
      ...data,
      city: city.city,
      pincode: city.primaryPincode
        ? String(city.primaryPincode)
        : data.pincode || "",
    });

    setShowCities(false);
  };

  // =========================================================
  // MAP LOCATION
  // =========================================================

  const handleSelectLocation = (location) => {
    onChange({
      ...data,
      address: location?.address || data.address,
      city: location?.city || data.city,
      pincode: location?.pincode || data.pincode,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      selectedLocation: location || null,
      isConfirmed: Boolean(location?.isConfirmed && location?.latitude != null && location?.longitude != null),
    });
  };

  // =========================================================
  // GET CITY LIST
  // =========================================================

  const cities =
    maharashtraCities?.cities || [];

  // =========================================================
  // UI
  // =========================================================

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >

      {/* =====================================================
          SECTION HEADER
      ===================================================== */}

      <View style={styles.sectionHeader}>

        <View style={styles.sectionIcon}>
          <Ionicons
            name="location-outline"
            size={20}
            color="#000"
          />
        </View>

        <Text style={styles.sectionTitle}>
          Property Location
        </Text>

      </View>

      <Text style={styles.label}>Coordinates</Text>
      <View style={styles.areaRow}>
        <View style={styles.areaInput}>
          <TextInput style={styles.areaTextInput} placeholder="Latitude" placeholderTextColor="#666" keyboardType="decimal-pad" value={data.latitude == null ? "" : String(data.latitude)} onChangeText={(value) => updateCoordinate("latitude", value.replace(/[^0-9.-]/g, ""))} />
          <Ionicons name="navigate-outline" size={18} color="#8CFF32" />
        </View>
        <View style={styles.areaInput}>
          <TextInput style={styles.areaTextInput} placeholder="Longitude" placeholderTextColor="#666" keyboardType="decimal-pad" value={data.longitude == null ? "" : String(data.longitude)} onChangeText={(value) => updateCoordinate("longitude", value.replace(/[^0-9.-]/g, ""))} />
          <Ionicons name="navigate-outline" size={18} color="#8CFF32" />
        </View>
      </View>

      {/* =====================================================
          ADDRESS
      ===================================================== */}

      <Text style={styles.label}>
        Address*
      </Text>

      <TextInput
        style={styles.addressInput}
        placeholder="Enter property address"
        placeholderTextColor="#666"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        value={data.address || ""}
        onChangeText={(text) =>
          update("address", text)
        }
      />

      {/* =====================================================
          CITY
      ===================================================== */}

      <Text style={styles.label}>
        City
      </Text>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() =>
          setShowCities(!showCities)
        }
        activeOpacity={0.8}
      >

        <Text style={styles.dropdownText}>
          {data.city || "Select City"}
        </Text>

        <Ionicons
          name={
            showCities
              ? "chevron-up"
              : "chevron-down"
          }
          size={20}
          color="#777"
        />

      </TouchableOpacity>

      {/* =====================================================
          CITY LIST
      ===================================================== */}

      {showCities && (
        <View
          style={
            styles.dropdownMenu
          }
        >
          {maharashtraCities.cities.map(
            (item) => (
              <TouchableOpacity
                key={`${item.city}-${item.primaryPincode}`}
                style={
                  styles.cityOption
                }
                onPress={() =>
                  handleCitySelect(
                    item
                  )
                }
              >

                <View>

                  <Text
                    style={
                      styles.cityText
                    }
                  >
                    {item.city}
                  </Text>

                  <Text
                    style={
                      styles.districtText
                    }
                  >
                    {item.district}
                  </Text>

                </View>

                {data.city === item.city && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color="#8CFF32"
                  />
                )}

              </TouchableOpacity>
            )
          )}
        </View>
      )}

      {/* =====================================================
          PINCODE
      ===================================================== */}

      <Text style={styles.label}>
        Pincode
      </Text>

      <View style={styles.inputWithIcon}>

        <Ionicons
          name="location-outline"
          size={20}
          color="#8CFF32"
        />

        <TextInput
          style={styles.iconInput}
          placeholder="Enter pincode"
          placeholderTextColor="#666"
          keyboardType="numeric"
          maxLength={6}
          value={data.pincode || ""}
          onChangeText={(text) =>
            update("pincode", text)
          }
        />

      </View>

      {/* =====================================================
          MAP
      ===================================================== */}

      <Text style={styles.label}>
        Select Location on Map
      </Text>

      {!!error && (
        <Text style={{ color: '#FF6B6B', marginBottom: 8, fontWeight: '700' }} accessibilityRole="alert">
          {error}
        </Text>
      )}

      <SelectLocationOnMap
        selectedLocation={data.selectedLocation}
        onConfirm={handleSelectLocation}
        buttonStyle={[styles.mapButton, error ? { borderColor: '#FF6B6B', borderWidth: 1 } : null]}
        buttonTextStyle={styles.mapButtonText}
        showPreview={false}
      />

      {/* =====================================================
          SELECTED COORDINATES
      ===================================================== */}

      {data.isConfirmed && data.latitude != null && data.longitude != null ? (
        <View style={styles.selectedLocationBox}>
          <View style={styles.selectedLocationHeader}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#8CFF32"
            />
            <Text style={styles.selectedLocationTitle}>
              Location Confirmed on Map
            </Text>
            <View style={{
              marginLeft: 'auto',
              backgroundColor: '#1E331E',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: '#2E552E',
            }}>
              <Text style={{ color: '#8CFF32', fontSize: 11, fontWeight: '700' }}>Confirmed</Text>
            </View>
          </View>

          <Text style={styles.coordinateText}>
            Latitude: {Number(data.latitude).toFixed(6)}
          </Text>

          <Text style={styles.coordinateText}>
            Longitude: {Number(data.longitude).toFixed(6)}
          </Text>

          <Text style={{ color: '#8CFF32', fontSize: 12, marginTop: 4 }}>
            ✓ Exact map coordinates confirmed
          </Text>
        </View>
      ) : (
        <View style={[styles.selectedLocationBox, { borderColor: '#333833' }]}>
          <Text style={{ color: '#9CA3AF', fontSize: 13, lineHeight: 18 }}>
            Map location is mandatory. Tap "Select Location on Map" above to choose and confirm the property pin on Carto map.
          </Text>
        </View>
      )}

      <Text style={[styles.label, { marginTop: 18 }]}>Land Location Preview</Text>
      <LocationMapPreview latitude={data.latitude} longitude={data.longitude} />
      {data.latitude != null && data.longitude != null && data.isConfirmed && (
        <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 8 }}>
          {Number(data.latitude).toFixed(6)}, {Number(data.longitude).toFixed(6)}
        </Text>
      )}

      <View style={{ height: 30 }} />

    </ScrollView>
  );
}
