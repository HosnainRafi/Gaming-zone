import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Headphones,
  MapPin,
  Monitor,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { getGames, type Game } from "../api/games";
import { getPricingTiers, type PricingTier } from "../api/pricing";
import { getSliderImages, type SliderImage } from "../api/slider";
import {
  BlurFade,
  HoverCard,
  LineDraw,
  MagneticButton,
  NumberTicker,
  Reveal,
  StaggerContainer,
  StaggerItem,
} from "../components/motion";
import {
  FloatingParticles,
  GlowingOrb,
  SparklesText,
  SpotlightCard,
  TextCycle,
} from "../components/motion/effects";
import { PublicShell } from "../components/public/PublicShell";
import { InteractiveArena } from "../components/public/InteractiveArena";
import { useSiteSettings } from "../context/SiteSettingsContext";

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { settings } = useSiteSettings();

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroScroll, [0, 1], [0, 150]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    getGames().then((d) => setGames(d.slice(0, 2)));
    getPricingTiers().then(setTiers);
    getSliderImages().then(setSliderImages);
  }, []);

  useEffect(() => {
    if (sliderImages.length < 2) return;
    const t = setInterval(() => setCurrentSlide((c) => (c + 1) % sliderImages.length), 5000);
    return () => clearInterval(t);
  }, [sliderImages.length]);

  const prevSlide = useCallback(
    () => setCurrentSlide((c) => (c - 1 + sliderImages.length) % sliderImages.length),
    [sliderImages.length],
  );
  const nextSlide = useCallback(
    () => setCurrentSlide((c) => (c + 1) % sliderImages.length),
    [sliderImages.length],
  );

  return (
    <PublicShell>

      {/* ----------------------------------------------------------
          HERO  — full-viewport cinematic
      ---------------------------------------------------------- */}
      <section ref={heroRef} id="hero" className="relative h-[100vh] min-h-[640px] overflow-hidden">

        {/* Slider image */}
        <AnimatePresence mode="wait">
          {sliderImages.length > 0 && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <motion.img
                src={sliderImages[currentSlide]?.imageUrl}
                alt={sliderImages[currentSlide]?.title || "Gaming Lounge"}
                className="h-full w-full object-cover"
                style={{ y: heroY }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dark gradient vignettes */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 z-10" />

        {/* Cyber grid overlay on hero */}
        <div className="absolute inset-0 z-10 cyber-grid opacity-20" />

        {/* Aurora colour blobs */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 15% 50%, rgba(124,58,237,0.25) 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 80% 80%, rgba(6,182,212,0.18) 0%, transparent 70%)",
          }}
        />

        <FloatingParticles count={30} className="z-10 opacity-50" />
        <GlowingOrb className="top-1/4 -right-40 z-10" color="purple" size={500} />
        <GlowingOrb className="bottom-1/4 -left-40 z-10" color="cyan" size={400} />

        {/* Hero content */}
        <motion.div style={{ opacity: heroOpacity }} className="relative z-20 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
              <div className="max-w-2xl">

              <BlurFade delay={0.1}>
                <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-purple-300 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                  Level up your game
                </span>
              </BlurFade>

              <BlurFade delay={0.2}>
                <h1 className="mt-6 text-5xl font-black uppercase leading-[1.05] text-white sm:text-6xl lg:text-7xl xl:text-8xl">
                  The Ultimate{" "}
                  <span className="block mt-1">
                    <SparklesText sparkleCount={8} colors={["#7c3aed", "#06b6d4", "#ec4899", "#ffffff"]} className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                      <TextCycle
                        words={["PS5", "PS4 Pro", "Gaming"]}
                        interval={2500}
                        className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent"
                      />
                    </SparklesText>
                  </span>
                  <span className="block mt-1">Experience.</span>
                </h1>
              </BlurFade>

              <BlurFade delay={0.35}>
                <p className="mt-6 max-w-lg text-base leading-relaxed text-gray-300 sm:text-lg">
                  Premium gaming lounge featuring the latest titles. Zero latency,
                  high-refresh rates, and professional-grade comfort.
                </p>
              </BlurFade>

              <BlurFade delay={0.5}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <MagneticButton strength={0.15}>
                    <Link
                      to="/about"
                      className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/60 hover:scale-[1.02] active:scale-95"
                    >
                      Contact Us Today
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </MagneticButton>
                  <MagneticButton strength={0.15}>
                    <Link
                      to="/games"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-purple-400/40 hover:bg-purple-500/10"
                    >
                      Explore Games
                    </Link>
                  </MagneticButton>
                </div>
              </BlurFade>

              {/* Feature chips */}
              <BlurFade delay={0.65}>
                <div className="mt-8 flex flex-wrap gap-3">
                  {["PS5 & PS4 Pro", "4K 120Hz", "1Gbps Fiber", "Walk-In Welcome"].map((chip) => (
                    <span key={chip} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-gray-400 backdrop-blur-sm">
                      <Zap size={10} className="text-cyan-400" />
                      {chip}
                    </span>
                  ))}
                </div>
              </BlurFade>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 28, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="hidden justify-self-end lg:block"
              >
                <InteractiveArena />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Slide controls */}
        {sliderImages.length > 1 && (
          <div className="absolute bottom-8 right-8 z-30 flex items-center gap-3">
            <button onClick={prevSlide} className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/30 bg-black/50 text-white backdrop-blur-sm transition hover:border-purple-400/60 hover:bg-black/70">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {sliderImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all ${i === currentSlide ? "w-6 bg-gradient-to-r from-purple-500 to-cyan-500 shadow-[0_0_8px_rgba(124,58,237,0.8)]" : "w-2 bg-white/25 hover:bg-white/50"}`}
                />
              ))}
            </div>
            <button onClick={nextSlide} className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/30 bg-black/50 text-white backdrop-blur-sm transition hover:border-purple-400/60 hover:bg-black/70">
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080812] to-transparent z-20" />
      </section>

      {/* ----------------------------------------------------------
          FEATURED GAMES  — deep navy with dot grid
      ---------------------------------------------------------- */}
      <section id="games" className="relative bg-[#080812] py-20 lg:py-28 overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[100px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2">
                <Gamepad2 size={14} /> Now Playing
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Featured Games
              </h2>
              <p className="mt-2 text-gray-400 max-w-sm">
                The latest blockbusters, optimized for peak performance.
              </p>
            </Reveal>
            <BlurFade delay={0.2}>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-purple-500/25 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-300">
                  120Hz
                </span>
                <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  4K Ready
                </span>
              </div>
            </BlurFade>
          </div>

          <LineDraw className="mb-10 mt-6" />

          <div className="grid gap-6 md:grid-cols-2">
            {games.map((game, idx) => (
              <BlurFade key={game.id} delay={0.1 + idx * 0.15}>
                <HoverCard className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-purple-500/15">
                  <img
                    src={game.imageUrl || "/placeholder-game.jpg"}
                    alt={game.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(124,58,237,0.3) 0%, transparent 70%)" }} />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                    <div className="flex gap-2 mb-3">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + idx * 0.1, type: "spring", stiffness: 200, damping: 15 }}
                        className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg ${game.platform === "PS5" ? "bg-white text-black" : "bg-purple-600 text-white shadow-purple-500/30"}`}
                      >
                        {game.platform}
                      </motion.span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">{game.title}</h3>
                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                      {game.genre || "Experience the next generation of gaming."}
                    </p>
                    <Link to="/games" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 transition-all group-hover:text-cyan-300 group-hover:translate-x-1">
                      View Stations <ArrowRight size={14} />
                    </Link>
                  </div>
                  {/* Neon border glow on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ring-1 ring-purple-500/30 shadow-[inset_0_0_30px_rgba(124,58,237,0.1)]" />
                </HoverCard>
              </BlurFade>
            ))}
          </div>

          <BlurFade delay={0.4} className="mt-8 text-center">
            <Link to="/games" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 transition hover:text-purple-300">
              View All Games <ArrowRight size={14} />
            </Link>
          </BlurFade>
        </div>
      </section>

      {/* Glow section divider */}
      <div className="glow-divider" />

      {/* ----------------------------------------------------------
          PRICING  — cyber grid with radial glow centre
      ---------------------------------------------------------- */}
      <section id="pricing" className="relative bg-[#070710] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 cyber-grid pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-purple-600/12 blur-[120px]" />
          <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-pink-500/8 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-cyan-500/8 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center justify-center gap-2">
              <Zap size={14} /> Tiered Access
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Competitive Rates
            </h2>
            <p className="mt-3 text-gray-400 max-w-lg mx-auto">
              Elite performance doesn't have to break the bank. Choose the plan that fits your grind.
            </p>
          </Reveal>

          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
            {tiers.map((tier, idx) => (
              <StaggerItem key={tier.id}>
                <motion.div
                  whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className={`relative flex flex-col overflow-hidden rounded-2xl border p-7 transition-all ${
                    tier.isPopular
                      ? "border-purple-500/50 shadow-2xl shadow-purple-500/15"
                      : "border-white/8 hover:border-purple-500/25"
                  }`}
                  style={tier.isPopular ? {
                    background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 50%, rgba(13,13,21,1) 100%)"
                  } : { background: "#0d0d18" }}
                >
                  {/* Neon top border for popular */}
                  {tier.isPopular && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-500 shadow-[0_0_15px_rgba(124,58,237,0.6)]" />
                  )}

                  {tier.isPopular && (
                    <div className="absolute right-4 top-5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/30">
                      Most Popular
                    </div>
                  )}

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {tier.isPopular ? "Power Player" : idx === 0 ? "Starter" : "Pro Session"}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-white">{tier.name}</h3>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className={`text-5xl font-black ${tier.isPopular ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400" : "text-white"}`}>
                      &#2547;{Number(tier.price).toFixed(0)}
                    </span>
                    <span className="text-sm font-medium uppercase text-gray-500 ml-1">/ {tier.perUnit}</span>
                  </div>

                  <ul className="mt-6 flex-grow space-y-3">
                    {tier.description.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20">
                          <Check size={11} className="text-purple-400" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>

                  <div className={`mt-7 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all cursor-default ${
                    tier.isPopular
                      ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/25"
                      : "border border-white/10 bg-white/5 text-gray-300 hover:border-purple-500/30"
                  }`}>
                    Walk-In Only
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <BlurFade delay={0.4} className="mt-8 text-center">
            <Link to="/pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 transition hover:text-purple-300">
              View Full Pricing Details <ArrowRight size={14} />
            </Link>
          </BlurFade>
        </div>
      </section>

      {/* Glow section divider */}
      <div className="glow-divider" />

      {/* ----------------------------------------------------------
          ABOUT / ELITE PHILOSOPHY  — dark with pink/purple blobs
      ---------------------------------------------------------- */}
      <section id="about" className="relative bg-[#080812] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-pink-500/12 blur-[120px]" />
          <div className="absolute top-0 left-0 h-[400px] w-[400px] rounded-full bg-purple-600/12 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            <Reveal direction="left" distance={40}>
              <div className="relative">
                <div className="relative overflow-hidden rounded-2xl border border-purple-500/15 shadow-2xl shadow-purple-500/10">
                  <motion.img
                    src={sliderImages[1]?.imageUrl || sliderImages[0]?.imageUrl || "/placeholder.jpg"}
                    alt="Elite Gaming Setup"
                    className="w-full aspect-[4/3] object-cover"
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-transparent to-cyan-500/10" />
                </div>
                {/* Decorative corners */}
                <div className="absolute -bottom-5 -right-5 h-28 w-28 rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-500/10 to-transparent -z-10" />
                <div className="absolute -top-5 -left-5 h-20 w-20 rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-transparent -z-10" />
                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -bottom-4 left-6 flex items-center gap-3 rounded-xl border border-purple-500/20 bg-[#0d0d18]/90 px-4 py-3 backdrop-blur-sm shadow-xl"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500">
                    <Gamepad2 size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Gaming Zone</p>
                    <p className="text-xs font-semibold text-white">Premium Experience</p>
                  </div>
                </motion.div>
              </div>
            </Reveal>

            <Reveal direction="right" distance={40}>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <Zap size={14} /> Elite Philosophy
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Built for Gamers,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  by Gamers
                </span>
              </h2>
              <p className="mt-4 text-gray-400 leading-relaxed">
                Founded by competitive gamers. We believe every player deserves
                world-class equipment — no compromises, ever.
              </p>

              <div className="mt-10 space-y-5">
                {[
                  {
                    icon: <Monitor size={20} />,
                    title: "Lag-Free 120Hz Monitors",
                    desc: "Ultra-low response times for pixel-perfect precision.",
                    color: "purple",
                  },
                  {
                    icon: <Headphones size={20} />,
                    title: "3D Spatial Audio",
                    desc: "Crystal-clear surround sound at every station.",
                    color: "cyan",
                  },
                  {
                    icon: <Gamepad2 size={20} />,
                    title: "Elite PS5 / PS4 Pro",
                    desc: "Latest consoles maintained for maximum performance.",
                    color: "pink",
                  },
                ].map((item, i) => (
                  <BlurFade key={item.title} delay={0.2 + i * 0.1}>
                    <div className="flex gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-purple-500/15 hover:bg-white/[0.04]">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        item.color === "purple" ? "bg-purple-500/15 text-purple-400" :
                        item.color === "cyan" ? "bg-cyan-500/15 text-cyan-400" :
                        "bg-pink-500/15 text-pink-400"
                      }`}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <p className="mt-0.5 text-sm text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  </BlurFade>
                ))}
              </div>

              <BlurFade delay={0.55} className="mt-8">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 rounded-xl border border-purple-500/25 bg-purple-500/10 px-6 py-3 text-sm font-semibold text-purple-300 transition hover:border-purple-400/40 hover:bg-purple-500/15"
                >
                  Learn More About Us <ArrowRight size={14} />
                </Link>
              </BlurFade>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Glow section divider */}
      <div className="glow-divider" />

      {/* ----------------------------------------------------------
          STATS  — bright glassmorphism cards on dark bg
      ---------------------------------------------------------- */}
      <section ref={statsRef} className="relative bg-[#070710] py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-60 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-2 gap-4 md:grid-cols-4" staggerDelay={0.1}>
            {[
              { value: 50, suffix: "+", label: "Stations", color: "purple" },
              { value: 100, suffix: "+", label: "Game Titles", color: "cyan" },
              { value: 1, suffix: "Gbps", label: "Fiber Speed", color: "pink" },
              { value: 24, suffix: "/7", label: "Open Hours", color: "purple" },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 15 } }}
                  className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center backdrop-blur-sm"
                >
                  <div className={`absolute inset-x-0 top-0 h-[2px] ${
                    stat.color === "purple" ? "bg-gradient-to-r from-transparent via-purple-500 to-transparent" :
                    stat.color === "cyan" ? "bg-gradient-to-r from-transparent via-cyan-500 to-transparent" :
                    "bg-gradient-to-r from-transparent via-pink-500 to-transparent"
                  }`} />
                  <div className={`text-3xl font-black sm:text-4xl ${
                    stat.color === "purple" ? "text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-purple-500" :
                    stat.color === "cyan" ? "text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-500" :
                    "text-transparent bg-clip-text bg-gradient-to-b from-pink-300 to-pink-500"
                  }`}>
                    {statsInView ? <NumberTicker value={stat.value} suffix={stat.suffix} /> : `0${stat.suffix}`}
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{stat.label}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Glow section divider */}
      <div className="glow-divider" />

      {/* ----------------------------------------------------------
          VISIT US  — map + info cards on deep dark bg
      ---------------------------------------------------------- */}
      <section id="visit" className="relative bg-[#080812] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-purple-500/8 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center justify-center gap-2">
              <MapPin size={14} /> Find Us
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Visit Our Lounge
            </h2>
            <p className="mt-3 text-gray-400 max-w-lg mx-auto">
              Walk in anytime. No appointments needed.
            </p>
          </Reveal>

          <BlurFade delay={0.2}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-purple-500/15 aspect-[4/3] shadow-2xl shadow-purple-500/5">
                {settings?.contact?.googleMapsEmbedUrl ? (
                  <iframe src={settings.contact.googleMapsEmbedUrl} className="h-full w-full border-0" allowFullScreen loading="lazy" title="Location" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#0d0d18] text-gray-600">
                    <MapPin size={48} />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-purple-500/15 bg-[#0d0d18] p-6">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <MapPin size={16} className="text-purple-400" /> Address
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    {settings?.contact?.address || "Visit us at our gaming lounge"}
                  </p>
                </div>
                <div className="rounded-2xl border border-cyan-500/15 bg-[#0d0d18] p-6">
                  <h3 className="font-semibold text-white mb-3">Business Hours</h3>
                  <div className="space-y-2">
                    {[
                      { days: "Sat \u2013 Thu", hours: "10:00 AM \u2013 11:00 PM" },
                      { days: "Friday", hours: "2:00 PM \u2013 11:00 PM" },
                    ].map(({ days, hours }) => (
                      <div key={days} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{days}</span>
                        <span className="font-medium text-white">{hours}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-3 py-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                    <span className="text-xs font-semibold text-cyan-400">Open Now</span>
                  </div>
                </div>
                {settings?.contact?.phone && (
                  <div className="rounded-2xl border border-white/8 bg-[#0d0d18] p-6">
                    <h3 className="font-semibold text-white">Contact</h3>
                    <p className="mt-2 text-sm text-gray-400">{settings.contact.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ----------------------------------------------------------
          BOTTOM CTA BAND  — vivid gradient bar
      ---------------------------------------------------------- */}
      <section className="relative overflow-hidden py-16 bg-[#070710]">
        <div className="absolute inset-0 cyber-grid pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 100% at 50% 50%, rgba(124,58,237,0.18) 0%, transparent 70%)" }} />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <Reveal>
            <h2 className="text-3xl font-black uppercase text-white sm:text-4xl">
              Ready to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400">
                Level Up?
              </span>
            </h2>
            <p className="mt-4 text-gray-400 max-w-md mx-auto">
              Walk in anytime. No appointments. Prepaid sessions from 30 minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton strength={0.12}>
                <Link
                  to="/games"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-purple-500/25 transition-all hover:shadow-purple-500/50 hover:scale-[1.02]"
                >
                  Browse Games <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.12}>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-purple-400/30 hover:bg-purple-500/10"
                >
                  View Pricing
                </Link>
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

    </PublicShell>
  );
}
