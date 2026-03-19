"use client";
import { useState, useCallback } from "react";
import UploadButton from "./components/UploadButton";
import CanvasPreview from "./components/CanvasPreview";
import ControlPanel from "./components/ControlPanel";
import Timeline from "./components/Timeline";
import ExportPanel from "./components/ExportPanel";
import CanvasSizePanel from "./components/CanvasSizePanel";
import type { CanvasSize } from "./components/CanvasSizePanel";
import { useVideoPlayer } from "./components/hooks/useVideoPlayer";
import { usePixelRenderer } from "./components/hooks/usePixelRenderer";
import { useExport } from "./components/hooks/useExport";
import {
  DEFAULT_SETTINGS,
  PALETTE_NAMES,
  EFFECT_NAMES,
} from "./lib/stylePresets";
import type { StyleSettings } from "./lib/stylePresets";

export default function Home() {
  const [settings, setSettings] = useState<StyleSettings>(DEFAULT_SETTINGS);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 600, height: 600 });

  const {
    videoRef,
    sourceRef,
    state,
    loadVideo,
    togglePlay,
    seekTo,
    setLoopIn,
    setLoopOut,
  } = useVideoPlayer();

  const canvasRef = usePixelRenderer(sourceRef, settings);

  const {
    exportGIF,
    exportWebM,
    exportPNGSequence,
    exportPNGStill,
    isExporting,
    exportStatus,
  } = useExport(canvasRef);

  const handleUpload = useCallback(
    (src: string, type: string) => {
      loadVideo(src, type);
      setMediaLoaded(true);
    },
    [loadVideo],
  );

  const handleSettingsChange = useCallback(
    (partial: Partial<StyleSettings>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
    },
    [],
  );

  const handleRandomize = useCallback(() => {
    setSettings((prev) => {
      const newEffect = EFFECT_NAMES[Math.floor(Math.random() * EFFECT_NAMES.length)];
      const is3DBlock = newEffect === '3D Block';

      if (is3DBlock) {
        return {
          ...prev,
          effect: newEffect,
          blockExtrusionDepth: Math.floor(Math.random() * 30) + 10,
          blockExtrusionAngle: Math.floor(Math.random() * 360),
          blockPerspective: Math.floor(Math.random() * 40) + 5,
          blockCrackAmount: Math.floor(Math.random() * 100),
          blockShadowStrength: Math.floor(Math.random() * 80) + 20,
          blockLightAngle: Math.floor(Math.random() * 360),
          blockHighlightAmount: Math.floor(Math.random() * 80) + 10,
          blockTextureScale: Math.floor(Math.random() * 100) + 50,
          blockOutlineThickness: Math.floor(Math.random() * 8) + 1,
        };
      } else {
        return {
          ...prev,
          pixelSize: Math.floor(Math.random() * 16) + 1,
          blur: Math.floor(Math.random() * 5),
          contrast: Math.floor(Math.random() * 100) + 80,
          brightness: Math.floor(Math.random() * 80) + 80,
          saturation: Math.floor(Math.random() * 150) + 50,
          ditheringAmount: Math.floor(Math.random() * 80),
          frameSkip: Math.floor(Math.random() * 4),
          rotationSpeed: Math.floor(Math.random() * 5),
          depthScale: Math.floor(Math.random() * 100) + 80,
          scanlines: Math.random() > 0.5,
          edgeGlow: Math.random() > 0.5,
          palette: PALETTE_NAMES[Math.floor(Math.random() * PALETTE_NAMES.length)],
          effect: newEffect,
        };
      }
    });
  }, []);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <main
      className="w-screen h-screen overflow-hidden relative flex flex-col"
      style={{ background: "#000", fontFamily: "monospace" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div
        className="relative z-10 px-4 py-2 flex items-center justify-between"
        style={{ borderBottom: "1px solid #00ff8822" }}
      >
        <div className="text-xs tracking-widest" style={{ color: "#00ff8844" }}>
          PIXEL LOOP STUDIO v0.1
        </div>
        <div className="text-xs" style={{ color: "#00ff8833" }}>
          {mediaLoaded
            ? state.mediaType === "video"
              ? `◉ ${state.currentTime.toFixed(2)}s / ${state.duration.toFixed(2)}s`
              : "◉ IMAGE LOADED"
            : "◌ NO INPUT"}
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <CanvasPreview
          canvasRef={canvasRef}
          videoLoaded={mediaLoaded}
          canvasWidth={canvasSize.width}
          canvasHeight={canvasSize.height}
        />
      </div>

      <UploadButton onUpload={handleUpload} />

      <ControlPanel
        settings={settings}
        onChange={handleSettingsChange}
        onRandomize={handleRandomize}
        onReset={handleReset}
        isPlaying={state.isPlaying}
        onTogglePlay={togglePlay}
        videoLoaded={mediaLoaded && state.mediaType === "video"}
      />

      {state.mediaType === "video" && (
        <Timeline
          currentTime={state.currentTime}
          duration={state.duration}
          loopIn={state.loopIn}
          loopOut={state.loopOut}
          onSeek={seekTo}
          onSetLoopIn={setLoopIn}
          onSetLoopOut={setLoopOut}
        />
      )}

      <div className="absolute bottom-24 right-4 z-20 flex flex-col gap-2">
        <CanvasSizePanel size={canvasSize} onChange={setCanvasSize} />

        <ExportPanel
          onExportGIF={() =>
            state.mediaType === "video" &&
            exportGIF(videoRef, state.loopIn, state.loopOut)
          }
          onExportWebM={() =>
            state.mediaType === "video" &&
            exportWebM(state.loopOut - state.loopIn)
          }
          onExportPNG={() => {
            if (state.mediaType === "video") {
              exportPNGSequence(videoRef, state.loopIn, state.loopOut);
              return;
            }
            if (state.mediaType === "image") {
              exportPNGStill();
            }
          }}
          isExporting={isExporting}
          exportStatus={exportStatus}
          mediaLoaded={mediaLoaded}
          mediaType={state.mediaType}
        />
      </div>
    </main>
  );
}
