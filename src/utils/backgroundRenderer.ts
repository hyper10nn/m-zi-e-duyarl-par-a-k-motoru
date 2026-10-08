import { AudioAnalysis, VisualizerConfig } from '../types';

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
}

export class BackgroundRenderer {
  private stars: Star[] = [];
  private gridOffset = 0;
  private tunnelOffset = 0;
  private cityOffset = 0;
  private currentZoom = 1.0;

  constructor() {
    this.initStars(450);
  }

  private initStars(count: number) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000,
        pz: 1000,
      });
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: VisualizerConfig,
    audio: AudioAnalysis,
    customImageEl: HTMLImageElement | null,
    customVideoEl: HTMLVideoElement | null
  ) {
    const cx = width / 2;
    const cy = height / 2;

    // Beat reactive zoom calculation
    const targetZoom = config.bgBeatZoom && audio.isBeat ? 1.06 : 1.0;
    this.currentZoom += (targetZoom - this.currentZoom) * 0.15;

    ctx.save();

    // Fill deep dark canvas base
    ctx.fillStyle = '#08080a';
    ctx.fillRect(0, 0, width, height);

    // Apply zoom & center transform
    ctx.translate(cx, cy);
    ctx.scale(this.currentZoom, this.currentZoom);
    ctx.translate(-cx, -cy);

    // Apply global background opacity & filter
    ctx.globalAlpha = config.bgOpacity;

    const filters: string[] = [];
    if (config.bgBlur > 0) filters.push(`blur(${config.bgBlur}px)`);
    if (config.bgBrightness !== 1) filters.push(`brightness(${config.bgBrightness})`);
    if (config.bgContrast && config.bgContrast !== 1) filters.push(`contrast(${config.bgContrast})`);
    if (config.bgSaturation && config.bgSaturation !== 1) filters.push(`saturate(${config.bgSaturation})`);
    if (config.bgHueRotate && config.bgHueRotate > 0) filters.push(`hue-rotate(${config.bgHueRotate}deg)`);
    
    if (filters.length > 0) {
      ctx.filter = filters.join(' ');
    }

    switch (config.backgroundType) {
      case 'video-cyber-city':
        this.drawCyberCityVideo(ctx, width, height, audio);
        break;

      case 'video-nebula':
        this.drawNebulaVideo(ctx, width, height, audio);
        break;

      case 'video-techno-tunnel':
        this.drawTechnoTunnelVideo(ctx, width, height, audio);
        break;

      case 'video-liquid-chrome':
        this.drawLiquidChromeVideo(ctx, width, height, audio);
        break;

      case 'video-black-hole':
        this.drawBlackHoleVideo(ctx, width, height, audio);
        break;

      case 'video-matrix-rain':
        this.drawMatrixRainVideo(ctx, width, height, audio);
        break;

      case 'video-hyper-grid':
        this.drawHyperGridVideo(ctx, width, height, audio);
        break;

      case 'video-deep-ocean':
        this.drawDeepOceanVideo(ctx, width, height, audio);
        break;

      case 'procedural-stars':
        this.drawStarfield(ctx, width, height, audio);
        break;

      case 'procedural-grid':
        this.drawCyberGrid(ctx, width, height, audio);
        break;

      case 'procedural-aurora':
        this.drawAurora(ctx, width, height, audio);
        break;

      case 'custom-image':
        if (customImageEl && customImageEl.complete && customImageEl.naturalWidth > 0) {
          this.drawCoverMedia(ctx, customImageEl, width, height);
        } else {
          this.drawCyberCityVideo(ctx, width, height, audio);
        }
        break;

      case 'custom-video':
        if (customVideoEl && customVideoEl.readyState >= 2) {
          this.drawCoverMedia(ctx, customVideoEl, width, height);
        } else {
          // Fallback to sample cyber city video loop so it NEVER appears empty!
          this.drawCyberCityVideo(ctx, width, height, audio);
        }
        break;

      case 'none':
      default:
        // Dark minimal base
        ctx.fillStyle = '#060608';
        ctx.fillRect(0, 0, width, height);
        break;
    }

    // Reset filters and transform
    ctx.restore();

    // Retro CRT scanlines overlay if enabled
    if (config.bgScanlines) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.5);
      }
      ctx.restore();
    }

    // Dark vignette scrim over background to make particles pop cleanly
    ctx.save();
    const grad = ctx.createRadialGradient(cx, cy, Math.min(width, height) * 0.35, cx, cy, Math.max(width, height) * 0.78);
    grad.addColorStop(0, 'rgba(8, 8, 10, 0.12)');
    grad.addColorStop(1, 'rgba(4, 4, 6, 0.88)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  private drawCoverMedia(
    ctx: CanvasRenderingContext2D,
    media: HTMLImageElement | HTMLVideoElement,
    width: number,
    height: number
  ) {
    const mWidth = media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
    const mHeight = media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight;

    if (!mWidth || !mHeight) return;

    const scale = Math.max(width / mWidth, height / mHeight);
    const nw = mWidth * scale;
    const nh = mHeight * scale;
    const nx = (width - nw) / 2;
    const ny = (height - nh) / 2;

    ctx.drawImage(media, nx, ny, nw, nh);
  }

  /**
   * 1. 3D Cyberpunk Metropolis Video Loop
   */
  private drawCyberCityVideo(ctx: CanvasRenderingContext2D, width: number, height: number, audio: AudioAnalysis) {
    const horizon = height * 0.58;
    this.cityOffset = (this.cityOffset + 1.2 + audio.bass * 3) % 100;

    // Deep neon gradient sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
    skyGrad.addColorStop(0, '#040714');
    skyGrad.addColorStop(0.6, '#0f172a');
    skyGrad.addColorStop(1, '#1e1035');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizon);

    // Distant Neon City Skyline Silhouettes
    ctx.fillStyle = '#090d16';
    const buildingCount = 22;
    const bWidth = width / buildingCount;

    for (let i = 0; i < buildingCount; i++) {
      const hSeed = Math.sin(i * 3.7) * 0.5 + 0.5;
      const bHeight = 80 + hSeed * (horizon * 0.65);
      const bx = i * bWidth;
      const by = horizon - bHeight;

      ctx.fillRect(bx, by, bWidth + 1, bHeight);

      // Glowing windows
      ctx.fillStyle = (i % 2 === 0 ? '#38bdf8' : '#f59e0b') + '55';
      for (let wy = by + 10; wy < horizon - 10; wy += 14) {
        if ((wy + i * 5) % 3 === 0) {
          ctx.fillRect(bx + 4, wy, bWidth - 8, 4);
        }
      }
      ctx.fillStyle = '#090d16';
    }

    // Glowing Neon Horizon Line
    ctx.strokeStyle = `rgba(0, 229, 255, ${0.6 + audio.bass * 0.4})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(width, horizon);
    ctx.stroke();

    // Perspective highway floor
    const cx = width / 2;
    ctx.fillStyle = '#07090e';
    ctx.fillRect(0, horizon, width, height - horizon);

    // Glowing road perspective lines
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.28)';
    ctx.lineWidth = 1;
    for (let x = -width; x < width * 2; x += 70) {
      ctx.beginPath();
      ctx.moveTo(cx + (x - cx) * 0.04, horizon);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Moving horizontal grid lines
    for (let y = 0; y < 18; y++) {
      const progress = (y + this.cityOffset / 100) / 18;
      const py = horizon + Math.pow(progress, 2.3) * (height - horizon);
      ctx.strokeStyle = `rgba(245, 158, 11, ${progress * 0.5 * (1 + audio.bass * 0.5)})`;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }
  }

  /**
   * 2. Cosmic Nebula Flight Video Loop
   */
  private drawNebulaVideo(ctx: CanvasRenderingContext2D, width: number, height: number, audio: AudioAnalysis) {
    const time = Date.now() * 0.0006;
    const cx = width / 2;
    const cy = height / 2;

    // Deep space base
    ctx.fillStyle = '#030208';
    ctx.fillRect(0, 0, width, height);

    // Layer 1: Violet plasma cloud
    const grad1 = ctx.createRadialGradient(
      cx + Math.cos(time) * 120,
      cy + Math.sin(time * 0.7) * 80,
      50,
      cx,
      cy,
      Math.max(width, height) * 0.65
    );
    grad1.addColorStop(0, `hsla(275, 90%, 55%, ${0.35 + audio.mid * 0.3})`);
    grad1.addColorStop(0.5, 'hsla(260, 85%, 25%, 0.15)');
    grad1.addColorStop(1, 'transparent');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, width, height);

    // Layer 2: Electric Cyan stardust plume
    const grad2 = ctx.createRadialGradient(
      cx + Math.sin(time * 0.9) * 140,
      cy - Math.cos(time * 0.6) * 90,
      40,
      cx,
      cy,
      Math.max(width, height) * 0.55
    );
    grad2.addColorStop(0, `hsla(185, 95%, 60%, ${0.3 + audio.treble * 0.3})`);
    grad2.addColorStop(0.5, 'hsla(200, 80%, 25%, 0.12)');
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, width, height);

    // Layer 3: Warm Amber core
    const grad3 = ctx.createRadialGradient(cx, cy, 10, cx, cy, 220);
    grad3.addColorStop(0, `hsla(45, 100%, 70%, ${0.25 + audio.bass * 0.4})`);
    grad3.addColorStop(1, 'transparent');
    ctx.fillStyle = grad3;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * 3. Techno Hexagon Warp Tunnel Video Loop
   */
  private drawTechnoTunnelVideo(ctx: CanvasRenderingContext2D, width: number, height: number, audio: AudioAnalysis) {
    const cx = width / 2;
    const cy = height / 2;
    this.tunnelOffset = (this.tunnelOffset + 0.02 + audio.bass * 0.05) % 1;

    ctx.fillStyle = '#040407';
    ctx.fillRect(0, 0, width, height);

    const maxR = Math.max(width, height) * 0.8;
    const ringCount = 14;

    ctx.lineWidth = 1.5;

    for (let i = 0; i < ringCount; i++) {
      const p = (i / ringCount + this.tunnelOffset / ringCount) % 1;
      const r = Math.pow(p, 2.2) * maxR;
      const alpha = Math.min(1, p * 1.5) * (0.3 + audio.bass * 0.7);

      // Alternating Cyan / Gold Hexagon
      ctx.strokeStyle = i % 2 === 0 ? `rgba(0, 229, 255, ${alpha})` : `rgba(255, 179, 0, ${alpha})`;

      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const angle = (a * Math.PI) / 3 + this.tunnelOffset * 0.4;
        const hx = cx + Math.cos(angle) * r;
        const hy = cy + Math.sin(angle) * r;
        if (a === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Tunnel center vortex eye
    const coreGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 80 * (1 + audio.bass * 0.5));
    coreGrad.addColorStop(0, 'rgba(0, 229, 255, 0.8)');
    coreGrad.addColorStop(0.5, 'rgba(255, 179, 0, 0.3)');
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 90, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 4. Liquid Chrome Waves Video Loop
   */
  private drawLiquidChromeVideo(ctx: CanvasRenderingContext2D, width: number, height: number, audio: AudioAnalysis) {
    const time = Date.now() * 0.0012;
    ctx.fillStyle = '#07070a';
    ctx.fillRect(0, 0, width, height);

    const waveCount = 5;
    for (let w = 0; w < waveCount; w++) {
      const grad = ctx.createLinearGradient(0, height * 0.3, width, height * 0.8);
      const isCyan = w % 2 === 0;
      grad.addColorStop(0, isCyan ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 179, 0, 0.25)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
      grad.addColorStop(1, isCyan ? 'rgba(0, 229, 255, 0)' : 'rgba(255, 179, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let x = 0; x <= width; x += 30) {
        const y =
          height * 0.5 +
          Math.sin(x * 0.004 + time * (1 + w * 0.3) + w) * 90 +
          Math.cos(x * 0.008 - time * 0.6) * 50 * (1 + audio.bass * 0.6);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    }
  }

  /**
   * 5. Hyperspace Starfield
   */
  private drawStarfield(ctx: CanvasRenderingContext2D, width: number, height: number, audio: AudioAnalysis) {
    const cx = width / 2;
    const cy = height / 2;
    const speed = 4 + audio.bass * 24 + audio.energy * 10;

    ctx.fillStyle = '#ffffff';

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.pz = s.z;
      s.z -= speed;

      if (s.z <= 0) {
        s.z = 1000;
        s.pz = 1000;
        s.x = (Math.random() - 0.5) * 2000;
        s.y = (Math.random() - 0.5) * 2000;
      }

      const k = 400 / s.z;
      const px = s.x * k + cx;
      const py = s.y * k + cy;

      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        const pk = 400 / s.pz;
        const prevX = s.x * pk + cx;
        const prevY = s.y * pk + cy;
        const size = Math.max(1, (1 - s.z / 1000) * 3);

        ctx.strokeStyle = `rgba(180, 220, 255, ${(1 - s.z / 1000) * 0.9})`;
        ctx.lineWidth = size * 0.7;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(px, py);
        ctx.stroke();
      }
    }
  }

  /**
   * 6. Retro Synthwave Grid
   */
  private drawCyberGrid(ctx: CanvasRenderingContext2D, width: number, height: number, audio: AudioAnalysis) {
    const horizon = height * 0.62;
    this.gridOffset = (this.gridOffset + 1.5 + audio.bass * 4) % 40;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
    skyGrad.addColorStop(0, '#090814');
    skyGrad.addColorStop(1, '#241038');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizon);

    ctx.strokeStyle = `rgba(236, 72, 153, ${0.4 + audio.bass * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(width, horizon);
    ctx.stroke();

    const cx = width / 2;
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = 1;

    for (let x = -width; x < width * 2; x += 60) {
      ctx.beginPath();
      ctx.moveTo(cx + (x - cx) * 0.05, horizon);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < 20; y++) {
      const progress = (y + this.gridOffset / 40) / 20;
      const py = horizon + Math.pow(progress, 2.2) * (height - horizon);
      ctx.strokeStyle = `rgba(6, 182, 212, ${progress * 0.6})`;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }
  }

  /**
   * 7. Northern Lights Aurora
   */
  private drawAurora(ctx: CanvasRenderingContext2D, width: number, height: number, audio: AudioAnalysis) {
    const time = Date.now() * 0.001;
    const waveCount = 3;

    for (let w = 0; w < waveCount; w++) {
      const grad = ctx.createLinearGradient(0, height * 0.2, 0, height * 0.85);
      const hue = (160 + w * 50 + audio.treble * 40) % 360;
      grad.addColorStop(0, `hsla(${hue}, 85%, 45%, 0)`);
      grad.addColorStop(0.5, `hsla(${hue}, 85%, 55%, ${0.25 + audio.mid * 0.2})`);
      grad.addColorStop(1, `hsla(${hue}, 85%, 45%, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let x = 0; x <= width; x += 25) {
        const y =
          height * 0.5 +
          Math.sin(x * 0.003 + time * (0.8 + w * 0.3) + w) * 110 +
          Math.cos(x * 0.007 - time * 0.5) * 60 * (1 + audio.bass * 0.6);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    }
  }

  /**
   * 8. Interstellar Gargantua Black Hole & Accretion Disk Video Loop
   */
  private drawBlackHoleVideo(ctx: CanvasRenderingContext2D, width: number, height: number, audio: AudioAnalysis) {
    const cx = width / 2;
    const cy = height / 2;
    const time = Date.now() * 0.001;
    const holeRadius = Math.min(width, height) * 0.16;

    ctx.fillStyle = '#020205';
    ctx.fillRect(0, 0, width, height);

    // Glowing relativistic outer aura
    const auraGrad = ctx.createRadialGradient(cx, cy, holeRadius * 0.8, cx, cy, holeRadius * 3.5);
    auraGrad.addColorStop(0, `rgba(255, 179, 0, ${0.4 + audio.bass * 0.4})`);
    auraGrad.addColorStop(0.3, `rgba(0, 229, 255, ${0.3 + audio.mid * 0.3})`);
    auraGrad.addColorStop(0.7, 'rgba(147, 51, 234, 0.15)');
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, holeRadius * 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Accretion disk rings with doppler shift and rotation
    const ringCount = 18;
    for (let r = 0; r < ringCount; r++) {
      const rad = holeRadius * (1.2 + (r / ringCount) * 1.8);
      const angleOffset = time * (1.5 - (r / ringCount) * 0.8);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(0.35); // tilt accretion disk

      ctx.beginPath();
      ctx.ellipse(0, 0, rad, rad * 0.32, 0, 0, Math.PI * 2);
      const alpha = (1 - r / ringCount) * (0.35 + audio.bass * 0.45);
      ctx.strokeStyle = r % 2 === 0 ? `rgba(255, 179, 0, ${alpha})` : `rgba(0, 229, 255, ${alpha * 0.8})`;
      ctx.lineWidth = 2 + (1 - r / ringCount) * 4;
      ctx.stroke();
      ctx.restore();
    }

    // Pure black Event Horizon sphere in the center
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, holeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Blazing hot photon sphere rim
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.85 + audio.bass * 0.15})`;
    ctx.lineWidth = 3 + audio.bass * 4;
    ctx.beginPath();
    ctx.arc(cx, cy, holeRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  /**
   * 9. Matrix Cyberspace Digital Rain Video Loop
   */
  private drawMatrixRainVideo(ctx: CanvasRenderingContext2D, width: number, height: number, audio: AudioAnalysis) {
    const time = Date.now() * 0.002;
    ctx.fillStyle = 'rgba(2, 6, 4, 0.9)';
    ctx.fillRect(0, 0, width, height);

    const cols = Math.floor(width / 24);
    const chars = '01アイウエオカキクケコサシスセソタチツテトRMAFX9876543210';

    ctx.font = '14px "JetBrains Mono", monospace';
    const isKick = audio.isBeat;

    for (let c = 0; c < cols; c++) {
      const speed = ((c % 7) + 3) * (1 + audio.mid * 1.5);
      const yOffset = (time * speed * 25 + c * 73) % (height + 300) - 150;
      const x = c * 24 + 12;

      const charLen = 14;
      for (let k = 0; k < charLen; k++) {
        const charY = yOffset - k * 18;
        if (charY < -20 || charY > height + 20) continue;

        const charIdx = (c * 13 + k + Math.floor(time * 6)) % chars.length;
        const char = chars[charIdx];

        if (k === 0) {
          // Leading bright glyph
          ctx.fillStyle = isKick ? '#ffffff' : '#a7f3d0';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 8;
        } else {
          const alpha = (1 - k / charLen) * (0.4 + audio.treble * 0.5);
          ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
          ctx.shadowBlur = 0;
        }
        ctx.fillText(char, x, charY);
      }
    }
  }

  /**
   * 10. Hyperwave 3D Synthwave Horizon Video Loop
   */
  private drawHyperGridVideo(ctx: CanvasRenderingContext2D, width: number, height: number, audio: AudioAnalysis) {
    const horizon = height * 0.52;
    const time = Date.now() * 0.0015;
    this.gridOffset = (this.gridOffset + 2 + audio.bass * 6) % 40;

    // Glowing retro-futuristic gradient sky
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#0a0017');
    sky.addColorStop(0.5, '#1e0836');
    sky.addColorStop(1, '#ff007f');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, horizon);

    // Neon segmented Sun
    const sunR = Math.min(width, height) * 0.18 * (1 + audio.bass * 0.12);
    const sunGrad = ctx.createLinearGradient(width / 2, horizon - sunR * 1.8, width / 2, horizon);
    sunGrad.addColorStop(0, '#fef08a');
    sunGrad.addColorStop(0.5, '#f43f5e');
    sunGrad.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(width / 2, horizon, sunR, Math.PI, 0);
    ctx.fill();

    // 3D Grid ground
    ctx.fillStyle = '#05010a';
    ctx.fillRect(0, horizon, width, height - horizon);

    const cx = width / 2;
    ctx.strokeStyle = `rgba(236, 72, 153, ${0.45 + audio.bass * 0.4})`;
    ctx.lineWidth = 1.5;

    // Perspective floor lines
    for (let x = -width * 1.5; x < width * 2.5; x += 65) {
      ctx.beginPath();
      ctx.moveTo(cx + (x - cx) * 0.02, horizon);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Moving horizontal grid lines
    for (let y = 0; y < 16; y++) {
      const p = (y + this.gridOffset / 40) / 16;
      const py = horizon + Math.pow(p, 2.3) * (height - horizon);
      ctx.strokeStyle = `rgba(6, 182, 212, ${p * 0.7 * (1 + audio.bass * 0.4)})`;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }
  }

  /**
   * 11. Deep Abyssal Bioluminescent Ocean Cavern Video Loop
   */
  private drawDeepOceanVideo(ctx: CanvasRenderingContext2D, width: number, height: number, audio: AudioAnalysis) {
    const time = Date.now() * 0.001;
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    oceanGrad.addColorStop(0, '#021019');
    oceanGrad.addColorStop(0.6, '#041c2c');
    oceanGrad.addColorStop(1, '#02090e');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // Caustic light rays from surface
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let r = 0; r < 6; r++) {
      const rayGrad = ctx.createLinearGradient(0, 0, width * 0.3, height);
      rayGrad.addColorStop(0, `rgba(56, 189, 248, ${0.15 + audio.treble * 0.2})`);
      rayGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      const startX = (width / 5) * r + Math.sin(time + r) * 40;
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX + 120, 0);
      ctx.lineTo(startX + 300, height);
      ctx.lineTo(startX + 140, height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Bioluminescent floating plankton spores
    const sporeCount = 45;
    for (let i = 0; i < sporeCount; i++) {
      const sx = ((i * 137.5) % width) + Math.sin(time * 0.8 + i) * 35;
      const sy = (height - ((time * 30 + i * 45) % height)) % height;
      const sRad = 2 + (i % 4) + audio.mid * 3;

      ctx.fillStyle = i % 2 === 0 ? 'rgba(45, 212, 191, 0.7)' : 'rgba(168, 85, 247, 0.7)';
      ctx.shadowColor = i % 2 === 0 ? '#2dd4bf' : '#a855f7';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sx, sy, sRad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
}
