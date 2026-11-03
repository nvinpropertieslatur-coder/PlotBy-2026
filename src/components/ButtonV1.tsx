// @ts-nocheck
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  View,
} from 'react-native';

import colorsV1 from '../theme/colors.v1';
import typographyV1 from '../theme/typography.v1';

const ButtonV1 = ({
  title,
  onPress,
  variant = 'primary',
  icon = null,
  rightIcon = null,
  disabled = false,
  style,
  textStyle,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,

        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'outline' && styles.outlineButton,

        pressed && styles.pressed,
        disabled && styles.disabled,

        style,
      ]}
    >
      {icon && (
        <View style={styles.leftIcon}>
          {icon}
        </View>
      )}

      <Text
        style={[
          styles.buttonText,
          variant === 'primary'
            ? styles.primaryText
            : styles.secondaryText,
          textStyle,
        ]}
      >
        {title}
      </Text>

      {rightIcon && (
        <View style={styles.rightIcon}>
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: 23,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* PRIMARY - PLOTBY NEON GREEN */
  primaryButton: {
    backgroundColor: colorsV1.primaryColor,
    borderWidth: 1,
    borderColor: colorsV1.primaryColor,
  },

  /* GLASS BUTTON */
  secondaryButton: {
    backgroundColor: colorsV1.cardBackground,
    borderWidth: 1,
    borderColor: colorsV1.borderColorStrong,
  },

  /* OUTLINE BUTTON */
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colorsV1.borderColorStrong,
  },

  buttonText: {
    ...typographyV1.button,
  },

  primaryText: {
    color: colorsV1.black,
  },

  secondaryText: {
    color: colorsV1.textPrimary,
  },

  leftIcon: {
    marginRight: 8,
  },

  rightIcon: {
    marginLeft: 8,
  },

  pressed: {
    opacity: 0.75,
  },

  disabled: {
    opacity: 0.45,
  },
});

export default ButtonV1;