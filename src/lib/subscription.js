import { base44 } from "@/api/base44Client";

// Check if the current user has an active subscription.
// Returns the Subscription record if active, or null.
export async function checkActiveSubscription() {
  try {
    const me = await base44.auth.me();
    const subs = await base44.entities.Subscription.filter({ user_id: me.id, status: "active" });
    const active = subs.find((s) => !s.end_date || new Date(s.end_date) >= new Date());
    return active || null;
  } catch {
    return null;
  }
}