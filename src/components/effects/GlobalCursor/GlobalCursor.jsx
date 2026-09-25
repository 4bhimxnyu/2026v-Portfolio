'use client';

import GlowCursor from '@/components/effects/GlowCursor/GlowCursor';
import { useFinePointer, useReducedMotion } from '@/hooks/useMediaQuery';
import useWebGL from '@/hooks/useWebGL';

// One site-wide instance. Touch devices have no hovering pointer to follow, and
// reduced-motion users get the normal system cursor, so neither mounts it.
export default function GlobalCursor() {
  const finePointer = useFinePointer();
  const reduced = useReducedMotion();
  const webgl = useWebGL(1);

  if (!finePointer || reduced || !webgl) return null;

  return (
    <GlowCursor
      global
      aria-hidden="true"
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
    />
  );
}
