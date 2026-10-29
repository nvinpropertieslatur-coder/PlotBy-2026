
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { AppText } from "@/src/components/ui";
import { colors } from "@/src/theme";
import type { Plot } from "@/src/features/map/types";

type PlotWheelItemProps = {
  plot: Plot;
  index: number;
  step: number;
  size: number;
  scroll: SharedValue<number>;
  selected: boolean;
  onPress: () => void;
};

function formatTotalPrice(value: number): string {
  if (!Number.isFinite(value)) {
    return "N/A";
  }

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

  return `₹${value.toLocaleString("en-IN")}`;
}

export const PlotWheelItem = memo(function PlotWheelItem({
  plot,
  index,
  step,
  size,
  scroll,
  selected,
  onPress,
}: PlotWheelItemProps) {
  // Original wheel animation unchanged
  const animated = useAnimatedStyle(() => {
    const d = Math.abs(scroll.value / step - index);

    return {
      transform: [
        {
          translateY: interpolate(
            d,
            [0, 1, 2],
            [0, 12, 30],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            d,
            [0, 1, 2],
            [1, 0.87, 0.75],
            Extrapolation.CLAMP
          ),
        },
      ],

      opacity: interpolate(
        d,
        [0, 1, 2],
        [1, 0.95, 0.8],
        Extrapolation.CLAMP
      ),
    };
  });

  // Final selling amount after discount
  const totalPrice =
    plot.finalAmount ??
    plot.areaSqft * plot.ratePerSqft;

  const formattedPrice = formatTotalPrice(totalPrice);

  const formattedArea =
    `${plot.areaSqft.toLocaleString("en-IN")} sqft`;

  const mainColor = selected
    ? colors.background
    : colors.yellow;

  const secondaryColor = selected
    ? colors.background
    : colors.text;

  return (
    <Animated.View
      style={[
        {
          width: step,
          alignItems: "center",
        },
        animated,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${formattedPrice}, ${formattedArea}`}
        onPress={onPress}
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          selected && styles.active,
        ]}
      >
        {/* Large total price */}
        <AppText
          style={[
            styles.totalPrice,
            { color: mainColor },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formattedPrice}
        </AppText>

        {/* Divider */}
        <View
          style={[
            styles.divider,
            { backgroundColor: mainColor },
          ]}
        />

        {/* Small plot size */}
        <View style={styles.areaRow}>
          <MaterialCommunityIcons
            name="vector-square"
            size={10}
            color={secondaryColor}
          />

          <AppText
            style={[
              styles.plotArea,
              { color: secondaryColor },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formattedArea}
          </AppText>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  // Original circle dimensions are controlled
  // by the "size" prop from PlotCarousel.
  circle: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.yellow,
    backgroundColor: colors.background,
    paddingHorizontal: 4,
  },

  // Original selected circle style
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  // Large total selling price
  totalPrice: {
    width: "100%",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
  },

  // Thin divider between price and size
  divider: {
    width: "50%",
    height: 1,
    opacity: 0.5,
    marginVertical: 3,
  },

  // Plot area with icon
  areaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    maxWidth: "100%",
  },

  plotArea: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "600",
    textAlign: "center",
    includeFontPadding: false,
    flexShrink: 1,
  },
});
