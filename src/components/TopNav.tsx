import React from 'react';
import { Camera, Video, Maximize2, Minimize2, LayoutTemplate, Columns, Info } from 'lucide-react';
import { AspectRatioType, ResolutionType, LayoutMode } from '../types';

interface TopNavProps {
  aspectRatio: AspectRatioType;
  onAspectRatioChange: (ratio: AspectRatioType) => void;
  resolution: ResolutionType;
  onResolutionChange: (res: ResolutionType) => void;
  fps: 30 | 60;
  onFpsChange: (fps: 30 | 60) => void;
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  onTakeSnapshot: () => void;
  onToggleRecord: () => void;
  isRecording: boolean;
  recordTimerText: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAbout: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  aspectRatio,
  onAspectRatioChange,
  resolution,
  onResolutionChange,
  fps,
  onFpsChange,
  layoutMode,
  onLayoutModeChange,
  onTakeSnapshot,
  onToggleRecord,
  isRecording,
  recordTimerText,
  isFullscreen,
  onToggleFullscreen,
  activeTab,
  onTabChange,
  onOpenAbout,
}) => {
  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Zone 1: Symmetrical Brand Identity (Emblem + Wordmark + Tag) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          {/* Symmetrical Dual-Tone RMA Circular Emblem */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-sky-500 to-amber-400 p-[1.5px] shadow-lg shadow-cyan-500/25 flex items-center justify-center">
            <div className="w-full h-full rounded-[6px] bg-neutral-950 flex items-center justify-center">
              <span className="font-['Syne',sans-serif] font-black text-[11px] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-amber-300">
                RMA
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-wider text-white font-['Syne',sans-serif] leading-tight">
              RMA<span className="text-cyan-400">FX</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase leading-none">
              Studio v2.4
            </span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-neutral-800 text-xs text-neutral-400 font-['Plus_Jakarta_Sans',sans-serif]">
          <span>Müzik & Parçacık Video Stüdyosu</span>
        </div>
      </div>

      {/* Zone 2: Studio Navigation Switchers */}
      <nav className="hidden xl:flex items-center gap-1 bg-neutral-900/80 p-1 rounded-lg border border-neutral-800/80">
        {[
          { id: 'shape', label: 'RMA & Şekiller' },
          { id: 'beat-sync', label: 'Beat-Sync FX' },
          { id: 'motion', label: 'Hareket & Ritim' },
          { id: 'particles', label: 'Parçacıklar' },
          { id: 'background', label: 'Arka Plan' },
          { id: 'overlay', label: 'Tipografi' },
          { id: 'export', label: 'Dışa Aktar' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Zone 3: Symmetrical Action Tools (FPS, Resolution, Layout, About, Record) */}
      <div className="flex items-center gap-2">
        {/* About (Hakkında - Rıdvan Altınay & Instagram) Button */}
        <button
          onClick={onOpenAbout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-gradient-to-r from-cyan-950/40 to-neutral-900 hover:border-cyan-500/50 border border-neutral-800 rounded-lg text-neutral-300 hover:text-white transition-all shadow-xs"
          title="Geliştirici & Hakkında (Rıdvan Altınay)"
        >
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline text-[11px] font-semibold">Hakkında</span>
        </button>

        {/* FPS Switcher Button (30 FPS / 60 FPS) */}
        <div className="flex items-center bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-xs">
          {([30, 60] as (30 | 60)[]).map((f) => (
            <button
              key={f}
              onClick={() => onFpsChange(f)}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                fps === f
                  ? 'bg-neutral-800 text-cyan-300 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title={`${f} FPS Hedef Akıcılık`}
            >
              {f} FPS
            </button>
          ))}
        </div>

        {/* Resolution Selector (720p, 1080p, 2K) */}
        <div className="hidden sm:flex items-center bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-xs">
          {(['720p', '1080p', '2k'] as ResolutionType[]).map((res) => (
            <button
              key={res}
              onClick={() => onResolutionChange(res)}
              className={`px-2 py-1 rounded text-[10px] font-mono uppercase transition-colors ${
                resolution === res
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {res}
            </button>
          ))}
        </div>

        {/* Layout Toggle (Top-Bottom vs Side-by-Side) */}
        <button
          onClick={() =>
            onLayoutModeChange(layoutMode === 'top-preview' ? 'side-by-side' : 'top-preview')
          }
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-300 transition-colors"
          title="Görünüm Düzenini Değiştir"
        >
          {layoutMode === 'top-preview' ? (
            <>
              <LayoutTemplate className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px]">Alt Konsol</span>
            </>
          ) : (
            <>
              <Columns className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px]">Yan Panel</span>
            </>
          )}
        </button>

        {/* Snapshot PNG */}
        <button
          onClick={onTakeSnapshot}
          title="HD Fotoğraf Kaydet (PNG)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors whitespace-nowrap"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Fotoğraf</span>
        </button>

        {/* Video Record (Unlimited / Sınırsız Video Kaydı) */}
        <button
          onClick={onToggleRecord}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
              : 'bg-white text-neutral-950 hover:bg-neutral-200 shadow-sm'
          }`}
          title={isRecording ? 'Kaydı Durdur ve İndir' : 'Video Kaydını Başlat'}
        >
          <Video className="w-3.5 h-3.5" />
          <span>{isRecording ? recordTimerText : 'Video Kaydet'}</span>
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          title="Tam Ekran"
          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
