import { audioEngine } from './audioEngine';
import { ResolutionType } from '../types';

export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  public isRecording = false;
  private timerId: number | null = null;
  public elapsedSeconds = 0;

  public startRecording(
    canvas: HTMLCanvasElement,
    durationSeconds: number = 0, // 0 or -1 means unlimited
    resolution: ResolutionType = '1080p',
    fps: number = 60,
    onProgress?: (secondsVal: number, isCountdown: boolean) => void,
    onComplete?: (blob: Blob) => void
  ) {
    if (this.isRecording) return;

    this.recordedChunks = [];
    this.elapsedSeconds = 0;

    const canvasStream = canvas.captureStream(fps);
    const audioStream = audioEngine.getMediaStream();

    const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

    if (audioStream && audioStream.getAudioTracks().length > 0) {
      combinedTracks.push(audioStream.getAudioTracks()[0]);
    }

    const combinedStream = new MediaStream(combinedTracks);

    // Pick best mime type supported by browser
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
    }

    // High bitrate based on target resolution
    const bitrate =
      resolution === '2k' ? 26000000 : resolution === '1080p' ? 14000000 : 7000000;

    try {
      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: bitrate,
      });
    } catch {
      this.mediaRecorder = new MediaRecorder(combinedStream);
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.isRecording = false;
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      this.downloadBlob(blob, `rmafx_video_${resolution}_${Date.now()}.webm`);
      if (onComplete) onComplete(blob);
    };

    this.mediaRecorder.start(250);
    this.isRecording = true;

    const isCountdown = durationSeconds > 0;
    let remaining = durationSeconds;

    if (onProgress) {
      onProgress(isCountdown ? remaining : 0, isCountdown);
    }

    this.timerId = window.setInterval(() => {
      this.elapsedSeconds += 1;
      if (isCountdown) {
        remaining -= 1;
        if (onProgress) onProgress(remaining, true);
        if (remaining <= 0) {
          this.stopRecording();
        }
      } else {
        if (onProgress) onProgress(this.elapsedSeconds, false);
      }
    }, 1000);
  }

  public stopRecording() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.isRecording = false;
  }

  public takeSnapshot(canvas: HTMLCanvasElement, filename: string = 'rmafx_art') {
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${filename}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const videoRecorder = new VideoRecorder();
