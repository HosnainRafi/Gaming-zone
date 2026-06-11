import { AnimatePresence, motion } from "framer-motion";
import { Gamepad2, Search, X, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getGamePlatforms, getGames, type Game } from "../api/games";
const heroBg = "https://wallpapercat.com/w/middle-retina/2/0/8/1143-3840x2160-desktop-4k-fortnite-background-photo.jpg";
import { BlurFade } from "../components/motion";
import { FloatingParticles, SparklesText } from "../components/motion/effects";
import { PublicShell } from "../components/public/PublicShell";

const platformColors: Record<string, { bg: string; text: string; border: string }> = {
  PC: { bg: "bg-cyan-500/15", text: "text-cyan-300", border: "border-cyan-500/30" },
  PS5: { bg: "bg-purple-500/15", text: "text-purple-300", border: "border-purple-500/30" },
  PS4: { bg: "bg-pink-500/15", text: "text-pink-300", border: "border-pink-500/30" },
};
const defaultColors = { bg: "bg-purple-500/15", text: "text-purple-300", border: "border-purple-500/30" };

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [gamesData, platformsData] = await Promise.all([getGames(), getGamePlatforms()]);
        setGames(gamesData);
        setPlatforms(["ALL", ...platformsData]);
      } catch (err) {
        console.error("Failed to fetch games:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: games.length };
    for (const g of games) counts[g.platform] = (counts[g.platform] ?? 0) + 1;
    return counts;
  }, [games]);

  const visibleGames = useMemo(() => {
    let result = games;
    if (filter !== "ALL") result = result.filter((g) => g.platform === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((g) => g.title.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q));
    }
    return result;
  }, [games, filter, search]);

  return (
    <PublicShell>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#080812] py-28 lg:py-36">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover object-center" />
        </div>
        {/* Dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#080812]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
        {/* Colour blobs */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 60% at 80% 40%, rgba(124,58,237,0.3) 0%, transparent 70%)" }} />
        <FloatingParticles count={15} className="opacity-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <BlurFade delay={0.1}>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400">
                <Gamepad2 size={14} /> Elite Gaming Library
              </span>
            </BlurFade>
            <BlurFade delay={0.2}>
              <h1 className="mt-3 font-display text-4xl font-black uppercase text-white sm:text-5xl lg:text-6xl">
                Explore The{" "}
                <SparklesText sparkleCount={6} colors={["#7c3aed", "#06b6d4", "#ec4899", "#ffffff"]} className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  Library
                </SparklesText>
              </h1>
            </BlurFade>
            {!isLoading && (
              <BlurFade delay={0.3}>
                <p className="mx-auto mt-4 max-w-lg text-base text-gray-400">
                  {games.length}+ titles optimized for PS5 and PS4 Pro. Low-latency gaming on ultra-responsive displays.
                </p>
              </BlurFade>
            )}
          </div>

          {/* Search */}
          <BlurFade delay={0.35} className="mx-auto mt-8 max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search games or genres\u2026"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-purple-500/20 bg-purple-500/5 py-3 pl-11 pr-10 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition hover:text-white" aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Glow divider */}
      <div className="glow-divider" />

      {/* Game Grid */}
      <section className="relative bg-[#070710] py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 h-[300px] w-[300px] rounded-full bg-purple-500/8 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Game Selection</h2>
              <p className="mt-1 text-sm text-gray-400">Filter by platform to find your next challenge.</p>
            </div>
            {platforms.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {platforms.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                      filter === item
                        ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/25"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/8"
                    }`}
                  >
                    {item}
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${filter === item ? "bg-white/20 text-white" : "bg-white/10 text-gray-500"}`}>
                      {platformCounts[item] ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-purple-500/30 border-t-purple-500" />
            </div>
          ) : visibleGames.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <Gamepad2 size={36} className="text-purple-600" />
              </div>
              <p className="mt-4 text-base font-semibold text-gray-400">
                {search ? `No games found for "\u201c${search}\u201d"` : games.length === 0 ? "No games available yet." : "No games for this platform."}
              </p>
              {search && <button onClick={() => setSearch("")} className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition">Clear search</button>}
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-semibold text-white">{visibleGames.length}</span> {visibleGames.length === 1 ? "game" : "games"}
                </p>
                {search && (
                  <button onClick={() => setSearch("")} className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition">
                    <X size={12} /> Clear
                  </button>
                )}
              </div>

              <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {visibleGames.map((game) => {
                    const colors = platformColors[game.platform] ?? defaultColors;
                    return (
                      <motion.article
                        key={game.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                        className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0d0d18] transition-all hover:border-purple-500/25 hover:shadow-xl hover:shadow-purple-500/8"
                      >
                        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900">
                          {game.imageUrl ? (
                            <img src={game.imageUrl} alt={game.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500/50 group-hover:text-purple-400 transition-all">
                                <Gamepad2 size={28} />
                              </div>
                            </div>
                          )}
                          {/* Platform badge */}
                          <div className="absolute left-3 top-3">
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase backdrop-blur-sm ${colors.bg} ${colors.text} ${colors.border}`}>
                              {game.platform}
                            </span>
                          </div>
                          {/* Hover overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(0,0,0,0.55)" }}>
                            <span className="rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/30">
                              Play Now
                            </span>
                          </div>
                        </div>

                        {/* Card info */}
                        <div className="p-4">
                          <h3 className="font-semibold text-white line-clamp-1 group-hover:text-purple-100 transition-colors">{game.title}</h3>
                          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">{game.genre}</p>
                        </div>

                        {/* Bottom neon accent */}
                        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/0 to-transparent group-hover:via-purple-500/40 transition-all duration-500" />
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* CTA band */}
      <section className="relative bg-[#080812] py-14 overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-50 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 100% at 50% 50%, rgba(6,182,212,0.1) 0%, transparent 70%)" }} />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center justify-center gap-2 mb-4">
            <Zap size={14} /> Walk-In Welcome
          </p>
          <h2 className="text-2xl font-black uppercase text-white sm:text-3xl">
            Ready to Play?{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Come In Today.
            </span>
          </h2>
          <p className="mt-3 text-gray-400">No appointments needed. Prepaid sessions from 30 minutes.</p>
        </div>
      </section>

    </PublicShell>
  );
}
