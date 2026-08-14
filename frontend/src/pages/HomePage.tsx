import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Headphones,
  MapPin,
  Monitor,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SceneCanvas, AuroraNebula } from "../components/three";
import { useThreeScene } from "../hooks/useThreeScene";
import { getGames, type Game } from "../api/games";
import { getPricingTiers, type PricingTier } from "../api/pricing";
import { getSliderImages, type SliderImage } from "../api/slider";
import {
  BlurFade,
  MagneticButton,
  Reveal,
  StaggerContainer,
  StaggerItem,
} from "../components/motion";
import { PublicShell } from "../components/public/PublicShell";
import { ScrollShowcase } from "../components/public/scrollshowcase";
import { TournamentScrub } from "../components/public/TournamentScrub";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { publicGames, publicPricing } from "../data/publicSite";
import { Tilt } from "react-tilt";
import {
  AnimeAreaEnter,
  AnimeCameraReveal,
  AnimeCounter,
  AnimeGridRipple,
  AnimeMarquee,
  AnimeMorphBlob,
  AnimeMouseCamera,
  AnimeOrbTrail,
  AnimeSVGLineDraw,
  AnimeTextShimmer,
  AnimeTilt3D,
} from "../components/anime";
import { GsapScrambleText, GsapTextSplit } from "../components/gsap";

// Local imagery — used as offline/API-failure fallbacks (never remote-dependent)
import img1 from "../images/1.jpg";
import img2 from "../images/2.jpg";
import img3 from "../images/3.jpg";
import img4 from "../images/4.jpg";

const fallbackSlider: SliderImage[] = [
  { id: "fb-1", title: "RTX Gaming PCs", subtitle: "Maximum FPS. Ultra settings.", imageUrl: img1, linkUrl: null, isActive: true, sortOrder: 1, createdAt: "", updatedAt: "" },
  { id: "fb-2", title: "PS5 & PS4 Pro", subtitle: "4K HDR console gaming.", imageUrl: img2, linkUrl: null, isActive: true, sortOrder: 2, createdAt: "", updatedAt: "" },
  { id: "fb-3", title: "Racing Simulators", subtitle: "Realistic force-feedback wheels.", imageUrl: img3, linkUrl: null, isActive: true, sortOrder: 3, createdAt: "", updatedAt: "" },
  { id: "fb-4", title: "Tournaments & Events", subtitle: "Cash prizes. Legendary bragging rights.", imageUrl: img4, linkUrl: null, isActive: true, sortOrder: 4, createdAt: "", updatedAt: "" },
];

const fallbackGames: Game[] = publicGames.slice(0, 4).map((g, i) => ({
  id: `fb-game-${i}`,
  title: g.title,
  platform: g.platform,
  genre: g.genre,
  imageUrl: [img1, img2, img3, img4][i] ?? null,
  isActive: true,
  sortOrder: i,
  createdAt: "",
  updatedAt: "",
}));

const fallbackTiers: PricingTier[] = publicPricing.map((p, i) => ({
  id: `fb-tier-${i}`,
  name: p.name,
  price: p.price.replace(/[^\d]/g, ""),
  perUnit: p.perUnit,
  description: p.points,
  isPopular: p.highlight,
  isActive: true,
  sortOrder: i,
  createdAt: "",
  updatedAt: "",
}));

// Re-usable component for section containers to apply scroll-reveal animations
const AnimatedSection = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => (
  <Reveal distance={40} className={className}>
    <div id={id}>{children}</div>
  </Reveal>
);

const SectionEyebrow = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gz-purple">
    <span className="h-px w-6 bg-gradient-to-r from-gz-purple to-transparent" />
    {children}
  </span>
);

const heroStats = [
  { value: "50+", label: "Stations" },
  { value: "100+", label: "Titles" },
  { value: "1Gbps", label: "Fiber" },
];

const nowPlaying = [
  ...publicGames.map((g) => ({ title: g.title, platform: g.platform })),
  { title: "Cyberpunk 2077", platform: "PC" },
  { title: "FC 26", platform: "PS5" },
  { title: "Mortal Kombat 11", platform: "PS4" },
  { title: "RDR2", platform: "PC" },
  { title: "FIFA 24", platform: "PS5" },
  { title: "Valorant", platform: "PC" },
  { title: "GTA V", platform: "PC" },
];

export default function HomePage() {
  const [games, setGames] = useState<Game[]>(fallbackGames);
  const [tiers, setTiers] = useState<PricingTier[]>(fallbackTiers);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>(fallbackSlider);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { settings } = useSiteSettings();
  const { shouldRender: render3d, isMobile } = useThreeScene();

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroScroll, [0, 1], [0, 150]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

  // About collage — images swing open in 3D as the section enters view
  const aboutRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: aboutScroll } = useScroll({
    target: aboutRef,
    offset: ["start end", "center center"],
  });
  const aboutRotY1 = useTransform(aboutScroll, [0, 1], [26, 0]);
  const aboutRotY2 = useTransform(aboutScroll, [0, 1], [-26, 0]);

  useEffect(() => {
    getGames()
      .then((d) => setGames(d.slice(0, 4))) // Fetch 4 for bento grid
      .catch(() => setGames(fallbackGames));
    getPricingTiers()
      .then(setTiers)
      .catch(() => setTiers(fallbackTiers));
    getSliderImages()
      .then((d) => setSliderImages(d))
      .catch(() => setSliderImages(fallbackSlider));
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

  const whatsappHref = settings?.contact?.whatsapp
    ? `https://wa.me/${settings.contact.whatsapp.replace(/[^0-9]/g, "")}`
    : null;

  return (
    <PublicShell>
      {/* ----------------------------------------------------------
          HERO - esports aesthetic
      ---------------------------------------------------------- */}
      <section ref={heroRef} id="hero" className="relative h-[100vh] min-h-[720px] overflow-hidden bg-gz-bg">
        {/* Ambient neon glows — deep space base */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.14),transparent_65%)]" />
        <div className="absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full bg-gz-purple/15 blur-[160px]" />
        <div className="absolute -right-32 bottom-1/4 h-[440px] w-[440px] rounded-full bg-gz-pink/10 blur-[140px]" />
        <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-orange-500/8 blur-[120px]" />

        {/* Cursor light trail (video-like) - desktop only */}
        <AnimeOrbTrail count={2} className="hidden md:block" />

        {/* 3D Deep Space Particle Field — primary hero visual */}
        {render3d && (
          <SceneCanvas aria-label="Interactive aurora nebula background" className="z-10">
            <AuroraNebula />
          </SceneCanvas>
        )}

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-20 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left: headline content */}
              <div className="order-2 lg:order-1">
                <BlurFade delay={0.1}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gz-purple/30 bg-gz-purple/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-gz-purple shadow-[0_0_8px_rgba(124,58,237,0.9)]" />
                    Level up your game
                  </span>
                </BlurFade>

                <BlurFade delay={0.2}>
                  <h1 className="mt-6 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tighter text-white sm:text-6xl lg:text-7xl">
                    The Ultimate{" "}
                    <AnimeTextShimmer className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
                      Gaming
                    </AnimeTextShimmer>{" "}
                    Experience.
                  </h1>
                </BlurFade>

                <GsapTextSplit
                  className="mt-6 max-w-lg"
                  innerClassName="text-base leading-relaxed text-gray-400 sm:text-lg"
                >
                  Premium gaming lounge featuring the latest titles. Zero latency, high-refresh rates, and professional-grade comfort.
                </GsapTextSplit>

                <BlurFade delay={0.5}>
                  <div className="mt-10 flex flex-wrap items-center gap-4">
                    <MagneticButton strength={0.18}>
                      <Link
                        to="/about"
                        className="group relative inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-gz-purple/20 transition-all duration-300 active:scale-95 hover:shadow-[0_0_30px_8px_rgba(124,58,237,0.35)]"
                      >
                        Contact Us Today
                        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </MagneticButton>
                    <MagneticButton strength={0.14}>
                      <Link
                        to="/games"
                        className="group relative inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 active:scale-95 hover:border-gz-purple hover:bg-gz-purple/10"
                      >
                        Explore Games
                      </Link>
                    </MagneticButton>
                  </div>
                </BlurFade>

                {/* Trust stat chips */}
                <BlurFade delay={0.62}>
                  <div className="mt-10 flex flex-wrap items-center gap-3">
                    {heroStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-sm"
                      >
                        <span className="font-display text-sm font-bold text-white">
                          <AnimeCounter to={parseInt(stat.value, 10)} suffix={stat.value.replace(/^\d+/, "")} />
                        </span>
                        <span className="text-xs text-gray-400">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </BlurFade>
              </div>

              {/* Right: featured game card (slider) with 3D tilt */}
              <div className="order-1 flex justify-center lg:order-2">
                <div className="relative w-full max-w-md">
                  <Tilt
                    options={isMobile ? { max: 0, scale: 1, speed: 300 } : { max: 9, scale: 1.02, speed: 600 }}
                    className="relative [transform-style:preserve-3d]"
                  >
                    {/* Neon frame glow */}
                    <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-gz-purple/30 via-transparent to-gz-pink/20 blur-xl" />
                    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-gz-surface/40 shadow-2xl backdrop-blur-sm">
                    <div className="relative aspect-[4/5]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentSlide}
                          initial={{ opacity: 0, scale: 1.06 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute inset-0"
                        >
                          <img
                            src={sliderImages[currentSlide]?.imageUrl || img1}
                            alt={sliderImages[currentSlide]?.title || "Featured game"}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <span className="inline-block rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/80 backdrop-blur-sm">
                              Featured Game
                            </span>
                            <h3 className="mt-3 font-display text-2xl font-bold text-white">
                              {sliderImages[currentSlide]?.title || "Gaming Lounge"}
                            </h3>
                            <p className="mt-1 text-sm text-white/70">
                              {sliderImages[currentSlide]?.subtitle || "Step into the arena"}
                            </p>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                  </Tilt>

                  {/* Slide indicators */}
                  {sliderImages.length > 1 && (
                    <div className="mt-5 flex items-center justify-center gap-2">
                      {sliderImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          aria-label={"Go to slide " + (i + 1)}
                          className={"h-1.5 rounded-full transition-all duration-300 " + (i === currentSlide ? "w-8 bg-gz-purple shadow-[0_0_10px_rgba(124,58,237,0.6)]" : "w-3 bg-white/20 hover:bg-white/40")}
                        />
                      ))}
                      <div className="ml-3 flex items-center gap-2">
                        <button
                          onClick={prevSlide}
                          aria-label="Previous slide"
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-sm transition hover:border-gz-purple/50 hover:text-white"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={nextSlide}
                          aria-label="Next slide"
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-sm transition hover:border-gz-purple/50 hover:text-white"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1 text-white/40"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Scroll</span>
            <ChevronDown size={16} />
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gz-bg to-transparent z-20" />
      </section>

      {/* ----------------------------------------------------------
          NOW PLAYING - video-style LED ticker
      ---------------------------------------------------------- */}
      <section className="relative overflow-hidden border-y border-white/5 bg-gz-surface/70 py-5">
        <AnimeGridRipple rows={4} cols={22} color="#EC4899" className="absolute inset-0" />
        <div className="relative z-10 mx-auto flex max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
          <span className="hidden shrink-0 items-center gap-2 rounded-md border border-gz-pink/30 bg-gz-pink/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-gz-pink sm:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gz-pink shadow-[0_0_8px_rgba(236,72,153,0.9)]" />
            Now Playing
          </span>
          <AnimeMarquee className="flex-1" duration={26000}>
            {nowPlaying.map((g, i) => (
              <span key={i} className="flex items-center gap-7 text-sm font-semibold uppercase tracking-widest text-white/45">
                <span>{g.title}</span>
                <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-gz-cyan/80">
                  {g.platform}
                </span>
                <span className="h-1.5 w-1.5 rotate-45 bg-gradient-to-br from-gz-purple to-gz-pink" />
              </span>
            ))}
          </AnimeMarquee>
        </div>
      </section>

      {/* ----------------------------------------------------------
          SCROLL SHOWCASE - Noomo-style 3D "video scrub" stage
          (scroll opens the doors, scroll up closes them)
      ---------------------------------------------------------- */}
      <ScrollShowcase />

      <AnimatedSection className="bg-gz-bg py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <SectionEyebrow>The Arena</SectionEyebrow>
            <GsapScrambleText
              tag="h2"
              className="mt-3 font-display text-4xl font-bold tracking-tighter text-white sm:text-5xl"
              scrambleDuration={1.4}
              stagger={0.04}
            >
              Featured Games
            </GsapScrambleText>
            <AnimeSVGLineDraw d="M0 6 C 80 0, 160 12, 240 4" className="mt-3 h-2.5 w-56" strokeWidth={4} />
            <p className="mt-4 text-lg text-gray-400">
              The latest blockbusters, optimized for peak performance on our elite hardware.
            </p>
          </div>

          <AnimeCameraReveal range={50} zoomFrom={0.96} className="mt-12">
          <div className="grid grid-cols-2 gap-4 md:h-[560px] md:grid-cols-4 md:grid-rows-2 md:gap-6 [perspective:1400px]">
            {games.map((game, idx) => {
              const isPS5 = game.platform === "PS5";
              const area = idx === 0
                ? "col-span-2 row-span-2 aspect-[4/3] md:aspect-auto"
                : idx === 1
                  ? "col-span-2 row-span-1 aspect-[16/9] md:aspect-auto"
                  : "col-span-1 row-span-1 aspect-[4/3] md:aspect-auto";
              if (idx > 3) return null; // Only show 4 games in the bento
              return (
                <motion.div
                  key={game.id}
                  className={`group relative overflow-hidden rounded-[16px] border border-gz-surface transition-transform duration-300 ${area} [transform-style:preserve-3d]`}
                  style={{
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2), 0 0 0 1px rgba(18,22,31,1)',
                  }}
                  whileHover={{
                    rotateX: 5,
                    rotateY: -4,
                    scale: 1.02,
                    y: -6,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3), 0 0 0 1px rgba(124,58,237,0.8)',
                  }}
                >
                  <img
                    src={game.imageUrl || img1}
                    alt={game.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <span
                      className={`w-fit rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isPS5 ? "bg-white text-black" : "bg-gz-purple text-white"}`}
                    >
                      {game.platform}
                    </span>
                    <h3 className="mt-2 text-xl font-display font-bold text-white">{game.title}</h3>
                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                      {game.genre || "Experience the next generation of gaming."}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
          </AnimeCameraReveal>
          <div className="mt-12 text-center">
            <Link to="/games" className="group inline-flex items-center gap-2 text-sm font-bold text-gz-purple transition-all duration-300 hover:text-white active:scale-95">
              View All Games <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* ----------------------------------------------------------
          PRICING
      ---------------------------------------------------------- */}
      <AnimatedSection className="bg-gz-surface py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gz-purple">
              <Zap size={13} />
              Hourly Rates
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tighter text-white sm:text-5xl">
              Competitive Rates
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Elite performance doesn't have to break the bank. Choose the plan that fits your grind.
            </p>
          </div>
          <AnimeMouseCamera className="mt-16" maxRotate={4} maxTranslate={10}>
          <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto [perspective:1200px]" staggerDelay={0.1}>
            {tiers.map((tier) => (
              <StaggerItem key={tier.id}>
                <motion.div
                  className={`relative flex flex-col overflow-hidden rounded-[16px] bg-gz-bg border transition-colors duration-300 [transform-style:preserve-3d] ${
                    tier.isPopular
                      ? "border-gz-purple"
                      : "border-gz-surface hover:border-gz-purple/50"
                  }`}
                  style={tier.isPopular ? {
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3), 0 0 0 1px #7C3AED',
                  } : {
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2), 0 0 0 1px rgba(18,22,31,1)',
                  }}
                  whileHover={{
                    rotateX: 4,
                    rotateY: -3,
                    y: -8,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3), 0 0 0 1px #7C3AED',
                  }}
                >
                  {tier.isPopular && (
                    <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-gz-purple/25">
                      Popular
                    </div>
                  )}

                  <div className="p-8 flex-grow flex flex-col">
                    <h3 className="text-lg font-display font-bold text-white">{tier.name}</h3>

                    <div className="mt-4 flex items-baseline gap-2">
                      <span className={`text-5xl font-display font-bold ${tier.isPopular ? "bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent" : "text-white"}`}>
                        &#2547;{Number(tier.price).toFixed(0)}
                      </span>
                      <span className="text-sm font-medium text-gray-400">/ {tier.perUnit}</span>
                    </div>

                    <ul className="mt-6 flex-grow space-y-3">
                      {tier.description.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                          <Check size={16} className="mt-0.5 shrink-0 text-gz-purple" />
                          {point}
                        </li>
                      ))}
                    </ul>

                    <a
                      href={whatsappHref || "/about"}
                      {...(whatsappHref ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={`mt-8 flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-bold transition-all duration-300 active:scale-95 ${
                        tier.isPopular
                          ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-gz-purple/20 hover:brightness-110"
                          : "border border-white/10 bg-white/5 text-white hover:border-gz-purple/50 hover:bg-gz-purple/10"
                      }`}
                    >
                      {whatsappHref ? "Book on WhatsApp" : "Walk-In Only"}
                    </a>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          </AnimeMouseCamera>
        </div>
      </AnimatedSection>

      {/* ----------------------------------------------------------
          ABOUT / PHILOSOPHY
      ---------------------------------------------------------- */}
      <AnimatedSection className="bg-gz-bg py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="lg:pr-8">
              <SectionEyebrow>Our Story</SectionEyebrow>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tighter text-white sm:text-5xl">
                Built for Gamers, by <span className="text-gz-purple">Gamers</span>
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                Founded by competitive gamers, we believe every player deserves world-class equipment — no compromises, ever.
              </p>

              <AnimeAreaEnter direction="up" className="mt-10 space-y-6" staggerMs={90}>
                {[
                  { icon: <Monitor size={22} />, title: "Lag-Free 120Hz Monitors", desc: "Ultra-low response times for pixel-perfect precision." },
                  { icon: <Headphones size={22} />, title: "3D Spatial Audio", desc: "Crystal-clear surround sound at every station." },
                  { icon: <Gamepad2 size={22} />, title: "Elite PS5 / PS4 Pro", desc: "Latest consoles maintained for maximum performance." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/15 to-cyan-500/10 border border-white/5">
                      <span className="text-gz-purple">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{item.title}</h4>
                      <p className="mt-1 text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </AnimeAreaEnter>
            </div>

            <div ref={aboutRef} className="relative h-[500px] [perspective:1000px]">
              <motion.div
                className="group absolute top-0 left-1/4 w-3/4 h-3/4 overflow-hidden rounded-[16px] border border-gz-surface [transform-style:preserve-3d]"
                style={{ rotateY: aboutRotY1, boxShadow: '0 4px 10px rgba(0,0,0,0.2), 0 0 0 1px rgba(18,22,31,1)' }}
                whileHover={{ scale: 1.04, boxShadow: '0 10px 25px rgba(0,0,0,0.3), 0 0 0 1px rgba(124,58,237,0.8)' }}
              >
                <img src={sliderImages[1]?.imageUrl || img2} alt="Setup" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </motion.div>
              <motion.div
                className="group absolute bottom-0 right-1/4 w-2/3 h-2/3 overflow-hidden rounded-[16px] border border-gz-surface [transform-style:preserve-3d] z-10"
                style={{ rotateY: aboutRotY2, boxShadow: '0 4px 10px rgba(0,0,0,0.2), 0 0 0 1px rgba(18,22,31,1)' }}
                whileHover={{ scale: 1.04, boxShadow: '0 10px 25px rgba(0,0,0,0.3), 0 0 0 1px rgba(124,58,237,0.8)' }}
              >
                <img src={sliderImages[2]?.imageUrl || img3} alt="Setup" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </motion.div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Scroll-driven tournament moment */}
      <TournamentScrub />

      {/* ----------------------------------------------------------
          VISIT US
      ---------------------------------------------------------- */}
      <AnimatedSection id="visit" className="bg-gz-surface py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gz-purple">
              <MapPin size={13} />
              Location
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tighter text-white sm:text-5xl">
              Visit Our Lounge
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Walk in anytime. No appointments needed. We're ready when you are.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 [perspective:1200px]">
            <motion.div
              className="overflow-hidden rounded-[16px] aspect-[4/3] border border-gz-surface"
              style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.2), 0 0 0 1px rgba(18,22,31,1)' }}
              whileHover={{ rotateX: 2, rotateY: -2, scale: 1.01 }}
            >
              {settings?.contact?.googleMapsEmbedUrl ? (
                <iframe src={settings.contact.googleMapsEmbedUrl} className="h-full w-full border-0 rounded-[16px]" allowFullScreen loading="lazy" title="Location" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gz-bg text-gray-500">
                  <MapPin size={48} />
                </div>
              )}
            </motion.div>

            <AnimeAreaEnter direction="up" className="space-y-6" staggerMs={80}>
              <div className="rounded-[16px] border border-gz-surface bg-gz-bg p-6">
                <h3 className="font-bold text-white flex items-center gap-3">
                  <MapPin size={18} className="text-gz-purple" /> Address
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  {settings?.contact?.address || "Visit us at our gaming lounge"}
                </p>
              </div>
              <div className="rounded-[16px] border border-gz-surface bg-gz-bg p-6">
                <h3 className="font-bold text-white mb-4">Business Hours</h3>
                <div className="space-y-3">
                  {[
                    { days: "Sat – Thu", hours: "10:00 AM – 11:00 PM" },
                    { days: "Friday", hours: "2:00 PM – 11:00 PM" },
                  ].map(({ days, hours }) => (
                    <div key={days} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{days}</span>
                      <span className="font-medium text-white">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimeAreaEnter>
          </div>
        </div>
      </AnimatedSection>

      {/* ----------------------------------------------------------
          BOTTOM CTA
      ---------------------------------------------------------- */}
      <AnimatedSection className="bg-gz-bg py-24 sm:py-32">
        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <AnimeTilt3D max={5} scale={1.008} className="rounded-[24px]">
            <div className="relative overflow-hidden rounded-[24px] border border-white/5 bg-gradient-to-br from-gz-surface via-gz-bg to-gz-surface p-12 sm:p-16">
              <AnimeMorphBlob className="absolute -right-20 -top-28 h-80 w-80 opacity-25 blur-3xl" />
            <div className="absolute -top-20 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-gz-purple/20 blur-[100px]" />
            <div className="relative">
              <h2 className="font-display text-4xl font-bold tracking-tighter text-white sm:text-5xl">
                Ready to <AnimeTextShimmer className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">Level Up?</AnimeTextShimmer>
              </h2>
              <p className="mt-4 mx-auto max-w-md text-lg text-gray-400">
                Walk in anytime. No appointments. Prepaid sessions from 30 minutes.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <MagneticButton strength={0.16}>
                  <Link
                    to="/games"
                    className="group relative inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-gz-purple/20 transition-all duration-300 active:scale-95 hover:shadow-[0_0_30px_8px_rgba(124,58,237,0.35)]"
                  >
                    Browse Games <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </MagneticButton>
                <MagneticButton strength={0.12}>
                  <Link
                    to="/pricing"
                    className="group relative inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition-all duration-300 active:scale-95 hover:border-gz-purple hover:bg-gz-purple/10"
                  >
                    View Pricing
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </div>
          </AnimeTilt3D>
        </div>
      </AnimatedSection>

    </PublicShell>
  );
}
