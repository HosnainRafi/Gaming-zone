import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const LINE_COUNT = 40;
const DEPTH = 12;

export function GamesGridScene() {
  const groupRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const result: { points: Float32Array; color: [number, number, number] }[] = [];
    const colors: [number, number, number][] = [
      [0.486, 0.227, 0.929],
      [0.024, 0.714, 0.831],
      [0.925, 0.282, 0.600],
    ];
    for (let i = 0; i < LINE_COUNT; i++) {
      const pts = new Float32Array(6);
      const side = Math.random() > 0.5 ? 1 : -1;
      const axis = Math.floor(Math.random() * 3);
      if (axis === 0) {
        pts[0] = -8 * side;
        pts[1] = (Math.random() - 0.5) * 10;
        pts[2] = (Math.random() - 0.5) * DEPTH;
        pts[3] = 8 * side;
        pts[4] = pts[1] + (Math.random() - 0.5) * 2;
        pts[5] = pts[2] + (Math.random() - 0.5) * 2;
      } else if (axis === 1) {
        pts[0] = (Math.random() - 0.5) * 16;
        pts[1] = -5 * side;
        pts[2] = (Math.random() - 0.5) * DEPTH;
        pts[3] = pts[0] + (Math.random() - 0.5) * 2;
        pts[4] = 5 * side;
        pts[5] = pts[2] + (Math.random() - 0.5) * 2;
      } else {
        pts[0] = (Math.random() - 0.5) * 16;
        pts[1] = (Math.random() - 0.5) * 10;
        pts[2] = -DEPTH / 2;
        pts[3] = pts[0] + (Math.random() - 0.5) * 2;
        pts[4] = pts[1] + (Math.random() - 0.5) * 2;
        pts[5] = DEPTH / 2;
      }
      result.push({
        points: pts,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return result;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.05;
    groupRef.current.rotation.x = Math.cos(t * 0.08) * 0.03;
  });

  return (
    <group ref={groupRef} position={[0, 0, -3]}>
      {lines.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={line.points}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={line.color}
            transparent
            opacity={0.15 + Math.random() * 0.15}
            linewidth={1}
          />
        </line>
      ))}
      <mesh>
        <icosahedronGeometry args={[2.5, 1]} />
        <meshBasicMaterial
          color="#7c3aed"
          wireframe
          transparent
          opacity={0.06}
        />
      </mesh>
      <mesh>
        <octahedronGeometry args={[1.8, 0]} />
        <meshBasicMaterial
          color="#06b6d4"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  );
}

