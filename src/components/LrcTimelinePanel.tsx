import React, { useRef, useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Clock, 
  Sparkles, 
  Eye, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Check, 
  Music2, 
  Volume2,
  ChevronRight,
  ListMusic,
  Mic,
  MicOff,
  Wand2,
  AlertCircle
} from 'lucide-react';
import { VisualizerConfig } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { parseLrc, ParsedLrc, SAMPLE_LRC_CYBERWAVE, SAMPLE_LRC_TRAP, LrcLine } from '../utils/lrcParser';

interface LrcTimelinePanelProps {
  config: VisualizerConfig;
  onChange: (patch: Partial<VisualizerConfig>) => void;
  currentLyricLine?: string | null;
}

// Check Web Speech API support
type SpeechRecognitionType = any;
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionType;
    webkitSpeechRecognition?: SpeechRecognitionType;
  }
}

export const LrcTimelinePanel: React.FC<LrcTimelinePanelProps> = ({
  config,
  onChange,
  currentLyricLine,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const [parsed, setParsed] = useState<ParsedLrc>(() => parseLrc(config.lrcContent || SAMPLE_LRC_CYBERWAVE));
  const [audioTime, setAudioTime] = useState<number>(0);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechLang, setSpeechLang] = useState<'tr-TR' | 'en-US'>('tr-TR');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Quick plain text paste modal / state
  const [showPasteModal, setShowPasteModal] = useState<boolean>(false);
  const [pastedLyricsText, setPastedLyricsText] = useState<string>('');

  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechSupported(false);
    }
  }, []);

  // Sync internal parser when config.lrcContent changes
  useEffect(() => {
    if (config.lrcContent) {
      const res = parseLrc(config.lrcContent);
      setParsed(res);
    }
  }, [config.lrcContent]);

  // Subscribe to audio engine playback clock for live millisecond-precision tracking
  useEffect(() => {
    const unsub = audioEngine.subscribe(() => {
      const curTime = audioEngine.currentTime + (config.lrcTimeOffsetMs || 0) / 1000;
      setAudioTime(curTime);

      // Find current active lyric line
      const lines = parsed.lines;
      let found: LrcLine | null = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextTime = lines[i + 1]?.time ?? line.time + 6.0;
        if (curTime >= line.time && curTime < nextTime) {
          found = line;
          break;
        }
      }

      if (found) {
        setActiveLineId(found.id);
      } else if (lines.length > 0 && curTime < lines[0].time) {
        setActiveLineId(null);
      }
    });

    return () => unsub();
  }, [parsed, config.lrcTimeOffsetMs]);

  // Auto-scroll active line into view
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeLineId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onChange({
            lrcContent: content,
            lrcEnabled: true,
          });
          setStatusMessage(`"${file.name}" başarıyla yüklendi!`);
          setTimeout(() => setStatusMessage(null), 3500);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLoadPreset = (content: string) => {
    onChange({
      lrcContent: content,
      lrcEnabled: true,
    });
  };

  const handleSeekToLine = (time: number) => {
    audioEngine.seek(Math.max(0, time - (config.lrcTimeOffsetMs || 0) / 1000));
  };

  const formatLrcTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Start Real-time Speech-to-Text Recognition from Audio / Microphone
  const startSpeechRecognition = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setStatusMessage('⚠️ Tarayıcınız Web Speech API ses tanıma özelliğini desteklemiyor. Lütfen Chrome, Edge veya Safari kullanın.');
      setTimeout(() => setStatusMessage(null), 4500);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('🎙️ Ses dinleniyor... Şarkıyı başlatın veya mikrofona konuşun.');
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.trim();
          if (event.results[i].isFinal) {
            if (transcript.length > 0) {
              // Current playback time in seconds
              const stampSec = Math.max(0, audioEngine.currentTime);
              const timeTag = `[${formatLrcTime(stampSec)}]`;
              const newLine = `${timeTag} ${transcript}`;

              // Append to existing LRC content
              const currentLrc = config.lrcContent || '';
              const updatedLrc = currentLrc.trim() 
                ? `${currentLrc.trim()}\n${newLine}` 
                : `[ti:${audioEngine.currentTrackTitle}]\n${newLine}`;

              onChange({
                lrcContent: updatedLrc,
                lrcEnabled: true,
              });

              setLiveTranscript(transcript);
              setStatusMessage(`Söz eklendi: "${transcript}" (${formatLrcTime(stampSec)})`);
            }
          } else {
            interimText += transcript;
          }
        }
        if (interimText) {
          setLiveTranscript(interimText);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        if (err.error !== 'no-speech') {
          setStatusMessage(`Ses algılama uyarısı: ${err.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();

      // Ensure audio engine is also playing so time advances
      if (!audioEngine.isPlaying) {
        audioEngine.resume();
      }
    } catch (e: any) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setStatusMessage('Dinleme durduruldu. Eklenen sözler zaman çizelgesine kaydedildi.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Auto-sync plain text lyrics across song duration
  const handleAutoSyncPlainText = () => {
    if (!pastedLyricsText.trim()) return;

    const rawLines = pastedLyricsText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('['));

    if (rawLines.length === 0) return;

    const totalDuration = audioEngine.duration || 120;
    const interval = Math.max(3.5, (totalDuration * 0.85) / rawLines.length);

    let generatedLrc = `[ti:${audioEngine.currentTrackTitle}]\n[by:RMAFX AI Sync]\n`;
    rawLines.forEach((text, idx) => {
      const timeSec = 3.0 + idx * interval;
      generatedLrc += `[${formatLrcTime(timeSec)}] ${text}\n`;
    });

    onChange({
      lrcContent: generatedLrc,
      lrcEnabled: true,
    });

    setShowPasteModal(false);
    setPastedLyricsText('');
    setStatusMessage(`${rawLines.length} satır şarkı sözü müziğe eşit ritimle senkronize edildi!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-3.5 bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800">
      {/* Header and Master Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ListMusic className="w-4 h-4" />
          </div>
          <div>
            <span className="text-white font-semibold block text-xs">
              LRC / Şarkı Sözü Zaman Çizelgesi
            </span>
            <span className="text-neutral-500 text-[10px]">
              Sesten otomatik tanıma & milisaniyelik senkronize altyazı
            </span>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.lrcEnabled}
            onChange={(e) => onChange({ lrcEnabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
        </label>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-[11px] text-cyan-200 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate flex-1">{statusMessage}</span>
        </div>
      )}

      {config.lrcEnabled && (
        <div className="space-y-3">
          {/* ================= Sesten Otomatik Tanıma (Speech Recognition) ================= */}
          <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" />
                Sesten Sözleri Otomatik Tanı
              </span>
              <div className="flex items-center gap-1">
                <select
                  value={speechLang}
                  onChange={(e) => setSpeechLang(e.target.value as any)}
                  className="bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 rounded px-1.5 py-0.5"
                >
                  <option value="tr-TR">Türkçe (TR)</option>
                  <option value="en-US">English (EN)</option>
                </select>
              </div>
            </div>

            <p className="text-[10px] text-neutral-400">
              Şarkı çalarken sözleri anlık dinleyip milisaniyelik zaman damgasıyla (.lrc) zaman çizelgesine otomatik kaydeder.
            </p>

            <div className="flex items-center gap-2">
              {!isListening ? (
                <button
                  onClick={startSpeechRecognition}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 rounded-lg text-xs font-medium transition-all"
                >
                  <Mic className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sesten Dinlemeyi Başlat (Speech-to-Text)</span>
                </button>
              ) : (
                <button
                  onClick={stopSpeechRecognition}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-500/25 hover:bg-red-500/35 border border-red-400/60 text-red-200 rounded-lg text-xs font-medium transition-all animate-pulse"
                >
                  <MicOff className="w-3.5 h-3.5 text-red-400" />
                  <span>Dinlemeyi Durdur ({liveTranscript || 'Dinleniyor...'})</span>
                </button>
              )}

              <button
                onClick={() => setShowPasteModal(!showPasteModal)}
                className="px-2.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs border border-neutral-700 font-medium"
                title="Düz metin yapıştırıp müziğe ritimle dağıt"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>

            {/* Quick paste text drawer */}
            {showPasteModal && (
              <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800 space-y-2 mt-2">
                <label className="block text-[11px] text-neutral-300 font-medium">
                  Şarkı Sözlerini Buraya Yapıştırın (Her satır bir söz):
                </label>
                <textarea
                  rows={4}
                  value={pastedLyricsText}
                  onChange={(e) => setPastedLyricsText(e.target.value)}
                  placeholder="Gözlerimde parlayan neon ışıklar&#10;Gecenin ritmiyle yükselen adımlar&#10;Bass vurdukça dağılmayan enerji..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => setShowPasteModal(false)}
                    className="px-2.5 py-1 text-[11px] bg-neutral-800 text-neutral-400 rounded"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleAutoSyncPlainText}
                    className="px-3 py-1 text-[11px] bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium flex items-center gap-1"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Müziğe Otomatik Senkronla</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preset Buttons & Upload */}
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".lrc,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-medium transition-colors"
              title=".lrc veya .txt şarkı sözü dosyası yükle"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>.LRC Dosyası Yükle</span>
            </button>

            <button
              onClick={() => handleLoadPreset(SAMPLE_LRC_CYBERWAVE)}
              className="px-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700/60 rounded-lg text-[11px] transition-colors"
            >
              ⚡ Cyberwave (.lrc)
            </button>

            <button
              onClick={() => handleLoadPreset(SAMPLE_LRC_TRAP)}
              className="px-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700/60 rounded-lg text-[11px] transition-colors"
            >
              🔥 Trap (.lrc)
            </button>
          </div>

          {/* Metadata Display */}
          {(parsed.meta.title || parsed.meta.artist) && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-neutral-950/70 rounded-lg border border-neutral-800/80 text-[11px]">
              <Music2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-white font-medium truncate">
                {parsed.meta.title || 'Başlık Yok'}
              </span>
              {parsed.meta.artist && (
                <span className="text-neutral-500 truncate">
                  — {parsed.meta.artist}
                </span>
              )}
            </div>
          )}

          {/* Active Highlight Banner */}
          <div className="p-2.5 bg-neutral-950/80 rounded-lg border border-cyan-500/30">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
              <span className="flex items-center gap-1 text-cyan-400 font-mono font-semibold">
                <Clock className="w-3 h-3" />
                {formatLrcTime(audioTime)}
              </span>
              <span className="font-mono text-neutral-500">
                {parsed.lines.length} Zaman Damgası
              </span>
            </div>
            <p className="text-sm font-bold text-white font-['Syne',sans-serif] tracking-wide truncate">
              {currentLyricLine || (
                <span className="text-neutral-500 italic font-normal text-xs">
                  (Müzik başladığında aktif şarkı sözü burada belirir)
                </span>
              )}
            </p>
          </div>

          {/* Interactive Timeline Scroll Area */}
          <div>
            <label className="block text-neutral-400 text-[11px] mb-1.5">
              Zaman Çizelgesi Satırları (Tıklayarak o saniyeye atlayın):
            </label>
            <div className="max-h-44 overflow-y-auto space-y-1 pr-1 bg-neutral-950/50 p-1.5 rounded-lg border border-neutral-800/80 scrollbar-thin">
              {parsed.lines.length === 0 ? (
                <p className="p-3 text-center text-neutral-500 text-xs">
                  Henüz geçerli bir .lrc satırı yüklenmedi veya sesten kaydedilmedi.
                </p>
              ) : (
                parsed.lines.map((line) => {
                  const isActive = activeLineId === line.id;
                  return (
                    <div
                      key={line.id}
                      ref={isActive ? activeLineRef : undefined}
                      onClick={() => handleSeekToLine(line.time)}
                      className={`flex items-center justify-between p-1.5 rounded text-xs cursor-pointer transition-all ${
                        isActive
                          ? 'bg-cyan-500/20 border border-cyan-400/80 text-white font-semibold shadow-xs pl-2.5'
                          : 'hover:bg-neutral-800/60 text-neutral-400 hover:text-neutral-200 border border-transparent'
                      }`}
                    >
                      <span className="truncate flex-1 mr-2">
                        {isActive && <span className="inline-block text-cyan-400 mr-1.5">▶</span>}
                        {line.text}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-500 shrink-0 tabular-nums">
                        {formatLrcTime(line.time)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Dual Sync Options */}
          <div className="space-y-2 pt-1 border-t border-neutral-800/80">
            {/* Sync to Particles Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-neutral-300 font-medium block text-xs">
                  Parçacıkları Sözlere Dönüştür
                </span>
                <span className="text-neutral-500 text-[10px]">
                  Aktif satır geldikçe parçacıklar harflere morflanır
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.lrcSyncParticles}
                onChange={(e) => onChange({ lrcSyncParticles: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Subtitle Banner on Canvas */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-neutral-300 font-medium block text-xs">
                  Ekranda Altyazı Rozeti Göster
                </span>
                <span className="text-neutral-500 text-[10px]">
                  Video önizlemesinin alt kısmında neon rozet altyazı
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.lrcShowSubtitleOverlay}
                onChange={(e) => onChange({ lrcShowSubtitleOverlay: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Time Offset Calibration */}
            <div className="pt-1">
              <div className="flex justify-between text-neutral-400 text-[11px] mb-1">
                <span>Zaman Kalibrasyonu (Gecikme Telafisi)</span>
                <span className="font-mono tabular-nums text-cyan-400 font-semibold">
                  {config.lrcTimeOffsetMs > 0 ? `+${config.lrcTimeOffsetMs}` : config.lrcTimeOffsetMs} ms
                </span>
              </div>
              <input
                type="range"
                min="-1500"
                max="1500"
                step="50"
                value={config.lrcTimeOffsetMs}
                onChange={(e) => onChange({ lrcTimeOffsetMs: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
                <span>-1.5s Erken</span>
                <span>0 ms (Doğal)</span>
                <span>+1.5s Geç</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
