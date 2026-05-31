import { motion } from "framer-motion";
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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPricingTiers, type PricingTier } from "../api/pricing";
import { PublicShell } from "../components/public/PublicShell";
import { useSiteSettings } from "../context/SiteSettingsContext";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export default function PricingPage() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useSiteSettings();
  const contact = settings?.contact;

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
      <section className="relative overflow-hidden bg-[#070b10] py-20 lg:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-500">
              <Zap size={14} />
              Tiered Access
            </span>
            <h1 className="mt-3 font-display text-4xl font-black uppercase text-white sm:text-5xl lg:text-6xl">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Station
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-gray-400">
              Premium hardware for every level of play. Select the setup that
              suits your session.
            </p>
          </motion.div>

          {/* Info badges */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-400"
              >
                <span className="text-orange-500">{icon}</span>
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative bg-[#0a0e14] py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-orange-500/3 blur-[130px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-orange-500/30 border-t-orange-500" />
            </div>
          ) : tiers.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-gray-400">
                No pricing information available yet.
              </p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={stagger}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {tiers.map((tier, idx) => (
                <motion.article
                  key={tier.id}
                  variants={fadeUp}
                  whileHover={{ y: -8 }}
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
                      ? "Competitor Choice"
                      : idx === tiers.length - 1
                        ? "Luxury Suite"
                        : "Core Experience"}
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
                    className={`mt-7 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all cursor-default ${
                      tier.isPopular
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20"
                        : "border border-white/10 bg-white/5 text-white"
                    }`}
                  >
                    Walk-In Only
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* What's Included */}
      <section className="relative bg-[#070b10] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 h-[300px] w-[300px] rounded-full bg-purple-500/3 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-500">
              <Sparkles size={14} />
              Every Session Includes
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-white">
              What You Get
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                icon: <Monitor size={20} />,
                title: "High-End Hardware",
                desc: "Latest RTX GPUs, high-refresh monitors, mechanical keyboards.",
              },
              {
                icon: <Gamepad2 size={20} />,
                title: "Controllers & Peripherals",
                desc: "DualSense, DualShock, and steering wheels - all included.",
              },
              {
                icon: <Headphones size={20} />,
                title: "Audio Setup",
                desc: "Gaming headsets and surround sound at every station.",
              },
              {
                icon: <Sparkles size={20} />,
                title: "Ambient Lighting",
                desc: "RGB-lit gaming area with a premium atmosphere.",
              },
              {
                icon: <Zap size={20} />,
                title: "Refreshments Nearby",
                desc: "Snacks and cold drinks available on-site.",
              },
              {
                icon: <Shield size={20} />,
                title: "Sanitized Equipment",
                desc: "Peripherals cleaned before every session - always fresh.",
              },
            ].map(({ icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-white/5 bg-[#0d1117] p-6 transition-all hover:border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-colors group-hover:bg-orange-500/20">
                  {icon}
                </div>
                <h3 className="mt-4 font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
                  {desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0a0e14] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-10 text-center shadow-2xl shadow-orange-500/20 lg:p-14"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
            <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full border border-white/10" />

            <div className="relative">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                Ready to Level Up?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-orange-100/90">
                Join the ranks of elite gamers. Walk in anytime - no
                appointments needed. Prepaid sessions from 30 minutes.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/games"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-orange-600 shadow-lg transition-all hover:bg-orange-50 hover:scale-[1.02] active:scale-95"
                >
                  Browse Games
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                {contact?.whatsapp && (
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/50"
                  >
                    Contact Us
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicShell>
  );
}
