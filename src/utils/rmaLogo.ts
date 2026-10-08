import { Point2D } from './shapePresets';

let cachedRmaDataUrl: string | null = null;

/**
 * Procedurally draws the authentic high-resolution RMA emblem matching the user's uploaded image:
 * Concentric futuristic mechanical rings, cyan/gold dual lunar sphere, and chamfered metallic RMA typography.
 */
export function drawRmaEmblem(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.42;

  ctx.save();

  // 1. Outer Dark Halo & Glow
  const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.3);
  glowGrad.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
  glowGrad.addColorStop(0.5, 'rgba(255, 179, 0, 0.15)');
  glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
  ctx.fill();

  // 2. Dual-Tone Planet / Lunar Sphere Clip
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2);
  ctx.clip();

  // Left Half: Electric Cyan Lunar surface
  const cyanGrad = ctx.createRadialGradient(cx - radius * 0.3, cy, radius * 0.1, cx - radius * 0.2, cy, radius * 0.9);
  cyanGrad.addColorStop(0, '#5cedfc');
  cyanGrad.addColorStop(0.5, '#00b4d8');
  cyanGrad.addColorStop(0.85, '#003060');
  cyanGrad.addColorStop(1, '#001220');

  ctx.fillStyle = cyanGrad;
  ctx.fillRect(cx - radius, cy - radius, radius, radius * 2);

  // Right Half: Warm Amber-Gold Solar/Moon surface
  const goldGrad = ctx.createRadialGradient(cx + radius * 0.3, cy, radius * 0.1, cx + radius * 0.2, cy, radius * 0.9);
  goldGrad.addColorStop(0, '#ffe894');
  goldGrad.addColorStop(0.45, '#ffb703');
  goldGrad.addColorStop(0.85, '#b05900');
  goldGrad.addColorStop(1, '#2d1400');

  ctx.fillStyle = goldGrad;
  ctx.fillRect(cx, cy - radius, radius, radius * 2);

  // Honeycomb / Crater textural pattern over the sphere
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let r = 0; r < radius * 0.8; r += 16) {
    const dots = Math.floor((2 * Math.PI * r) / 14);
    for (let d = 0; d < dots; d++) {
      const a = (d * 2 * Math.PI) / dots;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Vertical separator hairline with neon glow
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(cx, cy - radius * 0.82);
  ctx.lineTo(cx, cy + radius * 0.82);
  ctx.stroke();

  ctx.restore(); // end planet clip

  // 3. Concentric Sci-Fi Mechanical Rings
  const ringCount = 3;
  for (let i = 0; i < ringCount; i++) {
    const r = radius * (0.86 + i * 0.09);
    ctx.lineWidth = i === 1 ? 4 : 2;

    // Dual stroke color: Cyan on left, Amber on right
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();

    ctx.strokeStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 1.5, Math.PI * 2.5);
    ctx.stroke();

    // LED Perimeter Dots
    const dotCount = 36;
    for (let j = 0; j < dotCount; j++) {
      const a = (j * 2 * Math.PI) / dotCount;
      const dx = cx + Math.cos(a) * r;
      const dy = cy + Math.sin(a) * r;
      ctx.fillStyle = dx < cx ? '#38bdf8' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(dx, dy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Crosshair reticle notches (top, bottom, left, right)
  const notchLen = 22;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  // Left
  ctx.beginPath(); ctx.moveTo(cx - radius * 1.15, cy); ctx.lineTo(cx - radius * 1.15 + notchLen, cy); ctx.stroke();
  // Right
  ctx.beginPath(); ctx.moveTo(cx + radius * 1.15 - notchLen, cy); ctx.lineTo(cx + radius * 1.15, cy); ctx.stroke();
  // Top
  ctx.beginPath(); ctx.moveTo(cx, cy - radius * 1.15); ctx.lineTo(cx, cy - radius * 1.15 + notchLen); ctx.stroke();
  // Bottom
  ctx.beginPath(); ctx.moveTo(cx, cy + radius * 1.15 - notchLen); ctx.lineTo(cx, cy + radius * 1.15); ctx.stroke();

  // 4. Center Chamfered Futuristic Typography: "RMA"
  const fontSize = Math.floor(radius * 0.65);
  ctx.font = `900 ${fontSize}px "Syne", "Impact", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Neon Back-Glow
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('RMA', cx, cy);

  // Chrome Metallic Outline
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 14;
  ctx.strokeText('RMA', cx, cy);

  // Inner Metallic Chrome Gradient
  const chromeGrad = ctx.createLinearGradient(cx - radius * 0.5, cy - fontSize * 0.5, cx + radius * 0.5, cy + fontSize * 0.5);
  chromeGrad.addColorStop(0, '#e2e8f0');
  chromeGrad.addColorStop(0.3, '#38bdf8');
  chromeGrad.addColorStop(0.5, '#ffffff');
  chromeGrad.addColorStop(0.7, '#fbbf24');
  chromeGrad.addColorStop(1, '#f8fafc');

  ctx.fillStyle = chromeGrad;
  ctx.fillText('RMA', cx, cy);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeText('RMA', cx, cy);

  ctx.restore();
}

/**
 * Generates a cached Data URL of the RMA Logo
 */
export function getRmaLogoDataUrl(): string {
  if (cachedRmaDataUrl) return cachedRmaDataUrl;

  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawRmaEmblem(ctx, 600, 600);
    cachedRmaDataUrl = canvas.toDataURL('image/png');
  }
  return cachedRmaDataUrl || '';
}

/**
 * Extracts point samples and pixel colors directly from the RMA emblem
 */
export function sampleRmaLogoPoints(width: number, height: number, maxPoints: number = 3200): Point2D[] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  drawRmaEmblem(ctx, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const points: Point2D[] = [];
  const step = Math.max(2, Math.floor(Math.sqrt((width * height) / (maxPoints * 3.2))));

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const a = data[idx + 3];
      if (a > 45) {
        points.push({
          x: x + (Math.random() - 0.5) * (step * 0.6),
          y: y + (Math.random() - 0.5) * (step * 0.6),
          color: {
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
          },
        });
      }
    }
  }

  return points;
}
