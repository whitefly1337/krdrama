// AdMob rewarded ads → coins. Set this function's URL as the
// "Server-side verification" callback on the rewarded ad unit in AdMob.
// The app passes the Supabase user id as the SSV user id; the coin amount is
// decided in SQL (award_ad_coins), not by the callback.
import { adminClient, isUuid, json } from "../_shared/supabase.ts";
import { verifySsvQuery } from "../_shared/admob.ts";

Deno.serve(async (req) => {
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  try {
    const url = new URL(req.url);
    const rawQuery = url.search.startsWith("?") ? url.search.slice(1) : url.search;

    if (!(await verifySsvQuery(rawQuery))) {
      return json({ error: "invalid_signature" }, 403);
    }

    const params = url.searchParams;
    const allowedUnits = (Deno.env.get("ADMOB_REWARDED_AD_UNIT_IDS") ?? "")
      .split(",")
      .map((s) => s.trim().split("/").pop())
      .filter(Boolean);
    const adUnit = params.get("ad_unit") ?? "";
    if (allowedUnits.length > 0 && !allowedUnits.includes(adUnit)) {
      return json({ error: "unknown_ad_unit" }, 403);
    }

    const userId = params.get("user_id");
    const transactionId = params.get("transaction_id");
    // AdMob's console "verify URL" test sends a signed request without a user.
    if (!isUuid(userId) || !transactionId) return json({ ok: true, skipped: true });

    const admin = adminClient();
    const { data, error } = await admin.rpc("award_ad_coins", {
      p_user: userId,
      p_transaction_id: transactionId,
    });
    if (error) throw error;
    return json(data);
  } catch (e) {
    console.error("admob-ssv", e);
    return json({ error: "internal_error" }, 500);
  }
});
