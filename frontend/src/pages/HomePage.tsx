import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Gamepad2,
  Joystick,
  MapPin,
  Monitor,
  Star,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  Check,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGames, type Game } from "../api/games";
import { getPricingTiers, type PricingTier } from "../api/pricing";
import { getSliderImages, type SliderImage } from "../api/slider";
import { PublicShell } from "../components/public/PublicShell";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { publicFeatures } from "../data/publicSite";

const iconMap: Record<string, React.ReactNode> = {
  monitor: <Monitor size={26} />,
  gamepad: <Gamepad2 size={26} />,
  joystick: <Joystick size={26} />,
  steering: <Gamepad2 size={26} />,
  trophy: <Trophy size={26} />,
  coffee: <Coffee size={26} />,
};

const platformColors: Record<string, string> = {
  PC: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  PS5: "bg-indigo-500/20 text-indigo-400 border-indigo-500/20",
  PS4: "bg-purple-500/20 text-purple-400 border-purple-500/20",
};

const defaultSliderImages = [
  {
    id: "1",
    title: "FC 26",
    subtitle: "Experience next-gen football",
    imageUrl:
      "https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=1920&q=80",
  },
  {
    id: "2",
    title: "Call of Duty",
    subtitle: "Intense multiplayer action",
    imageUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80",
  },
  {
    id: "3",
    title: "Racing Simulator",
    subtitle: "Feel the adrenaline",
    imageUrl:
      "https://images.unsplash.com/photo-1511882150382-421056c89033?w=1920&q=80",
  },
];

export default function HomePage() {
  const { settings } = useSiteSettings();
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);

  const contact = settings?.contact;

  useEffect(() => {
    async function fetchAll() {
      try {
        const [images, gamesData, tiersData] = await Promise.all([
          getSliderImages().catch(() => [] as SliderImage[]),
          getGames().catch(() => [] as Game[]),
          getPricingTiers().catch(() => [] as PricingTier[]),
        ]);
        setSliderImages(
          images.length > 0 ? images : (defaultSliderImages as SliderImage[]),
        );
        setGames(gamesData);
        setPricingTiers(tiersData);
      } catch {
        setSliderImages(defaultSliderImages as SliderImage[]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAll();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === sliderImages.length - 1 ? 0 : prev + 1,
    );
  }, [sliderImages.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === 0 ? sliderImages.length - 1 : prev - 1,
    );
  }, [sliderImages.length]);

  useEffect(() => {
    if (sliderImages.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [sliderImages.length, nextSlide]);

  const featuredGames = games.slice(0, 6);
  const displayedTiers = pricingTiers.slice(0, 3);

  return (
    <PublicShell>
      {/* ── Hero Slider ── */}
      <section className="relative h-[90vh] min-h-[560px] max-h-[750px] overflow-hidden bg-[#070b10]">
        {!isLoading && sliderImages.length > 0 && (
          <>
            {sliderImages.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.imageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#070b10] via-[#070b10]/80 to-[#070b10]/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b10] via-transparent to-transparent" />
                <div className="absolute -right-32 top-0 h-[600px] w-[600px] rounded-full bg-orange-500/5 blur-3xl" />
              </div>
            ))}

            {/* Content overlay */}
            <div className="relative z-10 flex h-full items-center">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                  {/* Badge */}
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
                      {settings?.siteName || "Gamers Den"} — Now Open
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="font-display text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
                    {settings?.tagline ? (
                      settings.tagline.split(" ").map((word, i) => (
                        <span
                          key={i}
                          className={i % 3 === 1 ? "text-orange-500" : ""}
                        >
                          {word}{" "}
                        </span>
                      ))
                    ) : (
                      <>
                        The{" "}
                        <span className="text-orange-500">Ultimate</span>{" "}
                        Gaming{" "}
                        <span className="text-orange-500">Zone</span>
                      </>
                    )}
                  </h1>

                  <p className="mt-6 text-base leading-relaxed text-gray-300 sm:text-lg">
                    {settings?.description ||
                      "High-end PCs, PS5, PS4 Pro, Racing Sims, and Arcade — all under one roof."}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      to="/pricing"
                      className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-orange-500/30 transition-all hover:bg-orange-400 hover:shadow-orange-500/50 active:scale-95"
                    >
                      View Pricing
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      to="/games"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/15"
                    >
                      <Gamepad2 size={16} />
                      Browse Games
                    </Link>
                  </div>

                  {/* Quick stats row */}
                  <div className="mt-10 flex flex-wrap gap-6">
                    {games.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Gamepad2 size={14} className="text-orange-400" />
                        <span className="text-sm font-bold text-white">
                          {games.length}+
                        </span>
                        <span className="text-sm text-gray-400">Games</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Timer size={14} className="text-orange-400" />
                      <span className="text-sm font-bold text-white">
                        30 min
                      </span>
                      <span className="text-sm text-gray-400">
                        Min. session
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star size={14} className="text-orange-400" />
                      <span className="text-sm font-bold text-white">4.9</span>
                      <span className="text-sm text-gray-400">Rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider controls */}
            {sliderImages.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/60 sm:left-6 sm:p-3"
                  aria-label="Previous"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/60 sm:right-6 sm:p-3"
                  aria-label="Next"
                >
                  <ChevronRight size={22} />
                </button>
                <div className="absolute bottom-8 right-6 z-20 flex gap-2 sm:right-10">
                  {sliderImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`rounded-full transition-all ${
                        i === currentSlide
                          ? "h-2.5 w-8 bg-orange-500"
                          : "h-2.5 w-2.5 bg-white/30 hover:bg-white/60"
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        )}
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-white/5 bg-[#0c1018]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-white/5 lg:grid-cols-4">
            {[
              {
                icon: <Monitor size={18} className="text-orange-500" />,
                value: "10+",
                label: "Gaming Machines",
              },
              {
                icon: <Gamepad2 size={18} className="text-orange-500" />,
                value: games.length > 0 ? `${games.length}+` : "100+",
                label: "Games Available",
              },
              {
                icon: <Users size={18} className="text-orange-500" />,
                value: "500+",
                label: "Happy Gamers",
              },
              {
                icon: <TrendingUp size={18} className="text-orange-500" />,
                value: "4.9 ★",
                label: "Avg. Rating",
              },
            ].map(({ icon, value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 py-6 sm:flex-row sm:gap-4 sm:px-8"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                  {icon}
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-display text-2xl font-bold text-white">
                    {value}
                  </p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-[#070b10] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
              What We Offer
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Everything You Need
              <br />
              <span className="text-orange-500">For The Win</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-400 sm:text-base">
              From top-tier hardware to the latest game titles — we have it all
              covered.
            </p>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {publicFeatures.map(({ title, description, icon }, idx) => (
              <article
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0c1018] p-6 transition-all hover:-translate-y-1 hover:border-orange-500/25 hover:shadow-xl hover:shadow-orange-500/5"
              >
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-500/5 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-colors group-hover:bg-orange-500/20">
                    {iconMap[icon] || <Gamepad2 size={26} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-orange-500/50">
                      0{idx + 1}
                    </span>
                    <h3 className="mt-0.5 font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">
                      {description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Games ── */}
      {featuredGames.length > 0 && (
        <section className="bg-[#0c1018] py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
                  Game Library
                </span>
                <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
                  Popular Titles
                </h2>
              </div>
              <Link
                to="/games"
                className="flex items-center gap-1.5 text-sm font-semibold text-orange-400 transition hover:text-orange-300"
              >
                View All ({games.length})
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredGames.map((game) => {
                const colorClass =
                  platformColors[game.platform] ??
                  "bg-green-500/20 text-green-400 border-green-500/20";
                return (
                  <article
                    key={game.id}
                    className="group flex items-center gap-4 rounded-xl border border-white/5 bg-[#0a0e14] p-4 transition-all hover:border-orange-500/20 hover:bg-[#0e1520]"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-gray-800 to-gray-900">
                      {game.imageUrl ? (
                        <img
                          src={game.imageUrl}
                          alt={game.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-orange-500/40 group-hover:text-orange-500/70">
                          <Gamepad2 size={22} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white line-clamp-1">
                        {game.title}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${colorClass}`}
                        >
                          {game.platform}
                        </span>
                        {game.genre && (
                          <span className="text-xs text-gray-500">
                            {game.genre}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/games"
                className="inline-flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-6 py-3 text-sm font-semibold text-orange-400 transition hover:bg-orange-500/20"
              >
                Explore Full Game Library
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Pricing Preview ── */}
      {displayedTiers.length > 0 && (
        <section className="bg-[#070b10] py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
                Transparent Pricing
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                Hourly Rates
              </h2>
              <p className="mt-3 text-sm text-gray-400">
                PREPAID · Minimum 30 minutes · No hidden fees
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayedTiers.map((tier) => (
                <article
                  key={tier.id}
                  className={`relative overflow-hidden rounded-2xl border p-6 transition-all ${
                    tier.isPopular
                      ? "border-orange-500/40 bg-gradient-to-b from-orange-500/10 via-[#0c1018] to-[#0c1018] shadow-xl shadow-orange-500/10"
                      : "border-white/5 bg-[#0c1018] hover:border-white/10 hover:-translate-y-1"
                  }`}
                >
                  {tier.isPopular && (
                    <div className="absolute right-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Popular
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-gray-300">
                    {tier.name}
                  </h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold text-white">
                      ৳{Number(tier.price).toFixed(0)}
                    </span>
                    <span className="text-sm text-gray-500">
                      /{tier.perUnit}
                    </span>
                  </div>
                  <ul className="mt-5 space-y-2.5">
                    {tier.description.slice(0, 4).map((point, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-gray-400"
                      >
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                          <Check size={10} className="text-orange-400" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            {pricingTiers.length > 3 && (
              <div className="mt-8 text-center">
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-6 py-3 text-sm font-semibold text-orange-400 transition hover:bg-orange-500/20"
                >
                  See All {pricingTiers.length} Pricing Tiers
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CTA Banner ── */}
      <section className="bg-[#0c1018] py-4">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-10 shadow-2xl shadow-orange-500/20 lg:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)]" />
            <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
            <div className="relative text-center">
              <div className="mb-4 inline-flex items-center gap-2">
                <Zap size={16} className="text-orange-100" />
                <span className="text-xs font-bold uppercase tracking-widest text-orange-100">
                  Ready to play?
                </span>
              </div>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Level Up Your Game
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base text-orange-100">
                Walk in anytime. No appointments needed. Prepaid sessions from
                30 minutes. Premium hardware guaranteed.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/pricing"
                  className="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-orange-600 shadow-lg transition hover:bg-orange-50 active:scale-95"
                >
                  Check Rates
                </Link>
                {contact?.whatsapp && (
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border-2 border-white/30 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    WhatsApp Us
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      <section className="bg-[#070b10] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Find Us
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Visit Our Location
            </h2>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-5">
            <div className="overflow-hidden rounded-2xl border border-white/8 lg:col-span-3">
              <iframe
                src={
                  contact?.googleMapsEmbedUrl ||
                  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.2!2d90.505!3d23.62!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b7fcc7f6c0c7%3A0x1234567890abcdef!2sJFCX%2BG6%20Narayanganj!5e0!3m2!1sen!2sbd!4v1714380000000!5m2!1sen!2sbd"
                }
                width="100%"
                height="380"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Gaming Zone Location"
              />
            </div>

            <div className="flex flex-col gap-5 lg:col-span-2">
              <div className="rounded-2xl border border-white/5 bg-[#0c1018] p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15">
                    <MapPin size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Address
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-300">
                      {contact?.address ||
                        "Allama Iqbal Road Jame Mosque Market, Chashara, Narayanganj, Bangladesh"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#0c1018] p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15">
                    <Clock size={18} className="text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Opening Hours
                    </p>
                    <div className="mt-3 space-y-2">
                      {[
                        { days: "Sat – Thu", hours: "10:00 AM – 11:00 PM" },
                        { days: "Friday", hours: "2:00 PM – 11:00 PM" },
                      ].map(({ days, hours }) => (
                        <div key={days} className="flex justify-between text-sm">
                          <span className="text-gray-400">{days}</span>
                          <span className="font-medium text-white">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <a
                href={
                  contact?.googleMapsUrl ||
                  "https://maps.google.com"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400"
              >
                Get Directions
                <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
