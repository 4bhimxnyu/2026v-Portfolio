'use client';

import { useSyncExternalStore } from 'react';

// Server snapshot is `false`, so media-dependent UI renders its fallback first
// and upgrades after hydration without a mismatch.
export default function useMediaQuery(query) {
  return useSyncExternalStore(
    onChange => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)');
