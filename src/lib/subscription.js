import { supabase } from "@/api/supabaseClient";
import { DEMO_MODE, demoGetSubscription } from "@/lib/demo";

// "krd.vip.yearly" → "Yearly" etc., for display.
export function planLabel(productId) {
  if (!productId) return "VIP";
  if (/year|annual/i.test(productId)) return "Yearly";
  if (/month/i.test(productId)) return "Monthly";
  if (/week/i.test(productId)) return "Weekly";
  return "VIP";
}

export function isSubscriptionActive(sub) {
  if (!sub?.entitlement_active) return false;
  return !sub.expires_at || new Date(sub.expires_at) > new Date();
}

// The current user's VIP subscription if active, else null. RLS limits the
// query to the caller's own row.
export async function getActiveSubscription() {
  if (DEMO_MODE) return demoGetSubscription();
  const { data, error } = await supabase.from("subscriptions").select("*").maybeSingle();
  if (error) {
    console.error(error);
    return null;
  }
  return isSubscriptionActive(data) ? data : null;
}
