'use client';
import type { StyleSettings, PresetName } from '../lib/stylePresets';
import { STYLE_PRESETS, PALETTE_NAMES, EFFECT_NAMES } from '../lib/stylePresets';

interface ControlPanelProps {
  settings: StyleSettings;
  onChange: (s: Partial<StyleSettings>) => void;
  onRandomize: () => void;
  onReset: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  videoLoaded: boolean;
}

const PRESETS: PresetName[] = ['8-bit', '16-bit', '32-bit', '64-bit'];

function Slider({ label, value, min, max, step = 1, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1" style={{ color: '#888' }}>
        <span>{label}</span>
        <span style={{ color: '#00ff88' }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer mb-1">
      <div
        onClick={() => onChange(!value)}
        className="w-8 h-4 rounded-full relative transition-colors cursor-pointer"
        style={{ background: value ? '#00ff88' : '#333', border: '1px solid #00ff8866' }}
      >
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full transition-transform"
          style={{ background: value ? '#000' : '#666', transform: `translateX(${value ? '16px' : '2px'})` }}
        />
      </div>
      <span className="text-xs" style={{ color: value ? '#00ff88' : '#666' }}>{label}</span>
    </label>
  );
}

export default function ControlPanel({
  settings, onChange, onRandomize, onReset, isPlaying, onTogglePlay, videoLoaded,
}: ControlPanelProps) {
  const applyPreset = (preset: PresetName) => {
    onChange(STYLE_PRESETS[preset]);
  };

  return (
    <div
      className="absolute bottom-24 left-4 z-20 w-72 panel-bg rounded p-3 overflow-y-auto"
      style={{
        border: '1px solid #00ff8866',
        boxShadow: '0 0 20px #00ff8822',
        maxHeight: 'calc(100vh - 200px)',
      }}
    >
      <div className="text-xs font-bold mb-3 tracking-widest" style={{ color: '#00ff88' }}>
        ◈ CONTROL PANEL
      </div>

      <div className="mb-3">
        <div className="text-xs mb-1" style={{ color: '#666' }}>PRESET</div>
        <div className="flex gap-1">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => applyPreset(p)}
              className="flex-1 py-1 text-xs transition-colors"
              style={{
                border: '1px solid #00ff8844',
                color: '#00ff88',
                background: 'transparent',
                fontSize: '10px',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-2">
        <div className="text-xs mb-1" style={{ color: '#666' }}>PALETTE</div>
        <select
          value={settings.palette}
          onChange={(e) => onChange({ palette: e.target.value })}
          className="w-full text-xs p-1"
          style={{ background: '#111', color: '#00ff88', border: '1px solid #00ff8844' }}
        >
          {PALETTE_NAMES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <div className="text-xs mb-1" style={{ color: '#666' }}>EFFECT</div>
        <select
          value={settings.effect}
          onChange={(e) => onChange({ effect: e.target.value })}
          className="w-full text-xs p-1"
          style={{ background: '#111', color: '#00ff88', border: '1px solid #00ff8844' }}
        >
          {EFFECT_NAMES.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <Slider label="Pixel Size" value={settings.pixelSize} min={1} max={32} onChange={(v) => onChange({ pixelSize: v })} />
      <Slider label="Blur" value={settings.blur} min={0} max={10} onChange={(v) => onChange({ blur: v })} />
      <Slider label="Contrast" value={settings.contrast} min={0} max={200} unit="%" onChange={(v) => onChange({ contrast: v })} />
      <Slider label="Brightness" value={settings.brightness} min={0} max={200} unit="%" onChange={(v) => onChange({ brightness: v })} />
      <Slider label="Saturation" value={settings.saturation} min={0} max={200} unit="%" onChange={(v) => onChange({ saturation: v })} />
      <Slider label="Dithering" value={settings.ditheringAmount} min={0} max={100} unit="%" onChange={(v) => onChange({ ditheringAmount: v })} />
      <Slider label="Frame Skip" value={settings.frameSkip} min={0} max={10} onChange={(v) => onChange({ frameSkip: v })} />
      <Slider label="Rotation Spd" value={settings.rotationSpeed} min={0} max={10} onChange={(v) => onChange({ rotationSpeed: v })} />
      <Slider label="Depth Scale" value={settings.depthScale} min={0} max={200} unit="%" onChange={(v) => onChange({ depthScale: v })} />

      <div className="mt-3 mb-3 border-t pt-2" style={{ borderColor: '#00ff8822' }}>
        <Toggle label="Scanlines" value={settings.scanlines} onChange={(v) => onChange({ scanlines: v })} />
        <Toggle label="Edge Glow" value={settings.edgeGlow} onChange={(v) => onChange({ edgeGlow: v })} />
        <Toggle label="Transparent BG" value={settings.transparentBg} onChange={(v) => onChange({ transparentBg: v })} />
        <Toggle label="Loop Blend" value={settings.loopBlend} onChange={(v) => onChange({ loopBlend: v })} />
      </div>

      <div className="flex gap-1 flex-wrap">
        <button
          onClick={onTogglePlay}
          disabled={!videoLoaded}
          className="flex-1 py-1 text-xs transition-colors"
          style={{
            border: '1px solid #00ff88',
            color: '#000',
            background: videoLoaded ? '#00ff88' : '#333',
            cursor: videoLoaded ? 'pointer' : 'not-allowed',
          }}
        >
          {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
        </button>
        <button
          onClick={onRandomize}
          className="flex-1 py-1 text-xs"
          style={{ border: '1px solid #00ffcc44', color: '#00ffcc', background: 'transparent' }}
        >
          ⚡ RND
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-1 text-xs"
          style={{ border: '1px solid #ff00ff44', color: '#ff00ff', background: 'transparent' }}
        >
          ↺ RST
        </button>
      </div>
    </div>
  );
}
