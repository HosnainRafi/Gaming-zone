import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * CursorFX — subtle 3D cursor accent (desktop, pointer:fine only).
 * A cyan dot follows the pointer instantly; a violet ring trails on a
 * spring. The ring expands over interactive elements. The native cursor
 * stays visible; this is an accent, not a replacement.
 */
export function CursorFX() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 30, mass: 0.55 });
  const ringY = useSpring(y, { stiffness: 320, damping: 30, mass: 0.55 });

  useEffect(() => {
    const fine = window.matchMedia?.("(pointer: fine)")?.matches;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")
      ?.matches;
    if (!fine || reduced) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      setHovering(
        !!t?.closest?.(
          "a, button, [role='button'], input, select, textarea, label, [data-cursor]",
        ),
      );
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* Trailing ring */}
      <motion.div
        style={{ x: ringX, y: ringY }}
        className="pointer-events-none fixed left-0 top-0 z-[9998]"
        aria-hidden="true"
      >
        <motion.div
          animate={{
            scale: hovering ? 1.9 : 1,
            opacity: hovering ? 0.85 : 0.55,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/60 bg-violet-400/5"
        />
      </motion.div>
      {/* Center dot */}
      <motion.div
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        aria-hidden="true"
      >
        <motion.div
          animate={{ scale: hovering ? 0.5 : 1, opacity: hovering ? 0.4 : 1 }}
          className="h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]"
        />
      </motion.div>
    </>
  );
}
