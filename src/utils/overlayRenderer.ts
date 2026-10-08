import { AudioAnalysis, VisualizerConfig } from '../types';

export class OverlayRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: VisualizerConfig,
    audio: AudioAnalysis,
    currentLyricLine?: string | null
  ) {
    // 1. Synchronized LRC Subtitle Banner (if enabled and present)
    if (config.lrcEnabled && config.lrcShowSubtitleOverlay && currentLyricLine) {
      ctx.save();
      const cx = width / 2;
      const subtitleY = height * 0.88; // Lower center banner

      const fontSize = Math.max(16, Math.floor(width * 0.026));
      ctx.font = `700 ${fontSize}px "Syne", "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const metrics = ctx.measureText(currentLyricLine);
      const textWidth = metrics.width;
      const paddingX = Math.max(18, fontSize * 1.1);
      const boxH = fontSize * 1.8;
      const boxW = textWidth + paddingX * 2;
      const boxX = cx - boxW / 2;
      const boxY = subtitleY - boxH / 2;

      // Dark translucent pill badge with cyan border
      ctx.fillStyle = 'rgba(10, 10, 15, 0.78)';
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, boxH / 2);
      ctx.fill();

      // Audio reactive border glow
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 + (audio.energy || 0) * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8 * (1 + audio.bass);
      ctx.stroke();

      // Dynamic text fill with neon energy glow
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10 * (1 + audio.energy);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(currentLyricLine, cx, subtitleY);

      ctx.restore();
    }

    // 2. Optional Custom Typography Overlay (only if explicitly enabled)
    if (config.showTextOverlay && (config.overlayTitle || config.overlaySubtitle)) {
      ctx.save();
      const cx = width / 2;
      const cy = height * 0.82; // Position in lower visual third

      const baseColor = config.overlayColor || '#ffffff';
      const font = config.overlayFont || 'Syne';

      // Kinetic beat bounce
      let scale = 1.0;
      if (config.overlayStyle === 'kinetic' && audio.isBeat) {
        scale = 1.08;
      }

      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      // Title styling
      if (config.overlayTitle) {
        const titleSize = Math.max(18, Math.floor(width * 0.038));
        ctx.font = `800 ${titleSize}px "${font}", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (config.overlayStyle === 'neon') {
          // Multi-pass neon glow
          ctx.shadowColor = baseColor;
          ctx.shadowBlur = 18 * (1 + audio.bass);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(config.overlayTitle.toUpperCase(), 0, 0);

          ctx.strokeStyle = baseColor;
          ctx.lineWidth = 2;
          ctx.strokeText(config.overlayTitle.toUpperCase(), 0, 0);
        } else if (config.overlayStyle === 'outline') {
          ctx.strokeStyle = baseColor;
          ctx.lineWidth = 2.5;
          ctx.strokeText(config.overlayTitle.toUpperCase(), 0, 0);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillText(config.overlayTitle.toUpperCase(), 0, 0);
        } else {
          // Minimal or Kinetic
          ctx.fillStyle = baseColor;
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 12;
          ctx.fillText(config.overlayTitle.toUpperCase(), 0, 0);
        }
      }

      // Subtitle styling
      if (config.overlaySubtitle) {
        const subSize = Math.max(11, Math.floor(width * 0.016));
        ctx.font = `500 ${subSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowBlur = 4;
        ctx.fillText(config.overlaySubtitle.toUpperCase(), 0, 26);
      }

      ctx.restore();
    }

    // 2. Clean RMAFX Watermark strictly on the bottom-right corner
    if (config.showRmaWatermark !== false) {
      ctx.save();
      const margin = Math.max(16, Math.floor(width * 0.022));
      const wmX = width - margin;
      const wmY = height - margin;

      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      const wmFontSize = Math.max(12, Math.floor(width * 0.015));

      ctx.font = `800 ${wmFontSize}px "Syne", sans-serif`;
      ctx.shadowColor = 'rgba(0, 229, 255, 0.7)';
      ctx.shadowBlur = 8 * (1 + audio.bass * 0.9);

      // Translucent white with cyan glow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fillText('RMAFX', wmX, wmY);

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.strokeText('RMAFX', wmX, wmY);

      ctx.restore();
    }
  }
}
