import clsx from "clsx";

interface Props {
  label?: string;
  status:
    | "AVAILABLE"
    | "RUNNING"
    | "MAINTENANCE"
    | "DISABLED"
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELED";
}

const map: Record<string, string> = {
  AVAILABLE: "bg-green-500/15 text-green-400 border-green-500/30",
  RUNNING: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  ACTIVE: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  MAINTENANCE: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  DISABLED: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30",
  COMPLETED: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  CANCELED: "bg-red-500/15 text-red-400 border-red-500/30",
};

const dot: Record<string, string> = {
  AVAILABLE: "bg-green-400",
  RUNNING: "bg-violet-400 animate-pulse",
  ACTIVE: "bg-violet-400 animate-pulse",
  MAINTENANCE: "bg-yellow-400",
  DISABLED: "bg-zinc-500",
  COMPLETED: "bg-cyan-400",
  CANCELED: "bg-red-400",
};

export function Badge({ status, label }: Props) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide",
        map[status] ?? "bg-zinc-600/20 text-zinc-400 border-zinc-600/30",
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          dot[status] ?? "bg-zinc-500",
        )}
      />
      {label ?? status.toLowerCase()}
    </span>
  );
}
