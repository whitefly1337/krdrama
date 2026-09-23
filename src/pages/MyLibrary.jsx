import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bookmark, Loader2 } from "lucide-react";
import SeriesCard from "@/components/SeriesCard";

export default function MyLibrary() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        const libs = await base44.entities.UserLibrary.filter({ user_id: me.id });
        const ids = libs.map((l) => l.series_id);
        if (ids.length === 0) {
          setSeries([]);
          return;
        }
        const all = await base44.entities.Series.list();
        setSeries(all.filter((s) => ids.includes(s.id)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="mb-5 text-2xl font-bold text-white">My Library</h1>
      {series.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
            <Bookmark className="h-8 w-8 text-zinc-500" />
          </div>
          <p className="text-lg font-semibold text-white">Your library is empty</p>
          <p className="max-w-xs text-sm text-zinc-400">
            Tap the bookmark icon while watching to save series here.
          </p>
          <Link to="/" className="mt-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white">
            Browse Series
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {series.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      )}
    </div>
  );
}