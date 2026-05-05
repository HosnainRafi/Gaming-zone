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
    text: "text-blue-400",
    border: "border-blue-500/25",
  },
  PS5: {
    bg: "bg-indigo-500/15",
    text: "text-indigo-400",
    border: "border-indigo-500/25",
  },
  PS4: {
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    border: "border-purple-500/25",
  },
};

const defaultColors = {
  bg: "bg-green-500/15",
  text: "text-green-400",
  border: "border-green-500/25",
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
      {/* Header */}
      <section className="relative overflow-hidden bg-[#070b10] py-20 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.07)_0%,_transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Game Library
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              All <span className="text-orange-500">Games</span>
            </h1>
            {!isLoading && (
              <p className="mt-4 text-sm text-gray-400">
                {games.length} titles across {platforms.length - 1} platforms
              </p>
            )}

            {/* Search */}
            <div className="mx-auto mt-8 max-w-md">
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
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-10 text-sm text-white placeholder-gray-500 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
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
            </div>
          </div>

          {/* Filter Tabs */}
          {platforms.length > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {platforms.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                    filter === item
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
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
      </section>

      {/* Games Grid */}
      <section className="bg-[#0c1018] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
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

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleGames.map((game) => {
                  const colors =
                    platformColors[game.platform] ?? defaultColors;
                  return (
                    <article
                      key={game.id}
                      className="group overflow-hidden rounded-2xl border border-white/5 bg-[#0a0e14] transition-all hover:-translate-y-1 hover:border-orange-500/25 hover:shadow-xl hover:shadow-black/40"
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
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-orange-500/40 transition-all group-hover:bg-orange-500/10 group-hover:text-orange-500/70">
                              <Gamepad2 size={28} />
                            </div>
                          </div>
                        )}
                        {/* Platform badge */}
                        <div className="absolute left-3 top-3">
                          <span
                            className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            {game.platform}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14]/70 via-transparent to-transparent" />
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-white line-clamp-1 transition-colors group-hover:text-orange-100">
                          {game.title}
                        </h3>
                        <p className="mt-1 text-xs font-medium text-gray-500">
                          {game.genre}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
