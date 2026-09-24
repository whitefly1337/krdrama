import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adsAvailable, showRewardedAd } from "@/lib/admob";
import {
  getBalance,
  unlockEpisode,
  waitForBalanceAbove,
  COINS_PER_AD,
  COINS_PER_EPISODE,
} from "@/lib/coins";
import { useAuth } from "@/lib/AuthContext";
import { Lock, Crown, Coins, Play, Loader2 } from "lucide-react";

export default function LockedEpisodeScreen({ episode, seriesId, onUnlock }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const ads = adsAvailable();

  useEffect(() => {
    getBalance().then(setBalance).catch(() => setBalance(0));
  }, [user?.id]);

  const handleWatchAd = async () => {
    setBusy("ad");
    setError("");
    setNotice("");
    try {
      const before = balance ?? (await getBalance());
      const rewarded = await showRewardedAd(user.id);
      if (!rewarded) {
        setError("Watch the whole ad to earn coins.");
        return;
      }
      // Coins arrive via AdMob's server-side callback, usually within seconds.
      setNotice("Adding your coins…");
      const next = await waitForBalanceAbove(before);
      if (next === null) {
        setNotice("");
        setError("We couldn't confirm the reward yet. It can take a minute; the daily limit is 20 ads.");
      } else {
        setNotice("");
        setBalance(next);
      }
    } catch (e) {
      setNotice("");
      setError("Ad not available. Try again later.");
    } finally {
      setBusy(null);
    }
  };

  const handleSpendCoins = async () => {
    setBusy("coins");
    setError("");
    try {
      const res = await unlockEpisode(episode.id);
      if (res.success) {
        setBalance(res.balance);
        onUnlock();
      } else {
        if (typeof res.balance === "number") setBalance(res.balance);
        setError(res.error === "insufficient_balance" ? "Not enough coins" : "Failed to unlock. Try again.");
      }
    } catch (e) {
      setError("Failed to unlock. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const canAfford = balance !== null && balance >= COINS_PER_EPISODE;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-600/20">
        <Lock className="h-8 w-8 text-rose-500" />
      </div>
      <h1 className="text-2xl font-bold text-white">Unlock episode {episode.episode_number}</h1>

      {balance !== null && (
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
          <Coins className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-medium text-white">{balance} coins</span>
        </div>
      )}

      <div className="flex w-full max-w-xs flex-col gap-3">
        {ads && (
          <button
            onClick={handleWatchAd}
            disabled={busy !== null}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/10 p-4 text-sm font-bold text-white hover:bg-white/15 disabled:opacity-50"
          >
            {busy === "ad" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
            Watch Ad (+{COINS_PER_AD} coins)
          </button>
        )}
        <button
          onClick={handleSpendCoins}
          disabled={busy !== null || !canAfford}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 p-4 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-40"
        >
          {busy === "coins" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Coins className="h-5 w-5" />}
          Unlock with {COINS_PER_EPISODE} coins
        </button>
        <div className="my-1 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-zinc-500">OR</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <Link
          to="/subscribe"
          className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 p-4 text-sm font-bold text-white hover:bg-rose-700"
        >
          <Crown className="h-5 w-5" /> Get VIP — all episodes
        </Link>
      </div>

      {notice && <p className="text-sm text-zinc-400">{notice}</p>}
      {error && <p className="max-w-xs text-sm text-rose-400">{error}</p>}
      <Link to={`/series/${seriesId}`} className="text-sm text-zinc-400 underline">
        Back to series
      </Link>
    </div>
  );
}
