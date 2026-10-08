import React, { useState } from 'react';
import {
  Palette,
  Plus,
  Trash2,
  ArrowLeftRight,
  Shuffle,
  Sparkles,
  Sliders,
  Radio,
  Check,
  Zap,
} from 'lucide-react';
import { GradientStop, GradientMode, VisualizerConfig } from '../types';
import {
  GRADIENT_PRESETS,
  DEFAULT_RMA_GRADIENT,
  generateCssGradient,
  evaluateGradient,
  rgbToHex,
  VIBRANT_COLOR_SWATCHES,
} from '../utils/gradientPresets';

interface GradientEditorProps {
  config: VisualizerConfig;
  onChange: (patch: Partial<VisualizerConfig>) => void;
}

export const GradientEditor: React.FC<GradientEditorProps> = ({ config, onChange }) => {
  const stops: GradientStop[] =
    config.gradientStops && config.gradientStops.length > 0
      ? config.gradientStops
      : DEFAULT_RMA_GRADIENT;

  const [activeStopId, setActiveStopId] = useState<string>(stops[0]?.id || 'stop-1');

  const activeStop = stops.find((s) => s.id === activeStopId) || stops[0];

  const updateStops = (newStops: GradientStop[]) => {
    // Keep stops sorted by offset
    const sorted = [...newStops].sort((a, b) => a.offset - b.offset);
    onChange({ gradientStops: sorted });
  };

  const handleColorChange = (newColor: string) => {
    if (!activeStop) return;
    const updated = stops.map((s) => (s.id === activeStop.id ? { ...s, color: newColor } : s));
    updateStops(updated);
  };

  const handleOffsetChange = (newOffset: number) => {
    if (!activeStop) return;
    const clamped = Math.max(0, Math.min(1, newOffset));
    const updated = stops.map((s) => (s.id === activeStop.id ? { ...s, offset: clamped } : s));
    updateStops(updated);
  };

  const handleAddStopAtOffset = (offset: number) => {
    const clampedOffset = Math.max(0, Math.min(1, offset));
    // Sample interpolated color at this offset
    const rgb = evaluateGradient(clampedOffset, stops);
    const newColor = rgbToHex(rgb.r, rgb.g, rgb.b);
    const newId = `stop-${Date.now()}`;
    const newStop: GradientStop = {
      id: newId,
      offset: Number(clampedOffset.toFixed(2)),
      color: newColor,
    };
    const updated = [...stops, newStop];
    updateStops(updated);
    setActiveStopId(newId);
  };

  const handleAddStop = () => {
    if (stops.length >= 8) return; // Limit to 8 stops for optimal UX
    // Find biggest gap between existing stops or append near middle
    const sorted = [...stops].sort((a, b) => a.offset - b.offset);
    let bestOffset = 0.5;
    let maxGap = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].offset - sorted[i].offset;
      if (gap > maxGap) {
        maxGap = gap;
        bestOffset = (sorted[i].offset + sorted[i + 1].offset) / 2;
      }
    }
    handleAddStopAtOffset(bestOffset);
  };

  const handleDeleteActiveStop = () => {
    if (stops.length <= 2) return; // Minimum 2 stops required for gradient
    const filtered = stops.filter((s) => s.id !== activeStop?.id);
    updateStops(filtered);
    if (filtered.length > 0) {
      setActiveStopId(filtered[0].id);
    }
  };

  const handleInvertPalette = () => {
    const inverted = stops.map((s) => ({
      ...s,
      offset: Number((1.0 - s.offset).toFixed(2)),
    }));
    updateStops(inverted);
  };

  const handleRandomizeHarmonious = () => {
    const randomPreset = GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)];
    if (randomPreset) {
      applyPreset(randomPreset.stops);
    }
  };

  const applyPreset = (presetStops: GradientStop[]) => {
    const cloned = presetStops.map((s, idx) => ({
      ...s,
      id: `stop-${idx}-${Date.now()}`,
    }));
    onChange({ gradientStops: cloned });
    if (cloned.length > 0) {
      setActiveStopId(cloned[0].id);
    }
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only add if clicking on track itself, not a handle
    if ((e.target as HTMLElement).dataset.handle) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    handleAddStopAtOffset(ratio);
  };

  const gradientModes: { id: GradientMode; label: string; desc: string; icon: string }[] = [
    { id: 'linear-x', label: '↔️ Yatay (X)', desc: 'Soldan sağa uzanan degrade', icon: '↔️' },
    { id: 'linear-y', label: '↕️ Dikey (Y)', desc: 'Yukarıdan aşağıya uzanan degrade', icon: '↕️' },
    { id: 'radial', label: '🔘 Radyal', desc: 'Merkezden dış kenarlara dairesel', icon: '🔘' },
    { id: 'frequency', label: '🎵 Frekans / Spektrum', desc: 'Bas=Kök, Mid=Gövde, Tiz=Uçlar', icon: '🎵' },
    { id: 'particle-flow', label: '🌊 Parçacık Akışı', desc: 'Parçacıkların hareket ekseninde akar', icon: '🌊' },
  ];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-amber-500/20 border border-neutral-700">
            <Palette className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              Özel Degrade & Renk Paleti Editörü
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                PRO
              </span>
            </h4>
            <p className="text-[10px] text-neutral-400">
              Parçacıklar için çok renkli canlı palet tasarlayın
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleInvertPalette}
            title="Degradeyi Tersine Çevir"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRandomizeHarmonious}
            title="Rastgele Uyumlu Palet Seç"
            className="p-1.5 text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleAddStop}
            disabled={stops.length >= 8}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors disabled:opacity-40"
          >
            <Plus className="w-3 h-3" />
            <span>Renk Ekle</span>
          </button>
        </div>
      </div>

      {/* Visual Interactive Gradient Track & Pins */}
      <div className="space-y-2 p-3 bg-neutral-900/70 rounded-xl border border-neutral-800">
        <div className="flex justify-between items-center text-[10px] text-neutral-400">
          <span>İz Üzerine Tıklayarak Yeni Renk Ekleyin</span>
          <span className="font-mono text-cyan-400">{stops.length} Renk Noktası</span>
        </div>

        {/* Gradient Bar with Pins */}
        <div className="relative pt-2 pb-6 select-none">
          {/* Background Gradient Bar */}
          <div
            onClick={handleTrackClick}
            className="w-full h-7 rounded-lg shadow-inner cursor-crosshair relative border border-neutral-700/80 overflow-hidden"
            style={{
              background: generateCssGradient(stops),
            }}
          />

          {/* Draggable / Clickable Color Pins */}
          {stops.map((stop) => {
            const isSelected = stop.id === activeStop?.id;
            return (
              <div
                key={stop.id}
                data-handle="true"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStopId(stop.id);
                }}
                className={`absolute bottom-0 -translate-x-1/2 flex flex-col items-center cursor-pointer group transition-transform ${
                  isSelected ? 'z-20 scale-110' : 'z-10 hover:scale-105'
                }`}
                style={{ left: `${stop.offset * 100}%` }}
              >
                {/* Pointer Arrow */}
                <div
                  className={`w-0 h-0 border-x-4 border-x-transparent border-b-[5px] transition-colors ${
                    isSelected ? 'border-b-white' : 'border-b-neutral-400 group-hover:border-b-neutral-200'
                  }`}
                />
                {/* Color Knob */}
                <div
                  className={`w-5 h-5 rounded-full border-2 transition-all shadow-md flex items-center justify-center ${
                    isSelected
                      ? 'border-white ring-2 ring-cyan-400 ring-offset-1 ring-offset-neutral-950'
                      : 'border-neutral-900 shadow-neutral-950'
                  }`}
                  style={{ backgroundColor: stop.color }}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Color Stop Editor Drawer */}
        {activeStop && (
          <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-200 flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full border border-white/40 shadow-xs"
                  style={{ backgroundColor: activeStop.color }}
                />
                Aktif Renk Noktası
              </span>

              {stops.length > 2 && (
                <button
                  onClick={handleDeleteActiveStop}
                  className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors px-1.5 py-0.5 rounded hover:bg-red-950/40"
                  title="Bu Renk Noktasını Kaldır"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Kaldır</span>
                </button>
              )}
            </div>

            {/* Inputs: Native Color Picker + Hex Input + Position Slider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Color Controls */}
              <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-lg border border-neutral-800">
                <input
                  type="color"
                  value={activeStop.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <input
                  type="text"
                  value={activeStop.color.toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      handleColorChange(val);
                    }
                  }}
                  className="flex-1 bg-transparent text-xs font-mono text-neutral-200 focus:outline-hidden"
                  placeholder="#00F0FF"
                  maxLength={7}
                />
              </div>

              {/* Offset Position Slider */}
              <div className="bg-neutral-900 p-1.5 px-2.5 rounded-lg border border-neutral-800 flex flex-col justify-center">
                <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
                  <span>Konum (%)</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {Math.round(activeStop.offset * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={activeStop.offset}
                  onChange={(e) => handleOffsetChange(parseFloat(e.target.value))}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* Vibrant Swatches Quick-Pick */}
            <div>
              <span className="text-[10px] text-neutral-500 block mb-1">Hızlı Stüdyo Renkleri:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {VIBRANT_COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    onClick={() => handleColorChange(swatch)}
                    className={`w-5 h-5 rounded-md border transition-all ${
                      activeStop.color.toLowerCase() === swatch.toLowerCase()
                        ? 'border-white scale-110 shadow-sm shadow-white/30'
                        : 'border-neutral-800 hover:scale-105'
                    }`}
                    style={{ backgroundColor: swatch }}
                    title={swatch}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gradient Mapping Direction & Mode */}
      <div className="space-y-2">
        <label className="block text-neutral-400 font-medium text-xs">
          Degrade Dağılım Modu & Yönü
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {gradientModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onChange({ gradientMode: mode.id })}
              className={`p-2 rounded-lg text-left border transition-all ${
                config.gradientMode === mode.id
                  ? 'bg-neutral-800 border-neutral-600 text-white'
                  : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-neutral-200">{mode.label}</span>
                {config.gradientMode === mode.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm" />
                )}
              </div>
              <p className="text-[10px] text-neutral-500 mt-0.5">{mode.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Tempo Cycling Speed Slider */}
      <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <div>
            <span className="text-white font-medium block">Dinamik Ritim & Renk Döngüsü</span>
            <span className="text-[10px] text-neutral-500">
              Paleti müzik temposuna göre parçacıklar arasında akıtır
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-cyan-400">
            {config.gradientCycleSpeed === 0
              ? 'Statik'
              : `${config.gradientCycleSpeed.toFixed(1)}x Hız`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="3.0"
          step="0.1"
          value={config.gradientCycleSpeed ?? 0}
          onChange={(e) => onChange({ gradientCycleSpeed: parseFloat(e.target.value) })}
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Original Image Colors Toggle (Only relevant if shapeMode === 'image') */}
      {config.shapeMode === 'image' && (
        <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-white font-medium text-xs block">
              Görselin Orijinal Renklerini Koru
            </span>
            <span className="text-[10px] text-neutral-500">
              Açık: Görselin piksel renkleri | Kapalı: Özel degrade paleti
            </span>
          </div>
          <input
            type="checkbox"
            checked={config.useOriginalImageColors ?? false}
            onChange={(e) => onChange({ useOriginalImageColors: e.target.checked })}
            className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-cyan-400 cursor-pointer"
          />
        </div>
      )}

      {/* Ready-made Master Presets Gallery */}
      <div className="space-y-2 pt-1">
        <div className="flex items-between justify-between">
          <label className="text-neutral-400 font-medium text-xs">
            Hazır Stüdyo Paletleri (1-Tıkla Uygula)
          </label>
          <span className="text-[10px] text-neutral-500">{GRADIENT_PRESETS.length} Hazır Palet</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {GRADIENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.stops)}
              className="flex items-center gap-2.5 p-2 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 transition-all text-left group"
            >
              {/* Mini swatch preview */}
              <div
                className="w-5 h-5 rounded-md border border-neutral-700/80 shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                style={{ background: generateCssGradient(preset.stops) }}
              />
              <span className="truncate text-[11px] font-medium text-neutral-300 group-hover:text-white">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
