// Physical model of a plucked bass string (extended Karplus–Strong).
//
// A string is simulated as a delay line one period long. Each pass through the
// loop, the wave is averaged with its neighbour (the string losing its high
// harmonics first, like a real string) and scaled down slightly (energy loss).
// An all-pass filter supplies the fractional part of the period, so every
// note is in tune, not just rounded to a whole number of samples.
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

/**
 * Render one plucked note.
 * @param {number} freq        fundamental frequency in Hz
 * @param {number} sampleRate  audio sample rate
 * @param {object} options
 *   duration    seconds of audio to render
 *   velocity    0..1, how hard the string is plucked (louder and brighter)
 *   pluckPoint  0..1 along the string from the bridge; fingerstyle sits ~0.2
 *   muted       palm-muted / ghost note: short and dull
 * @returns {Float32Array} samples, peak-normalised to ±velocity
 */
export function renderString(freq, sampleRate, options = {}) {
  const { duration = 2.5, velocity = 0.8, pluckPoint = 0.2, muted = false, seed = 7 } = options;

  // Loop delay must equal one period. The two-point average adds half a sample,
  // the all-pass adds `frac` samples, and the delay line provides the rest.
  const period = sampleRate / freq;
  const size = Math.max(2, Math.floor(period - 0.5 - 0.1));
  const frac = period - 0.5 - size; // 0.1 .. 1.1 samples
  const allpass = (1 - frac) / (1 + frac);

  // Excitation: the string's shape the instant the finger lets go, a triangle
  // peaking at the pluck point, plus a little noise for finger/fret texture.
  const random = makeRandom(seed + Math.round(freq * 100));
  const line = new Float32Array(size);
  const peak = Math.min(size - 1, Math.max(1, Math.round(size * pluckPoint)));
  for (let i = 0; i < size; i++) {
    const shape = i < peak ? i / peak : (size - i) / (size - peak);
    line[i] = shape + 0.12 * random();
  }
  // A softer pluck has fewer high harmonics: smooth the excitation.
  const smoothing = Math.round((1 - velocity) * 3) + (muted ? 4 : 0);
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

  // Sustain: low strings ring longer. `loss` is per trip round the loop, set so
  // the note falls 60 dB after `t60` seconds. Muted notes die almost at once.
  const t60 = muted ? 0.09 : Math.min(4, Math.max(1.4, 2.2 * Math.sqrt(55 / freq) * 1.6));
  const loss = 10 ** (-3 / (t60 * freq));

  const length = Math.floor(sampleRate * duration);
  const out = new Float32Array(length);
  let index = 0;
  let previous = 0;
  let apIn = 0;
  let apOut = 0;
  for (let n = 0; n < length; n++) {
    const sample = line[index];
    out[n] = sample;
    // Loss filter: average with the previous sample, then damp.
    const averaged = loss * 0.5 * (sample + previous);
    previous = sample;
    // Fractional delay (first-order all-pass).
    const tuned = allpass * averaged + apIn - allpass * apOut;
    apIn = averaged;
    apOut = tuned;
    line[index] = tuned;
    index = index + 1 === size ? 0 : index + 1;
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
