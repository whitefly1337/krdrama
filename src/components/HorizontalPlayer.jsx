import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Lock } from "lucide-react";
import HlsVideo from "@/components/HlsVideo";
import LockedEpisodeScreen from "@/components/LockedEpisodeScreen";
import { useEpisodeStream } from "@/hooks/use-episode-stream";

export default function HorizontalPlayer({ episodes, startIndex = 0, seriesId, isLocked, onUnlocked }) {
  const [index, setIndex] = useState(startIndex);
  const videoRef = useRef(null);
  const episode = episodes[index];
  const stream = useEpisodeStream(episode, episode ? isLocked(episode) : false);

  if (!episode) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-6 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
        {stream.status === "locked" ? (
          <LockedEpisodeScreen
            episode={episode}
            seriesId={seriesId}
            onUnlock={() => onUnlocked(episode.id)}
          />
        ) : stream.status === "ready" ? (
          <HlsVideo
            ref={videoRef}
            key={episode.id}
            src={stream.url}
            className="aspect-video w-full bg-black"
            controls
            autoPlay
            playsInline
            onEnded={() => index < episodes.length - 1 && setIndex(index + 1)}
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center px-6 text-center">
            {stream.status === "loading" ? (
              <Loader2 className="h-8 w-8 animate-spin text-white/70" />
            ) : (
              <p className="text-sm text-zinc-300">
                {stream.error === "no_video" ? "This episode has no video yet." : "Couldn't load the video. Check your connection."}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-rose-400">Episode {episode.episode_number}</p>
          <h1 className="text-xl font-bold text-white">{episode.title}</h1>
        </div>
        <div className="flex gap-2">
          <button
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
            className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <button
            disabled={index === episodes.length - 1}
            onClick={() => setIndex(index + 1)}
            className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-30"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">All episodes</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {episodes.map((ep, i) => (
            <button
              key={ep.id}
              onClick={() => setIndex(i)}
              className={`relative rounded-lg border p-3 text-left text-sm transition ${
                i === index
                  ? "border-rose-500 bg-rose-500/10 text-white"
                  : "border-white/5 bg-white/5 text-zinc-300 hover:border-white/20"
              }`}
            >
              {isLocked(ep) && <Lock className="absolute right-2 top-2 h-3 w-3 text-amber-400" />}
              <span className="text-xs text-zinc-500">Episode {ep.episode_number}</span>
              <p className="line-clamp-1 font-medium">{ep.title}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
