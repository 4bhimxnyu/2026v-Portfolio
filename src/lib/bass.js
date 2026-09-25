// A tiny Web Audio bass rig: a plucked-bass voice, a light drum kit and a
// swung 16th-note sequencer. Browser only; nothing here runs on the server.
//
// Browsers only allow audio after a user gesture (click, tap, key), so the
// context is created lazily by ensureAudio(), which callers invoke from one.

let ctx = null;
let master = null;
let noise = null;

export function ensureAudio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.ratio.value = 4;
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(compressor).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Standard 4-string tuning, drawn top to bottom as a player looks down at it.
export const STRINGS = [
  { name: 'G', freq: 97.999 },
  { name: 'D', freq: 73.416 },
  { name: 'A', freq: 55.0 },
  { name: 'E', freq: 41.203 },
];
const OPEN = Object.fromEntries(STRINGS.map(s => [s.name, s.freq]));
export const noteFreq = (string, fret) => OPEN[string] * 2 ** (fret / 12);

// Saw through a resonant low-pass (the "pluck"), a sine sub for weight, and a
// quiet octave so the note still reads on laptop speakers.
export function pluck(freq, { time, velocity = 0.9, length = 0.9, ghost = false } = {}) {
  const c = ensureAudio();
  if (!c) return;
  const t = time ?? c.currentTime;
  const end = t + (ghost ? 0.09 : length);

  const out = c.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime((ghost ? 0.22 : 0.55) * velocity, t + 0.004);
  out.gain.exponentialRampToValueAtTime(0.0001, end);
  out.connect(master);

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = ghost ? 1 : 7;
  filter.frequency.setValueAtTime(ghost ? 480 : 650 + velocity * 1700, t);
  filter.frequency.exponentialRampToValueAtTime(ghost ? 140 : 210, t + (ghost ? 0.05 : 0.32));
  filter.connect(out);

  const voices = [
    ['sawtooth', freq, 1, filter],
    ['triangle', freq * 2, 0.25, filter],
    ['sine', freq, ghost ? 0.3 : 0.9, out],
  ];
  for (const [type, f, level, dest] of voices) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = f;
    gain.gain.value = level;
    osc.connect(gain).connect(dest);
    osc.start(t);
    osc.stop(end + 0.05);
  }
}

function noiseBuffer(c) {
  if (!noise) {
    noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noise;
}

function hit({ t, filterType, freq, q = 0.8, level, decay }) {
  const c = ctx;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c);
  const filter = c.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const gain = c.createGain();
  gain.gain.setValueAtTime(level, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  src.connect(filter).connect(gain).connect(master);
  src.start(t);
  src.stop(t + decay + 0.02);
}

const drums = {
  kick(t) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + 0.32);
  },
  snare(t, level = 0.32) {
    hit({ t, filterType: 'bandpass', freq: 1800, level, decay: 0.16 });
  },
  hat(t, open = false) {
    hit({ t, filterType: 'highpass', freq: 7500, level: 0.1, decay: open ? 0.22 : 0.04 });
  },
};

// Two bars of E-minor funk on a 32-step 16th grid:
// [step, string, fret, length in steps, ghost?]
const BASSLINE = [
  [0, 'E', 0, 2], [2, 'E', 0, 1, true], [3, 'E', 0, 1], [4, 'D', 2, 1], [6, 'E', 0, 1],
  [7, 'E', 0, 1, true], [8, 'E', 3, 2], [10, 'E', 5, 1], [11, 'A', 2, 1], [12, 'D', 2, 1],
  [13, 'D', 2, 1, true], [14, 'D', 0, 1], [15, 'A', 2, 1],
  [16, 'E', 0, 2], [18, 'E', 0, 1, true], [19, 'E', 0, 1], [20, 'D', 2, 1], [22, 'G', 2, 1],
  [23, 'D', 2, 1], [24, 'E', 0, 1], [26, 'E', 3, 1], [27, 'A', 0, 1], [28, 'A', 1, 1],
  [29, 'A', 2, 1], [30, 'D', 0, 1], [31, 'D', 1, 1],
];
const KICK = new Set([0, 6, 10, 16, 22, 26]);
const SNARE = new Set([4, 12, 20, 28]);
const GHOST_SNARE = new Set([15, 31]);
const OPEN_HAT = new Set([14, 30]);

export const GROOVE_INFO = { bpm: 98, key: 'E minor' };

// Looping sequencer. onNote(note, delayMs) fires for every bass note so the
// fretboard can light up in time with the audio.
export function createGroove({ bpm = GROOVE_INFO.bpm, swing = 0.14, onNote } = {}) {
  const sixteenth = 60 / bpm / 4;
  let timer = null;
  let step = 0;
  let nextTime = 0;

  const schedule = () => {
    while (nextTime < ctx.currentTime + 0.12) {
      const s = step % 32;
      // Swing: every off-16th lands a little late.
      const t = nextTime + (s % 2 ? sixteenth * swing : 0);

      for (const [at, string, fret, len, ghost] of BASSLINE) {
        if (at !== s) continue;
        pluck(noteFreq(string, fret), { time: t, length: len * sixteenth * 0.92, ghost, velocity: 0.9 });
        onNote?.({ string, fret, ghost: !!ghost }, Math.max(0, (t - ctx.currentTime) * 1000));
      }
      if (KICK.has(s)) drums.kick(t);
      if (SNARE.has(s)) drums.snare(t);
      if (GHOST_SNARE.has(s)) drums.snare(t, 0.08);
      if (s % 2 === 0 || OPEN_HAT.has(s)) drums.hat(t, OPEN_HAT.has(s));

      nextTime += sixteenth;
      step++;
    }
  };

  return {
    start() {
      if (timer || !ensureAudio()) return;
      step = 0;
      nextTime = ctx.currentTime + 0.06;
      schedule();
      timer = setInterval(schedule, 25);
    },
    stop() {
      clearInterval(timer);
      timer = null;
    },
  };
}
