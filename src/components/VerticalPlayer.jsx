import { useEffect, useRef, useState } from "react";
import { ChevronUp, Heart, Bookmark, MoreHorizontal, ChevronLeft, Layers } from "lucide-react";
import HlsVideo from "@/components/HlsVideo";

export default function VerticalPlayer({ episodes, startIndex = 0, series, onBack }) {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  const episode = episodes[index];

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
    setProgress(0);
  }, [index]);

  useEffect(() => {
    const v = videoRefs.current[index];
    if (!v) return;
    const onTime = () => {
      if (v.duration) setProgress((v.currentTime / v.duration) * 100);
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [index]);

  const goNext = () => {
    if (index < episodes.length - 1) setIndex(index + 1);
  };
  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startY = null;
    const onStart = (e) => { startY = e.touches ? e.touches[0].clientY : e.clientY; };
    const onEnd = (e) => {
      if (startY == null) return;
      const endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      const dy = endY - startY;
      if (dy < -40) goNext();
      else if (dy > 40) goPrev();
      startY = null;
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [index, episodes.length]);

  if (!episode) return null;

  const total = series?.total_episodes || episodes.length;
  const tags = series?.genre ? series.genre.split(/[·,]/).map((g) => g.trim()).filter(Boolean) : [];

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-black"
    >
      {episodes.map((ep, i) => (
        <div
          key={ep.id}
          className="relative h-full w-full overflow-hidden"
          style={{ display: i === index ? "block" : "none" }}
        >
          <HlsVideo
            ref={(el) => (videoRefs.current[i] = el)}
            src={ep.video_url}
            className="h-full w-full object-cover"
            loop
            playsInline
            controls={false}
            onClick={() => {
              const v = videoRefs.current[i];
              if (v.paused) v.play().catch(() => {}); else v.pause();
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

          {/* Back button */}
          <button
            onClick={onBack}
            className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 backdrop-blur-md"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          {/* Right action rail */}
          <div className="absolute bottom-32 right-3 flex flex-col items-center gap-5">
            <button className="flex flex-col items-center gap-1 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md">
                <Bookmark className="h-6 w-6" />
              </span>
              <span className="text-[11px] font-medium">9.2K</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md">
                <Heart className="h-6 w-6" />
              </span>
              <span className="text-[11px] font-medium">1.7K</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md">
                <MoreHorizontal className="h-6 w-6" />
              </span>
              <span className="text-[11px] font-medium">More</span>
            </button>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
            {/* Dialogue / episode title */}
            <p className="mb-3 max-w-[78%] text-xl font-bold leading-snug text-white drop-shadow-lg">
              {ep.title}
            </p>

            {/* Metadata */}
            <div className="mb-2 max-w-[78%]">
              <h2 className="text-base font-bold text-white drop-shadow">{series?.title || ep.series_title}</h2>
              {tags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium text-white">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {series?.description && (
                <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                  {descExpanded
                    ? series.description
                    : `${series.description.slice(0, 90)}${series.description.length > 90 ? " " : ""}`}
                  {series.description.length > 90 && (
                    <button
                      onClick={() => setDescExpanded((v) => !v)}
                      className="ml-1 text-zinc-400"
                    >
                      {descExpanded ? "less" : "more"}
                    </button>
                  )}
                </p>
              )}
            </div>

            {/* Progress bar */}
            <div className="mb-2 mt-3 h-1 w-full rounded-full bg-white/20">
              <div
                className="relative h-full rounded-full bg-white"
                style={{ width: `${progress}%` }}
              >
                <span className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white" />
              </div>
            </div>

            {/* Bottom episode bar */}
            <div className="flex items-center justify-between rounded-xl bg-zinc-900/80 px-3 py-2.5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-white">
                <Layers className="h-4 w-4" />
                <span className="text-sm font-medium">
                  EP.{ep.episode_number}/{total}
                </span>
              </div>
              {index < episodes.length - 1 && (
                <button onClick={goNext} className="flex items-center gap-1 text-white">
                  <ChevronUp className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}