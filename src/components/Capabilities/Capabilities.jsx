'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import useInView from '@/hooks/useInView';
import useWebGL from '@/hooks/useWebGL';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import styles from './Capabilities.module.css';

const MorphField = dynamic(() => import('@/components/effects/ThreeScene/MorphField'), { ssr: false });

const GROUPS = [
  {
    key: 'design',
    label: 'Design',
    form: 0,
    items: ['UI design', 'UX and interaction design', 'Product design', 'Interactive web experiences'],
  },
  {
    key: 'engineering',
    label: 'Engineering',
    form: 1,
    items: ['React and Next.js', 'Creative frontend development', 'Software development', 'AI and emerging technologies'],
  },
];

const IN_BETWEEN = 0.5;

export default function Capabilities() {
  const sectionRef = useRef(null);
  const nearView = useInView(sectionRef, { rootMargin: '300px 0px', once: true });
  const inView = useInView(sectionRef);
  const webgl = useWebGL(1);
  const reduced = useReducedMotion();
  const [pinned, setPinned] = useState(null);
  const [hovered, setHovered] = useState(null);

  const focusKey = hovered ?? pinned;
  const target = GROUPS.find(g => g.key === focusKey)?.form ?? IN_BETWEEN;

  return (
    <section ref={sectionRef} id="capabilities" className={styles.caps} aria-labelledby="caps-title">
      <h2 id="caps-title" className={styles.title}>
        What I work with
      </h2>

      <div className={styles.layout}>
        {GROUPS.map(group => (
          <div
            key={group.key}
            className={styles.group}
            data-side={group.key}
            data-dim={focusKey && focusKey !== group.key ? '' : undefined}
            onPointerEnter={e => e.pointerType === 'mouse' && setHovered(group.key)}
            onPointerLeave={() => setHovered(null)}
          >
            <h3 className={styles.groupHeading}>
              <button
                type="button"
                className={styles.groupButton}
                aria-pressed={pinned === group.key}
                onClick={() => setPinned(pinned === group.key ? null : group.key)}
              >
                {group.label}
              </button>
            </h3>
            <ul className={styles.items}>
              {group.items.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        <figure className={styles.figure}>
          <div className={styles.canvas}>
            {nearView && webgl && <MorphField target={target} active={inView} reduced={reduced} />}
            {webgl === false && <div className={styles.fallback} aria-hidden="true" />}
          </div>
          <figcaption className={styles.caption}>
            The same points, arranged two ways: loose and round for design, a strict lattice for engineering. Most of
            my work happens somewhere in between. Select a side to see it.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
