'use client';

interface ExportPanelProps {
  onExportGIF: () => void;
  onExportWebM: () => void;
  onExportPNG: () => void;
  isExporting: boolean;
  exportStatus: string;
  videoLoaded: boolean;
}

export default function ExportPanel({
  onExportGIF, onExportWebM, onExportPNG, isExporting, exportStatus, videoLoaded,
}: ExportPanelProps) {
  const btnStyle = (color: string, disabled: boolean) => ({
    border: `1px solid ${disabled ? '#333' : color + '66'}`,
    color: disabled ? '#333' : color,
    background: 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '6px 10px',
    fontSize: '11px',
    fontFamily: 'monospace',
    letterSpacing: '0.05em',
    transition: 'all 0.2s',
  });

  return (
    <div
      className="absolute bottom-24 right-4 z-20 panel-bg rounded p-3"
      style={{ border: '1px solid #00ff8844', boxShadow: '0 0 20px #00ff8811', minWidth: '140px' }}
    >
      <div className="text-xs font-bold mb-3 tracking-widest" style={{ color: '#00ff88' }}>
        ◈ EXPORT
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={onExportGIF}
          disabled={!videoLoaded || isExporting}
          style={btnStyle('#ff00ff', !videoLoaded || isExporting)}
        >
          ⬇ GIF
        </button>
        <button
          onClick={onExportWebM}
          disabled={!videoLoaded || isExporting}
          style={btnStyle('#00ffcc', !videoLoaded || isExporting)}
        >
          ⬇ WEBM
        </button>
        <button
          onClick={onExportPNG}
          disabled={!videoLoaded || isExporting}
          style={btnStyle('#ffff00', !videoLoaded || isExporting)}
        >
          ⬇ PNG SEQ
        </button>
      </div>
      {exportStatus && (
        <div className="mt-2 text-xs" style={{ color: isExporting ? '#ffff00' : '#00ff88' }}>
          {isExporting ? '⏳ ' : '✓ '}{exportStatus}
        </div>
      )}
    </div>
  );
}
