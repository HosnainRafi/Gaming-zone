import { useRef, useMemo, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 2800;
const MOUSE_RADIUS = 4.0;
const MOUSE_STRENGTH = 0.6;

const vertexShader = `
attribute float aSize;
attribute float aAlpha;
varying float vAlpha;
uniform float uTime;
uniform float uDpr;
void main() {
  vAlpha = aAlpha;
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uDpr * (180.0 / -mvPos.z);
  gl_Position = projectionMatrix * mvPos;
}`;

const fragmentShader = `
varying float vAlpha;
uniform vec3 uColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float glow = smoothstep(0.5, 0.0, d);
  float core = smoothstep(0.15, 0.0, d);
  vec3 col = mix(uColor, vec3(1.0), core * 0.7);
  gl_FragColor = vec4(col, vAlpha * glow);
}`;

export function HeroParticleField() {
  const meshRef = useRef<THREE.Points>(null);
  const mouse = useRef(new THREE.Vector2(9999, 9999));
  const { viewport } = useThree();

  const { positions, velocities, sizes, alphas, colorArray } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    const sz = new Float32Array(PARTICLE_COUNT);
    const al = new Float32Array(PARTICLE_COUNT);
    const ca = new Float32Array(PARTICLE_COUNT * 3);
    const palette = [
      [0.486, 0.227, 0.929],
      [0.976, 0.451, 0.086],
      [0.925, 0.282, 0.600],
      [0.925, 0.282, 0.600],
      [1.0, 1.0, 1.0],
    ];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 16;
      pos[i3 + 1] = (Math.random() - 0.5) * 10;
      pos[i3 + 2] = (Math.random() - 0.5) * 8 - 1;
      vel[i3] = (Math.random() - 0.5) * 0.003;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.003;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.001;
      sz[i] = Math.random() * 3.0 + 1.0;
      al[i] = Math.random() * 0.6 + 0.2;
      const c = palette[Math.floor(Math.random() * palette.length)];
      ca[i3] = c[0];
      ca[i3 + 1] = c[1];
      ca[i3 + 2] = c[2];
    }
    return { positions: pos, velocities: vel, sizes: sz, alphas: al, colorArray: ca };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDpr: { value: 1 },
      uColor: { value: new THREE.Color("#7c3aed") },
    }),
    []
  );

  const handlePointerMove = useCallback(
    (e: { point: THREE.Vector3 }) => {
      mouse.current.set(e.point.x, e.point.y);
    },
    []
  );

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const time = state.clock.elapsedTime;
    uniforms.uTime.value = time;
    uniforms.uDpr.value = state.viewport.dpr;
    const mx = (mouse.current.x / (viewport.width / 2)) * MOUSE_RADIUS;
    const my = (mouse.current.y / (viewport.height / 2)) * MOUSE_RADIUS;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      posArr[i3] += velocities[i3] + Math.sin(time * 0.3 + i) * 0.0005;
      posArr[i3 + 1] += velocities[i3 + 1] + Math.cos(time * 0.2 + i) * 0.0005;
      posArr[i3 + 2] += velocities[i3 + 2];
      const dx = posArr[i3] - mx;
      const dy = posArr[i3 + 1] - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH * delta * 60;
        posArr[i3] += (dx / dist) * force;
        posArr[i3 + 1] += (dy / dist) * force;
      }
      if (posArr[i3] > 8) posArr[i3] = -8;
      if (posArr[i3] < -8) posArr[i3] = 8;
      if (posArr[i3 + 1] > 5) posArr[i3 + 1] = -5;
      if (posArr[i3 + 1] < -5) posArr[i3 + 1] = 5;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef} onPointerMove={handlePointerMove}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={PARTICLE_COUNT} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" array={sizes} count={PARTICLE_COUNT} itemSize={1} />
        <bufferAttribute attach="attributes-aAlpha" array={alphas} count={PARTICLE_COUNT} itemSize={1} />
        <bufferAttribute attach="attributes-color" array={colorArray} count={PARTICLE_COUNT} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
