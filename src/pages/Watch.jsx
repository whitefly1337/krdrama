import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import VerticalPlayer from "@/components/VerticalPlayer";
import HorizontalPlayer from "@/components/HorizontalPlayer";
import { Loader2 } from "lucide-react";
import { getSeriesWithEpisodes } from "@/lib/episodes";
import { getUnlockedEpisodeIds } from "@/lib/coins";
import { getActiveSubscription } from "@/lib/subscription";
import { useAuth } from "@/lib/AuthContext";

export default function Watch() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSub, setHasSub] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState(new Set());
  const [accessLoaded, setAccessLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { series: s, episodes: eps } = await getSeriesWithEpisodes(id);
        setSeries(s);
        setEpisodes(eps.map((e) => ({ ...e, series_title: s?.title })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Entitlements for the current (possibly anonymous) user. Only decides what
  // the UI shows; episode-stream enforces access on the server.
  useEffect(() => {
    (async () => {
      const [sub, unlocks] = await Promise.all([
        getActiveSubscription(),
        getUnlockedEpisodeIds().catch(() => new Set()),
      ]);
      setHasSub(Boolean(sub));
      setUnlockedIds(unlocks);
      setAccessLoaded(true);
    })();
  }, [user?.id]);

  const isLocked = useCallback(
    (ep) => !ep.is_free && !hasSub && !unlockedIds.has(ep.id),
    [hasSub, unlockedIds]
  );
  const onUnlocked = useCallback(
    (episodeId) => setUnlockedIds((prev) => new Set([...prev, episodeId])),
    []
  );

  if (loading || !accessLoaded) {
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

  if (episodes.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold text-white">Episodes not yet uploaded</p>
        <Link to={`/series/${id}`} className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white">Back</Link>
      </div>
    );
  }

  const epNum = parseInt(params.get("ep") || "1", 10);
  const startIndex = Math.max(0, episodes.findIndex((e) => e.episode_number === epNum));

  return (
    <div className={series.format === "vertical" ? "" : "pb-20 sm:pb-10"}>
      {series.format === "vertical" ? (
        <VerticalPlayer
          episodes={episodes}
          startIndex={startIndex}
          series={series}
          isLocked={isLocked}
          onUnlocked={onUnlocked}
          onBack={() => navigate(`/series/${id}`)}
        />
      ) : (
        <HorizontalPlayer
          episodes={episodes}
          startIndex={startIndex}
          seriesId={id}
          isLocked={isLocked}
          onUnlocked={onUnlocked}
        />
      )}
    </div>
  );
}
