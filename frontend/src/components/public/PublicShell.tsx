import { motion } from "framer-motion";
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
import { MagneticButton, ScrollProgress } from "../motion";
import { SmoothScrollProvider } from "../motion/SmoothScroll";

const links = [
  { to: "/", label: "Home" },
  { to: "/games", label: "Games" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About Us" },
];

function PublicShellInner({ children }: { children: ReactNode }) {
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
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Tubelight Navbar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-purple-500/10 bg-[#0A0A0A]/95 shadow-2xl shadow-purple-500/5 backdrop-blur-2xl"
            : "border-b border-transparent bg-[#0A0A0A]/70 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 shadow-lg shadow-purple-500/30 transition-all group-hover:shadow-purple-500/60"
            >
              <Gamepad2 size={20} className="text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-display text-base font-bold uppercase tracking-wider leading-none text-white">
                {settings?.siteName || "Gamers Den"}
              </span>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                <span className="text-[9px] font-semibold uppercase tracking-widest text-cyan-400">
                  Now Open
                </span>
              </div>
            </div>
          </Link>

          {/* Tubelight Nav Links */}
          <nav className="hidden items-center gap-0.5 rounded-full border border-white/5 bg-white/[0.03] px-1.5 py-1.5 md:flex">
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
                      className={`relative z-10 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-white"
                      }`}
                    >
                      {link.label}
                    </span>
                    {/* Tubelight glow pill */}
                    {isActive && (
                      <motion.span
                        layoutId="tubelight"
                        className="absolute inset-0 rounded-full bg-white/[0.08]"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    {/* Tubelight neon glow at top */}
                    {isActive && (
                      <motion.span
                        layoutId="tubelight-glow"
                        className="absolute -top-1.5 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 shadow-[0_0_12px_rgba(124,58,237,0.8),0_0_4px_rgba(6,182,212,0.6)]"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:block">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <MagneticButton strength={0.2}>
                <Link
                  to={token ? "/dashboard" : "/login"}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/50 hover:brightness-110"
                >
                  <Zap size={13} />
                  {token ? "Dashboard" : "Staff Login"}
                </Link>
              </MagneticButton>
            </motion.div>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
            exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-purple-500/10 bg-[#0A0A0A]/98 px-4 pb-5 pt-3 md:hidden overflow-hidden"
          >
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
                        ? "bg-purple-500/15 text-purple-300"
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
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                <Zap size={14} />
                {token ? "Dashboard" : "Staff Login"}
              </Link>
            </nav>
          </motion.div>
        )}
      </motion.header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="relative border-t border-white/5 bg-[#050508] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[100px]" />
          <div className="absolute top-0 right-1/3 h-[200px] w-[200px] rounded-full bg-cyan-500/5 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link to="/" className="group flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 shadow-md shadow-purple-500/20">
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
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition hover:bg-purple-500/15 hover:text-purple-400"
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
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition hover:bg-cyan-500/15 hover:text-cyan-400"
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
                  { to: "/about", label: "About Us" },
                  { to: "/login", label: "Staff Portal" },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-purple-400"
                  >
                    <span className="h-px w-3 bg-purple-500/40" />
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
                  { days: "Sat \u2013 Thu", hours: "10:00 AM \u2013 11:00 PM" },
                  { days: "Friday", hours: "2:00 PM \u2013 11:00 PM" },
                ].map(({ days, hours }) => (
                  <div key={days} className="flex items-start gap-3">
                    <Clock
                      size={13}
                      className="mt-0.5 shrink-0 text-cyan-500/70"
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-300">
                        {days}
                      </p>
                      <p className="text-xs text-gray-500">{hours}</p>
                    </div>
                  </div>
                ))}
                <div className="mt-1 flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                  <span className="text-xs font-medium text-cyan-400">
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
                    className="group flex items-center gap-3 text-sm text-gray-500 transition hover:text-purple-400"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 transition group-hover:bg-purple-500/20">
                      <Phone size={13} className="text-purple-500" />
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
                    className="group flex items-center gap-3 text-sm text-gray-500 transition hover:text-cyan-400"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 transition group-hover:bg-cyan-500/20">
                      <Mail size={13} className="text-cyan-500" />
                    </div>
                    <span className="truncate">{contact.email}</span>
                  </a>
                )}
                {contact?.address && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                      <MapPin size={13} className="text-purple-500" />
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
          <div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
            style={{ marginTop: "-1px" }}
          />
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
            <p className="text-xs text-gray-600">
              {settings?.copyright ||
                `\u00A9 ${new Date().getFullYear()} ${settings?.siteName || "Gamers Den"}. All rights reserved.`}
            </p>
            <p className="text-xs text-gray-700">Gaming Zone Management</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <SmoothScrollProvider>
      <ScrollProgress />
      <PublicShellInner>{children}</PublicShellInner>
    </SmoothScrollProvider>
  );
}
