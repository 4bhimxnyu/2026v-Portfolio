// Physical model of a plucked bass string (extended Karplus–Strong), voiced
// as a 1979 Fender Precision Bass: roundwounds that have been played in, and
// the split-coil pickup about a fifth of the way up from the bridge.
//
// A string is simulated as a delay line one period long. Each pass through the
// loop, a one-pole low-pass takes off some high harmonics (a real string loses
// its top end first) and a gain takes off a little energy. The low-pass is set
// per note so the top end dies at the same *rate in seconds* on every string,
// which is what gives the P-bass its bright "thump" of an attack that settles
// into a round, fundamental-heavy note. An all-pass filter supplies whatever
// fraction of a sample the period needs, so every note is exactly in tune.
//
// The pickup is modelled too: a magnetic pickup at distance d from the bridge
// hears the wave leaving the bridge minus the same wave reflected back, a comb
// filter that notches harmonics near multiples of L/d. That notch pattern is
// most of why a P-bass sounds like a P-bass and not a Jazz bass.
//
// Pure math, no browser APIs: returns raw samples, so it can be unit-tested.

// Deterministic noise, so the same note always sounds the same.
function makeRandom(seed) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 31 - 1;
  };
}

// One-pole low-pass coefficient that makes content at `cutoff` Hz fall 60 dB
// in `t60` seconds on a string of fundamental `freq`. From the small-angle
// loss of y = (1-a)x + a*y[-1]: ln|H(w)| ≈ -a w² / (2(1-a)²) per period.
function lossPole(freq, sampleRate, cutoff, t60) {
  const w = (2 * Math.PI * cutoff) / sampleRate;
  const c = (2 * Math.log(1000)) / (t60 * freq * w * w);
  // Solve a / (1-a)² = c for 0 < a < 1.
  return (2 * c + 1 - Math.sqrt(4 * c + 1)) / (2 * c);
}

/**
 * Render one plucked note.
 * @param {number} freq        fundamental frequency in Hz
 * @param {number} sampleRate  audio sample rate
 * @param {object} options
 *   duration    seconds of audio to render
 *   velocity    0..1, how hard the string is plucked (louder and brighter)
 *   pluckPoint  0..1 along the string from the bridge; fingerstyle sits ~0.25
 *   pickup      0..1, pickup position along the *vibrating* length, from the bridge
 *   muted       palm-muted / ghost note: short and dull
 * @returns {Float32Array} samples, peak-normalised to ±velocity
 */
export function renderString(freq, sampleRate, options = {}) {
  const { duration = 2.5, velocity = 0.8, pluckPoint = 0.25, pickup = 0.19, muted = false, seed = 7 } = options;

  // Loop filter. Harder plucks keep more top end; muted notes keep almost none.
  const topT60 = muted ? 0.03 : 0.22 + 0.25 * velocity; // seconds for ~1.2 kHz to die away
  const a = lossPole(freq, sampleRate, 1200, topT60);
  const w0 = (2 * Math.PI * freq) / sampleRate;
  // Phase delay and gain of the low-pass at the fundamental, to keep it in tune
  // and to set the overall sustain independently of the tone.
  const lpDelay = Math.atan2(a * Math.sin(w0), 1 - a * Math.cos(w0)) / w0;
  const lpGain = (1 - a) / Math.sqrt(1 - 2 * a * Math.cos(w0) + a * a);

  // Loop delay must equal one period: delay line + low-pass delay + all-pass fraction.
  const period = sampleRate / freq;
  const size = Math.max(2, Math.floor(period - lpDelay - 0.1));
  const frac = period - lpDelay - size; // 0.1 .. 1.1 samples
  const allpass = (1 - frac) / (1 + frac);

  // Excitation: the string's shape the instant the finger lets go, a triangle
  // peaking at the pluck point, plus a little noise for finger/fret texture.
  const random = makeRandom(seed + Math.round(freq * 100));
  const line = new Float32Array(size);
  const peak = Math.min(size - 1, Math.max(1, Math.round(size * pluckPoint)));
  for (let i = 0; i < size; i++) {
    const shape = i < peak ? i / peak : (size - i) / (size - peak);
    line[i] = shape + 0.08 * random();
  }
  // Fingertip, not a pick: a soft, rounded pluck. Softer still when played lightly.
  const smoothing = 2 + Math.round((1 - velocity) * 3) + (muted ? 4 : 0);
  for (let pass = 0; pass < smoothing; pass++) {
    let prev = line[size - 1];
    for (let i = 0; i < size; i++) {
      const current = line[i];
      line[i] = 0.5 * (current + prev);
      prev = current;
    }
  }
  let mean = 0;
  for (let i = 0; i < size; i++) mean += line[i];
  mean /= size;
  for (let i = 0; i < size; i++) line[i] -= mean;

  // Sustain of the fundamental: an ash-body P-bass rings, low strings longest.
  const t60 = muted ? 0.09 : Math.min(4.5, Math.max(1.6, 3.6 * Math.sqrt(55 / freq)));
  const loss = 10 ** (-3 / (t60 * freq)) / lpGain;

  const length = Math.floor(sampleRate * duration);
  const string = new Float32Array(length);
  let index = 0;
  let lp = 0;
  let apIn = 0;
  let apOut = 0;
  for (let n = 0; n < length; n++) {
    const sample = line[index];
    string[n] = sample;
    lp = (1 - a) * sample + a * lp;
    const damped = loss * lp;
    // Fractional delay (first-order all-pass).
    const tuned = allpass * damped + apIn - allpass * apOut;
    apIn = damped;
    apOut = tuned;
    line[index] = tuned;
    index = index + 1 === size ? 0 : index + 1;
  }

  // Pickup: y(t) = w(t) - r * w(t - p·T), with a fractional read of the delay.
  const out = new Float32Array(length);
  const lag = Math.min(0.95, pickup) * period;
  const lagInt = Math.floor(lag);
  const lagFrac = lag - lagInt;
  const reflect = 0.92;
  for (let n = 0; n < length; n++) {
    const i0 = n - lagInt;
    const back = i0 > 0 ? (1 - lagFrac) * string[i0] + lagFrac * string[i0 - 1] : 0;
    out[n] = string[n] - reflect * back;
  }

  // Normalise and add a short fade-in so the attack doesn't click.
  let max = 0;
  for (let n = 0; n < length; n++) max = Math.max(max, Math.abs(out[n]));
  const gain = max > 0 ? velocity / max : 0;
  const fadeIn = Math.min(length, Math.round(sampleRate * 0.002));
  for (let n = 0; n < length; n++) out[n] *= gain * (n < fadeIn ? n / fadeIn : 1);
  return out;
}

/** MIDI note number and name (e.g. "A1") for a frequency. */
export function noteName(freq) {
  const names = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  const midi = Math.round(69 + 12 * Math.log2(freq / 440));
  return `${names[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}
