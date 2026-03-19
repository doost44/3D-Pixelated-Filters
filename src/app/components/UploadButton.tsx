"use client";
import { useRef } from "react";

interface UploadButtonProps {
  onUpload: (src: string, type: string) => void;
}

export default function UploadButton({ onUpload }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpload(url, file.type);
  };

  return (
    <div className="absolute top-4 left-4 z-20">
      <button
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 neon-border neon-text font-mono text-sm hover:bg-green-900/30 transition-colors"
        style={{
          border: "1px solid #00ff88",
          color: "#00ff88",
          boxShadow: "0 0 8px #00ff8844",
        }}
      >
        ▲ UPLOAD MEDIA
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="video/*,image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
