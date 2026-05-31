import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Headphones,
  MapPin,
  Monitor,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { getGames, type Game } from "../api/games";
import { getPricingTiers, type PricingTier } from "../api/pricing";
import { getSliderImages, type SliderImage } from "../api/slider";
import { PublicShell } from "../components/public/PublicShell";
import { useSiteSettings } from "../context/SiteSettingsContext";

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { settings } = useSiteSettings();

  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  useEffect(() => {
    getGames().then((d) => setGames(d.slice(0, 2)));
    getPricingTiers().then(setTiers);
    getSliderImages().then(setSliderImages);
  }, []);

  useEffect(() => {
    if (sliderImages.length < 2) return;
    const t = setInterval(
      () => setCurrentSlide((c) => (c + 1) % sliderImages.length),
      5000,
    );
    return () => clearInterval(t);
  }, [sliderImages.length]);

  const prevSlide = useCallback(
    () =>
      setCurrentSlide(
        (c) => (c - 1 + sliderImages.length) % sliderImages.length,
      ),
    [sliderImages.length],
  );
  const nextSlide = useCallback(
    () => setCurrentSlide((c) => (c + 1) % sliderImages.length),
    [sliderImages.length],
  );

  return (
    <PublicShell>
      {/* HERO */}
      <section
        id="hero"
        className="relative h-[100vh] min-h-[600px] overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {sliderImages.length > 0 && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img
                src={sliderImages[currentSlide]?.imageUrl}
                alt={
                  sliderImages[currentSlide]?.title || "Elite Lounge Interior"
                }
                className="h-full w-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e14] via-[#0a0e14]/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14] via-transparent to-transparent z-10" />

        <div className="relative z-20 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              className="max-w-2xl"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-400">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                Level up your game
              </span>

              <h1 className="mt-6 text-4xl font-black uppercase leading-[1.1] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                The Ultimate{" "}
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  PS5 & PS4 Pro
                </span>{" "}
                Experience.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-gray-400 sm:text-lg">
                Premium gaming lounge featuring the latest titles. Experience
                zero latency, high-refresh rates, and professional-grade
                comfort.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95"
                >
                  Contact Us Today
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  to="/games"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-orange-500/30 hover:bg-white/10"
                >
                  Explore Games
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {sliderImages.length > 1 && (
          <div className="absolute bottom-8 right-8 z-30 flex items-center gap-3">
            <button
              onClick={prevSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:border-orange-500/50 hover:bg-black/60"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {sliderImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentSlide
                      ? "w-6 bg-orange-500"
                      : "w-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:border-orange-500/50 hover:bg-black/60"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>

      {/* FEATURED GAMES */}
      <section
        id="games"
        className="relative bg-[#0a0e14] py-20 lg:py-28 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-orange-500/3 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Featured Games
              </h2>
              <p className="mt-2 text-gray-400">
                The latest blockbusters, optimized for peak performance.
              </p>
            </motion.div>
            <div className="flex items-center gap-4">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Refresh: 120Hz
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Resolution: 4K
              </span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {games.map((game, idx) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/5"
              >
                <img
                  src={game.imageUrl || "/placeholder-game.jpg"}
                  alt={game.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                  <div className="flex gap-2 mb-3">
                    <span
                      className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        game.platform === "PS5"
                          ? "bg-white text-black"
                          : "bg-orange-500 text-white"
                      }`}
                    >
                      {game.platform}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {game.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-300 line-clamp-2">
                    {game.genre || "Experience the next generation of gaming."}
                  </p>
                  <Link
                    to="/games"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-400 transition-all group-hover:text-orange-300 group-hover:translate-x-1"
                  >
                    View Stations
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <Link
              to="/games"
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange-400 transition hover:text-orange-300"
            >
              View All Games
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="relative bg-[#070b10] py-20 lg:py-28 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-orange-500/3 blur-[130px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Competitive Rates
            </h2>
            <p className="mt-3 text-gray-400 max-w-lg mx-auto">
              Elite performance doesn't have to break the bank. Choose the plan
              that fits your grind.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier, idx) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className={`relative flex flex-col overflow-hidden rounded-2xl border p-7 transition-all ${
                  tier.isPopular
                    ? "border-orange-500/40 bg-gradient-to-b from-orange-500/8 to-[#0d1117] shadow-2xl shadow-orange-500/10"
                    : "border-white/8 bg-[#0d1117] hover:border-white/15"
                }`}
              >
                {tier.isPopular && (
                  <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Most Popular
                  </div>
                )}

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {tier.isPopular
                    ? "Power Player"
                    : idx === 0
                      ? "Trial"
                      : "Pro Session"}
                </p>
                <h3 className="mt-1 text-xl font-bold text-white">
                  {tier.name}
                </h3>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    &#2547;{Number(tier.price).toFixed(0)}
                  </span>
                  <span className="text-sm font-medium uppercase text-gray-500">
                    / {tier.perUnit}
                  </span>
                </div>

                <ul className="mt-6 flex-grow space-y-3">
                  {tier.description.map((point, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-gray-300"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/15">
                        <Check size={11} className="text-orange-400" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>

                <div
                  className={`mt-7 block w-full rounded-xl py-3 text-center text-sm font-bold transition-all ${
                    tier.isPopular
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20"
                      : "border border-white/10 bg-white/5 text-white hover:border-orange-500/30"
                  }`}
                >
                  Walk-In Only
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange-400 transition hover:text-orange-300"
            >
              View Full Pricing Details
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ABOUT / ELITE PHILOSOPHY */}
      <section
        id="about"
        className="relative bg-[#0a0e14] py-20 lg:py-28 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/3 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/5">
                <img
                  src={
                    sliderImages[1]?.imageUrl ||
                    sliderImages[0]?.imageUrl ||
                    "/placeholder.jpg"
                  }
                  alt="Elite Gaming Setup"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl border border-orange-500/20 bg-orange-500/5 -z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Elite Philosophy
              </h2>
              <p className="mt-4 text-gray-400 leading-relaxed">
                Founded by competitive gamers for gamers. We believe every
                player deserves access to world-class equipment without
                compromise.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  {
                    icon: <Monitor size={20} />,
                    title: "Lag-Free Monitors",
                    desc: "Ultra-low response times and 120Hz refresh rates for pixel-perfect precision.",
                  },
                  {
                    icon: <Headphones size={20} />,
                    title: "Premium Headsets",
                    desc: "Crystal clear 3D spatial audio to hear every footstep and cinematic explosion.",
                  },
                  {
                    icon: <Gamepad2 size={20} />,
                    title: "Elite PS5/PS4 Pro Hardware",
                    desc: "Exclusive high-performance consoles maintained for maximum stability and speed.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="mt-1 text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="bg-[#070b10] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { value: 50, suffix: "+", label: "Stations" },
              { value: 100, suffix: "+", label: "Titles" },
              { value: 1, suffix: "Gbps", label: "Fiber" },
              { value: 24, suffix: "/7", label: "Elite Support" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-white/5 bg-[#0d1117] p-6 text-center"
              >
                <div className="text-3xl font-black text-orange-500 sm:text-4xl">
                  {statsInView ? (
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      suffix={stat.suffix}
                    />
                  ) : (
                    `0${stat.suffix}`
                  )}
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VISIT US */}
      <section
        id="visit"
        className="relative bg-[#0a0e14] py-20 lg:py-28 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 h-[300px] w-[300px] rounded-full bg-orange-500/3 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Visit Us
            </h2>
            <p className="mt-3 text-gray-400 max-w-lg mx-auto">
              Located in the heart of the city. Walk in anytime during our
              operating hours.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 grid gap-6 md:grid-cols-2"
          >
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0d1117] aspect-[4/3]">
              {settings?.contact?.googleMapsEmbedUrl ? (
                <iframe
                  src={settings.contact.googleMapsEmbedUrl}
                  className="h-full w-full border-0"
                  allowFullScreen
                  loading="lazy"
                  title="Location"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-600">
                  <MapPin size={48} />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-6">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <MapPin size={16} className="text-orange-500" />
                  Address
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  {settings?.contact?.address ||
                    "Visit us at our gaming lounge"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-6">
                <h3 className="font-semibold text-white">Hours</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Sat - Thu</span>
                    <span className="text-white">10:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Friday</span>
                    <span className="text-white">2:00 PM - 11:00 PM</span>
                  </div>
                </div>
              </div>
              {settings?.contact?.phone && (
                <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-6">
                  <h3 className="font-semibold text-white">Contact</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    {settings.contact.phone}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </PublicShell>
  );
}
