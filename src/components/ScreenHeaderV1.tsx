// @ts-nocheck
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import colorsV1 from '../theme/colors.v1';
import typographyV1 from '../theme/typography.v1';

const ScreenHeaderV1 = ({
  title,
  subtitle,
  onBack,
  rightAction,
  rightIcon,
  rightElement,
}) => {
  return (
    <View style={styles.container}>

      {/* LEFT */}
      <View style={styles.leftSection}>

        {onBack && (
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        )}

        <View style={styles.titleSection}>
          <Text
            style={styles.title}
            numberOfLines={1}
          >
            {title}
          </Text>

          {subtitle && (
            <Text
              style={styles.subtitle}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

      </View>

      {/* RIGHT */}
      {rightAction && (
        <Pressable
          onPress={rightAction}
          style={({ pressed }) => [
            rightElement
              ? styles.rightElementButton
              : styles.rightButton,
            pressed && styles.pressed,
          ]}
        >

          {rightElement ? (
            rightElement
          ) : (
            rightIcon && (
              <Text style={styles.rightIcon}>
                {rightIcon}
              </Text>
            )
          )}

        </Pressable>
      )}

    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    width: '100%',
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    marginRight: 10,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorsV1.cardBackground,
    borderWidth: 1,
    borderColor: colorsV1.borderColor,
  },

  backIcon: {
    color: colorsV1.textPrimary,
    fontSize: 30,
    lineHeight: 30,
    fontWeight: '300',
    marginTop: -3,
  },

  titleSection: {
    flex: 1,
  },

  title: {
    color: colorsV1.textPrimary,
    ...typographyV1.h1,
    fontSize: 24,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 2,
    color: colorsV1.textSecondary,
    ...typographyV1.caption,
  },

  rightButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorsV1.cardBackground,
    borderWidth: 1,
    borderColor: colorsV1.borderColor,
  },

  rightElementButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rightIcon: {
    color: colorsV1.primaryColor,
    fontSize: 19,
    fontWeight: '600',
  },

  pressed: {
    opacity: 0.7,
  },

});

export default ScreenHeaderV1;