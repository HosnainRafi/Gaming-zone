import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Gamepad2,
  Joystick,
  MapPin,
  Monitor,
  Trophy,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSliderImages, type SliderImage } from "../api/slider";
import { PublicShell } from "../components/public/PublicShell";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { publicFeatures } from "../data/publicSite";

const iconMap: Record<string, React.ReactNode> = {
  monitor: <Monitor size={32} />,
  gamepad: <Gamepad2 size={32} />,
  joystick: <Joystick size={32} />,
  steering: <Gamepad2 size={32} />,
  trophy: <Trophy size={32} />,
  coffee: <Coffee size={32} />,
};

// Default slider images if none from API
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

  const contact = settings?.contact;

  useEffect(() => {
    async function fetchSlider() {
      try {
        const images = await getSliderImages();
        setSliderImages(
          images.length > 0 ? images : (defaultSliderImages as SliderImage[]),
        );
      } catch {
        setSliderImages(defaultSliderImages as SliderImage[]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSlider();
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

  // Auto-advance slider
  useEffect(() => {
    if (sliderImages.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [sliderImages.length, nextSlide]);

  return (
    <PublicShell>
      {/* Hero Slider Section */}
      <section className="relative h-[500px] overflow-hidden bg-[#0a0e14] lg:h-[600px]">
        {/* Slider Images */}
        {!isLoading && sliderImages.length > 0 && (
          <>
            {sliderImages.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.imageUrl})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e14] via-[#0a0e14]/80 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14] via-transparent to-transparent" />
                </div>
              </div>
            ))}

            {/* Content Overlay */}
            <div className="relative z-10 flex h-full items-center">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                  <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                    {settings?.tagline?.split(" ").map((word, i) => (
                      <span
                        key={i}
                        className={i === 1 ? "text-orange-500" : ""}
                      >
                        {word}{" "}
                      </span>
                    )) || "The Ultimate Gaming Destination"}
                  </h1>
                  <p className="mt-6 text-lg leading-relaxed text-gray-300">
                    {settings?.description}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      to="/pricing"
                      className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600"
                    >
                      Check Pricing
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      to="/games"
                      className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                    >
                      Browse Games
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Controls */}
            {sliderImages.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-sm transition hover:bg-black/50"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-sm transition hover:bg-black/50"
                  aria-label="Next slide"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                  {sliderImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? "w-8 bg-orange-500"
                          : "w-2 bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-[#0c1016] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
              Everything You Need
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              For The Win
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publicFeatures.map(({ title, description, icon }) => (
              <article
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0e14] p-6 transition-all hover:border-orange-500/30 hover:bg-[#0e1218]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-colors group-hover:bg-orange-500/20">
                  {iconMap[icon] || <Gamepad2 size={32} />}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Visit Our Location Section with Google Maps */}
      <section className="bg-[#0a0e14] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
              Visit Our Location
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Experience the ultimate gaming hub in Narayanganj
            </h2>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Google Maps Embed */}
            <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#0c1016]">
              <iframe
                src={
                  contact?.googleMapsEmbedUrl ||
                  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.2!2d90.505!3d23.62!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b7fcc7f6c0c7%3A0x1234567890abcdef!2sJFCX%2BG6%20Narayanganj!5e0!3m2!1sen!2sbd!4v1714380000000!5m2!1sen!2sbd"
                }
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "300px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Gamers Den Location"
              />
            </div>

            {/* Location Info */}
            <div className="flex flex-col justify-center rounded-2xl border border-white/5 bg-gradient-to-br from-orange-500/10 via-[#0e1218] to-[#0a0e14] p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/20">
                  <MapPin size={24} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Address</h3>
                  <p className="mt-2 text-gray-400">
                    {contact?.address ||
                      "Allama Iqbal Road Jame Mosque Market, Chashara, Narayanganj, Bangladesh"}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href={
                    contact?.googleMapsUrl ||
                    "https://www.google.com/maps/place/JFCX%2BG6+Narayanganj"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600"
                >
                  Get Directions
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
