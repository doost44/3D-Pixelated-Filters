interface GIFOptions {
  workers?: number;
  quality?: number;
  width?: number;
  height?: number;
  workerScript?: string;
  repeat?: number;
  background?: string;
  transparent?: string | null;
}

interface GIFFrameOptions {
  delay?: number;
  copy?: boolean;
  dispose?: number;
}

interface GIFInstance {
  addFrame(element: HTMLCanvasElement | CanvasRenderingContext2D | ImageData, options?: GIFFrameOptions): void;
  on(event: 'finished', callback: (blob: Blob) => void): void;
  on(event: 'progress', callback: (progress: number) => void): void;
  on(event: string, callback: (...args: unknown[]) => void): void;
  render(): void;
  abort(): void;
}

declare class GIF {
  constructor(options: GIFOptions);
  addFrame(element: HTMLCanvasElement | CanvasRenderingContext2D | ImageData, options?: GIFFrameOptions): void;
  on(event: 'finished', callback: (blob: Blob) => void): void;
  on(event: 'progress', callback: (progress: number) => void): void;
  on(event: string, callback: (...args: unknown[]) => void): void;
  render(): void;
  abort(): void;
}

interface Window {
  GIF: typeof GIF;
}
