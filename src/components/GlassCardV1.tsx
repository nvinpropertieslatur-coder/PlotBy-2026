// @ts-nocheck
import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

import colorsV1 from '../theme/colors.v1';

const GlassCardV1 = ({
  children,
  style,
}) => {
  return (
    <View
      style={[
        styles.card,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colorsV1.cardBackground,

    borderWidth: 1,
    borderColor: colorsV1.borderColor,

    borderRadius: 20,

    overflow: 'hidden',

    // Android
    elevation: 2,

    // iOS
    shadowColor: colorsV1.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
});

export default GlassCardV1;