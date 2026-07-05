const PLAYLIST = [
  { title: 'Loonboon', file: '/music_loonboon.mp3' },
  { title: 'Loonboon (Orquesta)', file: '/music_loonboon_orquesta.mp3' },
  { title: 'Watery Graves', file: '/music_waterygraves.mp3' },
  { title: 'Ultimate Battle', file: '/music_ultimatebattle.mp3' },
  { title: 'Cerebrawl', file: '/music_cerebrawl.mp3' },
  { title: 'Graze the Roof', file: '/music_grazetheroof.mp3' },
  { title: 'Brainiac Maniac', file: '/music_brainiacmaniac.mp3' },
  { title: 'Zombies on Your Lawn', file: '/music_zombiesonyourlawn.mp3' }
];

class AudioService {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgm = null;
    this.currentTrackIndex = 0;
    this.onTrackChange = null;
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.bgm) {
      if (this.isMuted) {
        this.bgm.pause();
      } else {
        this.bgm.play().catch(e => console.warn("Failed to play BGM:", e));
      }
    }
    return this.isMuted;
  }

  createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playRoll() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    // A rumbling/rolling sound using repeated click sounds
    const now = this.ctx.currentTime;
    const rollsCount = 10;
    const interval = 0.06; // 60ms

    for (let i = 0; i < rollsCount; i++) {
      const time = now + i * interval;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      // Descending pitch representing a rolling die
      osc.frequency.setValueAtTime(150 - i * 8, time);
      
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      osc.start(time);
      osc.stop(time + 0.05);
    }

    // Final crisp landing click
    const endTime = now + rollsCount * interval;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, endTime);
    gain.gain.setValueAtTime(0.12, endTime);
    gain.gain.exponentialRampToValueAtTime(0.001, endTime + 0.15);
    osc.start(endTime);
    osc.stop(endTime + 0.16);
  }

  playMove() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    // Pop/jump hop sound (sine pitch sweep up)
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playDeploy() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    // Sliding up whistle sound (cute deployment)
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.35);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  playCapture() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    // PVZ Cherry Bomb explosion sound: low rumble noise + pitch drop sine
    const now = this.ctx.currentTime;
    
    // 1. Low frequency boom
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(30, now + 0.5);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc.start(now);
    osc.stop(now + 0.7);

    // 2. White noise explosion burst
    const noise = this.ctx.createBufferSource();
    const noiseBuffer = this.createNoiseBuffer();
    if (noiseBuffer) {
      noise.buffer = noiseBuffer;
      const noiseGain = this.ctx.createGain();
      
      // Simple bandpass filter for dirtier explosion sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 400;

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      noise.start(now);
      noise.stop(now + 0.5);
    }
  }

  playWinPiece() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    // High pitched magical sunflower shine/sparkle sound
    const now = this.ctx.currentTime;
    
    const notes = [600, 800, 1000, 1300];
    const duration = 0.08;

    notes.forEach((freq, index) => {
      const time = now + index * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.start(time);
      osc.stop(time + duration + 0.02);
    });
  }

  playWinGame() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    // Victorious retro fanfare
    const now = this.ctx.currentTime;
    // Notes: C4(261.63), E4(329.63), G4(392.00), C5(523.25)
    const notes = [
      { f: 261.63, d: 0.15 },
      { f: 329.63, d: 0.15 },
      { f: 392.00, d: 0.15 },
      { f: 523.25, d: 0.5 }
    ];

    let accumTime = now;
    notes.forEach((note) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, accumTime);

      gain.gain.setValueAtTime(0.18, accumTime);
      gain.gain.exponentialRampToValueAtTime(0.001, accumTime + note.d - 0.02);

      osc.start(accumTime);
      osc.stop(accumTime + note.d);

      accumTime += note.d;
    });
  }

  playClick() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playDeny() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(110, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  playBgm() {
    if (this.bgm) return;
    this.bgm = new Audio(PLAYLIST[this.currentTrackIndex].file);
    this.bgm.volume = 0.22;
    this.bgm.addEventListener('ended', () => this.nextTrack());
    
    if (this.onTrackChange) {
      this.onTrackChange(PLAYLIST[this.currentTrackIndex].title);
    }

    if (!this.isMuted) {
      this.bgm.play().catch(e => console.warn("Failed to play BGM:", e));
    }
  }

  stopBgm() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm = null;
    }
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % PLAYLIST.length;
    const wasPaused = this.isMuted || (this.bgm && this.bgm.paused);
    
    if (this.bgm) {
      this.bgm.pause();
      this.bgm = null;
    }
    
    this.bgm = new Audio(PLAYLIST[this.currentTrackIndex].file);
    this.bgm.volume = 0.22;
    this.bgm.addEventListener('ended', () => this.nextTrack());
    
    if (this.onTrackChange) {
      this.onTrackChange(PLAYLIST[this.currentTrackIndex].title);
    }
    
    if (!wasPaused && !this.isMuted) {
      this.bgm.play().catch(e => console.warn("Failed to play next track:", e));
    }
  }

  getCurrentTrackTitle() {
    return PLAYLIST[this.currentTrackIndex].title;
  }
}

export const audio = new AudioService();
