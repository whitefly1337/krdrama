import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Play, Loader2, ArrowLeft, Lock } from "lucide-react";

export default function SeriesDetail() {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await base44.entities.Series.get(id);
        setSeries(s);
        const eps = await base44.entities.Episode.filter({ series_id: id });
        eps.sort((a, b) => a.episode_number - b.episode_number);
        setEpisodes(eps);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold text-white">Series not found</p>
        <Link to="/" className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="pb-20 sm:pb-10">
      <div className="relative h-[50vh] min-h-[320px] w-full overflow-hidden">
        <Image
          src={series.backdrop_url || series.poster_url}
          alt={series.title}
          className="absolute inset-0 h-full w-full object-cover"
          fittingType="fill"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        <div className="absolute left-4 top-4">
          <Link to="/" className="flex items-center gap-1 rounded-lg bg-black/50 px-3 py-1.5 text-sm text-white backdrop-blur">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </div>

      <div className="mx-auto -mt-24 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="w-40 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 sm:w-48">
            <Image src={series.poster_url} alt={series.title} className="aspect-[2/3] w-full" fittingType="fill" />
          </div>
          <div className="flex-1 pt-2">
            <h1 className="text-2xl font-extrabold text-white sm:text-4xl">{series.title}</h1>
            {series.genre && <p className="mt-1 text-sm text-rose-300">{series.genre}</p>}
            <p className="mt-3 max-w-2xl text-sm text-zinc-300">{series.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-400">
              <span className="rounded-md bg-white/10 px-2 py-1">
                {series.format === "vertical" ? "Vertical format" : "Horizontal format"}
              </span>
              <span className="rounded-md bg-white/10 px-2 py-1">{episodes.length} episodes</span>
            </div>
            <Link
              to={`/watch/${series.id}`}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
            >
              <Play className="h-4 w-4 fill-white" /> Start Watching
            </Link>
          </div>
        </div>

        <h2 className="mb-3 mt-10 text-lg font-bold text-white">Episodes</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {episodes.map((ep) => (
            <Link
              key={ep.id}
              to={`/watch/${series.id}?ep=${ep.episode_number}`}
              className="group flex gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/5 transition hover:bg-white/10"
            >
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                {ep.thumbnail_url && (
                  <Image src={ep.thumbnail_url} alt={ep.title} className="h-full w-full" fittingType="fill" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="h-6 w-6 fill-white text-white" />
                </div>
                {ep.is_free ? (
                  <span className="absolute bottom-1 left-1 rounded bg-emerald-600 px-1 text-[9px] font-bold text-white">FREE</span>
                ) : (
                  <span className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded bg-rose-600 px-1 text-[9px] font-bold text-white">
                    <Lock className="h-2 w-2" /> PRO
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-zinc-500">Episode {ep.episode_number}</p>
                <p className="line-clamp-2 text-sm font-medium text-white">{ep.title}</p>
                {ep.duration > 0 && <p className="mt-1 text-xs text-zinc-500">{Math.round(ep.duration / 60)} min</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}