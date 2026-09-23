import { useEffect, useRef, useState } from "react";
import { ChevronUp, Heart, Share2, MessageCircle } from "lucide-react";
import HlsVideo from "@/components/HlsVideo";

export default function VerticalPlayer({ episodes, startIndex = 0, onLocked }) {
  const [index, setIndex] = useState(startIndex);
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

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-black snap-y snap-mandatory"
    >
      {episodes.map((ep, i) => (
        <div
          key={ep.id}
          className="relative h-[calc(100vh-4rem)] w-full snap-start snap-always overflow-hidden"
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
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          {/* right action rail */}
          <div className="absolute bottom-24 right-3 flex flex-col items-center gap-5">
            <button className="flex flex-col items-center gap-1 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                <Heart className="h-6 w-6" />
              </span>
              <span className="text-[10px]">12K</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                <MessageCircle className="h-6 w-6" />
              </span>
              <span className="text-[10px]">340</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                <Share2 className="h-6 w-6" />
              </span>
              <span className="text-[10px]">Share</span>
            </button>
          </div>

          {/* bottom info */}
          <div className="absolute bottom-6 left-3 right-20 text-white">
            <p className="text-sm font-semibold">Episode {ep.episode_number}</p>
            <h2 className="line-clamp-2 text-lg font-bold leading-tight">{ep.title}</h2>
            <p className="mt-1 line-clamp-2 text-xs text-zinc-300">{ep.series_title || ""}</p>
          </div>

          {/* next hint */}
          {index < episodes.length - 1 && (
            <button
              onClick={goNext}
              className="absolute left-1/2 top-3 -translate-x-1/2 flex flex-col items-center gap-1 text-white/80"
            >
              <ChevronUp className="h-6 w-6 animate-bounce" />
              <span className="text-[10px]">Next episode</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}