import { useEffect, useRef } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useSharedValue } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { AppText } from "@/src/browse/components/ui";
import { colors, spacing } from "@/src/browse/theme";
import type { Plot } from "@/src/browse/features/map/types";
import { getCenteredPlotIndex } from "./carouselMath";
import { PlotCard } from "./PlotCard";
import { PlotWheelItem } from "./PlotWheelItem";

export function PlotCarousel({
  plots,
  selectedPlotId,
  onSelectPlot,
  onPressPlot,
  maxCardHeight,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: {
  plots: readonly Plot[];
  selectedPlotId?: string;
  onSelectPlot: (id: string) => void;
  onPressPlot: (id: string) => void;
  maxCardHeight?: number;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}) {
  type LoadMoreItem = { id: "__load-more__"; loadMore: true };
  type WheelItem = Plot | LoadMoreItem;
  const loadMoreItem: LoadMoreItem = { id: "__load-more__", loadMore: true };
  const wheelItems: readonly WheelItem[] = hasMore ? [...plots, loadMoreItem] : plots;
  const isLoadMoreItem = (item: WheelItem): item is LoadMoreItem => "loadMore" in item;
  const listRef = useRef<FlatList<WheelItem>>(null);
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
            data={wheelItems}
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
                wheelItems.length,
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
                  wheelItems.length,
                );
                const centeredPlot = wheelItems[centeredIndex];
                if (
                  centeredPlot &&
                  !isLoadMoreItem(centeredPlot) &&
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
                wheelItems[
                  getCenteredPlotIndex(
                    event.nativeEvent.contentOffset.x,
                    step,
                    wheelItems.length,
                  )
                ];
              if (plot && !isLoadMoreItem(plot) && plot.id !== selectedPlotId) onSelectPlot(plot.id);
            }}
            renderItem={({ item, index: itemIndex }) => isLoadMoreItem(item) ? (
              <View style={{ width: step, alignItems: "center" }}>
                <Pressable accessibilityRole="button" accessibilityLabel="Load more properties" accessibilityState={{ busy: loadingMore, disabled: loadingMore }} disabled={loadingMore} onPress={() => { playHaptic("tap"); onLoadMore?.(); }} style={({ pressed }) => [styles.loadMoreCircle, { width: size, height: size, borderRadius: size / 2 }, pressed && styles.loadMorePressed]}>
                  {loadingMore ? <ActivityIndicator color="#8CFF32" /> : <AppText style={styles.loadMorePlus}>+</AppText>}
                </Pressable>
                <AppText style={styles.loadMoreLabel}>More</AppText>
              </View>
            ) : (
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
  loadMoreCircle: { alignItems: "center", justifyContent: "center", backgroundColor: "#101310", borderWidth: 2, borderColor: "#8CFF32", shadowColor: "#8CFF32", shadowOpacity: 0.22, shadowRadius: 7 },
  loadMorePressed: { transform: [{ scale: 0.94 }], backgroundColor: "#1C2718" },
  loadMorePlus: { color: "#8CFF32", fontSize: 34, lineHeight: 38, fontWeight: "500" },
  loadMoreLabel: { color: colors.text, fontSize: 10, marginTop: 3 },
});
