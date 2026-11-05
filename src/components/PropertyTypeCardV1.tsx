// @ts-nocheck
import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
} from 'react-native';

import colorsV1 from '../theme/colors.v1';
import typographyV1 from '../theme/typography.v1';

const PropertyTypeCardV1 = ({
  title,
  icon,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      {/* ICON */}
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>
          {icon}
        </Text>
      </View>

      {/* TITLE */}
      <Text style={styles.title}>
        {title}
      </Text>

    </Pressable>
  );
};

const styles = StyleSheet.create({

  card: {
    width: '48.5%',

    padding: 16,

    marginBottom: 0,

    backgroundColor:
      colorsV1.cardBackground,

    borderWidth: 1,

    borderColor:
      colorsV1.borderColor,

    borderRadius: 20,
  },

  iconCircle: {
  width: 42,
  height: 42,

  borderRadius: 21,

  alignItems: 'center',
  justifyContent: 'center',

  backgroundColor:
    colorsV1.cardBackgroundStrong,

  borderWidth: 1,

  borderColor:
    colorsV1.borderColorStrong,
  },

  icon: {
    color: colorsV1.primaryColor,

    fontSize: 19,
  },

  title: {
    marginTop: 14,

    color: colorsV1.textPrimary,

    ...typographyV1.h3,
  },

  pressed: {
    opacity: 0.75,
  },

});

export default PropertyTypeCardV1;