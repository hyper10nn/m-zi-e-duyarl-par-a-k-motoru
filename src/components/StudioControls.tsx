import React, { useRef } from 'react';
import { 
  Type, 
  Sparkles, 
  Image as ImageIcon, 
  Layers, 
  Sliders, 
  Upload, 
  Palette, 
  Video, 
  Zap,
  Eye,
  Camera,
  Activity,
  ListMusic,
  Radio,
  MousePointer,
  Shield,
  Cpu,
  BarChart3
} from 'lucide-react';
import { VisualizerConfig, ShapeMode, ColorTheme, BackgroundType, AspectRatioType, MovementPattern, LayoutMode, KickAnimation, SnareAnimation, HihatAnimation, RenderStyleType } from '../types';
import { PRESET_LOGOS } from '../utils/shapePresets';
import { audioEngine } from '../utils/audioEngine';
import { GradientEditor } from './GradientEditor';
import { LrcTimelinePanel } from './LrcTimelinePanel';

interface StudioControlsProps {
  config: VisualizerConfig;
  onChange: (newConfig: Partial<VisualizerConfig>) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onTakeSnapshot: () => void;
  onStartRecord: (seconds: number) => void;
  onStopRecord: () => void;
  isRecording: boolean;
  recordTimerText: string;
  layoutMode: LayoutMode;
  currentLyricLine?: string | null;
}

export const StudioControls: React.FC<StudioControlsProps> = ({
  config,
  onChange,
  activeTab,
  onTabChange,
  onTakeSnapshot,
  onStartRecord,
  onStopRecord,
  isRecording,
  recordTimerText,
  layoutMode,
  currentLyricLine,
}) => {
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const bgImageUploadRef = useRef<HTMLInputElement>(null);
  const bgVideoUploadRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange({
        customImageUrl: url,
        customImageName: file.name,
        shapeMode: 'image',
      });
    }
  };

  const handleBgImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange({
        customBgImageUrl: url,
        backgroundType: 'custom-image',
      });
    }
  };

  const handleBgVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange({
        customBgVideoUrl: url,
        backgroundType: 'custom-video',
      });
    }
  };

  const shapeModes: { id: ShapeMode; label: string }[] = [
    { id: 'text', label: '🔤 Metin (Yazı)' },
    { id: 'preset-logo', label: '🛡️ RMA & Hazır Logo' },
    { id: 'image', label: '🖼️ Görsel / Logo Yükle' },
    { id: 'saturn', label: '🪐 Satürn & Halkaları' },
    { id: 'dna', label: '🧬 DNA Çift Sarmalı' },
    { id: 'infinity', label: '♾️ Sonsuzluk Döngüsü' },
    { id: 'diamond', label: '💎 3D Elmas Prizma' },
    { id: 'equalizer-cylinder', label: '🎛️ Ekolayzır Silindiri' },
    { id: 'pulsar', label: '✨ Pulsar Işın Yıldızı' },
    { id: 'galaxy', label: '🌌 Spiral Galaksi' },
    { id: 'circle', label: '⭕ Rezonans Çemberi' },
    { id: 'heart', label: '❤️ Parametrik Kalp' },
    { id: 'wave', label: '〰️ Sinüs Dalgası' },
    { id: 'fireworks', label: '🎆 Havai Fişek Patlaması' },
  ];

  const colorThemes: { id: ColorTheme; label: string; preview: string }[] = [
    { id: 'rma', label: 'RMA Resmi (Cyan & Altın)', preview: 'from-cyan-400 to-amber-400' },
    { id: 'cyber', label: 'Cyberpunk', preview: 'from-cyan-400 to-pink-500' },
    { id: 'sunset', label: 'Gün Batımı', preview: 'from-amber-400 to-red-500' },
    { id: 'aurora', label: 'Aurora', preview: 'from-emerald-400 to-teal-500' },
    { id: 'violet', label: 'Ultra Violet', preview: 'from-purple-500 to-pink-500' },
    { id: 'ice', label: 'Buz Kristali', preview: 'from-sky-300 to-blue-600' },
    { id: 'gold', label: 'Altın Lüks', preview: 'from-yellow-300 to-amber-600' },
    { id: 'original', label: 'Orijinal Renk', preview: 'from-indigo-400 to-purple-600' },
  ];

  const asideClass =
    layoutMode === 'top-preview'
      ? 'w-full border-t border-neutral-800 bg-neutral-950/95 flex flex-col shrink-0 overflow-hidden h-[38vh] min-h-[260px] max-h-[380px]'
      : 'w-80 lg:w-88 xl:w-96 border-l border-neutral-800 bg-neutral-950/95 flex flex-col h-full overflow-hidden shrink-0';

  return (
    <aside className={asideClass}>
      {/* Mobile/Compact Sub-tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-neutral-800/80 overflow-x-auto scrollbar-none bg-neutral-900/50">
        {[
          { id: 'shape', label: 'Yazı/Şekil', icon: Type },
          { id: 'lrc', label: 'LRC / Sözler', icon: ListMusic },
          { id: 'beat-sync', label: 'Beat-Sync FX', icon: Zap },
          { id: 'motion', label: 'Hareket/Ritim', icon: Activity },
          { id: 'particles', label: 'Parçacık', icon: Sparkles },
          { id: 'background', label: 'Arka Plan', icon: ImageIcon },
          { id: 'overlay', label: 'Tipografi', icon: Layers },
          { id: 'export', label: 'Dışa Aktar', icon: Video },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content scroll container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-neutral-300 text-xs">
        {/* ================= TAB: YAZI & ŞEKİL ================= */}
        {activeTab === 'shape' && (
          <div className="space-y-4">
            <div>
              <label className="block text-neutral-400 font-medium mb-2">Parçacık Şekil Modu</label>
              <div className="grid grid-cols-2 gap-1.5 bg-neutral-900/80 p-1.5 rounded-lg border border-neutral-800">
                {shapeModes.map((sm) => (
                  <button
                    key={sm.id}
                    onClick={() => onChange({ shapeMode: sm.id })}
                    className={`px-2.5 py-1.5 text-xs rounded transition-colors text-left ${
                      config.shapeMode === sm.id
                        ? 'bg-neutral-800 text-white font-medium shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {sm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* If Text Mode */}
            {config.shapeMode === 'text' && (
              <div className="space-y-3 p-3 bg-neutral-900/40 rounded-xl border border-neutral-800">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Şekillendirilecek Yazı</label>
                  <input
                    type="text"
                    value={config.text}
                    onChange={(e) => onChange({ text: e.target.value })}
                    placeholder="Örn: BEAT, PULSE veya İsim"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white font-semibold focus:outline-none focus:border-neutral-500"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Parçacıklar yazdığınız harflerin içine toplanır ve bas vurdukça saçılır.
                  </p>
                </div>

                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Yazı Tipi (Font)</label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) => onChange({ fontFamily: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white focus:outline-none"
                  >
                    <option value="Syne">Syne (Fütüristik / Modern Sanat)</option>
                    <option value="Orbitron">Orbitron (Siber & Sci-Fi Display)</option>
                    <option value="Bebas Neue">Bebas Neue (Büyük & Vurucu Display)</option>
                    <option value="Russo One">Russo One (Güçlü Kulüp Bas Display)</option>
                    <option value="Righteous">Righteous (Retro Synthwave Arcade)</option>
                    <option value="Cinzel">Cinzel (Lüks & Epik Antik Serif)</option>
                    <option value="Montserrat">Montserrat (Zarif Geometrik Modern)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Temiz Minimal)</option>
                    <option value="JetBrains Mono">JetBrains Mono (Teknik Monospace)</option>
                    <option value="Press Start 2P">Press Start 2P (8-Bit Retro Piksel)</option>
                    <option value="Impact">Impact (Kuvvetli Dolgun)</option>
                    <option value="Arial Black">Arial Black (Klasik Kalın)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-neutral-400 mb-1">
                    <span>Yazı Boyutu</span>
                    <span className="font-mono tabular-nums">{config.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    step="5"
                    value={config.fontSize}
                    onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>
            )}

            {/* If Preset Logo Mode */}
            {config.shapeMode === 'preset-logo' && (
              <div className="space-y-3 p-3 bg-neutral-900/40 rounded-xl border border-neutral-800">
                <label className="block text-neutral-400 font-medium">Hazır Vektör Şablonu</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_LOGOS.map((logo) => (
                    <button
                      key={logo.id}
                      onClick={() => onChange({ selectedLogo: logo.id })}
                      className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all ${
                        config.selectedLogo === logo.id
                          ? 'bg-neutral-800 border-white text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                      }`}
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d={logo.iconSvgPath} />
                      </svg>
                      <span className="text-[10px] truncate max-w-full">{logo.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* If Image Mode */}
            {config.shapeMode === 'image' && (
              <div className="space-y-3.5 p-3.5 bg-neutral-900/40 rounded-xl border border-neutral-800">
                <input
                  ref={imageUploadRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFile}
                />
                <label className="block text-neutral-400 font-medium">Görsel / Logo Yükle</label>
                <div
                  onClick={() => imageUploadRef.current?.click()}
                  className="border-2 border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl p-4 text-center cursor-pointer transition-colors bg-neutral-900/40"
                >
                  <Upload className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                  <p className="text-neutral-200 font-medium">Logo veya Fotoğraf Seç</p>
                  <p className="text-[11px] text-neutral-500 mt-1">PNG, JPG, SVG veya WebP</p>
                </div>

                {config.customImageUrl && (
                  <div className="flex items-center gap-3 p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                    <img
                      src={config.customImageUrl}
                      alt="Uploaded preview"
                      className="w-12 h-12 object-contain rounded bg-neutral-950 p-1"
                    />
                    <div className="overflow-hidden flex-1">
                      <p className="text-white font-medium truncate">{config.customImageName || 'Özel Logo'}</p>
                      <p className="text-cyan-400 text-[10px] font-mono">Parçacıklara ayrıştırıldı</p>
                    </div>
                  </div>
                )}

                {/* FX Slicing & Sampling Mode */}
                <div className="space-y-2 pt-1 border-t border-neutral-800/80">
                  <label className="block text-neutral-300 font-medium text-xs">FX Parçacık Ayrıştırma Modu</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'all-pixels', label: 'Tüm Görsel' },
                      { id: 'edges-only', label: 'Kenar Çizgileri' },
                      { id: 'contour', label: 'Silüet / Kontur' },
                      { id: 'grid-slice', label: 'Izgara Dilimleri' },
                      { id: 'shatter-explode', label: 'Fraktal Parçalanma' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => onChange({ imageSamplingMode: mode.id as any })}
                        className={`px-2 py-1.5 rounded text-[11px] font-medium border text-left transition-colors ${
                          config.imageSamplingMode === mode.id
                            ? 'bg-neutral-800 border-cyan-400 text-white'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Edge Threshold Slider */}
                <div>
                  <div className="flex justify-between text-neutral-400 mb-1">
                    <span>Kenar / Parlaklık Eşiği</span>
                    <span className="font-mono tabular-nums">{config.imageEdgeThreshold}</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="5"
                    value={config.imageEdgeThreshold}
                    onChange={(e) => onChange({ imageEdgeThreshold: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Inscribed Text Inside the Image */}
                <div className="p-2.5 bg-neutral-900/60 rounded-lg border border-neutral-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium block text-xs">Görsel Üstüne Yazı Kazı</span>
                      <span className="text-neutral-500 text-[10px]">Görsel parçacıklarının içine gömülü yazı</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.showImageText}
                      onChange={(e) => onChange({ showImageText: e.target.checked })}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {config.showImageText && (
                    <input
                      type="text"
                      value={config.imageOverlayText}
                      onChange={(e) => onChange({ imageOverlayText: e.target.value })}
                      placeholder="Örn: RMAFX, DROP veya Sanatçı"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: LRC / ŞARKI SÖZÜ ZAMAN ÇİZELGESİ ================= */}
        {activeTab === 'lrc' && (
          <div className="space-y-4">
            <LrcTimelinePanel
              config={config}
              onChange={onChange}
              currentLyricLine={currentLyricLine}
            />
          </div>
        )}

        {/* ================= TAB: BEAT-SYNC FX ================= */}
        {activeTab === 'beat-sync' && (
          <div className="space-y-4">
            <div className="p-3 bg-gradient-to-r from-cyan-950/40 via-neutral-900/60 to-amber-950/40 rounded-xl border border-cyan-800/40 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <Zap className="w-4 h-4" />
                <span>Beat-Sync FX Stüdyosu</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Kick (Bas), Snare (Trampete) ve Hi-Hat (Zil) vuruşlarına özel göz kamaştırıcı parçacık patlama animasyonları.
              </p>
            </div>

            {/* Live Trigger Test Pads & Status Indicators */}
            <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 space-y-2">
              <label className="text-white font-medium text-xs block">Canlı Ritim Test Pedleri (VJ Kısayolları)</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => audioEngine.triggerManualBeat('kick')}
                  className="py-2.5 px-2 bg-gradient-to-b from-cyan-950/60 to-neutral-900 hover:from-cyan-900/70 border border-cyan-700/50 hover:border-cyan-400 rounded-lg text-center transition-all group"
                >
                  <span className="block text-cyan-400 font-bold text-xs group-hover:scale-105 transition-transform">KICK</span>
                  <span className="block text-[9px] text-neutral-400 mt-0.5 font-mono">[Boşluk]</span>
                </button>
                <button
                  onClick={() => audioEngine.triggerManualBeat('snare')}
                  className="py-2.5 px-2 bg-gradient-to-b from-purple-950/60 to-neutral-900 hover:from-purple-900/70 border border-purple-700/50 hover:border-purple-400 rounded-lg text-center transition-all group"
                >
                  <span className="block text-purple-400 font-bold text-xs group-hover:scale-105 transition-transform">SNARE</span>
                  <span className="block text-[9px] text-neutral-400 mt-0.5 font-mono">[V]</span>
                </button>
                <button
                  onClick={() => audioEngine.triggerManualBeat('hihat')}
                  className="py-2.5 px-2 bg-gradient-to-b from-amber-950/60 to-neutral-900 hover:from-amber-900/70 border border-amber-700/50 hover:border-amber-400 rounded-lg text-center transition-all group"
                >
                  <span className="block text-amber-400 font-bold text-xs group-hover:scale-105 transition-transform">HI-HAT</span>
                  <span className="block text-[9px] text-neutral-400 mt-0.5 font-mono">[G]</span>
                </button>
              </div>
            </div>

            {/* 1. Kick Drum Particle Explosion FX */}
            <div className="p-3.5 bg-neutral-900/50 rounded-xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  KICK (Bas Vuruşu) Animasyonu
                </span>
                <span className="font-mono text-[10px] text-neutral-400">{config.kickAnim}</span>
              </div>

              <div className="space-y-1.5">
                {[
                  { id: 'dual-shockwave', label: '⚡ Dual RMA Şok Dalgası', desc: 'Cyan & Altın iki yandan merkezde çarpışır' },
                  { id: 'supernova', label: '💥 Süpernova Patlaması', desc: 'Merkezden dışa doğru devasa ışıma & kuyruklu yıldızlar' },
                  { id: 'sonic-ring', label: '⭕ Sonik Akustik Bas Halkaları', desc: 'Genişleyen iç içe kompresyon halkaları' },
                  { id: 'gravity-inversion', label: '🕳️ Yerçekimi Tersinimi', desc: 'İçe hızlı çöküş ardından şiddetli dışa patlama' },
                  { id: 'bass-quake', label: '🌋 Sismik Bas Depremi', desc: 'Ekranı ve parçacıkları sarsan 3D deprem titreşimi' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChange({ kickAnim: item.id as KickAnimation });
                      audioEngine.triggerManualBeat('kick');
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors border ${
                      config.kickAnim === item.id
                        ? 'bg-cyan-950/40 border-cyan-500/80 text-white font-medium'
                        : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-200">{item.label}</span>
                      {config.kickAnim === item.id && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm" />}
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Kick Patlama Şiddeti</span>
                  <span className="font-mono tabular-nums text-cyan-400 font-bold">{config.kickIntensity?.toFixed(1) ?? '1.2'}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={config.kickIntensity ?? 1.2}
                  onChange={(e) => onChange({ kickIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* 2. Snare Drum Particle FX */}
            <div className="p-3.5 bg-neutral-900/50 rounded-xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-purple-400 font-bold flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  SNARE (Trampete Vuruşu) Animasyonu
                </span>
                <span className="font-mono text-[10px] text-neutral-400">{config.snareAnim}</span>
              </div>

              <div className="space-y-1.5">
                {[
                  { id: 'vortex-suction', label: '🌀 Girdap Emme Kasırgası', desc: 'Parçacıkları yüksek açıyla içeri çeken siklon' },
                  { id: 'spiral-twister', label: '🌪️ Spiral Tornado Twister', desc: '3D eksende dönen kasırga spiralleri' },
                  { id: 'spark-shower', label: '✨ Elektrik Kıvılcım Yağmuru', desc: 'Yukarı doğru fışkıran parlak kıvılcım arkları' },
                  { id: 'chromatic-jitter', label: '⚡ Kromatik RGB Titremesi', desc: 'Kırmızı-Mavi-Yeşil renk ayrışması ve siber sarsıntı' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChange({ snareAnim: item.id as SnareAnimation });
                      audioEngine.triggerManualBeat('snare');
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors border ${
                      config.snareAnim === item.id
                        ? 'bg-purple-950/40 border-purple-500/80 text-white font-medium'
                        : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-200">{item.label}</span>
                      {config.snareAnim === item.id && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-sm" />}
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Snare Vuruş Şiddeti</span>
                  <span className="font-mono tabular-nums text-purple-400 font-bold">{config.snareIntensity?.toFixed(1) ?? '1.2'}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={config.snareIntensity ?? 1.2}
                  onChange={(e) => onChange({ snareIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>
            </div>

            {/* 3. Hi-Hat Particle FX */}
            <div className="p-3.5 bg-neutral-900/50 rounded-xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  HI-HAT (Zil / Tiz) Animasyonu
                </span>
                <span className="font-mono text-[10px] text-neutral-400">{config.hihatAnim}</span>
              </div>

              <div className="space-y-1.5">
                {[
                  { id: 'stardust-twinkle', label: '💎 Elmas Yıldız Tozu', desc: 'Mikro parlaklık patlamaları ve ışıltılı yıldızlar' },
                  { id: 'laser-beams', label: '⚡ Radyal Lazer Işınları', desc: 'Merkezden fırlayan keskin geometrik lazer parçacıkları' },
                  { id: 'quantum-flash', label: '✨ Kuantum Parlama Şoku', desc: 'Anlık yüksek enerjili parıldama ve derinlik sıçraması' },
                  { id: 'rain-drizzle', label: '🌧️ Altın Parıltı Yağmuru', desc: 'Yukarıdan aşağı hızla süzülen altın yağmur parçacıkları' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChange({ hihatAnim: item.id as HihatAnimation });
                      audioEngine.triggerManualBeat('hihat');
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors border ${
                      config.hihatAnim === item.id
                        ? 'bg-amber-950/40 border-amber-500/80 text-white font-medium'
                        : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-200">{item.label}</span>
                      {config.hihatAnim === item.id && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />}
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Hi-Hat Vuruş Şiddeti</span>
                  <span className="font-mono tabular-nums text-amber-400 font-bold">{config.hihatIntensity?.toFixed(1) ?? '1.2'}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={config.hihatIntensity ?? 1.2}
                  onChange={(e) => onChange({ hihatIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: HAREKET & RİTİM ================= */}
        {activeTab === 'motion' && (
          <div className="space-y-4">
            {/* Pattern Mode Selector */}
            <div>
              <label className="block text-neutral-400 font-medium mb-2">Parçacık Hareket Deseni</label>
              <div className="space-y-1.5 bg-neutral-900/60 p-2 rounded-xl border border-neutral-800">
                {[
                  { id: 'auto-beat', label: '⚡ Akıllı Ritim Geçişi', desc: 'Kick=Patlama, Snare=Girdap, Hihat=Glitch' },
                  { id: 'explode', label: '💥 Patlama (Explode)', desc: 'Bas vuruşlarında dışa radyal süpernova' },
                  { id: 'vortex', label: '🌀 Girdap (Vortex Swirl)', desc: 'Kara delik açısal dönme ve çekim gücü' },
                  { id: 'spiral', label: '🌪️ Sarmal (Spiral Helix)', desc: 'Çift kollu galaktik logaritmik dönüş' },
                  { id: 'wave-ripple', label: '🌊 Dalga (Wave Ripple)', desc: 'Akustik su dalgalanması & radyal titreşim' },
                  { id: 'chaos-turbulence', label: '💨 Türbülans (Fluid)', desc: 'Akışkan duman ve aerodinamik rüzgar' },
                  { id: 'quantum-glitch', label: '⚡ Kuantum Glitch', desc: 'Yatay tarama çizgilerinde siber sıçrama' },
                  { id: 'gravity-fall', label: '☔ Dijital Yağmur', desc: 'Yerçekimiyle düşme ve yerden sekme' },
                ].map((pat) => (
                  <button
                    key={pat.id}
                    onClick={() => onChange({ movementPattern: pat.id as MovementPattern })}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors ${
                      config.movementPattern === pat.id
                        ? 'bg-neutral-800 text-white font-medium border border-neutral-700'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{pat.label}</span>
                      {config.movementPattern === pat.id && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{pat.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Live VJ Beat Trigger Pads */}
            <div className="p-3 bg-neutral-900/40 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium text-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Canlı Ritim Tetikleyicileri</span>
                </label>
                <span className="text-[10px] text-neutral-500 font-mono">VJ Tuşları</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Tıklayarak veya klavye kısayollarını kullanarak anında ekranda görsel patlama oluşturun:
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => audioEngine.triggerManualBeat('kick')}
                  className="py-2.5 px-2 bg-neutral-800 hover:bg-neutral-700 active:scale-95 border border-neutral-700/80 rounded-lg text-center transition-all"
                  title="Boşluk (Space) tuşuna da basabilirsiniz"
                >
                  <span className="block text-red-400 font-bold text-xs">💥 BAS PATLAMASI</span>
                  <span className="text-[10px] text-neutral-500 font-mono">Boşluk / Space</span>
                </button>
                <button
                  onClick={() => audioEngine.triggerManualBeat('snare')}
                  className="py-2.5 px-2 bg-neutral-800 hover:bg-neutral-700 active:scale-95 border border-neutral-700/80 rounded-lg text-center transition-all"
                  title="V tuşuna da basabilirsiniz"
                >
                  <span className="block text-cyan-400 font-bold text-xs">🌀 GİRDAP DÖNÜŞÜ</span>
                  <span className="text-[10px] text-neutral-500 font-mono">V Tuşu</span>
                </button>
                <button
                  onClick={() => audioEngine.triggerManualBeat('hihat')}
                  className="py-2.5 px-2 bg-neutral-800 hover:bg-neutral-700 active:scale-95 border border-neutral-700/80 rounded-lg text-center transition-all"
                  title="G tuşuna da basabilirsiniz"
                >
                  <span className="block text-amber-400 font-bold text-xs">⚡ SİBER GLITCH</span>
                  <span className="text-[10px] text-neutral-500 font-mono">G Tuşu</span>
                </button>
                <button
                  onClick={() => onChange({ movementPattern: 'spiral' })}
                  className="py-2.5 px-2 bg-neutral-800 hover:bg-neutral-700 active:scale-95 border border-neutral-700/80 rounded-lg text-center transition-all"
                  title="S tuşuna da basabilirsiniz"
                >
                  <span className="block text-purple-400 font-bold text-xs">🌪️ SARMAL KIVRIM</span>
                  <span className="text-[10px] text-neutral-500 font-mono">S Tuşu</span>
                </button>
              </div>
            </div>

            {/* Sliders & Physics */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Girdap / Sarmal Hızı</span>
                  <span className="font-mono tabular-nums">{config.vortexSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.2"
                  value={config.vortexSpeed}
                  onChange={(e) => onChange({ vortexSpeed: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Şekle Toplanma Hızı</span>
                  <span className="font-mono tabular-nums">{config.shapeMorphSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="2.5"
                  step="0.1"
                  value={config.shapeMorphSpeed}
                  onChange={(e) => onChange({ shapeMorphSpeed: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              {/* Pulse Frequency control (scales attraction speed directly based on audio energy) */}
              <div className="p-2.5 bg-cyan-950/20 border border-cyan-500/30 rounded-lg space-y-1.5">
                <div className="flex justify-between text-neutral-300">
                  <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    Darbe Frekansı (Pulse Frequency)
                  </span>
                  <span className="font-mono tabular-nums text-cyan-400 font-bold">
                    {(config.pulseFrequency ?? 1.0).toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="3.0"
                  step="0.1"
                  value={config.pulseFrequency ?? 1.0}
                  onChange={(e) => onChange({ pulseFrequency: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <p className="text-[10px] text-neutral-400">
                  Parçacıkların şekle toplanma / çekilme hızını müziğin <span className="text-cyan-300 font-mono">energy</span> seviyesine göre anlık ölçeklendirir.
                </p>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-neutral-300 font-medium block">Kamera Titremesi (Camera Shake)</span>
                    <span className="text-neutral-500 text-[11px]">Güçlü bas vuruşlarında sahne sarsılır</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.cameraShake}
                    onChange={(e) => onChange({ cameraShake: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-white cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-neutral-300 font-medium block">Kromatik Ayrışma (RGB Split)</span>
                    <span className="text-neutral-500 text-[11px]">Ritimde renkler ayrışarak siber parlama üretir</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.chromaticAberration}
                    onChange={(e) => onChange({ chromaticAberration: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-white cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-neutral-300 font-medium block">Çift RMA Şok Dalgası</span>
                    <span className="text-neutral-500 text-[11px]">Soldan Cyan, sağdan Altın dalgalar çarpışır</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.dualRmaShockwave}
                    onChange={(e) => onChange({ dualRmaShockwave: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-white cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-neutral-300 font-medium block">3D Derinlik (Z-Axis Perspective)</span>
                    <span className="text-neutral-500 text-[11px]">Parçacıklar kameraya doğru fırlar</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.depth3D}
                    onChange={(e) => onChange({ depth3D: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Frequency EQ Multipliers */}
              <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 space-y-2.5">
                <label className="text-white font-medium block text-xs">Frekans Bantları & EQ Duyarlılığı</label>
                <div>
                  <div className="flex justify-between text-neutral-400 text-[11px] mb-1">
                    <span>Sub-Bas Gücü (Kick Drop)</span>
                    <span className="font-mono tabular-nums">{config.bassBoost.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={config.bassBoost}
                    onChange={(e) => onChange({ bassBoost: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-neutral-400 text-[11px] mb-1">
                    <span>Vokal & Melodi (Mid/Vortex)</span>
                    <span className="font-mono tabular-nums">{config.midBoost.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={config.midBoost}
                    onChange={(e) => onChange({ midBoost: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-neutral-400 text-[11px] mb-1">
                    <span>Zil & Tizler (Hi-Hat / Işıltı)</span>
                    <span className="font-mono tabular-nums">{config.trebleBoost.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={config.trebleBoost}
                    onChange={(e) => onChange({ trebleBoost: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>
            </div>

            {/* Lyric / Word Sequencing Mode */}
            <div className="p-3 bg-neutral-900/40 rounded-xl border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-medium block">Şarkı Sözü / Sıralı Kelimeler (FX)</span>
                  <span className="text-neutral-500 text-[11px]">Ritimle kelimeler ve emojiler arası geçiş</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.lyricSequenceMode}
                  onChange={(e) => onChange({ lyricSequenceMode: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-cyan-400 cursor-pointer"
                />
              </div>

              {config.lyricSequenceMode && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                    <span className="text-xs text-neutral-300">Geçişlerde Canlı Emoji Ekle</span>
                    <input
                      type="checkbox"
                      checked={config.lyricEmojiPrefix ?? true}
                      onChange={(e) => onChange({ lyricEmojiPrefix: e.target.checked })}
                      className="w-3.5 h-3.5 rounded border-neutral-700 bg-neutral-900 accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* One-Click Preset Packs */}
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Hızlı Hazır Söz Paketleri:</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { name: '⚡ Cyber Trap', words: '⚡ DROP, 🔥 BASS, 💎 RMA, 🚀 FLY, 👑 KING, 🌌 COSMOS' },
                        { name: '🎶 Club Beat', words: '🎵 BEAT, 🔊 LOUDER, 💥 SHOCK, ✨ MAGIC, 🌊 FLOW' },
                        { name: '🛡️ RMA Anthem', words: '🛡️ RMA, ⚡ PULSE, 🌟 GOLD, 💎 CYAN, 🚀 BEYOND' },
                      ].map((pack) => (
                        <button
                          key={pack.name}
                          onClick={() => onChange({ lyricWords: pack.words, lyricSequenceMode: true })}
                          className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded text-[10px] text-neutral-300 hover:text-white transition-colors text-center truncate"
                        >
                          {pack.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Virgülle ayrılmış kelimeler / sözler:</label>
                    <input
                      type="text"
                      value={config.lyricWords}
                      onChange={(e) => onChange({ lyricWords: e.target.value })}
                      placeholder="BEAT, DROP, BASS, PULSE, ENERGY"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white font-semibold text-xs focus:outline-none focus:border-cyan-400"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Her bas vuruşunda parçacıklar sıradaki kelimeye ve emojilere animasyonla dönüşür.
                    </p>
                  </div>

                  <button
                    onClick={() => onTabChange('lrc')}
                    className="w-full mt-2 py-1.5 px-2.5 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-700/50 rounded-lg text-cyan-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ListMusic className="w-3.5 h-3.5" />
                    <span>Milisaniyelik .LRC Zaman Çizelgesi Moduna Geç</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB: PARÇACIKLAR ================= */}
        {activeTab === 'particles' && (
          <div className="space-y-4">
            {/* Visualizer Render Style Selector */}
            <div>
              <label className="block text-neutral-400 font-medium mb-1.5 flex items-center justify-between">
                <span>Görselleştirici Çizim Stili</span>
                <span className="text-[10px] text-cyan-400 font-mono uppercase">{config.renderStyle || 'dots'}</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-neutral-900/80 p-1.5 rounded-lg border border-neutral-800">
                {[
                  { id: 'dots', label: '🟣 Noktalar (Particles)', desc: 'Klasik neon parçacıklar' },
                  { id: 'lines', label: '⚡ Çizgiler (Plexus Lines)', desc: 'Bağlantılı ışık çizgileri' },
                  { id: 'equalizer-bars', label: '📊 Ekolayzır Sütunları', desc: 'Frekans spektrum çubukları' },
                  { id: 'circular-equalizer', label: '⭕ Dairesel Ekolayzır', desc: 'Radyal spektrum halkası' },
                  { id: 'waveform', label: '🌊 Ses Dalgası (Wave)', desc: 'Canlı osiloskop dalgası' },
                  { id: 'cyber-mesh', label: '🕸️ Neon Kafes Ağı', desc: 'Fütüristik poligon örgüsü' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => onChange({ renderStyle: st.id as RenderStyleType })}
                    className={`p-2 rounded-md text-left transition-all ${
                      (config.renderStyle || 'dots') === st.id
                        ? 'bg-cyan-500/20 border border-cyan-400/80 text-white shadow-xs'
                        : 'bg-neutral-950/60 hover:bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 border border-neutral-800/60'
                    }`}
                  >
                    <span className="block font-medium text-xs truncate">{st.label}</span>
                    <span className="text-[10px] text-neutral-500 block truncate">{st.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shape Cohesion & Noise Gate Card */}
            <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 space-y-3">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Şekil Koruma & Ses Kararlılığı
              </span>

              {/* Shape Cohesion Slider */}
              <div>
                <div className="flex justify-between text-neutral-300 text-xs mb-1">
                  <span className="flex items-center gap-1">
                    <span>Şekil Tutarlılığı & Bütünlük</span>
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    %{Math.round((config.shapeCohesion ?? 0.85) * 100)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={config.shapeCohesion ?? 0.85}
                  onChange={(e) => onChange({ shapeCohesion: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Müzik vurduğunda yazı, logo ve resimlerin aşırı dağılmasını önler; şeklin okunabilirliğini ve formunu korur.
                </p>
              </div>

              {/* Noise Gate Slider */}
              <div>
                <div className="flex justify-between text-neutral-300 text-xs mb-1">
                  <span>Ses Eşik Değeri (Noise Gate)</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {(config.noiseGate ?? 0.05).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="0.20"
                  step="0.01"
                  value={config.noiseGate ?? 0.05}
                  onChange={(e) => onChange({ noiseGate: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Ses yokken veya düşük fısıltılarda parçacıkların titremesini önler, sessizlik anında tam sabit kilitler.
                </p>
              </div>
            </div>

            {/* Performance Mode & Touch Interaction Toggles */}
            <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 space-y-3">
              {/* Touch Interaction Toggle (Requested: dokunarak hareket etmesin) */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-medium block text-xs flex items-center gap-1.5">
                    <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                    Dokunma / Fare Etkileşimi
                  </span>
                  <span className="text-neutral-400 text-[10px]">
                    Kapalıyken dokunmak veya fareyi gezdirmek parçacıkları dağıtmaz
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableTouchInteraction}
                    onChange={(e) => onChange({ enableTouchInteraction: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* 60 FPS Turbo Performance Mode Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                <div>
                  <span className="text-white font-medium block text-xs flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    60 FPS Ultra Akıcı Performans Modu
                  </span>
                  <span className="text-neutral-400 text-[10px]">
                    Hafif GPU hızlandırma ile kasmayı ve FPS düşüşünü sıfırlar
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.performanceMode !== false}
                    onChange={(e) => onChange({ performanceMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* Custom Multi-Color Gradient Palette Editor */}
            <GradientEditor config={config} onChange={onChange} />

            {/* Sliders */}
            <div className="space-y-3.5 pt-2">
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Parçacık Sayısı</span>
                  <span className="font-mono tabular-nums">{config.particleCount}</span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="5000"
                  step="100"
                  value={config.particleCount}
                  onChange={(e) => onChange({ particleCount: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Parçacık Boyutu</span>
                  <span className="font-mono tabular-nums">{config.particleSize}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={config.particleSize}
                  onChange={(e) => onChange({ particleSize: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Bas Patlama Kuvveti</span>
                  <span className="font-mono tabular-nums">{config.bassExplosionForce.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2.5"
                  step="0.1"
                  value={config.bassExplosionForce}
                  onChange={(e) => onChange({ bassExplosionForce: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Müzik Duyarlılığı</span>
                  <span className="font-mono tabular-nums">{config.audioReactivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={config.audioReactivity}
                  onChange={(e) => onChange({ audioReactivity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              {/* Pulse Frequency Energy Scaling */}
              <div className="p-2.5 bg-cyan-950/20 border border-cyan-500/30 rounded-lg space-y-1.5">
                <div className="flex justify-between text-neutral-300">
                  <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    Darbe Frekansı (Pulse Frequency)
                  </span>
                  <span className="font-mono tabular-nums text-cyan-400 font-bold">
                    {(config.pulseFrequency ?? 1.0).toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="3.0"
                  step="0.1"
                  value={config.pulseFrequency ?? 1.0}
                  onChange={(e) => onChange({ pulseFrequency: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <p className="text-[10px] text-neutral-400">
                  Müziğin toplam <span className="text-cyan-300 font-mono">energy</span> genliğiyle parçacıkların çekim hızını çarparak dinamik nabız oluşturur.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Işık İzi (Trail)</span>
                  <span className="font-mono tabular-nums">{Math.round((1 - config.trailAlpha) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.08"
                  max="0.9"
                  step="0.02"
                  value={config.trailAlpha}
                  onChange={(e) => onChange({ trailAlpha: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Parlama Işığı (Bloom)</span>
                  <span className="font-mono tabular-nums">{config.glowStrength}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={config.glowStrength}
                  onChange={(e) => onChange({ glowStrength: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>
            </div>

            {/* Plexus Lines Toggle */}
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-neutral-300 font-medium block">Plexus Bağlantı Çizgileri</span>
                <span className="text-neutral-500 text-[11px]">Yakın parçacıkları birbirine bağlar</span>
              </div>
              <input
                type="checkbox"
                checked={config.connectionLines}
                onChange={(e) => onChange({ connectionLines: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-white cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ================= TAB: ARKA PLAN (VIDEO & GÖRSEL) ================= */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <div>
              <label className="block text-neutral-400 font-medium mb-2">Arka Plan Tipi</label>
              <div className="space-y-1.5 bg-neutral-900/60 p-2 rounded-xl border border-neutral-800">
                {[
                  { id: 'video-cyber-city', label: '🌆 Cyberpunk Şehir (Neon Video Döngüsü)' },
                  { id: 'video-nebula', label: '🌌 Kozmik Nebula (Derin Uzay Uçuşu)' },
                  { id: 'video-techno-tunnel', label: '🌀 Tekno Tünel (Hexagon Warp Video)' },
                  { id: 'video-liquid-chrome', label: '💧 Sıvı Krom Dalgaları (Metalik Akış)' },
                  { id: 'video-black-hole', label: '🕳️ Kara Delik & Çekim Merceği (İnterstellar)' },
                  { id: 'video-matrix-rain', label: '💻 Matrix Kod Yağmuru (Siber Akış)' },
                  { id: 'video-hyper-grid', label: '⚡ Hyperwave 3D Grid (Outrun Güneş)' },
                  { id: 'video-deep-ocean', label: '🌊 Derin Okyanus & Biyo-Işıma' },
                  { id: 'procedural-stars', label: '✨ Yıldız Tüneli (Hız Dalgası)' },
                  { id: 'procedural-grid', label: '🌐 Cyber Synth Izgara' },
                  { id: 'procedural-aurora', label: '🌈 Kuzey Işıkları (Aurora)' },
                  { id: 'custom-video', label: '📹 Kendi Videonu Yükle (.mp4)' },
                  { id: 'custom-image', label: '🖼️ Kendi Görselini Yükle (.jpg, .png)' },
                  { id: 'none', label: '⬛ Düz Siyah Minimal' },
                ].map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => onChange({ backgroundType: bg.id as BackgroundType })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      config.backgroundType === bg.id
                        ? 'bg-neutral-800 text-white font-medium border border-neutral-700'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
                    }`}
                  >
                    <span>{bg.label}</span>
                    {config.backgroundType === bg.id && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Video Uploader */}
            {config.backgroundType === 'custom-video' && (
              <div className="p-3 bg-neutral-900/40 rounded-xl border border-neutral-800 space-y-2">
                <input
                  ref={bgVideoUploadRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleBgVideoFile}
                />
                <button
                  onClick={() => bgVideoUploadRef.current?.click()}
                  className="w-full py-3 px-4 border-2 border-dashed border-neutral-800 hover:border-neutral-700 rounded-lg text-center cursor-pointer transition-colors"
                >
                  <Video className="w-5 h-5 mx-auto mb-1 text-neutral-400" />
                  <span className="text-white font-medium block">Video Dosyası Seç</span>
                  <span className="text-neutral-500 text-[10px]">MP4 veya WebM formatında döngü</span>
                </button>
              </div>
            )}

            {/* Custom Image Uploader */}
            {config.backgroundType === 'custom-image' && (
              <div className="p-3 bg-neutral-900/40 rounded-xl border border-neutral-800 space-y-2">
                <input
                  ref={bgImageUploadRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBgImageFile}
                />
                <button
                  onClick={() => bgImageUploadRef.current?.click()}
                  className="w-full py-3 px-4 border-2 border-dashed border-neutral-800 hover:border-neutral-700 rounded-lg text-center cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-5 h-5 mx-auto mb-1 text-neutral-400" />
                  <span className="text-white font-medium block">Arka Plan Fotoğrafı Seç</span>
                  <span className="text-neutral-500 text-[10px]">Albüm kapağı veya manzara</span>
                </button>
              </div>
            )}

            {/* Background Modifiers & Shaping */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Arka Plan Opaklığı</span>
                  <span className="font-mono tabular-nums">{Math.round(config.bgOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={config.bgOpacity}
                  onChange={(e) => onChange({ bgOpacity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Bulanıklık (Blur)</span>
                  <span className="font-mono tabular-nums">{config.bgBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={config.bgBlur}
                  onChange={(e) => onChange({ bgBlur: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Parlaklık (Brightness)</span>
                  <span className="font-mono tabular-nums">{config.bgBrightness.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={config.bgBrightness}
                  onChange={(e) => onChange({ bgBrightness: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Kontrast (Contrast)</span>
                  <span className="font-mono tabular-nums">{config.bgContrast?.toFixed(1) ?? '1.0'}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={config.bgContrast ?? 1.0}
                  onChange={(e) => onChange({ bgContrast: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Doygunluk (Saturation)</span>
                  <span className="font-mono tabular-nums">{config.bgSaturation?.toFixed(1) ?? '1.0'}x</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.5"
                  step="0.1"
                  value={config.bgSaturation ?? 1.0}
                  onChange={(e) => onChange({ bgSaturation: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Renk Döndürme (Hue Rotate)</span>
                  <span className="font-mono tabular-nums">{config.bgHueRotate ?? 0}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="10"
                  value={config.bgHueRotate ?? 0}
                  onChange={(e) => onChange({ bgHueRotate: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-neutral-300 font-medium block">Bas ile Zoom (Beat Pulse)</span>
                  <span className="text-neutral-500 text-[11px]">Bas vuruşlarında arka plan hafif büyür</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.bgBeatZoom}
                  onChange={(e) => onChange({ bgBeatZoom: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-white cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-neutral-300 font-medium block">CRT Tarama Çizgileri (Scanlines)</span>
                  <span className="text-neutral-500 text-[11px]">Retro TV yatay çizgi katmanı</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.bgScanlines ?? false}
                  onChange={(e) => onChange({ bgScanlines: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: TİPOGRAFİ & OVERLAY ================= */}
        {activeTab === 'overlay' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-2.5 bg-neutral-900/60 rounded-xl border border-neutral-800">
              <div>
                <span className="text-white font-medium block">Yazı Katmanı</span>
                <span className="text-neutral-500 text-[11px]">Video üzerine başlık ve sanatçı ekle</span>
              </div>
              <input
                type="checkbox"
                checked={config.showTextOverlay}
                onChange={(e) => onChange({ showTextOverlay: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-white cursor-pointer"
              />
            </div>

            {config.showTextOverlay && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Şarkı / Parça Başlığı</label>
                  <input
                    type="text"
                    value={config.overlayTitle}
                    onChange={(e) => onChange({ overlayTitle: e.target.value })}
                    placeholder="Örn: CYBERPUNK 2088"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Alt Başlık / Sanatçı</label>
                  <input
                    type="text"
                    value={config.overlaySubtitle}
                    onChange={(e) => onChange({ overlaySubtitle: e.target.value })}
                    placeholder="Örn: FEAT. PULSEFX ORCHESTRA"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700/80 rounded-lg text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Yazı Efekti / Şekillendirme</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'neon', label: 'Neon Parlama' },
                      { id: 'kinetic', label: 'Kinetik Bas Zıplaması' },
                      { id: 'outline', label: 'Krom Çizgi (Outline)' },
                      { id: 'minimal', label: 'Minimal Tipografi' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => onChange({ overlayStyle: style.id as any })}
                        className={`px-2.5 py-1.5 text-xs rounded transition-colors text-left ${
                          config.overlayStyle === style.id
                            ? 'bg-neutral-800 text-white font-medium'
                            : 'bg-neutral-900/60 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Vurgu Rengi</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.overlayColor}
                      onChange={(e) => onChange({ overlayColor: e.target.value })}
                      className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-neutral-400">{config.overlayColor}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: DIŞA AKTAR ================= */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-900/40 rounded-xl border border-neutral-800 space-y-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Yüksek Çözünürlüklü Fotoğraf</span>
              </h4>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Mevcut parçacık pozisyonu ve arka plan ile kristal netliğinde PNG görseli indirir.
              </p>
              <button
                onClick={onTakeSnapshot}
                className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>HD Resim İndir (PNG)</span>
              </button>
            </div>

            {/* Resolution Selector */}
            <div className="p-3 bg-neutral-900/40 rounded-xl border border-neutral-800 space-y-2">
              <label className="text-white font-medium block text-xs">Video Çıktı Çözünürlüğü</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: '720p', label: '720p HD', desc: 'Hızlı & Düşük Boyut' },
                  { id: '1080p', label: '1080p FHD', desc: 'Standart Yüksek Kalite' },
                  { id: '2k', label: '2K QHD', desc: 'Ultra Net (2560x1440)' },
                ].map((res) => (
                  <button
                    key={res.id}
                    onClick={() => onChange({ resolution: res.id as any })}
                    className={`p-2 rounded-lg text-center border transition-colors ${
                      config.resolution === res.id
                        ? 'bg-neutral-800 border-cyan-400 text-white font-bold'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs uppercase">{res.id}</span>
                    <span className="block text-[9px] text-neutral-500 mt-0.5">{res.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FPS Selector */}
            <div className="p-3 bg-neutral-900/40 rounded-xl border border-neutral-800 space-y-2">
              <label className="text-white font-medium block text-xs">Video Kayıt & Önizleme Hızı (FPS)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 30, label: '30 FPS', desc: 'Standart Video Akışı' },
                  { id: 60, label: '60 FPS', desc: 'Ultra Akıcı Sinematik' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onChange({ fps: item.id as any })}
                    className={`p-2 rounded-lg text-center border transition-colors ${
                      config.fps === item.id
                        ? 'bg-neutral-800 border-cyan-400 text-white font-bold'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs font-mono">{item.label}</span>
                    <span className="block text-[9px] text-neutral-500 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* RMAFX Watermark Toggle */}
            <div className="p-3 bg-neutral-900/40 rounded-xl border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-white font-medium block text-xs">Sağ Altta RMAFX Filigranı</span>
                <span className="text-neutral-500 text-[10px]">Sağ altta zarif ve şık RMAFX logosu</span>
              </div>
              <input
                type="checkbox"
                checked={config.showRmaWatermark !== false}
                onChange={(e) => onChange({ showRmaWatermark: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-neutral-900/40 rounded-xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-400" />
                  <span>Müzikli Video Kaydedici</span>
                </h4>
                <span className="text-[10px] text-neutral-400 font-mono">Sınırsız Kayıt Destekli</span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Herhangi bir süre sınırı olmadan şarkının tamamını ses ve parçacıklarla birlikte WebM/MP4 formatında kaydedin.
              </p>

              {isRecording ? (
                <div className="p-3.5 bg-red-950/50 border border-red-700/80 rounded-xl text-center space-y-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping mx-auto" />
                  <p className="text-white font-bold text-sm">Kayıt Yapılıyor</p>
                  <p className="text-red-300 font-mono text-xs">{recordTimerText}</p>
                  <button
                    onClick={onStopRecord}
                    className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-colors shadow-lg"
                  >
                    Kaydı Bitir & İndir
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Unlimited Record Button */}
                  <button
                    onClick={() => onStartRecord(0)}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-amber-500 hover:opacity-95 text-neutral-950 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <Video className="w-4 h-4" />
                    <span>Sınırsız Kayıt Başlat (Manuel Durdur)</span>
                  </button>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => onStartRecord(15)}
                      className="py-2 px-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg text-center text-xs"
                    >
                      15s (Reels)
                    </button>
                    <button
                      onClick={() => onStartRecord(30)}
                      className="py-2 px-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg text-center text-xs"
                    >
                      30s
                    </button>
                    <button
                      onClick={() => onStartRecord(60)}
                      className="py-2 px-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg text-center text-xs"
                    >
                      60s (1 Dakika)
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-neutral-500 space-y-1 p-2">
              <p>💡 <strong className="text-neutral-400">Not:</strong> Video kaydında süre sınırı yoktur. "Sınırsız Kayıt" ile şarkınız bitene kadar kaydedip istediğiniz an durdurabilirsiniz.</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
