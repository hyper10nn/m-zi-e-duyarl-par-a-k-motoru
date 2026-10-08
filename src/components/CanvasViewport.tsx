import React, { useRef, useEffect, useState, useCallback } from 'react';
import { VisualizerConfig, AudioAnalysis, AspectRatioType } from '../types';
import { ParticleEngine } from '../utils/particleEngine';
import { BackgroundRenderer } from '../utils/backgroundRenderer';
import { OverlayRenderer } from '../utils/overlayRenderer';
import { audioEngine } from '../utils/audioEngine';

interface CanvasViewportProps {
  config: VisualizerConfig;
  onAudioAnalysis: (analysis: AudioAnalysis) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  currentLyricLine?: string | null;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  config,
  onAudioAnalysis,
  canvasRef,
  currentLyricLine,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const hiddenImageRef = useRef<HTMLImageElement>(null);

  const particleEngineRef = useRef<ParticleEngine>(new ParticleEngine());
  const bgRendererRef = useRef<BackgroundRenderer>(new BackgroundRenderer());
  const overlayRendererRef = useRef<OverlayRenderer>(new OverlayRenderer());

  const [fps, setFps] = useState(60);
  const [isInteracting, setIsInteracting] = useState(false);

  // Initialize and update targets when shape/text config changes
  useEffect(() => {
    particleEngineRef.current.updateTargets(config);
  }, [
    config.shapeMode,
    config.text,
    config.fontFamily,
    config.fontSize,
    config.selectedLogo,
    config.customImageUrl,
    config.particleCount,
    config.imageSamplingMode,
    config.imageEdgeThreshold,
    config.showImageText,
    config.imageOverlayText,
  ]);

  // Video loop handling for custom background video
  useEffect(() => {
    if (config.backgroundType === 'custom-video' && config.customBgVideoUrl && hiddenVideoRef.current) {
      hiddenVideoRef.current.src = config.customBgVideoUrl;
      hiddenVideoRef.current.play().catch(() => {});
    }
  }, [config.backgroundType, config.customBgVideoUrl]);

  // Image handling for custom background image
  useEffect(() => {
    if (config.backgroundType === 'custom-image' && config.customBgImageUrl && hiddenImageRef.current) {
      hiddenImageRef.current.src = config.customBgImageUrl;
    }
  }, [config.backgroundType, config.customBgImageUrl]);

  // Compute container bounds & aspect ratio styling
  const getAspectRatioClasses = (ratio: AspectRatioType) => {
    switch (ratio) {
      case '16:9':
        return 'aspect-video max-h-[85vh] max-w-[95%] shadow-2xl';
      case '9:16':
        return 'aspect-[9/16] max-h-[85vh] max-w-[90%] shadow-2xl';
      case '1:1':
        return 'aspect-square max-h-[85vh] max-w-[90%] shadow-2xl';
      case 'full':
      default:
        return 'w-full h-full';
    }
  };

  // Main Render Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const render = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      frameCount++;
      if (now - fpsTimer >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsTimer = now;
      }

      // 1. Audio Analysis
      const audio = audioEngine.analyze();
      onAudioAnalysis(audio);

      const width = canvas.width;
      const height = canvas.height;

      // 2. Clear canvas with trail alpha fade or solid clear
      if (config.trailAlpha < 0.99) {
        ctx.fillStyle = `rgba(10, 10, 12, ${config.trailAlpha})`;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      // 3. Render Background Layer
      bgRendererRef.current.render(
        ctx,
        width,
        height,
        config,
        audio,
        hiddenImageRef.current,
        hiddenVideoRef.current
      );

      // 4. Update Particle Physics
      particleEngineRef.current.update(audio, config, dt);

      // 5. Draw Particles
      particleEngineRef.current.render(ctx, config, audio);

      // 6. Draw Typography Overlay & LRC Subtitle Banner
      overlayRendererRef.current.render(ctx, width, height, config, audio, currentLyricLine);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [config, canvasRef, onAudioAnalysis, currentLyricLine]);

  // Handle Resize of canvas to match DOM bounding client rect and selected resolution
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let dpr = 1.0;
    if (config.resolution === '2k') {
      dpr = 2.0;
    } else if (config.resolution === '1080p') {
      dpr = 1.5;
    } else {
      dpr = 1.0;
    }

    const newW = Math.floor(rect.width * dpr);
    const newH = Math.floor(rect.height * dpr);

    if (canvas.width !== newW || canvas.height !== newH) {
      canvas.width = newW;
      canvas.height = newH;
      particleEngineRef.current.resize(newW, newH);
      particleEngineRef.current.updateTargets(config);
    }
  }, [canvasRef, config]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize, config.aspectRatio, config.resolution]);

  // Mouse & Touch interaction handlers (only active if enableTouchInteraction is turned on)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!config.enableTouchInteraction) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    particleEngineRef.current.setMouse(x, y, isInteracting);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!config.enableTouchInteraction) return;
    setIsInteracting(true);
    handlePointerMove(e);
  };

  const handlePointerUp = () => {
    if (!config.enableTouchInteraction) return;
    setIsInteracting(false);
    particleEngineRef.current.clearMouse();
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full w-full bg-neutral-950 flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none"
    >
      {/* Hidden background elements for decoding */}
      <video
        ref={hiddenVideoRef}
        loop
        muted
        playsInline
        crossOrigin="anonymous"
        className="hidden"
      />
      <img
        ref={hiddenImageRef}
        crossOrigin="anonymous"
        alt="Background source"
        className="hidden"
      />

      {/* Main Canvas Frame with Aspect Ratio */}
      <div
        className={`relative flex items-center justify-center rounded-xl overflow-hidden border border-neutral-800/80 bg-neutral-950 ${getAspectRatioClasses(
          config.aspectRatio
        )}`}
      >
        <canvas
          ref={canvasRef as React.RefObject<HTMLCanvasElement>}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`w-full h-full object-contain ${config.enableTouchInteraction ? 'cursor-crosshair' : 'cursor-default'} touch-none`}
        />

        {/* Minimal HUD overlay on canvas */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none flex-wrap max-w-[90%]">
          <div className="px-2 py-0.5 rounded bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-400 font-semibold">
            {fps} FPS
          </div>
          <div className="px-2 py-0.5 rounded bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-mono text-neutral-300">
            {config.particleCount} Parçacık
          </div>
          <div className="px-2 py-0.5 rounded bg-cyan-950/70 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono text-cyan-300 uppercase">
            {config.renderStyle || 'dots'}
          </div>
          <div className="px-2 py-0.5 rounded bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-mono text-amber-300 uppercase">
            Tutarlılık: %{Math.round((config.shapeCohesion ?? 0.85) * 100)}
          </div>
          <div className="px-2 py-0.5 rounded bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-mono text-neutral-400 uppercase">
            {config.resolution}
          </div>
        </div>

        {/* Helper bottom hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none opacity-50 hover:opacity-90 transition-opacity">
          <p className="text-[10px] text-neutral-400 font-['Plus_Jakarta_Sans',sans-serif] bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
            {config.enableTouchInteraction 
              ? '✨ Dokunma & Fare Etkileşimi Aktif' 
              : '🛡️ Şekil Koruma Aktif (Dokunarak dağılmaz, tutarlı ritim)'}
          </p>
        </div>
      </div>
    </div>
  );
};
