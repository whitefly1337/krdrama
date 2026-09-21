import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Play } from "lucide-react";

export default function SeriesCard({ series }) {
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
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/90">
            <Play className="h-5 w-5 fill-white text-white" />
          </div>
        </div>
        {series.format === "vertical" && (
          <span className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Вертикальный
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="line-clamp-1 text-sm font-semibold text-white">{series.title}</h3>
          {series.genre && <p className="line-clamp-1 text-xs text-zinc-300">{series.genre}</p>}
        </div>
      </div>
    </Link>
  );
}