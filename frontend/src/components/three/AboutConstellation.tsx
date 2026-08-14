import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 60;
const EDGE_MAX_DIST = 3.0;

export function AboutConstellation() {
  const lineRef = useRef<THREE.LineSegments>(null);
  const nodesRef = useRef<THREE.Points>(null);

  const { positions, basePositions, sizes } = useMemo(() => {
    const pos = new Float32Array(NODE_COUNT * 3);
    const base = new Float32Array(NODE_COUNT * 3);
    const sz = new Float32Array(NODE_COUNT);
    for (let i = 0; i < NODE_COUNT; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 14;
      const y = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 4 - 1;
      pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z;
      base[i3] = x; base[i3 + 1] = y; base[i3 + 2] = z;
      sz[i] = Math.random() * 4 + 2;
    }
    return { positions: pos, basePositions: base, sizes: sz };
  }, []);

  const linePositions = useMemo(() => new Float32Array(NODE_COUNT * NODE_COUNT * 6), []);
  const lineColors = useMemo(() => new Float32Array(NODE_COUNT * NODE_COUNT * 6), []);

  useFrame((state) => {
    if (!nodesRef.current || !lineRef.current) return;
    const time = state.clock.elapsedTime;
    const posAttr = nodesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < NODE_COUNT; i++) {
      const i3 = i * 3;
      arr[i3] = basePositions[i3] + Math.sin(time * 0.2 + i * 0.5) * 0.15;
      arr[i3 + 1] = basePositions[i3 + 1] + Math.cos(time * 0.15 + i * 0.3) * 0.15;
    }
    posAttr.needsUpdate = true;

    let lineIdx = 0;
    const purple = [0.486, 0.227, 0.929];
    const cyan = [0.024, 0.714, 0.831];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = arr[i * 3] - arr[j * 3];
        const dy = arr[i * 3 + 1] - arr[j * 3 + 1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < EDGE_MAX_DIST) {
          const li = lineIdx * 6;
          linePositions[li] = arr[i * 3];
          linePositions[li + 1] = arr[i * 3 + 1];
          linePositions[li + 2] = arr[i * 3 + 2];
          linePositions[li + 3] = arr[j * 3];
          linePositions[li + 4] = arr[j * 3 + 1];
          linePositions[li + 5] = arr[j * 3 + 2];
          const col = i % 2 === 0 ? purple : cyan;
          lineColors[li] = col[0]; lineColors[li + 1] = col[1]; lineColors[li + 2] = col[2];
          lineColors[li + 3] = col[0]; lineColors[li + 4] = col[1]; lineColors[li + 5] = col[2];
          lineIdx++;
        }
      }
    }
    const lineGeo = lineRef.current.geometry;
    const lpAttr = lineGeo.attributes.position as THREE.BufferAttribute;
    const lcAttr = lineGeo.attributes.color as THREE.BufferAttribute;
    (lpAttr.array as Float32Array).fill(0);
    (lcAttr.array as Float32Array).fill(0);
    (lpAttr.array as Float32Array).set(linePositions.subarray(0, lineIdx * 6));
    (lcAttr.array as Float32Array).set(lineColors.subarray(0, lineIdx * 6));
    lpAttr.needsUpdate = true;
    lcAttr.needsUpdate = true;
    lineGeo.setDrawRange(0, lineIdx * 2);
  });

  return (
    <group position={[0, 0, -2]}>
      <points ref={nodesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={positions} count={NODE_COUNT} itemSize={3} />
          <bufferAttribute attach="attributes-aSize" array={sizes} count={NODE_COUNT} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#a855f7"
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={linePositions} count={NODE_COUNT * NODE_COUNT * 2} itemSize={3} />
          <bufferAttribute attach="attributes-color" array={lineColors} count={NODE_COUNT * NODE_COUNT * 2} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
    </group>
  );
}
