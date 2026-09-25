'use client';

import SplitFlapText from '@/components/typography/SplitFlapText/SplitFlapText';
import styles from './About.module.css';

// A sequence, not a status readout: the loop every project goes through.
const LOOP = ['DESIGN', 'PROTOTYPE', 'BUILD', 'SHIP'];

export default function About() {
  return (
    <section id="about" className={styles.about} aria-labelledby="about-title">
      <h2 id="about-title" className={styles.title}>
        I work on both sides of the handoff.
      </h2>

      <div className={styles.body}>
        <p>
          I build products end to end: the interface people use, the APIs and data behind it, and everything in
          between. Having a designer&rsquo;s eye means less gets lost between the design file and the browser.
        </p>
        <p>
          Lately that means creative frontend work, like WebGL, motion and interfaces that respond to the person using
          them, and paying close attention to what AI changes about how software gets designed and built.
        </p>
      </div>

      <figure className={styles.board}>
        <SplitFlapText
          words={LOOP}
          flipDuration={0.12}
          stagger={0.06}
          cycleDelay={2400}
          charset="alpha"
          style={{ fontFamily: 'var(--font-sans)' }}
          flipsPerChar={8}
          tileColor="#1b1722"
          textColor="#f4f1ea"
          tileRadius={6}
          gap={5}
          fontSize="clamp(1.5rem, 0.9rem + 3.2vw, 3.25rem)"
          loop
          padTo={9}
        />
        <figcaption className={styles.caption}>
          Design, prototype, build, ship. One loop, start to finish.
        </figcaption>
      </figure>
    </section>
  );
}
