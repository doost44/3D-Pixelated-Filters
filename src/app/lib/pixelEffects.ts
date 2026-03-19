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

interface Block3DSettings {
  text: string;
  font: string;
  material: string;
  frontColor: string;
  sideColor: string;
  outlineThickness: number;
  extrusionDepth: number;
  extrusionAngle: number;
  perspective: number;
  crackAmount: number;
  shadowStrength: number;
  lightAngle: number;
  highlightAmount: number;
  textureScale: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [139, 115, 85]; // default stone color
}

function applyMaterialTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  material: string,
  baseColor: string,
  textureScale: number,
  crackAmount: number
): void {
  const imageData = ctx.getImageData(x, y, w, h);
  const data = imageData.data;
  const [baseR, baseG, baseB] = hexToRgb(baseColor);
  const scale = textureScale / 100;

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const i = (py * w + px) * 4;
      if (data[i + 3] === 0) continue; // Skip transparent pixels

      let variation = 0;
      const noiseX = px * scale;
      const noiseY = py * scale;

      // Material-specific textures
      switch (material) {
        case 'Stone':
          variation = (Math.sin(noiseX * 0.1) * Math.cos(noiseY * 0.1) * 15) +
                     (Math.random() * 10 - 5);
          break;
        case 'Metal':
          variation = Math.sin(noiseX * 0.2) * Math.cos(noiseY * 0.05) * 20;
          break;
        case 'Wood':
          variation = Math.sin(noiseY * 0.15) * 15 + (Math.random() * 5 - 2.5);
          break;
        case 'Ice':
          variation = (Math.sin(noiseX * 0.3) * Math.cos(noiseY * 0.3) * 10) +
                     (Math.random() * 15 - 7.5);
          break;
        case 'Lava':
          variation = Math.sin(noiseX * 0.2 + Date.now() * 0.001) *
                     Math.cos(noiseY * 0.2) * 30 + (Math.random() * 20);
          break;
        case 'Crystal':
          variation = (Math.sin(noiseX * 0.5) * Math.cos(noiseY * 0.5) * 25) +
                     (Math.random() * 10 - 5);
          break;
      }

      // Add cracks
      if (crackAmount > 0 && Math.random() * 100 < crackAmount * 0.05) {
        const crackNoise = Math.sin(px * 0.5) * Math.cos(py * 0.5);
        if (Math.abs(crackNoise) > 0.8) {
          variation -= 40;
        }
      }

      data[i] = clamp(baseR + variation);
      data[i + 1] = clamp(baseG + variation);
      data[i + 2] = clamp(baseB + variation);
    }
  }

  ctx.putImageData(imageData, x, y);
}

export function apply3DBlockEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: Block3DSettings,
  sourceImage?: HTMLImageElement
): void {
  ctx.clearRect(0, 0, width, height);

  // Create text or use source image as mask
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d')!;

  if (sourceImage && sourceImage.complete && sourceImage.naturalWidth > 0) {
    // Use uploaded image as mask
    const aspectRatio = sourceImage.naturalWidth / sourceImage.naturalHeight;
    let drawWidth = width * 0.7;
    let drawHeight = drawWidth / aspectRatio;
    if (drawHeight > height * 0.7) {
      drawHeight = height * 0.7;
      drawWidth = drawHeight * aspectRatio;
    }
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    maskCtx.drawImage(sourceImage, x, y, drawWidth, drawHeight);
  } else if (settings.text) {
    // Render text as mask
    maskCtx.fillStyle = '#fff';
    maskCtx.textAlign = 'center';
    maskCtx.textBaseline = 'middle';

    // Calculate font size to fit
    let fontSize = 100;
    maskCtx.font = `bold ${fontSize}px ${settings.font}`;
    let metrics = maskCtx.measureText(settings.text);

    while (metrics.width > width * 0.8 && fontSize > 20) {
      fontSize -= 5;
      maskCtx.font = `bold ${fontSize}px ${settings.font}`;
      metrics = maskCtx.measureText(settings.text);
    }

    maskCtx.fillText(settings.text, width / 2, height / 2);
  } else {
    // No text or image, show placeholder
    maskCtx.fillStyle = '#fff';
    maskCtx.textAlign = 'center';
    maskCtx.textBaseline = 'middle';
    maskCtx.font = 'bold 40px Arial';
    maskCtx.fillText('Type text or upload image', width / 2, height / 2);
  }

  // Get mask data
  const maskData = maskCtx.getImageData(0, 0, width, height);

  // Calculate extrusion offset
  const angleRad = (settings.extrusionAngle * Math.PI) / 180;
  const perspectiveFactor = settings.perspective / 100;
  const offsetX = Math.cos(angleRad) * settings.extrusionDepth;
  const offsetY = Math.sin(angleRad) * settings.extrusionDepth;

  // Draw shadow first
  if (settings.shadowStrength > 0) {
    ctx.save();
    ctx.globalAlpha = settings.shadowStrength / 100;
    ctx.fillStyle = '#000';

    for (let layer = 0; layer < settings.extrusionDepth; layer++) {
      const progress = layer / settings.extrusionDepth;
      const shadowOffsetX = offsetX * (1 + progress * perspectiveFactor) * 1.5;
      const shadowOffsetY = offsetY * (1 + progress * perspectiveFactor) * 1.5 + 10;

      ctx.globalAlpha = (settings.shadowStrength / 100) * (1 - progress * 0.5);
      ctx.filter = 'blur(8px)';
      ctx.drawImage(maskCanvas, shadowOffsetX, shadowOffsetY);
    }
    ctx.restore();
  }

  // Draw extrusion layers (sides)
  ctx.save();
  for (let layer = settings.extrusionDepth; layer > 0; layer--) {
    const progress = layer / settings.extrusionDepth;
    const layerOffsetX = offsetX * progress * (1 + (1 - progress) * perspectiveFactor);
    const layerOffsetY = offsetY * progress * (1 + (1 - progress) * perspectiveFactor);

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    // Create temporary canvas for this layer
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(maskCanvas, 0, 0);

    // Apply side color and material
    const tempData = tempCtx.getImageData(0, 0, width, height);
    const [sideR, sideG, sideB] = hexToRgb(settings.sideColor);
    const darkenFactor = 0.7 + progress * 0.3; // Darker sides

    for (let i = 0; i < tempData.data.length; i += 4) {
      if (tempData.data[i + 3] > 0) {
        tempData.data[i] = sideR * darkenFactor;
        tempData.data[i + 1] = sideG * darkenFactor;
        tempData.data[i + 2] = sideB * darkenFactor;
      }
    }
    tempCtx.putImageData(tempData, 0, 0);

    // Apply material texture to layer
    applyMaterialTexture(
      tempCtx, 0, 0, width, height,
      settings.material,
      settings.sideColor,
      settings.textureScale,
      settings.crackAmount * 0.5
    );

    ctx.drawImage(tempCanvas, layerOffsetX, layerOffsetY);
    ctx.restore();
  }
  ctx.restore();

  // Draw front face
  ctx.save();
  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = width;
  frontCanvas.height = height;
  const frontCtx = frontCanvas.getContext('2d')!;
  frontCtx.drawImage(maskCanvas, 0, 0);

  // Apply front color
  const frontData = frontCtx.getImageData(0, 0, width, height);
  const [frontR, frontG, frontB] = hexToRgb(settings.frontColor);

  for (let i = 0; i < frontData.data.length; i += 4) {
    if (frontData.data[i + 3] > 0) {
      frontData.data[i] = frontR;
      frontData.data[i + 1] = frontG;
      frontData.data[i + 2] = frontB;
    }
  }
  frontCtx.putImageData(frontData, 0, 0);

  // Apply material texture
  applyMaterialTexture(
    frontCtx, 0, 0, width, height,
    settings.material,
    settings.frontColor,
    settings.textureScale,
    settings.crackAmount
  );

  // Apply lighting/highlights
  if (settings.highlightAmount > 0) {
    const highlightData = frontCtx.getImageData(0, 0, width, height);
    const lightRad = (settings.lightAngle * Math.PI) / 180;
    const lightX = Math.cos(lightRad);
    const lightY = Math.sin(lightRad);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (highlightData.data[i + 3] > 0) {
          // Simple directional lighting
          const nx = (x - width / 2) / width;
          const ny = (y - height / 2) / height;
          const dot = Math.max(0, nx * lightX + ny * lightY);
          const highlight = dot * settings.highlightAmount;

          highlightData.data[i] = clamp(highlightData.data[i] + highlight);
          highlightData.data[i + 1] = clamp(highlightData.data[i + 1] + highlight);
          highlightData.data[i + 2] = clamp(highlightData.data[i + 2] + highlight);
        }
      }
    }
    frontCtx.putImageData(highlightData, 0, 0);
  }

  ctx.drawImage(frontCanvas, 0, 0);
  ctx.restore();

  // Draw outline
  if (settings.outlineThickness > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = settings.outlineThickness;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Create outline by stroking the mask
    const outlineCanvas = document.createElement('canvas');
    outlineCanvas.width = width;
    outlineCanvas.height = height;
    const outlineCtx = outlineCanvas.getContext('2d')!;
    outlineCtx.drawImage(maskCanvas, 0, 0);

    // Get outline path
    const outlineData = outlineCtx.getImageData(0, 0, width, height);
    ctx.beginPath();
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        if (outlineData.data[i + 3] > 0) {
          // Check if edge pixel
          const isEdge =
            outlineData.data[i - 4 + 3] === 0 ||
            outlineData.data[i + 4 + 3] === 0 ||
            outlineData.data[i - width * 4 + 3] === 0 ||
            outlineData.data[i + width * 4 + 3] === 0;

          if (isEdge) {
            ctx.rect(x, y, 1, 1);
          }
        }
      }
    }
    ctx.stroke();
    ctx.restore();
  }
}
