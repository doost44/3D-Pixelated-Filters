import { type PaletteName, COLOR_PALETTES, findClosestColor } from './colorPalettes';

function clamp(value: number): number {
  return value < 0 ? 0 : value > 255 ? 255 : value;
}

export function applyPixelate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pixelSize: number
): void {
  if (pixelSize <= 1) return;
  const offscreen = document.createElement('canvas');
  const sw = Math.max(1, Math.floor(width / pixelSize));
  const sh = Math.max(1, Math.floor(height / pixelSize));
  offscreen.width = sw;
  offscreen.height = sh;
  const offCtx = offscreen.getContext('2d')!;
  offCtx.imageSmoothingEnabled = false;
  offCtx.drawImage(ctx.canvas, 0, 0, sw, sh);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offscreen, 0, 0, width, height);
}

export function applyDither(imageData: ImageData, amount: number, paletteName: PaletteName): ImageData {
  const palette = COLOR_PALETTES[paletteName];
  if (palette.length === 0 || amount === 0) return imageData;
  const data = new Uint8ClampedArray(imageData.data);
  const w = imageData.width;
  const h = imageData.height;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const oldR = data[i], oldG = data[i + 1], oldB = data[i + 2];
      const [newR, newG, newB] = findClosestColor(oldR, oldG, oldB, palette);
      data[i] = newR; data[i + 1] = newG; data[i + 2] = newB;
      const errR = (oldR - newR) * amount / 100;
      const errG = (oldG - newG) * amount / 100;
      const errB = (oldB - newB) * amount / 100;
      // Floyd-Steinberg
      if (x + 1 < w) {
        data[i + 4] = clamp(data[i + 4] + errR * 7 / 16);
        data[i + 5] = clamp(data[i + 5] + errG * 7 / 16);
        data[i + 6] = clamp(data[i + 6] + errB * 7 / 16);
      }
      if (y + 1 < h) {
        if (x > 0) {
          data[i + (w - 1) * 4] = clamp(data[i + (w - 1) * 4] + errR * 3 / 16);
          data[i + (w - 1) * 4 + 1] = clamp(data[i + (w - 1) * 4 + 1] + errG * 3 / 16);
          data[i + (w - 1) * 4 + 2] = clamp(data[i + (w - 1) * 4 + 2] + errB * 3 / 16);
        }
        data[i + w * 4] = clamp(data[i + w * 4] + errR * 5 / 16);
        data[i + w * 4 + 1] = clamp(data[i + w * 4 + 1] + errG * 5 / 16);
        data[i + w * 4 + 2] = clamp(data[i + w * 4 + 2] + errB * 5 / 16);
        if (x + 1 < w) {
          data[i + (w + 1) * 4] = clamp(data[i + (w + 1) * 4] + errR * 1 / 16);
          data[i + (w + 1) * 4 + 1] = clamp(data[i + (w + 1) * 4 + 1] + errG * 1 / 16);
          data[i + (w + 1) * 4 + 2] = clamp(data[i + (w + 1) * 4 + 2] + errB * 1 / 16);
        }
      }
    }
  }
  return new ImageData(data, w, h);
}

export function applyCRT(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.save();
  for (let y = 0; y < height; y += 4) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, y, width, 2);
  }
  const gradient = ctx.createRadialGradient(width / 2, height / 2, height * 0.3, width / 2, height / 2, height * 0.8);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export function applyPosterize(imageData: ImageData, levels: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const step = 255 / (Math.max(2, levels) - 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i] / step) * step);
    data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
    data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
  }
  return new ImageData(data, imageData.width, imageData.height);
}

export function applyMosaic(ctx: CanvasRenderingContext2D, width: number, height: number, tileSize: number): void {
  const size = Math.max(2, tileSize);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      for (let dy = 0; dy < size && y + dy < height; dy++) {
        for (let dx = 0; dx < size && x + dx < width; dx++) {
          const j = ((y + dy) * width + (x + dx)) * 4;
          data[j] = r; data[j + 1] = g; data[j + 2] = b;
        }
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

export function applyGlitch(ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number): void {
  if (intensity === 0) return;
  const strips = Math.floor(intensity / 10) + 2;
  for (let i = 0; i < strips; i++) {
    const y = Math.floor(Math.random() * height);
    const h = Math.floor(Math.random() * 20) + 2;
    const shift = (Math.random() - 0.5) * intensity * 2;
    const slice = ctx.getImageData(0, y, width, Math.min(h, height - y));
    ctx.putImageData(slice, shift, y);
  }
  if (intensity > 30) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.3;
    const offset = intensity / 20;
    const snap = ctx.getImageData(0, 0, width, height);
    const r = document.createElement('canvas');
    r.width = width; r.height = height;
    const rCtx = r.getContext('2d')!;
    rCtx.putImageData(snap, 0, 0);
    ctx.drawImage(r, offset, 0);
    ctx.restore();
  }
}

export function applyScanlines(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.save();
  for (let y = 0; y < height; y += 3) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, y, width, 1);
  }
  ctx.restore();
}

export function applyEdgeGlow(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const edges = new Uint8ClampedArray(data.length);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const gx = -data[i - 4] + data[i + 4];
      const gy = -data[i - width * 4] + data[i + width * 4];
      const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      edges[i] = 0; edges[i + 1] = Math.floor(mag * 0.8); edges[i + 2] = Math.floor(mag);
      edges[i + 3] = mag > 20 ? 200 : 0;
    }
  }
  const edgeData = new ImageData(edges, width, height);
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width; tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(edgeData, 0, 0);
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.restore();
}

// Bayer 4x4 ordered dithering matrix for cross-hatch look
const BAYER4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
];

export function applyDarkFantasy(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pixelSize: number,
): void {
  // 1) Pixelate
  applyPixelate(ctx, width, height, Math.max(3, pixelSize));

  // 2) Darken + desaturate + push toward purple/brown via pixel manipulation
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      let r = data[i], g = data[i + 1], b = data[i + 2];

      // Desaturate partially
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = r * 0.6 + lum * 0.4;
      g = g * 0.5 + lum * 0.5;
      b = b * 0.6 + lum * 0.4;

      // Push shadows toward purple, midtones toward brown
      if (lum < 80) {
        r = r * 0.7 + 30;
        b = b * 0.7 + 40;
        g = g * 0.6;
      } else if (lum < 160) {
        r = r * 0.85 + 15;
        g = g * 0.8 + 10;
        b = b * 0.75;
      }

      // Ordered dithering: quantize with Bayer threshold
      const threshold = (BAYER4[y % 4][x % 4] / 16 - 0.5) * 48;
      r = clamp(Math.round(r + threshold));
      g = clamp(Math.round(g + threshold));
      b = clamp(Math.round(b + threshold));

      // Posterize to fewer levels for that painted pixel-art feel
      const levels = 8;
      const step = 255 / (levels - 1);
      r = Math.round(Math.round(r / step) * step);
      g = Math.round(Math.round(g / step) * step);
      b = Math.round(Math.round(b / step) * step);

      data[i] = r; data[i + 1] = g; data[i + 2] = b;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // 3) Heavy vignette
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, height * 0.2,
    width / 2, height / 2, height * 0.75,
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.6, 'rgba(0,0,0,0.3)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export function applyVoxelArt(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pixelSize: number,
): void {
  // 1) Chunky pixelation — slightly larger than input for bold voxel blocks
  const blockSize = Math.max(4, Math.round(pixelSize * 1.5));
  applyPixelate(ctx, width, height, blockSize);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // 2) Per-pixel: atmospheric depth, warm/cool split, 3D block shading
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      let r = data[i], g = data[i + 1], b = data[i + 2];

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Boost contrast: push darks darker, brights brighter
      r = clamp(((r - 128) * 1.4) + 128);
      g = clamp(((g - 128) * 1.4) + 128);
      b = clamp(((b - 128) * 1.4) + 128);

      // Warm/cool color split based on luminance
      if (lum < 60) {
        // Deep shadows → cool purple/blue
        r = r * 0.5 + 15;
        g = g * 0.4;
        b = b * 0.6 + 30;
      } else if (lum < 120) {
        // Midtones → slightly desaturated, moody
        r = r * 0.8 + 10;
        g = g * 0.75 + 5;
        b = b * 0.7 + 15;
      } else if (lum > 200) {
        // Bright areas → warm glow (push toward amber/orange)
        r = clamp(r * 1.1 + 20);
        g = g * 0.95 + 10;
        b = b * 0.7;
      }

      // 3D block edge highlight: simulate light hitting block edges
      const bx = x % blockSize;
      const by = y % blockSize;
      if (bx === 0 || by === 0) {
        // Top/left edge — lighter (light source top-left)
        r = clamp(r + 18);
        g = clamp(g + 15);
        b = clamp(b + 12);
      } else if (bx === blockSize - 1 || by === blockSize - 1) {
        // Bottom/right edge — darker
        r = clamp(r - 20);
        g = clamp(g - 20);
        b = clamp(b - 18);
      }

      // Ordered dithering for textured look
      const threshold = (BAYER4[y % 4][x % 4] / 16 - 0.5) * 32;
      r = clamp(Math.round(r + threshold));
      g = clamp(Math.round(g + threshold));
      b = clamp(Math.round(b + threshold));

      // Posterize to limited levels for pixel art feel
      const levels = 10;
      const step = 255 / (levels - 1);
      r = Math.round(Math.round(r / step) * step);
      g = Math.round(Math.round(g / step) * step);
      b = Math.round(Math.round(b / step) * step);

      data[i] = r; data[i + 1] = g; data[i + 2] = b;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // 3) Atmospheric vignette — heavier than standard, with slight warm tint
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, height * 0.25,
    width / 2, height / 2, height * 0.7,
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.5, 'rgba(5,2,10,0.25)');
  gradient.addColorStop(1, 'rgba(8,4,16,0.7)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export function applyColorPalette(imageData: ImageData, paletteName: PaletteName): ImageData {
  const palette = COLOR_PALETTES[paletteName];
  if (palette.length === 0) return imageData;
  const data = new Uint8ClampedArray(imageData.data);
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = findClosestColor(data[i], data[i + 1], data[i + 2], palette);
    data[i] = r; data[i + 1] = g; data[i + 2] = b;
  }
  return new ImageData(data, imageData.width, imageData.height);
}
