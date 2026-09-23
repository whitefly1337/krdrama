import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { User, LogOut, Coins, Gift, Bookmark, Bell, MessageSquare, Settings, Copy, ChevronRight } from "lucide-react";
import { isNativePlatform } from "@/lib/admob";
import { getGuestUid } from "@/lib/guest";
import { getBalance } from "@/lib/coins";
import VipBanner from "@/components/profile/VipBanner";

export default function Profile() {
  const [me, setMe] = useState(null);
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coinBalance, setCoinBalance] = useState(0);
  const [guestUid] = useState(getGuestUid);
  const [copied, setCopied] = useState(false);

  const isGuest = !me;

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        setMe(user);
        const subs = await base44.entities.Subscription.filter({ user_id: user.id, status: "active" });
        const active = subs.find((s) => !s.end_date || new Date(s.end_date) >= new Date());
        setSub(active || null);
      } catch (e) {
        // Guest user — not authenticated
      } finally {
        setCoinBalance(getBalance());
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const copyUid = () => {
    navigator.clipboard?.writeText(guestUid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-amber-500" />
      </div>
    );
  }

  const displayName = me?.full_name || "Гость";

  const menuItems = [
    { icon: Gift, label: "Награды", to: "/subscribe" },
    { icon: Bookmark, label: "Мой список", to: "/my" },
    { icon: Bell, label: "Уведомления" },
    { icon: MessageSquare, label: "Обратная связь" },
    { icon: Settings, label: "Настройки" },
  ];

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      {/* User header */}
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/20 ring-1 ring-amber-500/30">
          <User className="h-8 w-8 text-amber-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{displayName}</h1>
          <button onClick={copyUid} className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
            UID: {guestUid}
            <Copy className="h-3 w-3" />
            {copied && <span className="text-emerald-400">✓</span>}
          </button>
        </div>
        {isGuest && (
          <Link
            to="/login"
            className="rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white ring-1 ring-white/15"
          >
            Войти
          </Link>
        )}
      </div>

      {/* Promo text for guests */}
      {isGuest && (
        <p className="mt-3 text-sm text-amber-300/80">
          Бонус 35 монет за первый вход уже начислен!
        </p>
      )}

      {/* VIP Banner */}
      {!sub && <VipBanner />}

      {/* Wallet */}
      <div className="mt-4 rounded-2xl bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-400" />
            <span className="text-sm font-medium text-white">Мой кошелёк</span>
          </div>
          <span className="text-2xl font-bold text-amber-400">{coinBalance}</span>
        </div>
        {isNativePlatform() && (
          <button className="mt-3 w-full rounded-full bg-amber-400 py-2.5 text-sm font-bold text-black">
            Пополнить
          </button>
        )}
      </div>

      {/* Menu list */}
      <div className="mt-4 space-y-1">
        {menuItems.map((item) => {
          const content = (
            <>
              <item.icon className="h-5 w-5 text-zinc-400" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-zinc-600" />
            </>
          );
          if (item.to) {
            return (
              <Link key={item.label} to={item.to} className="flex items-center gap-3 rounded-xl px-2 py-3.5 text-sm text-white hover:bg-white/5">
                {content}
              </Link>
            );
          }
          return (
            <div key={item.label} className="flex items-center gap-3 rounded-xl px-2 py-3.5 text-sm text-white">
              {content}
            </div>
          );
        })}
      </div>

      {/* Logout for authenticated users */}
      {me && (
        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-3.5 text-sm font-medium text-zinc-300"
        >
          <LogOut className="h-4 w-4" /> Выйти
        </button>
      )}
    </div>
  );
}