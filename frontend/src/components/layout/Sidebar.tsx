import clsx from "clsx";
import {
  BarChart3,
  Bot,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  MonitorPlay,
  Tag,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/devices", icon: MonitorPlay, label: "Devices" },
  { to: "/sessions", icon: Gamepad2, label: "Sessions" },
  { to: "/offers", icon: Tag, label: "Offers" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
];

const adminItems = [{ to: "/staff", icon: Users, label: "Staff" }];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-[#1e1e30] bg-[#0f0f1a]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1e1e30]">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 shadow-lg shadow-violet-900/50">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <p className="font-display text-base font-bold text-white leading-none">
            Gaming Zone
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Management System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Main
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                isActive
                  ? "bg-violet-600/20 text-violet-300 font-medium shadow-[inset_0_0_0_1px_rgba(124,58,237,0.2)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        {user?.role === "ADMIN" && (
          <>
            <p className="mt-4 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Admin
            </p>
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                    isActive
                      ? "bg-violet-600/20 text-violet-300 font-medium shadow-[inset_0_0_0_1px_rgba(124,58,237,0.2)]"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                  )
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1e1e30] p-4 space-y-3">
        {/* Connection status */}
        <div className="flex items-center gap-2 px-1">
          {connected ? (
            <Wifi size={13} className="text-green-400" />
          ) : (
            <WifiOff size={13} className="text-red-400 animate-pulse" />
          )}
          <span className="text-[11px] text-slate-500">
            {connected ? "Real-time connected" : "Reconnecting…"}
          </span>
        </div>

        {/* User */}
        <div className="flex items-center justify-between rounded-lg border border-[#1e1e30] bg-[#13131f] px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">
              {user?.name ?? user?.email}
            </p>
            <p className="text-[10px] text-slate-500 capitalize">
              {user?.role?.toLowerCase()}
            </p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="ml-2 rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-red-400 transition"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
