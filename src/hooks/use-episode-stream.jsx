import { useEffect, useState } from "react";
import { getEpisodeStream } from "@/lib/episodes";

// { status: "loading" | "ready" | "locked" | "error", url?, error? }
// `locked` is the client's view (free / VIP / unlocked); the server re-checks
// and may still answer locked, e.g. when a subscription has just expired.
export function useEpisodeStream(episode, locked) {
  const [state, setState] = useState({ status: "loading" });
  const episodeId = episode?.id;

  useEffect(() => {
    if (!episodeId) return;
    if (locked) {
      setState({ status: "locked" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    getEpisodeStream(episodeId).then((res) => {
      if (cancelled) return;
      if (res.url) setState({ status: "ready", url: res.url });
      else if (res.locked) setState({ status: "locked" });
      else setState({ status: "error", error: res.error });
    });
    return () => {
      cancelled = true;
    };
  }, [episodeId, locked]);

  return state;
}
