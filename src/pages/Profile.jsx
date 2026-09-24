import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Browser } from "@capacitor/browser";
import { supabase } from "@/api/supabaseClient";
import {
  User, LogOut, Coins, Crown, Bookmark, MessageSquare, Shield, FileText, Trash2, Copy, Check,
  ChevronRight, Play, Loader2, Film, LayoutDashboard, Sparkles,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/AuthContext";
import { adsAvailable, showRewardedAd } from "@/lib/admob";
import {
  getBalance, getUnlockedEpisodeIds, waitForBalanceAbove, COINS_FIRST_ENTRY, COINS_PER_AD,
} from "@/lib/coins";
import { getBookmarkedSeriesIds } from "@/lib/bookmarks";
import { getActiveSubscription } from "@/lib/subscription";
import { getAppleAuthorizationCode } from "@/lib/socialAuth";
import { config } from "@/lib/config";
import { isIOS, isNative } from "@/lib/platform";
import VipBanner from "@/components/profile/VipBanner";
import MembershipCard from "@/components/vip/MembershipCard";

function openExternal(url) {
  if (isNative()) Browser.open({ url });
  else window.open(url, "_blank", "noopener");
}

// iOS-style inset grouped list.
function Group({ title, children }) {
  return (
    <section className="mt-6">
      {title && <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h2>}
      <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.04]">
        {children}
      </div>
    </section>
  );
}

function Row({ icon: Icon, color, label, hint, to, onClick, danger }) {
  const content = (
    <>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </span>
      <span className={`flex-1 text-left text-[15px] ${danger ? "text-rose-400" : "text-white"}`}>{label}</span>
      {hint && <span className="max-w-[45%] truncate text-xs text-zinc-500">{hint}</span>}
      {!danger && <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600" />}
    </>
  );
  const cls = "flex w-full items-center gap-3 px-3 py-3 transition active:bg-white/5";
  return to ? (
    <Link to={to} className={cls}>
      {content}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {content}
    </button>
  );
}

function Stat({ icon: Icon, value, label, tint, to }) {
  const cls =
    "flex flex-col items-start rounded-2xl border border-white/5 bg-white/[0.04] p-3 backdrop-blur-xl transition active:scale-[0.98]";
  const content = (
    <>
      <Icon className={`h-5 w-5 ${tint}`} />
      <span className="mt-2 text-xl font-extrabold tabular-nums text-white">{value}</span>
      <span className="text-[11px] text-zinc-500">{label}</span>
    </>
  );
  return to ? (
    <Link to={to} className={cls}>
      {content}
    </Link>
  ) : (
    <div className={cls}>{content}</div>
  );
}

export default function Profile() {
  const { user, profile, isAnonymous, isAdmin, logout } = useAuth();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coinBalance, setCoinBalance] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [libraryCount, setLibraryCount] = useState(0);
  const [adBusy, setAdBusy] = useState(false);
  const [adMessage, setAdMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [active, balance, unlocks, library] = await Promise.all([
          getActiveSubscription(),
          getBalance().catch(() => 0),
          getUnlockedEpisodeIds().catch(() => new Set()),
          getBookmarkedSeriesIds().catch(() => []),
        ]);
        setSub(active);
        setCoinBalance(balance);
        setUnlockedCount(unlocks.size);
        setLibraryCount(library.length);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const shortUid = user?.id ? user.id.slice(0, 8).toUpperCase() : "GUEST";

  const copyUid = () => {
    if (!user) return;
    navigator.clipboard?.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const watchAd = async () => {
    setAdBusy(true);
    setAdMessage("");
    try {
      const rewarded = await showRewardedAd(user.id);
      if (!rewarded) {
        setAdMessage("Досмотрите рекламу до конца, чтобы получить монеты.");
        return;
      }
      setAdMessage("Начисляем монеты…");
      const next = await waitForBalanceAbove(coinBalance);
      if (next === null) {
        setAdMessage("Не удалось подтвердить награду. Лимит — 20 роликов в сутки.");
      } else {
        setCoinBalance(next);
        setAdMessage("");
      }
    } catch {
      setAdMessage("Реклама сейчас недоступна. Попробуйте позже.");
    } finally {
      setAdBusy(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      // Apple requires revoking Sign in with Apple tokens on deletion; that
      // needs a fresh authorization code from the user.
      let appleCode;
      const hasApple = user.identities?.some((i) => i.provider === "apple");
      if (hasApple && isNative() && isIOS()) {
        appleCode = await getAppleAuthorizationCode().catch(() => undefined);
      }
      const { error } = await supabase.functions.invoke("delete-account", {
        body: { apple_authorization_code: appleCode },
      });
      if (error) throw error;
      await supabase.auth.signOut({ scope: "local" });
      setConfirmDelete(false);
    } catch (e) {
      setDeleteError("Не удалось удалить аккаунт. Попробуйте ещё раз.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#bf95f9]" />
      </div>
    );
  }

  const displayName = isAnonymous ? "Гость" : profile?.full_name || user?.email || "Пользователь";
  const initials = isAnonymous
    ? null
    : displayName
        .split(/[\s@.]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");

  return (
    <div className="relative min-h-screen overflow-hidden pb-28">
      {/* Header glow in the app's purple → rose accent */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#a8c0ff]/25 via-[#bf95f9]/30 to-rose-500/20 blur-[90px]" />

      <div className="relative mx-auto max-w-md px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        {/* Identity */}
        <div className="flex items-center gap-4">
          <div
            className={`rounded-full p-[2.5px] ${
              sub ? "bg-gold" : "bg-gradient-to-br from-[#a8c0ff] via-[#bf95f9] to-rose-500"
            }`}
          >
            <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-zinc-900 text-xl font-bold text-white">
              {initials || <User className="h-8 w-8 text-zinc-400" />}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-2xl font-extrabold tracking-tight text-white">{displayName}</h1>
              {sub && (
                <span className="bg-gold flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#3b2410]">
                  <Crown className="h-3 w-3" /> VIP
                </span>
              )}
            </div>
            <button
              onClick={copyUid}
              className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-400 ring-1 ring-white/10"
            >
              ID {shortUid}
              {user && (copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />)}
            </button>
          </div>
          {isAnonymous && (
            <Link
              to="/login"
              className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-black"
            >
              Войти
            </Link>
          )}
        </div>

        {/* Guest nudge */}
        {isAnonymous && (
          <Link
            to="/register"
            className="mt-5 flex items-center gap-3 rounded-2xl border border-[#bf95f9]/25 bg-[#bf95f9]/10 p-3.5"
          >
            <Sparkles className="h-5 w-5 shrink-0 text-[#bf95f9]" />
            <p className="flex-1 text-[13px] leading-snug text-zinc-200">
              <span className="font-semibold text-white">+{COINS_FIRST_ENTRY} монет уже у вас.</span> Создайте
              аккаунт, чтобы не потерять их и покупки.
            </p>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#bf95f9]" />
          </Link>
        )}

        {/* Stats bento */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat icon={Coins} value={coinBalance} label="Монеты" tint="text-amber-400" />
          <Stat icon={Film} value={sub ? "∞" : unlockedCount} label="Открыто серий" tint="text-rose-400" to="/" />
          <Stat icon={Bookmark} value={libraryCount} label="В списке" tint="text-[#a8c0ff]" to="/my" />
        </div>

        {/* Earn coins */}
        {adsAvailable() && !sub && (
          <div className="mt-3">
            <button
              onClick={watchAd}
              disabled={adBusy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 py-3 text-sm font-bold text-black transition active:scale-[0.99] disabled:opacity-60"
            >
              {adBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-black" />}
              Смотреть рекламу · +{COINS_PER_AD} монет
            </button>
            {adMessage && <p className="mt-2 text-center text-xs text-zinc-400">{adMessage}</p>}
          </div>
        )}

        {/* VIP */}
        <div className="mt-6">
          {sub ? (
            <Link to="/subscribe" className="block">
              <MembershipCard subscription={sub} holder={isAnonymous ? null : displayName} compact />
            </Link>
          ) : (
            <VipBanner />
          )}
        </div>

        <Group title="Контент">
          <Row icon={Bookmark} color="bg-[#6b7cff]" label="Мой список" hint={libraryCount ? String(libraryCount) : null} to="/my" />
          <Row icon={Crown} color="bg-gold" label="VIP-подписка" hint={sub ? "Активна" : null} to="/subscribe" />
          {isAdmin && <Row icon={LayoutDashboard} color="bg-zinc-600" label="Админ-панель" to="/admin" />}
        </Group>

        <Group title="Поддержка">
          {config.supportEmail && (
            <Row
              icon={MessageSquare}
              color="bg-emerald-500"
              label="Обратная связь"
              hint={config.supportEmail}
              onClick={() => openExternal(`mailto:${config.supportEmail}?subject=KRDrama%20${shortUid}`)}
            />
          )}
          {config.privacyUrl && (
            <Row icon={Shield} color="bg-sky-500" label="Конфиденциальность" onClick={() => openExternal(config.privacyUrl)} />
          )}
          <Row icon={FileText} color="bg-zinc-500" label="Условия использования" onClick={() => openExternal(config.termsUrl)} />
        </Group>

        {!isAnonymous && (
          <Group>
            <Row icon={LogOut} color="bg-zinc-700" label="Выйти" onClick={logout} />
            <Row icon={Trash2} color="bg-rose-600" label="Удалить аккаунт" onClick={() => setConfirmDelete(true)} danger />
          </Group>
        )}

        <p className="mt-8 text-center text-[11px] text-zinc-600">KRDrama · v1.0.0</p>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={(open) => !deleting && setConfirmDelete(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить аккаунт?</AlertDialogTitle>
            <AlertDialogDescription>
              Аккаунт, монеты, открытые серии и список будут удалены навсегда.
              {sub?.store === "app_store" &&
                " Подписка App Store не отменяется автоматически — отмените её в настройках Apple ID."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-rose-400">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteAccount();
              }}
              disabled={deleting}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
