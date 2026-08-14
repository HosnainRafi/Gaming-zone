import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function PricingTorus() {
  const groupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.08;
    groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.1;
    if (ringsRef.current) {
      ringsRef.current.rotation.z = t * 0.12;
      ringsRef.current.rotation.y = Math.cos(t * 0.1) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -2]}>
      <mesh>
        <torusGeometry args={[3.2, 0.02, 16, 100]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.3} />
      </mesh>
      <mesh>
        <torusGeometry args={[2.4, 0.015, 16, 80]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.25} />
      </mesh>
      <group ref={ringsRef} rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.0, 0.01, 16, 60]} />
          <meshBasicMaterial color="#ec4899" transparent opacity={0.2} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.2, 0.008, 16, 40]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.15} />
        </mesh>
      </group>
      <mesh>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshBasicMaterial color="#7c3aed" wireframe transparent opacity={0.15} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

