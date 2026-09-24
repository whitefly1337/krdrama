import { supabase } from "@/api/supabaseClient";
import { DEMO_MODE, demoGetLibrary, demoToggleLibrary } from "@/lib/demo";

// Every visitor has a Supabase session (anonymous for guests), so bookmarks
// are stored server-side and follow the user when they create an account.
// RLS scopes all queries to the caller's own rows.

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function isBookmarked(seriesId) {
  if (!seriesId) return false;
  if (DEMO_MODE) return demoGetLibrary().includes(seriesId);
  const { data } = await supabase
    .from("user_library")
    .select("series_id")
    .eq("series_id", seriesId)
    .maybeSingle();
  return Boolean(data);
}

export async function toggleBookmarkUtil(seriesId) {
  if (DEMO_MODE) return seriesId ? demoToggleLibrary(seriesId) : false;
  const userId = await currentUserId();
  if (!seriesId || !userId) return false;
  if (await isBookmarked(seriesId)) {
    await supabase.from("user_library").delete().eq("series_id", seriesId);
    return false;
  }
  await supabase.from("user_library").insert({ user_id: userId, series_id: seriesId });
  return true;
}

export async function getBookmarkedSeriesIds() {
  if (DEMO_MODE) return demoGetLibrary();
  const { data, error } = await supabase
    .from("user_library")
    .select("series_id")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data.map((row) => row.series_id);
}
