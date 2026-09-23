import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { isNativePlatform, showRewardedVideoAd } from "@/lib/admob";
import { getBalance, addCoins, spendCoins as spendCoinsLocal, COINS_PER_AD, COINS_PER_EPISODE } from "@/lib/coins";
import { Lock, Crown, Coins, Play, Loader2 } from "lucide-react";

// Replace with your AdMob Rewarded ad unit ID from the AdMob dashboard
const AD_UNIT_ID = "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX";

export default function LockedEpisodeScreen({ episode, seriesId, onUnlock }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const native = isNativePlatform();

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = () => {
    setBalance(getBalance());
  };

  const handleWatchAd = async () => {
    setLoading(true);
    setError("");
    try {
      await showRewardedVideoAd(AD_UNIT_ID);
      const newBalance = addCoins(COINS_PER_AD);
      setBalance(newBalance);
    } catch (e) {
      setError("Ad not available. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSpendCoins = async () => {
    setLoading(true);
    setError("");
    try {
      const res = spendCoinsLocal(COINS_PER_EPISODE, episode.id);
      if (res.success) {
        setBalance(res.balance);
        onUnlock();
      } else {
        setError(res.error || "Not enough coins");
      }
    } catch (e) {
      setError("Failed to unlock. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const canAfford = balance !== null && balance >= COINS_PER_EPISODE;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-600/20">
        <Lock className="h-8 w-8 text-rose-500" />
      </div>
      <h1 className="text-2xl font-bold text-white">Unlock this episode</h1>

      {native && balance !== null && (
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
          <Coins className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-medium text-white">{balance} coins</span>
        </div>
      )}

      {native ? (
        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={handleWatchAd}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/10 p-4 text-sm font-bold text-white hover:bg-white/15 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
            Watch Ad (+{COINS_PER_AD} coins)
          </button>
          <button
            onClick={handleSpendCoins}
            disabled={loading || !canAfford}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 p-4 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-40"
          >
            <Coins className="h-5 w-5" />
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
            <Crown className="h-5 w-5" /> Get Subscription
          </Link>
        </div>
      ) : (
        <div className="flex w-full max-w-xs flex-col gap-3">
          <p className="text-sm text-zinc-400">
            Get a monthly subscription to watch all episodes without limits.
          </p>
          <Link
            to="/subscribe"
            className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 p-4 text-sm font-bold text-white hover:bg-rose-700"
          >
            <Crown className="h-5 w-5" /> Get Subscription
          </Link>
        </div>
      )}

      {error && <p className="text-sm text-rose-400">{error}</p>}
      <Link to={`/series/${seriesId}`} className="text-sm text-zinc-400 underline">
        Back to series
      </Link>
    </div>
  );
}