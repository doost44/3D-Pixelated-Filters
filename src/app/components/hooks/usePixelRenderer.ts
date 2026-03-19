'use client';
import { useRef, useEffect, useCallback } from 'react';
import type { StyleSettings } from '../../lib/stylePresets';
import type { PaletteName } from '../../lib/colorPalettes';
import {
  applyPixelate, applyDither, applyCRT, applyPosterize,
  applyMosaic, applyGlitch, applyScanlines, applyEdgeGlow, applyColorPalette
} from '../../lib/pixelEffects';

export function usePixelRenderer(
  videoRef: React.MutableRefObject<HTMLVideoElement | null>,
  settings: StyleSettings
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(render);
      return;
    }

    frameCountRef.current++;
    if (frameCountRef.current % (settings.frameSkip + 1) !== 0) {
      rafRef.current = requestAnimationFrame(render);
      return;
    }

    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    if (!settings.transparentBg) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.clearRect(0, 0, w, h);
    }

    const filter = [
      settings.blur > 0 ? `blur(${settings.blur}px)` : '',
      `contrast(${settings.contrast}%)`,
      `brightness(${settings.brightness}%)`,
      `saturate(${settings.saturation}%)`,
    ].filter(Boolean).join(' ');

    ctx.filter = filter || 'none';

    const vw = video.videoWidth || w;
    const vh = video.videoHeight || h;
    const aspect = vw / vh;
    let drawW = w, drawH = h;
    if (aspect > 1) { drawH = w / aspect; } else { drawW = h * aspect; }
    const dx = (w - drawW) / 2;
    const dy = (h - drawH) / 2;
    ctx.drawImage(video, dx, dy, drawW, drawH);
    ctx.filter = 'none';
    ctx.restore();

    const effect = settings.effect;
    if (effect === 'Pixel' || effect === 'Dither') {
      applyPixelate(ctx, w, h, settings.pixelSize);
    }
    if (effect === 'Dither' && settings.ditheringAmount > 0) {
      const imageData = ctx.getImageData(0, 0, w, h);
      const dithered = applyDither(imageData, settings.ditheringAmount, settings.palette as PaletteName);
      ctx.putImageData(dithered, 0, 0);
    }
    if (effect === 'CRT') {
      applyPixelate(ctx, w, h, settings.pixelSize);
      applyCRT(ctx, w, h);
    }
    if (effect === 'Posterize') {
      const imageData = ctx.getImageData(0, 0, w, h);
      const posterized = applyPosterize(imageData, Math.max(2, Math.floor(settings.pixelSize)));
      ctx.putImageData(posterized, 0, 0);
    }
    if (effect === 'Mosaic') {
      applyMosaic(ctx, w, h, settings.pixelSize * 2);
    }
    if (effect === 'Glitch') {
      applyGlitch(ctx, w, h, settings.pixelSize * 3);
    }

    if (settings.palette !== 'RGB') {
      const imageData = ctx.getImageData(0, 0, w, h);
      const palettized = applyColorPalette(imageData, settings.palette as PaletteName);
      ctx.putImageData(palettized, 0, 0);
    }

    if (settings.scanlines) applyScanlines(ctx, w, h);
    if (settings.edgeGlow) applyEdgeGlow(ctx, w, h);

    rafRef.current = requestAnimationFrame(render);
  }, [videoRef, settings]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  return canvasRef;
}
