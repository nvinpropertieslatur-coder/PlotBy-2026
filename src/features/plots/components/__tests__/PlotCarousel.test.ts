import { getCenteredPlotIndex } from '../carouselMath';

describe('curved plot carousel selection', () => {
  it('selects the nearest centered item and clamps the ends', () => {
    expect(getCenteredPlotIndex(0, 100, 3)).toBe(0);
    expect(getCenteredPlotIndex(149, 100, 3)).toBe(1);
    expect(getCenteredPlotIndex(900, 100, 3)).toBe(2);
  });
});
