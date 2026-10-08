export interface LrcLine {
  id: string;
  time: number; // time in seconds (e.g. 12.45)
  text: string; // lyric text (e.g. "We are the sonic storm")
  endTime?: number; // optional end time
}

export interface LrcMetadata {
  title?: string;
  artist?: string;
  album?: string;
  by?: string;
  offset?: number; // millisecond offset
}

export interface ParsedLrc {
  lines: LrcLine[];
  meta: LrcMetadata;
}

/**
 * Parses standard .lrc file text with milliseconds precision:
 * [mm:ss.xx] or [mm:ss.xxx] or [mm:ss:xx]
 * Also supports multi-timestamp lines: [00:12.00][00:15.00]Lyric
 */
export function parseLrc(content: string): ParsedLrc {
  const lines: LrcLine[] = [];
  const meta: LrcMetadata = {};

  const rawLines = content.split(/\r?\n/);
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3})|:(\d{2,3}))?\]/g;
  const metaRegex = /^\[([a-zA-Z]+):(.*)\]$/;

  let lineCounter = 0;

  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Check for metadata tags like [ti:Title], [ar:Artist], etc.
    const metaMatch = trimmed.match(metaRegex);
    if (metaMatch && !timeRegex.test(trimmed)) {
      const tag = metaMatch[1].toLowerCase();
      const val = metaMatch[2].trim();
      if (tag === 'ti' || tag === 'title') meta.title = val;
      else if (tag === 'ar' || tag === 'artist') meta.artist = val;
      else if (tag === 'al' || tag === 'album') meta.album = val;
      else if (tag === 'by') meta.by = val;
      else if (tag === 'offset') meta.offset = parseFloat(val) || 0;
      continue;
    }

    // Extract all timestamps in the line
    const timestamps: number[] = [];
    let match: RegExpExecArray | null;
    timeRegex.lastIndex = 0;

    while ((match = timeRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const fractionStr = match[3] || match[4] || '0';
      const fraction = fractionStr.length === 3 ? parseInt(fractionStr, 10) / 1000 : parseInt(fractionStr, 10) / 100;
      const totalSeconds = minutes * 60 + seconds + fraction;
      timestamps.push(totalSeconds);
    }

    // The lyric text is everything after the last timestamp tag
    const text = trimmed.replace(timeRegex, '').trim();

    if (timestamps.length > 0 && text) {
      for (const t of timestamps) {
        lineCounter++;
        lines.push({
          id: `lrc-${lineCounter}-${t.toFixed(2)}`,
          time: t,
          text,
        });
      }
    }
  }

  // Sort chronological
  lines.sort((a, b) => a.time - b.time);

  // Compute endTimes
  for (let i = 0; i < lines.length; i++) {
    if (i < lines.length - 1) {
      lines[i].endTime = lines[i + 1].time;
    } else {
      lines[i].endTime = lines[i].time + 5.0; // default last line length 5s
    }
  }

  return { lines, meta };
}

/**
 * Sample Builtin Demo LRC tracks matching our builtin audio tracks!
 */
export const SAMPLE_LRC_CYBERWAVE = `[ti:Cyberwave Odyssey]
[ar:RMAFX Sound Engine]
[al:Synthetic Dimensions]
[00:00.00]⚡ RMAFX CYBERWAVE ODYSSEY
[00:04.50]🌌 Kuantum parçacıkları uyanıyor
[00:08.20]⚡ Neon hatları titreşiyor
[00:12.40]🔥 Düşük bas frekansı yükseliyor
[00:16.80]🚀 RIDVAN ALTINAY STUDIO
[00:20.50]💎 Cyan ve Altın enerji dalgaları
[00:24.75]💥 BASS DROP DETECTED!
[00:28.90]🌪️ Girdap hızlanıyor, ışık fırtınası
[00:33.20]✨ Ses dalgaları parçacıklara dönüşüyor
[00:37.80]🎵 Ritmin nabzını hisset
[00:42.50]🪐 Yıldızlararası ses köprüsü
[00:48.00]👑 RMAFX AUDIO VISUALIZER
[00:54.20]⚡ Ultra Hassas Milisaniyelik Senkronizasyon
[01:00.00]🔥 Enerji zirveye ulaştı!`;

export const SAMPLE_LRC_TRAP = `[ti:Deep Neon Trap]
[ar:RMAFX Trap Beats]
[00:00.00]🔥 DEEP NEON TRAP BEAT
[00:03.80]💣 808 Bas gücü yükleniyor
[00:07.40]⚡ Hi-hat dizilimi hızlandı
[00:11.20]💥 DROP! BASS QUAKE!
[00:15.50]🚀 Parçacıklar patlıyor
[00:19.80]💎 Elmas kıvılcımlar havada
[00:24.00]🌪️ Döner sarmal şok dalgası
[00:29.00]👑 RIDVAN ALTINAY — RMAFX
[00:34.50]⚡ Tam senkronize vuruş!`;
