// RevenueCat → Supabase. Configure in RevenueCat: Integrations → Webhooks,
// URL https://<project>.supabase.co/functions/v1/revenuecat-webhook and
// Authorization header value "Bearer <REVENUECAT_WEBHOOK_AUTH>".
import { adminClient, isUuid, json, requireEnv, safeEqual } from "../_shared/supabase.ts";
import { syncSubscriber } from "../_shared/revenuecat.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const expected = `Bearer ${requireEnv("REVENUECAT_WEBHOOK_AUTH")}`;
  if (!safeEqual(req.headers.get("Authorization") ?? "", expected)) {
    return json({ error: "unauthorized" }, 401);
  }

  try {
    const { event } = await req.json();
    if (!event) return json({ error: "bad_request" }, 400);

    // TRANSFER events move purchases between users; refresh everyone involved.
    const ids = new Set<string>(
      [
        event.app_user_id,
        event.original_app_user_id,
        ...(event.aliases ?? []),
        ...(event.transferred_from ?? []),
        ...(event.transferred_to ?? []),
      ].filter(isUuid),
    );

    const admin = adminClient();
    for (const id of ids) {
      await syncSubscriber(admin, id);
    }
    return json({ ok: true, synced: ids.size });
  } catch (e) {
    console.error("revenuecat-webhook", e);
    // Non-2xx makes RevenueCat retry later.
    return json({ error: "internal_error" }, 500);
  }
});
