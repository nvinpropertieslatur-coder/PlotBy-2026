import { SAMPLE_PLOTS } from '@/src/features/map/samplePlots';
import { plotsForCity, resetSelectionForPlots } from '../selection';
import { formatINR, formatPlotArea, formatRatePerSqft } from '../utils/formatters';

describe('plot presentation and selection', () => {
  it('formats Indian currency and plot values', () => {
    expect(formatINR(3450000)).toBe('₹34,50,000');
    expect(formatPlotArea(1500)).toBe('1,500 sqft');
    expect(formatRatePerSqft(2500)).toBe('₹2,500/sqft');
  });
  it('resets selection to the first plot when a city changes', () => {
    const latur = plotsForCity(SAMPLE_PLOTS, 'latur');
    expect(resetSelectionForPlots(latur, 'unknown')).toBe('latur-plot-1');
    expect(plotsForCity(SAMPLE_PLOTS, 'pune')).toEqual([]);
    expect(resetSelectionForPlots([], 'latur-plot-1')).toBeUndefined();
  });
  it('preserves a valid selection during rapid updates', () => {
    const plots = plotsForCity(SAMPLE_PLOTS, 'latur');
    expect(resetSelectionForPlots(plots, 'latur-plot-3')).toBe('latur-plot-3');
  });
});
