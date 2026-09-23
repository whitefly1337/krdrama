import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Crown, Shield, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout() {
  const location = useLocation();
  const nav = [
    { to: "/", label: "Home", icon: Home },
    { to: "/subscribe", label: "Subscribe", icon: Crown },
    { to: "/admin", label: "Admin", icon: Shield },
  ];
  const footerNav = [
    { to: "/", label: "Home", icon: Home },
    { to: "/my", label: "My", icon: Bookmark },
    { to: "/profile", label: "Profile", icon: User },
  ];
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {!location.pathname.startsWith("/watch/") && (
      <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-rose-500">Drama</span>Pulse
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {nav.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      )}
      <main>
        <Outlet />
      </main>
      {!location.pathname.startsWith("/watch/") && (
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/5 bg-zinc-950/90 backdrop-blur-xl sm:hidden">
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