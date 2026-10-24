// Web Audio API emergency medical chime and serious condition alarm
class AudioAlertService {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Lazy initialized on first interaction
  }

  public enableSound(enable: boolean) {
    this.isEnabled = enable;
  }

  public getSoundEnabled(): boolean {
    return this.isEnabled;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * High-priority Emergency Alarm triggered for SERIOUS / RED cases
   * Distinct multi-stage medical telemetry alarm
   */
  public playSeriousAlarm() {
    if (!this.isEnabled) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 3 urgent medical alert pulses (Attention siren)
      // Pulse 1
      this.playBeep(920, now, 0.16, 'sawtooth');
      this.playBeep(1380, now + 0.18, 0.22, 'sine');

      // Pulse 2 (Urgent follow-up)
      this.playBeep(920, now + 0.45, 0.16, 'sawtooth');
      this.playBeep(1380, now + 0.63, 0.22, 'sine');

      // Pulse 3 (Sustained alert)
      this.playBeep(1480, now + 0.90, 0.35, 'sine');
    } catch (e) {
      console.warn('Audio alert playback error:', e);
    }
  }

  /**
   * Standard chime
   */
  public playCriticalChime() {
    this.playSeriousAlarm();
  }

  private playBeep(frequency: number, startTime: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const audioAlert = new AudioAlertService();
