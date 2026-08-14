import { publicGames } from "../../data/publicSite";
import { AnimeGridRipple, AnimeMarquee } from "../anime";

const extraTitles = [
  { title: "Cyberpunk 2077", platform: "PC" },
  { title: "FC 26", platform: "PS5" },
  { title: "Mortal Kombat 11", platform: "PS4" },
  { title: "RDR2", platform: "PC" },
  { title: "FIFA 24", platform: "PS5" },
  { title: "Valorant", platform: "PC" },
  { title: "GTA V", platform: "PC" },
];

const nowPlaying = [
  ...publicGames.map((g) => ({ title: g.title, platform: g.platform })),
  ...extraTitles,
];

/**
 * NOW PLAYING - shared video-style LED ticker band.
 * Used on every public page for cross-site consistency.
 */
export function NowPlayingBar({ className = "" }: { className?: string }) {
  return (
    <section
      className={`relative overflow-hidden border-y border-white/5 bg-gz-surface/70 py-5 ${className}`}
    >
      <AnimeGridRipple rows={4} cols={22} color="#EC4899" className="absolute inset-0" />
      <div className="relative z-10 mx-auto flex max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
        <span className="hidden shrink-0 items-center gap-2 rounded-md border border-gz-pink/30 bg-gz-pink/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-gz-pink sm:inline-flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gz-pink shadow-[0_0_8px_rgba(236,72,153,0.9)]" />
          Now Playing
        </span>
        <AnimeMarquee className="flex-1" duration={26000}>
          {nowPlaying.map((g, i) => (
            <span
              key={i}
              className="flex items-center gap-7 text-sm font-semibold uppercase tracking-widest text-white/45"
            >
              <span>{g.title}</span>
              <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-gz-cyan/80">
                {g.platform}
              </span>
              <span className="h-1.5 w-1.5 rotate-45 bg-gradient-to-br from-gz-purple to-gz-pink" />
            </span>
          ))}
        </AnimeMarquee>
      </div>
    </section>
  );
}
