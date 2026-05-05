import clsx from "clsx";
import {
  BarChart3,
  Bell,
  BellOff,
  CreditCard,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorPlay,
  Moon,
  Settings,
  Sun,
  Tag,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useTheme } from "../../context/ThemeContext";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/devices", icon: MonitorPlay, label: "Devices" },
  { to: "/members", icon: CreditCard, label: "Members" },
  { to: "/sessions", icon: Gamepad2, label: "Sessions" },
  { to: "/offers", icon: Tag, label: "Offers" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
];

const adminItems = [
  { to: "/staff", icon: Users, label: "Staff" },
  { to: "/settings", icon: Settings, label: "Site Settings" },
];

interface SidebarProps {
  mobileExpanded: boolean;
  onToggleMobile: () => void;
  onNavigateMobile: () => void;
}

export function Sidebar({
  mobileExpanded,
  onToggleMobile,
  onNavigateMobile,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const {
    connectionMode,
    reminderActive,
    soundEnabled,
    visualEnabled,
    setSoundEnabled,
    setVisualEnabled,
    stopReminder,
  } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const collapsed = !mobileExpanded;
  const labelClass = collapsed ? "hidden md:block" : "block";
  const justifyClass = collapsed
    ? "justify-center md:justify-start"
    : "justify-start";

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-40 flex h-full w-72 shrink-0 flex-col border-r border-gz-border bg-gz-surface transition-transform duration-200 md:static md:z-auto md:w-60 md:translate-x-0 md:shadow-none",
        mobileExpanded
          ? "translate-x-0 shadow-2xl shadow-black/40"
          : "-translate-x-full pointer-events-none",
        "md:pointer-events-auto",
      )}
    >
      <div className="flex items-center justify-between border-b border-gz-border px-4 py-5 md:px-5">
        <div className={clsx("flex items-center gap-3", justifyClass)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 shadow-lg shadow-violet-900/50">
            <Gamepad2 size={20} className="text-white" />
          </div>
          <div className={labelClass}>
            <p className="font-display text-base font-bold leading-none text-white">
              Gaming Zone
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Management System
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleMobile}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white md:hidden"
          title={mobileExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {mobileExpanded ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <p
          className={clsx(
            "px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600",
            labelClass,
          )}
        >
          Main
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            title={label}
            onClick={onNavigateMobile}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                justifyClass,
                isActive
                  ? "bg-violet-600/20 text-violet-300 font-medium shadow-[inset_0_0_0_1px_rgba(124,58,237,0.2)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
              )
            }
          >
            <Icon size={17} />
            <span className={labelClass}>{label}</span>
          </NavLink>
        ))}

        {user?.role === "ADMIN" && (
          <>
            <p
              className={clsx(
                "mt-4 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600",
                labelClass,
              )}
            >
              Admin
            </p>
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                title={label}
                onClick={onNavigateMobile}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                    justifyClass,
                    isActive
                      ? "bg-violet-600/20 text-violet-300 font-medium shadow-[inset_0_0_0_1px_rgba(124,58,237,0.2)]"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                  )
                }
              >
                <Icon size={17} />
                <span className={labelClass}>{label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-gz-border p-4 space-y-3">
        <div
          className={clsx(
            "flex items-center gap-2 px-1",
            collapsed && "justify-center md:justify-start",
          )}
        >
          {connectionMode === "realtime" ? (
            <Wifi size={13} className="text-green-400" />
          ) : connectionMode === "polling" ? (
            <WifiOff size={13} className="text-amber-400" />
          ) : (
            <WifiOff size={13} className="text-red-400 animate-pulse" />
          )}
          <span className={clsx("text-[11px] text-slate-500", labelClass)}>
            {connectionMode === "realtime"
              ? "Real-time connected"
              : connectionMode === "polling"
                ? "Polling mode"
                : "Reconnecting…"}
          </span>
        </div>

        <div className="rounded-lg border border-gz-border bg-gz-card px-3 py-3">
          <div
            className={clsx(
              "flex items-start gap-2",
              collapsed && "justify-center md:justify-start",
            )}
          >
            <Bell size={14} className="mt-0.5 text-amber-300" />
            <div className={labelClass}>
              <p className="text-xs font-medium text-slate-200">
                End reminders
              </p>
              <p className="text-[10px] text-slate-500">
                10 second alert when a device time finishes
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center justify-between rounded-lg border border-gz-border bg-gz-surface px-3 py-2 text-left text-xs text-slate-300 transition hover:border-violet-500/40 hover:text-white"
            >
              <span className="flex items-center gap-2">
                {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span>Sound {soundEnabled ? "on" : "off"}</span>
              </span>
              <span className="text-[10px] text-slate-500">
                {soundEnabled ? "Enabled" : "Muted"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVisualEnabled(!visualEnabled)}
              className="flex items-center justify-between rounded-lg border border-gz-border bg-gz-surface px-3 py-2 text-left text-xs text-slate-300 transition hover:border-violet-500/40 hover:text-white"
            >
              <span className="flex items-center gap-2">
                {visualEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                <span>Notification {visualEnabled ? "on" : "off"}</span>
              </span>
              <span className="text-[10px] text-slate-500">
                {visualEnabled ? "Visible" : "Hidden"}
              </span>
            </button>

            {reminderActive ? (
              <button
                type="button"
                onClick={stopReminder}
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200 transition hover:border-amber-400/50 hover:bg-amber-500/15"
              >
                Stop current alarm
              </button>
            ) : null}
          </div>
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          className={clsx(
            "flex w-full items-center rounded-lg border border-gz-border bg-gz-card px-3 py-2.5 transition hover:border-violet-500/40",
            collapsed ? "justify-center md:justify-between" : "justify-between",
          )}
        >
          <span
            className={clsx("flex items-center gap-2", labelClass ? "" : "")}
          >
            {theme === "dark" ? (
              <Sun size={14} className="shrink-0 text-amber-400" />
            ) : (
              <Moon size={14} className="shrink-0 text-violet-400" />
            )}
            <span
              className={clsx("text-xs font-medium text-slate-300", labelClass)}
            >
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </span>
          {/* Pill toggle — only visible when label is visible */}
          <span
            className={clsx(
              "relative flex h-5 w-9 items-center rounded-full border transition-colors duration-200",
              labelClass,
              theme === "dark"
                ? "border-slate-600 bg-slate-700"
                : "border-violet-400 bg-violet-500",
            )}
          >
            <span
              className={clsx(
                "h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
                theme === "dark" ? "translate-x-0.5" : "translate-x-[18px]",
              )}
            />
          </span>
        </button>

        <div
          className={clsx(
            "flex items-center rounded-lg border border-gz-border bg-gz-card px-3 py-2.5",
            collapsed ? "justify-center md:justify-between" : "justify-between",
          )}
        >
          <div className={clsx("min-w-0", labelClass)}>
            <p className="truncate text-xs font-medium text-slate-200">
              {user?.name ?? user?.email}
            </p>
            <p className="text-[10px] capitalize text-slate-500">
              {user?.role?.toLowerCase()}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Sign out"
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-red-400"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
