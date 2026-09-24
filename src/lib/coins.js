import { supabase } from "@/api/supabaseClient";
import { DEMO_MODE, demoGetBalance, demoGetUnlocks, demoUnlockEpisode } from "@/lib/demo";

// Display only. The authoritative values live in the SQL functions in
// supabase/migrations (handle_new_user, award_ad_coins, unlock_episode).
export const COINS_PER_AD = 10;
export const COINS_PER_EPISODE = 50;
export const COINS_FIRST_ENTRY = 35;

export async function getBalance() {
  if (DEMO_MODE) return demoGetBalance();
  const { data, error } = await supabase.from("wallets").select("balance").maybeSingle();
  if (error) throw error;
  return data?.balance ?? 0;
}

export async function getUnlockedEpisodeIds() {
  if (DEMO_MODE) return demoGetUnlocks();
  const { data, error } = await supabase.from("episode_unlocks").select("episode_id");
  if (error) throw error;
  return new Set(data.map((u) => u.episode_id));
}

// Server-side, atomic. Returns { success, balance, already_unlocked?, error? }.
export async function unlockEpisode(episodeId) {
  if (DEMO_MODE) return demoUnlockEpisode(episodeId, COINS_PER_EPISODE);
  const { data, error } = await supabase.rpc("unlock_episode", { p_episode_id: episodeId });
  if (error) throw error;
  return data;
}

// AdMob credits coins through a server-to-server callback a few seconds after
// the ad, so poll until the balance moves.
export async function waitForBalanceAbove(previous, { timeoutMs = 20000, intervalMs = 1500 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, intervalMs));
    const balance = await getBalance();
    if (balance > previous) return balance;
  }
  return null;
}
