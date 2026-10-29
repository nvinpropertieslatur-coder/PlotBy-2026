import { isValidPlot } from '../types';
import { SAMPLE_PLOTS } from '../samplePlots';

describe('property map plot data', () => {
  it('provides stable valid sample plot coordinates', () => {
    expect(SAMPLE_PLOTS).toHaveLength(10);
    expect(SAMPLE_PLOTS.every(isValidPlot)).toBe(true);
    expect(new Set(SAMPLE_PLOTS.map((plot) => plot.id)).size).toBe(SAMPLE_PLOTS.length);
  });

  it('rejects invalid coordinates', () => {
    expect(isValidPlot({ ...SAMPLE_PLOTS[0], latitude: 91 })).toBe(false);
    expect(isValidPlot({ ...SAMPLE_PLOTS[0], longitude: Number.NaN })).toBe(false);
  });
});
