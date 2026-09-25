'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import useInView from '@/hooks/useInView';
import useWebGL from '@/hooks/useWebGL';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { skills } from '@/data/skills';
import styles from './Skills.module.css';

const MorphField = dynamic(() => import('@/components/effects/ThreeScene/MorphField'), { ssr: false });

const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// Each category gets its own arrangement of the point field, spread evenly
// from the round form (first category) to the strict lattice (last).
const formFor = index => (skills.length > 1 ? index / (skills.length - 1) : 0.5);

export default function Skills() {
  const sectionRef = useRef(null);
  const tabRefs = useRef([]);
  const nearView = useInView(sectionRef, { rootMargin: '300px 0px', once: true });
  const inView = useInView(sectionRef);
  const webgl = useWebGL(1);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  const current = skills[active];

  const select = index => {
    const next = (index + skills.length) % skills.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  // WAI-ARIA tabs: arrows move between categories, Home/End jump to the ends.
  const onKeyDown = e => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (e.key in keys) {
      e.preventDefault();
      select(active + keys[e.key]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      select(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      select(skills.length - 1);
    }
  };

  return (
    <section ref={sectionRef} id="skills" className={styles.skills} aria-labelledby="skills-title">
      <header className={styles.head}>
        <h2 id="skills-title" className={styles.title}>
          Skills
        </h2>
        <p className={styles.intro}>The tools and technologies I work with, grouped by where they sit in a product.</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.tabs} role="tablist" aria-label="Skill areas" aria-orientation="vertical">
          {skills.map((group, index) => (
            <button
              key={group.category}
              ref={el => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`skills-tab-${slug(group.category)}`}
              aria-selected={index === active}
              aria-controls={`skills-panel-${slug(group.category)}`}
              tabIndex={index === active ? 0 : -1}
              className={styles.tab}
              onClick={() => setActive(index)}
              onKeyDown={onKeyDown}
            >
              {group.category}
              <span className={styles.count} aria-hidden="true">
                {group.items.length || ''}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.field} aria-hidden="true">
          {nearView && webgl && <MorphField target={formFor(active)} active={inView} reduced={reduced} />}
          {webgl === false && <div className={styles.fallback} />}
        </div>

        <div
          key={current.category}
          className={styles.panel}
          role="tabpanel"
          id={`skills-panel-${slug(current.category)}`}
          aria-labelledby={`skills-tab-${slug(current.category)}`}
          tabIndex={0}
        >
          <h3 className={styles.panelTitle}>{current.category}</h3>
          {current.items.length > 0 ? (
            <ul className={styles.items}>
              {current.items.map((item, i) => (
                <li key={item} style={{ '--i': i }}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>Skills for this area are being added.</p>
          )}
        </div>
      </div>
    </section>
  );
}
