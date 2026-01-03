
import { EqualizerSettings, EQBand } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private audio: HTMLAudioElement | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private preampNode: GainNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private analyser: AnalyserNode | null = null;
  private limiterNode: DynamicsCompressorNode | null = null;
  
  private eqFilters: Record<string, BiquadFilterNode> = {};
  private bandFreqs: number[] = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  
  private currentEq: EqualizerSettings = { 
    bands: { '32': 0, '64': 0, '125': 0, '250': 0, '500': 0, '1k': 0, '2k': 0, '4k': 0, '8k': 0, '16k': 0 },
    preamp: 1,
    stereoWidth: 1,
    limiterEnabled: true,
    eqBandCount: 10
  };
  private currentVolume: number = 0.5;
  
  public isReady = false;

  constructor() {
    this.createAudioElement();
  }

  private createAudioElement() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
      this.audio.load();
    }
    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
    this.audio.preload = "auto";
  }

  public async init(): Promise<void> {
    if (this.isReady && this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return;
    }
    
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'playback',
      });

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024; // Smaller FFT for sharper visual response
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = this.currentVolume;
      
      this.preampNode = this.ctx.createGain();
      this.preampNode.gain.value = this.currentEq.preamp;
      
      this.pannerNode = this.ctx.createStereoPanner();
      this.pannerNode.pan.value = 0;

      this.limiterNode = this.ctx.createDynamicsCompressor();
      this.limiterNode.threshold.value = -1.0;
      this.limiterNode.knee.value = 0;
      this.limiterNode.ratio.value = 20.0;
      this.limiterNode.attack.value = 0.003;
      this.limiterNode.release.value = 0.25;

      if (!this.audio) this.createAudioElement();
      this.source = this.ctx.createMediaElementSource(this.audio!);

      let lastNode: AudioNode = this.source;
      lastNode.connect(this.preampNode);
      lastNode = this.preampNode;

      // Initialize all 10 filters regardless of UI mode for smooth switching
      this.bandFreqs.forEach((freq) => {
        const filter = this.ctx!.createBiquadFilter();
        filter.type = freq <= 64 ? 'lowshelf' : freq >= 8000 ? 'highshelf' : 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.0;
        filter.gain.value = 0;
        
        lastNode.connect(filter);
        this.eqFilters[freq.toString()] = filter;
        lastNode = filter;
      });

      lastNode.connect(this.pannerNode);
      lastNode = this.pannerNode;
      lastNode.connect(this.gainNode);
      lastNode = this.gainNode;
      lastNode.connect(this.limiterNode);
      lastNode = this.limiterNode;
      lastNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.isReady = true;
      this.applyEq(this.currentEq);
      
      if (this.ctx.state === 'suspended') await this.ctx.resume();
    } catch (e) {
      console.error("Neural Interface Failure:", e);
    }
  }

  public getAnalyser() {
    return this.analyser;
  }

  public async start(url: string): Promise<void> {
    if (!this.isReady) await this.init();
    if (!this.audio || !this.ctx) return;

    try {
      this.audio.pause();
      this.audio.src = url;
      this.audio.load();
      const playPromise = this.audio.play();
      if (playPromise !== undefined) await playPromise;
    } catch (err) {
      console.error("Playback error:", err);
    }
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
    }
  }

  public setVolume(val: number) {
    this.currentVolume = val;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(val, this.ctx.currentTime, 0.05);
    }
  }

  public setEqualizer(settings: EqualizerSettings) {
    this.currentEq = settings;
    if (this.isReady) this.applyEq(settings);
  }

  private applyEq(settings: EqualizerSettings) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    if (this.preampNode) this.preampNode.gain.setTargetAtTime(settings.preamp, now, 0.05);
    if (this.limiterNode) this.limiterNode.ratio.setTargetAtTime(settings.limiterEnabled ? 20.0 : 1.0, now, 0.05);

    Object.entries(this.eqFilters).forEach(([freq, filter]) => {
      // Find the corresponding slider or reset to 0
      // We map UI bands (32, 64, 125, 250, 500, 1k, 2k, 4k, 8k, 16k)
      let key = freq === '1000' ? '1k' : freq === '2000' ? '2k' : freq === '4000' ? '4k' : freq === '8000' ? '8k' : freq === '16000' ? '16k' : freq;
      const gain = settings.bands[key as EQBand] ?? 0;
      filter.gain.setTargetAtTime(gain, now, 0.05);
    });
  }
}

export const audioEngine = new AudioEngine();
