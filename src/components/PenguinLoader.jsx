export default function PenguinLoader({ size = 120, fullHeight = true }) {
  return (
    <div className={`flex items-center justify-center ${fullHeight ? "h-[60vh]" : ""}`}>
      <video
        src="https://media.base44.com/videos/public/6ab13de4fcc06756b5a8ee60/e0ac486e0_0923_2_gif.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{ width: size, height: size }}
        className="object-contain"
      />
    </div>
  );
}