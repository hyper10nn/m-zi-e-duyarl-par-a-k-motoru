import { ImageSamplingMode } from '../types';

export interface Point2D {
  x: number;
  y: number;
  color?: { r: number; g: number; b: number };
}

export interface PresetLogo {
  id: string;
  name: string;
  iconSvgPath: string;
}

export const PRESET_LOGOS: PresetLogo[] = [
  {
    id: 'rma',
    name: 'RMA (Resmi Logo)',
    iconSvgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-4H7v4H5V8h4.5c1.38 0 2.5 1.12 2.5 2.5 0 .9-.48 1.69-1.2 2.12L11 16zm6 0h-2l-1.5-4L13 16h-2V8h2l1.5 4 1.5-4h2v8z'
  },
  {
    id: 'heart',
    name: 'Kalp (Heart)',
    iconSvgPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
  },
  {
    id: 'headphones',
    name: 'Kulaklık (DJ)',
    iconSvgPath: 'M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h1a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5v-1a7 7 0 0 1 14 0v1h-2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1c1.66 0 3-1.34 3-3v-7a9 9 0 0 0-9-9z'
  },
  {
    id: 'music-note',
    name: 'Müzik Notası',
    iconSvgPath: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'
  },
  {
    id: 'crown',
    name: 'Taç (Crown)',
    iconSvgPath: 'M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z'
  },
  {
    id: 'star',
    name: 'Yıldız (Star)',
    iconSvgPath: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
  },
  {
    id: 'flame',
    name: 'Alev (Flame)',
    iconSvgPath: 'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.61 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z'
  },
  {
    id: 'skull',
    name: 'Kafatası (Skull)',
    iconSvgPath: 'M12 2a9 9 0 0 0-9 9c0 3.32 1.8 6.22 4.47 7.74V21a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-2.26A9.002 9.002 0 0 0 21 11a9 9 0 0 0-9-9zm-3.5 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm7 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z'
  },
  {
    id: 'diamond',
    name: 'Elmas (Diamond)',
    iconSvgPath: 'M19 3H5L2 9l10 12L22 9l-3-6zM9.62 8l1.5-3h1.76l1.5 3H9.62zM11 10v6.68L4.44 10H11zm2 0h6.56L13 16.68V10zm3.88-2l-1.5-3h2.38l1.5 3H16.88zM4.74 5h2.38l-1.5 3H3.24l1.5-3z'
  }
];

// Helper offscreen canvas
let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;

function getOffscreen(width: number, height: number) {
  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement('canvas');
  }
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
  return { canvas: offscreenCanvas, ctx: offscreenCtx };
}

/**
 * Extract particle coordinates from Text
 */
export function sampleTextPoints(
  text: string,
  width: number,
  height: number,
  fontFamily: string = 'Syne',
  fontSize: number = 110,
  maxPoints: number = 4000
): Point2D[] {
  const { ctx } = getOffscreen(width, height);
  if (!ctx) return [];

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;

  // Draw lines if multiline
  const lines = text.split('\n');
  const lineHeight = fontSize * 1.15;
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, idx) => {
    ctx.fillText(line.toUpperCase(), width / 2, startY + idx * lineHeight);
  });

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const points: Point2D[] = [];

  // Determine grid step to fit point count
  const step = Math.max(2, Math.floor(Math.sqrt((width * height) / (maxPoints * 3.5))));

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > 120) {
        points.push({
          x: x + (Math.random() - 0.5) * (step * 0.8),
          y: y + (Math.random() - 0.5) * (step * 0.8),
        });
      }
    }
  }

  return points;
}

/**
 * Extract particle coordinates & colors from an image with edge/contour and overlay text support
 */
export async function sampleImagePoints(
  imgUrl: string,
  width: number,
  height: number,
  maxPoints: number = 4000,
  samplingMode: ImageSamplingMode = 'all-pixels',
  edgeThreshold: number = 35,
  overlayText?: string
): Promise<Point2D[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgUrl;

    img.onload = () => {
      const { ctx } = getOffscreen(width, height);
      if (!ctx) {
        resolve([]);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Scale to fit 65% of viewport
      const targetSize = Math.min(width, height) * 0.65;
      const aspect = img.width / img.height;
      let drawW = targetSize;
      let drawH = targetSize;
      if (aspect > 1) {
        drawH = targetSize / aspect;
      } else {
        drawW = targetSize * aspect;
      }
      const drawX = (width - drawW) / 2;
      const drawY = (height - drawH) / 2;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Inscribed text overlay on top of the image structure if requested
      if (overlayText && overlayText.trim()) {
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const txtSize = Math.max(24, Math.floor(targetSize * 0.16));
        ctx.font = `900 ${txtSize}px "Syne", sans-serif`;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 12;
        ctx.fillText(overlayText.toUpperCase(), width / 2, height / 2);
      }

      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const points: Point2D[] = [];
      const step = Math.max(2, Math.floor(Math.sqrt((width * height) / (maxPoints * 2.5))));

      for (let y = step; y < height - step; y += step) {
        for (let x = step; x < width - step; x += step) {
          const idx = (y * width + x) * 4;
          const a = data[idx + 3];

          if (a > edgeThreshold) {
            let select = true;
            let offsetX = (Math.random() - 0.5) * (step * 0.6);
            let offsetY = (Math.random() - 0.5) * (step * 0.6);

            // Contour / Edge detection via gradient threshold
            if (samplingMode === 'edges-only' || samplingMode === 'contour') {
              const leftA = data[(y * width + (x - step)) * 4 + 3];
              const rightA = data[(y * width + (x + step)) * 4 + 3];
              const topA = data[((y - step) * width + x) * 4 + 3];
              const bottomA = data[((y + step) * width + x) * 4 + 3];

              const grad = Math.abs(rightA - leftA) + Math.abs(bottomA - topA);
              select = grad > 50 || a < 140; // pick edge transitions
            } else if (samplingMode === 'grid-slice') {
              // Grid slice: slices image into geometric particle tiles
              const tileSize = Math.max(14, Math.floor(width * 0.035));
              const gap = Math.floor(tileSize * 0.22);
              const insideTileX = (x % tileSize) > gap;
              const insideTileY = (y % tileSize) > gap;
              select = insideTileX && insideTileY;
            } else if (samplingMode === 'shatter-explode') {
              // Shatter: polygonal shard displacement
              const cellX = Math.floor(x / 45);
              const cellY = Math.floor(y / 45);
              const shardHash = Math.sin(cellX * 12.9898 + cellY * 78.233) * 43758.5453;
              const frac = Math.abs(shardHash % 1);
              select = frac > 0.25;
              offsetX += (frac - 0.5) * 12;
              offsetY += ((frac * 3) % 1 - 0.5) * 12;
            }

            if (select) {
              points.push({
                x: x + offsetX,
                y: y + offsetY,
                color: {
                  r: data[idx],
                  g: data[idx + 1],
                  b: data[idx + 2],
                },
              });
            }
          }
        }
      }
      resolve(points);
    };

    img.onerror = () => {
      resolve([]);
    };
  });
}

/**
 * Algorithmic Geometry Point Generators: Saturn, DNA, Infinity, Diamond, Equalizer, Pulsar
 */
export function sampleSaturnPoints(width: number, height: number, count: number): Point2D[] {
  const points: Point2D[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const planetR = Math.min(width, height) * 0.16;
  const ringInner = planetR * 1.35;
  const ringOuter = planetR * 2.4;
  const tilt = 0.42;

  // 40% particles in central planet, 60% in tilted rings
  const planetCount = Math.floor(count * 0.4);
  const ringCount = count - planetCount;

  // Planet sphere
  for (let i = 0; i < planetCount; i++) {
    const u = Math.random();
    const r = Math.sqrt(u) * planetR;
    const theta = Math.random() * 2 * Math.PI;
    points.push({
      x: cx + Math.cos(theta) * r,
      y: cy + Math.sin(theta) * r * 0.95,
      color: { r: 56, g: 189, b: 248 }, // cyan
    });
  }

  // Tilted Rings
  for (let i = 0; i < ringCount; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const r = ringInner + Math.random() * (ringOuter - ringInner);
    const rx = Math.cos(angle) * r;
    const ry = Math.sin(angle) * (r * 0.32);

    // Rotate by tilt angle
    const rotX = rx * Math.cos(tilt) - ry * Math.sin(tilt);
    const rotY = rx * Math.sin(tilt) + ry * Math.cos(tilt);

    points.push({
      x: cx + rotX,
      y: cy + rotY,
      color: { r: 251, g: 191, b: 36 }, // amber gold
    });
  }

  return points;
}

export function sampleDnaHelixPoints(width: number, height: number, count: number): Point2D[] {
  const points: Point2D[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const spanH = height * 0.7;
  const startY = cy - spanH / 2;
  const radius = Math.min(width, height) * 0.18;

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 8; // 4 full twists
    const y = startY + (i / count) * spanH;
    const strand = i % 3;

    if (strand === 0) {
      // Strand A
      const x = cx + Math.cos(t) * radius;
      points.push({ x, y, color: { r: 0, g: 229, b: 255 } });
    } else if (strand === 1) {
      // Strand B (opposite)
      const x = cx + Math.cos(t + Math.PI) * radius;
      points.push({ x, y, color: { r: 255, g: 179, b: 0 } });
    } else {
      // Base Pair rungs connecting strands
      const lerpVal = Math.random();
      const x1 = cx + Math.cos(t) * radius;
      const x2 = cx + Math.cos(t + Math.PI) * radius;
      points.push({
        x: x1 + (x2 - x1) * lerpVal,
        y,
        color: { r: 255, g: 255, b: 255 },
      });
    }
  }

  return points;
}

export function sampleInfinityPoints(width: number, height: number, count: number): Point2D[] {
  const points: Point2D[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min(width, height) * 0.35;

  for (let i = 0; i < count; i++) {
    const t = Math.random() * 2 * Math.PI;
    // Lemniscate of Bernoulli
    const denom = 1 + Math.sin(t) * Math.sin(t);
    const x = (scale * Math.cos(t)) / denom;
    const y = (scale * Math.sin(t) * Math.cos(t)) / denom;
    const jitter = (Math.random() - 0.5) * 8;

    points.push({
      x: cx + x + jitter,
      y: cy + y + jitter,
      color: x < 0 ? { r: 0, g: 229, b: 255 } : { r: 255, g: 179, b: 0 },
    });
  }

  return points;
}

export function sampleDiamondGemPoints(width: number, height: number, count: number): Point2D[] {
  const points: Point2D[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min(width, height) * 0.32;

  // Top flat edge, top chamfer, bottom point
  for (let i = 0; i < count; i++) {
    const t = Math.random();
    const side = Math.random() < 0.5 ? -1 : 1;
    let x = 0;
    let y = 0;

    if (t < 0.25) {
      // Crown flat
      x = (Math.random() - 0.5) * scale;
      y = -scale * 0.45;
    } else if (t < 0.6) {
      // Crown bevels
      const u = Math.random();
      x = side * (scale * 0.5 + u * scale * 0.3);
      y = -scale * 0.45 + u * scale * 0.35;
    } else {
      // Pavilion triangle to tip
      const u = Math.random();
      x = side * (1 - u) * (scale * 0.8);
      y = -scale * 0.1 + u * scale * 0.9;
    }

    points.push({
      x: cx + x + (Math.random() - 0.5) * 6,
      y: cy + y + (Math.random() - 0.5) * 6,
      color: { r: 180, g: 230, b: 255 },
    });
  }

  return points;
}

export function sampleEqualizerCylinderPoints(width: number, height: number, count: number): Point2D[] {
  const points: Point2D[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const bars = 36;
  const radius = Math.min(width, height) * 0.28;

  for (let i = 0; i < count; i++) {
    const barIdx = i % bars;
    const angle = (barIdx * 2 * Math.PI) / bars;
    const barHeight = Math.sin(barIdx * 0.6 + Date.now() * 0.003) * 60 + 80;
    const hProgress = Math.random() * barHeight;

    const bx = cx + Math.cos(angle) * radius;
    const by = cy + Math.sin(angle) * (radius * 0.45) - hProgress;

    points.push({
      x: bx,
      y: by,
      color: barIdx < bars / 2 ? { r: 0, g: 229, b: 255 } : { r: 255, g: 179, b: 0 },
    });
  }

  return points;
}

export function samplePulsarStarPoints(width: number, height: number, count: number): Point2D[] {
  const points: Point2D[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const coreR = Math.min(width, height) * 0.08;
  const beamLen = Math.min(width, height) * 0.45;

  for (let i = 0; i < count; i++) {
    const isBeam = i % 3 === 0;

    if (isBeam) {
      // Polar jet beam
      const dir = Math.random() < 0.5 ? 1 : -1;
      const d = Math.random() * beamLen;
      const spread = (d / beamLen) * 22;
      points.push({
        x: cx + (Math.random() - 0.5) * spread,
        y: cy + dir * d,
        color: { r: 0, g: 240, b: 255 },
      });
    } else {
      // Dense magnetic core
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.pow(Math.random(), 0.6) * coreR;
      points.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        color: { r: 255, g: 255, b: 255 },
      });
    }
  }

  return points;
}

/**
 * Extract points from SVG Preset Logo
 */
export function sampleSvgPathPoints(
  svgPath: string,
  width: number,
  height: number,
  maxPoints: number = 3000
): Point2D[] {
  const { ctx } = getOffscreen(width, height);
  if (!ctx) return [];

  ctx.clearRect(0, 0, width, height);
  ctx.save();

  // SVG paths are 24x24 viewBox standard
  const scale = (Math.min(width, height) * 0.55) / 24;
  const cx = width / 2;
  const cy = height / 2;

  ctx.translate(cx - 12 * scale, cy - 12 * scale);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#ffffff';
  const p = new Path2D(svgPath);
  ctx.fill(p);
  ctx.restore();

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const points: Point2D[] = [];
  const step = Math.max(2, Math.floor(Math.sqrt((width * height) / (maxPoints * 3.0))));

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] > 100) {
        points.push({
          x: x + (Math.random() - 0.5) * (step * 0.7),
          y: y + (Math.random() - 0.5) * (step * 0.7),
        });
      }
    }
  }

  return points;
}

/**
 * Algorithmic Geometry Point Generators
 */
export function sampleGalaxyPoints(width: number, height: number, count: number): Point2D[] {
  const points: Point2D[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const arms = 3;
  const maxRadius = Math.min(width, height) * 0.38;

  for (let i = 0; i < count; i++) {
    const arm = i % arms;
    const r = Math.pow(Math.random(), 0.7) * maxRadius;
    const angle = (arm * 2 * Math.PI) / arms + (r / maxRadius) * 4.5 + (Math.random() - 0.5) * 0.4;
    points.push({
      x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 8,
      y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 8,
    });
  }
  return points;
}

export function sampleCircleRingPoints(width: number, height: number, count: number): Point2D[] {
  const points: Point2D[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const baseR = Math.min(width, height) * 0.28;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const thickness = (Math.random() - 0.5) * 35;
    const r = baseR + thickness;
    points.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }
  return points;
}

export function sampleHeartFormulaPoints(width: number, height: number, count: number): Point2D[] {
  const points: Point2D[] = [];
  const cx = width / 2;
  const cy = height / 2 - 10;
  const scale = Math.min(width, height) * 0.016;

  for (let i = 0; i < count; i++) {
    const t = Math.random() * 2 * Math.PI;
    // Classic heart parametric equations
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const jitter = (Math.random() - 0.5) * 1.5;

    points.push({
      x: cx + (x + jitter) * scale,
      y: cy + (y + jitter) * scale,
    });
  }
  return points;
}

export function sampleWavePoints(width: number, height: number, count: number): Point2D[] {
  const points: Point2D[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const spanW = width * 0.75;
  const startX = cx - spanW / 2;

  for (let i = 0; i < count; i++) {
    const progress = i / count;
    const x = startX + progress * spanW;
    const y = cy + Math.sin(progress * Math.PI * 6) * 45 + (Math.random() - 0.5) * 12;
    points.push({ x, y });
  }
  return points;
}

export function sampleFireworksPoints(width: number, height: number, count: number): Point2D[] {
  const points: Point2D[] = [];
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const dist = Math.pow(Math.random(), 0.5) * Math.min(width, height) * 0.42;
    points.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
    });
  }
  return points;
}
