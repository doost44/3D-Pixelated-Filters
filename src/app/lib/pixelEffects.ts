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
