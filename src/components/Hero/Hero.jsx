'use client';

import DitherVeil from '@/components/effects/DitherVeil/DitherVeil';
import useWebGL from '@/hooks/useWebGL';
import { site } from '@/config/site';
import styles from './Hero.module.css';

function Portrait() {
  const webgl2 = useWebGL(2);

  // Before hydration: keep the stage empty (ink) so nothing flashes.
  if (webgl2 === null) return null;

  if (!webgl2) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={styles.fallback} src={site.heroImage} alt="" />;
  }

  // The glow trail is now site-wide (see GlobalCursor), so the veil stands alone here.
  return (
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
}

export default function Hero() {
  return (
    <section id="home" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.stage} aria-hidden="true">
        <Portrait />
      </div>

      <div className={styles.copy}>
        <div className={styles.block}>
          <h1 id="hero-title" className={styles.name} data-text={site.name}>
            {site.name}
          </h1>
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
