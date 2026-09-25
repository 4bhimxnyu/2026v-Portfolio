'use client';

import { useSyncExternalStore } from 'react';

const cache = {};

const probe = version => {
  if (version in cache) return cache[version];
  let ok = false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext(version === 2 ? 'webgl2' : 'webgl');
    ok = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    ok = false;
  }
  cache[version] = ok;
  return ok;
};

const noop = () => () => {};

// Returns null on the server / before hydration, then true or false.
export default function useWebGL(version = 1) {
  return useSyncExternalStore(noop, () => probe(version), () => null);
}
