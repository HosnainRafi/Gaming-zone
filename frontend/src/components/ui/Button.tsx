import clsx from "clsx";
import { type ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none";

const variants = {
  primary:
    "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40",
  danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40",
  ghost: "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white",
  outline:
    "border border-[#1e1e30] hover:border-violet-500/50 bg-transparent text-slate-300 hover:text-white",
};

const sizes = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-6 py-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  className,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled ?? loading}
      {...rest}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
