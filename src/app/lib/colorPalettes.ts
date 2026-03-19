export type RGB = [number, number, number];
export type PaletteName = 'Techno' | 'GameBoy' | 'Neon' | 'Vaporwave' | 'Monochrome' | 'RGB';

export const COLOR_PALETTES: Record<PaletteName, RGB[]> = {
  Techno: [
    [0, 255, 255], [255, 0, 255], [0, 0, 0], [255, 255, 0],
    [0, 128, 255], [255, 128, 0], [0, 255, 128], [128, 0, 255],
    [255, 0, 128], [0, 64, 128], [64, 0, 128], [128, 255, 0],
    [0, 0, 128], [128, 0, 0], [0, 128, 0], [255, 255, 255],
  ],
  GameBoy: [
    [15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15],
  ],
  Neon: [
    [255, 0, 128], [0, 255, 128], [255, 255, 0], [0, 128, 255],
    [255, 0, 255], [0, 255, 255], [255, 128, 0], [128, 0, 255],
    [255, 64, 64], [64, 255, 64], [64, 64, 255], [255, 200, 0],
    [0, 200, 255], [200, 0, 255], [255, 255, 255], [0, 0, 0],
  ],
  Vaporwave: [
    [255, 113, 206], [1, 205, 254], [185, 103, 255], [255, 251, 150],
    [5, 255, 161], [255, 45, 85], [88, 86, 214], [175, 82, 222],
    [255, 149, 0], [52, 199, 89], [0, 122, 255], [255, 59, 48],
    [100, 0, 80], [0, 50, 100], [50, 0, 60], [10, 10, 30],
  ],
  Monochrome: [
    [0, 0, 0], [18, 18, 18], [36, 36, 36], [54, 54, 54],
    [73, 73, 73], [91, 91, 91], [109, 109, 109], [128, 128, 128],
    [146, 146, 146], [164, 164, 164], [182, 182, 182], [200, 200, 200],
    [218, 218, 218], [236, 236, 236], [245, 245, 245], [255, 255, 255],
  ],
  RGB: [],
};

export function findClosestColor(r: number, g: number, b: number, palette: RGB[]): RGB {
  if (palette.length === 0) return [r, g, b];
  let best = palette[0];
  let bestDist = Infinity;
  for (const color of palette) {
    const dr = r - color[0];
    const dg = g - color[1];
    const db = b - color[2];
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = color;
    }
  }
  return best;
}
