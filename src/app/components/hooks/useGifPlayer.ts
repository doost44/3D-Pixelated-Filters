"use client";
import { useRef, useCallback, useEffect } from "react";

/**
 * Decodes an animated GIF into frames by drawing it onto a canvas
 * and using the browser's built-in GIF rendering via an img element
 * with requestAnimationFrame polling.
 *
 * Returns a canvas element that continuously renders the current GIF frame.
 */
export function useGifPlayer() {
  const gifCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(false);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    gifCanvasRef.current = canvas;
    return () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const startGifPlayback = useCallback((src: string): HTMLCanvasElement | null => {
    const canvas = gifCanvasRef.current;
    if (!canvas) return null;

    activeRef.current = false;
    cancelAnimationFrame(rafRef.current);

    const img = new Image();
    img.crossOrigin = "anonymous";
    imgRef.current = img;

    img.onload = () => {
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      activeRef.current = true;

      const draw = () => {
        if (!activeRef.current) return;
        const ctx = canvas.getContext("2d");
        if (ctx && img.complete) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }
        rafRef.current = requestAnimationFrame(draw);
      };
      draw();
    };

    img.src = src;
    return canvas;
  }, []);

  const stopGifPlayback = useCallback(() => {
    activeRef.current = false;
    cancelAnimationFrame(rafRef.current);
  }, []);

  return { gifCanvasRef, startGifPlayback, stopGifPlayback };
}
