export const plotImageCountLimit = Math.max(1, Number(process.env.EXPO_PUBLIC_PLOT_IMAGE_LIMIT) || 10);
export const allowedPlotImageTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const plotImageMaxBytes = 10 * 1024 * 1024;

