import { Menu } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    return () => {
      document.documentElement.classList.remove("light");
    };
  }, [theme]);

  return (
    <div className="relative flex h-screen overflow-hidden bg-gz-bg">
      {mobileExpanded && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileExpanded(false)}
        />
      )}
      <Sidebar
        mobileExpanded={mobileExpanded}
        onToggleMobile={() => setMobileExpanded((current) => !current)}
        onNavigateMobile={() => setMobileExpanded(false)}
      />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 border-b border-gz-border bg-gz-bg/95 px-4 py-3 backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setMobileExpanded(true)}
            aria-label="Open navigation menu"
            className="inline-flex items-center gap-2 rounded-lg border border-gz-border bg-gz-surface px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-violet-500/40 hover:text-white"
          >
            <Menu size={18} />
            Menu
          </button>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
