import { Link } from "react-router-dom";
import { Crown, Play, Ban, Tv, ChevronRight } from "lucide-react";

const features = [
  { icon: Play, label: "Все серии" },
  { icon: Ban, label: "Без рекламы" },
  { icon: Tv, label: "1080p" },
];

export default function VipBanner() {
  return (
    <Link
      to="/subscribe"
      className="shimmer group relative block overflow-hidden rounded-3xl bg-[#1a120b] p-[1.5px]"
    >
      <div className="bg-gold absolute inset-0 opacity-90" />
      <div className="relative z-[2] rounded-[22px] bg-gradient-to-br from-[#2a1b0e] via-[#1a120b] to-[#120c07] p-4">
        <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-[#e5a45f]/30 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="bg-gold flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
            <Crown className="h-6 w-6 text-[#3b2410]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-gold text-base font-black">Стать VIP</p>
            <p className="text-xs text-zinc-400">Смотрите всё без монет и ожидания</p>
          </div>
          <ChevronRight className="h-5 w-5 text-[#e5a45f] transition group-active:translate-x-0.5" />
        </div>
        <div className="relative mt-3 flex gap-2">
          {features.map((f) => (
            <span
              key={f.label}
              className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-[#f6d38b] ring-1 ring-[#e5a45f]/20"
            >
              <f.icon className="h-3 w-3" />
              {f.label}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
