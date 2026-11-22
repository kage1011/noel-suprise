// Web Audio API Synthesizer for rich Christmas sounds without relying on external mp3 assets

let audioCtx = null;
let bgMusicInterval = null;
let isMusicPlaying = false;
let isMuted = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setMuted(muted) {
  isMuted = muted;
  if (muted && isMusicPlaying) {
    stopBackgroundMusic();
  }
}

export function getMuted() {
  return isMuted;
}

// Chime bell tone generator using FM synthesis
function playBellTone(freq, time, duration = 1.2, gainValue = 0.3) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = time || ctx.currentTime;

  // Carrier oscillator
  const carrier = ctx.createOscillator();
  const carrierGain = ctx.createGain();

  // Modulator oscillator for metallic bell shimmer
  const modulator = ctx.createOscillator();
  const modGain = ctx.createGain();

  carrier.type = 'sine';
  carrier.frequency.setValueAtTime(freq, now);

  modulator.type = 'sine';
  modulator.frequency.setValueAtTime(freq * 2.76, now); // Inharmonic ratio for bell timbre

  modGain.gain.setValueAtTime(freq * 0.5, now);
  modGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.5);

  modulator.connect(modGain);
  modGain.connect(carrier.frequency);

  // Envelope
  carrierGain.gain.setValueAtTime(0, now);
  carrierGain.gain.linearRampToValueAtTime(gainValue, now + 0.01);
  carrierGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  carrier.connect(carrierGain);
  carrierGain.connect(ctx.destination);

  modulator.start(now);
  carrier.start(now);

  modulator.stop(now + duration);
  carrier.stop(now + duration);
}

// Jingle Bells opening fanfare
export function playJingleBells() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Notes: E5 (659.25), G5 (783.99), C6 (1046.50), E6 (1318.51)
  const notes = [
    { freq: 659.25, time: 0, dur: 0.25 },
    { freq: 659.25, time: 0.22, dur: 0.25 },
    { freq: 659.25, time: 0.44, dur: 0.5 },
    { freq: 659.25, time: 0.8, dur: 0.25 },
    { freq: 659.25, time: 1.02, dur: 0.25 },
    { freq: 659.25, time: 1.24, dur: 0.5 },
    { freq: 659.25, time: 1.6, dur: 0.25 },
    { freq: 783.99, time: 1.82, dur: 0.25 },
    { freq: 523.25, time: 2.04, dur: 0.35 },
    { freq: 587.33, time: 2.35, dur: 0.25 },
    { freq: 659.25, time: 2.6, dur: 0.8 },
  ];

  notes.forEach(n => {
    playBellTone(n.freq, now + n.time, n.dur, 0.25);
  });
}

// Short festive jingle for gift reveal
export function playGiftRevealSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Shimmering sweep up
  const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
  arpeggio.forEach((f, idx) => {
    playBellTone(f, now + idx * 0.08, 0.8, 0.3);
  });

  // Final glorious chord
  setTimeout(() => {
    const chordTime = ctx.currentTime;
    [523.25 * 2, 659.25 * 2, 783.99 * 2].forEach(f => {
      playBellTone(f, chordTime, 1.8, 0.25);
    });
  }, 500);
}

// Countdown clock tick
export function playCountdownTick(isUrgent = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = isUrgent ? 'sawtooth' : 'sine';
  osc.frequency.setValueAtTime(isUrgent ? 880 : 440, now);
  if (isUrgent) {
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
  }

  gain.gain.setValueAtTime(isUrgent ? 0.3 : 0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

// Swap gift action sound
export function playSwapSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Magic whoosh
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);

  // Sparkle bells
  setTimeout(() => {
    playBellTone(1046.50, null, 0.6, 0.2);
    playBellTone(1318.51, null, 0.8, 0.2);
  }, 100);
}

// Simple click pop sound
export function playClickSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}

// Lo-Fi Holiday Melody background music (We Wish You a Merry Christmas)
const holidayMelody = [
  { f: 392.00, d: 0.4 }, // G4
  { f: 523.25, d: 0.4 }, // C5
  { f: 523.25, d: 0.2 }, // C5
  { f: 587.33, d: 0.2 }, // D5
  { f: 523.25, d: 0.2 }, // C5
  { f: 493.88, d: 0.2 }, // B4
  { f: 440.00, d: 0.4 }, // A4
  { f: 440.00, d: 0.4 }, // A4
  { f: 440.00, d: 0.4 }, // A4
  { f: 587.33, d: 0.4 }, // D5
  { f: 587.33, d: 0.2 }, // D5
  { f: 659.25, d: 0.2 }, // E5
  { f: 587.33, d: 0.2 }, // D5
  { f: 523.25, d: 0.2 }, // C5
  { f: 493.88, d: 0.4 }, // B4
  { f: 392.00, d: 0.4 }, // G4
  { f: 392.00, d: 0.4 }, // G4
  { f: 659.25, d: 0.4 }, // E5
  { f: 659.25, d: 0.2 }, // E5
  { f: 698.46, d: 0.2 }, // F5
  { f: 659.25, d: 0.2 }, // E5
  { f: 587.33, d: 0.2 }, // D5
  { f: 523.25, d: 0.4 }, // C5
  { f: 440.00, d: 0.4 }, // A4
  { f: 392.00, d: 0.2 }, // G4
  { f: 392.00, d: 0.2 }, // G4
  { f: 440.00, d: 0.4 }, // A4
  { f: 587.33, d: 0.4 }, // D5
  { f: 493.88, d: 0.4 }, // B4
  { f: 523.25, d: 0.8 }, // C5
];

export function startBackgroundMusic() {
  if (isMusicPlaying || isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  isMusicPlaying = true;
  let step = 0;

  function playStep() {
    if (!isMusicPlaying || isMuted) return;
    const note = holidayMelody[step];
    playBellTone(note.f * 1.5, null, note.d * 1.4, 0.08);

    step = (step + 1) % holidayMelody.length;
    bgMusicInterval = setTimeout(playStep, note.d * 1000);
  }

  playStep();
}

export function stopBackgroundMusic() {
  isMusicPlaying = false;
  if (bgMusicInterval) {
    clearTimeout(bgMusicInterval);
    bgMusicInterval = null;
  }
}

export function toggleMusic() {
  if (isMusicPlaying) {
    stopBackgroundMusic();
    return false;
  } else {
    isMuted = false;
    startBackgroundMusic();
    return true;
  }
}

export function isAudioPlaying() {
  return isMusicPlaying;
}
