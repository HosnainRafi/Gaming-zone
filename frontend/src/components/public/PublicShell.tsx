import {
  Clock,
  Facebook,
  Gamepad2,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  X,
  Zap,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/pricing", label: "Pricing" },
  { to: "/games", label: "Games" },
];

export function PublicShell({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const { settings } = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const contact = settings?.contact;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#070b10] text-white">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/8 bg-[#070b10]/96 shadow-2xl shadow-black/40 backdrop-blur-2xl"
            : "border-b border-transparent bg-[#070b10]/70 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/25 transition-all group-hover:shadow-orange-500/50">
              <Gamepad2 size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-base font-bold uppercase tracking-wider leading-none text-white">
                {settings?.siteName || "Gamers Den"}
              </span>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                <span className="text-[9px] font-semibold uppercase tracking-widest text-green-400">
                  Now Open
                </span>
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className="group relative px-4 py-2 text-sm font-medium"
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-white"
                      }`}
                    >
                      {link.label}
                    </span>
                    <span
                      className={`absolute -bottom-px left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-orange-500 transition-all duration-200 ${
                        isActive ? "w-5" : "w-0"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
            <Link
              to={token ? "/dashboard" : "/login"}
              className="ml-4 flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-400 hover:shadow-orange-500/40 active:scale-95"
            >
              <Zap size={13} />
              {token ? "Dashboard" : "Staff Login"}
            </Link>
          </nav>

          <button
            type="button"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/5 bg-[#070b10]/98 px-4 pb-5 pt-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-orange-500/15 text-orange-300"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to={token ? "/dashboard" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                <Zap size={14} />
                {token ? "Dashboard" : "Staff Login"}
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050810]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-md shadow-orange-500/20">
                  <Gamepad2 size={20} className="text-white" />
                </div>
                <span className="font-display text-base font-bold uppercase tracking-wider text-white">
                  {settings?.siteName || "Gamers Den"}
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-gray-500">
                {settings?.footerDescription ||
                  "Your ultimate gaming destination. High-end PCs, PS5, PS4 Pro, Racing Sims and more."}
              </p>
              <div className="mt-5 flex gap-2">
                {contact?.facebookUrl && (
                  <a
                    href={contact.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition hover:bg-orange-500/15 hover:text-orange-400"
                  >
                    <Facebook size={15} />
                  </a>
                )}
                {contact?.messengerUrl && (
                  <a
                    href={contact.messengerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Messenger"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition hover:bg-orange-500/15 hover:text-orange-400"
                  >
                    <MessageCircle size={15} />
                  </a>
                )}
                {contact?.whatsapp && (
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition hover:bg-green-500/20 hover:text-green-400"
                  >
                    <Phone size={15} />
                  </a>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Navigate
              </h4>
              <nav className="mt-4 flex flex-col gap-3">
                {[
                  { to: "/", label: "Home" },
                  { to: "/games", label: "Game Library" },
                  { to: "/pricing", label: "Hourly Rates" },
                  { to: "/login", label: "Staff Portal" },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-orange-400"
                  >
                    <span className="h-px w-3 bg-orange-500/40" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Business Hours
              </h4>
              <div className="mt-4 space-y-3.5">
                {[
                  { days: "Sat – Thu", hours: "10:00 AM – 11:00 PM" },
                  { days: "Friday", hours: "2:00 PM – 11:00 PM" },
                ].map(({ days, hours }) => (
                  <div key={days} className="flex items-start gap-3">
                    <Clock
                      size={13}
                      className="mt-0.5 shrink-0 text-orange-500/70"
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-300">
                        {days}
                      </p>
                      <p className="text-xs text-gray-500">{hours}</p>
                    </div>
                  </div>
                ))}
                <div className="mt-1 flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                  <span className="text-xs font-medium text-green-400">
                    Open Now
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Get In Touch
              </h4>
              <div className="mt-4 space-y-4">
                {contact?.ownerName && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                      Business Owner
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-300">
                      {contact.ownerName}
                    </p>
                  </div>
                )}
                {contact?.phone && (
                  <a
                    href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                    className="group flex items-center gap-3 text-sm text-gray-500 transition hover:text-orange-400"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 transition group-hover:bg-orange-500/20">
                      <Phone size={13} className="text-orange-500" />
                    </div>
                    {contact.phone}
                  </a>
                )}
                {contact?.whatsapp && (
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-sm text-gray-500 transition hover:text-green-400"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10 transition group-hover:bg-green-500/20">
                      <MessageCircle size={13} className="text-green-500" />
                    </div>
                    WhatsApp
                  </a>
                )}
                {contact?.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="group flex items-center gap-3 text-sm text-gray-500 transition hover:text-orange-400"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 transition group-hover:bg-orange-500/20">
                      <Mail size={13} className="text-orange-500" />
                    </div>
                    <span className="truncate">{contact.email}</span>
                  </a>
                )}
                {contact?.address && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                      <MapPin size={13} className="text-orange-500" />
                    </div>
                    <p className="text-sm leading-relaxed text-gray-500">
                      {contact.address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
            <p className="text-xs text-gray-600">
              {settings?.copyright ||
                `© ${new Date().getFullYear()} ${settings?.siteName || "Gamers Den"}. All rights reserved.`}
            </p>
            <p className="text-xs text-gray-700">Gaming Zone Management</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
