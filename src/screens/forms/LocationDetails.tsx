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

import styles from "./addpropertyStyle";

import maharashtraCities from "../../data/maharashtra_cities_pincodes.json";

export default function LocationDetailsStep({
  data,
  onChange,
}) {

  const [showCities, setShowCities] = useState(false);

  // =========================================================
  // UPDATE LOCATION DATA
  // =========================================================

  const update = (key, value) => {
    onChange({
      ...data,
      [key]: value,
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
    onChange({ ...data, latitude: location?.latitude ?? null, longitude: location?.longitude ?? null, selectedLocation: location || null });
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

      <SelectLocationOnMap
        selectedLocation={data.selectedLocation}
        onConfirm={handleSelectLocation}
        buttonStyle={styles.mapButton}
        buttonTextStyle={styles.mapButtonText}
        showPreview={false}
      />

      {/* =====================================================
          SELECTED COORDINATES
      ===================================================== */}

      {data.selectedLocation && (
        <View
          style={styles.selectedLocationBox}
        >

          <View
            style={
              styles.selectedLocationHeader
            }
          >

            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#8CFF32"
            />

            <Text
              style={
                styles.selectedLocationTitle
              }
            >
              Location Selected
            </Text>

          </View>

          {data.latitude !== null &&
            data.latitude !== undefined && (
              <Text
                style={
                  styles.coordinateText
                }
              >
                Latitude:{" "}
                {Number(
                  data.latitude
                ).toFixed(6)}
              </Text>
            )}

          {data.longitude !== null &&
            data.longitude !== undefined && (
              <Text
                style={
                  styles.coordinateText
                }
              >
                Longitude:{" "}
                {Number(
                  data.longitude
                ).toFixed(6)}
              </Text>
            )}

        </View>
      )}

      <View style={{ height: 30 }} />

    </ScrollView>
  );
}