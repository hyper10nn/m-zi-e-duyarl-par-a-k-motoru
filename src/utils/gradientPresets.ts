import { GradientStop } from '../types';

export interface GradientPreset {
  id: string;
  name: string;
  category: 'rma' | 'cyber' | 'nature' | 'warm' | 'cool' | 'rainbow';
  stops: GradientStop[];
}

export const DEFAULT_RMA_GRADIENT: GradientStop[] = [
  { id: 'stop-1', offset: 0.0, color: '#00f0ff' },    // RMA Neon Cyan
  { id: 'stop-2', offset: 0.5, color: '#0055ff' },    // RMA Electric Royal Blue
  { id: 'stop-3', offset: 1.0, color: '#ffb300' },    // RMA Sovereign Gold
];

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'rma-official',
    name: 'RMA Resmi (Cyan & Altın)',
    category: 'rma',
    stops: [
      { id: '1', offset: 0.0, color: '#00f0ff' },
      { id: '2', offset: 0.48, color: '#0066ff' },
      { id: '3', offset: 1.0, color: '#ffb300' },
    ],
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk 2077',
    category: 'cyber',
    stops: [
      { id: '1', offset: 0.0, color: '#00ffff' },
      { id: '2', offset: 0.52, color: '#ff007f' },
      { id: '3', offset: 1.0, color: '#ffe600' },
    ],
  },
  {
    id: 'synthwave-sunset',
    name: 'Synthwave 80s Sunset',
    category: 'cyber',
    stops: [
      { id: '1', offset: 0.0, color: '#ff0077' },
      { id: '2', offset: 0.35, color: '#7928ca' },
      { id: '3', offset: 0.72, color: '#00f0ff' },
      { id: '4', offset: 1.0, color: '#ffaa00' },
    ],
  },
  {
    id: 'cosmic-aurora',
    name: 'Kozmik Aurora Borealis',
    category: 'nature',
    stops: [
      { id: '1', offset: 0.0, color: '#00ff88' },
      { id: '2', offset: 0.45, color: '#00d4ff' },
      { id: '3', offset: 0.78, color: '#7928ca' },
      { id: '4', offset: 1.0, color: '#ff0080' },
    ],
  },
  {
    id: 'hyper-violet',
    name: 'Ultra Violet & Magenta',
    category: 'cool',
    stops: [
      { id: '1', offset: 0.0, color: '#4facfe' },
      { id: '2', offset: 0.4, color: '#9333ea' },
      { id: '3', offset: 0.75, color: '#ec4899' },
      { id: '4', offset: 1.0, color: '#f43f5e' },
    ],
  },
  {
    id: 'fire-magma',
    name: 'Magma & Lav Alevi',
    category: 'warm',
    stops: [
      { id: '1', offset: 0.0, color: '#fff000' },
      { id: '2', offset: 0.35, color: '#ff5e00' },
      { id: '3', offset: 0.75, color: '#ff0044' },
      { id: '4', offset: 1.0, color: '#7a001e' },
    ],
  },
  {
    id: 'ice-crystal',
    name: 'Buz Kristali & Kutup',
    category: 'cool',
    stops: [
      { id: '1', offset: 0.0, color: '#e0f7fa' },
      { id: '2', offset: 0.38, color: '#80deea' },
      { id: '3', offset: 0.72, color: '#26c6da' },
      { id: '4', offset: 1.0, color: '#0284c7' },
    ],
  },
  {
    id: 'gold-luxury',
    name: 'Altın İmparatorluk',
    category: 'warm',
    stops: [
      { id: '1', offset: 0.0, color: '#fffbeb' },
      { id: '2', offset: 0.32, color: '#fde047' },
      { id: '3', offset: 0.68, color: '#f59e0b' },
      { id: '4', offset: 1.0, color: '#b45309' },
    ],
  },
  {
    id: 'toxic-emerald',
    name: 'Toksik Zümrüt & Matrix',
    category: 'nature',
    stops: [
      { id: '1', offset: 0.0, color: '#00ff87' },
      { id: '2', offset: 0.5, color: '#60efff' },
      { id: '3', offset: 1.0, color: '#0061ff' },
    ],
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Neon Gecesi',
    category: 'cyber',
    stops: [
      { id: '1', offset: 0.0, color: '#ff0055' },
      { id: '2', offset: 0.45, color: '#6a0dad' },
      { id: '3', offset: 0.8, color: '#00e5ff' },
      { id: '4', offset: 1.0, color: '#ffe600' },
    ],
  },
  {
    id: 'prism-rainbow',
    name: 'Prizma Spektrum Gökkuşağı',
    category: 'rainbow',
    stops: [
      { id: '1', offset: 0.0, color: '#ff0000' },
      { id: '2', offset: 0.2, color: '#ffaa00' },
      { id: '3', offset: 0.4, color: '#00ff66' },
      { id: '4', offset: 0.6, color: '#00f0ff' },
      { id: '5', offset: 0.8, color: '#3b82f6' },
      { id: '6', offset: 1.0, color: '#d946ef' },
    ],
  },
  {
    id: 'deep-ocean-abyss',
    name: 'Derin Okyanus Uçurumu',
    category: 'cool',
    stops: [
      { id: '1', offset: 0.0, color: '#00ffff' },
      { id: '2', offset: 0.4, color: '#0077b6' },
      { id: '3', offset: 0.75, color: '#03045e' },
      { id: '4', offset: 1.0, color: '#001233' },
    ],
  },
];

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return { r: 0, g: 240, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function generateCssGradient(stops: GradientStop[], direction: string = 'to right'): string {
  if (!stops || stops.length === 0) {
    return 'linear-gradient(to right, #00f0ff, #ffb300)';
  }
  const sorted = [...stops].sort((a, b) => a.offset - b.offset);
  const stopStr = sorted.map((s) => `${s.color} ${(s.offset * 100).toFixed(1)}%`).join(', ');
  return `linear-gradient(${direction}, ${stopStr})`;
}

export function evaluateGradient(t: number, stops: GradientStop[]): RGB {
  if (!stops || stops.length === 0) {
    return { r: 0, g: 240, b: 255 };
  }
  if (stops.length === 1) {
    return hexToRgb(stops[0].color);
  }

  // Normalize t in range 0..1 (repeating cyclic)
  let normT = t % 1;
  if (normT < 0) normT += 1;

  const sorted = [...stops].sort((a, b) => a.offset - b.offset);

  if (normT <= sorted[0].offset) {
    return hexToRgb(sorted[0].color);
  }
  if (normT >= sorted[sorted.length - 1].offset) {
    return hexToRgb(sorted[sorted.length - 1].color);
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const s1 = sorted[i];
    const s2 = sorted[i + 1];
    if (normT >= s1.offset && normT <= s2.offset) {
      const range = s2.offset - s1.offset;
      const factor = range > 0.00001 ? (normT - s1.offset) / range : 0;
      const c1 = hexToRgb(s1.color);
      const c2 = hexToRgb(s2.color);
      return {
        r: Math.round(c1.r + (c2.r - c1.r) * factor),
        g: Math.round(c1.g + (c2.g - c1.g) * factor),
        b: Math.round(c1.b + (c2.b - c1.b) * factor),
      };
    }
  }

  return hexToRgb(sorted[0].color);
}

export const VIBRANT_COLOR_SWATCHES = [
  '#00f0ff', // Cyan
  '#ffb300', // Gold
  '#ff0077', // Hot Pink
  '#a855f7', // Electric Violet
  '#00ff66', // Neon Green
  '#3b82f6', // Sapphire Blue
  '#ff3b30', // Electric Red
  '#ff8800', // Sunset Orange
  '#ffffff', // Pure Diamond White
  '#10b981', // Emerald
  '#e11d48', // Crimson
  '#06b6d4', // Sky Blue
];
