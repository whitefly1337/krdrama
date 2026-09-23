import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import VerticalPlayer from "@/components/VerticalPlayer";
import HorizontalPlayer from "@/components/HorizontalPlayer";
import { Loader2, Lock, Crown } from "lucide-react";

export default function Watch() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSub, setHasSub] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await base44.entities.Series.get(id);
        setSeries(s);
        const eps = await base44.entities.Episode.filter({ series_id: id });
        eps.sort((a, b) => a.episode_number - b.episode_number);
        eps.forEach((e) => (e.series_title = s.title));
        setEpisodes(eps);

        try {
          const me = await base44.auth.me();
          const subs = await base44.entities.Subscription.filter({ user_id: me.id, status: "active" });
          const active = subs.find((su) => !su.end_date || new Date(su.end_date) >= new Date());
          setHasSub(!!active);
        } catch {
          setHasSub(false);
        }
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

  const epNum = parseInt(params.get("ep") || "1", 10);
  const startIndex = Math.max(0, episodes.findIndex((e) => e.episode_number === epNum));
  const current = episodes[startIndex];

  if (!hasSub && current && !current.is_free) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-600/20">
          <Lock className="h-8 w-8 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-white">This episode requires a subscription</h1>
        <p className="max-w-md text-sm text-zinc-400">
          Get a monthly subscription to watch all episodes without limits.
        </p>
        <button
          onClick={() => navigate("/subscribe")}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-6 py-3 text-sm font-bold text-white hover:bg-rose-700"
        >
          <Crown className="h-4 w-4" /> Get Subscription
        </button>
        <Link to={`/series/${id}`} className="text-sm text-zinc-400 underline">Back to series</Link>
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold text-white">Episodes not yet uploaded</p>
        <Link to={`/series/${id}`} className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white">Back</Link>
      </div>
    );
  }

  return (
    <div className={series.format === "vertical" ? "" : "pb-20 sm:pb-10"}>
      {series.format === "vertical" ? (
        <VerticalPlayer
          episodes={episodes}
          startIndex={startIndex}
          series={series}
          hasSub={hasSub}
          onBack={() => navigate(`/series/${id}`)}
        />
      ) : (
        <HorizontalPlayer episodes={episodes} startIndex={startIndex} />
      )}
    </div>
  );
}