// @ts-nocheck
import React from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import styles from "./addpropertyStyle";

export default function ContactDetailsStep({
  data,
  onChange,
}) {
  const update = (key, value) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  const handleQRSelection = (value) => {
    if (value === "no") {
      onChange({
        ...data,
        hasQR: "no",
        qrNumber: "",
        qrImage: "",
      });

      return;
    }

    update("hasQR", "yes");
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* HEADER */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons
            name="person-outline"
            size={21}
            color="#000"
          />
        </View>

        <Text style={styles.sectionTitle}>
          Contact Details
        </Text>
      </View>

      {/* FULL NAME */}

      <Text style={styles.label}>
        Full Name*
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter full name"
        placeholderTextColor="#666"
        value={data.fullName || ""}
        onChangeText={(value) =>
          update("fullName", value)
        }
      />

      {/* CONTACT */}

      <Text style={styles.label}>
        Contact Number*
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter contact number"
        placeholderTextColor="#666"
        keyboardType="phone-pad"
        maxLength={10}
        value={data.contact || ""}
        onChangeText={(value) =>
          update("contact", value)
        }
      />

      {/* RERA */}

      <Text style={styles.label}>
        Having MahaRERA QR Code?
      </Text>

      <View style={styles.radioContainer}>
        <Radio
          label="Yes"
          selected={data.hasQR === "yes"}
          onPress={() =>
            handleQRSelection("yes")
          }
        />

        <Radio
          label="No"
          selected={data.hasQR !== "yes"}
          onPress={() =>
            handleQRSelection("no")
          }
        />
      </View>

      {/* QR DETAILS */}

      {data.hasQR === "yes" && (
        <>
          <Text style={styles.label}>
            QR Code Number
          </Text>

          <TextInput
            style={styles.input}
            placeholder="QR Code Number"
            placeholderTextColor="#666"
            value={data.qrNumber || ""}
            onChangeText={(value) =>
              update("qrNumber", value)
            }
          />

          <Text style={styles.label}>
            Upload QR Code Image
          </Text>

          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => {
              Alert.alert(
                "Upload Image",
                "Image upload will be connected with Supabase Storage."
              );
            }}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={30}
              color="#777"
            />

            <Text
              style={styles.uploadText}
            >
              {data.qrImage ||
                "Upload QR Code Image"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

// ============================================================
// RADIO
// ============================================================

function Radio({
  label,
  selected,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.radioItem}
      onPress={onPress}
    >
      <View
        style={[
          styles.radio,
          selected && styles.radioSelected,
        ]}
      >
        {selected && (
          <View style={styles.radioDot} />
        )}
      </View>

      <Text style={styles.radioText}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}