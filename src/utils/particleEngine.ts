import { AudioAnalysis, ColorTheme, VisualizerConfig, MovementPattern, RenderStyleType } from '../types';
import {
  Point2D,
  PRESET_LOGOS,
  sampleCircleRingPoints,
  sampleFireworksPoints,
  sampleGalaxyPoints,
  sampleHeartFormulaPoints,
  sampleImagePoints,
  sampleSvgPathPoints,
  sampleTextPoints,
  sampleWavePoints,
  sampleSaturnPoints,
  sampleDnaHelixPoints,
  sampleInfinityPoints,
  sampleDiamondGemPoints,
  sampleEqualizerCylinderPoints,
  samplePulsarStarPoints,
} from './shapePresets';
import { sampleRmaLogoPoints } from './rmaLogo';
import { evaluateGradient, DEFAULT_RMA_GRADIENT } from './gradientPresets';

export interface Particle {
  id: number;
  x: number;
  y: number;
  z: number; // 3D z-depth
  tx: number; // target x
  ty: number; // target y
  tz: number; // target z
  vx: number;
  vy: number;
  vz: number;
  size: number;
  baseSize: number;
  alpha: number;
  hueOffset: number;
  origColor?: { r: number; g: number; b: number };
  spiralArm: number;
  glitchOffset: number;
}

export class ParticleEngine {
  public particles: Particle[] = [];
  public targetPoints: Point2D[] = [];
  private width = 1280;
  private height = 720;
  private time = 0;
  private mouse = { x: -9999, y: -9999, radius: 120, isDown: false };
  private bassShockwaveRadius = 0;
  private shockwaveActive = false;
  private dualWaveProgress = 0;
  private dualWaveActive = false;
  private ripplePhase = 0;
  private glitchActive = false;
  private glitchTimer = 0;

  // Performance Gradient Look-up Table (LUT)
  private lutStopsKey = '';
  private lutRgb: { r: number; g: number; b: number }[] = [];

  constructor() {}

  public resize(w: number, h: number) {
    this.width = Math.max(100, w);
    this.height = Math.max(100, h);
  }

  public setMouse(x: number, y: number, isDown: boolean = false) {
    this.mouse.x = x;
    this.mouse.y = y;
    this.mouse.isDown = isDown;
  }

  public clearMouse() {
    this.mouse.x = -9999;
    this.mouse.y = -9999;
    this.mouse.isDown = false;
  }

  public async updateTargets(config: VisualizerConfig) {
    let points: Point2D[] = [];
    const count = config.particleCount;

    switch (config.shapeMode) {
      case 'text':
        points = sampleTextPoints(
          config.text || 'RMAFX',
          this.width,
          this.height,
          config.fontFamily,
          config.fontSize,
          count
        );
        break;

      case 'preset-logo': {
        if (config.selectedLogo === 'rma') {
          points = sampleRmaLogoPoints(this.width, this.height, count);
        } else {
          const logo = PRESET_LOGOS.find((l) => l.id === config.selectedLogo) || PRESET_LOGOS[0];
          points = sampleSvgPathPoints(logo.iconSvgPath, this.width, this.height, count);
        }
        break;
      }

      case 'image':
        if (config.customImageUrl) {
          points = await sampleImagePoints(
            config.customImageUrl,
            this.width,
            this.height,
            count,
            config.imageSamplingMode || 'all-pixels',
            config.imageEdgeThreshold ?? 35,
            config.showImageText ? config.imageOverlayText : undefined
          );
        } else {
          points = sampleRmaLogoPoints(this.width, this.height, count);
        }
        break;

      case 'saturn':
        points = sampleSaturnPoints(this.width, this.height, count);
        break;

      case 'dna':
        points = sampleDnaHelixPoints(this.width, this.height, count);
        break;

      case 'infinity':
        points = sampleInfinityPoints(this.width, this.height, count);
        break;

      case 'diamond':
        points = sampleDiamondGemPoints(this.width, this.height, count);
        break;

      case 'equalizer-cylinder':
        points = sampleEqualizerCylinderPoints(this.width, this.height, count);
        break;

      case 'pulsar':
        points = samplePulsarStarPoints(this.width, this.height, count);
        break;

      case 'galaxy':
        points = sampleGalaxyPoints(this.width, this.height, count);
        break;

      case 'circle':
        points = sampleCircleRingPoints(this.width, this.height, count);
        break;

      case 'heart':
        points = sampleHeartFormulaPoints(this.width, this.height, count);
        break;

      case 'wave':
        points = sampleWavePoints(this.width, this.height, count);
        break;

      case 'fireworks':
        points = sampleFireworksPoints(this.width, this.height, count);
        break;

      default:
        points = sampleRmaLogoPoints(this.width, this.height, count);
    }

    if (points.length === 0) {
      points = sampleRmaLogoPoints(this.width, this.height, count);
    }

    this.targetPoints = points;
    this.reconcileParticles(config);
  }

  private reconcileParticles(config: VisualizerConfig) {
    const targetLen = Math.min(config.particleCount, this.targetPoints.length);

    while (this.particles.length > targetLen) {
      this.particles.pop();
    }

    for (let i = 0; i < targetLen; i++) {
      const tp = this.targetPoints[i % this.targetPoints.length];
      if (i < this.particles.length) {
        this.particles[i].id = i;
        this.particles[i].tx = tp.x;
        this.particles[i].ty = tp.y;
        this.particles[i].tz = (Math.random() - 0.5) * 80;
        this.particles[i].origColor = tp.color;
      } else {
        const p: Particle = {
          id: i,
          x: this.width / 2 + (Math.random() - 0.5) * 50,
          y: this.height / 2 + (Math.random() - 0.5) * 50,
          z: (Math.random() - 0.5) * 200,
          tx: tp.x,
          ty: tp.y,
          tz: (Math.random() - 0.5) * 80,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          vz: (Math.random() - 0.5) * 5,
          size: config.particleSize * (0.6 + Math.random() * 0.8),
          baseSize: config.particleSize,
          alpha: 0.3 + Math.random() * 0.7,
          hueOffset: Math.random() * 40,
          origColor: tp.color,
          spiralArm: i % 4,
          glitchOffset: 0,
        };
        this.particles.push(p);
      }
    }
  }

  private updateGradientLut(config: VisualizerConfig) {
    const stops = config.gradientStops && config.gradientStops.length > 0 ? config.gradientStops : DEFAULT_RMA_GRADIENT;
    const key = stops.map(s => `${s.offset}_${s.color}`).join('|');
    if (this.lutStopsKey === key && this.lutRgb.length === 256) return;

    this.lutStopsKey = key;
    this.lutRgb = new Array(256);
    for (let i = 0; i < 256; i++) {
      this.lutRgb[i] = evaluateGradient(i / 255, stops);
    }
  }

  public update(audio: AudioAnalysis, config: VisualizerConfig, deltaTime: number) {
    this.time += deltaTime || 0.016;
    const cx = this.width / 2;
    const cy = this.height / 2;

    // 1. Noise Gate & Audio Stability:
    // When no music is playing or energy is below threshold, effectiveEnergy drops to 0.
    // This stops particles from twitching or drifting when silent!
    const noiseGate = config.noiseGate ?? 0.05;
    const rawEnergy = audio.energy || 0;
    const effectiveEnergy = rawEnergy <= noiseGate ? 0 : Math.min(1.0, (rawEnergy - noiseGate) / (1 - noiseGate));
    const audioMult = effectiveEnergy > 0 ? (config.audioReactivity ?? 1.0) : 0;

    // 2. Shape Cohesion (0.1 to 1.0):
    // High cohesion keeps text, images, and shapes solid and readable instead of blowing apart.
    const cohesion = Math.max(0.1, Math.min(1.0, config.shapeCohesion ?? 0.85));

    // Pulse Frequency scales particle return speed directly based on audio energy
    const pulseFactor = 1.0 + (config.pulseFrequency ?? 1.0) * effectiveEnergy * 2.4;
    // Enhanced ease: stronger return pull when cohesion is high
    const ease = (config.shapeMorphSpeed * 0.08 + cohesion * 0.16) * pulseFactor;

    // Apply frequency EQ boosts scaled by effective energy
    const bass = effectiveEnergy > 0 ? audio.bass * (config.bassBoost ?? 1.2) * audioMult : 0;
    const mid = effectiveEnergy > 0 ? audio.mid * (config.midBoost ?? 1.0) * audioMult : 0;
    const treble = effectiveEnergy > 0 ? audio.treble * (config.trebleBoost ?? 1.0) * audioMult : 0;

    // Determine current effective movement pattern
    let pattern: MovementPattern = config.movementPattern;
    if (pattern === 'auto-beat') {
      if (effectiveEnergy > 0.15 && (audio.isBeat || audio.beatType === 'kick')) {
        pattern = 'explode';
      } else if (effectiveEnergy > 0.15 && (audio.isSnare || audio.beatType === 'snare')) {
        pattern = 'vortex';
      } else if (effectiveEnergy > 0.15 && (audio.isHihat || audio.beatType === 'hihat')) {
        pattern = 'quantum-glitch';
      } else if (mid > 0.3) {
        pattern = 'spiral';
      } else {
        pattern = 'wave-ripple';
      }
    }

    // Trigger shockwave for explode pattern ONLY when music beat is real
    if (effectiveEnergy > 0.1 && (pattern === 'explode' || config.movementPattern === 'auto-beat') && (audio.isBeat || audio.beatType === 'kick')) {
      this.shockwaveActive = true;
      this.bassShockwaveRadius = 20;

      if (config.dualRmaShockwave) {
        this.dualWaveActive = true;
        this.dualWaveProgress = 0;
      }
    }

    if (this.shockwaveActive) {
      this.bassShockwaveRadius += 550 * deltaTime;
      if (this.bassShockwaveRadius > Math.max(this.width, this.height) * 0.85) {
        this.shockwaveActive = false;
      }
    }

    if (this.dualWaveActive) {
      this.dualWaveProgress += 1.8 * deltaTime;
      if (this.dualWaveProgress > 1.2) {
        this.dualWaveActive = false;
      }
    }

    // Ripple phase advance
    if (effectiveEnergy > 0) {
      this.ripplePhase += (2 + bass * 8) * deltaTime;
    }

    // Glitch timer trigger
    if (effectiveEnergy > 0.1 && (pattern === 'quantum-glitch' || config.movementPattern === 'auto-beat') && (audio.isHihat || audio.isSnare)) {
      this.glitchActive = true;
      this.glitchTimer = 0.10;
    }

    if (this.glitchActive) {
      this.glitchTimer -= deltaTime;
      if (this.glitchTimer <= 0) {
        this.glitchActive = false;
      }
    }

    const timeVal = Date.now() * 0.002;
    const vortexRate = (config.vortexSpeed || 1.2) * (1 + mid * 2.0);

    // Friction - higher damping when cohesion is high to stop jitter
    const friction = 0.82 + (1 - cohesion) * 0.08;

    // Movement scale factor based on sound energy and cohesion
    const motionScale = effectiveEnergy * (1.0 - cohesion * 0.65);

    // Maximum allowed drift from home point (guarantees text/image integrity)
    const maxAllowedDrift = 16 + (1 - cohesion) * 160;

    // Update particle physics
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Base home-return spring force
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const dz = p.tz - p.z;
      p.vx += dx * ease;
      p.vy += dy * ease;
      p.vz += dz * ease;

      // Friction
      p.vx *= friction;
      p.vy *= friction;
      p.vz *= friction;

      // Distance from center
      const fromCenterX = p.x - cx;
      const fromCenterY = p.y - cy;
      const distFromCenter = Math.hypot(fromCenterX, fromCenterY) || 1;
      const angleFromCenter = Math.atan2(fromCenterY, fromCenterX);

      // 3D Depth displacement on bass (only when sound plays)
      if (config.depth3D && effectiveEnergy > 0) {
        p.vz += (Math.random() - 0.5) * 6 * bass;
        if (audio.isBeat) {
          p.vz -= 25 * bass * (1 - cohesion * 0.5);
        }
      }

      // Dual RMA Shockwaves
      if (this.dualWaveActive && config.dualRmaShockwave && effectiveEnergy > 0) {
        const leftWaveX = this.width * this.dualWaveProgress * 0.5;
        const rightWaveX = this.width - leftWaveX;

        if (Math.abs(p.x - leftWaveX) < 40) {
          p.vx += 12 * bass * (1 - cohesion * 0.5);
          p.vy += (Math.random() - 0.5) * 8;
        }
        if (Math.abs(p.x - rightWaveX) < 40) {
          p.vx -= 12 * bass * (1 - cohesion * 0.5);
          p.vy += (Math.random() - 0.5) * 8;
        }
      }

      // Movement Patterns ONLY apply when effective sound energy > 0
      if (effectiveEnergy > 0.01) {
        switch (pattern) {
          case 'explode': {
            if (this.shockwaveActive && config.bassExplosionForce > 0) {
              const diff = Math.abs(distFromCenter - this.bassShockwaveRadius);
              if (diff < 50) {
                const force = (1 - diff / 50) * config.bassExplosionForce * 14 * (0.6 + bass * 1.2) * motionScale;
                p.vx += Math.cos(angleFromCenter) * force;
                p.vy += Math.sin(angleFromCenter) * force;
              }
            }
            if (audio.isBeat) {
              const burst = (Math.random() * 5 + 3) * config.bassExplosionForce * bass * motionScale;
              p.vx += Math.cos(angleFromCenter) * burst;
              p.vy += Math.sin(angleFromCenter) * burst;
            }
            break;
          }

          case 'vortex': {
            const tangentX = -fromCenterY / distFromCenter;
            const tangentY = fromCenterX / distFromCenter;
            const swirlForce = vortexRate * 3.2 * (1 + bass * 1.0) * motionScale;

            p.vx += tangentX * swirlForce;
            p.vy += tangentY * swirlForce;

            if (audio.isBeat) {
              p.vx += (fromCenterX / distFromCenter) * 10 * bass * motionScale;
              p.vy += (fromCenterY / distFromCenter) * 10 * bass * motionScale;
            }
            break;
          }

          case 'spiral': {
            const armSign = p.spiralArm % 2 === 0 ? 1 : -1;
            const spiralAngle = angleFromCenter + armSign * (distFromCenter * 0.006 + timeVal * 0.6);
            const spiralTargetX = cx + Math.cos(spiralAngle) * distFromCenter;
            const spiralTargetY = cy + Math.sin(spiralAngle) * distFromCenter;

            p.vx += (spiralTargetX - p.x) * 0.08 * (1 + mid * 1.5) * motionScale;
            p.vy += (spiralTargetY - p.y) * 0.08 * (1 + mid * 1.5) * motionScale;
            break;
          }

          case 'wave-ripple': {
            const waveHeight = Math.sin(distFromCenter * 0.04 - this.ripplePhase) * 8 * (1 + bass * 1.5) * motionScale;
            p.vx += Math.cos(angleFromCenter) * waveHeight * 0.25;
            p.vy += Math.sin(angleFromCenter) * waveHeight * 0.25;
            break;
          }

          case 'chaos-turbulence': {
            const n1 = Math.sin(p.x * 0.008 + timeVal) + Math.cos(p.y * 0.008 + timeVal);
            const n2 = Math.cos(p.x * 0.015 - timeVal * 1.2) - Math.sin(p.y * 0.015 + timeVal * 0.8);
            p.vx += (n1 + n2) * 1.8 * (1 + mid * 1.5) * motionScale;
            p.vy += (n1 - n2) * 1.8 * (1 + mid * 1.5) * motionScale;
            break;
          }

          case 'quantum-glitch': {
            if (this.glitchActive || audio.isHihat) {
              const slice = Math.floor(p.y / 30);
              if (slice % 2 === 0) {
                p.vx += (Math.random() - 0.5) * 20 * (1 + treble * 1.5) * motionScale;
              }
            }
            break;
          }

          case 'gravity-fall': {
            p.vy += 1.2 * (1 + bass * 1.2) * motionScale;
            if (p.y > this.height - 20) {
              p.y = this.height - 20;
              p.vy = -Math.abs(p.vy) * 0.5;
            }
            break;
          }
        }

        // Beat-Sync FX Custom Animations
        if (audio.isBeat || audio.beatType === 'kick') {
          const kIntensity = (config.kickIntensity ?? 1.2) * (config.bassExplosionForce ?? 1.2) * motionScale;
          switch (config.kickAnim) {
            case 'dual-shockwave': {
              const push = (p.x < cx ? -8 : 8) * kIntensity * bass;
              p.vx += push;
              p.vy += (Math.random() - 0.5) * 6 * kIntensity;
              break;
            }
            case 'supernova': {
              const burst = (Math.random() * 8 + 4) * kIntensity * (0.6 + bass * 1.2);
              p.vx += Math.cos(angleFromCenter) * burst;
              p.vy += Math.sin(angleFromCenter) * burst;
              break;
            }
            case 'sonic-ring': {
              const ringDist = distFromCenter % 90;
              const ringPush = (ringDist < 45 ? 1 : -0.4) * 10 * kIntensity * bass;
              p.vx += Math.cos(angleFromCenter) * ringPush;
              p.vy += Math.sin(angleFromCenter) * ringPush;
              break;
            }
            case 'gravity-inversion': {
              const invertForce = (distFromCenter < 160 ? -12 : 16) * kIntensity * (0.6 + bass);
              p.vx += Math.cos(angleFromCenter) * invertForce;
              p.vy += Math.sin(angleFromCenter) * invertForce;
              break;
            }
            case 'bass-quake': {
              p.vx += (Math.random() - 0.5) * 18 * kIntensity * bass;
              p.vy += (Math.random() - 0.5) * 12 * kIntensity * bass;
              break;
            }
          }
        }

        if (audio.isSnare || audio.beatType === 'snare') {
          const sIntensity = (config.snareIntensity ?? 1.2) * motionScale;
          switch (config.snareAnim) {
            case 'vortex-suction': {
              const sTangX = -fromCenterY / distFromCenter;
              const sTangY = fromCenterX / distFromCenter;
              p.vx += sTangX * 14 * sIntensity * mid;
              p.vy += sTangY * 14 * sIntensity * mid;
              break;
            }
            case 'spark-shower': {
              p.vy -= (Math.random() * 16 + 6) * sIntensity * (0.6 + mid);
              p.vx += (Math.random() - 0.5) * 12 * sIntensity;
              break;
            }
            case 'chromatic-jitter': {
              p.vx += (Math.random() - 0.5) * 18 * sIntensity * (1 + mid);
              p.vy += (Math.random() - 0.5) * 18 * sIntensity * (1 + mid);
              break;
            }
          }
        }

        if (audio.isHihat || audio.beatType === 'hihat') {
          const hIntensity = (config.hihatIntensity ?? 1.2) * motionScale;
          switch (config.hihatAnim) {
            case 'stardust-twinkle': {
              const twAngle = Math.random() * Math.PI * 2;
              p.vx += Math.cos(twAngle) * (Math.random() * 10 + 4) * hIntensity * treble;
              p.vy += Math.sin(twAngle) * (Math.random() * 10 + 4) * hIntensity * treble;
              p.alpha = Math.min(1, p.alpha + 0.3);
              break;
            }
            case 'quantum-flash': {
              p.vx += (Math.random() - 0.5) * 22 * hIntensity * treble;
              p.vy += (Math.random() - 0.5) * 22 * hIntensity * treble;
              break;
            }
            case 'rain-drizzle': {
              p.vy += (Math.random() * 12 + 4) * hIntensity * treble;
              p.vx += (Math.random() - 0.5) * 4 * hIntensity;
              break;
            }
          }
        }
      }

      // Mouse & Touch Interaction (ONLY if explicitly enabled!)
      if (config.enableTouchInteraction && this.mouse.x > -9000) {
        const mdx = p.x - this.mouse.x;
        const mdy = p.y - this.mouse.y;
        const mdist = Math.hypot(mdx, mdy);
        const mouseRadius = this.mouse.isDown ? this.mouse.radius * 1.5 : this.mouse.radius;

        if (mdist < mouseRadius && mdist > 0) {
          const force = (1 - mdist / mouseRadius) * (this.mouse.isDown ? -10 : 12);
          const mAngle = Math.atan2(mdy, mdx);
          p.vx += Math.cos(mAngle) * force;
          p.vy += Math.sin(mAngle) * force;
        }
      }

      // Position integration
      p.x += p.vx * config.particleSpeed;
      p.y += p.vy * config.particleSpeed;
      p.z += p.vz * config.particleSpeed;

      // Constrain drift to protect image/text structure
      const curDist = Math.hypot(p.x - p.tx, p.y - p.ty);
      if (curDist > maxAllowedDrift) {
        const pullBack = (curDist - maxAllowedDrift) * 0.4;
        const dAngle = Math.atan2(p.y - p.ty, p.x - p.tx);
        p.x -= Math.cos(dAngle) * pullBack;
        p.y -= Math.sin(dAngle) * pullBack;
        p.vx *= 0.6;
        p.vy *= 0.6;
      }

      // Particle size modulation
      p.size = config.particleSize * (1 + bass * 0.7 + treble * 0.5);
    }
  }

  public render(ctx: CanvasRenderingContext2D, config: VisualizerConfig, audio: AudioAnalysis) {
    const pCount = this.particles.length;
    if (pCount === 0) return;

    this.updateGradientLut(config);

    ctx.save();

    const cx = this.width / 2;
    const cy = this.height / 2;

    // Camera Shake on heavy beat (only if audio is playing)
    if (config.cameraShake && audio.isBeat && audio.bass > 0.3) {
      const shakeIntensity = audio.bass * 6;
      const sx = (Math.random() - 0.5) * shakeIntensity;
      const sy = (Math.random() - 0.5) * shakeIntensity;
      ctx.translate(sx, sy);
    }

    const renderStyle: RenderStyleType = config.renderStyle || 'dots';
    const isPerf = config.performanceMode !== false;

    // Fast Blending Mode: In performance mode, 'lighter' creates brilliant cyber neon glow with zero lag!
    if (isPerf) {
      ctx.globalCompositeOperation = 'lighter';
    }

    // ================= 1. RENDER STYLE: EQUALIZER BARS (SPECTRUM) =================
    if (renderStyle === 'equalizer-bars') {
      this.renderEqualizerBars(ctx, config, audio);
    }

    // ================= 2. RENDER STYLE: CIRCULAR EQUALIZER (RADIAL RING) =================
    if (renderStyle === 'circular-equalizer') {
      this.renderCircularEqualizer(ctx, config, audio, cx, cy);
    }

    // ================= 3. RENDER STYLE: OSCILLOSCOPE WAVEFORM =================
    if (renderStyle === 'waveform') {
      this.renderWaveform(ctx, config, audio);
    }

    // ================= 4. RENDER STYLE: CONNECTED LINES / PLEXUS MESH =================
    if (renderStyle === 'lines' || renderStyle === 'cyber-mesh' || config.connectionLines) {
      this.renderConnectedLines(ctx, config, audio, renderStyle === 'cyber-mesh');
    }

    // ================= 5. RENDER PARTICLES / POINTS =================
    // Always render particles (dots) unless purely equalizer mode is selected, or render styled dots
    const skipDots = false; // Dots form the shape/text/image
    if (!skipDots) {
      const isChroma = config.chromaticAberration && (audio.isBeat || this.glitchActive);
      const chromaShift = isChroma ? 3 * audio.bass : 0;

      for (let i = 0; i < pCount; i++) {
        const p = this.particles[i];

        let renderX = p.x;
        let renderY = p.y;
        let renderSize = Math.max(0.6, p.size);

        if (config.depth3D) {
          const fov = 400;
          const scale = fov / Math.max(80, fov + p.z);
          renderX = cx + (p.x - cx) * scale;
          renderY = cy + (p.y - cy) * scale;
          renderSize = Math.max(0.6, p.size * scale);
        }

        const colorStyle = this.getFastParticleColor(p, config, audio);
        ctx.fillStyle = colorStyle;

        ctx.beginPath();
        ctx.arc(renderX, renderY, renderSize, 0, Math.PI * 2);
        ctx.fill();

        // Optional chromatic ghost on kick
        if (isChroma && chromaShift > 0) {
          ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
          ctx.beginPath();
          ctx.arc(renderX - chromaShift, renderY, renderSize * 0.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 179, 0, 0.35)';
          ctx.beginPath();
          ctx.arc(renderX + chromaShift, renderY, renderSize * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  // Optimized Batched Plexus / Constellation Lines (Zero FPS Drop)
  private renderConnectedLines(
    ctx: CanvasRenderingContext2D,
    config: VisualizerConfig,
    audio: AudioAnalysis,
    isMesh: boolean = false
  ) {
    const pCount = this.particles.length;
    const maxDist = isMesh ? config.connectionDistance * 1.3 : config.connectionDistance;
    const maxDistSq = maxDist * maxDist;
    const stride = pCount > 2500 ? 4 : pCount > 1500 ? 3 : 2;
    const checkWindow = isMesh ? 28 : 22;

    ctx.save();
    ctx.lineWidth = isMesh ? 1.0 : 0.75;
    ctx.strokeStyle = `rgba(0, 240, 255, ${0.18 + audio.bass * 0.25})`;

    ctx.beginPath();
    for (let i = 0; i < pCount; i += stride) {
      const p1 = this.particles[i];
      const maxJ = Math.min(pCount, i + checkWindow);

      for (let j = i + 1; j < maxJ; j += stride) {
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  // Real-time Audio Spectrum Equalizer Bars
  private renderEqualizerBars(
    ctx: CanvasRenderingContext2D,
    config: VisualizerConfig,
    audio: AudioAnalysis
  ) {
    const freq = audio.frequencyData;
    if (!freq || freq.length === 0) return;

    const barCount = config.equalizerBarCount || 48;
    const barWidth = (this.width / barCount) * 0.75;
    const gap = (this.width / barCount) * 0.25;
    const maxBarHeight = this.height * 0.35;
    const baseY = this.height - 20;

    ctx.save();
    for (let i = 0; i < barCount; i++) {
      const freqIndex = Math.floor((i / barCount) * (freq.length * 0.65));
      const val = freq[freqIndex] / 255;
      const barHeight = Math.max(4, val * maxBarHeight * (config.audioReactivity || 1.0));
      const x = i * (barWidth + gap) + gap / 2;
      const y = baseY - barHeight;

      // Color from LUT
      const colorIndex = Math.floor((i / barCount) * 255);
      const rgb = this.lutRgb[colorIndex] || { r: 0, g: 240, b: 255 };

      // Top glowing cap
      ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Neon tip
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y - 3, barWidth, 2);
    }
    ctx.restore();
  }

  // Circular Audio Spectrum Ring
  private renderCircularEqualizer(
    ctx: CanvasRenderingContext2D,
    config: VisualizerConfig,
    audio: AudioAnalysis,
    cx: number,
    cy: number
  ) {
    const freq = audio.frequencyData;
    if (!freq || freq.length === 0) return;

    const barCount = 64;
    const baseRadius = Math.min(this.width, this.height) * 0.32;
    const maxBarLen = Math.min(this.width, this.height) * 0.18;

    ctx.save();
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const freqIdx = Math.floor((Math.abs(i - barCount / 2) / (barCount / 2)) * (freq.length * 0.6));
      const val = freq[freqIdx] / 255;
      const barLen = Math.max(4, val * maxBarLen * (config.audioReactivity || 1.0));

      const x1 = cx + Math.cos(angle) * baseRadius;
      const y1 = cy + Math.sin(angle) * baseRadius;
      const x2 = cx + Math.cos(angle) * (baseRadius + barLen);
      const y2 = cy + Math.sin(angle) * (baseRadius + barLen);

      const colorIndex = Math.floor((i / barCount) * 255);
      const rgb = this.lutRgb[colorIndex] || { r: 0, g: 240, b: 255 };

      ctx.strokeStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Real-time Oscilloscope Waveform Ribbon
  private renderWaveform(
    ctx: CanvasRenderingContext2D,
    config: VisualizerConfig,
    audio: AudioAnalysis
  ) {
    const timeData = audio.timeDomainData;
    if (!timeData || timeData.length === 0) return;

    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#00f0ff';

    const sliceWidth = this.width / timeData.length;
    const midY = this.height * 0.78;
    const amplitude = this.height * 0.16 * (config.audioReactivity || 1.0);

    ctx.beginPath();
    for (let i = 0; i < timeData.length; i += 2) {
      const v = (timeData[i] - 128) / 128.0;
      const y = midY + v * amplitude;
      const x = i * sliceWidth;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  // High-performance Gradient & Color Evaluator using 256-entry precomputed LUT
  private getFastParticleColor(p: Particle, config: VisualizerConfig, audio: AudioAnalysis): string {
    // 1. Image sampling original colors
    if (config.shapeMode === 'image' && config.useOriginalImageColors && p.origColor) {
      const brightnessBoost = 1 + audio.treble * 0.35 + (audio.isBeat ? 0.15 : 0);
      const r = Math.min(255, Math.floor(p.origColor.r * brightnessBoost));
      const g = Math.min(255, Math.floor(p.origColor.g * brightnessBoost));
      const b = Math.min(255, Math.floor(p.origColor.b * brightnessBoost));
      return `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
    }

    // 2. Fast LUT color mapping
    const mode = config.gradientMode || 'linear-x';
    const cycleSpeed = config.gradientCycleSpeed ?? 0;
    const cycleOffset = cycleSpeed > 0 
      ? (this.time * cycleSpeed * 0.15 + (audio.isBeat ? 0.08 : 0)) % 1 
      : 0;

    let t = 0;
    switch (mode) {
      case 'linear-x':
        t = (p.x / Math.max(1, this.width)) + cycleOffset;
        break;
      case 'linear-y':
        t = (p.y / Math.max(1, this.height)) + cycleOffset;
        break;
      case 'radial': {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const dist = Math.hypot(p.x - cx, p.y - cy);
        t = (dist / (Math.hypot(cx, cy) * 0.75)) + cycleOffset;
        break;
      }
      case 'frequency': {
        const freqRatio = (p.spiralArm % 3 === 0) 
          ? audio.bass 
          : (p.spiralArm % 3 === 1) 
          ? audio.mid 
          : audio.treble;
        t = ((p.id % 200) / 200) * 0.6 + freqRatio * 0.4 + cycleOffset;
        break;
      }
      case 'particle-flow':
        t = ((p.hueOffset / 360) + cycleOffset) % 1;
        break;
      default:
        t = (p.x / Math.max(1, this.width)) + cycleOffset;
    }

    const lutIndex = Math.floor(Math.abs(t % 1) * 255);
    const rgb = this.lutRgb[lutIndex] || { r: 0, g: 240, b: 255 };

    const brightness = 1 + audio.treble * 0.3 + (audio.isBeat ? 0.15 : 0);
    const r = Math.min(255, Math.floor(rgb.r * brightness));
    const g = Math.min(255, Math.floor(rgb.g * brightness));
    const b = Math.min(255, Math.floor(rgb.b * brightness));

    return `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
  }
}
