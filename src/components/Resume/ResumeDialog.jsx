'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import useMediaQuery from '@/hooks/useMediaQuery';
import { site } from '@/config/site';
import styles from './ResumeDialog.module.css';

// three.js-based and browser only; loaded the first time the pop-up opens.
const PaperCrumple = dynamic(() => import('@/components/micro/PaperCrumple/PaperCrumple'), { ssr: false });

const PDF_NAME = site.resume.split('/').pop();

// Native modal <dialog>: the browser handles the focus trap, Escape to close,
// returning focus to the Resume button, and inerting the page behind it.
export default function ResumeDialog({ open, onClose, resumeHref, previewSrc }) {
  const dialogRef = useRef(null);
  const compact = useMediaQuery('(max-width: 640px), (max-height: 760px)');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // A4 proportions (1 : 1.414), smaller on phones and short screens.
  const paperWidth = compact ? 220 : 300;
  const paperHeight = Math.round(paperWidth * 1.414);
  const sceneHeight = paperHeight + (compact ? 60 : 110);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="resume-dialog-title"
      onClose={onClose}
      // While the paper is held, Escape belongs to PaperCrumple (it resets the
      // paper), so don't also close the dialog.
      onCancel={e => {
        const active = document.activeElement;
        if (active?.classList.contains('paper-crumple-hit') && active.getAttribute('aria-pressed') === 'true') {
          e.preventDefault();
        }
      }}
      // Clicks on the backdrop land on the <dialog> itself, not the panel.
      onClick={e => e.target === dialogRef.current && onClose()}
    >
      <div className={styles.panel}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close resume">
          <span aria-hidden="true" />
        </button>

        <div className={styles.stage}>
          {open &&
            (previewSrc ? (
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
            ) : (
              <div className={styles.placeholder} style={{ width: paperWidth, height: paperHeight }}>
                Resume preview unavailable
              </div>
            ))}
        </div>

        <div className={styles.copy}>
          <h2 id="resume-dialog-title" className={styles.title}>
            Resume
          </h2>
          <p className={styles.intro}>One page, all of it. Go ahead and crumple it; it springs back.</p>

          {resumeHref ? (
            <div className={styles.actions}>
              {/* Same-origin link, so `download` is honoured and the file saves with its name. */}
              <a className={styles.primary} href={resumeHref} download={PDF_NAME} autoFocus>
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
            Drag the paper to crumple it. With a keyboard, focus it and hold Space.
          </p>
        </div>
      </div>
    </dialog>
  );
}
