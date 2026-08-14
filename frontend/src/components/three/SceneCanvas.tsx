import { Canvas, type CanvasProps } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, type ReactNode } from "react";

/**
 * SceneCanvas — shared WebGL canvas with optional cinematic post-processing.
 *
 * Post FX (Bloom + Vignette) are enabled by default and automatically skipped
 * on touch / coarse-pointer devices and under prefers-reduced-motion, keeping
 * the 3D scenes smooth on low-end hardware.
 *
 * Bloom can be tuned per scene via props (e.g. brighter hero, subtler grids).
 */
export function SceneCanvas({
  children,
  className = "",
  style,
  "aria-label": ariaLabel = "3D scene",
  effects = true,
  bloomIntensity = 0.8,
  bloomThreshold = 0.55,
  vignetteDarkness = 0.62,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
  /** Cinematic bloom + vignette post-processing (auto-disabled on touch / reduced-motion). */
  effects?: boolean;
  /** Bloom strength for this scene. */
  bloomIntensity?: number;
  /** Luminance threshold — only pixels brighter than this glow. */
  bloomThreshold?: number;
  /** Vignette corner darkness. */
  vignetteDarkness?: number;
} & Omit<CanvasProps, "children" | "className" | "style">) {
  const canPost =
    effects &&
    typeof window !== "undefined" &&
    !window.matchMedia("(pointer: coarse)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{ pointerEvents: "none", ...style }}
      role="img"
      aria-label={ariaLabel}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ pointerEvents: "auto" }}
        {...rest}
      >
        <Suspense fallback={null}>{children}</Suspense>
        {canPost && (
          <EffectComposer multisampling={0} enableNormalPass={false}>
            {/* Soft mipmap bloom: only the brightest neon elements glow */}
            <Bloom
              mipmapBlur
              intensity={bloomIntensity}
              luminanceThreshold={bloomThreshold}
              luminanceSmoothing={0.2}
              radius={0.7}
            />
            {/* Cinematic corner falloff */}
            <Vignette offset={0.28} darkness={vignetteDarkness} />
          </EffectComposer>
        )}
        <Preload all />
      </Canvas>
    </div>
  );
}
