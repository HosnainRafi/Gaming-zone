import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clock,
  Gamepad2,
  Headphones,
  Info,
  Monitor,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getPricingTiers, type PricingTier } from "../api/pricing";
import img4 from "../images/4.jpg";
import { publicPricing } from "../data/publicSite";
import {
  BlurFade,
  MagneticButton,
  Reveal,
  StaggerContainer,
  StaggerItem,
} from "../components/motion";
import { SparklesText, SpotlightCard } from "../components/motion/effects";
import { SceneCanvas, PricingTorus } from "../components/three";
import { useThreeScene } from "../hooks/useThreeScene";
import { AnimeCameraReveal, AnimeHeroExit, AnimeMouseCamera } from "../components/anime";
import { GsapScrambleText, GsapTextSplit } from "../components/gsap";
import { NowPlayingBar } from "../components/public/NowPlayingBar";
import { PublicShell } from "../components/public/PublicShell";
import { useSiteSettings } from "../context/SiteSettingsContext";

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

export default function PricingPage() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useSiteSettings();
  const { shouldRender: render3d } = useThreeScene();
  const contact = settings?.contact;
  const whatsappHref = contact?.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`
    : null;

  // Hero background parallax (3D depth on scroll)
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroBgY = useTransform(heroScroll, [0, 1], [0, 90]);

  useEffect(() => {
    async function fetchPricing() {
      try {
        const data = await getPricingTiers();
        setTiers(data);
      } catch (error) {
        console.error("Failed to fetch pricing:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPricing();
  }, []);

  return (
    <PublicShell>
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden bg-[#0A0A0A] py-28 lg:py-36">
        {/* 3D Torus Rings Background */}
        {render3d && (
          <SceneCanvas aria-label="3D rotating torus rings scene" className="z-10" bloomIntensity={0.75} bloomThreshold={0.58}>
            <PricingTorus />
            <ambientLight intensity={0.03} />
          </SceneCanvas>
        )}
        {/* Background image */}
        <div className="absolute inset-0">
          <motion.img
            style={{ y: heroBgY }}
            src={img4}
            alt=""
            className="h-full w-full scale-110 object-cover object-center"
          />
        </div>
        {/* Dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-[#0A0A0A]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
        <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />
        {/* Colour blobs */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 60% at 20% 50%, rgba(124,58,237,0.25) 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 80% 30%, rgba(6,182,212,0.2) 0%, transparent 60%)" }} />

        <AnimeHeroExit className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <BlurFade delay={0.1}>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400">
                <Zap size={14} />
                Tiered Access
              </span>
            </BlurFade>
            <BlurFade delay={0.2}>
              <h1 className="mt-3 font-display text-4xl font-black uppercase text-white sm:text-5xl lg:text-6xl">
                Choose Your{" "}
                <SparklesText sparkleCount={6} colors={["#7c3aed", "#06b6d4", "#ec4899", "#ffffff"]} className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  Station
                </SparklesText>
              </h1>
            </BlurFade>
            <GsapTextSplit
              className="mx-auto mt-4 max-w-lg"
              innerClassName="text-base text-gray-400"
            >
              Premium hardware for every level of play. Select the setup that suits your session.
            </GsapTextSplit>
          </div>

          {/* Info badges */}
          <BlurFade
            delay={0.4}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            {[
              { icon: <Clock size={13} />, label: "Minimum 30 minutes" },
              { icon: <Shield size={13} />, label: "Prepaid only" },
              { icon: <Zap size={13} />, label: "Instant booking" },
              {
                icon: <Info size={13} />,
                label: "No pause or mid-session changes",
              },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-purple-500/15 bg-purple-500/5 px-4 py-2 text-xs font-medium text-gray-400"
              >
                <span className="text-purple-400">{icon}</span>
                {label}
              </div>
            ))}
          </BlurFade>
        </AnimeHeroExit>
      </section>

      <NowPlayingBar />

      {/* Pricing Cards - Dark Gradient Style */}
      <section className="relative bg-[#080810] py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[130px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-purple-500/30 border-t-purple-500" />
            </div>
          ) : tiers.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-gray-400">
                No pricing information available yet.
              </p>
            </div>
          ) : (
            <AnimeMouseCamera maxRotate={3.5} maxTranslate={9}>
            <StaggerContainer
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 [perspective:1200px]"
              staggerDelay={0.1}
            >
              {tiers.map((tier, idx) => (
                <StaggerItem key={tier.id}>
                  <motion.article
                    whileHover={{
                      y: -8,
                      rotateX: 3,
                      rotateY: -2,
                      scale: 1.02,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      },
                    }}
                    className={`relative flex flex-col overflow-hidden rounded-2xl border p-7 transition-all [transform-style:preserve-3d] ${
                      tier.isPopular
                        ? "border-purple-500/40 bg-gradient-to-b from-purple-500/10 to-[#0d0d15] shadow-2xl shadow-purple-500/10"
                        : "border-white/8 bg-[#0d0d15] hover:border-purple-500/20"
                    }`}
                  >
                    {/* Neon glow top border for popular */}
                    {tier.isPopular && (
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-500" />
                    )}

                    {tier.isPopular && (
                      <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        Most Popular
                      </div>
                    )}

                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {tier.isPopular
                        ? "Competitor Choice"
                        : idx === tiers.length - 1
                          ? "Luxury Suite"
                          : "Core Experience"}
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-white">
                      {tier.name}
                    </h3>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
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
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/15">
                            <Check size={11} className="text-purple-400" />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>

                    <MagneticButton strength={0.08} className="mt-7">
                      <a
                        href={whatsappHref || "/about"}
                        {...(whatsappHref ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-95 ${tier.isPopular
                          ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/20 hover:brightness-110"
                          : "border border-white/10 bg-white/5 text-white hover:border-purple-500/40 hover:bg-purple-500/10"
                        }`}
                      >
                        {whatsappHref ? "Book on WhatsApp" : "Walk-In Only"}
                      </a>
                    </MagneticButton>
                  </motion.article>
                </StaggerItem>
              ))}
            </StaggerContainer>
            </AnimeMouseCamera>
          )}
        </div>
      </section>

      {/* What is Included */}
      <section className="relative bg-[#0A0A0A] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 h-[300px] w-[300px] rounded-full bg-pink-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
              <Sparkles size={14} />
              Every Session Includes
            </span>
            <GsapScrambleText
              tag="h2"
              className="mt-3 font-display text-3xl font-bold text-white"
              scrambleDuration={1.3}
              stagger={0.04}
            >
              What You Get
            </GsapScrambleText>
          </Reveal>

          <AnimeMouseCamera maxRotate={3} maxTranslate={8} className="mt-12">
          <StaggerContainer
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 [perspective:1000px]"
            staggerDelay={0.08}
          >
            {[
              {
                icon: <Monitor size={20} />,
                title: "High-End Hardware",
                desc: "Latest RTX GPUs, high-refresh monitors, mechanical keyboards.",
                color: "purple",
              },
              {
                icon: <Gamepad2 size={20} />,
                title: "Controllers & Peripherals",
                desc: "DualSense, DualShock, and steering wheels - all included.",
                color: "cyan",
              },
              {
                icon: <Headphones size={20} />,
                title: "Audio Setup",
                desc: "Gaming headsets and surround sound at every station.",
                color: "pink",
              },
              {
                icon: <Sparkles size={20} />,
                title: "Ambient Lighting",
                desc: "RGB-lit gaming area with a premium atmosphere.",
                color: "purple",
              },
              {
                icon: <Zap size={20} />,
                title: "Refreshments Nearby",
                desc: "Snacks and cold drinks available on-site.",
                color: "cyan",
              },
              {
                icon: <Shield size={20} />,
                title: "Sanitized Equipment",
                desc: "Peripherals cleaned before every session - always fresh.",
                color: "pink",
              },
            ].map(({ icon, title, desc, color }) => (
              <StaggerItem key={title}>
                <SpotlightCard className="p-6 group">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                    color === "purple" ? "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20" :
                    color === "cyan" ? "bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20" :
                    "bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20"
                  }`}>
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
          </AnimeMouseCamera>
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
                  Join the ranks of elite gamers. Walk in anytime - no
                  appointments needed. Prepaid sessions from 30 minutes.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <MagneticButton strength={0.12}>
                    <Link
                      to="/games"
                      className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-purple-700 shadow-lg transition-all hover:bg-purple-50 hover:scale-[1.02] active:scale-95"
                    >
                      Browse Games
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </MagneticButton>
                  {contact?.whatsapp && (
                    <MagneticButton strength={0.12}>
                      <a
                        href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/50"
                      >
                        Contact Us
                      </a>
                    </MagneticButton>
                  )}
                </div>
              </div>
            </motion.div>
          </Reveal>
        </AnimeCameraReveal>
      </section>
    </PublicShell>
  );
}
