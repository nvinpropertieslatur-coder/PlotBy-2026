// @ts-nocheck
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";

// --------------------------------------------------
// DEFAULT LOCATION
// --------------------------------------------------

const DEFAULT_LOCATION = {
  latitude: 18.4088,
  longitude: 76.5604,
};

// --------------------------------------------------
// CARTO API KEY
// --------------------------------------------------
// Add this to your .env:
//
// EXPO_PUBLIC_CARTO_API_KEY=your_api_key
//
// After changing .env, restart Expo with:
// npx expo start -c
// --------------------------------------------------

const CARTO_API_KEY = process.env.EXPO_PUBLIC_CARTO_API_KEY;

// --------------------------------------------------
// CARTO TILE URL
// --------------------------------------------------

const CARTO_TILE_URL =
  `https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`;

// --------------------------------------------------
// MAP HTML
// --------------------------------------------------

const createMapHtml = (location) => `
<!DOCTYPE html>

<html>

<head>

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  />

  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  />

  <style>

    html,
    body,
    #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .leaflet-control-attribution {
      font-size: 9px;
    }

  </style>

</head>

<body>

  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  <script>

    const map = L.map("map").setView(
      [${location.latitude}, ${location.longitude}],
      14
    );

    // --------------------------------------------------
    // CARTO BASEMAP
    // --------------------------------------------------

    L.tileLayer("${CARTO_TILE_URL}", {

      maxZoom: 20,

      attribution:
        "© OpenStreetMap contributors © CARTO"

    }).addTo(map);

    // --------------------------------------------------
    // MARKER
    // --------------------------------------------------

    const marker = L.marker(
      [${location.latitude}, ${location.longitude}],
      {
        draggable: true
      }
    ).addTo(map);

    // --------------------------------------------------
    // SEND LOCATION TO REACT NATIVE
    // --------------------------------------------------

    function sendLocation(latitude, longitude) {

      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          latitude,
          longitude
        })
      );

    }

    // --------------------------------------------------
    // MAP CLICK
    // --------------------------------------------------

    map.on("click", function (event) {

      marker.setLatLng(event.latlng);

      sendLocation(
        event.latlng.lat,
        event.latlng.lng
      );

    });

    // --------------------------------------------------
    // DRAG MARKER
    // --------------------------------------------------

    marker.on("dragend", function (event) {

      const position = event.target.getLatLng();

      sendLocation(
        position.lat,
        position.lng
      );

    });

  </script>

</body>

</html>
`;

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function SelectLocationOnMap({
  selectedLocation,
  onConfirm,
  buttonStyle,
  buttonTextStyle,
  showPreview = true,
}) {

  const [visible, setVisible] = useState(false);

  const [draftLocation, setDraftLocation] = useState(
    selectedLocation || DEFAULT_LOCATION
  );

  const [loading, setLoading] = useState(false);

  const [mapKey, setMapKey] = useState(0);

  // --------------------------------------------------
  // UPDATE LOCATION WHEN PROP CHANGES
  // --------------------------------------------------

  useEffect(() => {

    if (selectedLocation) {

      // Keep the existing location picker synchronized with the parent form.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftLocation(selectedLocation);

    }

  }, [selectedLocation]);

  // --------------------------------------------------
  // UPDATE MARKER
  // --------------------------------------------------

  const updateMarker = (coordinate) => {

    setDraftLocation((current) => ({
      ...current,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    }));

  };

  // --------------------------------------------------
  // USE MY LOCATION
  // --------------------------------------------------

  const useMyLocation = async () => {

    setLoading(true);

    try {

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {

        Alert.alert(
          "Permission denied",
          "You can select a location manually on the map."
        );

        return;
      }

      const current =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const newLocation = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      setDraftLocation((previous) => ({
        ...previous,
        ...newLocation,
      }));

      // Reload WebView so marker moves
      setMapKey((value) => value + 1);

    } catch (error) {

      console.log("Location error:", error);

      Alert.alert(
        "Location unavailable",
        "Please select a location manually on the map."
      );

    } finally {

      setLoading(false);

    }

  };

  // --------------------------------------------------
  // CONFIRM LOCATION
  // --------------------------------------------------

  const confirmLocation = () => {

    if (
      !draftLocation.latitude ||
      !draftLocation.longitude
    ) {

      Alert.alert(
        "Select Location",
        "Please select a location on the map."
      );

      return;
    }

    onConfirm({

      latitude: draftLocation.latitude,

      longitude: draftLocation.longitude,

      // Since we are using CARTO only,
      // we don't automatically get address/city/pincode
      // from the map provider.

      address: draftLocation.address || "",

      city: draftLocation.city || "",

      pincode: draftLocation.pincode || "",

    });

    setVisible(false);

  };

  // --------------------------------------------------
  // RECEIVE MAP LOCATION
  // --------------------------------------------------

  const handleMapMessage = (event) => {

    try {

      const coordinate =
        JSON.parse(event.nativeEvent.data);

      updateMarker(coordinate);

    } catch (error) {

      console.log("Map message error:", error);

      Alert.alert(
        "Map error",
        "Unable to read the selected location."
      );

    }

  };

  // --------------------------------------------------
  // OPEN MAP
  // --------------------------------------------------

  const openMap = () => {

    setDraftLocation(
      selectedLocation || DEFAULT_LOCATION
    );

    setVisible(true);

  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      {/* --------------------------------------------
          SELECT LOCATION BUTTON
      --------------------------------------------- */}

      <Pressable
        style={buttonStyle}
        onPress={openMap}
      >

        <Ionicons
          name="map-outline"
          size={19}
          color="#8CFF32"
        />

        <Text style={buttonTextStyle}>

          {selectedLocation
            ? "Change Location"
            : "Select location on map"}

        </Text>

      </Pressable>

      {/* --------------------------------------------
          LOCATION PREVIEW
      --------------------------------------------- */}

      {showPreview && <View style={styles.preview}>

        <Text style={styles.previewTitle}>

          {selectedLocation
            ? "Location Selected"
            : "Choose a location to see a map preview"}

        </Text>

        {selectedLocation && (

          <Text style={styles.previewText}>

            {selectedLocation.address ||
              `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`}

          </Text>

        )}

      </View>}

      {/* --------------------------------------------
          MAP MODAL
      --------------------------------------------- */}

      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >

        <SafeAreaView style={styles.modal}>

          {/* ----------------------------------------
              HEADER
          ----------------------------------------- */}

          <View style={styles.header}>

            <Pressable
              onPress={() => setVisible(false)}
            >

              <Ionicons
                name="arrow-back"
                size={24}
                color="#fff"
              />

            </Pressable>

            <Text style={styles.headerText}>
              Select Location
            </Text>

          </View>

          {/* ----------------------------------------
              CARTO MAP
          ----------------------------------------- */}

          <WebView
            key={mapKey}

            source={{
              html: createMapHtml(draftLocation),
            }}

            style={styles.map}

            originWhitelist={["*"]}

            javaScriptEnabled={true}

            domStorageEnabled={true}

            onMessage={handleMapMessage}

          />

          {/* ----------------------------------------
              MY LOCATION
          ----------------------------------------- */}

          <Pressable
            style={styles.myLocation}
            onPress={useMyLocation}
          >

            {loading ? (

              <ActivityIndicator
                size="small"
                color="#000"
              />

            ) : (

              <Ionicons
                name="navigate"
                size={18}
                color="#000"
              />

            )}

            <Text style={styles.myLocationText}>
              My Location
            </Text>

          </Pressable>

          {/* ----------------------------------------
              FOOTER
          ----------------------------------------- */}

          <View style={styles.footer}>

            <Text style={styles.footerTitle}>
              Selected Location
            </Text>

            <Text style={styles.coordinates}>

              Lat:{" "}
              {draftLocation.latitude.toFixed(6)}

              {"   "}

              Lng:{" "}
              {draftLocation.longitude.toFixed(6)}

            </Text>

            <Pressable
              style={styles.confirmButton}
              onPress={confirmLocation}
            >

              <Text style={styles.confirmText}>
                Confirm Location
              </Text>

            </Pressable>

          </View>

        </SafeAreaView>

      </Modal>

    </>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({

  modal: {
    flex: 1,
    backgroundColor: "#000",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },

  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  map: {
    flex: 1,
  },

  myLocation: {
    position: "absolute",
    right: 16,
    top: 130,

    flexDirection: "row",
    alignItems: "center",

    gap: 6,

    backgroundColor: "#8CFF32",

    paddingHorizontal: 12,
    paddingVertical: 10,

    borderRadius: 10,

    elevation: 5,
  },

  myLocationText: {
    color: "#000",
    fontWeight: "700",
  },

  footer: {
    padding: 16,
    backgroundColor: "#111",
  },

  footerTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  coordinates: {
    color: "#aaa",
    marginTop: 6,
    fontSize: 13,
  },

  confirmButton: {
    marginTop: 12,

    backgroundColor: "#8CFF32",

    borderRadius: 10,

    padding: 14,

    alignItems: "center",
  },

  confirmText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 15,
  },

  preview: {
    marginTop: 15,

    minHeight: 70,

    borderRadius: 15,

    borderWidth: 1,

    borderColor: "#292929",

    backgroundColor: "#111",

    alignItems: "center",

    justifyContent: "center",

    padding: 12,
  },

  previewTitle: {
    color: "#fff",
    fontWeight: "700",
  },

  previewText: {
    color: "#999",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },

});
