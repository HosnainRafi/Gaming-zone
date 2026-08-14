# 3D Architecture — Gaming Zone Website

## Overview

The public-facing pages of the Gaming Zone website feature interactive WebGL 3D scenes powered by **Three.js** via **React Three Fiber** (@react-three/fiber v8) and **Drei** (@react-three/drei v9). The aesthetic follows an Active Theory "Neon Deep Space" design language — dark environments with neon purple/cyan/pink particle systems that respond to user input.

## 3D Library

| Package | Version | Purpose |
|---------|---------|--------|
| three | 0.172.0 | Core WebGL rendering engine |
| @react-three/fiber | 8.17.10 | React reconciler for Three.js |
| @react-three/drei | 9.121.4 | Helpers (Preload, etc.) |
| @react-three/postprocessing | 2.19.1 | Cinematic Bloom + Vignette post FX |

## Scene Structure Per Page

### Homepage — HeroParticleField
- **File**: `src/components/three/HeroParticleField.tsx`
- **Scene**: 2,800 particles in a deep-space cloud formation
- **Interactivity**: Mouse cursor creates a repulsion field (radius 4 units, strength 0.6). Particles drift away and wrap around edges.
- **Shading**: Custom GLSL vertex/fragment shaders with additive blending, per-particle glow and bright core.
- **Colors**: Palette of purple (#7C3AED), cyan (#06B6D4), pink (#EC4899), white sparkles — assigned randomly per particle.
- **Placement**: Full-screen behind hero text (z-10), beneath content overlay (z-20).

### Games Page — GamesGridScene
- **File**: `src/components/three/GamesGridScene.tsx`
- **Scene**: 40 random grid lines in 3D space with wireframe icosahedron and octahedron at center.
- **Interactivity**: Slow ambient rotation (sine/cosine oscillation).
- **Colors**: Purple, cyan, pink lines with low opacity (0.15–0.30).
- **Context**: Evokes a digital grid/matrix feel matching the game library theme.

### About Page — AboutConstellation
- **File**: `src/components/three/AboutConstellation.tsx`
- **Scene**: 60 floating nodes with dynamically computed edges (constellation/network pattern). Edges drawn when nodes are within 3.0 units, with distance-based opacity fade.
- **Interactivity**: Nodes gently oscillate with sine/cosine motion, causing the edge network to continuously reshape.
- **Colors**: Purple and cyan nodes with alternating edge colors.
- **Context**: Represents community and connection, matching the "Our Story" narrative.

### Pricing Page — PricingTorus
- **File**: `src/components/three/PricingTorus.tsx`
- **Scene**: 4 nested torus rings (purple, cyan, pink, light purple) rotating at different speeds, with a wireframe icosahedron and glowing sphere at center.
- **Interactivity**: Continuous rotation animation with sine-based tilt.
- **Context**: Orbital/layered structure evoking tiers and choices.

## Shared Infrastructure

### SceneCanvas (`src/components/three/SceneCanvas.tsx`)
Reusable Canvas wrapper with:
- DPR clamped to [1, 1.5] for performance
- Alpha transparency (composites over existing backgrounds)
- `high-performance` GPU power preference
- Suspense + Preload for async asset loading
- `pointerEvents: none` on container, `auto` on canvas (prevents blocking clicks on content above)

### useThreeScene Hook (`src/hooks/useThreeScene.ts`)
Client-side WebGL capability detection:
- Tests for WebGL2/WebGL support
- On mobile (<768px): checks GPU renderer string, disables on known low-end devices (Mali-T, Adreno 3, PowerVR SGX, older Apple GPU)
- Returns `{ shouldRender: boolean, isMobile: boolean }`
- 3D scenes only mount when `shouldRender` is true

## Performance

### Optimization Strategies
1. **DPR clamping**: Max 1.5x pixel ratio prevents over-rendering on HiDPI displays
2. **No antialiasing**: `antialias: false` on WebGL context — particles don't need it
3. **Additive blending**: No depth sorting overhead
4. **Conditional rendering**: `useThreeScene` hook prevents 3D from loading on unsupported devices
5. **No external assets**: All geometry is procedural (no .glb/.gltf files to download)
6. **Code splitting**: Three.js and React Three Fiber are in separate Vite chunks, loaded lazily

### Post-Processing (Bloom + Vignette)
- Implemented in `SceneCanvas.tsx` via @react-three/postprocessing: soft `mipmapBlur` Bloom (intensity 0.8, luminanceThreshold 0.55) + Vignette (darkness 0.62).
- Applies to every scene (hero nebula, games grid, about constellation, pricing torus) through the shared canvas wrapper.
- Auto-disabled on touch/coarse-pointer devices and under `prefers-reduced-motion`; `multisampling=0` keeps the composer cheap since scenes use additive particles (no AA needed).

### Expected Performance
| Device | Expected FPS | Notes |
|--------|-------------|-------|
| Desktop (dedicated GPU) | 55–60 | Full particle count |
| Desktop (integrated GPU) | 40–55 | Full particle count |
| Modern mobile (Adreno 6xx, Mali-G7x) | 30–45 | Full particle count |
| Older mobile | N/A | 3D disabled via useThreeScene |
| WebGL unavailable | N/A | 3D disabled via useThreeScene |

### Known Limitations
- Three.js adds ~540KB gzipped to the bundle (mitigated by code splitting)
- The GamesGridScene uses `<line>` elements which may have 1px width regardless of `linewidth` on some platforms (WebGL limitation)
- The AboutConstellation edge computation is O(n²) per frame — acceptable at 60 nodes but would need optimization for higher counts

## Future Improvements
- Depth of field (DOF) via @react-three/postprocessing (bloom + vignette are already live)
- Scroll-linked 3D animations (parallax depth on hero as user scrolls)
- Instanced mesh rendering for AboutConstellation nodes if count increases
- Dynamic particle count reduction based on real-time FPS monitoring
- Loading skeleton/fallback animation while Three.js chunk loads
