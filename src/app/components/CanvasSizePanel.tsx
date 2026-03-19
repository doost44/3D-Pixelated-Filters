'use client';
import { useState, useCallback } from 'react';

export interface CanvasSize {
  width: number;
  height: number;
}

interface CanvasSizePanelProps {
  size: CanvasSize;
  onChange: (size: CanvasSize) => void;
}

const PRESETS: { label: string; width: number; height: number }[] = [
  { label: '512²', width: 512, height: 512 },
  { label: '600²', width: 600, height: 600 },
  { label: '720p', width: 1280, height: 720 },
  { label: '480p', width: 854, height: 480 },
  { label: '1:1', width: 480, height: 480 },
  { label: '4:3', width: 640, height: 480 },
];

export default function CanvasSizePanel({ size, onChange }: CanvasSizePanelProps) {
  const [locked, setLocked] = useState(false);
  const lockedRatio = size.height > 0 ? size.width / size.height : 1;

  const handleWidth = useCallback(
    (raw: string) => {
      const w = Math.max(16, Math.min(4096, Number(raw) || size.width));
      if (locked) {
        onChange({ width: w, height: Math.round(w / lockedRatio) });
      } else {
        onChange({ width: w, height: size.height });
      }
    },
    [locked, lockedRatio, size, onChange],
  );

  const handleHeight = useCallback(
    (raw: string) => {
      const h = Math.max(16, Math.min(4096, Number(raw) || size.height));
      if (locked) {
        onChange({ width: Math.round(h * lockedRatio), height: h });
      } else {
        onChange({ width: size.width, height: h });
      }
    },
    [locked, lockedRatio, size, onChange],
  );

  return (
    <div
      className="w-56 panel-bg rounded p-3"
      style={{
        border: '1px solid #00ffcc66',
        boxShadow: '0 0 20px #00ffcc22',
      }}
    >
      <div className="text-xs font-bold mb-3 tracking-widest" style={{ color: '#00ffcc' }}>
        ◈ CANVAS SIZE
      </div>

      {/* Width / Height inputs */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1">
          <div className="text-xs mb-1" style={{ color: '#666' }}>W</div>
          <input
            type="number"
            value={size.width}
            min={16}
            max={4096}
            onChange={(e) => handleWidth(e.target.value)}
            className="w-full text-xs p-1 text-center"
            style={{ background: '#111', color: '#00ffcc', border: '1px solid #00ffcc44' }}
          />
        </div>

        {/* Aspect ratio lock */}
        <button
          onClick={() => setLocked((v) => !v)}
          title={locked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
          className="mt-4 text-xs px-1 py-1 transition-colors"
          style={{
            border: `1px solid ${locked ? '#00ffcc' : '#00ffcc33'}`,
            color: locked ? '#00ffcc' : '#444',
            background: 'transparent',
            lineHeight: 1,
          }}
        >
          {locked ? '🔒' : '🔓'}
        </button>

        <div className="flex-1">
          <div className="text-xs mb-1" style={{ color: '#666' }}>H</div>
          <input
            type="number"
            value={size.height}
            min={16}
            max={4096}
            onChange={(e) => handleHeight(e.target.value)}
            className="w-full text-xs p-1 text-center"
            style={{ background: '#111', color: '#00ffcc', border: '1px solid #00ffcc44' }}
          />
        </div>
      </div>

      {/* Preset buttons */}
      <div className="text-xs mb-1" style={{ color: '#666' }}>PRESETS</div>
      <div className="grid grid-cols-3 gap-1">
        {PRESETS.map((p) => {
          const active = size.width === p.width && size.height === p.height;
          return (
            <button
              key={p.label}
              onClick={() => onChange({ width: p.width, height: p.height })}
              className="py-1 text-xs transition-colors"
              style={{
                border: `1px solid ${active ? '#00ffcc' : '#00ffcc33'}`,
                color: active ? '#000' : '#00ffcc',
                background: active ? '#00ffcc' : 'transparent',
                fontSize: '10px',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Current size indicator */}
      <div className="mt-2 text-xs text-center" style={{ color: '#00ffcc66' }}>
        {size.width} × {size.height} px
      </div>
    </div>
  );
}
