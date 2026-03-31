import clsx from "clsx";
import { type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className, glow }: Props) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-[#1e1e30] bg-[#13131f] p-5",
        glow && "shadow-lg shadow-violet-900/10",
        className,
      )}
    >
      {children}
    </div>
  );
}
