'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { STRINGS, GROOVE_INFO, createGroove, ensureAudio, noteFreq, pluck } from '@/lib/bass';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import useInView from '@/hooks/useInView';
import styles from './Groove.module.css';

const LABEL_GUTTER = 44; // room on the left for the string buttons
const STRING_WIDTHS = [1.4, 1.9, 2.5, 3.1]; // G D A E, thin to thick
const INLAYS = [3, 5, 7, 9, 12, 15];
const RETRIGGER_MS = 70;

// Fret positions follow real bass geometry: fret n sits at L * (1 - 2^(-n/12))
// from the nut, with the scale length stretched so ~15 frets fill the board.
const fretX = (n, board) => LABEL_GUTTER + board * 1.45 * (1 - 2 ** (-n / 12));
// Strings sit between 20% and 80% of the board height (G on top).
const stringY = (i, h) => h * (0.2 + (0.6 * i) / (STRINGS.length - 1));

// Paints one frame of the fretboard. Returns true while anything is still moving.
function renderFrame(canvas, s) {
  const g = canvas.getContext('2d');
  const { w, h, dpr } = s.size;
  const now = performance.now();
  const board = w - LABEL_GUTTER;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);

  // Frets and inlays
  g.strokeStyle = 'rgba(244, 241, 234, 0.1)';
  g.lineWidth = 1;
  for (let n = 1; fretX(n, board) < w; n++) {
    const x = fretX(n, board);
    g.beginPath();
    g.moveTo(x, h * 0.14);
    g.lineTo(x, h * 0.86);
    g.stroke();
  }
  g.fillStyle = 'rgba(244, 241, 234, 0.12)';
  for (const n of INLAYS) {
    const x = (fretX(n - 1, board) + fretX(n, board)) / 2;
    if (x > w) continue;
    const ys = n === 12 ? [h * 0.35, h * 0.65] : [h * 0.5];
    for (const y of ys) {
      g.beginPath();
      g.arc(x, y, 3.5, 0, Math.PI * 2);
      g.fill();
    }
  }
  // Nut
  g.fillStyle = 'rgba(244, 241, 234, 0.55)';
  g.fillRect(LABEL_GUTTER - 3, h * 0.14, 3, h * 0.72);

  let busy = false;

  // Strings: a decaying triangular standing wave from the fretted point to the bridge.
  STRINGS.forEach((_, i) => {
    const st = s.strings[i];
    const y = stringY(i, h);
    const t = (now - st.start) / 1000;
    const envelope = s.reduced ? 0 : st.amp * Math.exp(-t / 0.7);
    const live = envelope > 0.08;
    if (live) busy = true;
    const x0 = Math.max(LABEL_GUTTER, st.from);
    const wobble = Math.sin(t * Math.PI * 2 * (11 + i * 2.5));

    g.lineWidth = STRING_WIDTHS[i];
    g.strokeStyle = live
      ? `rgba(${i < 2 ? '167, 139, 250' : '103, 232, 249'}, ${0.6 + Math.min(envelope / 8, 0.4)})`
      : 'rgba(244, 241, 234, 0.55)';
    g.shadowColor = i < 2 ? '#a78bfa' : '#67e8f9';
    g.shadowBlur = live ? Math.min(envelope * 3, 16) : 0;
    g.beginPath();
    g.moveTo(0 + LABEL_GUTTER, y);
    if (live) {
      g.lineTo(x0, y);
      const span = w - x0;
      const peak = x0 + span * st.at;
      for (let k = 0; k <= 48; k++) {
        const x = x0 + (span * k) / 48;
        const shape = x < peak ? (x - x0) / (peak - x0 || 1) : (w - x) / (w - peak || 1);
        g.lineTo(x, y + envelope * shape * wobble);
      }
    } else {
      g.lineTo(w, y);
    }
    g.stroke();
    g.shadowBlur = 0;
  });

  // Fretted-note dots from the groove
  s.dots = s.dots.filter(d => now - d.born < 450);
  for (const d of s.dots) {
    busy = true;
    const i = STRINGS.findIndex(x => x.name === d.string);
    const x = d.fret === 0 ? LABEL_GUTTER - 16 : (fretX(d.fret - 1, board) + fretX(d.fret, board)) / 2;
    const alpha = 1 - (now - d.born) / 450;
    g.fillStyle = `rgba(103, 232, 249, ${alpha * (d.ghost ? 0.4 : 1)})`;
    g.shadowColor = '#67e8f9';
    g.shadowBlur = 14 * alpha;
    g.beginPath();
    g.arc(x, stringY(i, h), d.ghost ? 4 : 7, 0, Math.PI * 2);
    g.fill();
    g.shadowBlur = 0;
  }

  return busy;
}

export default function Groove() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(sectionRef);
  const [playing, setPlaying] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  // Mutable animation state, kept out of React so drawing never re-renders.
  const sim = useRef({
    strings: STRINGS.map(() => ({ amp: 0, start: 0, at: 0.5, from: 0, last: 0 })),
    dots: [],
    size: { w: 1, h: 1, dpr: 1 },
    raf: 0,
    pointer: null,
    reduced: false,
  });
  const soundRef = useRef(false);
  const grooveRef = useRef(null);

  useEffect(() => {
    sim.current.reduced = reduced;
  }, [reduced]);
  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  // Draw until the strings settle, then sleep; any pluck wakes the loop again.
  const wake = useCallback(() => {
    const s = sim.current;
    if (s.raf) return;
    const tick = () => {
      s.raf = 0;
      const canvas = canvasRef.current;
      if (canvas && renderFrame(canvas, s)) s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);
  }, []);

  // Visual + (if sound is on) audible pluck of string i.
  const strike = useCallback(
    (i, { at = 0.5, velocity = 0.8, fret = 0, from, audible = soundRef.current } = {}) => {
      const st = sim.current.strings[i];
      const now = performance.now();
      if (now - st.last < RETRIGGER_MS) return;
      st.last = now;
      st.start = now;
      st.amp = 3 + velocity * 6;
      st.at = Math.min(Math.max(at, 0.08), 0.92);
      st.from = from ?? 0;
      if (audible) pluck(noteFreq(STRINGS[i].name, fret), { velocity });
      wake();
    },
    [wake]
  );

  // Size the canvas to its box.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      sim.current.size = { w: rect.width, h: rect.height, dpr };
      wake();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    const state = sim.current;
    return () => {
      ro.disconnect();
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    };
  }, [wake]);

  // Stop the groove when it scrolls out of view, and on unmount.
  useEffect(() => {
    if (!inView && grooveRef.current) {
      grooveRef.current.stop();
      grooveRef.current = null;
      setPlaying(false);
    }
  }, [inView]);
  useEffect(() => () => grooveRef.current?.stop(), []);

  // Mouse: sweep across strings to strum them. Touch: tap a string.
  const onPointerMove = e => {
    if (e.pointerType === 'touch') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const prev = sim.current.pointer;
    sim.current.pointer = { x, y, t: e.timeStamp };
    if (!prev || x < LABEL_GUTTER) return;
    const speed = Math.min(Math.abs(y - prev.y) / Math.max(e.timeStamp - prev.t, 1), 3);
    STRINGS.forEach((_, i) => {
      const sy = stringY(i, rect.height);
      if ((prev.y - sy) * (y - sy) <= 0 && prev.y !== y) {
        strike(i, { at: (x - LABEL_GUTTER) / (rect.width - LABEL_GUTTER), velocity: 0.35 + speed * 0.25 });
      }
    });
  };

  const onPointerDown = e => {
    // Any press on the board is a user gesture, so it can switch sound on.
    if (!soundRef.current && ensureAudio()) setSoundOn(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    let nearest = 0;
    STRINGS.forEach((_, i) => {
      if (Math.abs(stringY(i, rect.height) - y) < Math.abs(stringY(nearest, rect.height) - y)) nearest = i;
    });
    strike(nearest, {
      at: (e.clientX - rect.left - LABEL_GUTTER) / (rect.width - LABEL_GUTTER),
      velocity: 0.85,
      audible: true,
    });
  };

  const toggleGroove = () => {
    if (grooveRef.current) {
      grooveRef.current.stop();
      grooveRef.current = null;
      setPlaying(false);
      return;
    }
    if (!ensureAudio()) return;
    setSoundOn(true);
    const board = () => sim.current.size.w - LABEL_GUTTER;
    const groove = createGroove({
      onNote: ({ string, fret, ghost }, delay) => {
        window.setTimeout(() => {
          const i = STRINGS.findIndex(s => s.name === string);
          const from = fret ? fretX(fret, board()) : 0;
          strike(i, { at: 0.3, velocity: ghost ? 0.2 : 0.9, fret, from, audible: false });
          sim.current.dots.push({ string, fret, ghost, born: performance.now() });
          wake();
        }, delay);
      },
    });
    groove.start();
    grooveRef.current = groove;
    setPlaying(true);
  };

  const toggleSound = () => {
    if (soundOn) {
      setSoundOn(false);
      grooveRef.current?.stop();
      grooveRef.current = null;
      setPlaying(false);
    } else if (ensureAudio()) {
      setSoundOn(true);
    }
  };

  return (
    <section ref={sectionRef} id="groove" className={styles.groove} aria-labelledby="groove-title">
      <div className={styles.head}>
        <div className={styles.copy}>
          <h2 id="groove-title" className={styles.title}>
            I also play bass.
          </h2>
          <p className={styles.intro}>
            Runner-up at the National Battle of Bands, CBIT. Run your cursor across the strings, or let the groove
            play.
          </p>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.play}
            aria-pressed={playing}
            data-playing={playing || undefined}
            onClick={toggleGroove}
          >
            <span className={styles.icon} aria-hidden="true" />
            {playing ? 'Stop the groove' : 'Play the groove'}
          </button>
          <button type="button" className={styles.sound} aria-pressed={soundOn} onClick={toggleSound}>
            {soundOn ? 'Sound on' : 'Sound off'}
          </button>
          <p className={styles.meta}>
            {GROOVE_INFO.bpm} BPM, {GROOVE_INFO.key}
          </p>
        </div>
      </div>

      <div className={styles.board}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-hidden="true"
          onPointerMove={onPointerMove}
          onPointerLeave={() => (sim.current.pointer = null)}
          onPointerDown={onPointerDown}
        />
        {/* Keyboard and screen-reader way to play each open string. */}
        <div className={styles.strings}>
          {STRINGS.map((string, i) => (
            <button
              key={string.name}
              type="button"
              className={styles.stringButton}
              style={{ top: `${20 + (60 * i) / (STRINGS.length - 1)}%` }}
              aria-label={`Pluck the ${string.name} string`}
              onClick={() => {
                if (!soundRef.current && ensureAudio()) setSoundOn(true);
                strike(i, { velocity: 0.85, audible: true });
              }}
            >
              {string.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
