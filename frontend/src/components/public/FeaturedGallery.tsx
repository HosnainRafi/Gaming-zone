import { motion, useScroll, useTransform } from "framer-motion";
import { Gamepad2, MoveHorizontal } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Game } from "../../api/games";

const MAX_CARDS = 8;

/**
 * FeaturedGallery — Noomo-style horizontal 3D gallery.
 * Scrolling vertically scrubs a wall of angled game cards horizontally
 * across the screen (reversible). Cards sit on a 3D curve and swing to
 * face the viewer on hover.
 */
export function FeaturedGallery({ games }: { games: Game[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(700);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
    );
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      if (!rowRef.current) return;
      const rowW = rowRef.current.scrollWidth;
      const vw = window.innerWidth;
      setShift(Math.max(0, rowW - vw + 64));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [games.length]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const rowX = useTransform(scrollYProgress, [0.05, 0.95], [0, -shift]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const progressFill = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const cards = games.slice(0, MAX_CARDS);
  if (cards.length === 0) return null;

  // Reduced-motion fallback: static horizontal scroll row
  if (reduced) {
    return (
      <section className="relative overflow-hidden bg-gz-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gz-purple">
            <MoveHorizontal size={13} /> The Vault
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tighter text-white sm:text-5xl">
            Featured Titles
          </h2>
        </div>
        <div className="mt-10 flex gap-6 overflow-x-auto px-4 pb-6 sm:px-6 lg:px-8">
          {cards.map((game) => (
            <div
              key={game.id}
              className="relative h-[400px] w-60 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d18] sm:w-64"
            >
              {game.imageUrl ? (
                <img
                  src={game.imageUrl}
                  alt={game.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500/15 to-cyan-500/10">
                  <Gamepad2 size={44} className="text-purple-500/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="rounded border border-white/20 bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90">
                  {game.platform}
                </span>
                <h3 className="mt-2 font-display text-lg font-bold text-white line-clamp-1">
                  {game.title}
                </h3>
                <p className="mt-0.5 text-xs uppercase tracking-wider text-gray-400">
                  {game.genre}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-[300vh] bg-gz-bg"
      aria-label="Horizontal 3D gallery of featured games"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_60%)]" />
        <div className="absolute -right-32 top-1/4 h-[420px] w-[420px] rounded-full bg-gz-cyan/10 blur-[140px]" />
        <div className="absolute -left-24 bottom-1/4 h-[380px] w-[380px] rounded-full bg-gz-purple/12 blur-[130px]" />
        <div className="absolute inset-0 cyber-grid opacity-20" />

        {/* Heading */}
        <motion.div
          style={{ opacity: titleOpacity }}
          className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gz-purple">
            <MoveHorizontal size={13} /> The Vault
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tighter text-white sm:text-5xl">
            Scroll to browse the{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              library
            </span>
          </h2>
        </motion.div>

        {/* 3D card wall */}
        <div className="relative z-10 mt-10">
          <motion.div
            ref={rowRef}
            style={{ x: rowX }}
            className="flex w-max items-stretch gap-6 pl-[10vw] [perspective:1400px]"
          >
            {cards.map((game, i) => (
              <GalleryCard
                key={game.id}
                game={game}
                angle={(i - (cards.length - 1) / 2) * 7}
              />
            ))}
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
            Keep scrolling
          </span>
        </motion.div>

        {/* Progress bar */}
        <div className="absolute bottom-6 left-1/2 z-10 h-px w-40 -translate-x-1/2 bg-white/10">
          <motion.div
            style={{ scaleX: progressFill }}
            className="h-full origin-left bg-gradient-to-r from-purple-500 to-cyan-400"
          />
        </div>
      </div>
    </section>
  );
}

function GalleryCard({ game, angle }: { game: Game; angle: number }) {
  return (
    <motion.div
      style={{ rotateY: angle }}
      whileHover={{ rotateY: 0, scale: 1.05, y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative h-[400px] w-60 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d18] [transform-style:preserve-3d] sm:h-[420px] sm:w-64"
    >
      {game.imageUrl ? (
        <img
          src={game.imageUrl}
          alt={game.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500/15 to-cyan-500/10">
          <Gamepad2 size={44} className="text-purple-500/40" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <span className="rounded border border-white/20 bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90">
          {game.platform}
        </span>
        <h3 className="mt-2 font-display text-lg font-bold text-white line-clamp-1">
          {game.title}
        </h3>
        <p className="mt-0.5 text-xs uppercase tracking-wider text-gray-400">
          {game.genre}
        </p>
      </div>
      {/* Hover shine (no backdrop-filter inside 3D context) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </motion.div>
  );
}
