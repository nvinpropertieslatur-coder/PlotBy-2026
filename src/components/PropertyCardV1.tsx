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

import GlassCardV1 from './GlassCardV1';
import StatusBadgeV1 from './StatusBadgeV1';

const formatPrice = (amount) => {
  const value = Number(amount);

  if (!Number.isFinite(value)) return 'Price unavailable';

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} Lakh`;
  }

  return `₹${value.toLocaleString('en-IN')}`;
};

const PropertyCardV1 = ({
  property,
  onPress,
  onEdit,
}) => {
  const location = [
    property.address,
    property.city,
    property.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const area = property.total_area != null
    ? `${property.total_area} sq.ft.`
    : 'Area unavailable';

  const price = formatPrice(property.total_amount);

  // Use the actual title column if your table has one.
  const title =
    property.title ||
    property.property_title ||
    'Property';

  return (
    <Pressable
      onPress={() => onPress?.(property)}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && styles.pressed,
      ]}
    >
      <GlassCardV1 style={styles.card}>
        {/* TOP SECTION */}
        <View style={styles.topRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>

            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>

              <Text style={styles.location} numberOfLines={2}>
                {location || 'Location unavailable'}
              </Text>
            </View>
          </View>

          <StatusBadgeV1 status={property.status} />
        </View>

        {/* AREA SECTION */}
        <View style={styles.areaSection}>
          <Text style={styles.sectionLabel}>
            PROPERTY AREA
          </Text>

          <Text style={styles.area}>{area}</Text>
        </View>

        {/* BOTTOM SECTION */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.sectionLabel}>
              PROPERTY PRICE
            </Text>

            <Text style={styles.price}>{price}</Text>
          </View>

          {/* ACTIONS */}
          <View style={styles.actions}>
            {onEdit && (
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  onEdit(property);
                }}
                style={({ pressed }) => [
                  styles.editButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
            )}

            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onPress?.(property);
              }}
              style={({ pressed }) => [
                styles.viewButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.viewText}>View →</Text>
            </Pressable>
          </View>
        </View>
      </GlassCardV1>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },

  card: {
    padding: 18,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  titleContainer: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    color: colorsV1.textPrimary,
    ...typographyV1.h3,
    fontWeight: '700',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 7,
  },

  locationIcon: {
    fontSize: 12,
    marginRight: 5,
  },

  location: {
    flex: 1,
    color: colorsV1.textSecondary,
    ...typographyV1.caption,
    lineHeight: 18,
  },

  areaSection: {
    marginTop: 20,
    paddingTop: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colorsV1.borderColor,
  },

  sectionLabel: {
    color: colorsV1.textMuted,
    ...typographyV1.caption,
    fontWeight: '600',
    letterSpacing: 0.8,
  },

  area: {
    marginTop: 5,
    color: colorsV1.textPrimary,
    ...typographyV1.bodyMedium,
    fontSize: 16,
  },

  bottomRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  priceContainer: {
    flex: 1,
  },

  price: {
    marginTop: 4,
    color: colorsV1.primaryColor,
    ...typographyV1.price,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  editButton: {
    minHeight: 36,
    paddingHorizontal: 13,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorsV1.cardBackgroundLight,
    borderWidth: 1,
    borderColor: colorsV1.borderColorStrong,
  },

  editText: {
    color: colorsV1.primaryColor,
    ...typographyV1.button,
    fontSize: 12,
  },

  viewButton: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorsV1.primaryColor,
  },

  viewText: {
    color: colorsV1.black,
    ...typographyV1.button,
    fontSize: 12,
    fontWeight: '700',
  },

  buttonPressed: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.92,
  },
});

export default PropertyCardV1;