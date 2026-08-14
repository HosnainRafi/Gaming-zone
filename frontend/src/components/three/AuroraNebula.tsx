import { useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

const STAR_COUNT = 350;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(11.7, 5.3);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  // gentle mouse parallax
  uv += (uMouse - 0.5) * 0.06;

  float t = uTime * 0.05;

  // layered flowing aurora
  float n1 = fbm(uv * 2.1 + vec2(t, t * 0.7));
  float n2 = fbm(uv * 3.0 - vec2(t * 1.3, t * 0.5) + n1 * 1.2);
  float n3 = fbm(uv * 4.6 + vec2(-t * 0.8, t * 0.9) + n2 * 0.8);

  // deep space base (#0B0E14)
  vec3 base = vec3(0.043, 0.055, 0.078);

  // nebula palette: purple / pink / warm orange (no green, no blue-dominant)
  vec3 purple = vec3(0.486, 0.227, 0.929);
  vec3 pink = vec3(0.925, 0.282, 0.600);
  vec3 orange = vec3(0.976, 0.451, 0.086);

  vec3 col = base;
  col += purple * smoothstep(0.34, 0.98, n1) * 0.55;
  col += pink * smoothstep(0.42, 1.0, n2) * 0.40;
  col += orange * smoothstep(0.48, 1.0, n3) * 0.18;

  // soft vignette keeps edges dark
  float vig = 1.0 - length(uv - 0.5) * 0.85;
  col *= clamp(vig, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

const starVertexShader = `
attribute float aSize;
attribute float aTwinkle;
varying float vTwinkle;
uniform float uTime;
void main() {
  vTwinkle = aTwinkle;
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (120.0 / -mvPos.z) * (0.75 + 0.25 * sin(uTime * 2.0 + aTwinkle * 20.0));
  gl_Position = projectionMatrix * mvPos;
}
`;

const starFragmentShader = `
varying float vTwinkle;
uniform vec3 uColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float glow = smoothstep(0.5, 0.05, d);
  float core = smoothstep(0.12, 0.0, d);
  vec3 col = mix(uColor, vec3(1.0), core * 0.9);
  gl_FragColor = vec4(col, glow * (0.5 + 0.5 * vTwinkle));
}
`;

/**
 * AuroraNebula — full-screen flowing aurora shader plane with a
 * twinkling starfield. Replaces the scattered particle dots with
 * slow-moving nebula clouds (Active Theory deep-space look).
 * Mouse movement adds subtle parallax drift.
 */
export function AuroraNebula() {
  const { viewport } = useThree();
  const planeMat = useRef<THREE.ShaderMaterial>(null);
  const starsRef = useRef<THREE.Points>(null);
  const mouseTarget = useRef(new THREE.Vector2(0.5, 0.5));

  const { starPos, starSizes, starTwinkles } = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    const tw = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = -2 - Math.random() * 7;
      sizes[i] = Math.random() * 2.2 + 0.6;
      tw[i] = Math.random();
    }
    return { starPos: pos, starSizes: sizes, starTwinkles: tw };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    []
  );

  const starUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#c4b5fd") },
    }),
    []
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (planeMat.current) {
      planeMat.current.uniforms.uTime.value = time;
      // lerp the shared uniform vector in place — no per-frame allocation
      planeMat.current.uniforms.uMouse.value.lerp(mouseTarget.current, 0.05);
    }
    if (starsRef.current) {
      starUniforms.uTime.value = time;
      starsRef.current.rotation.z = time * 0.004;
    }
  });

  // Mouse tracking on the canvas container
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    const rect = (e.nativeEvent.currentTarget as Element).getBoundingClientRect();
    mouseTarget.current.set(
      (e.nativeEvent.clientX - rect.left) / rect.width,
      1 - (e.nativeEvent.clientY - rect.top) / rect.height,
    );
  };

  return (
    <group>
      {/* Full-screen aurora plane */}
      <mesh position={[0, 0, -6]} scale={[viewport.width * 1.1, viewport.height * 1.1, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={planeMat}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          depthWrite={false}
        />
      </mesh>

      {/* Twinkling starfield */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={starPos} count={STAR_COUNT} itemSize={3} />
          <bufferAttribute attach="attributes-aSize" array={starSizes} count={STAR_COUNT} itemSize={1} />
          <bufferAttribute attach="attributes-aTwinkle" array={starTwinkles} count={STAR_COUNT} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={starVertexShader}
          fragmentShader={starFragmentShader}
          uniforms={starUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* invisible full-screen pointer tracker */}
      <mesh
        position={[0, 0, -5.9]}
        scale={[viewport.width * 1.1, viewport.height * 1.1, 1]}
        onPointerMove={handlePointerMove}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
