// @ts-nocheck
import React from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';

import colorsV1 from '../theme/colors.v1';
import typographyV1 from '../theme/typography.v1';

const SearchBarV1 = ({
  value,
  onChangeText,
  placeholder = 'Search properties or location...',
  onFilterPress,
  showFilter = true,
}) => {
  return (
    <View style={styles.container}>

      {/* SEARCH FIELD */}
      <View style={styles.searchBox}>

        <Text style={styles.searchIcon}>
          ⌕
        </Text>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colorsV1.textMuted}
          style={styles.input}
          selectionColor={colorsV1.primaryColor}
        />

        {/* CLEAR BUTTON */}
        {value?.length > 0 && (
          <Pressable
            onPress={() => onChangeText('')}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>
              ×
            </Text>
          </Pressable>
        )}

      </View>

      {/* FILTER BUTTON */}
      {showFilter && (
        <Pressable
          onPress={onFilterPress}
          style={({ pressed }) => [
            styles.filterButton,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.filterIcon}>
            <View style={styles.filterLineLarge} />
            <View style={styles.filterLineSmall} />
            <View style={styles.filterLineLarge} />
          </View>
        </Pressable>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 46,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 10,
  },

  searchBox: {
    flex: 1,
    height: 46,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 14,

    backgroundColor: colorsV1.cardBackground,

    borderWidth: 1,
    borderColor: colorsV1.borderColor,

    borderRadius: 23,
  },

  searchIcon: {
    marginRight: 8,

    color: colorsV1.textSecondary,

    fontSize: 22,
    lineHeight: 22,
  },

  input: {
    flex: 1,

    height: '100%',

    paddingVertical: 0,

    color: colorsV1.textPrimary,

    ...typographyV1.body,
  },

  clearButton: {
    width: 28,
    height: 28,

    alignItems: 'center',
    justifyContent: 'center',
  },

  clearText: {
    color: colorsV1.textSecondary,
    fontSize: 20,
    lineHeight: 20,
  },

  filterButton: {
    width: 46,
    height: 46,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: colorsV1.cardBackground,

    borderWidth: 1,
    borderColor: colorsV1.borderColor,

    borderRadius: 23,
  },

  filterIcon: {
    width: 19,
    height: 18,

    justifyContent: 'space-between',
  },

  filterLineLarge: {
    width: 18,
    height: 1.5,

    borderRadius: 2,

    backgroundColor: colorsV1.textPrimary,
  },

  filterLineSmall: {
    width: 11,
    height: 1.5,

    alignSelf: 'center',

    borderRadius: 2,

    backgroundColor: colorsV1.textPrimary,
  },

  pressed: {
    opacity: 0.7,
  },
});

export default SearchBarV1;