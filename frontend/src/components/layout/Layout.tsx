import { type ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: ReactNode }) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

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
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
