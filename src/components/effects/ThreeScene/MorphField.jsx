'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const GRID = 12;
const LATTICE = 1.15;
const RADIUS = 1.45;

// One point set, two arrangements. Every lattice point maps to a point on a
// concentric sphere (its cube "shell" becomes a sphere shell), so the morph
// reads as structure relaxing into form rather than noise.
function buildAttributes() {
  const count = GRID ** 3;
  const lattice = new Float32Array(count * 3);
  const sphere = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  let i = 0;
  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      for (let z = 0; z < GRID; z++) {
        const p = [x, y, z].map(v => (v / (GRID - 1)) * 2 - 1);
        const shell = Math.max(Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2]));
        const len = Math.hypot(p[0], p[1], p[2]) || 1;
        for (let k = 0; k < 3; k++) {
          lattice[i * 3 + k] = p[k] * LATTICE;
          sphere[i * 3 + k] = (p[k] / len) * shell * RADIUS;
        }
        seed[i] = shell;
        i++;
      }
    }
  }
  return { count, lattice, sphere, seed };
}

const vertexShader = /* glsl */ `
  uniform float uMix;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute vec3 aSphere;
  attribute vec3 aLattice;
  attribute float aSeed;
  varying float vMix;
  varying float vShell;
  varying float vDepth;

  void main() {
    // Outer shells lead the morph; inner shells follow.
    float t = smoothstep(0.0, 1.0, clamp(uMix * 1.4 - (1.0 - aSeed) * 0.4, 0.0, 1.0));
    vec3 organic = aSphere * (1.0 + 0.035 * sin(uTime * 0.9 + aSeed * 9.0));
    vec3 p = mix(organic, aLattice, t);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.35 + aSeed) / -mv.z;
    vMix = t;
    vShell = aSeed;
    vDepth = clamp((-mv.z - 4.4) / 4.0, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uPaper;
  uniform vec3 uCyan;
  uniform vec3 uViolet;
  varying float vMix;
  varying float vShell;
  varying float vDepth;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.15, d) * mix(0.95, 0.25, vDepth);
    // Light, not paint: only the outer shell picks up the accent.
    vec3 accent = mix(uViolet, uCyan, vMix);
    vec3 color = mix(uPaper, accent, smoothstep(0.75, 1.0, vShell) * 0.7);
    gl_FragColor = vec4(color, alpha);
  }
`;

function Field({ target, reduced }) {
  const group = useRef(null);
  const material = useRef(null);
  const { invalidate } = useThree();
  const { count, lattice, sphere, seed } = useMemo(() => buildAttributes(), []);

  const uniforms = useMemo(
    () => ({
      uMix: { value: 0.5 },
      uTime: { value: 0 },
      uSize: { value: 34 },
      uPixelRatio: { value: 1 },
      uPaper: { value: new THREE.Color('#f4f1ea') },
      uCyan: { value: new THREE.Color('#67e8f9') },
      uViolet: { value: new THREE.Color('#a78bfa') },
    }),
    []
  );

  // In reduced-motion mode the canvas renders on demand; nudge it on change.
  useEffect(() => {
    invalidate();
  }, [target, invalidate]);

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u || !group.current) return;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    if (reduced) {
      u.uMix.value = target;
      group.current.rotation.set(0.35, 0.6, 0);
      return;
    }
    u.uTime.value += delta;
    u.uMix.value = THREE.MathUtils.damp(u.uMix.value, target, 3, delta);
    const g = group.current;
    g.rotation.y += delta * 0.12;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.35 + state.pointer.y * 0.25, 2.5, delta);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -state.pointer.x * 0.15, 2.5, delta);
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          {/* `position` drives bounds/culling; the shader uses the named targets. */}
          <bufferAttribute attach="attributes-position" args={[lattice, 3]} count={count} />
          <bufferAttribute attach="attributes-aLattice" args={[lattice, 3]} count={count} />
          <bufferAttribute attach="attributes-aSphere" args={[sphere, 3]} count={count} />
          <bufferAttribute attach="attributes-aSeed" args={[seed, 1]} count={count} />
        </bufferGeometry>
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function MorphField({ target = 0.5, active = true, reduced = false }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.4], fov: 40 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      frameloop={!active ? 'never' : reduced ? 'demand' : 'always'}
      aria-hidden="true"
    >
      <Field target={target} reduced={reduced} />
    </Canvas>
  );
}
