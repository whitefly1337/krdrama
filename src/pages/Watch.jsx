import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import VerticalPlayer from "@/components/VerticalPlayer";
import HorizontalPlayer from "@/components/HorizontalPlayer";
import PenguinLoader from "@/components/PenguinLoader";
import LockedEpisodeScreen from "@/components/LockedEpisodeScreen";

export default function Watch() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSub, setHasSub] = useState(null);
  const [unlockedIds, setUnlockedIds] = useState(new Set());

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
          const unlocks = await base44.entities.EpisodeUnlock.filter({ user_id: me.id });
          setUnlockedIds(new Set(unlocks.map((u) => u.episode_id)));
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
      <PenguinLoader />
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

  if (!hasSub && current && !current.is_free && !unlockedIds.has(current.id)) {
    return (
      <LockedEpisodeScreen
        episode={current}
        seriesId={id}
        onUnlock={() => setUnlockedIds((prev) => new Set([...prev, current.id]))}
      />
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