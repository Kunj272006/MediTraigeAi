// Web Audio API emergency chime
class AudioAlertService {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Lazy initialized on first user interaction
  }

  public enableSound(enable: boolean) {
    this.isEnabled = enable;
  }

  public getSoundEnabled(): boolean {
    return this.isEnabled;
  }

  public playCriticalChime() {
    if (!this.isEnabled) return;

    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      
      // Dual gentle medical pulse
      this.playTone(880, now, 0.15); // A5
      this.playTone(1174.66, now + 0.18, 0.25); // D6
    } catch (e) {
      console.warn('Web Audio playback error:', e);
    }
  }

  private playTone(frequency: number, startTime: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const audioAlert = new AudioAlertService();
