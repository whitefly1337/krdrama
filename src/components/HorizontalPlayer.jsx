import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HlsVideo from "@/components/HlsVideo";

export default function HorizontalPlayer({ episodes, startIndex = 0 }) {
  const [index, setIndex] = useState(startIndex);
  const videoRef = useRef(null);
  const episode = episodes[index];

  if (!episode) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
        <HlsVideo
          ref={videoRef}
          key={episode.id}
          src={episode.video_url}
          className="aspect-video w-full bg-black"
          controls
          autoPlay
          playsInline
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-rose-400">Эпизод {episode.episode_number}</p>
          <h1 className="text-xl font-bold text-white">{episode.title}</h1>
        </div>
        <div className="flex gap-2">
          <button
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
            className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Назад
          </button>
          <button
            disabled={index === episodes.length - 1}
            onClick={() => setIndex(index + 1)}
            className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-30"
          >
            Далее <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Все серии</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {episodes.map((ep, i) => (
            <button
              key={ep.id}
              onClick={() => setIndex(i)}
              className={`rounded-lg border p-3 text-left text-sm transition ${
                i === index
                  ? "border-rose-500 bg-rose-500/10 text-white"
                  : "border-white/5 bg-white/5 text-zinc-300 hover:border-white/20"
              }`}
            >
              <span className="text-xs text-zinc-500">Эпизод {ep.episode_number}</span>
              <p className="line-clamp-1 font-medium">{ep.title}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}