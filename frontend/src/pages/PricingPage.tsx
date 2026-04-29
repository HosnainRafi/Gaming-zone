import { useEffect, useState } from "react";
import { getPricingTiers, type PricingTier } from "../api/pricing";
import { PublicShell } from "../components/public/PublicShell";

export default function PricingPage() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      {/* Header Section */}
      <section className="bg-[#0a0e14] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
              HOURLY RATES
            </h1>
            <p className="mt-4 text-lg text-gray-400">
              Choose your weapon. Minimum session duration is 30 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="bg-[#0c1016] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
          ) : tiers.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-gray-400">
                No pricing information available.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tiers.map((tier) => (
                <article
                  key={tier.id}
                  className={`relative overflow-hidden rounded-2xl border p-6 transition-all hover:border-orange-500/30 ${
                    tier.isPopular
                      ? "border-orange-500/30 bg-linear-to-b from-orange-500/10 to-transparent"
                      : "border-white/5 bg-[#0a0e14]"
                  }`}
                >
                  {tier.isPopular && (
                    <div className="absolute -right-12 top-6 rotate-45 bg-orange-500 px-12 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                      Most Popular
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-white">
                    {tier.name}
                  </h3>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold text-orange-500">
                      ৳{Number(tier.price).toFixed(0)}
                    </span>
                    <span className="text-sm text-gray-400">
                      /{tier.perUnit}
                    </span>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {tier.description.map((point, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-400"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
