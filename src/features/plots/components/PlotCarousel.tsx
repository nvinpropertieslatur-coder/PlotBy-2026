import { useEffect, useRef } from "react";
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useSharedValue } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { AppText } from "@/src/components/ui";
import { colors, spacing } from "@/src/theme";
import type { Plot } from "@/src/features/map/types";
import { getCenteredPlotIndex } from "./carouselMath";
import { PlotCard } from "./PlotCard";
import { PlotWheelItem } from "./PlotWheelItem";

export function PlotCarousel({
  plots,
  selectedPlotId,
  onSelectPlot,
  onPressPlot,
  maxCardHeight,
}: {
  plots: readonly Plot[];
  selectedPlotId?: string;
  onSelectPlot: (id: string) => void;
  onPressPlot: (id: string) => void;
  maxCardHeight?: number;
}) {
  const listRef = useRef<FlatList<Plot>>(null);
  const userScrolling = useRef(false);
  const lastHapticIndex = useRef<number | null>(null);
  const hapticInFlight = useRef(false);
  const lastOffset = useRef(0);
  const endDragTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUserSelection = useRef<string | undefined>(undefined);
  const { width } = useWindowDimensions();
  const scroll = useSharedValue(0);
  const size = Math.min(76, Math.max(58, width * 0.19));
  const step = size + 4;
  const index = plots.findIndex((plot) => plot.id === selectedPlotId);
  const selected = plots[index];
  useEffect(() => {
    if (index >= 0 && selectedPlotId !== lastUserSelection.current) {
      userScrolling.current = false;
      listRef.current?.scrollToOffset({ offset: index * step, animated: true });
    }
  }, [index, step, selectedPlotId]);
  useEffect(
    () => () => {
      if (endDragTimer.current) clearTimeout(endDragTimer.current);
    },
    [],
  );
  const playHaptic = (kind: "tick" | "tap") => {
    if (hapticInFlight.current) return;
    hapticInFlight.current = true;
    const request =
      kind === "tick"
        ? Haptics.selectionAsync()
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void request
      .catch(() => {})
      .finally(() => {
        hapticInFlight.current = false;
      });
  };
  if (!plots.length)
    return (
      <View style={styles.empty}>
        <AppText muted>No plots in this city.</AppText>
      </View>
    );
  return (
    <View>
      {selected && (
        <PlotCard
          plot={selected}
          onPress={() => onPressPlot(selected.id)}
          maxCardHeight={maxCardHeight}
        />
      )}
      <View style={styles.ringContainer}>
        <View style={[styles.wheel, { height: size + 32 }]}>
          <Svg
            pointerEvents="none"
            width={width}
            height={size + 32}
            style={StyleSheet.absoluteFill}
          >
            <Path
              d={`M 0 ${size + 26} Q ${width / 2} ${size - 20} ${width} ${size + 26}`}
              stroke={colors.primary}
              strokeWidth="3"
              fill="none"
            />
          </Svg>
          <FlatList
            ref={listRef}
            data={plots}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: (width - step) / 2 }}
            keyExtractor={(plot) => plot.id}
            snapToInterval={step}
            decelerationRate="fast"
            scrollEventThrottle={16}
            onScrollBeginDrag={() => {
              if (endDragTimer.current) clearTimeout(endDragTimer.current);
              userScrolling.current = true;
              lastUserSelection.current = selectedPlotId;
              lastHapticIndex.current = getCenteredPlotIndex(
                lastOffset.current,
                step,
                plots.length,
              );
            }}
            onScrollEndDrag={() => {
              endDragTimer.current = setTimeout(() => {
                userScrolling.current = false;
              }, 150);
            }}
            onMomentumScrollBegin={() => {
              if (endDragTimer.current) clearTimeout(endDragTimer.current);
            }}
            onScroll={(event) => {
              const offset = event.nativeEvent.contentOffset.x;
              lastOffset.current = offset;
              scroll.value = offset;
              if (userScrolling.current) {
                const centeredIndex = getCenteredPlotIndex(
                  offset,
                  step,
                  plots.length,
                );
                const centeredPlot = plots[centeredIndex];
                if (
                  centeredPlot &&
                  centeredPlot.id !== lastUserSelection.current
                ) {
                  lastUserSelection.current = centeredPlot.id;
                  onSelectPlot(centeredPlot.id);
                }
                if (centeredIndex !== lastHapticIndex.current) {
                  lastHapticIndex.current = centeredIndex;
                  playHaptic("tick");
                }
              }
            }}
            getItemLayout={(_, itemIndex) => ({
              length: step,
              offset: step * itemIndex,
              index: itemIndex,
            })}
            onMomentumScrollEnd={(event) => {
              if (!userScrolling.current) return;
              userScrolling.current = false;
              const plot =
                plots[
                  getCenteredPlotIndex(
                    event.nativeEvent.contentOffset.x,
                    step,
                    plots.length,
                  )
                ];
              if (plot && plot.id !== selectedPlotId) onSelectPlot(plot.id);
            }}
            renderItem={({ item, index: itemIndex }) => (
              <PlotWheelItem
                plot={item}
                index={itemIndex}
                step={step}
                size={size}
                scroll={scroll}
                selected={item.id === selectedPlotId}
                onPress={() => {
                  userScrolling.current = false;
                  lastUserSelection.current = undefined;
                  playHaptic("tap");
                  onSelectPlot(item.id);
                }}
              />
            )}
          />
        </View>
        <View
          pointerEvents="none"
          style={[
            styles.selectionRing,
            {
              width: size + 10,
              height: size + 10,
              borderRadius: (size + 10) / 2,
              top: -5,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { padding: spacing.lg, backgroundColor: colors.background },
  ringContainer: { position: "relative" },
  selectionRing: {
    position: "absolute",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: "transparent",
    shadowColor: colors.white,
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  wheel: { overflow: "hidden" },
});
