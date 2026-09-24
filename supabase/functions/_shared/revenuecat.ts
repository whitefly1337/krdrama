import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { requireEnv } from "./supabase.ts";

// The RevenueCat app user id is always the Supabase user id (the app calls
// Purchases.logIn(user.id)), so a subscriber maps 1:1 to auth.users.
//
// Instead of trusting webhook payloads or anything a client sends, we always
// re-read the subscriber from RevenueCat's REST API with our secret key. That
// covers purchases, renewals, cancellations, billing issues, refunds and
// transfers the same way.
export async function syncSubscriber(admin: SupabaseClient, userId: string) {
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return null; // deleted user or foreign id

  const res = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
    { headers: { Authorization: `Bearer ${requireEnv("REVENUECAT_SECRET_KEY")}` } },
  );
  if (!res.ok) {
    throw new Error(`RevenueCat API ${res.status}: ${await res.text()}`);
  }
  const { subscriber } = await res.json();

  const entitlementId = Deno.env.get("REVENUECAT_ENTITLEMENT_ID") ?? "vip";
  const ent = subscriber?.entitlements?.[entitlementId];
  const productId: string | null = ent?.product_identifier ?? null;
  const sub = productId ? subscriber?.subscriptions?.[productId] : null;

  const row = {
    user_id: userId,
    entitlement_active: Boolean(ent),
    product_id: productId,
    store: sub?.store ?? null,
    period_type: sub?.period_type ?? null,
    expires_at: ent?.expires_date ?? null,
    will_renew: sub ? !sub.unsubscribe_detected_at && !sub.billing_issues_detected_at : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await admin
    .from("subscriptions")
    .upsert(row, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function isActive(sub: { entitlement_active: boolean; expires_at: string | null } | null) {
  if (!sub?.entitlement_active) return false;
  return !sub.expires_at || new Date(sub.expires_at) > new Date();
}
