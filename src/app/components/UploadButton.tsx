'use client';
import { useRef } from 'react';

interface UploadButtonProps {
  onUpload: (src: string, file: File) => void;
}

export default function UploadButton({ onUpload }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpload(url, file);
  };

  return (
    <div className="absolute top-4 left-4 z-20">
      <button
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 neon-border neon-text font-mono text-sm hover:bg-green-900/30 transition-colors"
        style={{ border: '1px solid #00ff88', color: '#00ff88', boxShadow: '0 0 8px #00ff8844' }}
      >
        ▲ UPLOAD VIDEO
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/mov,video/webm,video/quicktime,image/gif"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
