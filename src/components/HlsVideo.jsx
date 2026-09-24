import { useEffect, useRef, forwardRef } from "react";
import Hls from "hls.js";

// Plays HLS (.m3u8) streams cross-browser: native on Safari/iOS,
// hls.js elsewhere. Falls back to plain <video> for mp4/webm.
// Supports both object refs and callback refs.
const HlsVideo = forwardRef(function HlsVideo({ src, ...props }, ref) {
  const internalRef = useRef(null);

  useEffect(() => {
    const video = internalRef.current;
    if (!video || !src) return;
    // Pause and clear before loading new source to prevent audio bleed
    video.pause();
    let hls;
    // Signed URLs carry a query string, so look at the path only.
    const isHls = new URL(src, window.location.href).pathname.endsWith(".m3u8");
    if (isHls && Hls.isSupported() && !video.canPlayType("application/vnd.apple.mpegurl")) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      // Safari/iOS play HLS natively; everything else is mp4/webm.
      video.src = src;
    }
    return () => {
      // Synchronously detach + pause to kill audio immediately
      video.pause();
      if (hls) {
        hls.detachMedia();
        hls.destroy();
      } else {
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [src]);

  const setRef = (el) => {
    internalRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  return <video ref={setRef} {...props} />;
});

export default HlsVideo;