import React, { useState, useRef, useCallback, useEffect } from 'react';
import { VisualizerConfig, AudioAnalysis, AspectRatioType, ResolutionType, LayoutMode } from './types';
import { TopNav } from './components/TopNav';
import { CanvasViewport } from './components/CanvasViewport';
import { StudioControls } from './components/StudioControls';
import { AudioBar } from './components/AudioBar';
import { videoRecorder } from './utils/recorder';
import { audioEngine } from './utils/audioEngine';
import { DEFAULT_RMA_GRADIENT } from './utils/gradientPresets';
import { SAMPLE_LRC_CYBERWAVE, parseLrc } from './utils/lrcParser';
import { Instagram, ExternalLink, X, Sparkles, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<VisualizerConfig>({
    // Layout & Resolution
    resolution: '1080p',
    layoutMode: 'top-preview', // User requested: Preview on Top, Controls on Bottom
    fps: 60,
    performanceMode: true, // 60 FPS turbo rendering mode (eliminates canvas lag)

    // Visualizer Render Style & Stability
    renderStyle: 'dots',
    equalizerBarCount: 48,
    enableTouchInteraction: false, // User requested: don't move when touched/hovered
    shapeCohesion: 0.85, // High shape cohesion: texts/images stay crisp and coherent
    noiseGate: 0.05, // Eliminates idle jitter when no music is playing

    // Shape & Text
    shapeMode: 'preset-logo',
    text: 'RMAFX',
    fontFamily: 'Syne',
    fontSize: 110,
    selectedLogo: 'rma', // Default to RMA Official Logo
    customImageUrl: null,
    customImageName: null,

    // Image & Structure Shaping
    imageSamplingMode: 'all-pixels',
    imageEdgeThreshold: 35,
    imageOverlayText: 'RMAFX',
    showImageText: false,

    // Beat-Sync FX Custom Animations
    kickAnim: 'dual-shockwave',
    snareAnim: 'vortex-suction',
    hihatAnim: 'stardust-twinkle',
    kickIntensity: 1.2,
    snareIntensity: 1.2,
    hihatIntensity: 1.2,

    // Lyric / Word Sequence Mode
    lyricSequenceMode: false,
    lyricWords: 'RMA, BASS, DROP, PULSE, ENERGY',
    lyricChangeOnBeat: true,
    lyricEmojiPrefix: true,

    // LRC / Altyazı Zaman Çizelgesi
    lrcEnabled: false,
    lrcContent: SAMPLE_LRC_CYBERWAVE,
    lrcSyncParticles: true,
    lrcShowSubtitleOverlay: true,
    lrcTimeOffsetMs: 0,

    // Movement Patterns & Dynamic Beat Physics
    movementPattern: 'auto-beat',
    vortexSpeed: 1.2,
    pulseFrequency: 1.2,
    beatExplosionForce: 1.2,
    cameraShake: true,
    chromaticAberration: true,
    dualRmaShockwave: true,
    depth3D: true,
    bassBoost: 1.2,
    midBoost: 1.0,
    trebleBoost: 1.0,

    // Particle Physics
    particleCount: 2600,
    particleSize: 2.2,
    particleSpeed: 1.0,
    audioReactivity: 1.2,
    bassExplosionForce: 1.2,
    connectionLines: false,
    connectionDistance: 28,
    trailAlpha: 0.45,
    colorTheme: 'rma', // Default to RMA Cyan & Gold dual-tone
    gradientStops: DEFAULT_RMA_GRADIENT,
    gradientMode: 'linear-x',
    gradientCycleSpeed: 0.3,
    useOriginalImageColors: false,
    glowStrength: 12,
    shapeMorphSpeed: 1.0,

    // Background
    backgroundType: 'video-cyber-city',
    customBgImageUrl: null,
    customBgVideoUrl: null,
    bgOpacity: 0.85,
    bgBlur: 2,
    bgBeatZoom: true,
    bgBrightness: 1.0,
    bgContrast: 1.0,
    bgSaturation: 1.0,
    bgHueRotate: 0,
    bgKaleidoscope: false,
    bgScanlines: false,

    // Branding & Watermark (Bottom-right RMAFX watermark only)
    showRmaWatermark: true,

    // Typography Overlay
    showTextOverlay: false,
    overlayTitle: 'RMAFX',
    overlaySubtitle: 'OFFICIAL AUDIO PARTICLE STUDIO',
    overlayFont: 'Syne',
    overlayStyle: 'neon',
    overlayColor: '#00f0ff',

    // Aspect ratio
    aspectRatio: '16:9',
  });

  const [activeTab, setActiveTab] = useState<string>('shape');
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimerSeconds, setRecordTimerSeconds] = useState(0);
  const [isCountdownRecord, setIsCountdownRecord] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysis>({
    bass: 0,
    mid: 0,
    treble: 0,
    energy: 0,
    isBeat: false,
    isSnare: false,
    isHihat: false,
    beatType: 'none',
    bpm: 124,
    frequencyData: new Uint8Array(256),
    timeDomainData: new Uint8Array(256),
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastLyricWordTime = useRef<number>(0);
  const lyricIndexRef = useRef<number>(0);
  const [currentLyricLine, setCurrentLyricLine] = useState<string | null>(null);
  const lastActiveLrcLineText = useRef<string | null>(null);

  // Parse LRC lines cache whenever lrcContent changes
  const parsedLrc = React.useMemo(() => {
    return parseLrc(config.lrcContent || SAMPLE_LRC_CYBERWAVE);
  }, [config.lrcContent]);

  // Synchronize active LRC line with audio engine millisecond clock
  useEffect(() => {
    if (!config.lrcEnabled) {
      setCurrentLyricLine(null);
      return;
    }

    const unsub = audioEngine.subscribe(() => {
      const curTime = audioEngine.currentTime + (config.lrcTimeOffsetMs || 0) / 1000;
      const lines = parsedLrc.lines;
      let matchedLine: string | null = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextTime = lines[i + 1]?.time ?? (line.time + 6.0);
        if (curTime >= line.time && curTime < nextTime) {
          matchedLine = line.text;
          break;
        }
      }

      if (matchedLine !== lastActiveLrcLineText.current) {
        lastActiveLrcLineText.current = matchedLine;
        setCurrentLyricLine(matchedLine);

        // If particle text syncing is enabled and we have a new line, morph particles to this line
        if (matchedLine && config.lrcSyncParticles) {
          setConfig((prev) => ({
            ...prev,
            shapeMode: 'text',
            text: matchedLine!,
          }));
        }
      }
    });

    return () => unsub();
  }, [config.lrcEnabled, config.lrcSyncParticles, config.lrcTimeOffsetMs, parsedLrc]);

  const handleConfigChange = (partial: Partial<VisualizerConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  // Live Keyboard VJ Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        audioEngine.triggerManualBeat('kick');
      } else if (e.key === 'v' || e.key === 'V') {
        audioEngine.triggerManualBeat('snare');
      } else if (e.key === 's' || e.key === 'S') {
        handleConfigChange({ movementPattern: 'spiral' });
      } else if (e.key === 'g' || e.key === 'G') {
        audioEngine.triggerManualBeat('hihat');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTakeSnapshot = () => {
    if (canvasRef.current) {
      videoRecorder.takeSnapshot(
        canvasRef.current,
        `rmafx_${config.selectedLogo}_${config.resolution}`
      );
    }
  };

  const handleStartRecord = (durationSeconds: number = 0) => {
    if (!canvasRef.current || isRecording) return;

    if (!audioEngine.isPlaying) {
      audioEngine.playBuiltin('cyberwave');
    }

    setIsRecording(true);
    setIsCountdownRecord(durationSeconds > 0);
    setRecordTimerSeconds(durationSeconds > 0 ? durationSeconds : 0);

    videoRecorder.startRecording(
      canvasRef.current,
      durationSeconds,
      config.resolution,
      config.fps || 60,
      (val, countdown) => {
        setRecordTimerSeconds(val);
        setIsCountdownRecord(countdown);
      },
      () => setIsRecording(false)
    );
  };

  const handleStopRecord = () => {
    videoRecorder.stopRecording();
    setIsRecording(false);
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      handleStopRecord();
    } else {
      handleStartRecord(0); // Default to unlimited recording
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleAspectRatioChange = (ratio: AspectRatioType) => {
    handleConfigChange({ aspectRatio: ratio });
  };

  const handleResolutionChange = (res: ResolutionType) => {
    handleConfigChange({ resolution: res });
  };

  const handleLayoutModeChange = (mode: LayoutMode) => {
    handleConfigChange({ layoutMode: mode });
  };

  const handleAudioAnalysis = useCallback((analysis: AudioAnalysis) => {
    setAudioAnalysis(analysis);

    // Lyric / Word Sequence Advancement on beat
    if (config.lyricSequenceMode && analysis.isBeat) {
      const now = performance.now();
      if (now - lastLyricWordTime.current > 1800) {
        lastLyricWordTime.current = now;
        const words = config.lyricWords
          .split(',')
          .map((w) => w.trim())
          .filter(Boolean);

        if (words.length > 0) {
          lyricIndexRef.current = (lyricIndexRef.current + 1) % words.length;
          let nextWord = words[lyricIndexRef.current];
          if (config.lyricEmojiPrefix) {
            const emojis = ['⚡', '🔥', '💎', '🚀', '👑', '🌌', '🪐', '🎵'];
            const emoji = emojis[lyricIndexRef.current % emojis.length];
            if (!nextWord.startsWith('⚡') && !nextWord.startsWith('🔥') && !nextWord.startsWith('💎')) {
              nextWord = `${emoji} ${nextWord}`;
            }
          }
          setConfig((prev) => ({
            ...prev,
            shapeMode: 'text',
            text: nextWord,
          }));
        }
      }
    }
  }, [config.lyricSequenceMode, config.lyricWords, config.lyricEmojiPrefix]);

  // Format timer text for UI
  const formatTimer = () => {
    if (isCountdownRecord) {
      return `${recordTimerSeconds}s Kalan`;
    }
    const mins = Math.floor(recordTimerSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (recordTimerSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs} (Canlı)`;
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-950 text-neutral-100 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Bar with RMAFX Branding, Layout & Resolution Switchers */}
      <TopNav
        aspectRatio={config.aspectRatio}
        onAspectRatioChange={handleAspectRatioChange}
        resolution={config.resolution}
        onResolutionChange={handleResolutionChange}
        fps={config.fps}
        onFpsChange={(newFps) => handleConfigChange({ fps: newFps })}
        layoutMode={config.layoutMode}
        onLayoutModeChange={handleLayoutModeChange}
        onTakeSnapshot={handleTakeSnapshot}
        onToggleRecord={handleToggleRecord}
        isRecording={isRecording}
        recordTimerText={formatTimer()}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Workspace Body: Switchable between Top-Preview (Default) and Side-by-Side */}
      {config.layoutMode === 'top-preview' ? (
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Top Preview Canvas Viewport */}
          <div className="flex-1 w-full overflow-hidden relative min-h-0 flex items-center justify-center">
            <CanvasViewport
              config={config}
              onAudioAnalysis={handleAudioAnalysis}
              canvasRef={canvasRef}
              currentLyricLine={currentLyricLine}
            />
          </div>

          {/* Bottom Production Controls Deck */}
          <StudioControls
            config={config}
            onChange={handleConfigChange}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onTakeSnapshot={handleTakeSnapshot}
            onStartRecord={handleStartRecord}
            onStopRecord={handleStopRecord}
            isRecording={isRecording}
            recordTimerText={formatTimer()}
            layoutMode="top-preview"
            currentLyricLine={currentLyricLine}
          />
        </main>
      ) : (
        <main className="flex-1 flex flex-row overflow-hidden relative">
          {/* Left Canvas Viewport */}
          <CanvasViewport
            config={config}
            onAudioAnalysis={handleAudioAnalysis}
            canvasRef={canvasRef}
            currentLyricLine={currentLyricLine}
          />

          {/* Right Studio Controls Drawer */}
          <StudioControls
            config={config}
            onChange={handleConfigChange}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onTakeSnapshot={handleTakeSnapshot}
            onStartRecord={handleStartRecord}
            onStopRecord={handleStopRecord}
            isRecording={isRecording}
            recordTimerText={formatTimer()}
            layoutMode="side-by-side"
            currentLyricLine={currentLyricLine}
          />
        </main>
      )}

      {/* Bottom Audio Transport & Realtime Frequency Bar */}
      <AudioBar audioAnalysis={audioAnalysis} />

      {/* ================= HAKKINDA / GELİŞTİRİCİ MODAL (RIDVAN ALTINAY) ================= */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-5 text-neutral-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-amber-400 p-[1.5px] flex items-center justify-center">
                  <div className="w-full h-full bg-neutral-950 rounded-[6px] flex items-center justify-center">
                    <span className="font-['Syne',sans-serif] font-black text-xs text-white">RMA</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-base font-['Syne',sans-serif]">
                    RMAFX Studio
                  </h3>
                  <p className="text-neutral-400 text-xs">Hakkında & Geliştirici Bilgileri</p>
                </div>
              </div>
              <button
                onClick={() => setIsAboutOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Developer Card: Rıdvan Altınay */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-950/80 to-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-amber-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center text-white font-bold font-['Syne',sans-serif] text-sm">
                      RA
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-white font-bold text-sm tracking-wide">Rıdvan Altınay</h4>
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-xs text-neutral-400">Geliştirici & Tasarımcı</p>
                  </div>
                </div>
              </div>

              {/* Instagram Link Button */}
              <a
                href="https://instagram.com/ridvanaltinay"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-neutral-900 hover:from-pink-900/60 border border-pink-700/40 hover:border-pink-500 text-white transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Instagram className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="block text-xs font-semibold text-pink-300">Instagram</span>
                    <span className="block text-[11px] text-neutral-400 font-mono">@ridvanaltinay</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
              </a>
            </div>

            {/* Interactive Particle Morph Actions */}
            <div className="space-y-2 pt-1">
              <label className="block text-neutral-400 text-xs font-medium">
                Parçacık Efekti Olarak Göster:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleConfigChange({
                      shapeMode: 'text',
                      text: 'RIDVAN\nALTINAY',
                      fontFamily: 'Syne',
                      fontSize: 90,
                      colorTheme: 'rma',
                      gradientStops: DEFAULT_RMA_GRADIENT,
                    });
                    audioEngine.triggerManualBeat('kick');
                    setIsAboutOpen(false);
                  }}
                  className="p-2.5 bg-neutral-800 hover:bg-neutral-700 hover:border-cyan-400 border border-neutral-700 rounded-xl text-left transition-all group"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="block text-white font-bold text-xs">Rıdvan Altınay</span>
                  <span className="block text-[10px] text-neutral-400 mt-0.5">Parçacıkla Yazdır</span>
                </button>

                <button
                  onClick={() => {
                    handleConfigChange({
                      shapeMode: 'preset-logo',
                      selectedLogo: 'rma',
                      colorTheme: 'rma',
                      gradientStops: DEFAULT_RMA_GRADIENT,
                    });
                    audioEngine.triggerManualBeat('kick');
                    setIsAboutOpen(false);
                  }}
                  className="p-2.5 bg-neutral-800 hover:bg-neutral-700 hover:border-amber-400 border border-neutral-700 rounded-xl text-left transition-all group"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="block text-white font-bold text-xs">RMAFX Logo</span>
                  <span className="block text-[10px] text-neutral-400 mt-0.5">Parçacıkla Çizdir</span>
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsAboutOpen(false)}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
