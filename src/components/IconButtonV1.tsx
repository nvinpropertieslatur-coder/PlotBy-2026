// @ts-nocheck
import React from 'react';
import {
  Pressable,
  StyleSheet,
} from 'react-native';

import colorsV1 from '../theme/colors.v1';

const IconButtonV1 = ({
  children,
  onPress,
  variant = 'glass',
  size = 46,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,

        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },

        variant === 'green' && styles.greenButton,
        variant === 'glass' && styles.glassButton,
        variant === 'outline' && styles.outlineButton,

        pressed && styles.pressed,

        style,
      ]}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Neon green circular button
  greenButton: {
    backgroundColor: colorsV1.primaryColor,
  },

  // Dark glass circular button
  glassButton: {
    backgroundColor: colorsV1.cardBackground,
    borderWidth: 1,
    borderColor: colorsV1.borderColorStrong,
  },

  // Transparent outlined button
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colorsV1.borderColorStrong,
  },

  pressed: {
    opacity: 0.7,
  },
});

export default IconButtonV1;