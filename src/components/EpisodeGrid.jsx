import { useState, useMemo } from "react";
import { Lock } from "lucide-react";

const TAB_SIZE = 30;

export default function EpisodeGrid({ episodes, currentIndex, series, isLocked, onSelect, onClose }) {
  const [tab, setTab] = useState(() => {
    // Open the tab that contains the current episode
    return Math.floor(currentIndex / TAB_SIZE);
  });

  const tabs = useMemo(() => {
    const count = Math.max(1, Math.ceil(episodes.length / TAB_SIZE));
    return Array.from({ length: count }, (_, i) => {
      const start = i * TAB_SIZE + 1;
      const end = Math.min((i + 1) * TAB_SIZE, episodes.length);
      return { label: `${start}-${end}`, start: i * TAB_SIZE, end: (i + 1) * TAB_SIZE };
    });
  }, [episodes.length]);

  const currentTab = tabs[tab] || tabs[0];
  const visible = episodes.slice(currentTab.start, currentTab.end);

  return (
    <div className="absolute inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative mt-auto max-h-[72%] w-full overflow-y-auto rounded-t-2xl bg-[#121212] px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

        {/* Title */}
        <h3 className="mb-4 text-base font-bold text-white">{series?.title || "Episodes"}</h3>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="mb-4 flex gap-5 border-b border-white/10">
            {tabs.map((t, i) => (
              <button
                key={i}
                onClick={() => setTab(i)}
                className={`-mb-px border-b-2 pb-2 text-sm font-medium transition ${
                  i === tab ? "border-white text-white" : "border-transparent text-zinc-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-5 gap-2">
          {visible.map((ep, visIdx) => {
            const realIndex = currentTab.start + visIdx;
            const isCurrent = realIndex === currentIndex;
            const locked = isLocked(ep);
            return (
              <button
                key={ep.id}
                onClick={() => onSelect(realIndex)}
                className={`relative flex aspect-square items-center justify-center rounded-lg text-sm font-semibold transition ${
                  isCurrent ? "bg-white/20 text-white" : "bg-[#252525] text-white hover:bg-white/10"
                }`}
              >
                {locked && (
                  <Lock className="absolute right-1 top-1 h-3 w-3 text-amber-400" />
                )}
                <span>{ep.episode_number}</span>
                {isCurrent && (
                  <span className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 items-end gap-0.5">
                    <span className="eq-bar w-0.5 bg-white" />
                    <span className="eq-bar w-0.5 bg-white" style={{ animationDelay: "0.15s" }} />
                    <span className="eq-bar w-0.5 bg-white" style={{ animationDelay: "0.3s" }} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Copyright notice */}
        <p className="mt-5 text-center text-[10px] leading-relaxed text-zinc-600">
          Copyright attributes, sharing may lead to commercial infringement.
        </p>
      </div>
    </div>
  );
}