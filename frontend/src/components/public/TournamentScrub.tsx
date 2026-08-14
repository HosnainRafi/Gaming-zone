import { motion, useScroll, useTransform } from "framer-motion";
import { Crown, Medal, Sparkles, Swords, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * TournamentScrub — second pinned scroll moment on the homepage.
 * A tournament panel unfolds in 3D as you scroll, prize cards fly in
 * staggered, then the CTA fades up. Fully reversible on scroll-up.
 */

const prizes = [
  {
    icon: <Crown size={18} />,
    place: "1st Place",
    reward: "Cash Prize + Trophy",
    iconBg: "bg-amber-500/15 text-amber-300",
    text: "text-amber-300",
  },
  {
    icon: <Medal size={18} />,
    place: "2nd Place",
    reward: "Free Play Sessions",
    iconBg: "bg-slate-400/15 text-slate-300",
    text: "text-slate-200",
  },
  {
    icon: <Sparkles size={18} />,
    place: "3rd Place",
    reward: "Snack Pack + Game Credits",
    iconBg: "bg-orange-500/15 text-orange-300",
    text: "text-orange-300",
  },
];

export function TournamentScrub() {
  const sectionRef = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
    );
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Panel unfolds from 3D tilt + depth
  const cardRotateX = useTransform(scrollYProgress, [0.1, 0.4], [22, 0]);
  const cardY = useTransform(scrollYProgress, [0.1, 0.4], [140, 0]);
  const cardOpacity = useTransform(scrollYProgress, [0.08, 0.35], [0, 1]);
  const cardScale = useTransform(scrollYProgress, [0.1, 0.4], [0.92, 1]);

  // Prize cards stagger in
  const p1y = useTransform(scrollYProgress, [0.44, 0.58], [60, 0]);
  const p1o = useTransform(scrollYProgress, [0.42, 0.56], [0, 1]);
  const p2y = useTransform(scrollYProgress, [0.5, 0.64], [60, 0]);
  const p2o = useTransform(scrollYProgress, [0.48, 0.62], [0, 1]);
  const p3y = useTransform(scrollYProgress, [0.56, 0.7], [60, 0]);
  const p3o = useTransform(scrollYProgress, [0.54, 0.68], [0, 1]);

  // CTA
  const ctaOpacity = useTransform(scrollYProgress, [0.76, 0.92], [0, 1]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  // Reduced-motion fallback: static section
  if (reduced) {
    return (
      <section className="relative overflow-hidden bg-gz-bg py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 sm:p-12">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-pink-400">
              <Swords size={13} /> Tournaments
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tighter text-white sm:text-5xl">
              Compete. Conquer.{" "}
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Claim the crown.
              </span>
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {prizes.map((p) => (
                <div
                  key={p.place}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${p.iconBg}`}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider ${p.text}`}
                    >
                      {p.place}
                    </p>
                    <p className="text-sm font-medium text-gray-300">
                      {p.reward}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-[260vh] bg-gz-bg"
      aria-label="Tournaments scroll experience"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.10),transparent_65%)]" />
        <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-gz-cyan/10 blur-[110px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[360px] w-[360px] rounded-full bg-gz-purple/10 blur-[100px]" />
        <div className="absolute inset-0 cyber-grid opacity-25" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            style={{
              rotateX: cardRotateX,
              y: cardY,
              opacity: cardOpacity,
              scale: cardScale,
            }}
            className="relative overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-8 sm:p-12"
          >
            {/* Glow hairline */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/8 blur-[80px]" />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
                  <Swords size={13} /> Tournaments
                </span>
                <h2 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tighter text-white sm:text-5xl lg:text-6xl">
                  Compete.
                  <br />
                  Conquer.
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Claim the crown.
                  </span>
                </h2>
                <p className="mt-5 max-w-md text-gray-300">
                  Weekly esports nights with cash prizes, trophies and the most
                  important reward of all — bragging rights.
                </p>
                <motion.div style={{ opacity: ctaOpacity }} className="mt-8">
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-gz-purple/20 transition-all duration-300 active:scale-95 hover:shadow-[0_0_30px_8px_rgba(124,58,237,0.3)]"
                  >
                    <Trophy size={15} /> Join the Arena
                  </Link>
                </motion.div>
              </div>

              <div className="relative space-y-3">
                {/* Always-visible ornament so the column never feels empty mid-scroll */}
                <div className="pointer-events-none absolute -right-6 -top-10 flex h-56 w-56 items-center justify-center opacity-40 sm:-right-2 sm:-top-12 sm:h-64 sm:w-64">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-white/15"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
                    className="absolute inset-6 rounded-full border border-white/10"
                  />
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                    <Trophy size={26} className="text-cyan-400/60" />
                  </div>
                </div>
                {prizes.map((p, i) => {
                  const y = [p1y, p2y, p3y][i];
                  const o = [p1o, p2o, p3o][i];
                  return (
                    <motion.div
                      key={p.place}
                      style={{ y, opacity: o }}
                      className="relative flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.06] p-4"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${p.iconBg}`}
                      >
                        {p.icon}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-bold uppercase tracking-wider ${p.text}`}
                        >
                          {p.place}
                        </p>
                        <p className="text-sm font-medium text-gray-200">
                          {p.reward}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
            Scroll
          </span>
        </motion.div>
      </div>
    </section>
  );
}
