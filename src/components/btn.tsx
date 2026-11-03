// @ts-nocheck
import React from "react";
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import styles from "./btn.style";

export default function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon = null,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color="#000000"
        />
      ) : (
        <>
          {icon}

          <Text style={styles.buttonText}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}