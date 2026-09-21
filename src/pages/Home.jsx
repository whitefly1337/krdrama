import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SeriesCard from "@/components/SeriesCard";
import { Image } from "@/components/ui/image";
import { Link } from "react-router-dom";
import { Play, Loader2 } from "lucide-react";

export default function Home() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const featured = series.find((s) => s.is_featured) || series[0];
  const rest = series.filter((s) => s.id !== featured?.id);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-semibold text-white">Каталог пока пуст</p>
        <p className="text-sm text-zinc-400">Добавьте сериалы в админке, чтобы они появились здесь.</p>
        <Link to="/admin" className="mt-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white">
          Открыть админку
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 sm:pb-10">
      {/* Hero */}
      {featured && (
        <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
          <Image
            src={featured.backdrop_url || featured.poster_url}
            alt={featured.title}
            className="absolute inset-0 h-full w-full object-cover"
            fittingType="fill"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 to-transparent" />
          <div className="absolute bottom-0 left-0 max-w-2xl p-6 sm:p-10">
            <span className="mb-3 inline-block rounded-md bg-rose-600 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Рекомендуем
            </span>
            <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">{featured.title}</h1>
            {featured.genre && <p className="mt-2 text-sm text-rose-300">{featured.genre}</p>}
            <p className="mt-3 line-clamp-3 max-w-xl text-sm text-zinc-300 sm:text-base">{featured.description}</p>
            <div className="mt-5 flex gap-3">
              <Link
                to={`/watch/${featured.id}`}
                className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-zinc-200"
              >
                <Play className="h-4 w-4 fill-black" /> Смотреть
              </Link>
              <Link
                to={`/series/${featured.id}`}
                className="rounded-lg bg-white/15 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/25"
              >
                Подробнее
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Catalog */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="mb-4 text-xl font-bold text-white">Все сериалы</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {rest.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      </section>
    </div>
  );
}