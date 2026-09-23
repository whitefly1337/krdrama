import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { User, Crown, LogOut, Mail, Calendar } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        setMe(user);
        const subs = await base44.entities.Subscription.filter({ user_id: user.id, status: "active" });
        const active = subs.find((s) => !s.end_date || new Date(s.end_date) >= new Date());
        setSub(active || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-rose-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="flex flex-col items-center gap-3 pb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700">
          <User className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">{me?.full_name || "User"}</h1>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4">
          <Mail className="h-5 w-5 text-zinc-400" />
          <div>
            <p className="text-xs text-zinc-500">Email</p>
            <p className="text-sm font-medium text-white">{me?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4">
          <Crown className="h-5 w-5 text-zinc-400" />
          <div className="flex-1">
            <p className="text-xs text-zinc-500">Subscription</p>
            {sub ? (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-emerald-400">Premium Active</span>
                {sub.end_date && (
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <Calendar className="h-3 w-3" /> until {sub.end_date}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm font-medium text-zinc-400">No active subscription</p>
            )}
          </div>
        </div>

        {!sub && (
          <Link
            to="/subscribe"
            className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 p-4 text-sm font-bold text-white"
          >
            <Crown className="h-4 w-4" /> Get Premium
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 p-4 text-sm font-medium text-zinc-300 hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" /> Log Out
        </button>
      </div>
    </div>
  );
}