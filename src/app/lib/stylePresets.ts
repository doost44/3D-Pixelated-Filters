export type PresetName = '8-bit' | '16-bit' | '32-bit' | '64-bit';

export interface StyleSettings {
  pixelSize: number;
  blur: number;
  contrast: number;
  brightness: number;
  saturation: number;
  ditheringAmount: number;
  frameSkip: number;
  rotationSpeed: number;
  depthScale: number;
  scanlines: boolean;
  edgeGlow: boolean;
  transparentBg: boolean;
  loopBlend: boolean;
  palette: string;
  effect: string;
  // 3D Block Effect settings
  blockText?: string;
  blockFont?: string;
  blockMaterial?: string;
  blockFrontColor?: string;
  blockSideColor?: string;
  blockOutlineThickness?: number;
  blockExtrusionDepth?: number;
  blockExtrusionAngle?: number;
  blockPerspective?: number;
  blockCrackAmount?: number;
  blockShadowStrength?: number;
  blockLightAngle?: number;
  blockHighlightAmount?: number;
  blockTextureScale?: number;
}

export const STYLE_PRESETS: Record<PresetName, Partial<StyleSettings>> = {
  '8-bit': {
    pixelSize: 8,
    ditheringAmount: 80,
    contrast: 150,
    saturation: 120,
    scanlines: true,
    edgeGlow: false,
  },
  '16-bit': {
    pixelSize: 4,
    ditheringAmount: 40,
    contrast: 130,
    saturation: 110,
    scanlines: false,
    edgeGlow: true,
  },
  '32-bit': {
    pixelSize: 2,
    ditheringAmount: 15,
    contrast: 115,
    saturation: 105,
    scanlines: false,
    edgeGlow: true,
  },
  '64-bit': {
    pixelSize: 1,
    ditheringAmount: 0,
    contrast: 100,
    saturation: 100,
    scanlines: false,
    edgeGlow: false,
  },
};

export const DEFAULT_SETTINGS: StyleSettings = {
  pixelSize: 4,
  blur: 0,
  contrast: 100,
  brightness: 100,
  saturation: 100,
  ditheringAmount: 0,
  frameSkip: 0,
  rotationSpeed: 0,
  depthScale: 100,
  scanlines: false,
  edgeGlow: false,
  transparentBg: false,
  loopBlend: false,
  palette: 'RGB',
  effect: 'Pixel',
  // 3D Block Effect defaults
  blockText: 'PIXEL',
  blockFont: 'Arial Black',
  blockMaterial: 'Stone',
  blockFrontColor: '#8b7355',
  blockSideColor: '#5c4a3a',
  blockOutlineThickness: 3,
  blockExtrusionDepth: 20,
  blockExtrusionAngle: 45,
  blockPerspective: 15,
  blockCrackAmount: 30,
  blockShadowStrength: 50,
  blockLightAngle: 135,
  blockHighlightAmount: 40,
  blockTextureScale: 100,
};

export const PALETTE_NAMES = ['RGB', 'Techno', 'GameBoy', 'Neon', 'Vaporwave', 'Monochrome'] as const;
export const EFFECT_NAMES = ['Pixel', 'Dither', 'CRT', 'Posterize', 'Mosaic', 'Glitch', '3D Block'] as const;
export const BLOCK_FONTS = ['Arial Black', 'Impact', 'Courier New', 'Georgia', 'Times New Roman', 'Comic Sans MS'] as const;
export const BLOCK_MATERIALS = ['Stone', 'Metal', 'Wood', 'Ice', 'Lava', 'Crystal'] as const;
