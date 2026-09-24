import { Crown } from "lucide-react";
import { planLabel } from "@/lib/subscription";

// Gold "membership card" shown to active VIP members.
export default function MembershipCard({ subscription, holder, compact = false }) {
  const expires = subscription?.expires_at
    ? new Date(subscription.expires_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : null;
  const renews = subscription?.will_renew !== false;

  return (
    <div
      className={`shimmer bg-gold relative overflow-hidden rounded-3xl text-[#3b2410] shadow-[0_20px_60px_-15px_rgba(229,164,95,0.55)] ${
        compact ? "p-4" : "aspect-[1.6/1] p-5"
      }`}
    >
      {/* Decorative rings */}
      <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full border-[18px] border-white/15" />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

      <div className="relative z-[2] flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#3b2410]/70">KRDrama</p>
            <p className="text-2xl font-black tracking-tight">VIP Member</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3b2410]/10 backdrop-blur">
            <Crown className="h-6 w-6" />
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            {holder && <p className="truncate text-sm font-semibold">{holder}</p>}
            <p className="text-xs font-medium text-[#3b2410]/75">
              {planLabel(subscription?.product_id)} plan
              {expires && ` · ${renews ? "renews" : "ends"} ${expires}`}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[#3b2410] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#f6d38b]">
            Active
          </span>
        </div>
      </div>
    </div>
  );
}
