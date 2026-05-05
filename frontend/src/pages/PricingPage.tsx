import {
  ArrowRight,
  Check,
  Clock,
  Gamepad2,
  Info,
  Shield,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPricingTiers, type PricingTier } from "../api/pricing";
import { PublicShell } from "../components/public/PublicShell";
import { useSiteSettings } from "../context/SiteSettingsContext";

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
      {/* ── Header ── */}
      <section className="relative overflow-hidden bg-[#070b10] py-20 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.07)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Transparent Pricing
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Hourly <span className="text-orange-500">Rates</span>
            </h1>
            <p className="mt-4 text-base text-gray-400">
              Pick your setup. Pay per hour. No subscriptions, no surprises.
            </p>
          </div>

          {/* Info badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
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
          </div>
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="bg-[#0c1018] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
          ) : tiers.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-gray-400">
                No pricing information available yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tiers.map((tier) => (
                <article
                  key={tier.id}
                  className={`group relative overflow-hidden rounded-2xl border p-6 transition-all ${
                    tier.isPopular
                      ? "border-orange-500/40 bg-gradient-to-b from-orange-500/10 via-[#0e1520] to-[#0e1520] shadow-2xl shadow-orange-500/10"
                      : "border-white/5 bg-[#0a0e14] hover:-translate-y-1 hover:border-white/10"
                  }`}
                >
                  {tier.isPopular && (
                    <>
                      <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
                      <div className="absolute right-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-orange-500/30">
                        ★ Most Popular
                      </div>
                    </>
                  )}

                  <div className="relative">
                    <h3
                      className={`text-sm font-semibold uppercase tracking-wider ${
                        tier.isPopular ? "text-orange-400" : "text-gray-400"
                      }`}
                    >
                      {tier.name}
                    </h3>

                    <div className="mt-4 flex items-end gap-2">
                      <span className="font-display text-5xl font-bold text-white">
                        ৳{Number(tier.price).toFixed(0)}
                      </span>
                      <span className="mb-1 text-sm text-gray-500">
                        /{tier.perUnit}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="h-px w-6 bg-orange-500/40" />
                      <span className="text-[10px] font-medium uppercase tracking-wider text-orange-500/60">
                        per session
                      </span>
                    </div>

                    <ul className="mt-6 space-y-3">
                      {tier.description.map((point, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-sm"
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                              tier.isPopular
                                ? "bg-orange-500/20"
                                : "bg-green-500/15"
                            }`}
                          >
                            <Check
                              size={11}
                              className={
                                tier.isPopular
                                  ? "text-orange-400"
                                  : "text-green-400"
                              }
                            />
                          </span>
                          <span className="text-gray-300">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="bg-[#070b10] py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Every Session Includes
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-white">
              What You Get
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "🖥️",
                title: "High-End Hardware",
                desc: "Latest RTX GPUs, high-refresh monitors, mechanical keyboards.",
              },
              {
                icon: "🎮",
                title: "Controllers & Peripherals",
                desc: "DualSense, DualShock, and steering wheels — all included.",
              },
              {
                icon: "🎧",
                title: "Audio Setup",
                desc: "Gaming headsets and surround sound at every station.",
              },
              {
                icon: "💡",
                title: "Ambient Lighting",
                desc: "RGB-lit gaming area with a premium atmosphere.",
              },
              {
                icon: "🥤",
                title: "Refreshments Nearby",
                desc: "Snacks and cold drinks available on-site.",
              },
              {
                icon: "🛡️",
                title: "Sanitized Equipment",
                desc: "Peripherals cleaned before every session — always fresh.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/5 bg-[#0c1018] p-5 transition-all hover:border-orange-500/15"
              >
                <div className="text-2xl">{icon}</div>
                <h3 className="mt-3 font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#0c1018] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/5 bg-[#0a0e14] p-10">
            <Gamepad2 size={36} className="mx-auto text-orange-500" />
            <h2 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">
              Ready to Play?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-gray-400">
              Walk in anytime during business hours. Prepaid sessions only —
              minimum 30 minutes. No reservations needed.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/games"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400"
              >
                Browse Games
                <ArrowRight size={15} />
              </Link>
              {contact?.whatsapp && (
                <a
                  href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Contact Us
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
