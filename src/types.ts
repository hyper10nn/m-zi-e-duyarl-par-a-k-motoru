export type ShapeMode = 
  | 'text' 
  | 'image' 
  | 'preset-logo' 
  | 'saturn' 
  | 'dna' 
  | 'infinity' 
  | 'diamond' 
  | 'equalizer-cylinder' 
  | 'pulsar' 
  | 'galaxy' 
  | 'circle' 
  | 'wave' 
  | 'heart' 
  | 'fireworks';

export type MovementPattern = 
  | 'auto-beat' 
  | 'explode' 
  | 'vortex' 
  | 'spiral' 
  | 'wave-ripple' 
  | 'chaos-turbulence' 
  | 'quantum-glitch' 
  | 'gravity-fall';

export type KickAnimation = 
  | 'dual-shockwave' 
  | 'supernova' 
  | 'sonic-ring' 
  | 'gravity-inversion' 
  | 'bass-quake';

export type SnareAnimation = 
  | 'vortex-suction' 
  | 'spiral-twister' 
  | 'spark-shower' 
  | 'chromatic-jitter';

export type HihatAnimation = 
  | 'stardust-twinkle' 
  | 'laser-beams' 
  | 'quantum-flash' 
  | 'rain-drizzle';

export type AspectRatioType = '16:9' | '9:16' | '1:1' | 'full';

export type BackgroundType = 
  | 'video-cyber-city' 
  | 'video-nebula' 
  | 'video-techno-tunnel' 
  | 'video-liquid-chrome' 
  | 'video-black-hole' 
  | 'video-matrix-rain' 
  | 'video-hyper-grid' 
  | 'video-deep-ocean' 
  | 'procedural-stars' 
  | 'procedural-grid' 
  | 'procedural-aurora' 
  | 'custom-image' 
  | 'custom-video' 
  | 'none';

export type ColorTheme = 
  | 'rma'
  | 'cyber' 
  | 'sunset' 
  | 'aurora' 
  | 'violet' 
  | 'ice' 
  | 'gold' 
  | 'original';

export type ResolutionType = '720p' | '1080p' | '2k';

export type LayoutMode = 'top-preview' | 'side-by-side';

export type ImageSamplingMode = 'all-pixels' | 'edges-only' | 'contour' | 'grid-slice' | 'shatter-explode';

export interface GradientStop {
  id: string;
  offset: number; // 0.0 to 1.0
  color: string;  // Hex color e.g. '#00f0ff'
}

export type GradientMode = 
  | 'linear-x' 
  | 'linear-y' 
  | 'radial' 
  | 'frequency' 
  | 'particle-flow';

export type RenderStyleType = 
  | 'dots' 
  | 'lines' 
  | 'equalizer-bars' 
  | 'circular-equalizer' 
  | 'waveform' 
  | 'cyber-mesh';

export interface VisualizerConfig {
  // Layout & Resolution
  resolution: ResolutionType;
  layoutMode: LayoutMode;
  fps: 30 | 60;
  performanceMode: boolean; // Ultra-fast 60 FPS batched rendering mode (eliminates canvas lag)

  // Visualizer Render Style (Points, Connected Lines, Audio Equalizers)
  renderStyle: RenderStyleType;
  equalizerBarCount?: number;

  // Touch & Pointer Interaction
  enableTouchInteraction: boolean; // When false, touching or dragging pointer will NOT scatter particles

  // Audio Stability, Noise Gate & Shape Cohesion
  shapeCohesion: number; // 0.1 to 1.0: Keeps text, images, and shapes intact without scattering uncontrollably
  noiseGate: number; // 0.0 to 0.25: Eliminates particle jitter when no music/sound is playing

  // Shape & Text
  shapeMode: ShapeMode;
  text: string;
  fontFamily: string;
  fontSize: number;
  selectedLogo: string;
  customImageUrl: string | null;
  customImageName: string | null;

  // Image & Structure Shaping
  imageSamplingMode: ImageSamplingMode;
  imageEdgeThreshold: number; // 20 to 120
  imageOverlayText: string;
  showImageText: boolean;

  // Beat-Sync FX Custom Animations
  kickAnim: KickAnimation;
  snareAnim: SnareAnimation;
  hihatAnim: HihatAnimation;
  kickIntensity: number; // 0.5 to 3.0
  snareIntensity: number; // 0.5 to 3.0
  hihatIntensity: number; // 0.5 to 3.0

  // Lyric / Word Sequence Mode
  lyricSequenceMode: boolean;
  lyricWords: string; // e.g. "PULSE, BASS, DROP, ENERGY"
  lyricChangeOnBeat: boolean;
  lyricEmojiPrefix: boolean;

  // LRC / Altyazı Zaman Çizelgesi (Timestamped .lrc Millisecond-accurate Sync)
  lrcEnabled: boolean;
  lrcContent: string;
  lrcSyncParticles: boolean; // Morph particles into current LRC active lyric line
  lrcShowSubtitleOverlay: boolean; // Show stylized subtitle banner at bottom
  lrcTimeOffsetMs: number; // Calibration offset in ms (-2000 to +2000)

  // Movement Patterns & Dynamic Beat Physics
  movementPattern: MovementPattern;
  vortexSpeed: number; // swirl rate (-3 to 3)
  pulseFrequency: number; // Scales particle attraction / return speed based on audio 'energy' (0 to 3.0)
  beatExplosionForce: number; // multiplier for kick blasts
  cameraShake: boolean; // screen shake on heavy beat
  chromaticAberration: boolean; // RGB color split on beat
  dualRmaShockwave: boolean; // Cyan & Gold dual shockwaves colliding on bass
  depth3D: boolean; // 3D perspective depth towards camera

  // Frequency EQ Multipliers
  bassBoost: number; // 0.2 to 2.5
  midBoost: number; // 0.2 to 2.5
  trebleBoost: number; // 0.2 to 2.5

  // Particle Physics & Appearance
  particleCount: number;
  particleSize: number;
  particleSpeed: number;
  audioReactivity: number; // 0 to 2 multiplier
  bassExplosionForce: number; // how violently particles burst on kick
  connectionLines: boolean; // plexus lines
  connectionDistance: number;
  trailAlpha: number; // 0.05 to 1 (lower = longer light trails)
  colorTheme?: ColorTheme; // legacy theme compatibility
  gradientStops: GradientStop[]; // Dynamic multi-color palette
  gradientMode: GradientMode; // Spatial or frequency mapping
  gradientCycleSpeed: number; // 0 (static) to 3.0 (dynamic tempo-synced color cycle)
  useOriginalImageColors?: boolean; // When custom image loaded, preserve original pixel colors
  glowStrength: number;
  shapeMorphSpeed: number; // lerp ease factor

  // Background Shaping & Styling
  backgroundType: BackgroundType;
  customBgImageUrl: string | null;
  customBgVideoUrl: string | null;
  bgOpacity: number; // 0 to 1
  bgBlur: number; // 0 to 20 px
  bgBeatZoom: boolean; // scales background on bass kick
  bgBrightness: number; // 0.2 to 1.5
  bgHueRotate: number; // 0 to 360 deg
  bgContrast: number; // 0.5 to 2.0
  bgSaturation: number; // 0 to 2.5
  bgKaleidoscope: boolean;
  bgScanlines: boolean;

  // Branding & Watermark
  showRmaWatermark: boolean; // Clean RMAFX logo on bottom right only

  // Typography Overlay
  showTextOverlay: boolean;
  overlayTitle: string;
  overlaySubtitle: string;
  overlayFont: string;
  overlayStyle: 'neon' | 'minimal' | 'kinetic' | 'outline';
  overlayColor: string;

  // Aspect ratio
  aspectRatio: AspectRatioType;
}

export interface AudioAnalysis {
  bass: number;       // 0 - 1
  mid: number;        // 0 - 1
  treble: number;     // 0 - 1
  energy: number;     // 0 - 1
  isBeat: boolean;    // bass peak threshold trigger (Kick)
  isSnare: boolean;   // mid peak trigger (Snare)
  isHihat: boolean;   // treble peak trigger (Hihat)
  beatType: 'kick' | 'snare' | 'hihat' | 'none';
  bpm: number;        // Real-time detected tempo BPM
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
}
