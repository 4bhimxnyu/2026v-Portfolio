'use client';

import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import GooeyNav from '@/components/navigation/GooeyNav/GooeyNav';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import styles from './SiteNav.module.css';

const items = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
];

// How long scroll-spy stays quiet after a click, so the smooth scroll past
// intermediate sections doesn't bounce the gooey pill through each of them.
const CLICK_LOCK_MS = 1100;

function ResumeButton({ href }) {
  // Placeholder until public/resume.pdf exists: still focusable and announced,
  // but clearly not a working link.
  if (!href) {
    return (
      <button type="button" className={styles.resume} aria-disabled="true" title="Resume coming soon">
        Resume
        <span className="visually-hidden"> (coming soon)</span>
      </button>
    );
  }

  return (
    <a className={styles.resume} href={href} target="_blank" rel="noopener noreferrer">
      Resume
      <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} strokeWidth={2} aria-hidden="true" />
      <span className="visually-hidden"> (PDF, opens in a new tab)</span>
    </a>
  );
}

export default function SiteNav({ resumeHref = null }) {
  const [active, setActive] = useState(0);
  const lockUntil = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const sections = items.map(item => document.querySelector(item.href)).filter(Boolean);
    const io = new IntersectionObserver(
      entries => {
        if (performance.now() < lockUntil.current) return;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = items.findIndex(item => item.href === `#${entry.target.id}`);
          if (index !== -1) setActive(index);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach(s => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <header className={styles.bar}>
      <div className={styles.pill}>
        <GooeyNav
          items={items}
          activeIndex={active}
          onChange={index => {
            lockUntil.current = performance.now() + CLICK_LOCK_MS;
            setActive(index);
          }}
          particleCount={reduced ? 0 : 15}
          particleDistances={[90, 10]}
          particleR={100}
          initialActiveIndex={0}
          animationTime={600}
          timeVariance={300}
          colors={[1, 2, 3, 1, 2, 3, 1, 4]}
        />
      </div>
      <ResumeButton href={resumeHref} />
    </header>
  );
}
