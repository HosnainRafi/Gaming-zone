import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...rest }: Props) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-slate-400 uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          "w-full rounded-lg border bg-[#0f0f1a] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none transition",
          "focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30",
          error ? "border-red-500/60" : "border-[#1e1e30]",
          className,
        )}
        {...rest}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
