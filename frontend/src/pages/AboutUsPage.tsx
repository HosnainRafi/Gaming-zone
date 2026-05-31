import { motion } from "framer-motion";
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
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
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
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

export default function AboutUsPage() {
  const { settings } = useSiteSettings();
  const contact = settings?.contact;

  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#070b10] py-20 lg:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-500">
              <Star size={14} />
              Our Story
            </span>
            <h1 className="mt-3 font-display text-4xl font-black uppercase text-white sm:text-5xl lg:text-6xl">
              About{" "}
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Us
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-gray-400 leading-relaxed">
              Founded by competitive gamers for gamers. We believe every player
              deserves access to world-class equipment without compromise.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Elite Philosophy */}
      <section className="relative bg-[#0a0e14] py-20 lg:py-28 overflow-hidden">
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
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
                  alt="Elite Gaming Setup"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl border border-orange-500/20 bg-orange-500/5 -z-10" />
              <div className="absolute -top-4 -left-4 h-16 w-16 rounded-xl border border-purple-500/20 bg-purple-500/5 -z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-500">
                <Zap size={14} />
                Elite Philosophy
              </span>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                Built for Gamers,{" "}
                <span className="text-orange-400">by Gamers</span>
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

      {/* Stats */}
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

      {/* What We Offer */}
      <section className="relative bg-[#0a0e14] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 h-[300px] w-[300px] rounded-full bg-orange-500/3 blur-[100px]" />
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
              <Shield size={14} />
              What We Offer
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-white">
              The Elite Experience
            </h2>
            <p className="mt-3 text-gray-400 max-w-lg mx-auto">
              Everything you need for the ultimate gaming session, all under one
              roof.
            </p>
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
                title: "4K Displays",
                desc: "High-refresh rate monitors with ultra-low response times.",
              },
              {
                icon: <Gamepad2 size={20} />,
                title: "PS5 & PS4 Pro",
                desc: "Latest consoles with all major titles available.",
              },
              {
                icon: <Headphones size={20} />,
                title: "Premium Audio",
                desc: "3D spatial audio headsets at every station.",
              },
              {
                icon: <Wifi size={20} />,
                title: "1Gbps Fiber",
                desc: "Ultra-fast internet for lag-free online multiplayer.",
              },
              {
                icon: <Users size={20} />,
                title: "Community Events",
                desc: "Regular tournaments and gaming nights.",
              },
              {
                icon: <Zap size={20} />,
                title: "Refreshments",
                desc: "Cold drinks and snacks available during your session.",
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

      {/* Location & Contact */}
      <section className="relative bg-[#070b10] py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 h-[300px] w-[300px] rounded-full bg-orange-500/3 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-500">
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0d1117] aspect-[4/3]">
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

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-6">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <MapPin size={16} className="text-orange-500" />
                  Address
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  {contact?.address || "Visit us at our premium gaming lounge"}
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
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                  <span className="text-xs font-medium text-green-400">
                    Open Now
                  </span>
                </div>
              </div>
              {contact?.phone && (
                <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-6">
                  <h3 className="font-semibold text-white">Contact</h3>
                  <p className="mt-2 text-sm text-gray-400">{contact.phone}</p>
                  {contact?.whatsapp && (
                    <a
                      href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition"
                    >
                      WhatsApp Us
                      <ArrowRight size={12} />
                    </a>
                  )}
                </div>
              )}
            </div>
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
                Join the ranks of elite gamers. Experience professional-grade
                performance at our local facility.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/pricing"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-orange-600 shadow-lg transition-all hover:bg-orange-50 hover:scale-[1.02] active:scale-95"
                >
                  View Pricing
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  to="/games"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/50"
                >
                  Browse Games
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicShell>
  );
}
