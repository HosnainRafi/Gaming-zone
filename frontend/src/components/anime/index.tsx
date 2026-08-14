/**
 * Anime FX
 * ---------
 * anime.js v4 powered motion module for the Gaming Zone site.
 * Effects are "video-like" / 3D-feeling: LED grid ripples, SVG line draws,
 * morphing liquid blobs, cursor light orbs, 3D tilt, count-up numbers,
 * seamless marquee and gradient shimmer text.
 *
 * Performance & quality rules (Emil Kowalski / 21st.dev):
 *  - Animate transform / opacity / backgroundPosition only (60fps).
 *  - Every ambient loop stops under prefers-reduced-motion.
 *  - Touch devices skip all cursor-driven effects.
 */
import { animate, morphTo, stagger } from "animejs";
import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { useInView } from "react-intersection-observer";

/* ------------------------------------------------------------------ */
/* Guards                                                              */
/* ------------------------------------------------------------------ */

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isCoarsePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;

/* ------------------------------------------------------------------ */
/* AnimeCounter â€” count-up numbers with easing                         */
/* ------------------------------------------------------------------ */

export function AnimeCounter({
  to,
  from = 0,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1500,
  className = "",
}: {
  to: number;
  from?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 });
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    if (!inView || prefersReducedMotion()) {
      el.textContent = prefix + to.toFixed(decimals) + suffix;
      return;
    }
    const state = { v: from };
    const anim = animate(state, {
      v: to,
      duration,
      ease: "outExpo",
      onUpdate: () => {
        el.textContent =
          prefix +
          (decimals > 0 ? state.v.toFixed(decimals) : String(Math.round(state.v))) +
          suffix;
      },
    });
    return () => { anim.cancel(); };
  }, [inView, to, from, duration, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      <span ref={numRef}>
        {prefix}
        {from}
        {suffix}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* AnimeMarquee â€” seamless infinite ticker (video "now playing" bar)   */
/* ------------------------------------------------------------------ */

export function AnimeMarquee({
  children,
  duration = 24000,
  reverse = false,
  pauseOnHover = true,
  className = "",
}: {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (prefersReducedMotion()) return;
    const anim = animate(track, {
      translateX: reverse ? ["-50%", "0%"] : ["0%", "-50%"],
      duration,
      ease: "linear",
      loop: true,
    });
    const wrap = wrapRef.current;
    let paused = false;
    const pause = () => {
      if (!paused) {
        anim.pause();
        paused = true;
      }
    };
    const resume = () => {
      if (paused) {
        anim.play();
        paused = false;
      }
    };
    if (pauseOnHover && wrap) {
      wrap.addEventListener("mouseenter", pause);
      wrap.addEventListener("mouseleave", resume);
    }
    return () => {
      anim.cancel();
      if (wrap) {
        wrap.removeEventListener("mouseenter", pause);
        wrap.removeEventListener("mouseleave", resume);
      }
    };
  }, [duration, reverse, pauseOnHover]);

  return (
    <div ref={wrapRef} className={`overflow-hidden ${className}`}>
      <div ref={trackRef} className="flex w-max">
        <div className="flex shrink-0 items-center gap-7 pr-7">{children}</div>
        <div className="flex shrink-0 items-center gap-7 pr-7" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AnimeTilt3D â€” cursor-driven 3D tilt with glare (desktop only)       */
/* ------------------------------------------------------------------ */

export function AnimeTilt3D({
  children,
  className = "",
  max = 8,
  scale = 1.015,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
  glare?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const state = useRef({ rx: 0, ry: 0, s: 1 });
  const animRef = useRef<{ cancel: () => void } | null>(null);

  const tweenTo = (rx: number, ry: number, s: number, duration = 180) => {
    if (animRef.current) animRef.current.cancel();
    animRef.current = animate(state.current, {
      rx,
      ry,
      s,
      duration,
      ease: "outQuad",
      onUpdate: () => {
        const el = wrapRef.current;
        if (el) {
          el.style.transform = `perspective(1100px) rotateX(${state.current.rx.toFixed(
            3,
          )}deg) rotateY(${state.current.ry.toFixed(3)}deg) scale(${state.current.s.toFixed(
            4,
          )})`;
        }
      },
    });
  };

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el || isCoarsePointer() || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tweenTo(-py * max, px * max, scale);
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(420px circle at ${
        (px + 0.5) * 100
      }% ${(py + 0.5) * 100}%, rgba(255,255,255,0.10), transparent 45%)`;
    }
  };

  const onLeave = () => {
    tweenTo(0, 0, 1, 420);
    if (glareRef.current) glareRef.current.style.background = "transparent";
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative [transform-style:preserve-3d] ${className}`}
      style={{ transform: "perspective(1100px)" }}
    >
      {glare && (
        <div
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
        />
      )}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AnimeSVGLineDraw â€” video-style stroke drawing of an SVG path        */
/* ------------------------------------------------------------------ */

export function AnimeSVGLineDraw({
  d,
  className = "",
  strokeWidth = 4,
  duration = 1400,
  delay = 250,
  viewBox = "0 0 240 12",
}: {
  d: string;
  className?: string;
  strokeWidth?: number;
  duration?: number;
  delay?: number;
  viewBox?: string;
}) {
  const gradientId = useId().replace(/:/g, "");
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const p = pathRef.current;
    if (!p || !inView) return;
    const len = p.getTotalLength();
    p.style.strokeDasharray = String(len);
    p.style.strokeDashoffset = String(len);
    const anim = animate(p, {
      strokeDashoffset: 0,
      duration,
      delay,
      ease: "inOutQuad",
    });
    return () => { anim.cancel(); };
  }, [inView, duration, delay]);

  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#00E5A0" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d={d}
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* AnimeTextShimmer â€” moving gradient sheen on text (video light sweep)*/
/* ------------------------------------------------------------------ */

export function AnimeTextShimmer({
  children,
  className = "",
  duration = 3000,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    const anim = animate(el, {
      backgroundPosition: ["0% 50%", "200% 50%"],
      duration,
      ease: "linear",
      loop: true,
    });
    return () => { anim.cancel(); };
  }, [duration]);

  return (
    <span ref={ref} className={`bg-[length:200%_auto] ${className}`}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* AnimeMorphBlob â€” liquid morphing gradient blob (ambient video bg)   */
/* ------------------------------------------------------------------ */

const BLOB_PATHS = [
  "M300,80 C420,80 520,180 520,300 C520,420 420,520 300,520 C180,520 80,420 80,300 C80,180 180,80 300,80 Z",
  "M300,60 C440,100 540,220 500,340 C460,460 340,540 220,500 C100,460 40,340 80,220 C120,100 220,40 300,60 Z",
  "M300,120 C400,60 540,160 520,280 C500,400 420,520 300,500 C180,480 60,420 80,300 C100,180 200,180 300,120 Z",
];

export function AnimeMorphBlob({
  className = "",
  duration = 9000,
  fill = "url(#gzBlobGrad)",
}: {
  className?: string;
  duration?: number;
  fill?: string;
}) {
  const gradientId = useId().replace(/:/g, "");
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    if (prefersReducedMotion()) return;
    const anim = animate(p, {
      d: [
        { value: morphTo("#gzBlobB") },
        { value: morphTo("#gzBlobC") },
        { value: morphTo("#gzBlobA") },
      ],
      duration,
      ease: "inOutSine",
      loop: true,
      delay: 600,
    });
    return () => { anim.cancel(); };
  }, [duration]);

  return (
    <svg viewBox="0 0 600 600" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="55%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#00E5A0" />
        </linearGradient>
      </defs>
      <path ref={pathRef} d={BLOB_PATHS[0]} fill={`url(#${gradientId})`} />
      {/* hidden morph targets (same command structure) */}
      <path id="gzBlobA" d={BLOB_PATHS[0]} style={{ display: "none" }} />
      <path id="gzBlobB" d={BLOB_PATHS[1]} style={{ display: "none" }} />
      <path id="gzBlobC" d={BLOB_PATHS[2]} style={{ display: "none" }} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* AnimeGridRipple â€” LED matrix ripple grid (anime.js signature)       */
/* ------------------------------------------------------------------ */

export function AnimeGridRipple({
  rows = 4,
  cols = 24,
  className = "",
  color = "#7C3AED",
}: {
  rows?: number;
  cols?: number;
  className?: string;
  color?: string;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const gridRef = useRef<HTMLDivElement>(null);
  const cells = Array.from({ length: rows * cols });

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !inView) return;
    const cellEls = Array.from(grid.children) as HTMLElement[];
    if (prefersReducedMotion()) return;

    // Entrance wave
    const wave = animate(cellEls, {
      opacity: [0, 0.55, 0.12],
      scale: [0.2, 1],
      backgroundColor: [color, "transparent"],
      delay: stagger(16),
      duration: 900,
      ease: "inOutQuad",
    });

    // A few periodic sweeps from the center (then stop â€” battery friendly)
    let sweepTimer: number | undefined;
    let sweepsLeft = 3;
    const scheduleSweep = () => {
      if (sweepsLeft <= 0) return;
      sweepTimer = window.setTimeout(() => {
        animate(cellEls, {
          opacity: [0.12, 0.6, 0.12],
          scale: [1, 1.55, 1],
          backgroundColor: [color, "transparent"],
          delay: stagger(14, { from: "center" }),
          duration: 1100,
          ease: "inOutQuad",
        });
        sweepsLeft -= 1;
        scheduleSweep();
      }, 4200);
    };
    scheduleSweep();

    return () => {
      wave.cancel();
      if (sweepTimer) window.clearTimeout(sweepTimer);
    };
  }, [inView, color]);

  const onCellEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCoarsePointer() || prefersReducedMotion()) return;
    animate(e.currentTarget, {
      scale: 1.9,
      opacity: 1,
      backgroundColor: color,
      duration: 220,
      ease: "outQuad",
    });
  };

  const onCellLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCoarsePointer() || prefersReducedMotion()) return;
    animate(e.currentTarget, {
      scale: 1,
      opacity: 0.1,
      backgroundColor: "transparent",
      duration: 380,
      ease: "outQuad",
    });
  };

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <div
        ref={gridRef}
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridAutoRows: "1fr",
        }}
      >
        {cells.map((_, i) => (
          <div
            key={i}
            onMouseEnter={onCellEnter}
            onMouseLeave={onCellLeave}
            className="opacity-10"
            style={{ willChange: "transform, opacity" }}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AnimeOrbTrail â€” cursor light orbs (video light-trail effect)        */
/* ------------------------------------------------------------------ */

export function AnimeOrbTrail({
  count = 3,
  className = "",
  size = 22,
  colors = ["#7C3AED", "#00E5A0", "#EC4899"],
}: {
  count?: number;
  className?: string;
  size?: number;
  colors?: string[];
}) {
  const orbsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (isCoarsePointer() || prefersReducedMotion()) return;
    const pts = Array.from({ length: count }, () => ({
      x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
      y: typeof window !== "undefined" ? window.innerHeight / 3 : 0,
    }));
    const onMove = (e: MouseEvent) => {
      pts[0].x = e.clientX;
      pts[0].y = e.clientY;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    let raf = 0;
    const loop = () => {
      for (let i = 1; i < count; i++) {
        pts[i].x += (pts[i - 1].x - pts[i].x) * 0.18;
        pts[i].y += (pts[i - 1].y - pts[i].y) * 0.18;
      }
      orbsRef.current.forEach((orb, i) => {
        if (orb) {
          orb.style.transform = `translate3d(${pts[i].x - size / 2}px, ${
            pts[i].y - size / 2
          }px, 0)`;
        }
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [count, size]);

  return (
    <div className={`pointer-events-none fixed inset-0 z-40 ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            orbsRef.current[i] = el;
          }}
          className="absolute left-0 top-0 rounded-full opacity-60 mix-blend-screen"
          style={{
            width: size,
            height: size,
            background: `radial-gradient(circle, ${colors[i % colors.length]}, transparent 70%)`,
            filter: "blur(1px)",
            boxShadow: `0 0 ${size}px ${colors[i % colors.length]}55`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
/* ------------------------------------------------------------------ */
/* AnimeAreaEnter - staggered "enter the area" reveal (animejs.com     */
/* section-entrance style). Each direct child flies in with stagger.   */
/* ------------------------------------------------------------------ */

export function AnimeAreaEnter({
  children,
  className = "",
  direction = "up",
  distance = 42,
  staggerMs = 75,
  duration = 750,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "zoom" | "blur";
  distance?: number;
  staggerMs?: number;
  duration?: number;
  delay?: number;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.12 });
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !inView) return;
    const targets = Array.from(box.children) as HTMLElement[];
    if (!targets.length) return;
    if (prefersReducedMotion()) return;

    let fromOpacity = 0;
    let fromTranslateY = 0;
    let fromTranslateX = 0;
    let fromScale = 1;
    let fromBlur = 0;
    if (direction === "up") fromTranslateY = distance;
    else if (direction === "down") fromTranslateY = -distance;
    else if (direction === "left") fromTranslateX = distance;
    else if (direction === "right") fromTranslateX = -distance;
    else if (direction === "zoom") fromScale = 0.92;
    else if (direction === "blur") {
      fromTranslateY = distance * 0.5;
      fromBlur = 10;
    }

    // Apply the "from" state instantly so nothing flashes before the tween
    targets.forEach((t) => {
      t.style.opacity = String(fromOpacity);
      t.style.transform = `translate3d(${fromTranslateX}px, ${fromTranslateY}px, 0) scale(${fromScale})`;
      if (fromBlur > 0) t.style.filter = `blur(${fromBlur}px)`;
    });

    const params: Record<string, unknown> = {
      opacity: [fromOpacity, 1],
      translateY: fromTranslateY !== 0 ? [fromTranslateY, 0] : undefined,
      translateX: fromTranslateX !== 0 ? [fromTranslateX, 0] : undefined,
      scale: fromScale !== 1 ? [fromScale, 1] : undefined,
      duration,
      delay: stagger(staggerMs, { start: delay }),
      ease: "outExpo",
      onComplete: () => {
        targets.forEach((t) => {
          t.style.transform = "none";
          t.style.filter = "none";
        });
      },
    };
    const anim = animate(targets, params as never);
    return () => { anim.cancel(); };
  }, [inView, direction, distance, staggerMs, duration, delay]);

  return (
    <div ref={ref}>
      <div ref={boxRef} className={className}>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AnimeMouseCamera - the viewport "camera" follows the cursor over    */
/* the area (animejs.com hero style). Smooth lerped, transform-only.   */
/* ------------------------------------------------------------------ */

export function AnimeMouseCamera({
  children,
  className = "",
  maxRotate = 5,
  maxTranslate = 12,
  scale = 1.01,
  perspective = 1200,
}: {
  children: ReactNode;
  className?: string;
  maxRotate?: number;
  maxTranslate?: number;
  scale?: number;
  perspective?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const cam = camRef.current;
    if (!wrap || !cam) return;
    if (isCoarsePointer() || prefersReducedMotion()) return;

    const target = { rx: 0, ry: 0, tx: 0, ty: 0, s: 1 };
    const cur = { rx: 0, ry: 0, tx: 0, ty: 0, s: 1 };
    let raf = 0;
    let active = false;

    const apply = () => {
      cam.style.transform = `perspective(${perspective}px) rotateX(${cur.rx.toFixed(
        3,
      )}deg) rotateY(${cur.ry.toFixed(3)}deg) translate3d(${cur.tx.toFixed(
        2,
      )}px, ${cur.ty.toFixed(2)}px, 0) scale(${cur.s.toFixed(4)})`;
    };

    const loop = () => {
      const k = 0.12;
      cur.rx += (target.rx - cur.rx) * k;
      cur.ry += (target.ry - cur.ry) * k;
      cur.tx += (target.tx - cur.tx) * k;
      cur.ty += (target.ty - cur.ty) * k;
      cur.s += (target.s - cur.s) * k;
      apply();
      const settled =
        Math.abs(target.rx - cur.rx) < 0.02 &&
        Math.abs(target.ry - cur.ry) < 0.02 &&
        Math.abs(target.tx - cur.tx) < 0.1 &&
        Math.abs(target.ty - cur.ty) < 0.1 &&
        Math.abs(target.s - cur.s) < 0.001;
      if (!active && settled) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      target.rx = -py * maxRotate;
      target.ry = px * maxRotate;
      target.tx = px * maxTranslate;
      target.ty = py * maxTranslate;
      target.s = scale;
      if (!raf) {
        active = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const onLeave = () => {
      target.rx = 0;
      target.ry = 0;
      target.tx = 0;
      target.ty = 0;
      target.s = 1;
      active = false;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    wrap.addEventListener("mousemove", onMove, { passive: true });
    wrap.addEventListener("mouseleave", onLeave);
    apply();
    return () => {
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [maxRotate, maxTranslate, scale, perspective]);

  return (
    <div ref={wrapRef} className={className}>
      <div ref={camRef} className="[transform-style:preserve-3d]">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AnimeCameraReveal - scroll-linked "camera dolly": the section       */
/* zooms in and lifts as it enters the viewport (video-camera feel).   */
/* ------------------------------------------------------------------ */

export function AnimeCameraReveal({
  children,
  className = "",
  range = 56,
  zoomFrom = 0.96,
  zoomTo = 1,
  perspective = 1200,
}: {
  children: ReactNode;
  className?: string;
  /** Vertical camera travel (px) while the section enters view. */
  range?: number;
  zoomFrom?: number;
  zoomTo?: number;
  perspective?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (prefersReducedMotion()) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = wrap.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // p: 0 while the section sits below the viewport -> ~1 once centered
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.85)));
      const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const y = (1 - e) * range;
      const s = zoomFrom + (zoomTo - zoomFrom) * e;
      wrap.style.transform = `perspective(${perspective}px) translate3d(0, ${y.toFixed(
        2,
      )}px, 0) scale(${s.toFixed(4)})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [range, zoomFrom, zoomTo, perspective]);

  return (
    <div ref={wrapRef} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
/* ------------------------------------------------------------------ */
/* AnimeHeroExit - scroll-linked "camera leaves the hero": the hero    */
/* content recedes (lifts, shrinks, fades) as you scroll past it.      */
/* ------------------------------------------------------------------ */

export function AnimeHeroExit({
  children,
  className = "",
  range = 70,
  shrink = 0.94,
  fadeTo = 0.4,
}: {
  children: ReactNode;
  className?: string;
  /** Upward travel (px) as the hero exits. */
  range?: number;
  /** Scale the content recedes to. */
  shrink?: number;
  /** Opacity the content fades to. */
  fadeTo?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (prefersReducedMotion()) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = wrap.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // progress 0 while the hero top is at/below the viewport top;
      // grows as the hero scrolls away
      const p = Math.min(1, Math.max(0, -r.top / (vh * 0.6)));
      const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const y = e * range;
      const s = 1 - (1 - shrink) * e;
      const o = 1 - (1 - fadeTo) * e;
      wrap.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${s.toFixed(
        4,
      )})`;
      wrap.style.opacity = o.toFixed(3);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [range, shrink, fadeTo]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </div>
  );
}

