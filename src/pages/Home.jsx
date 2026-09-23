import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import SeriesCard from "@/components/SeriesCard";
import { Image } from "@/components/ui/image";
import { Link } from "react-router-dom";
import { Search, Play, Loader2 } from "lucide-react";

export default function Home() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("Popular");
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Series.list();
        setSeries(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featuredList = useMemo(() => {
    const f = series.filter((s) => s.is_featured);
    return f.length > 0 ? f : series.slice(0, 1);
  }, [series]);

  const genres = useMemo(() => {
    const unique = [...new Set(series.map((s) => s.genre).filter(Boolean))];
    return ["Popular", ...unique];
  }, [series]);

  const filtered = useMemo(() => {
    let list = series;
    if (activeGenre !== "Popular") {
      list = list.filter((s) => s.genre === activeGenre);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q));
    }
    return list;
  }, [series, activeGenre, search]);

  const hero = featuredList[heroIndex];

  useEffect(() => {
    if (featuredList.length <= 1) return;
    const t = setInterval(() => {
      setHeroIndex((i) => (i + 1) % featuredList.length);
    }, 5000);
    return () => clearInterval(t);
  }, [featuredList.length]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#bf95f9]" />
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-semibold text-white">Catalog is empty</p>
        <p className="text-sm text-zinc-400">Add series in admin to see them here.</p>
        <Link to="/admin" className="mt-2 rounded-lg bg-[#bf95f9] px-4 py-2 text-sm font-medium text-white">
          Open Admin
        </Link>
      </div>
    );
  }

  const showHero = !search && activeGenre === "Popular";

  return (
    <div className="pb-24 sm:pb-10">
      {/* Search + Genres */}
      <div className="sticky top-16 z-30 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for more dramas"
              className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 outline-none backdrop-blur-md transition focus:border-[#bf95f9]/50 focus:bg-white/10"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGenre(g)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  activeGenre === g
                    ? "bg-white text-black"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Featured */}
      {showHero && hero && (
        <section className="relative h-[52vh] min-h-[360px] w-full overflow-hidden">
          <Image
            src={hero.backdrop_url || hero.poster_url}
            alt={hero.title}
            className="absolute inset-0 h-full w-full object-cover"
            fittingType="fill"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-10">
            <div className="mx-auto max-w-7xl">
              <div className="mb-3 flex gap-2">
                <span className="rounded-md bg-[#fcd34d] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                  New
                </span>
                {hero.genre && (
                  <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                    {hero.genre}
                  </span>
                )}
              </div>
              <h1 className="max-w-xl text-2xl font-extrabold leading-tight text-white sm:text-4xl">{hero.title}</h1>
              <Link
                to={`/watch/${hero.id}`}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#a8c0ff] to-[#bf95f9] px-7 py-3 text-sm font-bold text-black transition hover:opacity-90"
              >
                <Play className="h-4 w-4 fill-black" /> Play
              </Link>
              {featuredList.length > 1 && (
                <div className="mt-4 flex gap-1.5">
                  {featuredList.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === heroIndex ? "w-6 bg-white" : "w-1.5 bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <h2 className="mb-4 text-lg font-bold text-white">
          {search ? `Results (${filtered.length})` : "Trending Now"}
        </h2>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">Nothing found</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}