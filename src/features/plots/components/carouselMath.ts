export function getCenteredPlotIndex(offsetX: number, itemStep: number, count: number): number { return Math.max(0, Math.min(Math.max(0, count - 1), Math.round(offsetX / itemStep))); }
