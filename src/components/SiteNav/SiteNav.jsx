'use client';

import { useEffect, useRef, useState } from 'react';
import GooeyNav from '@/components/navigation/GooeyNav/GooeyNav';
import ResumeDialog from '@/components/Resume/ResumeDialog';
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

function ResumeButton({ href, onOpen }) {
  // Placeholder until the resume PDF exists: still focusable and announced,
  // but clearly not a working link.
  if (!href) {
    return (
      <button type="button" className={styles.resume} aria-disabled="true" title="Resume coming soon">
        Resume
        <span className="visually-hidden"> (coming soon)</span>
      </button>
    );
  }

  // A real link to the PDF (works without JavaScript); with JavaScript it opens
  // the resume pop-up instead.
  return (
    <a
      className={styles.resume}
      href={href}
      aria-haspopup="dialog"
      onClick={e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        onOpen();
      }}
    >
      Resume
    </a>
  );
}

export default function SiteNav({ resumeHref = null, previewSrc = null }) {
  const [resumeOpen, setResumeOpen] = useState(false);
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
    <>
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
        <ResumeButton href={resumeHref} onOpen={() => setResumeOpen(true)} />
      </header>
      {/* Outside the header: the header is pointer-events: none. */}
      <ResumeDialog
        open={resumeOpen}
        onClose={() => setResumeOpen(false)}
        resumeHref={resumeHref}
        previewSrc={previewSrc}
      />
    </>
  );
}
