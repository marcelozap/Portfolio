'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * A drifting field of luminous points with depth fog and subtle parallax.
 * Heavily over-engineered for visual richness, but cheap: a single
 * Points object with custom additive material.
 */
function Field({ count = 2200 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const { size, viewport, mouse } = useThree();

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // distribute in a flat-ish slab
      const radius = Math.pow(Math.random(), 0.6) * 22;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3 + 0] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 8;
      sizes[i] = Math.random() * 1.4 + 0.2;
    }
    return { positions, sizes };
  }, [count]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const t = clock.getElapsedTime();
    points.current.rotation.y = t * 0.018;
    points.current.rotation.x = Math.sin(t * 0.04) * 0.04;
    // gentle parallax toward cursor
    const targetX = (mouse.x * viewport.width) / 80;
    const targetY = (mouse.y * viewport.height) / 80;
    points.current.position.x += (targetX - points.current.position.x) * 0.04;
    points.current.position.y += (targetY - points.current.position.y) * 0.04;
  });

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColorA: { value: new THREE.Color('#7be4ff') },
        uColorB: { value: new THREE.Color('#b89bff') },
        uColorC: { value: new THREE.Color('#ffd29a') },
      },
      vertexShader: /* glsl */ `
        attribute float size;
        varying float vAlpha;
        varying vec3 vPos;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vec3 p = position;
          float flicker = sin(uTime * 1.4 + p.x * 0.6 + p.z * 0.4) * 0.5 + 0.5;
          vAlpha = mix(0.35, 1.0, flicker) * smoothstep(28.0, 4.0, length(p.xz));
          vPos = p;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = size * uPixelRatio * (260.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying float vAlpha;
        varying vec3 vPos;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;

        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float core = smoothstep(0.5, 0.0, d);
          // hue based on radial position so the field has cool/warm zones
          float r = length(vPos.xz) / 22.0;
          vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 0.6, r));
          col = mix(col, uColorC, smoothstep(0.8, 1.1, r));
          gl_FragColor = vec4(col, core * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((_, dt) => {
    material.uniforms.uTime.value += dt;
  });

  // resize uniforms when canvas resizes
  useFrame(() => {
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    // size is touched to keep linter happy and could be used for adaptive density
    void size;
  });

  return (
    <points ref={points} material={material}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
        />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} count={sizes.length} />
      </bufferGeometry>
    </points>
  );
}

export function ParticleField() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 70 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#06090d', 8, 28]} />
          <Field />
        </Suspense>
      </Canvas>
    </div>
  );
}
