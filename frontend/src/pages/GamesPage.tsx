import { Gamepad2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getGamePlatforms, getGames, type Game } from "../api/games";
import { PublicShell } from "../components/public/PublicShell";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [filter, setFilter] = useState("ALL");
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

  const visibleGames = useMemo(() => {
    if (filter === "ALL") return games;
    return games.filter((game) => game.platform === filter);
  }, [games, filter]);

  return (
    <PublicShell>
      {/* Header Section */}
      <section className="bg-[#0a0e14] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
              GAME LIBRARY
            </h1>
          </div>

          {/* Filter Tabs */}
          {platforms.length > 1 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {platforms.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                    filter === item
                      ? "bg-orange-500 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Games Grid */}
      <section className="bg-[#0c1016] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
          ) : visibleGames.length === 0 ? (
            <div className="py-20 text-center">
              <Gamepad2 size={48} className="mx-auto text-gray-600" />
              <p className="mt-4 text-lg text-gray-400">
                {games.length === 0
                  ? "No games available."
                  : "No games found for this platform."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleGames.map((game) => (
                <article
                  key={game.id}
                  className="group overflow-hidden rounded-2xl border border-white/5 bg-[#0a0e14] transition-all hover:border-orange-500/30"
                >
                  {/* Game Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                    {game.imageUrl ? (
                      <img
                        src={game.imageUrl}
                        alt={game.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-orange-500/50 transition-colors group-hover:bg-orange-500/10 group-hover:text-orange-500">
                          <Gamepad2 size={32} />
                        </div>
                      </div>
                    )}
                    {/* Platform Badge */}
                    <div className="absolute left-3 top-3">
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                          game.platform === "PC"
                            ? "bg-blue-500/20 text-blue-400"
                            : game.platform === "PS4" || game.platform === "PS5"
                              ? "bg-indigo-500/20 text-indigo-400"
                              : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {game.platform}
                      </span>
                    </div>
                  </div>

                  {/* Game Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white line-clamp-1">
                      {game.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{game.genre}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
