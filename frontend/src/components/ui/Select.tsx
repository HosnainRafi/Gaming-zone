import clsx from "clsx";
import type { SelectHTMLAttributes } from "react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export function Select({
  label,
  error,
  options,
  className,
  id,
  ...rest
}: Props) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-medium text-slate-400 uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          "w-full rounded-lg border bg-[#0f0f1a] px-3 py-2 text-sm text-slate-200 outline-none transition",
          "focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30",
          error ? "border-red-500/60" : "border-[#1e1e30]",
          className,
        )}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0f0f1a]">
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
