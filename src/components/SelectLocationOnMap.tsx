// @ts-nocheck
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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

const createMapHtml = (location, hasSelection) => `
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
    // MARKER
    // --------------------------------------------------

    let marker = ${hasSelection ? `L.marker(
      [${location.latitude}, ${location.longitude}],
      {
        draggable: true
      }
    ).addTo(map)` : 'null'};

    function attachMarkerEvents(m) {
      m.on("dragend", function (event) {
        const position = event.target.getLatLng();
        sendLocation(position.lat, position.lng);
      });
    }

    if (marker) {
      attachMarkerEvents(marker);
    }

    // --------------------------------------------------
    // MAP CLICK
    // --------------------------------------------------

    map.on("click", function (event) {
      if (!marker) {
        marker = L.marker(event.latlng, { draggable: true }).addTo(map);
        attachMarkerEvents(marker);
      } else {
        marker.setLatLng(event.latlng);
      }

      sendLocation(
        event.latlng.lat,
        event.latlng.lng
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
  isOpen = false,
  onClose,
}) {

  const [visible, setVisible] = useState(false);

  const [draftLocation, setDraftLocation] = useState(
    selectedLocation || DEFAULT_LOCATION
  );

  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  const [mapKey, setMapKey] = useState(0);
  const [hasDraftSelection, setHasDraftSelection] = useState(!!selectedLocation);

  useEffect(() => {
    if (isOpen) {
      // This effect synchronizes the externally triggered map modal with its draft selection.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftLocation(selectedLocation || DEFAULT_LOCATION);
      setHasDraftSelection(!!selectedLocation);
      setVisible(true);
    }
  }, [isOpen, selectedLocation]);

  // --------------------------------------------------
  // UPDATE LOCATION WHEN PROP CHANGES
  // --------------------------------------------------

  useEffect(() => {

    if (selectedLocation) {

      // Keep the existing location picker synchronized with the parent form.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftLocation(selectedLocation);
      setHasDraftSelection(true);

    }

  }, [selectedLocation]);

  // --------------------------------------------------
  // UPDATE MARKER
  // --------------------------------------------------

  const updateMarker = (coordinate) => {

    setHasDraftSelection(true);

    setDraftLocation((current) => ({
      ...current,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    }));

  };

  const searchAddress = async () => {
    const address = searchText.trim();
    if (!address || searchingAddress) return;
    setSearchingAddress(true);
    setSearchMessage("");
    try {
      if (Platform.OS === "android") {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") {
          setSearchMessage("Allow location access to search for this address.");
          return;
        }
      }
      const geocodeQuery = /india/i.test(address) ? address : `${address}, India`;
      const results = await Location.geocodeAsync(geocodeQuery);
      const result = results[0];
      if (!result) {
        setSearchMessage("No matching location found. Try adding the town or city.");
        return;
      }
      setDraftLocation({ latitude: result.latitude, longitude: result.longitude, address });
      setHasDraftSelection(true);
      setMapKey((value) => value + 1);
    } catch {
      setSearchMessage("Could not find that address. Try a nearby town or landmark.");
    } finally {
      setSearchingAddress(false);
    }
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
      setHasDraftSelection(true);

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

    const latitude = Number(draftLocation?.latitude);
    const longitude = Number(draftLocation?.longitude);
    if (!hasDraftSelection || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {

      Alert.alert(
        "Select Location",
        "Please select a location on the map."
      );

      return;
    }

    onConfirm({

      latitude,

      longitude,

      isConfirmed: true,

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
    setSearchText(selectedLocation?.address || "");
    setSearchMessage("");
    setHasDraftSelection(!!selectedLocation);

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

          <View style={styles.searchContainer}>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search address, town, or landmark"
              placeholderTextColor="#888"
              returnKeyType="search"
              onSubmitEditing={searchAddress}
              style={styles.searchInput}
              accessibilityLabel="Search for a land address"
            />
            <Pressable style={styles.searchButton} onPress={searchAddress} disabled={searchingAddress} accessibilityRole="button">
              {searchingAddress ? <ActivityIndicator size="small" color="#000" /> : <Ionicons name="search" size={20} color="#000" />}
            </Pressable>
          </View>
          {!!searchMessage && <Text style={styles.searchMessage}>{searchMessage}</Text>}

          {/* ----------------------------------------
              CARTO MAP
          ----------------------------------------- */}

          <WebView
            key={mapKey}

            source={{
              html: createMapHtml(draftLocation, hasDraftSelection),
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

  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#171a18",
    borderColor: "#3b453d",
    borderWidth: 1,
    borderRadius: 14,
  },

  searchInput: {
    flex: 1,
    minHeight: 48,
    color: "#fff",
    paddingHorizontal: 14,
  },

  searchButton: {
    width: 44,
    height: 42,
    marginRight: 4,
    borderRadius: 12,
    backgroundColor: "#8CFF32",
    alignItems: "center",
    justifyContent: "center",
  },

  searchMessage: {
    color: "#FFB84D",
    marginHorizontal: 18,
    marginBottom: 8,
    fontSize: 12,
  },

  map: {
    flex: 1,
  },

  myLocation: {
    position: "absolute",
    right: 16,
    top: 184,

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
