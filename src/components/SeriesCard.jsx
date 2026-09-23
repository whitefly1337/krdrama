import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Play, Flame } from "lucide-react";

export default function SeriesCard({ series }) {
  const isNew = (() => {
    if (!series.created_date) return false;
    return Date.now() - new Date(series.created_date).getTime() < 7 * 86400000;
  })();

  return (
    <Link to={`/series/${series.id}`} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/5">
        <Image
          src={series.poster_url}
          alt={series.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          fittingType="fill"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex gap-1">
          {series.is_featured && (
            <span className="flex items-center gap-0.5 rounded-md bg-red-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
              <Flame className="h-2.5 w-2.5" /> Hot
            </span>
          )}
          {isNew && !series.is_featured && (
            <span className="rounded-md bg-[#fcd34d] px-1.5 py-0.5 text-[9px] font-bold uppercase text-black">
              New
            </span>
          )}
        </div>

        {series.format === "vertical" && (
          <span className="absolute right-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
            9:16
          </span>
        )}

        {/* Hover play */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#a8c0ff] to-[#bf95f9]">
            <Play className="h-5 w-5 fill-black text-black" />
          </div>
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <h3 className="line-clamp-1 text-sm font-semibold text-white">{series.title}</h3>
          {series.genre && <p className="line-clamp-1 text-xs text-zinc-300">{series.genre}</p>}
        </div>
      </div>
    </Link>
  );
}