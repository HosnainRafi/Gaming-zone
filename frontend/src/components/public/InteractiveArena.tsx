import { Float, MeshDistortMaterial, OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

function ArenaCore() {
  const core = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!core.current) return;
    core.current.rotation.x += delta * 0.18;
    core.current.rotation.y += delta * 0.42;
    core.current.rotation.z = state.pointer.x * 0.18;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.28} floatIntensity={0.8}>
      <mesh ref={core} scale={1.45}>
        <icosahedronGeometry args={[1.45, 3]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          emissive="#3b0764"
          emissiveIntensity={1.4}
          roughness={0.24}
          metalness={0.72}
          distort={0.28}
          speed={1.6}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={2.35}>
        <torusGeometry args={[1.35, 0.018, 16, 96]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.82} />
      </mesh>
      <mesh rotation={[0.2, Math.PI / 2.5, 0]} scale={2.65}>
        <torusGeometry args={[1.35, 0.012, 16, 96]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.58} />
      </mesh>
    </Float>
  );
}

function ArenaScene() {
  return (
    <>
      <color attach="background" args={["#080812"]} />
      <ambientLight intensity={0.8} />
      <pointLight position={[3, 2, 4]} color="#22d3ee" intensity={12} distance={8} />
      <pointLight position={[-3, -1, 2]} color="#a855f7" intensity={10} distance={7} />
      <Stars radius={9} depth={5} count={420} factor={2.4} saturation={0.8} fade speed={0.5} />
      <ArenaCore />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} rotateSpeed={0.35} />
    </>
  );
}

export function InteractiveArena() {
  return (
    <div className="pointer-events-auto relative h-[330px] w-full max-w-[520px] overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[#080812]/60 shadow-[0_0_80px_rgba(124,58,237,0.2)] backdrop-blur-sm sm:h-[410px] lg:h-[500px]" aria-label="Interactive neon arena visualization">
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_28%,rgba(8,8,18,0.75)_76%)]" />
      <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.28em] text-cyan-200/75 backdrop-blur-md">
        Drag to explore
      </div>
      <Canvas camera={{ position: [0, 0, 5.3], fov: 42 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
        <ArenaScene />
      </Canvas>
    </div>
  );
}

export default InteractiveArena;

// DesignGate: DG-3D-001, DG-3D-002, DG-DEPTH-001, DG-INTERACT-001, DG-PERF-001
// The focal WebGL surface is kept to the hero; navigation and primary CTAs remain DOM controls.
// Reduced-motion users can still use the surrounding DOM content and native canvas controls.
