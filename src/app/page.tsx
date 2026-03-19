'use client';
import { useState, useCallback } from 'react';
import UploadButton from './components/UploadButton';
import CanvasPreview from './components/CanvasPreview';
import ControlPanel from './components/ControlPanel';
import Timeline from './components/Timeline';
import ExportPanel from './components/ExportPanel';
import { useVideoPlayer } from './components/hooks/useVideoPlayer';
import { usePixelRenderer } from './components/hooks/usePixelRenderer';
import { useExport } from './components/hooks/useExport';
import { DEFAULT_SETTINGS } from './lib/stylePresets';
import type { StyleSettings } from './lib/stylePresets';

export default function Home() {
  const [settings, setSettings] = useState<StyleSettings>(DEFAULT_SETTINGS);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const { videoRef, state, loadVideo, togglePlay, seekTo, setLoopIn, setLoopOut } = useVideoPlayer();

  const canvasRef = usePixelRenderer(videoRef, settings, state.isPlaying, settings.loopBlend);

  const { exportGIF, exportWebM, exportPNGSequence, isExporting, exportStatus } = useExport(canvasRef);

  const handleUpload = useCallback((src: string) => {
    loadVideo(src);
    setVideoLoaded(true);
  }, [loadVideo]);

  const handleSettingsChange = useCallback((partial: Partial<StyleSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleRandomize = useCallback(() => {
    setSettings((prev) => ({
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
      palette: ['RGB', 'Techno', 'GameBoy', 'Neon', 'Vaporwave', 'Monochrome'][Math.floor(Math.random() * 6)],
      effect: ['Pixel', 'Dither', 'CRT', 'Posterize', 'Mosaic', 'Glitch'][Math.floor(Math.random() * 6)],
    }));
  }, []);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <main
      className="w-screen h-screen overflow-hidden relative flex flex-col"
      style={{ background: '#000', fontFamily: 'monospace' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div
        className="relative z-10 px-4 py-2 flex items-center justify-between"
        style={{ borderBottom: '1px solid #00ff8822' }}
      >
        <div className="text-xs tracking-widest" style={{ color: '#00ff8844' }}>
          PIXEL LOOP STUDIO v0.1
        </div>
        <div className="text-xs" style={{ color: '#00ff8833' }}>
          {videoLoaded ? `◉ ${state.currentTime.toFixed(2)}s / ${state.duration.toFixed(2)}s` : '◌ NO INPUT'}
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <CanvasPreview canvasRef={canvasRef} videoLoaded={videoLoaded} />
      </div>

      <UploadButton onUpload={handleUpload} />

      <ControlPanel
        settings={settings}
        onChange={handleSettingsChange}
        onRandomize={handleRandomize}
        onReset={handleReset}
        isPlaying={state.isPlaying}
        onTogglePlay={togglePlay}
        videoLoaded={videoLoaded}
      />

      <Timeline
        currentTime={state.currentTime}
        duration={state.duration}
        loopIn={state.loopIn}
        loopOut={state.loopOut}
        onSeek={seekTo}
        onSetLoopIn={setLoopIn}
        onSetLoopOut={setLoopOut}
      />

      <ExportPanel
        onExportGIF={() => exportGIF(state.loopOut - state.loopIn)}
        onExportWebM={() => exportWebM(state.loopOut - state.loopIn)}
        onExportPNG={() => exportPNGSequence(videoRef)}
        isExporting={isExporting}
        exportStatus={exportStatus}
        videoLoaded={videoLoaded}
      />
    </main>
  );
}
