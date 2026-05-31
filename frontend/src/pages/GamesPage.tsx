import { AnimatePresence, motion } from "framer-motion";
import { Gamepad2, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getGamePlatforms, getGames, type Game } from "../api/games";
import { PublicShell } from "../components/public/PublicShell";

const platformColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  PC: {
    bg: "bg-blue-500/15",
    text: "text-blue-300",
    border: "border-blue-500/30",
  },
  PS5: {
    bg: "bg-indigo-500/15",
    text: "text-indigo-300",
    border: "border-indigo-500/30",
  },
  PS4: {
    bg: "bg-purple-500/15",
    text: "text-purple-300",
    border: "border-purple-500/30",
  },
};

const defaultColors = {
  bg: "bg-green-500/15",
  text: "text-green-300",
  border: "border-green-500/30",
};

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [gamesData, platformsData] = await Promise.all([
          getGames(),
          getGamePlatforms(),
        ]);
        setGames(gamesData);
        setPlatforms(["ALL", ...platformsData]);
      } catch (error) {
        console.error("Failed to fetch games:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: games.length };
    for (const g of games) {
      counts[g.platform] = (counts[g.platform] ?? 0) + 1;
    }
    return counts;
  }, [games]);

  const visibleGames = useMemo(() => {
    let result = games;
    if (filter !== "ALL") {
      result = result.filter((g) => g.platform === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.genre.toLowerCase().includes(q),
      );
    }
    return result;
  }, [games, filter, search]);

  return (
    <PublicShell>
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-[#070b10] py-20 lg:py-28">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-orange-500/4 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-500">
              <Gamepad2 size={14} />
              Elite Gaming Library
            </span>
            <h1 className="mt-3 font-display text-4xl font-black uppercase text-white sm:text-5xl lg:text-6xl">
              Explore The{" "}
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Library
              </span>
            </h1>
            {!isLoading && (
              <p className="mx-auto mt-4 max-w-lg text-base text-gray-400">
                Over {games.length}+ titles optimized for PS5 and PS4 Pro.
                Experience low-latency gaming on ultra-responsive displays.
              </p>
            )}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-8 max-w-md"
          >
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Search games or genres…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-10 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition hover:text-white"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Game Selection with Filters ── */}
      <section className="relative bg-[#0a0e14] py-16 lg:py-20 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header + filter buttons */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                Game Selection
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Filter by category to find your next challenge.
              </p>
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
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
                    }`}
                  >
                    {item}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        filter === item
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-gray-500"
                      }`}
                    >
                      {platformCounts[item] ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Games Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-orange-500/30 border-t-orange-500" />
            </div>
          ) : visibleGames.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
                <Gamepad2 size={36} className="text-gray-600" />
              </div>
              <p className="mt-4 text-base font-semibold text-gray-400">
                {search
                  ? `No games found for "${search}"`
                  : games.length === 0
                    ? "No games available yet."
                    : "No games found for this platform."}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-3 text-sm text-orange-400 transition hover:text-orange-300"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-white">
                    {visibleGames.length}
                  </span>{" "}
                  {visibleGames.length === 1 ? "game" : "games"}
                  {search && (
                    <span className="ml-1 text-gray-600">
                      for &quot;{search}&quot;
                    </span>
                  )}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="flex items-center gap-1 text-xs text-gray-500 transition hover:text-orange-400"
                  >
                    <X size={12} />
                    Clear
                  </button>
                )}
              </div>

              <motion.div
                layout
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {visibleGames.map((game) => {
                    const colors =
                      platformColors[game.platform] ?? defaultColors;
                    return (
                      <motion.article
                        key={game.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ y: -4 }}
                        className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0d1117] transition-all hover:border-orange-500/20 hover:shadow-xl hover:shadow-orange-500/5"
                      >
                        {/* Image */}
                        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900">
                          {game.imageUrl ? (
                            <img
                              src={game.imageUrl}
                              alt={game.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-orange-500/40 group-hover:text-orange-500/70 transition-all">
                                <Gamepad2 size={28} />
                              </div>
                            </div>
                          )}
                          {/* Platform badge */}
                          <div className="absolute left-3 top-3">
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase backdrop-blur-sm ${colors.bg} ${colors.text} ${colors.border}`}
                            >
                              {game.platform}
                            </span>
                          </div>
                          {/* Hover overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <span className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white">
                              Play Now
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <h3 className="font-semibold text-white line-clamp-1 group-hover:text-orange-100 transition-colors">
                            {game.title}
                          </h3>
                          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                            {game.genre}
                          </p>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
