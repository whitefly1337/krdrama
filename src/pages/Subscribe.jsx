import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Crown, Check, Loader2 } from "lucide-react";

export default function Subscribe() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        const subs = await base44.entities.Subscription.filter({ user_id: me.id, status: "active" });
        const active = subs.find((su) => !su.end_date || new Date(su.end_date) >= new Date());
        setCurrent(active || null);
      } catch {
        setCurrent(null);
      } finally {
        setFetching(false);
      }
    })();
  }, []);

  const subscribe = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + 1);
      await base44.entities.Subscription.create({
        user_id: me.id,
        status: "active",
        plan: "monthly",
        start_date: start.toISOString().slice(0, 10),
        end_date: end.toISOString().slice(0, 10),
      });
      setCurrent({ status: "active", end_date: end.toISOString().slice(0, 10) });
    } catch (e) {
      console.error(e);
      alert("Не удалось оформить подписку. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 pb-24 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-600/20">
        <Crown className="h-8 w-8 text-rose-500" />
      </div>
      <h1 className="text-3xl font-extrabold text-white">AI Drama Premium</h1>
      <p className="mt-2 text-sm text-zinc-400">Безлимитный доступ ко всем ИИ-дорамам и новым сериям.</p>

      {current ? (
        <div className="mt-8 rounded-2xl bg-emerald-600/10 p-6 ring-1 ring-emerald-500/30">
          <p className="text-lg font-bold text-emerald-400">Подписка активна</p>
          <p className="mt-1 text-sm text-zinc-300">
            Действует до: <span className="font-semibold text-white">{current.end_date}</span>
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-5 w-full rounded-lg bg-white px-5 py-3 text-sm font-bold text-black"
          >
            Смотреть каталог
          </button>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <div className="flex items-end justify-center gap-1">
            <span className="text-4xl font-extrabold text-white">499₽</span>
            <span className="mb-1 text-sm text-zinc-400">/мес</span>
          </div>
          <ul className="mt-5 space-y-3 text-left text-sm text-zinc-300">
            {[
              "Все серии без ограничений",
              "Вертикальный и горизонтальный плееры",
              "Новые ИИ-дорамы каждую неделю",
              "Без рекламы",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" /> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={subscribe}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
            Оформить подписку
          </button>
          <p className="mt-3 text-xs text-zinc-500">Демо-оплата. Реальная интеграция платежей подключается отдельно.</p>
        </div>
      )}
    </div>
  );
}