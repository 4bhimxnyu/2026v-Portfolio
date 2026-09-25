'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import useInView from '@/hooks/useInView';
import useMediaQuery from '@/hooks/useMediaQuery';
import { site } from '@/config/site';
import styles from './Resume.module.css';

// three.js-based, browser only; loaded when the section comes near.
const PaperCrumple = dynamic(() => import('@/components/micro/PaperCrumple/PaperCrumple'), { ssr: false });

const PDF_NAME = site.resume.split('/').pop();

export default function Resume({ resumeHref = null, previewSrc = null }) {
  const sectionRef = useRef(null);
  const nearView = useInView(sectionRef, { rootMargin: '400px 0px', once: true });
  const compact = useMediaQuery('(max-width: 640px)');

  // A4 proportions (1 : 1.414), smaller on phones so the scene fits the viewport.
  const paperWidth = compact ? 240 : 320;
  const paperHeight = Math.round(paperWidth * 1.414);
  const sceneHeight = compact ? 440 : 560;

  return (
    <section ref={sectionRef} id="resume" className={styles.resume} aria-labelledby="resume-title">
      <div className={styles.copy}>
        <h2 id="resume-title" className={styles.title}>
          Resume
        </h2>
        <p className={styles.intro}>
          Everything on this page, on one sheet of paper. Go ahead and crumple it; it springs back.
        </p>

        {resumeHref ? (
          <div className={styles.actions}>
            {/* Same-origin link, so `download` is honoured and the file saves with its name. */}
            <a className={styles.primary} href={resumeHref} download={PDF_NAME}>
              Download Resume
              <span className="visually-hidden"> (PDF)</span>
            </a>
            <a className={styles.secondary} href={resumeHref} target="_blank" rel="noopener noreferrer">
              View Resume
              <span className="visually-hidden"> (PDF, opens in a new tab)</span>
            </a>
          </div>
        ) : (
          <p className={styles.missing}>The resume PDF is being updated. Check back soon.</p>
        )}

        <p className={styles.hint}>
          Drag the paper to crumple it. With a keyboard, focus it and hold Space; Escape resets.
        </p>
      </div>

      <div className={styles.stage}>
        {previewSrc ? (
          nearView && (
            <PaperCrumple
              src={previewSrc}
              alt="Abhimanyu Singh Resume, page 1"
              width={paperWidth}
              height={paperHeight}
              sceneHeight={sceneHeight}
              imageFit="cover"
              releaseBehavior="restore"
              crumpleAmount={0.85}
              crumpleDuration={0.55}
              releaseDuration={0.4}
              foldCount={6}
              foldSharpness={0.6}
              wrinkleDepth={0.65}
              creaseStrength={0.18}
              paperColor="#f4f0e8"
              paperTexture={0.08}
              shadowOpacity={0.35}
              draggable
              returnToOrigin
            />
          )
        ) : (
          // Clearly marked placeholder until a preview image exists.
          <div className={styles.placeholder} style={{ width: paperWidth, height: paperHeight }}>
            Resume preview unavailable
          </div>
        )}
      </div>
    </section>
  );
}
