
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/src/components/ui";
import { colors, spacing } from "@/src/theme";
import type { Plot } from "@/src/features/map/types";

import {
  formatINR,
  formatPlotArea,
  formatRatePerSqft,
} from "../utils/formatters";

type PlotWithDimensions = Plot & {
  width?: number | null;
  length?: number | null;
};

type PlotCardProps = {
  plot: PlotWithDimensions;
  onPress: () => void;
  maxCardHeight?: number;
};

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

function Feature({
  icon,
  label,
}: {
  icon: IconName;
  label: string;
}) {
  return (
    <View style={styles.feature}>
      <MaterialCommunityIcons
        name={icon}
        size={14}
        color={colors.muted}
      />
      <AppText style={styles.featureText} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

function displayPrice(value: number): string {
  if (!Number.isFinite(value)) return "Price unavailable";

  if (value >= 10000000) {
    return `₹${(value / 10000000).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })} L`;
  }

  return formatINR(value);
}

export const PlotCard = memo(function PlotCard({
  plot,
  onPress,
  maxCardHeight,
}: PlotCardProps) {
  const basePrice = plot.areaSqft * plot.ratePerSqft;

  const finalPrice = plot.finalAmount ?? basePrice;

  const hasDiscount =
    Number.isFinite(basePrice) &&
    Number.isFinite(finalPrice) &&
    basePrice > 0 &&
    finalPrice >= 0 &&
    finalPrice < basePrice;

  const savings = hasDiscount
    ? basePrice - finalPrice
    : 0;

  const discountPercent = hasDiscount
    ? Math.round((savings / basePrice) * 100)
    : 0;

  const dimensions =
    plot.width != null &&
    plot.length != null
      ? `${plot.width} × ${plot.length} ft`
      : null;

  const road = plot.roadWidths?.[0];

  const location =
    plot.locality ||
    plot.address ||
    "Location not provided";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View plot details, ${formatPlotArea(
        plot.areaSqft
      )}, ${displayPrice(finalPrice)}`}
      onPress={onPress}
      style={[
        styles.card,
        maxCardHeight != null
          ? { maxHeight: maxCardHeight }
          : undefined,
      ]}
    >
      {/* Top drag indicator */}
  

     

      {/* Main two-column layout */}
      <View style={styles.infoRow}>

        {/* LEFT: PLOT SIZE */}
        <View style={styles.sizeColumn}>

             {/* Location */}
      <View style={styles.location}>
        <MaterialCommunityIcons
          name="map-marker-outline"
          size={16}
          color={colors.muted}
        />

        <AppText
          style={styles.locationText}
          numberOfLines={1}
        >
          {location}
        </AppText>
      </View>


          <AppText
            style={styles.dimensions}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {dimensions ?? "Not specified"}

            <AppText
              style={styles.area}
              numberOfLines={1}
              adjustsFontSizeToFit
            > {" "}
              ( {formatPlotArea(plot.areaSqft)} )
            </AppText>
          </AppText>

          

          <View style={styles.features}>
            {plot.primaryFacing && (
              <Feature
                icon="compass-outline"
                label={`${plot.primaryFacing} facing`}
              />
            )}

            {road != null && (
              <Feature
                icon="road-variant"
                label={`${road} road`}
              />
            )}
          </View>
        </View>

        {/* RIGHT: PRICE */}
        <View style={styles.priceColumn}>
          

          <AppText
            style={styles.rate}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatRatePerSqft(plot.ratePerSqft)}
          </AppText>

          {hasDiscount && (
            <>
              <AppText style={styles.original}>
                {displayPrice(basePrice)}
              </AppText>

              <View style={styles.discountBadge}>
                <MaterialCommunityIcons
                  name="tag-outline"
                  size={12}
                  color="#101010"
                />

                <AppText style={styles.discountText}>
                  {discountPercent}% OFF
                </AppText>
              </View>
            </>
          )}

          <AppText style={styles.finalLabel}>
            ASKING PRICE
          </AppText>

          <AppText
            style={styles.finalPrice}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {displayPrice(finalPrice)}
          </AppText>

          {hasDiscount && (
            <AppText style={styles.savings}>
              Save {displayPrice(savings)}
            </AppText>
          )}
        </View>
      </View>

      {/* Bottom action */}
      <View style={styles.divider} />

      <View style={styles.footer}>
        <AppText style={styles.footerText}>
          VIEW PLOT DETAILS
        </AppText>

        <MaterialCommunityIcons
          name="arrow-top-right"
          size={18}
          color={colors.primary}
        />
      </View>
    </Pressable>
  );
});


const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.xl,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 16,
    backgroundColor: colors.background,
    overflow: "hidden",
  },

  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  locationText: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 13,
    flexShrink: 1,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 0,
  },

  sizeColumn: {
    flex: 1.2,
    minWidth: 0,
    alignItems: "flex-start",
    gap: 3,
  },

  priceColumn: {
    flex: 0.8,
    minWidth: 0,
    alignItems: "flex-end",
    gap: 3,
  },

  eyebrow: {
    color: colors.muted,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "700",
  },

  dimensions: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },

  area: {
    color: colors.yellow,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },

  features: {
    alignItems: "flex-start",
    gap: 3,
    marginTop: 0,
  },

  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#242424",
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    maxWidth: "100%",
  },

  featureText: {
    fontSize: 9,
    lineHeight: 12,
    color: colors.text,
    flexShrink: 1,
  },

  rate: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    textAlign: "right",
  },

  original: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 13,
    textDecorationLine: "line-through",
  },

  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },

  discountText: {
    color: "#101010",
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "800",
  },

  finalLabel: {
    color: colors.muted,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "700",
    marginTop: 0,
  },

  finalPrice: {
    color: colors.primary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800",
    textAlign: "right",
  },

  savings: {
    color: colors.primary,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 7,
    marginBottom: 6,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 1,
  },

  footerText: {
    color: colors.primary,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
