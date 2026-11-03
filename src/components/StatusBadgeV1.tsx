// @ts-nocheck
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import colorsV1 from '../theme/colors.v1';
import typographyV1 from '../theme/typography.v1';

const StatusBadgeV1 = ({
  status = 'verified',
}) => {
  const statusConfig = {
    verified: {
      label: 'VERIFIED',
      color: colorsV1.successColor,
      background: 'rgba(124,255,61,0.12)',
      border: 'rgba(124,255,61,0.30)',
    },

    unverified: {
      label: 'UNVERIFIED',
      color: colorsV1.warningColor,
      background: 'rgba(255,184,77,0.12)',
      border: 'rgba(255,184,77,0.30)',
    },

    archived: {
      label: 'ARCHIVED',
      color: colorsV1.textMuted,
      background: 'rgba(255,255,255,0.08)',
      border: colorsV1.borderColor,
    },
  };

  const currentStatus =
    statusConfig[status] || statusConfig.unverified;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: currentStatus.background,
          borderColor: currentStatus.border,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: currentStatus.color,
          },
        ]}
      />

      <Text
        style={[
          styles.text,
          {
            color: currentStatus.color,
          },
        ]}
      >
        {currentStatus.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 28,

    paddingHorizontal: 10,

    borderRadius: 14,

    borderWidth: 1,

    flexDirection: 'row',
    alignItems: 'center',

    alignSelf: 'flex-start',
  },

  dot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    marginRight: 6,
  },

  text: {
    ...typographyV1.caption,

    fontSize: 11,
    fontWeight: '600',

    letterSpacing: 0.5,
  },
});

export default StatusBadgeV1;