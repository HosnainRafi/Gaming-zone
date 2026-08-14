import clsx from "clsx";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: "purple" | "cyan" | "green" | "yellow" | "red";
  glow?: boolean;
}

const colorMap = {
  purple: {
    ring: "shadow-violet-900/30",
    icon: "bg-violet-500/20 text-violet-400",
    text: "text-violet-400",
  },
  cyan: {
    ring: "shadow-cyan-900/30",
    icon: "bg-cyan-500/20 text-cyan-400",
    text: "text-cyan-400",
  },
  green: {
    ring: "shadow-green-900/30",
    icon: "bg-green-500/20 text-green-400",
    text: "text-green-400",
  },
  yellow: {
    ring: "shadow-yellow-900/20",
    icon: "bg-yellow-500/20 text-yellow-400",
    text: "text-yellow-400",
  },
  red: {
    ring: "shadow-red-900/20",
    icon: "bg-red-500/20 text-red-400",
    text: "text-red-400",
  },
};

export function StatCard({
  icon,
  label,
  value,
  sub,
  color = "purple",
  glow,
}: Props) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{
        y: -4,
        rotateX: 4,
        rotateY: -3,
        scale: 1.02,
        transformPerspective: 900,
      }}
      className={clsx(
        "group relative flex flex-col items-start gap-3 overflow-hidden rounded-xl border border-gz-border bg-gz-card/80 p-4 backdrop-blur-xl transition-colors hover:border-violet-500/30 sm:flex-row sm:items-center sm:gap-4 sm:p-5",
        glow && `shadow-lg ${c.ring}`,
      )}
    >
      {/* Gradient hairline that lights up on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div
        className={clsx(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110",
          c.icon,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p
          className={clsx(
            "mt-0.5 text-xl font-bold font-display sm:text-2xl",
            c.text,
          )}
        >
          {value}
        </p>
        {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}
