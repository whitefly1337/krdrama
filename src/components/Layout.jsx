import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout() {
  const location = useLocation();
  const footerNav = [
    { to: "/", label: "Home", icon: Home },
    { to: "/my", label: "My", icon: Bookmark },
    { to: "/profile", label: "Profile", icon: User },
  ];
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main>
        <Outlet />
      </main>
      {/* Player and the VIP paywall are full-screen */}
      {!location.pathname.startsWith("/watch/") && location.pathname !== "/subscribe" && (
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/5 bg-zinc-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden">
        {footerNav.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition",
                active ? "text-rose-500" : "text-zinc-500"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      )}
    </div>
  );
}