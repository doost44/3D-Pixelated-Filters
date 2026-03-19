'use client';
import { useRef, useCallback } from 'react';

interface TimelineProps {
  currentTime: number;
  duration: number;
  loopIn: number;
  loopOut: number;
  onSeek: (t: number) => void;
  onSetLoopIn: (t: number) => void;
  onSetLoopOut: (t: number) => void;
}

function fmt(t: number): string {
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(2);
  return `${m}:${s.padStart(5, '0')}`;
}

export default function Timeline({
  currentTime, duration, loopIn, loopOut, onSeek, onSetLoopIn, onSetLoopOut,
}: TimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const getTime = useCallback((e: React.MouseEvent) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || duration === 0) return 0;
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return pct * duration;
  }, [duration]);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    onSeek(getTime(e));
  }, [getTime, onSeek]);

  const progress = duration > 0 ? currentTime / duration : 0;
  const inPct = duration > 0 ? (loopIn / duration) * 100 : 0;
  const outPct = duration > 0 ? (loopOut / duration) * 100 : 100;

  return (
    <div
      className="absolute bottom-4 left-1/2 z-20 panel-bg rounded p-3"
      style={{
        transform: 'translateX(-50%)',
        width: 'min(600px, calc(100vw - 320px))',
        border: '1px solid #00ff8844',
        boxShadow: '0 0 20px #00ff8811',
      }}
    >
      <div className="flex justify-between text-xs mb-2" style={{ color: '#666' }}>
        <span style={{ color: '#00ff88' }}>{fmt(currentTime)}</span>
        <span className="tracking-widest text-xs" style={{ color: '#00ff8866' }}>◈ TIMELINE</span>
        <span>{fmt(duration)}</span>
      </div>

      <div
        ref={trackRef}
        className="relative h-8 cursor-pointer rounded"
        style={{ background: '#111', border: '1px solid #00ff8822' }}
        onClick={handleTrackClick}
      >
        <div
          className="absolute top-0 h-full opacity-20 rounded"
          style={{
            left: `${inPct}%`,
            width: `${outPct - inPct}%`,
            background: '#00ff88',
          }}
        />
        <div
          className="absolute top-0 h-full opacity-60 rounded"
          style={{
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, #00ff88, #00ffcc)',
          }}
        />
        <div
          className="absolute top-0 w-0.5 h-full"
          style={{ left: `${progress * 100}%`, background: '#fff', boxShadow: '0 0 4px #fff' }}
        />
        <div
          className="absolute top-0 h-full w-1 cursor-ew-resize"
          style={{ left: `${inPct}%`, background: '#00ff88', boxShadow: '0 0 6px #00ff88' }}
          onMouseDown={(e) => {
            e.stopPropagation();
            const move = (me: MouseEvent) => {
              const rect = trackRef.current?.getBoundingClientRect();
              if (!rect) return;
              const pct = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
              onSetLoopIn(pct * duration);
            };
            const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', up);
          }}
          title="Loop In"
        />
        <div
          className="absolute top-0 h-full w-1 cursor-ew-resize"
          style={{ left: `${outPct}%`, background: '#ff0066', boxShadow: '0 0 6px #ff0066' }}
          onMouseDown={(e) => {
            e.stopPropagation();
            const move = (me: MouseEvent) => {
              const rect = trackRef.current?.getBoundingClientRect();
              if (!rect) return;
              const pct = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
              onSetLoopOut(pct * duration);
            };
            const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', up);
          }}
          title="Loop Out"
        />
      </div>

      <div className="flex justify-between text-xs mt-1" style={{ color: '#444' }}>
        <span style={{ color: '#00ff8888' }}>▶ IN: {fmt(loopIn)}</span>
        <span style={{ color: '#ff006688' }}>OUT: {fmt(loopOut)} ◀</span>
      </div>
    </div>
  );
}
