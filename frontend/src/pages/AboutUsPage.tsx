import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Gamepad2,
  Headphones,
  MapPin,
  Monitor,
  Shield,
  Star,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  BlurFade,
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
} from "../components/motion/effects";
import { SceneCanvas, AboutConstellation } from "../components/three";
import { useThreeScene } from "../hooks/useThreeScene";
import { AnimeAreaEnter, AnimeCameraReveal, AnimeHeroExit } from "../components/anime";
import { GsapScrambleText, GsapTextSplit } from "../components/gsap";
import { NowPlayingBar } from "../components/public/NowPlayingBar";
import { PublicShell } from "../components/public/PublicShell";
import { useSiteSettings } from "../context/SiteSettingsContext";
import img2 from "../images/2.jpg";
import img3 from "../images/3.jpg";

export default function AboutUsPage() {
  const { settings } = useSiteSettings();
  const contact = settings?.contact;

  const { shouldRender: render3d } = useThreeScene();
  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  // Hero background parallax (3D depth on scroll)
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroBgY = useTransform(heroScroll, [0, 1], [0, 90]);

  return (
    <PublicShell>
      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden bg-[#0A0A0A] py-28 lg:py-36">
        {/* 3D Constellation Background */}
        {render3d && (
          <SceneCanvas aria-label="3D constellation network scene" className="z-10" bloomIntensity={0.7} bloomThreshold={0.6}>
            <AboutConstellation />
            <ambientLight intensity={0.04} />
          </SceneCanvas>
        )}
        {/* Background image */}
        <div className="absolute inset-0">
          <motion.img
            style={{ y: heroBgY }}
            src={img2}
            alt=""
            className="h-full w-full scale-110 object-cover object-center"
          />
        </div>
        {/* Dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#0A0A0A]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />
        {/* Colour blobs */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 30%, rgba(124,58,237,0.2) 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 80% 80%, rgba(236,72,153,0.15) 0%, transparent 60%)",
          }}
        />
        <FloatingParticles count={15} className="opacity-40" />

        <AnimeHeroExit className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <BlurFade delay={0.1}>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400">
                <Star size={14} />
                Our Story
              </span>
            </BlurFade>
            <BlurFade delay={0.2}>
              <h1 className="mt-3 font-display text-4xl font-black uppercase text-white sm:text-5xl lg:text-6xl">
                About{" "}
                <SparklesText
                  sparkleCount={6}
                  colors={["#7c3aed", "#06b6d4", "#ec4899", "#ffffff"]}
                  className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent"
                >
                  Us
                </SparklesText>
              </h1>
            </BlurFade>
            <GsapTextSplit
              className="mx-auto mt-4 max-w-xl"
              innerClassName="text-base text-gray-400 leading-relaxed"
            >
              Founded by competitive gamers for gamers. We believe every player deserves access to world-class equipment without compromise.
            </GsapTextSplit>
          </div>
        </AnimeHeroExit>
      </section>

      <NowPlayingBar />

      {/* Elite Philosophy */}
      <section className="relative bg-[#080810] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-pink-500/5 blur-[120px]" />
        </div>
        <GlowingOrb className="top-1/4 -left-20" color="purple" size={250} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <Reveal direction="left" distance={40}>
              <div className="relative [perspective:1000px]">
                <div className="relative overflow-hidden rounded-2xl border border-purple-500/10">
                  <motion.img
                    src={img3}
                    alt="Elite Gaming Setup"
                    className="w-full aspect-[4/3] object-cover"
                    whileHover={{ scale: 1.04, rotateY: -3, rotateX: 2 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/15 to-transparent" />
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.4,
                    type: "spring",
                    stiffness: 150,
                    damping: 15,
                  }}
                  className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl border border-purple-500/20 bg-purple-500/5 -z-10"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.5,
                    type: "spring",
                    stiffness: 150,
                    damping: 15,
                  }}
                  className="absolute -top-4 -left-4 h-16 w-16 rounded-xl border border-cyan-500/20 bg-cyan-500/5 -z-10"
                />
              </div>
            </Reveal>

            <Reveal direction="right" distance={40}>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
                <Zap size={14} />
                Elite Philosophy
              </span>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                Built for Gamers,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  by Gamers
                </span>
              </h2>
              <p className="mt-4 text-gray-400 leading-relaxed">
                We started as a group of friends who wanted a place to game
                competitively without compromise. Today, we provide that space
                for the entire community - with professional-grade hardware,
                pristine conditions, and a culture that respects every player's
                grind.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  {
                    icon: <Monitor size={20} />,
                    title: "Lag-Free Monitors",
                    desc: "Ultra-low response times and 120Hz refresh rates for pixel-perfect precision.",
                    color: "purple",
                  },
                  {
                    icon: <Headphones size={20} />,
                    title: "Premium Headsets",
                    desc: "Crystal clear 3D spatial audio to hear every footstep and cinematic explosion.",
                    color: "cyan",
                  },
                  {
                    icon: <Gamepad2 size={20} />,
                    title: "Elite PS5/PS4 Pro Hardware",
                    desc: "Exclusive high-performance consoles maintained for maximum stability and speed.",
                    color: "pink",
                  },
                ].map((item, i) => (
                  <BlurFade key={item.title} delay={0.2 + i * 0.1}>
                    <div className="flex gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          item.color === "purple"
                            ? "bg-purple-500/10 text-purple-400"
                            : item.color === "cyan"
                              ? "bg-cyan-500/10 text-cyan-400"
                              : "bg-pink-500/10 text-pink-400"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-sm text-gray-400">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </BlurFade>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="bg-[#0A0A0A] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StaggerContainer
            className="grid grid-cols-2 gap-4 md:grid-cols-4 [perspective:1000px]"
            staggerDelay={0.1}
          >
            {[
              { value: 50, suffix: "+", label: "Stations" },
              { value: 100, suffix: "+", label: "Titles" },
              { value: 1, suffix: "Gbps", label: "Fiber" },
              { value: 24, suffix: "/7", label: "Elite Support" },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    rotateX: 3,
                    rotateY: -3,
                    transition: { type: "spring", stiffness: 300, damping: 15 },
                  }}
                  className="rounded-2xl border border-purple-500/10 bg-[#0d0d15] p-6 text-center [transform-style:preserve-3d]"
                >
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 sm:text-4xl">
                    {statsInView ? (
                      <NumberTicker value={stat.value} suffix={stat.suffix} />
                    ) : (
                      `0${stat.suffix}`
                    )}
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {stat.label}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* What We Offer */}
      <section className="relative bg-[#080810] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400">
              <Shield size={14} />
              What We Offer
            </span>
            <GsapScrambleText
              tag="h2"
              className="mt-3 font-display text-3xl font-bold text-white"
              scrambleDuration={1.3}
              stagger={0.04}
            >
              The Elite Experience
            </GsapScrambleText>
            <p className="mt-3 text-gray-400 max-w-lg mx-auto">
              Everything you need for the ultimate gaming session, all under one
              roof.
            </p>
          </Reveal>

          <LineDraw className="mt-8 mb-12" />

          <StaggerContainer
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 [perspective:1000px]"
            staggerDelay={0.08}
          >
            {[
              {
                icon: <Monitor size={20} />,
                title: "4K Displays",
                desc: "High-refresh rate monitors with ultra-low response times.",
                color: "purple",
              },
              {
                icon: <Gamepad2 size={20} />,
                title: "PS5 & PS4 Pro",
                desc: "Latest consoles with all major titles available.",
                color: "cyan",
              },
              {
                icon: <Headphones size={20} />,
                title: "Premium Audio",
                desc: "3D spatial audio headsets at every station.",
                color: "pink",
              },
              {
                icon: <Wifi size={20} />,
                title: "1Gbps Fiber",
                desc: "Ultra-fast internet for lag-free online multiplayer.",
                color: "cyan",
              },
              {
                icon: <Users size={20} />,
                title: "Community Events",
                desc: "Regular tournaments and gaming nights.",
                color: "purple",
              },
              {
                icon: <Zap size={20} />,
                title: "Refreshments",
                desc: "Cold drinks and snacks available during your session.",
                color: "pink",
              },
            ].map(({ icon, title, desc, color }) => (
              <StaggerItem key={title}>
                <SpotlightCard className="p-6 group">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                      color === "purple"
                        ? "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20"
                        : color === "cyan"
                          ? "bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20"
                          : "bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20"
                    }`}
                  >
                    {icon}
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
                    {desc}
                  </p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="relative bg-[#0A0A0A] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 h-[300px] w-[300px] rounded-full bg-cyan-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
              <MapPin size={14} />
              Find Us
            </span>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Visit Our Lounge
            </h2>
            <p className="mt-3 text-gray-400 max-w-lg mx-auto">
              Walk in anytime during our operating hours. No appointments
              needed.
            </p>
          </Reveal>

          <BlurFade delay={0.2}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-purple-500/10 bg-[#0d0d15] aspect-[4/3]">
                {contact?.googleMapsEmbedUrl ? (
                  <iframe
                    src={contact.googleMapsEmbedUrl}
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

              <AnimeAreaEnter direction="up" className="space-y-4" staggerMs={70}>
                <div className="rounded-2xl border border-purple-500/10 bg-[#0d0d15] p-6">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <MapPin size={16} className="text-purple-500" />
                    Address
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    {contact?.address ||
                      "Visit us at our premium gaming lounge"}
                  </p>
                </div>
                <div className="rounded-2xl border border-purple-500/10 bg-[#0d0d15] p-6">
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
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                    <span className="text-xs font-medium text-cyan-400">
                      Open Now
                    </span>
                  </div>
                </div>
                {contact?.phone && (
                  <div className="rounded-2xl border border-purple-500/10 bg-[#0d0d15] p-6">
                    <h3 className="font-semibold text-white">Contact</h3>
                    <p className="mt-2 text-sm text-gray-400">
                      {contact.phone}
                    </p>
                    {contact?.whatsapp && (
                      <a
                        href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition"
                      >
                        WhatsApp Us
                        <ArrowRight size={12} />
                      </a>
                    )}
                  </div>
                )}
              </AnimeAreaEnter>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#080810] py-16">
        <AnimeCameraReveal range={44} zoomFrom={0.95} className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <motion.div
              whileHover={{
                scale: 1.01,
                transition: { type: "spring", stiffness: 200, damping: 20 },
              }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-cyan-600 p-10 text-center shadow-2xl shadow-purple-500/20 lg:p-14"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
              <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full border border-white/10" />

              <div className="relative">
                <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                  Ready to Level Up?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-purple-100/90">
                  Join the ranks of elite gamers. Experience professional-grade
                  performance at our local facility.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <MagneticButton strength={0.12}>
                    <Link
                      to="/pricing"
                      className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-purple-700 shadow-lg transition-all hover:bg-purple-50 hover:scale-[1.02] active:scale-95"
                    >
                      View Pricing
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </MagneticButton>
                  <MagneticButton strength={0.12}>
                    <Link
                      to="/games"
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/50"
                    >
                      Browse Games
                    </Link>
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </Reveal>
        </AnimeCameraReveal>
      </section>
    </PublicShell>
  );
}
