import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Upload, Mic, Volume2, Music, Sparkles } from 'lucide-react';
import { audioEngine, BUILTIN_TRACKS } from '../utils/audioEngine';
import { AudioAnalysis } from '../types';

interface AudioBarProps {
  audioAnalysis: AudioAnalysis;
  onAudioChange?: () => void;
}

export const AudioBar: React.FC<AudioBarProps> = ({ audioAnalysis }) => {
  const [isPlaying, setIsPlaying] = useState(audioEngine.isPlaying);
  const [currentTrack, setCurrentTrack] = useState(audioEngine.currentTrackTitle);
  const [inputMode, setInputMode] = useState(audioEngine.inputMode);
  const [volume, setVolume] = useState(0.85);
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = audioEngine.subscribe(() => {
      setIsPlaying(audioEngine.isPlaying);
      setCurrentTrack(audioEngine.currentTrackTitle);
      setInputMode(audioEngine.inputMode);
    });
    return () => {
      unsub();
    };
  }, []);

  const handlePlayToggle = async () => {
    if (!audioEngine.isPlaying && inputMode === 'builtin' && !audioEngine.currentTrackTitle) {
      await audioEngine.playBuiltin('cyberwave');
    } else {
      audioEngine.togglePlay();
    }
  };

  const handleSelectTrack = async (trackId: string) => {
    setMicActive(false);
    await audioEngine.playBuiltin(trackId);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMicActive(false);
      audioEngine.loadAudioFile(file);
    }
  };

  const handleToggleMic = async () => {
    setMicError(null);
    if (micActive) {
      audioEngine.stopAll();
      setMicActive(false);
    } else {
      try {
        await audioEngine.startMicrophone();
        setMicActive(true);
      } catch {
        setMicError('Mikrofon erişimi sağlanamadı. Tarayıcı izinlerini kontrol edin.');
        setTimeout(() => setMicError(null), 4000);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
  };

  // Mini frequency visualizer on the player
  const freqSample = Array.from(audioAnalysis.frequencyData.slice(0, 32));

  return (
    <footer className="h-16 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 z-30 shrink-0">
      {/* Left: Track Information & Audio Mode */}
      <div className="flex items-center gap-3 min-w-[200px] max-w-[280px]">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${
          isPlaying
            ? 'bg-neutral-900 border-neutral-700 text-white'
            : 'bg-neutral-900/50 border-neutral-800 text-neutral-500'
        }`}>
          {micActive ? <Mic className="w-5 h-5 text-red-400 animate-pulse" /> : <Music className="w-5 h-5" />}
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-semibold text-white truncate font-['Plus_Jakarta_Sans',sans-serif]">
            {currentTrack || 'Cyberwave Odyssey'}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
            <span>{inputMode === 'mic' ? 'Canlı Mikrofon' : inputMode === 'file' ? 'Özel Dosya' : 'Sentez Müzik'}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {Math.floor(audioEngine.currentTime / 60)}:
              {Math.floor(audioEngine.currentTime % 60).toString().padStart(2, '0')}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400 font-semibold">{audioAnalysis.bpm || 124} BPM</span>
          </div>
        </div>
      </div>

      {/* Center: Play Transport, Track Switchers & Live Waveform */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-center max-w-2xl">
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayToggle}
          className="w-10 h-10 rounded-full bg-white text-neutral-950 hover:bg-neutral-200 flex items-center justify-center transition-transform active:scale-95 shadow-md shrink-0"
          title={isPlaying ? 'Durdur' : 'Oynat'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Builtin Track Presets Selector */}
        <div className="hidden md:flex items-center gap-1 bg-neutral-900/80 p-1 rounded-lg border border-neutral-800/80">
          {BUILTIN_TRACKS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTrack(t.id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                inputMode === 'builtin' && currentTrack === t.title
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {t.title.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Live Audio Spectrum HUD Bars */}
        <div className="hidden lg:flex items-end gap-[2px] h-6 px-3 bg-neutral-900/40 rounded border border-neutral-800/60">
          {freqSample.map((val, idx) => {
            const heightPct = Math.max(8, (val / 255) * 100);
            return (
              <div
                key={idx}
                className="w-1 bg-neutral-400 rounded-t-xs transition-all duration-75"
                style={{
                  height: `${heightPct}%`,
                  opacity: 0.3 + (val / 255) * 0.7,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Right: Audio Input Upload, Mic, Volume */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative">
        {micError && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-red-950/90 border border-red-500/60 text-red-200 text-xs rounded-lg shadow-xl backdrop-blur-md whitespace-nowrap animate-fade-in pointer-events-none z-50">
            {micError}
          </div>
        )}
        {/* Upload Custom Audio File */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors whitespace-nowrap"
          title="Kendi Müziğini Yükle (MP3, WAV, FLAC)"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ses Yükle</span>
        </button>

        {/* Mic Toggle Button */}
        <button
          onClick={handleToggleMic}
          className={`p-1.5 rounded-lg border transition-colors ${
            micActive
              ? 'bg-red-500/20 border-red-500/50 text-red-400'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800 hover:bg-neutral-800'
          }`}
          title="Canlı Mikrofon / Harici Giriş"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Volume Slider */}
        <div className="hidden xl:flex items-center gap-1.5 text-neutral-400">
          <Volume2 className="w-4 h-4 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-300"
          />
        </div>
      </div>
    </footer>
  );
};
