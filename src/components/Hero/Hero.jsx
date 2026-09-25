'use client';

import DitherVeil from '@/components/effects/DitherVeil/DitherVeil';
import GlowCursor from '@/components/effects/GlowCursor/GlowCursor';
import { useFinePointer, useReducedMotion } from '@/hooks/useMediaQuery';
import useWebGL from '@/hooks/useWebGL';
import { site } from '@/config/site';
import styles from './Hero.module.css';

function Portrait() {
  const webgl2 = useWebGL(2);
  const finePointer = useFinePointer();
  const reduced = useReducedMotion();

  // Before hydration: keep the stage empty (ink) so nothing flashes.
  if (webgl2 === null) return null;

  if (!webgl2) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={styles.fallback} src={site.heroImage} alt="" />;
  }

  const veil = (
    <DitherVeil
      src={site.heroImage}
      fit="contain"
      pattern="floyd"
      pixelSize={2}
      inkColor="#120f17"
      paperColor="#f4f1ea"
      revealRadius={200}
      softness={0.6}
      linger={1}
    />
  );

  // The glow trail is only meaningful with a hovering pointer and motion allowed.
  if (!finePointer || reduced) return veil;

  return (
    <GlowCursor
      className={styles.glow}
      color="#67E8F9"
      secondaryColor="#A78BFA"
      trailLength={40}
      trailWidth={8}
      trailTaper={0.8}
      followSpeed={0.16}
      glowIntensity={1.9}
      glowSpread={1.2}
      hotspot={0.65}
      brightness={1.25}
      opacity={1}
      pulseSpeed={1.1}
      noiseStrength={0.035}
      idleFade
      idleTimeout={700}
      fadeDuration={900}
      blendMode="screen"
    >
      {veil}
    </GlowCursor>
  );
}

export default function Hero() {
  return (
    <section id="home" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.stage} aria-hidden="true">
        <Portrait />
      </div>

      <div className={styles.copy}>
        <h1 id="hero-title" className={styles.name}>
          <span className={styles.line}>Abhimanyu</span>
          <span className={styles.line}>Singh</span>
        </h1>

        <div className={styles.aside}>
          <p className={styles.role}>{site.role}</p>
          <p className={styles.statement}>{site.statement}</p>
          <a className={styles.cta} href="#work">
            See selected work
          </a>
        </div>
      </div>

      <p className={styles.hint} aria-hidden="true">
        <span className={styles.hintPointer}>Move over the portrait. Click to send a ripple.</span>
        <span className={styles.hintTouch}>Drag across the portrait.</span>
      </p>
    </section>
  );
}
