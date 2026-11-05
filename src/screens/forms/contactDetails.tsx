// @ts-nocheck
import React from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
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

      <Text style={styles.label}>Contact Type*</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {["Owner", "Developer", "Agent"].map((role) => {
          const selected = (data.role || "Owner") === role;
          return (
            <TouchableOpacity
              key={role}
              onPress={() => update("role", role)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={{ minWidth: 96, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18, borderWidth: 1, borderColor: selected ? "#8CFF32" : "#444", backgroundColor: selected ? "rgba(124,255,61,0.12)" : "#151515", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Ionicons name={role === "Owner" ? "person-outline" : role === "Developer" ? "business-outline" : "briefcase-outline"} size={18} color={selected ? "#8CFF32" : "#aaa"} />
              <Text style={{ color: selected ? "#8CFF32" : "#fff", fontWeight: selected ? "700" : "500" }}>{role}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ============================================================
// RADIO
// ============================================================

