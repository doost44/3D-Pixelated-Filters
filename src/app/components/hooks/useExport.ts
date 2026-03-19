'use client';
import { useCallback, useState } from 'react';
import { exportAsPngSequence, exportAsWebM } from '../../lib/exportUtils';

export function useExport(canvasRef: React.MutableRefObject<HTMLCanvasElement | null>) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  const exportGIF = useCallback(async (duration: number, fps: number = 12) => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    setExportStatus('Exporting GIF...');

    const GifConstructor = (typeof window !== 'undefined' ? window.GIF : undefined);

    if (!GifConstructor) {
      setExportStatus('gif.js not loaded');
      setIsExporting(false);
      return;
    }

    const gif = new GifConstructor({
      workers: 2,
      quality: 10,
      width: canvas.width,
      height: canvas.height,
      workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js',
    });

    const frameCount = Math.floor(duration * fps);
    const delay = 1000 / fps;

    for (let i = 0; i < frameCount; i++) {
      gif.addFrame(canvas, { delay, copy: true });
      await new Promise((r) => setTimeout(r, delay));
    }

    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pixel-loop.gif';
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
      setExportStatus('GIF exported!');
    });

    gif.render();
  }, [canvasRef]);

  const exportWebM = useCallback((duration: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    setExportStatus('Recording WebM...');
    exportAsWebM(canvas, duration);
    setTimeout(() => {
      setIsExporting(false);
      setExportStatus('WebM exported!');
    }, (duration + 1) * 1000);
  }, [canvasRef]);

  const exportPNGSequence = useCallback(async (videoRef: React.MutableRefObject<HTMLVideoElement | null>, fps: number = 12) => {
    const canvas = canvasRef.current;
    if (!canvas || !videoRef.current) return;
    setIsExporting(true);
    setExportStatus('Capturing frames...');

    const ctx = canvas.getContext('2d')!;
    const frames: ImageData[] = [];
    const frameCount = Math.floor((videoRef.current.duration || 3) * fps);

    for (let i = 0; i < frameCount; i++) {
      await new Promise((r) => setTimeout(r, 1000 / fps));
      frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }

    await exportAsPngSequence(frames, canvas.width, canvas.height);
    setIsExporting(false);
    setExportStatus('PNG sequence exported!');
  }, [canvasRef]);

  return { exportGIF, exportWebM, exportPNGSequence, isExporting, exportStatus };
}
