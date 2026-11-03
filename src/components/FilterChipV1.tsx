// @ts-nocheck
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';

import colorsV1 from '../theme/colors.v1';
import typographyV1 from '../theme/typography.v1';

const FilterChipV1 = ({
  label,
  active = false,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,

        active && styles.activeContainer,

        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.text,
          active && styles.activeText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 36,

    paddingHorizontal: 16,

    borderRadius: 18,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: colorsV1.cardBackground,

    borderWidth: 1,
    borderColor: colorsV1.borderColor,
  },

  activeContainer: {
    backgroundColor: colorsV1.primaryColor,

    borderColor: colorsV1.primaryColor,
  },

  text: {
    color: colorsV1.textSecondary,

    ...typographyV1.caption,

    fontWeight: '500',
  },

  activeText: {
    color: colorsV1.black,

    fontWeight: '600',
  },

  pressed: {
    opacity: 0.7,
  },
});

export default FilterChipV1;