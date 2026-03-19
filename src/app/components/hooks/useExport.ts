"use client";
import { useCallback, useState } from "react";
import { exportAsPngSequence, exportAsWebM } from "../../lib/exportUtils";

/** Wait for the video's next 'seeked' event after setting currentTime. */
function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise<void>((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = time;
  });
}

/** Wait two animation frames so the canvas render loop repaints after a seek. */
function waitFrames(): Promise<void> {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function useExport(
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");

  const exportPNGStill = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    setExportStatus("Exporting PNG…");

    canvas.toBlob((blob) => {
      if (!blob) {
        setIsExporting(false);
        setExportStatus("PNG export failed");
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pixel-frame.png";
      a.click();
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setExportStatus("PNG exported!");
    }, "image/png");
  }, [canvasRef]);

  const exportGIF = useCallback(
    async (
      videoRef: React.MutableRefObject<HTMLVideoElement | null>,
      loopIn: number,
      loopOut: number,
      fps: number = 12,
    ) => {
      if (typeof window === "undefined") return;
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const GifConstructor = window.GIF;
      if (!GifConstructor) {
        setExportStatus("gif.js not loaded");
        return;
      }

      setIsExporting(true);
      setExportStatus("Exporting GIF…");

      const duration = Math.max(0.1, loopOut - loopIn);
      const frameCount = Math.max(1, Math.floor(duration * fps));
      const delay = Math.round(1000 / fps);

      const wasPlaying = !video.paused;
      video.pause();

      const gif = new GifConstructor({
        workers: 2,
        quality: 10,
        width: canvas.width,
        height: canvas.height,
        workerScript:
          "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js",
      });

      for (let i = 0; i < frameCount; i++) {
        const t = loopIn + (i / frameCount) * duration;
        await seekVideo(video, t);
        await waitFrames();
        gif.addFrame(canvas, { delay, copy: true });
      }

      if (wasPlaying) video.play();

      gif.on("finished", (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "pixel-loop.gif";
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setExportStatus("GIF exported!");
      });

      gif.render();
    },
    [canvasRef],
  );

  const exportWebM = useCallback(
    (duration: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setIsExporting(true);
      setExportStatus("Recording WebM…");
      exportAsWebM(canvas, duration);
      setTimeout(
        () => {
          setIsExporting(false);
          setExportStatus("WebM exported!");
        },
        (duration + 1) * 1000,
      );
    },
    [canvasRef],
  );

  const exportPNGSequence = useCallback(
    async (
      videoRef: React.MutableRefObject<HTMLVideoElement | null>,
      loopIn: number,
      loopOut: number,
      fps: number = 12,
    ) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      setIsExporting(true);
      setExportStatus("Capturing frames…");

      const ctx = canvas.getContext("2d")!;
      const duration = Math.max(0.1, loopOut - loopIn);
      const frameCount = Math.max(1, Math.floor(duration * fps));

      const wasPlaying = !video.paused;
      video.pause();

      const frames: ImageData[] = [];
      for (let i = 0; i < frameCount; i++) {
        const t = loopIn + (i / frameCount) * duration;
        await seekVideo(video, t);
        await waitFrames();
        frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      }

      if (wasPlaying) video.play();

      await exportAsPngSequence(frames, canvas.width, canvas.height);
      setIsExporting(false);
      setExportStatus("PNG sequence exported!");
    },
    [canvasRef],
  );

  return {
    exportGIF,
    exportWebM,
    exportPNGSequence,
    exportPNGStill,
    isExporting,
    exportStatus,
  };
}
