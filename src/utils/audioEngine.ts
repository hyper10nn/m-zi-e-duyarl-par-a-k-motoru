import { AudioAnalysis } from '../types';

export interface BuiltinTrack {
  id: string;
  title: string;
  genre: string;
  bpm: number;
}

export const BUILTIN_TRACKS: BuiltinTrack[] = [
  { id: 'cyberwave', title: 'Cyberwave Odyssey', genre: 'Synthwave / Retro', bpm: 124 },
  { id: 'trap', title: 'Deep Neon Trap', genre: 'Bass / 808 Trap', bpm: 140 },
  { id: 'lofi', title: 'Cosmic Lo-Fi Dream', genre: 'Chill / Ambient', bpm: 85 },
  { id: 'techno', title: 'Techno Pulse Rush', genre: 'Club / Driving', bpm: 130 },
];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private mediaStreamDest: MediaStreamAudioDestinationNode | null = null;

  // Synthesis engine state
  private isSynthesizing = false;
  private synthInterval: number | null = null;
  private synthStep = 0;
  private currentTrackId = 'cyberwave';

  // Custom audio element state
  private customAudioEl: HTMLAudioElement | null = null;
  private customSourceNode: MediaElementAudioSourceNode | null = null;
  private micStream: MediaStream | null = null;
  private micSourceNode: MediaStreamAudioSourceNode | null = null;

  // Analysis buffers
  private freqArray: Uint8Array = new Uint8Array(256);
  private timeArray: Uint8Array = new Uint8Array(256);
  private beatThreshold = 0.55;
  private beatDecay = 0.02;
  private snareThreshold = 0.50;
  private hihatThreshold = 0.45;
  private manualBeatTrigger: 'kick' | 'snare' | 'hihat' | null = null;
  private beatTimes: number[] = [];
  public currentBpm = 124;

  // Status
  public isPlaying = false;
  public inputMode: 'builtin' | 'file' | 'mic' = 'builtin';
  public currentTrackTitle = 'Cyberwave Odyssey';
  public currentTime = 0;
  public duration = 120; // 2 min synthetic loop or file duration

  private listeners: Set<() => void> = new Set();

  constructor() {
    // Lazy initialize on user gesture
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public async initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.8;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.85;

      this.mediaStreamDest = this.ctx.createMediaStreamDestination();

      // Master connections
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
      this.analyser.connect(this.mediaStreamDest);

      this.freqArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public getMediaStream(): MediaStream | null {
    return this.mediaStreamDest ? this.mediaStreamDest.stream : null;
  }

  public setVolume(vol: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public async playBuiltin(trackId: string = 'cyberwave') {
    await this.initContext();
    this.stopAll();

    this.inputMode = 'builtin';
    this.currentTrackId = trackId;
    const track = BUILTIN_TRACKS.find((t) => t.id === trackId) || BUILTIN_TRACKS[0];
    this.currentTrackTitle = track.title;
    this.isPlaying = true;
    this.isSynthesizing = true;
    this.synthStep = 0;
    this.duration = 180; // synthetic loop

    this.startSynthesizer(track.bpm);
    this.notify();
  }

  public async loadAudioFile(file: File) {
    await this.initContext();
    this.stopAll();

    this.inputMode = 'file';
    this.currentTrackTitle = file.name.replace(/\.[^/.]+$/, '');

    const objectUrl = URL.createObjectURL(file);
    const audio = new Audio();
    audio.src = objectUrl;
    audio.loop = true;
    this.customAudioEl = audio;

    audio.onloadedmetadata = () => {
      this.duration = audio.duration || 180;
      this.notify();
    };

    audio.ontimeupdate = () => {
      this.currentTime = audio.currentTime;
      this.notify();
    };

    if (this.ctx && this.gainNode) {
      this.customSourceNode = this.ctx.createMediaElementSource(audio);
      this.customSourceNode.connect(this.gainNode);
    }

    await audio.play();
    this.isPlaying = true;
    this.notify();
  }

  public async startMicrophone() {
    await this.initContext();
    this.stopAll();

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (this.ctx && this.gainNode) {
        this.micSourceNode = this.ctx.createMediaStreamSource(this.micStream);
        // Connect mic only to analyser to avoid acoustic feedback loop through speakers!
        if (this.analyser) {
          this.micSourceNode.connect(this.analyser);
        }
      }

      this.inputMode = 'mic';
      this.currentTrackTitle = 'Canlı Mikrofon Girişi';
      this.isPlaying = true;
      this.notify();
    } catch (err) {
      console.error('Microphone access denied:', err);
      throw err;
    }
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public seek(seconds: number) {
    const clamped = Math.max(0, Math.min(this.duration || 180, seconds));
    this.currentTime = clamped;
    if (this.customAudioEl) {
      this.customAudioEl.currentTime = clamped;
    }
    this.notify();
  }

  public pause() {
    if (!this.isPlaying) return;

    if (this.inputMode === 'builtin') {
      this.stopSynthesizer();
    } else if (this.inputMode === 'file' && this.customAudioEl) {
      this.customAudioEl.pause();
    } else if (this.inputMode === 'mic') {
      this.stopMic();
    }

    this.isPlaying = false;
    this.notify();
  }

  public async resume() {
    await this.initContext();
    if (this.inputMode === 'builtin') {
      const track = BUILTIN_TRACKS.find((t) => t.id === this.currentTrackId) || BUILTIN_TRACKS[0];
      this.startSynthesizer(track.bpm);
    } else if (this.inputMode === 'file' && this.customAudioEl) {
      await this.customAudioEl.play();
    } else if (this.inputMode === 'mic') {
      await this.startMicrophone();
    }

    this.isPlaying = true;
    this.notify();
  }

  public stopAll() {
    this.stopSynthesizer();
    if (this.customAudioEl) {
      this.customAudioEl.pause();
      this.customAudioEl.currentTime = 0;
      this.customAudioEl = null;
    }
    if (this.customSourceNode) {
      this.customSourceNode.disconnect();
      this.customSourceNode = null;
    }
    this.stopMic();
    this.isPlaying = false;
    this.currentTime = 0;
  }

  private stopMic() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.micSourceNode) {
      this.micSourceNode.disconnect();
      this.micSourceNode = null;
    }
  }

  // High-fidelity procedural music synth engine
  private startSynthesizer(bpm: number) {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
    }
    const stepDurationMs = (60 / bpm / 4) * 1000; // 16th notes

    this.synthInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.gainNode) return;
      this.playSynthStep(this.synthStep, this.currentTrackId);
      this.synthStep = (this.synthStep + 1) % 64; // 4 bar loop
      this.currentTime += stepDurationMs / 1000;
      if (this.currentTime >= this.duration) {
        this.currentTime = 0;
      }
    }, stepDurationMs);
  }

  private stopSynthesizer() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.isSynthesizing = false;
  }

  private playSynthStep(step: number, trackId: string) {
    if (!this.ctx || !this.gainNode) return;
    const now = this.ctx.currentTime;
    const step16 = step % 16;

    if (trackId === 'cyberwave') {
      // Kick on 0, 4, 8, 12
      if (step16 % 4 === 0) {
        this.synthKick(now, 140, 45, 0.28, 0.95);
      }
      // Snare on 4, 12
      if (step16 === 4 || step16 === 12) {
        this.synthSnare(now, 220, 0.2, 0.7);
      }
      // Hi-hat every even 16th note
      if (step16 % 2 === 0) {
        this.synthHiHat(now, 0.05, step16 % 4 === 2 ? 0.35 : 0.2);
      }
      // Synthwave rolling bassline (A minor / F / C / G)
      const bar = Math.floor(step / 16);
      const rootNotes = [110, 87.31, 130.81, 98]; // A2, F2, C3, G2
      const root = rootNotes[bar % 4];
      if (step16 % 2 === 0) {
        this.synthBass(now, root, 0.12, 'sawtooth', 0.5);
      } else {
        this.synthBass(now, root * 2, 0.08, 'sawtooth', 0.35);
      }
      // Synth Lead arpeggio
      const arpScales = [
        [440, 523.25, 659.25, 880], // A minor
        [349.23, 440, 523.25, 698.46], // F maj
        [523.25, 659.25, 783.99, 1046.5], // C maj
        [392, 493.88, 587.33, 783.99], // G maj
      ];
      const curScale = arpScales[bar % 4];
      const noteFreq = curScale[step16 % 4];
      this.synthLead(now, noteFreq, 0.14, 'square', 0.25);
    } else if (trackId === 'trap') {
      // 808 Trap Kick
      if (step16 === 0 || step16 === 7 || step16 === 10) {
        this.synthKick(now, 110, 36, 0.45, 1.0);
      }
      // Crisp trap snare on 8
      if (step16 === 8) {
        this.synthSnare(now, 320, 0.25, 0.85);
      }
      // Trap rolling hi-hats with triplets
      const hatProb = (step % 8 >= 4) ? 0.03 : 0.06;
      this.synthHiHat(now, hatProb, 0.3);
      // Heavy 808 Sub glide
      if (step16 === 0 || step16 === 6) {
        this.synth808Sub(now, 45, 0.6);
      }
      // Dark bell chime
      if (step16 === 0 || step16 === 4 || step16 === 12) {
        this.synthLead(now, 587.33 * (step16 === 12 ? 1.25 : 1), 0.3, 'sine', 0.3);
      }
    } else if (trackId === 'lofi') {
      // Relaxed boom-bap kick
      if (step16 === 0 || step16 === 10) {
        this.synthKick(now, 100, 50, 0.22, 0.7);
      }
      // Warm brushed rim/snare on 4 and 12
      if (step16 === 4 || step16 === 12) {
        this.synthSnare(now, 180, 0.15, 0.45);
      }
      // Vinyl hi-hat
      if (step16 % 4 === 2) {
        this.synthHiHat(now, 0.08, 0.2);
      }
      // Warm Rhodes chords
      if (step16 === 0 || step16 === 8) {
        const chordNotes = [261.63, 329.63, 392.0, 493.88]; // Cmaj7
        chordNotes.forEach((freq) => this.synthLead(now, freq, 0.8, 'sine', 0.15));
      }
    } else {
      // Techno driving 4/4
      if (step16 % 4 === 0) {
        this.synthKick(now, 150, 42, 0.25, 1.0);
      }
      if (step16 % 4 === 2) {
        this.synthHiHat(now, 0.08, 0.4);
      }
      // Acid bass 16th groove
      const acidNotes = [55, 55, 110, 55, 65.41, 55, 82.41, 73.42];
      const freq = acidNotes[step16 % 8];
      this.synthBass(now, freq, 0.1, 'sawtooth', 0.45);
    }
  }

  // Instrument primitives
  private synthKick(time: number, startFreq: number, endFreq: number, dur: number, vol: number) {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + dur);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + dur);
  }

  private synth808Sub(time: number, freq: number, dur: number) {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq + 30, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.06);

    gain.gain.setValueAtTime(0.8, time);
    gain.gain.linearRampToValueAtTime(0.6, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + dur);
  }

  private synthSnare(time: number, toneFreq: number, dur: number, vol: number) {
    if (!this.ctx || !this.gainNode) return;
    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(vol * 0.7, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.gainNode);

    // Tone body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.frequency.setValueAtTime(toneFreq, time);
    osc.frequency.exponentialRampToValueAtTime(toneFreq * 0.4, time + dur);
    oscGain.gain.setValueAtTime(vol * 0.6, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(oscGain);
    oscGain.connect(this.gainNode);

    noise.start(time);
    noise.stop(time + dur);
    osc.start(time);
    osc.stop(time + dur);
  }

  private synthHiHat(time: number, dur: number, vol: number) {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    noise.start(time);
    noise.stop(time + dur);
  }

  private synthBass(time: number, freq: number, dur: number, type: OscillatorType, vol: number) {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + dur);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + dur);
  }

  private synthLead(time: number, freq: number, dur: number, type: OscillatorType, vol: number) {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + dur);
  }

  public triggerManualBeat(type: 'kick' | 'snare' | 'hihat') {
    this.manualBeatTrigger = type;
  }

  // Audio Analysis Reader (executed every render frame)
  public analyze(): AudioAnalysis {
    if (!this.analyser || !this.isPlaying) {
      const manual = this.manualBeatTrigger;
      this.manualBeatTrigger = null;
      return {
        bass: manual === 'kick' ? 0.9 : 0,
        mid: manual === 'snare' ? 0.8 : 0,
        treble: manual === 'hihat' ? 0.8 : 0,
        energy: manual ? 0.7 : 0,
        isBeat: manual === 'kick',
        isSnare: manual === 'snare',
        isHihat: manual === 'hihat',
        beatType: manual || 'none',
        bpm: this.currentBpm || 124,
        frequencyData: this.freqArray,
        timeDomainData: this.timeArray,
      };
    }

    (this.analyser as unknown as { getByteFrequencyData: (arr: Uint8Array) => void }).getByteFrequencyData(this.freqArray);
    (this.analyser as unknown as { getByteTimeDomainData: (arr: Uint8Array) => void }).getByteTimeDomainData(this.timeArray);

    // Frequencies: 256 bins for 0 to ~22050Hz (~86 Hz per bin)
    // Bass: bins 0..5 (~0 to 450Hz)
    let bassSum = 0;
    const bassBins = 6;
    for (let i = 0; i < bassBins; i++) {
      bassSum += this.freqArray[i];
    }
    const bass = bassSum / (bassBins * 255);

    // Mid: bins 6..28 (~450Hz to 2400Hz)
    let midSum = 0;
    const midBins = 22;
    for (let i = 6; i < 28; i++) {
      midSum += this.freqArray[i];
    }
    const mid = midSum / (midBins * 255);

    // Treble: bins 28..90 (~2400Hz to 7700Hz)
    let trebleSum = 0;
    const trebleBins = 62;
    for (let i = 28; i < 90; i++) {
      trebleSum += this.freqArray[i];
    }
    const treble = trebleSum / (trebleBins * 255);

    // Total energy
    let totalSum = 0;
    for (let i = 0; i < this.freqArray.length; i++) {
      totalSum += this.freqArray[i];
    }
    const energy = totalSum / (this.freqArray.length * 255);

    // Kick / Bass peak detection
    let isBeat = false;
    if (bass > this.beatThreshold && bass > 0.4) {
      isBeat = true;
      this.beatThreshold = bass * 1.05;

      const nowTime = performance.now();
      if (this.beatTimes.length > 0) {
        const delta = nowTime - this.beatTimes[this.beatTimes.length - 1];
        if (delta > 250 && delta < 1400) {
          const instantBpm = 60000 / delta;
          this.currentBpm = Math.round(this.currentBpm * 0.75 + instantBpm * 0.25);
        }
      }
      this.beatTimes.push(nowTime);
      if (this.beatTimes.length > 8) this.beatTimes.shift();
    } else {
      this.beatThreshold = Math.max(0.35, this.beatThreshold - this.beatDecay);
    }

    // Snare / Mid peak detection
    let isSnare = false;
    if (mid > this.snareThreshold && mid > 0.38) {
      isSnare = true;
      this.snareThreshold = mid * 1.04;
    } else {
      this.snareThreshold = Math.max(0.32, this.snareThreshold - 0.015);
    }

    // Hi-hat / Treble peak detection
    let isHihat = false;
    if (treble > this.hihatThreshold && treble > 0.35) {
      isHihat = true;
      this.hihatThreshold = treble * 1.04;
    } else {
      this.hihatThreshold = Math.max(0.3, this.hihatThreshold - 0.015);
    }

    let beatType: 'kick' | 'snare' | 'hihat' | 'none' = 'none';
    if (this.manualBeatTrigger) {
      beatType = this.manualBeatTrigger;
      if (this.manualBeatTrigger === 'kick') isBeat = true;
      if (this.manualBeatTrigger === 'snare') isSnare = true;
      if (this.manualBeatTrigger === 'hihat') isHihat = true;
      this.manualBeatTrigger = null;
    } else if (isBeat) {
      beatType = 'kick';
    } else if (isSnare) {
      beatType = 'snare';
    } else if (isHihat) {
      beatType = 'hihat';
    }

    return {
      bass,
      mid,
      treble,
      energy,
      isBeat,
      isSnare,
      isHihat,
      beatType,
      bpm: this.currentBpm || 124,
      frequencyData: this.freqArray,
      timeDomainData: this.timeArray,
    };
  }
}

export const audioEngine = new AudioEngine();
