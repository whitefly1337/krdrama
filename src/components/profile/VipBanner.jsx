import { Link } from "react-router-dom";
import { Play, Ban, Tv } from "lucide-react";

const features = [
  { icon: Play, label: "Безлимит" },
  { icon: Ban, label: "Без рекламы" },
  { icon: Tv, label: "1080P" },
];

export default function VipBanner() {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#A4793C] via-[#C8924A] to-[#E5A45F] p-4">
      <h2 className="text-base font-bold text-white">Стать VIP — все привилегии</h2>
      <div className="mt-3 flex justify-around">
        {features.map((f) => (
          <div key={f.label} className="flex flex-col items-center gap-1.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
              <f.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-[10px] font-medium text-white/90">{f.label}</span>
          </div>
        ))}
      </div>
      <Link
        to="/subscribe"
        className="mt-3 flex w-full items-center justify-center rounded-full bg-white py-2.5 text-sm font-bold text-[#8B5E2B]"
      >
        ПЕРЕЙТИ
      </Link>
    </div>
  );
}