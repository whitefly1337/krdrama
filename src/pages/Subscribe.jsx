import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Browser } from "@capacitor/browser";
import { Crown, X, Loader2, Tv, Ban, Lock, MessageSquare, Check, Sparkles } from "lucide-react";
import {
  getPackages,
  isPurchaseCancelled,
  purchasePackage,
  purchasesAvailable,
  restorePurchases,
} from "@/lib/purchases";
import { getActiveSubscription } from "@/lib/subscription";
import { useAuth } from "@/lib/AuthContext";
import { config } from "@/lib/config";
import { isNative } from "@/lib/platform";
import { DEMO_MODE, demoActivateVip, demoCancelVip, demoPackages } from "@/lib/demo";
import MembershipCard from "@/components/vip/MembershipCard";

const BENEFITS = [
  { icon: Lock, title: "Every episode", text: "No coins, no waiting" },
  { icon: Ban, title: "Ad-free", text: "Pure binge mode" },
  { icon: Tv, title: "HD 1080p", text: "Best available quality" },
  { icon: MessageSquare, title: "Priority support", text: "We answer first" },
];

const PERIODS = {
  WEEKLY: { title: "Weekly", unit: "week", weeks: 1 },
  MONTHLY: { title: "Monthly", unit: "month", weeks: 52 / 12 },
  TWO_MONTH: { title: "2 Months", unit: "2 months", weeks: 104 / 12 },
  THREE_MONTH: { title: "3 Months", unit: "3 months", weeks: 13 },
  SIX_MONTH: { title: "6 Months", unit: "6 months", weeks: 26 },
  ANNUAL: { title: "Yearly", unit: "year", weeks: 52 },
};

function formatMoney(amount, currency) {
  try {
    // Match the store's priceString style on this English screen.
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return null;
  }
}

// Titles and prices always come from the App Store (via RevenueCat): they are
// localized per storefront, and the savings badge is computed from them, so
// every discount shown is real.
function describePlans(packages) {
  const plans = packages.map((pkg) => {
    const period = PERIODS[pkg.packageType];
    const perWeek = period && pkg.product.price ? pkg.product.price / period.weeks : null;
    return { pkg, period, perWeek };
  });
  const baseline = Math.max(...plans.map((p) => p.perWeek ?? 0));
  const withSavings = plans.map((p) => ({
    ...p,
    savings: p.perWeek && baseline ? Math.round((1 - p.perWeek / baseline) * 100) : 0,
    perWeekLabel:
      p.perWeek && p.period?.weeks > 1 ? formatMoney(p.perWeek, p.pkg.product.currencyCode) : null,
  }));
  const best = withSavings.reduce((a, b) => (b.savings > (a?.savings ?? 0) ? b : a), null);
  return withSavings
    .map((p) => ({ ...p, isBest: best && p === best && p.savings >= 10 }))
    .sort((a, b) => (b.period?.weeks ?? 0) - (a.period?.weeks ?? 0));
}

function openExternal(url) {
  if (isNative()) Browser.open({ url });
  else window.open(url, "_blank", "noopener");
}

export default function Subscribe() {
  const navigate = useNavigate();
  const { user, profile, isAnonymous } = useAuth();
  const [current, setCurrent] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const canBuy = purchasesAvailable() || DEMO_MODE;

  useEffect(() => {
    (async () => {
      try {
        const [active, pkgs] = await Promise.all([
          getActiveSubscription(),
          DEMO_MODE ? demoPackages : purchasesAvailable() ? getPackages().catch(() => []) : [],
        ]);
        setCurrent(active);
        setPackages(pkgs);
      } finally {
        setFetching(false);
      }
    })();
  }, [user?.id]);

  const plans = useMemo(() => describePlans(packages), [packages]);

  useEffect(() => {
    if (!selected && plans.length) setSelected((plans.find((p) => p.isBest) ?? plans[0]).pkg.identifier);
  }, [plans, selected]);

  const selectedPlan = plans.find((p) => p.pkg.identifier === selected);

  const subscribe = async () => {
    if (!selectedPlan) return;
    setError("");
    setBusy("buy");
    try {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 700));
        setCurrent(demoActivateVip(selectedPlan.pkg));
        return;
      }
      const result = await purchasePackage(selectedPlan.pkg);
      if (result?.active) setCurrent(result.subscription);
      else setError("Purchase is pending. VIP will activate once the App Store confirms it.");
    } catch (e) {
      if (!isPurchaseCancelled(e)) setError(e.message || "Purchase failed. Try again later.");
    } finally {
      setBusy(null);
    }
  };

  const handleRestore = async () => {
    setError("");
    setBusy("restore");
    try {
      if (DEMO_MODE) {
        setError("Demo mode: nothing to restore.");
        return;
      }
      const result = await restorePurchases();
      if (result?.active) setCurrent(result.subscription);
      else setError("No active subscription found to restore.");
    } catch (e) {
      setError(e.message || "Restore failed");
    } finally {
      setBusy(null);
    }
  };

  const holder = isAnonymous ? null : profile?.full_name || user?.email;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Ambient gold glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#e5a45f]/25 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-120px] top-[260px] h-72 w-72 rounded-full bg-[#bf95f9]/15 blur-[100px]" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <button
          onClick={() => navigate(-1)}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-md"
        >
          <X className="h-5 w-5" />
        </button>
        {canBuy && !current && (
          <button
            onClick={handleRestore}
            disabled={busy !== null}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-zinc-300 disabled:opacity-50"
          >
            {busy === "restore" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Restore"}
          </button>
        )}
      </div>

      <div className={`relative z-10 mx-auto max-w-md px-5 ${canBuy && !current ? "pb-64" : "pb-16"}`}>
        {/* Hero */}
        <div className="flex flex-col items-center pt-4 text-center">
          <div className="animate-float bg-gold shimmer flex h-20 w-20 items-center justify-center rounded-[28px] shadow-[0_18px_50px_-10px_rgba(229,164,95,0.7)]">
            <Crown className="relative z-[2] h-10 w-10 text-[#3b2410]" strokeWidth={2.2} />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-[#e5a45f]">KRDrama</p>
          <h1 className="text-gold mt-1 text-4xl font-black tracking-tight">VIP Pass</h1>
          <p className="mt-2 max-w-xs text-sm text-zinc-400">
            Every drama, every episode — no coins, no ads, no cliffhanger waits.
          </p>
        </div>

        {current ? (
          <div className="mt-8 space-y-4">
            <MembershipCard subscription={current} holder={holder} />
            <button
              onClick={() => navigate("/")}
              className="w-full rounded-2xl bg-white py-3.5 text-sm font-bold text-black"
            >
              Start watching
            </button>
            {current.store === "app_store" && !DEMO_MODE && (
              <button
                onClick={() => openExternal("https://apps.apple.com/account/subscriptions")}
                className="w-full py-2 text-xs text-zinc-400 underline"
              >
                Manage subscription
              </button>
            )}
            {DEMO_MODE && (
              <button
                onClick={() => {
                  demoCancelVip();
                  setCurrent(null);
                }}
                className="w-full py-2 text-xs text-zinc-500 underline"
              >
                Demo: cancel VIP
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Benefits bento */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5a45f]/15">
                    <b.icon className="h-5 w-5 text-[#f6d38b]" />
                  </div>
                  <p className="mt-3 text-sm font-bold">{b.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{b.text}</p>
                </div>
              ))}
            </div>

            {/* Plans */}
            {canBuy ? (
              <div className="mt-8">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Choose your plan</h2>
                {plans.length === 0 && !fetching && (
                  <p className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-zinc-400">
                    Plans are unavailable right now. Please try again later.
                  </p>
                )}
                {fetching && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#e5a45f]" />
                  </div>
                )}
                <div className="space-y-3" role="radiogroup">
                  {plans.map((plan) => {
                    const active = plan.pkg.identifier === selected;
                    return (
                      <button
                        key={plan.pkg.identifier}
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSelected(plan.pkg.identifier)}
                        className={`relative w-full rounded-2xl p-[1.5px] text-left transition active:scale-[0.99] ${
                          active ? "bg-gold" : "bg-white/10"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-4 rounded-[15px] px-4 py-4 ${
                            active ? "bg-[#1c140c]" : "bg-[#111113]"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                              active ? "border-transparent bg-gold" : "border-zinc-600"
                            }`}
                          >
                            {active && <Check className="h-3.5 w-3.5 text-[#3b2410]" strokeWidth={3} />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-bold">{plan.period?.title ?? plan.pkg.product.title}</p>
                            <p className="text-xs text-zinc-500">
                              {plan.perWeekLabel ? `${plan.perWeekLabel} / week` : "Billed weekly"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-extrabold">{plan.pkg.product.priceString}</p>
                            {plan.period && <p className="text-xs text-zinc-500">per {plan.period.unit}</p>}
                          </div>
                        </div>
                        {plan.isBest && (
                          <span className="bg-gold absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#3b2410]">
                            Best value · save {plan.savings}%
                          </span>
                        )}
                        {!plan.isBest && plan.savings >= 10 && (
                          <span className="absolute -top-2.5 right-4 rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                            Save {plan.savings}%
                          </span>
                        )}
                        {plan.pkg.product.introPrice && (
                          <p className="px-4 pb-3 pt-1 text-xs text-[#f6d38b]">
                            Intro offer: {plan.pkg.product.introPrice.priceString} for{" "}
                            {plan.pkg.product.introPrice.periodNumberOfUnits}{" "}
                            {plan.pkg.product.introPrice.periodUnit?.toLowerCase()}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-[#e5a45f]/30 bg-[#e5a45f]/10 p-4 text-sm text-[#f6d38b]">
                <Sparkles className="mb-2 h-5 w-5" />
                VIP is available in the KRDrama iOS app. Subscribe there with this account and it will
                unlock everything here too.
              </div>
            )}
          </>
        )}

        {error && (
          <div className="mt-4 rounded-2xl bg-rose-600/15 px-4 py-3 text-sm text-rose-300">{error}</div>
        )}

        {/* Auto-renewal disclosure required by App Store guideline 3.1.2 */}
        <div className="mt-8 text-center">
          <p className="text-[11px] leading-relaxed text-zinc-500">
            Payment is charged to your Apple ID at confirmation of purchase. Subscriptions renew
            automatically unless canceled at least 24 hours before the end of the current period; your
            account is charged for renewal within 24 hours before the period ends. Manage or cancel
            anytime in your App Store account settings.
          </p>
          <div className="mt-3 flex justify-center gap-5 text-[11px] font-medium text-zinc-400">
            <button onClick={() => openExternal(config.termsUrl)} className="underline">
              Terms of Use
            </button>
            {config.privacyUrl && (
              <button onClick={() => openExternal(config.privacyUrl)} className="underline">
                Privacy Policy
              </button>
            )}
            {canBuy && (
              <button onClick={handleRestore} disabled={busy !== null} className="underline">
                Restore
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sticky purchase bar */}
      {canBuy && !current && (
        <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/95 to-transparent px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-10">
          <div className="mx-auto max-w-md">
            <button
              onClick={subscribe}
              disabled={!selectedPlan || busy !== null}
              className="shimmer bg-gold flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-extrabold text-[#3b2410] shadow-[0_12px_40px_-8px_rgba(229,164,95,0.6)] transition active:scale-[0.99] disabled:opacity-60"
            >
              {busy === "buy" ? (
                <Loader2 className="relative z-[2] h-5 w-5 animate-spin" />
              ) : (
                <span className="relative z-[2]">
                  Continue
                  {selectedPlan && ` · ${selectedPlan.pkg.product.priceString}/${selectedPlan.period?.unit ?? "period"}`}
                </span>
              )}
            </button>
            <p className="mt-2 text-center text-[11px] text-zinc-500">
              Auto-renews · Cancel anytime{DEMO_MODE ? " · Demo purchase, no charge" : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
