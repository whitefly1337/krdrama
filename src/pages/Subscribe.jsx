import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Crown, ChevronLeft, Loader2, Tv, Ban, Play, MessageSquare, Lock } from "lucide-react";

const PLANS = [
  { id: "weekly", label: "Weekly Membership", price: "$4.99", oldPrice: "$7.99", discount: "38% OFF", days: 7 },
  { id: "monthly", label: "Monthly Membership", price: "$22.99", days: 30 },
  { id: "yearly", label: "Yearly Membership", price: "$119.00", days: 365 },
];

const PRIVILEGES = [
  { icon: Lock, label: "Short Drama Viewing" },
  { icon: Tv, label: "1080p" },
  { icon: Ban, label: "Ad-free" },
  { icon: MessageSquare, label: "Dedicated Support" },
];

const RULES = [
  "Auto renew, Cancel at any time;",
  "Subscription benefits will take effect immediately after payment is completed;",
];

export default function Subscribe() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        const subs = await base44.entities.Subscription.filter({ user_id: me.id, status: "active" });
        const active = subs.find((su) => !su.end_date || new Date(su.end_date) >= new Date());
        setCurrent(active || null);
      } catch {
        setCurrent(null);
      } finally {
        setFetching(false);
      }
    })();
  }, []);

  const subscribe = async (planId) => {
    const plan = PLANS.find((p) => p.id === planId);
    setLoadingPlan(planId);
    try {
      const me = await base44.auth.me();
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + plan.days);
      await base44.entities.Subscription.create({
        user_id: me.id,
        status: "active",
        plan: planId,
        start_date: start.toISOString().slice(0, 10),
        end_date: end.toISOString().slice(0, 10),
      });
      setCurrent({ status: "active", end_date: end.toISOString().slice(0, 10), plan: planId });
    } catch (e) {
      console.error(e);
      alert("Failed to subscribe. Try again later.");
    } finally {
      setLoadingPlan(null);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-10">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-black/80 px-4 py-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">VIP</h1>
        <button className="text-sm text-zinc-400">Restore</button>
      </div>

      {/* Hero */}
      <div className="flex items-center justify-between px-5 py-6">
        <h2 className="flex-1 pr-4 text-lg font-bold leading-snug text-white">
          Subscribe to VIP membership to unlock all episodes.
        </h2>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A4793C] to-[#E5A45F]">
          <Crown className="h-10 w-10 text-white" />
        </div>
      </div>

      {current ? (
        <div className="mx-4 rounded-2xl bg-emerald-600/10 p-5 ring-1 ring-emerald-500/30">
          <p className="text-base font-bold text-emerald-400">Subscription active</p>
          <p className="mt-1 text-sm text-zinc-300">
            Valid until: <span className="font-semibold text-white">{current.end_date}</span>
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 w-full rounded-full bg-white py-2.5 text-sm font-bold text-black"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        <>
          {/* Membership cards */}
          <div className="space-y-3 px-4">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => subscribe(plan.id)}
                disabled={loadingPlan !== null}
                className="relative w-full rounded-2xl bg-[#332c28] p-4 text-left ring-1 ring-white/5 transition active:scale-[0.98] disabled:opacity-60"
              >
                {plan.discount && (
                  <span className="absolute right-4 top-4 rounded-md bg-[#FF7F50] px-2 py-0.5 text-[10px] font-bold text-white">
                    {plan.discount}
                  </span>
                )}
                <h3 className="text-base font-bold text-white">{plan.label}</h3>
                <p className="mt-0.5 text-xs text-zinc-400">Auto renew · Cancel anytime</p>
                <div className="mt-2 flex items-baseline gap-2">
                  {loadingPlan === plan.id ? (
                    <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
                  ) : (
                    <>
                      <span className="text-2xl font-extrabold text-white">{plan.price}</span>
                      {plan.oldPrice && (
                        <span className="text-sm text-zinc-500 line-through">{plan.oldPrice}</span>
                      )}
                    </>
                  )}
                </div>
                <div className="mt-3 flex gap-4">
                  <div className="flex items-center gap-1 text-[11px] text-zinc-300">
                    <Tv className="h-3.5 w-3.5" /> 1080p
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-300">
                    <Ban className="h-3.5 w-3.5" /> Ad-free
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-300">
                    <Play className="h-3.5 w-3.5" /> Unlimited
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* VIP Privileges */}
      <div className="mt-8 px-4">
        <h3 className="text-center text-base font-bold text-white">Exclusive VIP Privileges</h3>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {PRIVILEGES.map((p) => (
            <div key={p.label} className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a1a1a] ring-1 ring-white/10">
                <p.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-center text-[10px] leading-tight text-zinc-400">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Rules */}
      <div className="mt-8 px-4">
        <h3 className="text-sm font-bold text-white">Subscription Rules</h3>
        <ol className="mt-2 space-y-1.5 text-xs text-zinc-400">
          {RULES.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="shrink-0 text-zinc-500">{i + 1}.</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}