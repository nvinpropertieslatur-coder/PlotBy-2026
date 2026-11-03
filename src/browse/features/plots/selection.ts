import type { Plot } from '@/src/browse/features/map/types';
export function plotsForCity(plots: readonly Plot[], cityId: string): Plot[] { return plots.filter((plot) => plot.cityId === cityId); }
export function resetSelectionForPlots(plots: readonly Plot[], selectedPlotId?: string): string | undefined { return plots.some((plot) => plot.id === selectedPlotId) ? selectedPlotId : plots[0]?.id; }
