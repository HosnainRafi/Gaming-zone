import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, ChevronDown, Gamepad2, Gauge, Monitor } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import img1 from "../../images/1.jpg";
import img4 from "../../images/4.jpg";

/**
 * ScrollShowcase — a Noomo-style "video scrub" stage.
 *
 * The section is a tall scroll runway (340vh) with a pinned full-screen stage.
 * Scroll progress drives the sequence like a video timeline:
 *   0.00–0.18  CLOSED  — two 3D door panels cover the screen (title cards)
 *   0.18–0.46  OPEN    — doors swing open on their hinges, stage unfolds from depth
 *   0.40–0.72  REVEAL  — feature cards fly in, staggered, with 3D tilt
 *   0.78–1.00  PUSH    — camera zooms into the stage, CTA fades in
 * Scrolling up reverses every step — the doors close again.
 */

const showcaseFeatures = [
  {
    icon: <Monitor size={22} />,
    title: "RTX Power",
    desc: "High-end gaming PCs with high-refresh displays for buttery-smooth FPS.",
    accent: "from-purple-500/20 to-transparent",
    iconColor: "text-purple-400",
  },
  {
    icon: <Gamepad2 size={22} />,
    title: "PS5 & PS4 Pro",
    desc: "Next-gen consoles with 4K HDR visuals and DualSense haptics.",
    accent: "from-cyan-500/20 to-transparent",
    iconColor: "text-cyan-400",
  },
  {
    icon: <Gauge size={22} />,
    title: "Racing Sims",
    desc: "Force-feedback wheels, pedals and full sim rigs for real driving feel.",
    accent: "from-teal-500/20 to-transparent",
    iconColor: "text-teal-400",
  },
];

export function ScrollShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setReduced(
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
    );
    setIsMobile(window.innerWidth < 768);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Door panels — flat (closed) → swing away on their hinges (open)
  const doorLeft = useTransform(scrollYProgress, [0.18, 0.46], [0, -112]);
  const doorRight = useTransform(scrollYProgress, [0.18, 0.46], [0, 112]);

  // Inner stage — unfolds from depth as the doors open
  const stageOpacity = useTransform(scrollYProgress, [0.15, 0.34], [0, 1]);
  const stageZ = useTransform(scrollYProgress, [0.18, 0.46], [-360, 0]);
  // Gentle tilt only; resolves flat by 0.42 so cards are always crisp
  const stageRotateX = useTransform(scrollYProgress, [0.18, 0.42], [8, 0]);

  // Closed-state UI
  const hintOpacity = useTransform(scrollYProgress, [0.02, 0.14], [1, 0]);

  // Staggered feature cards
  const c1y = useTransform(scrollYProgress, [0.42, 0.6], [80, 0]);
  const c1o = useTransform(scrollYProgress, [0.4, 0.56], [0, 1]);
  const c2y = useTransform(scrollYProgress, [0.48, 0.66], [80, 0]);
  const c2o = useTransform(scrollYProgress, [0.46, 0.62], [0, 1]);
  const c3y = useTransform(scrollYProgress, [0.54, 0.72], [80, 0]);
  const c3o = useTransform(scrollYProgress, [0.52, 0.68], [0, 1]);

  const headlineScale = useTransform(scrollYProgress, [0.42, 0.62], [0.92, 1]);

  // Final push — camera zoom + CTA
  const zoom = useTransform(scrollYProgress, [0.78, 1], [1, 1.14]);
  const ctaOpacity = useTransform(scrollYProgress, [0.84, 0.97], [0, 1]);

  // Video-scrub rail
  const railFill = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const railDot = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Subtle pointer parallax (desktop only)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 120, damping: 20 });
  const springY = useSpring(my, { stiffness: 120, damping: 20 });
  const parallaxX = useTransform(springX, [-1, 1], [10, -10]);
  const parallaxY = useTransform(springY, [-1, 1], [8, -8]);

  // ── Reduced-motion fallback: static, fully open ──
  if (reduced) {
    return (
      <section className="relative overflow-hidden bg-gz-bg py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gz-purple">
              The Experience
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tighter text-white sm:text-5xl">
              Step Inside the Arena
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-gray-300">
              Three ways to play — all under one roof.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {showcaseFeatures.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b ${f.accent} ${f.iconColor}`}>
                  {f.icon}
                </div>
                <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      onPointerMove={(e) => {
        if (isMobile) return;
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
        my.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
      }}
      className="relative h-[340vh] bg-gz-bg"
      aria-label="Scroll-driven 3D showcase of the gaming arena"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Stage backdrop — CSS aurora + grid (no second WebGL context) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.12),transparent_65%)]" />
        <div className="absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-gz-purple/10 blur-[100px]" />
        <div className="absolute -right-24 bottom-1/4 h-[360px] w-[360px] rounded-full bg-gz-cyan/10 blur-[100px]" />
        <div className="absolute inset-0 cyber-grid opacity-30" />

        {/* Inner stage (behind doors) */}
        <motion.div
          style={{
            opacity: stageOpacity,
            z: stageZ,
            rotateX: stageRotateX,
            scale: zoom,
          }}
          className="relative z-10 flex h-full items-center justify-center"
        >
          <motion.div
            style={{ x: parallaxX, y: parallaxY }}
            className="mx-auto w-full max-w-6xl px-4 text-center sm:px-6 lg:px-8"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-gz-purple/30 bg-gz-purple/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gz-cyan" />
              The Experience
            </span>

            <motion.h2
              style={{ scale: headlineScale }}
              className="mt-6 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tighter text-white sm:text-6xl lg:text-7xl"
            >
              Step Inside{" "}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                the Arena
              </span>
            </motion.h2>

            <div className="mx-auto mt-14 grid max-w-4xl gap-5 sm:grid-cols-3">
              {showcaseFeatures.map((f, i) => {
                const y = [c1y, c2y, c3y][i];
                const o = [c1o, c2o, c3o][i];
                return (
                  <motion.div
                    key={f.title}
                    style={{ y, opacity: o }}
                    className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] p-6 text-left"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${f.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                    />
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.08] transition-colors group-hover:bg-white/15">
                      <span className={f.iconColor}>{f.icon}</span>
                    </div>
                    <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-300">
                      {f.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              style={{ opacity: ctaOpacity }}
              className="mt-12 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                to="/pricing"
                className="group inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-gz-purple/20 transition-all duration-300 active:scale-95 hover:shadow-[0_0_30px_8px_rgba(124,58,237,0.35)]"
              >
                View Pricing
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/games"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 active:scale-95 hover:border-gz-purple hover:bg-gz-purple/10"
              >
                Browse Games
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── 3D door panels (z-20, above the stage) ── */}
        <div className="pointer-events-none absolute inset-0 z-20 [perspective:1600px]">
          {/* Left door */}
          <motion.div
            style={{ rotateY: doorLeft }}
            className="absolute inset-y-0 left-0 w-1/2 origin-left overflow-hidden [transform-style:preserve-3d] [backface-visibility:hidden]"
          >
            <img src={img1} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-gz-bg/70" />
            <div className="absolute inset-0 scanlines opacity-30" />
            {/* Seam highlight */}
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-4xl font-bold uppercase tracking-tighter text-white/90 drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)] sm:text-6xl">
                Enter the
              </span>
            </div>
          </motion.div>

          {/* Right door */}
          <motion.div
            style={{ rotateY: doorRight }}
            className="absolute inset-y-0 right-0 w-1/2 origin-right overflow-hidden [transform-style:preserve-3d] [backface-visibility:hidden]"
          >
            <img src={img4} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/30 to-gz-bg/70" />
            <div className="absolute inset-0 scanlines opacity-30" />
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text font-display text-4xl font-bold uppercase tracking-tighter text-transparent drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)] sm:text-6xl">
                Arena
              </span>
            </div>
          </motion.div>
        </div>

        {/* Closed-state scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1 text-white/70"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
              Scroll to open
            </span>
            <ChevronDown size={16} />
          </motion.div>
        </motion.div>

        {/* Video-scrub rail */}
        <div className="absolute right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40 [writing-mode:vertical-rl]">
            Scroll
          </span>
          <div className="relative h-36 w-px bg-white/10">
            <motion.div
              style={{ scaleY: railFill }}
              className="absolute inset-0 origin-top bg-gradient-to-b from-purple-500 to-cyan-400"
            />
          </div>
          <motion.div
            style={{ top: railDot }}
            className="absolute h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]"
          />
        </div>
      </div>
    </section>
  );
}
