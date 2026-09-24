// Called by the app right after a purchase or restore so VIP turns on
// immediately instead of waiting for the RevenueCat webhook.
import { adminClient, corsHeaders, getCaller, json } from "../_shared/supabase.ts";
import { isActive, syncSubscriber } from "../_shared/revenuecat.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const admin = adminClient();
    const caller = await getCaller(req, admin);
    if (!caller) return json({ error: "unauthorized" }, 401);

    const subscription = await syncSubscriber(admin, caller.id);
    return json({ active: isActive(subscription), subscription });
  } catch (e) {
    console.error("sync-subscription", e);
    return json({ error: "internal_error" }, 500);
  }
});
