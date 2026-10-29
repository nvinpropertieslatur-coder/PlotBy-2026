import { memo, useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/src/components/ui";
import { colors, radius, spacing } from "@/src/theme";
import type { Plot } from "../types";
import { markerScale, type MarkerZoomTier } from "../markerZoom";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const PlotMarker = memo(function PlotMarker({
  plot,
  selected,
  onPress,
  tier = "neighborhood",
}: {
  plot: Plot;
  selected: boolean;
  onPress: () => void;
  tier?: MarkerZoomTier;
}) {
  const scale = useRef(
    new Animated.Value(tier === "far" ? 1 : markerScale[tier]),
  ).current;
  useEffect(() => {
    if (tier === "far") return;
    const animation = Animated.timing(scale, {
      toValue: markerScale[tier],
      duration: 180,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [scale, tier]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${plot.areaSqft} square feet at ₹${plot.ratePerSqft} per square foot`}
      onPress={onPress}
      style={styles.wrapper}
    >
      {tier === "far" ? (
        <View style={[styles.farDot]} />
      ) : (
        <Animated.View style={{ alignItems: "center", transform: [{ scale }] }}>
          <View style={[styles.marker]}>
            <View style={styles.areaContainer}>
              <MaterialCommunityIcons
                name="vector-square"
                size={16}
                color={ "#FFFFFF"}
              />

              <AppText
                variant="caption"
                style={[styles.area, ]}
              >
                {plot.areaSqft.toLocaleString("en-IN")} sqft
              </AppText>
            </View>

            <View style={styles.areaContainer}>
              <MaterialCommunityIcons
                name="currency-inr"
                size={16}
                color={"#FFFFFF"}
              />

             <AppText
              variant="caption"
              style={[styles.rate,]}
            >
              {plot.ratePerSqft.toLocaleString("en-IN")} /sqft
            </AppText>
            </View>

           
            <View
              style={[styles.pointer]}
            />
          </View>
          <View style={[styles.dot]} />
          {selected && <View pointerEvents="none" style={styles.halo} />}
        </Animated.View>
      )}
    </Pressable>
  );
});
const styles = StyleSheet.create({
  areaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  halo: {
    position: "absolute",
    bottom: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(201,255,50,0.22)",
  },
  farDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.yellow,
    borderWidth: 2,
    borderColor: colors.background,
  },
  selectedFarDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
  },
  wrapper: { alignItems: "center", paddingBottom: 2 },
  marker: {
    minWidth: 94,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.yellow,
    borderWidth: 1.5,
    borderRadius: radius.md,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  area: { color: colors.text, fontWeight: "800", textAlign: "center" },
  rate: { color: colors.yellow, fontWeight: "700", textAlign: "center" },
  dark: { color: colors.background },
  pointer: {
    position: "absolute",
    bottom: -6,
    width: 10,
    height: 10,
    backgroundColor: colors.background,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: colors.yellow,
    transform: [{ rotate: "45deg" }],
  },
  selectedPointer: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dot: {
    marginTop: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.yellow,
  },
  selectedDot: { backgroundColor: colors.primary },
});
