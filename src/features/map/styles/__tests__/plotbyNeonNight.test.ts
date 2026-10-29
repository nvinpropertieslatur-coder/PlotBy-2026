import { isRasterTileTemplate } from '../plotbyNeonNight';

describe('Neon Night raster configuration', () => {
  it('accepts an HTTPS XYZ image template with a query string', () => {
    expect(isRasterTileTemplate('https://tiles.example.com/{z}/{x}/{y}.png?key=public')).toBe(true);
  });
  it('rejects style JSON, missing coordinates, and insecure URLs', () => {
    expect(isRasterTileTemplate('https://tiles.example.com/style.json')).toBe(false);
    expect(isRasterTileTemplate('https://tiles.example.com/{z}/{x}.png')).toBe(false);
    expect(isRasterTileTemplate('http://tiles.example.com/{z}/{x}/{y}.png')).toBe(false);
  });
});
