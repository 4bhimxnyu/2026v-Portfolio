// A tiny Web Audio bass rig: a physically modelled bass string (see
// stringModel.js), a light drum kit and a swung 16th-note sequencer.
// Browser only; nothing here runs on the server.
//
// Browsers only allow audio after a user gesture (click, tap, key), so the
// context is created lazily by ensureAudio(), which callers invoke from one.
import { renderString } from './stringModel';

let ctx = null;
let master = null;
let amp = null;
let noise = null;

// Bass "amp": a bit of low-end warmth, a mid growl so notes read on laptop
// speakers, a gentle top roll-off, and light saturation for body.
function buildAmp(c) {
  const input = c.createGain();
  const warmth = c.createBiquadFilter();
  warmth.type = 'lowshelf';
  warmth.frequency.value = 100;
  warmth.gain.value = 3;
  const growl = c.createBiquadFilter();
  growl.type = 'peaking';
  growl.frequency.value = 800;
  growl.Q.value = 0.9;
  growl.gain.value = 4;
  const tone = c.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 3800;
  tone.Q.value = 0.5;
  const drive = c.createWaveShaper();
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = Math.tanh(1.6 * x) / Math.tanh(1.6);
  }
  drive.curve = curve;
  drive.oversample = '2x';
  input.connect(warmth).connect(growl).connect(tone).connect(drive).connect(master);
  return input;
}

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
    master.gain.value = 0.8;
    master.connect(compressor).connect(ctx.destination);
    amp = buildAmp(ctx);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Standard 4-string tuning (E1 A1 D2 G2), drawn top to bottom as a player
// looks down at the neck.
export const STRINGS = [
  { name: 'G', freq: 97.999 },
  { name: 'D', freq: 73.416 },
  { name: 'A', freq: 55.0 },
  { name: 'E', freq: 41.203 },
];
const OPEN = Object.fromEntries(STRINGS.map(s => [s.name, s.freq]));
export const noteFreq = (string, fret) => OPEN[string] * 2 ** (fret / 12);

// Rendered notes are cached per pitch and pluck style (a few ms each to make).
const cache = new Map();
const CACHE_LIMIT = 48;
function noteBuffer(freq, velocity, muted) {
  const level = muted ? 0 : velocity > 0.75 ? 2 : velocity > 0.45 ? 1 : 0;
  const key = `${freq.toFixed(3)}|${level}|${muted ? 1 : 0}`;
  let buffer = cache.get(key);
  if (!buffer) {
    const samples = renderString(freq, ctx.sampleRate, {
      duration: muted ? 0.25 : 3,
      velocity: [0.55, 0.75, 0.95][level],
      pluckPoint: muted ? 0.12 : 0.22,
      muted,
    });
    buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate);
    buffer.copyToChannel(samples, 0);
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
    cache.set(key, buffer);
  } else {
    // Refresh recency for the simple LRU.
    cache.delete(key);
    cache.set(key, buffer);
  }
  return buffer;
}

// One sounding note per string, as on a real bass: a new pluck on a string
// stops whatever that string was playing.
const ringing = new Map();

/**
 * Play a note.
 * freq      pitch in Hz (use noteFreq(string, fret))
 * string    'E' | 'A' | 'D' | 'G', so re-plucking a string cuts its last note
 * length    seconds before the note is released (default: let it ring)
 * ghost     a muted, percussive "dead" note
 */
export function pluck(freq, { time, velocity = 0.85, length, ghost = false, string } = {}) {
  const c = ensureAudio();
  if (!c) return;
  const t = Math.max(time ?? c.currentTime, c.currentTime);

  const source = c.createBufferSource();
  source.buffer = noteBuffer(freq, velocity, ghost);
  const gain = c.createGain();
  const level = ghost ? 0.35 : 0.9 * (0.6 + 0.4 * velocity);
  gain.gain.setValueAtTime(level, t);
  if (length) {
    // Fretting hand lifts: a quick natural damp rather than a hard cut.
    gain.gain.setTargetAtTime(0, t + length, 0.03);
  }
  source.connect(gain).connect(amp);

  if (string) {
    const previous = ringing.get(string);
    if (previous) {
      previous.gain.gain.cancelScheduledValues(t);
      previous.gain.gain.setTargetAtTime(0, t, 0.012);
      previous.source.stop(t + 0.1);
    }
    const voice = { source, gain };
    ringing.set(string, voice);
    source.onended = () => {
      if (ringing.get(string) === voice) ringing.delete(string);
    };
  }

  source.start(t);
  source.stop(t + source.buffer.duration);
  return { source, gain };
}

/**
 * Slide a ringing note (from pluck) by `semitones` relative to where it was
 * plucked, like moving the fretting finger along the string. Each call glides
 * quickly to the new fret, so a drag across frets sounds like a real slide.
 */
export function slide(voice, semitones) {
  if (!ctx || !voice) return;
  voice.source.playbackRate.setTargetAtTime(2 ** (semitones / 12), ctx.currentTime, 0.012);
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
        pluck(noteFreq(string, fret), { time: t, length: len * sixteenth * 0.92, ghost, velocity: 0.9, string });
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
