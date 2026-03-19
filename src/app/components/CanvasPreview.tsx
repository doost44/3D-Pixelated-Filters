"use client";
import { useEffect } from "react";

interface CanvasPreviewProps {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  videoLoaded: boolean;
}

export default function CanvasPreview({
  canvasRef,
  videoLoaded,
}: CanvasPreviewProps) {
  useEffect(() => {
    // Canvas is managed by usePixelRenderer hook
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center relative">
      {!videoLoaded && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ color: "#00ff8844", fontFamily: "monospace" }}
        >
          <div className="text-6xl mb-4">◈</div>
          <div className="text-xl tracking-widest">PIXEL LOOP STUDIO</div>
          <div className="text-sm mt-2 opacity-60">
            Upload a video or image to begin
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.03) 2px, rgba(0,255,136,0.03) 4px)",
            }}
          />
        </div>
      )}
      <canvas
        ref={(el) => {
          if (el) canvasRef.current = el;
        }}
        width={600}
        height={600}
        style={{
          imageRendering: "pixelated",
          border: "1px solid #00ff8833",
          boxShadow: "0 0 30px #00ff8822",
          maxWidth: "100%",
          maxHeight: "calc(100vh - 200px)",
        }}
      />
    </div>
  );
}
