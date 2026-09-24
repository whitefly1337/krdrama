// Returns a playable URL for an episode, but only to callers entitled to it
// (free episode, VIP subscription, coin unlock, or admin).
import { adminClient, corsHeaders, getCaller, isUuid, json } from "../_shared/supabase.ts";

const SIGNED_URL_TTL_SECONDS = 3 * 60 * 60;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const admin = adminClient();
    const caller = await getCaller(req, admin);
    const { episode_id } = await req.json().catch(() => ({}));
    if (!isUuid(episode_id)) return json({ error: "invalid_episode_id" }, 400);

    const { data: allowed, error: rpcError } = await admin.rpc("can_watch_episode", {
      p_user: caller?.id ?? null,
      p_episode_id: episode_id,
    });
    if (rpcError) throw rpcError;
    if (!allowed) return json({ locked: true });

    const { data: media } = await admin
      .from("episode_media")
      .select("video_source")
      .eq("episode_id", episode_id)
      .maybeSingle();
    const source = media?.video_source?.trim();
    if (!source) return json({ error: "no_video" }, 404);

    if (/^https?:\/\//i.test(source)) {
      return json({ url: source, expires_in: null });
    }

    const { data: signed, error } = await admin.storage
      .from("videos")
      .createSignedUrl(source, SIGNED_URL_TTL_SECONDS);
    if (error || !signed) throw error ?? new Error("signing failed");
    return json({ url: signed.signedUrl, expires_in: SIGNED_URL_TTL_SECONDS });
  } catch (e) {
    console.error("episode-stream", e);
    return json({ error: "internal_error" }, 500);
  }
});
