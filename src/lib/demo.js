// Demo mode: a placeholder catalog that lives entirely in the browser, for
// previewing the UI before the Supabase database is set up.
// Enable with VITE_DEMO_MODE=true in .env.local; remove it for real data.
// Wallet, unlocks and bookmarks are stored in localStorage and are NOT secure —
// never ship a build with demo mode on.

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const VIDEOS = [
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://vjs.zencdn.net/v/oceans.mp4",
  "https://media.w3.org/2010/05/bunny/trailer.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4",
  "https://media.w3.org/2010/05/video/movie_300.mp4",
  "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4",
];

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

// Colors per genre: [top, bottom, accent].
const PALETTES = {
  Romance: ["#ff5f8f", "#2a0a1f", "#ffd1dc"],
  Revenge: ["#d7263d", "#12040a", "#ffb3b3"],
  Thriller: ["#2e4a7d", "#05070f", "#9fc2ff"],
  Historical: ["#c9973b", "#1c0f05", "#ffe3a8"],
  Fantasy: ["#8a4dff", "#0e0624", "#e0c8ff"],
  Drama: ["#1fa39a", "#03120f", "#b5fff6"],
  Comedy: ["#ffb72b", "#2a1402", "#fff0c2"],
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/'/g, "&apos;");

// Greedy word wrap for SVG text.
function wrap(text, maxChars) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    if ((line + " " + word).trim().length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + " " + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Generated key-art style image, so the demo needs no image hosting.
function artwork(def, width, height) {
  const [top, bottom, accent] = PALETTES[def.genre] ?? PALETTES.Drama;
  const portrait = height > width;
  const fontSize = portrait ? 64 : 72;
  const lines = wrap(def.title.toUpperCase(), portrait ? 13 : 22);
  const textTop = portrait ? height * 0.58 : height * 0.5;
  const x = portrait ? width / 2 : width * 0.08;
  const anchor = portrait ? "middle" : "start";
  const title = lines
    .map((l, i) => `<tspan x='${x}' dy='${i === 0 ? 0 : fontSize * 1.05}'>${esc(l)}</tspan>`)
    .join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>
<defs>
<linearGradient id='g' x1='0' y1='0' x2='0.4' y2='1'><stop offset='0' stop-color='${top}'/><stop offset='1' stop-color='${bottom}'/></linearGradient>
<radialGradient id='glow' cx='0.7' cy='0.3' r='0.6'><stop offset='0' stop-color='${accent}' stop-opacity='0.55'/><stop offset='1' stop-color='${accent}' stop-opacity='0'/></radialGradient>
</defs>
<rect width='100%' height='100%' fill='url(#g)'/>
<rect width='100%' height='100%' fill='url(#glow)'/>
<circle cx='${width * 0.72}' cy='${height * 0.28}' r='${Math.min(width, height) * 0.22}' fill='${accent}' fill-opacity='0.18'/>
<circle cx='${width * 0.3}' cy='${height * 0.42}' r='${Math.min(width, height) * 0.12}' fill='${accent}' fill-opacity='0.12'/>
${portrait ? `<text x='${x}' y='${portrait ? height * 0.1 : height * 0.2}' text-anchor='${anchor}' font-family='Helvetica, Arial, sans-serif' font-size='${portrait ? 22 : 26}' letter-spacing='6' fill='${accent}' fill-opacity='0.9'>KRDRAMA ORIGINAL</text>
<text y='${textTop}' text-anchor='${anchor}' font-family='Georgia, serif' font-weight='bold' font-size='${fontSize}' fill='#ffffff'>${title}</text>
<text x='${x}' y='${textTop + lines.length * fontSize * 1.05 + 20}' text-anchor='${anchor}' font-family='Helvetica, Arial, sans-serif' font-size='${portrait ? 26 : 30}' letter-spacing='4' fill='${accent}'>${esc(def.genre.toUpperCase())}</text>` : ""}
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const SERIES_DEFS = [
  {
    key: "ceo-bride",
    title: "Contract Bride of the Cold CEO",
    genre: "Romance",
    format: "vertical",
    featured: true,
    age: 2,
    episodes: 24,
    description:
      "To save her father's bakery, Han Yuri signs a one-year marriage contract with the heartless heir of Taesung Group. Rule one: never fall in love.",
  },
  {
    key: "red-heels",
    title: "Revenge in Red Heels",
    genre: "Revenge",
    format: "vertical",
    featured: true,
    age: 5,
    episodes: 20,
    description:
      "Betrayed by her husband and best friend on her wedding anniversary, a quiet housewife returns three years later as the CEO who can ruin them both.",
  },
  {
    key: "seoul-shadows",
    title: "Seoul Shadows",
    genre: "Thriller",
    format: "horizontal",
    featured: true,
    age: 12,
    episodes: 8,
    description:
      "A rookie detective discovers that her new partner — the one only she can see — was murdered ten years ago in the case she is now investigating.",
  },
  {
    key: "crown-prince",
    title: "The Crown Prince's Secret",
    genre: "Historical",
    format: "vertical",
    age: 20,
    episodes: 30,
    description:
      "Joseon, 1623. A palace maid learns the crown prince is a woman in disguise, and becomes the only person standing between her and the executioner.",
  },
  {
    key: "gumiho",
    title: "My Husband Is a Gumiho",
    genre: "Fantasy",
    format: "vertical",
    age: 1,
    episodes: 18,
    description:
      "She married the perfect man after a whirlwind romance. There is just one problem: on full-moon nights he has nine tails.",
  },
  {
    key: "hongdae",
    title: "Midnight at Hongdae",
    genre: "Romance",
    format: "vertical",
    age: 9,
    episodes: 16,
    description:
      "An indie singer and the idol who stole her song keep running into each other at the same 24-hour convenience store at midnight.",
  },
  {
    key: "second-chance",
    title: "Second Chance Doctor",
    genre: "Drama",
    format: "vertical",
    age: 30,
    episodes: 22,
    description:
      "A disgraced surgeon wakes up fifteen years in the past, on the first day of her residency, determined to save the patient she lost.",
  },
  {
    key: "twins",
    title: "Chaebol Twins Swap Lives",
    genre: "Comedy",
    format: "horizontal",
    age: 45,
    episodes: 6,
    description:
      "Separated at birth, a spoiled heiress and a street-food vendor discover they are twins — and agree to trade places for one month.",
  },
];

const FREE_EPISODES = 3;

export const demoSeries = SERIES_DEFS.map((d, i) => ({
  id: `demo-${d.key}`,
  title: d.title,
  description: d.description,
  poster_url: artwork(d, 600, 900),
  backdrop_url: artwork(d, 1280, 720),
  trailer_url: "",
  format: d.format,
  genre: d.genre,
  is_featured: Boolean(d.featured),
  is_published: true,
  total_episodes: d.episodes,
  created_at: daysAgo(d.age),
  _videoOffset: i,
}));

const demoEpisodes = demoSeries.flatMap((s) =>
  Array.from({ length: s.total_episodes }, (_, i) => {
    const n = i + 1;
    return {
      id: `${s.id}-e${n}`,
      series_id: s.id,
      title: `Episode ${n}`,
      episode_number: n,
      thumbnail_url: s.backdrop_url,
      duration: s.format === "vertical" ? 90 + ((n * 17) % 60) : 1500 + n * 60,
      is_free: n <= FREE_EPISODES,
      _video: VIDEOS[(s._videoOffset + n) % VIDEOS.length],
    };
  })
);

const strip = ({ _videoOffset, _video, ...rest }) => rest;

export function demoListSeries() {
  return demoSeries.map(strip);
}

export function demoSeriesWithEpisodes(seriesId) {
  const series = demoSeries.find((s) => s.id === seriesId);
  return {
    series: series ? strip(series) : null,
    episodes: demoEpisodes.filter((e) => e.series_id === seriesId).map(strip),
  };
}

// ---- Per-browser demo state ----

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable; demo state just won't persist
  }
};

const BALANCE_KEY = "krdrama_demo_balance";
const UNLOCKS_KEY = "krdrama_demo_unlocks";
const LIBRARY_KEY = "krdrama_demo_library";
const DEMO_START_BALANCE = 120;

export const demoGetBalance = () => read(BALANCE_KEY, DEMO_START_BALANCE);
export const demoGetUnlocks = () => new Set(read(UNLOCKS_KEY, []));

export function demoUnlockEpisode(episodeId, cost) {
  const ep = demoEpisodes.find((e) => e.id === episodeId);
  if (!ep) throw new Error("episode_not_found");
  const unlocks = demoGetUnlocks();
  const balance = demoGetBalance();
  if (ep.is_free || unlocks.has(episodeId)) {
    return { success: true, already_unlocked: true, balance };
  }
  if (balance < cost) {
    return { success: false, error: "insufficient_balance", balance, cost };
  }
  unlocks.add(episodeId);
  write(UNLOCKS_KEY, [...unlocks]);
  write(BALANCE_KEY, balance - cost);
  return { success: true, balance: balance - cost };
}

// ---- Demo VIP (fake store packages + simulated purchase) ----

const VIP_KEY = "krdrama_demo_vip";

const demoProduct = (id, title, price) => ({
  identifier: id,
  title,
  price,
  priceString: `$${price.toFixed(2)}`,
  currencyCode: "USD",
  introPrice: null,
});

export const demoPackages = [
  { identifier: "$rc_weekly", packageType: "WEEKLY", product: demoProduct("krd.vip.weekly", "VIP Weekly", 4.99) },
  { identifier: "$rc_monthly", packageType: "MONTHLY", product: demoProduct("krd.vip.monthly", "VIP Monthly", 12.99) },
  { identifier: "$rc_annual", packageType: "ANNUAL", product: demoProduct("krd.vip.yearly", "VIP Yearly", 59.99) },
];

const PERIOD_DAYS = { WEEKLY: 7, MONTHLY: 30, ANNUAL: 365 };

export function demoGetSubscription() {
  const sub = read(VIP_KEY, null);
  return sub && new Date(sub.expires_at) > new Date() ? sub : null;
}

export function demoActivateVip(pkg) {
  const sub = {
    entitlement_active: true,
    product_id: pkg.product.identifier,
    store: "app_store",
    will_renew: true,
    expires_at: new Date(Date.now() + (PERIOD_DAYS[pkg.packageType] ?? 30) * 86400000).toISOString(),
  };
  write(VIP_KEY, sub);
  return sub;
}

export function demoCancelVip() {
  try {
    localStorage.removeItem(VIP_KEY);
  } catch {
    // ignore
  }
}

export function demoEpisodeStream(episodeId) {
  const ep = demoEpisodes.find((e) => e.id === episodeId);
  if (!ep) return { error: "no_video" };
  if (!ep.is_free && !demoGetSubscription() && !demoGetUnlocks().has(episodeId)) return { locked: true };
  return { url: ep._video };
}

export const demoGetLibrary = () => read(LIBRARY_KEY, []);

export function demoToggleLibrary(seriesId) {
  const ids = demoGetLibrary();
  const next = ids.includes(seriesId) ? ids.filter((id) => id !== seriesId) : [seriesId, ...ids];
  write(LIBRARY_KEY, next);
  return next.includes(seriesId);
}
