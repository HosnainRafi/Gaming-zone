import {
  Facebook,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import { type ReactNode, useState } from "react";
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

  const contact = settings?.contact;

  return (
    <div className="min-h-screen bg-[#0a0e14] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0e14]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
              <span className="font-bold text-white text-lg">G</span>
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white uppercase">
              {settings?.siteName || "Gamers Den"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to={token ? "/dashboard" : "/login"}
              className="ml-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              {token ? "Dashboard" : "Login"}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-white/5 bg-[#0a0e14] px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-white/10 text-white"
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
                className="mt-2 rounded-lg bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                {token ? "Dashboard" : "Login"}
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#080c10]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-4">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
                  <span className="font-bold text-white text-lg">G</span>
                </div>
                <span className="font-display text-xl font-bold tracking-tight text-white uppercase">
                  {settings?.siteName || "Gamers Den"}
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-gray-400">
                {settings?.footerDescription}
              </p>
              <div className="mt-6 flex gap-3">
                {contact?.facebookUrl && (
                  <a
                    href={contact.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition hover:bg-orange-500/20 hover:text-orange-400"
                  >
                    <Facebook size={18} />
                  </a>
                )}
                {contact?.messengerUrl && (
                  <a
                    href={contact.messengerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition hover:bg-orange-500/20 hover:text-orange-400"
                  >
                    <MessageCircle size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Quick Links
              </h4>
              <nav className="mt-4 flex flex-col gap-3">
                <Link
                  to="/games"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Games
                </Link>
                <Link
                  to="/pricing"
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  Pricing
                </Link>
              </nav>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Contact
              </h4>
              <div className="mt-4 space-y-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Business Owner
                </p>
                <p className="text-sm font-medium text-white">
                  {contact?.ownerName}
                </p>
                <div className="space-y-3">
                  {contact?.phone && (
                    <a
                      href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                      className="flex items-center gap-3 text-sm text-gray-400 transition hover:text-orange-400"
                    >
                      <Phone size={14} className="text-orange-400" />
                      <span>PHONE {contact.phone}</span>
                    </a>
                  )}
                  {contact?.whatsapp && (
                    <a
                      href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-gray-400 transition hover:text-green-400"
                    >
                      <MessageCircle size={14} className="text-green-400" />
                      <span>WHATSAPP {contact.whatsapp}</span>
                    </a>
                  )}
                  {contact?.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-3 text-sm text-gray-400 transition hover:text-cyan-400"
                    >
                      <Mail size={14} className="text-cyan-400" />
                      <span>EMAIL {contact.email}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Location
              </h4>
              <div className="mt-4 flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-orange-400" />
                <p className="text-sm leading-relaxed text-gray-400">
                  {contact?.address}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 border-t border-white/5 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()}{" "}
                {settings?.siteName || "Gamers Den"}. All rights reserved.
              </p>
              <p className="text-sm text-gray-500">{settings?.copyright}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
