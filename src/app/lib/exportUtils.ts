export interface ExportOptions {
  format: 'gif' | 'webm' | 'png-sequence';
  fps: number;
  quality: number;
}

export async function exportAsPngSequence(
  frames: ImageData[],
  width: number,
  height: number
): Promise<void> {
  if (typeof window === 'undefined') return;
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  for (let i = 0; i < frames.length; i++) {
    ctx.putImageData(frames[i], 0, 0);
    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
    const arrayBuffer = await blob.arrayBuffer();
    zip.file(`frame_${String(i).padStart(4, '0')}.png`, arrayBuffer);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pixel-loop-frames.zip';
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsWebM(
  canvas: HTMLCanvasElement,
  duration: number,
  fps: number = 24
): void {
  if (typeof window === 'undefined' || !('MediaRecorder' in window)) return;
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pixel-loop.webm';
    a.click();
    URL.revokeObjectURL(url);
  };
  recorder.start();
  setTimeout(() => recorder.stop(), duration * 1000);
}
