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
    let hls;
    if (src.endsWith(".m3u8") && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      video.src = src;
    }
    return () => {
      if (hls) hls.destroy();
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