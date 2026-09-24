import { supabase } from "@/api/supabaseClient";
import { DEMO_MODE, demoEpisodeStream, demoListSeries, demoSeriesWithEpisodes } from "@/lib/demo";

// Columns safe for everyone. The video source is never part of these rows;
// it comes from getEpisodeStream() only for entitled viewers.
export const EPISODE_COLUMNS = "id, series_id, title, episode_number, thumbnail_url, duration, is_free";

// Published series, newest first (RLS also shows drafts to admins).
export async function listSeries() {
  if (DEMO_MODE) return demoListSeries();
  const { data, error } = await supabase
    .from("series")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// Series for the given ids, in the same order as `ids`.
export async function getSeriesByIds(ids) {
  if (ids.length === 0) return [];
  const all = DEMO_MODE
    ? demoListSeries()
    : (await supabase.from("series").select("*").in("id", ids)).data ?? [];
  return ids.map((id) => all.find((s) => s.id === id)).filter(Boolean);
}

export async function getSeriesWithEpisodes(seriesId) {
  if (DEMO_MODE) return demoSeriesWithEpisodes(seriesId);
  const [{ data: series, error: seriesError }, { data: episodes, error: episodesError }] =
    await Promise.all([
      supabase.from("series").select("*").eq("id", seriesId).maybeSingle(),
      supabase
        .from("episodes")
        .select(EPISODE_COLUMNS)
        .eq("series_id", seriesId)
        .order("episode_number"),
    ]);
  if (seriesError) throw seriesError;
  if (episodesError) throw episodesError;
  return { series, episodes: episodes ?? [] };
}

const streamCache = new Map();

// Resolves { url } for a playable episode, { locked: true } if the server says
// the viewer isn't entitled, or { error } when there is no video.
export async function getEpisodeStream(episodeId) {
  if (DEMO_MODE) return demoEpisodeStream(episodeId);
  const hit = streamCache.get(episodeId);
  if (hit && hit.until > Date.now()) return { url: hit.url };

  const { data, error } = await supabase.functions.invoke("episode-stream", {
    body: { episode_id: episodeId },
  });
  if (error) {
    const status = error.context?.status;
    return { error: status === 404 ? "no_video" : "failed" };
  }
  if (data?.locked) return { locked: true };

  // Refresh signed URLs 5 minutes before they expire.
  const until = data.expires_in ? Date.now() + (data.expires_in - 300) * 1000 : Infinity;
  streamCache.set(episodeId, { url: data.url, until });
  return { url: data.url };
}

export function forgetEpisodeStreams() {
  streamCache.clear();
}
