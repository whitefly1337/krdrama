import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronUp, Heart, Bookmark, MoreHorizontal, ChevronLeft, Layers, Play, Pause, Gauge } from "lucide-react";
import { base44 } from "@/api/base44Client";
import HlsVideo from "@/components/HlsVideo";
import EpisodeGrid from "@/components/EpisodeGrid";

const SPEEDS = [0.5, 1, 1.25, 1.5, 2];

export default function VerticalPlayer({ episodes, startIndex = 0, series, onBack, hasSub }) {
  const [index, setIndex] = useState(startIndex);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [uiVisible, setUiVisible] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const episode = episodes[index];

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        const libs = await base44.entities.UserLibrary.filter({ user_id: me.id, series_id: series?.id });
        setBookmarked(libs.length > 0);
      } catch {}
    })();
  }, [series?.id]);

  const toggleBookmark = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      if (bookmarked) {
        await base44.entities.UserLibrary.deleteMany({ user_id: me.id, series_id: series?.id });
        setBookmarked(false);
      } else {
        await base44.entities.UserLibrary.create({ user_id: me.id, series_id: series?.id });
        setBookmarked(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, [bookmarked, series?.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !episode) return;
    const onTime = () => {
      setCurrentTime(video.currentTime);
      if (video.duration) setProgress((video.currentTime / video.duration) * 100);
    };
    const onDur = () => setDuration(video.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("durationchange", onDur);
    video.addEventListener("loadedmetadata", onDur);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.playbackRate = speed;
    setPlaying(false);
    video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("durationchange", onDur);
      video.removeEventListener("loadedmetadata", onDur);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [index, episode]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else { v.pause(); setPlaying(false); }
  }, []);

  const seek = (pct) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    v.currentTime = (pct / 100) * v.duration;
    setProgress(pct);
    setCurrentTime(v.currentTime);
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
      if (dy < -40 && index < episodes.length - 1) setIndex(index + 1);
      else if (dy > 40 && index > 0) setIndex(index - 1);
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
  const fmtTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-black">
      <HlsVideo
        ref={videoRef}
        src={episode.video_url}
        className="h-full w-full object-cover"
        loop
        playsInline
        controls={false}
      />

      {/* Tap layer to toggle UI */}
      <div className="absolute inset-0" onClick={() => setUiVisible((v) => !v)} />

      {/* Gradient overlay */}
      {uiVisible && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      )}

      {/* Full UI */}
      {uiVisible && (
        <>
          {/* Back */}
          <button
            onClick={(e) => { e.stopPropagation(); onBack?.(); }}
            className="absolute left-4 top-4 text-white drop-shadow-lg"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          {/* Center play/pause button */}
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 backdrop-blur-md"
          >
            {playing ? (
              <Pause className="h-8 w-8 fill-white text-white" />
            ) : (
              <Play className="h-8 w-8 fill-white text-white" />
            )}
          </button>

          {/* Right action rail */}
          <div className="absolute bottom-40 right-3 flex flex-col items-center gap-5">
            <button
              onClick={(e) => { e.stopPropagation(); toggleBookmark(); }}
              className="flex flex-col items-center gap-1 text-white"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md">
                <Bookmark className={`h-6 w-6 ${bookmarked ? "fill-white" : ""}`} />
              </span>
              <span className="text-[11px] font-medium">12K</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setLiked((v) => !v); }}
              className="flex flex-col items-center gap-1 text-white"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md">
                <Heart className={`h-6 w-6 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
              </span>
              <span className="text-[11px] font-medium">1.1K</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMore(true); }}
              className="flex flex-col items-center gap-1 text-white"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-md">
                <MoreHorizontal className="h-6 w-6" />
              </span>
              <span className="text-[11px] font-medium">More</span>
            </button>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
            <div className="mb-3 max-w-[78%]">
              <h2 className="text-base font-bold drop-shadow-lg text-white">{series?.title || episode.series_title}</h2>
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
                <p className="mt-2 text-xs leading-relaxed text-zinc-200">
                  {descExpanded ? series.description : series.description.slice(0, 80)}
                  {series.description.length > 80 && (
                    <button onClick={(e) => { e.stopPropagation(); setDescExpanded((v) => !v); }} className="ml-1 text-zinc-400">
                      {descExpanded ? "less" : "more"}
                    </button>
                  )}
                </p>
              )}
            </div>

            {/* Seek slider */}
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[10px] tabular-nums text-white/80">{fmtTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={(e) => seek(parseFloat(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="vplayer-slider flex-1"
              />
              <span className="text-[10px] tabular-nums text-white/80">{fmtTime(duration)}</span>
            </div>

            {/* Episode bar */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowEpisodes(true); }}
              className="flex w-full items-center justify-between rounded-xl bg-zinc-900/80 px-3 py-2.5 backdrop-blur-md"
            >
              <div className="flex items-center gap-2 text-white">
                <Layers className="h-4 w-4" />
                <span className="text-sm font-medium">EP.{episode.episode_number}/{total}</span>
              </div>
              <ChevronUp className="h-5 w-5 text-white" />
            </button>
          </div>
        </>
      )}

      {/* Minimal episode bar when UI hidden */}
      {!uiVisible && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowEpisodes(true); }}
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-white backdrop-blur-md"
        >
          <Layers className="h-4 w-4" />
          <span className="text-sm font-medium">EP.{episode.episode_number}/{total}</span>
          <ChevronUp className="h-4 w-4" />
        </button>
      )}

      {/* Episode popup */}
      {showEpisodes && (
        <EpisodeGrid
          episodes={episodes}
          currentIndex={index}
          series={series}
          hasSub={hasSub}
          onSelect={(i) => { setIndex(i); setShowEpisodes(false); }}
          onClose={() => setShowEpisodes(false)}
        />
      )}

      {/* More popup (speed control) */}
      {showMore && (
        <div className="absolute inset-0 z-50 flex items-end" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full rounded-t-2xl bg-zinc-900 p-4 pb-6"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <Gauge className="h-4 w-4" /> Playback speed
            </h3>
            <div className="flex gap-2">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSpeed(s); }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                    speed === s ? "bg-white text-black" : "bg-white/10 text-white"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}